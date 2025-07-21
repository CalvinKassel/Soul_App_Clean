// Photo Access Manager for SoulAI
// Handles secure, privacy-aware photo sharing between users

class PhotoAccessManager {
  constructor() {
    this.baseUrl = process.env.REACT_NATIVE_API_URL || 'http://localhost:3000';
    this.apiKey = process.env.REACT_NATIVE_API_KEY;
    this.cloudStorageUrl = process.env.REACT_NATIVE_CLOUD_STORAGE_URL;
    this.accessCache = new Map(); // Cache access permissions
  }

  // Generate access-controlled photo URLs
  async generateSecurePhotoURL(requestingUserId, photoOwnerId, photoId, accessContext = {}) {
    try {
      // Check access permissions
      const access = await this.checkPhotoAccess(requestingUserId, photoOwnerId, photoId, accessContext);
      if (!access.allowed) {
        console.log(`Photo access denied: ${access.reason}`);
        return null;
      }

      // Generate time-limited, user-specific URL
      const secureURL = await this.generateTimeLimitedURL(photoId, {
        viewer_id: requestingUserId,
        owner_id: photoOwnerId,
        expiry: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        access_level: access.level,
        context: accessContext
      });

      // Log photo access for transparency
      await this.logPhotoAccess(requestingUserId, photoOwnerId, photoId, access.level);

      return {
        secure_url: secureURL,
        access_level: access.level,
        expiry: Date.now() + (24 * 60 * 60 * 1000),
        watermark: access.level === 'preview' // Add watermark for preview access
      };
    } catch (error) {
      console.error('Failed to generate secure photo URL:', error);
      return null;
    }
  }

  // Smart photo selection based on compatibility and context
  async selectPhotosForMatch(viewerId, profileOwnerId, compatibilityData, maxPhotos = 4) {
    try {
      // Get owner's photos and privacy settings
      const ownerProfile = await this.getUserProfile(profileOwnerId);
      const photos = ownerProfile.photos || [];
      
      if (photos.length === 0) {
        return [];
      }

      // Filter photos based on privacy settings and access level
      const accessiblePhotos = [];
      
      for (const photo of photos) {
        const isAccessible = await this.isPhotoAccessible(viewerId, profileOwnerId, photo);
        if (isAccessible.allowed) {
          accessiblePhotos.push({
            ...photo,
            access_level: isAccessible.level
          });
        }
      }

      if (accessiblePhotos.length === 0) {
        return [];
      }

      // Use AI to select most appealing photos for this specific viewer
      const selectedPhotos = await this.aiPhotoSelection(
        accessiblePhotos, 
        compatibilityData, 
        viewerId,
        maxPhotos
      );

      // Generate secure URLs for selected photos
      const photosWithSecureURLs = await Promise.all(
        selectedPhotos.map(async (photo) => {
          const secureUrlData = await this.generateSecurePhotoURL(
            viewerId, 
            profileOwnerId, 
            photo.id,
            { context: 'matchmaking', compatibility_score: compatibilityData.compatibility_score }
          );

          return {
            id: photo.id,
            secure_url: secureUrlData?.secure_url,
            access_level: secureUrlData?.access_level || 'none',
            is_primary: photo.is_primary,
            quality: this.determinePhotoQuality(photo, secureUrlData?.access_level),
            watermark: secureUrlData?.watermark || false
          };
        })
      );

      return photosWithSecureURLs.filter(photo => photo.secure_url);
    } catch (error) {
      console.error('Photo selection failed:', error);
      return [];
    }
  }

