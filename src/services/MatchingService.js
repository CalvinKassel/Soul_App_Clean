// src/services/MatchingService.js - Frontend
// Save in: frontend/src/services/MatchingService.js

import ApiService from './ApiService';

class MatchingService {
  constructor() {
    this.baseURL = ApiService.baseURL;
    this.userMatches = new Map(); // Cache user matches
    this.pendingMatches = new Map(); // Cache pending matches
    this.matchListeners = new Set(); // Event listeners for real-time updates
    
    console.log('💕 Frontend Matching Service initialized');
  }

  // Find matches for current user
  async findMatches(userId, limit = 10) {
    try {
      console.log(`🔍 Finding matches for user: ${userId}`);
      
      const response = await ApiService.request('/api/matching/find-matches', {
        method: 'POST',
        body: JSON.stringify({ userId, limit })
      });

      // Cache the results
      this.userMatches.set(userId, response.matches);
      this.pendingMatches.set(userId, response.pending);

      // Notify listeners
      this.notifyMatchListeners('matches_updated', {
        userId,
        matches: response.matches,
        pending: response.pending
      });

      return {
        matches: response.matches,
        pending: response.pending,
        total: response.matches.length + response.pending.length
      };

    } catch (error) {
      console.error('❌ Find matches error:', error);
      return { matches: [], pending: [], total: 0 };
    }
  }

  // Get user's current matches
  async getUserMatches(userId) {
    try {
      console.log(`📋 Getting matches for user: ${userId}`);
      
      const response = await ApiService.request(`/api/matching/user/${userId}/matches`);

      // Update cache
      this.userMatches.set(userId, response.matches);
      this.pendingMatches.set(userId, response.pending);

      return {
        matches: response.matches,
        pending: response.pending,
        total: response.total
      };

    } catch (error) {
      console.error('❌ Get user matches error:', error);
      
      // Return cached data if available
      const cachedMatches = this.userMatches.get(userId) || [];
      const cachedPending = this.pendingMatches.get(userId) || [];
      
      return {
        matches: cachedMatches,
        pending: cachedPending,
        total: cachedMatches.length + cachedPending.length
      };
    }
  }

  // Like a user (swipe right)
  async likeUser(userId, likedUserId) {
    try {
      console.log(`👍 User ${userId} liked user ${likedUserId}`);
      
      const response = await ApiService.request('/api/matching/like-user', {
        method: 'POST',
        body: JSON.stringify({ userId, likedUserId })
      });

      // If it's a match, update cache and notify
      if (response.isMatch && response.match) {
        this.addMatchToCache(userId, response.match);
        
        this.notifyMatchListeners('new_match', {
          userId,
          match: response.match,
          isInstantMatch: true
        });
      }

      return {
        success: response.success,
        isMatch: response.isMatch,
        match: response.match,
        message: response.message
      };

    } catch (error) {
      console.error('❌ Like user error:', error);
      return { success: false, isMatch: false, match: null };
    }
  }

  // Pass on a user (swipe left)
  async passUser(userId, passedUserId, reason = '') {
    try {
      console.log(`👎 User ${userId} passed on user ${passedUserId}`);
      
      const response = await ApiService.request('/api/matching/pass-user', {
        method: 'POST',
        body: JSON.stringify({ userId, passedUserId, reason })
      });

      return { success: response.success };

    } catch (error) {
      console.error('❌ Pass user error:', error);
      return { success: false };
    }
  }

  // Start conversation with a match
  async startConversation(matchId, userId) {
    try {
      console.log(`💬 Starting conversation: ${matchId} for user: ${userId}`);
      
      const response = await ApiService.request('/api/matching/start-conversation', {
        method: 'POST',
        body: JSON.stringify({ matchId, userId })
      });

      // Update match in cache
      if (response.success && response.match) {
        this.updateMatchInCache(userId, matchId, response.match);
        
        this.notifyMatchListeners('conversation_started', {
          userId,
          matchId,
          match: response.match
        });
      }

      return {
        success: response.success,
        match: response.match
      };

    } catch (error) {
      console.error('❌ Start conversation error:', error);
      return { success: false, match: null };
    }
  }

  // Update matching preferences
  async updatePreferences(userId, preferences) {
    try {
      console.log(`⚙️ Updating preferences for user: ${userId}`);
      
      const response = await ApiService.request('/api/matching/update-preferences', {
        method: 'POST',
        body: JSON.stringify({ userId, preferences })
      });

      if (response.success) {
        // Clear cache to force refresh with new preferences
        this.userMatches.delete(userId);
        this.pendingMatches.delete(userId);

        this.notifyMatchListeners('preferences_updated', {
          userId,
          preferences
        });
      }

      return {
        success: response.success,
        user: response.user
      };

    } catch (error) {
      console.error('❌ Update preferences error:', error);
      return { success: false };
    }
  }

  // Get compatibility analysis for two users
  async getCompatibilityAnalysis(userId1, userId2) {
    try {
      console.log(`📊 Getting compatibility analysis: ${userId1} ↔ ${userId2}`);
      
      const response = await ApiService.request(`/api/soulai/compatibility/${userId1}/${userId2}`);

      return {
        compatibility: response.compatibility,
        timestamp: response.timestamp
      };

    } catch (error) {
      console.error('❌ Get compatibility analysis error:', error);
      return { compatibility: null };
    }
  }

  // Get matching statistics
  async getMatchingStats() {
    try {
      console.log('📊 Getting matching statistics');
      
      const response = await ApiService.request('/api/matching/stats');

      return response.stats;

    } catch (error) {
      console.error('❌ Get matching stats error:', error);
      return null;
    }
  }

