// models/User.js - Database Model
// Save in: backend/models/User.js

class User {
  constructor(userData = {}) {
    this.id = userData.id || null;
    this.email = userData.email || '';
    this.name = userData.name || '';
    this.age = userData.age || null;
    this.location = userData.location || {};
    this.photos = userData.photos || [];
    this.createdAt = userData.createdAt || new Date();
    this.lastActive = userData.lastActive || new Date();
    this.isOnline = userData.isOnline || false;
    this.isVerified = userData.isVerified || false;
    
    // Profile information
    this.profile = {
      personalityType: null,
      interests: [],
      values: [],
      dealBreakers: [],
      relationshipGoals: '',
      aboutMe: '',
      completeness: 0,
      lifestyle: [],
      communicationStyle: 'unknown',
      educationLevel: '',
      occupation: '',
      religiousBeliefs: '',
      politicalViews: '',
      fitnessLevel: '',
      drinkingHabits: '',
      smokingHabits: '',
      wantsChildren: null,
      hasChildren: false,
      languages: [],
      ...userData.profile
    };

    // Matching preferences
    this.preferences = {
      ageRange: { min: 22, max: 35 },
      maxDistance: 50,
      dealBreakers: [],
      mustHaves: [],
      preferredEducation: [],
      preferredLifestyle: [],
      ...userData.preferences
    };

    // SoulAI personality configuration
    this.soulAIPersonality = {
      style: 'empathetic_guide',
      approach: 'socratic_questioning',
      adaptability: 'high',
      specialization: 'relationship_psychology',
      memoryCapacity: 'comprehensive',
      learningSpeed: 'fast',
      ...userData.soulAIPersonality
    };

    // User state
    this.matchingStatus = userData.matchingStatus || 'new_user';
    this.subscriptionStatus = userData.subscriptionStatus || 'free';
    this.privacySettings = {
      showAge: true,
      showLocation: true,
      showLastActive: false,
      allowMessagePreviews: true,
      ...userData.privacySettings
    };

    // Analytics and insights
    this.analytics = {
      totalConversations: 0,
      averageResponseTime: 0,
      profileViews: 0,
      likesGiven: 0,
      likesReceived: 0,
      matchesTotal: 0,
      conversationsStarted: 0,
      ...userData.analytics
    };
  }

  // Validation methods
  isValidEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  isValidAge() {
    return this.age >= 18 && this.age <= 100;
  }

  isProfileComplete() {
    return this.profile.completeness >= 70;
  }

  isReadyForMatching() {
    return this.isProfileComplete() && 
           this.matchingStatus === 'ready_for_matches' &&
           this.photos.length >= 2;
  }

  // Profile completeness calculation
  calculateProfileCompleteness() {
    const requiredFields = [
      'personalityType', 'interests', 'values', 'relationshipGoals', 
      'aboutMe', 'communicationStyle', 'lifestyle'
    ];
    
    const optionalFields = [
      'educationLevel', 'occupation', 'languages'
    ];
    
    let score = 0;
    const totalPossibleScore = requiredFields.length * 2 + optionalFields.length;
    
    // Required fields (2 points each)
    requiredFields.forEach(field => {
      if (this.profile[field]) {
        if (Array.isArray(this.profile[field])) {
          if (this.profile[field].length > 0) score += 2;
        } else if (this.profile[field] !== '' && this.profile[field] !== 'unknown') {
          score += 2;
        }
      }
    });
    
    // Optional fields (1 point each)
    optionalFields.forEach(field => {
      if (this.profile[field] && this.profile[field] !== '') {
        score += 1;
      }
    });
    
    // Photos bonus
    if (this.photos.length >= 2) score += 2;
    if (this.photos.length >= 4) score += 1;
    
    this.profile.completeness = Math.min(Math.round((score / totalPossibleScore) * 100), 100);
    return this.profile.completeness;
  }