  // Check photo access permissions
  async checkPhotoAccess(requestingUserId, photoOwnerId, photoId, context = {}) {
    try {
      // Check cache first
      const cacheKey = `${requestingUserId}_${photoOwnerId}_${photoId}`;
      if (this.accessCache.has(cacheKey)) {
        const cached = this.accessCache.get(cacheKey);
        if (cached.expiry > Date.now()) {
          return cached.access;
        }
      }

      const response = await fetch(`${this.baseUrl}/api/photos/check-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          requesting_user: requestingUserId,
          photo_owner: photoOwnerId,
          photo_id: photoId,
          context: context
        })
      });

      if (!response.ok) {
        return { allowed: false, reason: 'api_error' };
      }

      const result = await response.json();
      
      // Cache the result
      this.accessCache.set(cacheKey, {
        access: result,
        expiry: Date.now() + (5 * 60 * 1000) // 5 minutes
      });

      return result;
    } catch (error) {
      console.error('Photo access check failed:', error);
      return { allowed: false, reason: 'system_error' };
    }
  }

  // Check if a photo is accessible to a user
  async isPhotoAccessible(viewerId, ownerId, photo) {
    // Self-access always allowed
    if (viewerId === ownerId) {
      return { allowed: true, level: 'full' };
    }

    // Check photo's access level setting
    const photoAccessLevel = photo.access_level || 'matches_only';
    
    // Get relationship status between users
    const relationship = await this.getUserRelationshipStatus(viewerId, ownerId);
    
    switch (photoAccessLevel) {
      case 'public':
        return { allowed: true, level: 'full' };
        
      case 'matches_only':
        if (relationship.status === 'matched' || relationship.status === 'liked') {
          return { allowed: true, level: 'full' };
        } else if (relationship.compatibility_score > 0.7) {
          return { allowed: true, level: 'preview' };
        }
        return { allowed: false, reason: 'not_matched' };
        
      case 'premium_only':
        const hasAccess = await this.checkPremiumAccess(viewerId, ownerId);
        if (hasAccess) {
          return { allowed: true, level: 'full' };
        }
        return { allowed: false, reason: 'premium_required' };
        
      case 'private':
      default:
        return { allowed: false, reason: 'private_photo' };
    }
  }

  // AI-powered photo selection for matches
  async aiPhotoSelection(photos, compatibilityData, viewerId, maxPhotos = 4) {
    try {
      // Sort photos by appeal factors
      const scoredPhotos = photos.map(photo => {
        let score = 0;
        
        // Primary photo gets highest priority
        if (photo.is_primary) score += 100;
        
        // Recent photos get preference
        const photoAge = Date.now() - new Date(photo.upload_date).getTime();
        const daysSinceUpload = photoAge / (1000 * 60 * 60 * 24);
        score += Math.max(0, 50 - daysSinceUpload); // Newer = higher score
        
        // Photo quality factors (if available)
        if (photo.metadata) {
          if (photo.metadata.faces_detected > 0) score += 20;
          if (photo.metadata.smile_detected) score += 15;
          if (photo.metadata.high_quality) score += 10;
        }
        
        // Compatibility-based preferences (if AI analysis available)
        if (compatibilityData.ai_insights?.photo_preferences) {
          const preferences = compatibilityData.ai_insights.photo_preferences;
          Object.keys(preferences).forEach(pref => {
            if (photo.tags?.includes(pref)) {
              score += preferences[pref] * 10;
            }
          });
        }
        
        return { ...photo, selection_score: score };
      });

      // Sort by score and return top photos
      return scoredPhotos
        .sort((a, b) => b.selection_score - a.selection_score)
        .slice(0, maxPhotos);
        
    } catch (error) {
      console.error('AI photo selection failed:', error);
      // Fallback: return primary photo and most recent ones
      return photos
        .sort((a, b) => {
          if (a.is_primary && !b.is_primary) return -1;
          if (!a.is_primary && b.is_primary) return 1;
          return new Date(b.upload_date) - new Date(a.upload_date);
        })
        .slice(0, maxPhotos);
    }
  }

  // Generate time-limited URL with access control
  async generateTimeLimitedURL(photoId, accessConfig) {
    try {
      const response = await fetch(`${this.baseUrl}/api/photos/generate-secure-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          photo_id: photoId,
          access_config: accessConfig
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate secure URL');
      }

      const result = await response.json();
      return result.secure_url;
    } catch (error) {
      console.error('Secure URL generation failed:', error);
      return null;
    }
  }

  // Log photo access for transparency and analytics
  async logPhotoAccess(viewerId, ownerId, photoId, accessLevel) {
    try {
      await fetch(`${this.baseUrl}/api/logs/photo-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          viewer_id: viewerId,
          owner_id: ownerId,
          photo_id: photoId,
          access_level: accessLevel,
          timestamp: new Date().toISOString(),
          context: 'matchmaking'
        })
      });
    } catch (error) {
      console.error('Failed to log photo access:', error);
      // Don't throw - logging failures shouldn't break photo access
    }
  }

  // Determine photo quality based on access level
  determinePhotoQuality(photo, accessLevel) {
    switch (accessLevel) {
      case 'full':
        return 'high';
      case 'preview':
        return 'medium';
      case 'thumbnail':
        return 'low';
      default:
        return 'none';
    }
  }

  // Get user profile with photos
  async getUserProfile(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  // Get relationship status between two users
  async getUserRelationshipStatus(userAId, userBId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/relationships/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          user_a: userAId,
          user_b: userBId
        })
      });

      if (!response.ok) {
        return { status: 'none', compatibility_score: 0 };
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get relationship status:', error);
      return { status: 'none', compatibility_score: 0 };
    }
  }

  // Check premium access permissions
  async checkPremiumAccess(viewerId, ownerId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/premium/check-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          viewer_id: viewerId,
          owner_id: ownerId
        })
      });

      if (!response.ok) return false;
      const result = await response.json();
      return result.has_access;
    } catch (error) {
      console.error('Premium access check failed:', error);
      return false;
    }
  }

  // Batch photo access for multiple photos
  async batchPhotoAccess(viewerId, ownerId, photoIds, context = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/photos/batch-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          viewer_id: viewerId,
          owner_id: ownerId,
          photo_ids: photoIds,
          context: context
        })
      });

      if (!response.ok) return {};
      return await response.json();
    } catch (error) {
      console.error('Batch photo access failed:', error);
      return {};
    }
  }

  // Clear access cache for a user (useful when permissions change)
  clearAccessCache(userId) {
    for (const [key, value] of this.accessCache.entries()) {
      if (key.includes(userId)) {
        this.accessCache.delete(key);
      }
    }
  }

  // Get photo access analytics for transparency
  async getPhotoAccessAnalytics(ownerId, timeframe = '30d') {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/photo-access/${ownerId}?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Failed to get photo access analytics:', error);
      return null;
    }
  }
}

export default new PhotoAccessManager();