  // Event listener management
  addMatchListener(callback) {
    this.matchListeners.add(callback);
    return () => this.matchListeners.delete(callback);
  }

  notifyMatchListeners(event, data) {
    this.matchListeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('❌ Match listener error:', error);
      }
    });
  }

  // Cache management
  addMatchToCache(userId, match) {
    const userMatches = this.userMatches.get(userId) || [];
    const pendingMatches = this.pendingMatches.get(userId) || [];
    
    if (match.status === 'confirmed') {
      userMatches.push(match);
      this.userMatches.set(userId, userMatches);
    } else if (match.status === 'pending') {
      pendingMatches.push(match);
      this.pendingMatches.set(userId, pendingMatches);
    }
  }

  updateMatchInCache(userId, matchId, updatedMatch) {
    const userMatches = this.userMatches.get(userId) || [];
    const pendingMatches = this.pendingMatches.get(userId) || [];
    
    // Update in confirmed matches
    const matchIndex = userMatches.findIndex(match => match.matchId === matchId);
    if (matchIndex >= 0) {
      userMatches[matchIndex] = { ...userMatches[matchIndex], ...updatedMatch };
      this.userMatches.set(userId, userMatches);
    }
    
    // Update in pending matches
    const pendingIndex = pendingMatches.findIndex(match => match.matchId === matchId);
    if (pendingIndex >= 0) {
      pendingMatches[pendingIndex] = { ...pendingMatches[pendingIndex], ...updatedMatch };
      this.pendingMatches.set(userId, pendingMatches);
    }
  }

  removeMatchFromCache(userId, matchId) {
    const userMatches = this.userMatches.get(userId) || [];
    const pendingMatches = this.pendingMatches.get(userId) || [];
    
    this.userMatches.set(userId, userMatches.filter(match => match.matchId !== matchId));
    this.pendingMatches.set(userId, pendingMatches.filter(match => match.matchId !== matchId));
  }

  clearUserCache(userId) {
    this.userMatches.delete(userId);
    this.pendingMatches.delete(userId);
  }

  // Utility methods
  formatMatchForDisplay(match) {
    return {
      id: match.matchId || match.id,
      user: {
        id: match.user.id,
        name: match.user.name,
        age: match.user.age,
        photos: match.user.photos || [],
        location: match.user.location,
        profile: match.user.profile
      },
      compatibility: {
        score: match.match?.compatibility?.score || 0,
        level: this.getCompatibilityLevel(match.match?.compatibility?.score || 0),
        sharedValues: match.match?.compatibility?.sharedValues || []
      },
      status: match.status,
      createdAt: match.match?.createdAt,
      lastInteraction: match.match?.lastInteraction,
      hasNewMessages: match.match?.interaction?.lastMessageAt ? 
        this.isRecent(match.match.interaction.lastMessageAt) : false
    };
  }

  getCompatibilityLevel(score) {
    if (score >= 0.9) return 'exceptional';
    if (score >= 0.8) return 'high';
    if (score >= 0.6) return 'medium';
    if (score >= 0.4) return 'low';
    return 'very_low';
  }

  getCompatibilityColor(score) {
    if (score >= 0.8) return '#4ECDC4'; // High - teal
    if (score >= 0.6) return '#45B7D1'; // Medium - blue
    if (score >= 0.4) return '#FFA500'; // Low - orange
    return '#8E8E93'; // Very low - gray
  }

  isRecent(timestamp) {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffHours = (now - messageTime) / (1000 * 60 * 60);
    return diffHours < 24; // Consider messages from last 24 hours as recent
  }

  formatLastActive(timestamp) {
    const now = new Date();
    const activeTime = new Date(timestamp);
    const diffMinutes = (now - activeTime) / (1000 * 60);
    
    if (diffMinutes < 1) return 'Active now';
    if (diffMinutes < 60) return `Active ${Math.floor(diffMinutes)}m ago`;
    
    const diffHours = diffMinutes / 60;
    if (diffHours < 24) return `Active ${Math.floor(diffHours)}h ago`;
    
    const diffDays = diffHours / 24;
    if (diffDays < 7) return `Active ${Math.floor(diffDays)}d ago`;
    
    return 'Active over a week ago';
  }

  // Mock data for development
  getMockMatches(userId) {
    return [
      {
        matchId: 'match_1',
        user: {
          id: 'user_2',
          name: 'Sophie',
          age: 26,
          photos: ['https://i.pravatar.cc/400?img=47'],
          location: { city: 'New York', state: 'NY' }
        },
        match: {
          compatibility: { score: 0.87, sharedValues: ['authenticity', 'growth'] },
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          interaction: { conversationStarted: true, messageCount: 5 }
        },
        status: 'confirmed'
      },
      {
        matchId: 'match_2',
        user: {
          id: 'user_3',
          name: 'Emma',
          age: 24,
          photos: ['https://i.pravatar.cc/400?img=48'],
          location: { city: 'San Francisco', state: 'CA' }
        },
        match: {
          compatibility: { score: 0.82, sharedValues: ['adventure', 'creativity'] },
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          interaction: { conversationStarted: false, messageCount: 0 }
        },
        status: 'confirmed'
      }
    ];
  }

  getMockPendingMatches(userId) {
    return [
      {
        matchId: 'pending_1',
        user: {
          id: 'user_4',
          name: 'Maya',
          age: 28,
          photos: ['https://i.pravatar.cc/400?img=49'],
          location: { city: 'Los Angeles', state: 'CA' }
        },
        match: {
          compatibility: { score: 0.75, sharedValues: ['mindfulness'] },
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
        },
        status: 'pending'
      }
    ];
  }
}

export default new MatchingService();