  // Update methods
  updateProfile(profileData) {
    this.profile = { ...this.profile, ...profileData };
    this.calculateProfileCompleteness();
    this.lastActive = new Date();
    
    // Update matching status based on completeness
    if (this.profile.completeness >= 70 && this.matchingStatus === 'building_profile') {
      this.matchingStatus = 'ready_for_matches';
    }
  }

  updatePreferences(preferenceData) {
    this.preferences = { ...this.preferences, ...preferenceData };
    this.lastActive = new Date();
  }

  updateLocation(location) {
    this.location = location;
    this.lastActive = new Date();
  }

  addPhoto(photoUrl) {
    if (!this.photos.includes(photoUrl)) {
      this.photos.push(photoUrl);
      this.calculateProfileCompleteness();
    }
  }

  removePhoto(photoUrl) {
    this.photos = this.photos.filter(photo => photo !== photoUrl);
    this.calculateProfileCompleteness();
  }

  // Activity tracking
  updateLastActive() {
    this.lastActive = new Date();
  }

  setOnlineStatus(isOnline) {
    this.isOnline = isOnline;
    if (isOnline) {
      this.updateLastActive();
    }
  }

  // Analytics updates
  incrementProfileViews() {
    this.analytics.profileViews++;
  }

  recordLikeGiven() {
    this.analytics.likesGiven++;
  }

  recordLikeReceived() {
    this.analytics.likesReceived++;
  }

  recordNewMatch() {
    this.analytics.matchesTotal++;
  }

  recordConversationStarted() {
    this.analytics.conversationsStarted++;
  }

  // Compatibility methods
  meetsAgePreference(otherUser) {
    const otherAge = parseInt(otherUser.age);
    return otherAge >= this.preferences.ageRange.min && 
           otherAge <= this.preferences.ageRange.max;
  }

  hasCompatibleDealBreakers(otherUser) {
    // Check if other user has any of this user's deal breakers
    const myDealBreakers = this.preferences.dealBreakers || [];
    const theirTraits = [
      otherUser.profile.smokingHabits,
      otherUser.profile.drinkingHabits,
      otherUser.profile.religiousBeliefs,
      otherUser.profile.politicalViews
    ].filter(trait => trait && trait !== '');

    return !myDealBreakers.some(dealBreaker => theirTraits.includes(dealBreaker));
  }

  // Serialization methods
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      age: this.age,
      location: this.location,
      photos: this.photos,
      createdAt: this.createdAt,
      lastActive: this.lastActive,
      isOnline: this.isOnline,
      isVerified: this.isVerified,
      profile: this.profile,
      preferences: this.preferences,
      soulAIPersonality: this.soulAIPersonality,
      matchingStatus: this.matchingStatus,
      subscriptionStatus: this.subscriptionStatus,
      privacySettings: this.privacySettings,
      analytics: this.analytics
    };
  }

  toPublicProfile() {
    return {
      id: this.id,
      name: this.name,
      age: this.privacySettings.showAge ? this.age : null,
      location: this.privacySettings.showLocation ? this.location : null,
      photos: this.photos,
      profile: {
        personalityType: this.profile.personalityType,
        interests: this.profile.interests,
        values: this.profile.values,
        relationshipGoals: this.profile.relationshipGoals,
        aboutMe: this.profile.aboutMe,
        lifestyle: this.profile.lifestyle,
        educationLevel: this.profile.educationLevel,
        occupation: this.profile.occupation,
        languages: this.profile.languages
      },
      lastActive: this.privacySettings.showLastActive ? this.lastActive : null,
      isOnline: this.isOnline
    };
  }

  static fromJSON(userData) {
    return new User(userData);
  }

  // Validation for database operations
  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (!this.isValidEmail()) {
      errors.push('Invalid email address');
    }

    if (!this.isValidAge()) {
      errors.push('Age must be between 18 and 100');
    }

    if (this.photos.length === 0) {
      errors.push('At least one photo is required');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}

module.exports = User;