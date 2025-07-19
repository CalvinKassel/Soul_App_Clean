// src/utils/MatchingUtils.js - Frontend Utilities
// Save in: frontend/src/utils/MatchingUtils.js

// Compatibility scoring utilities
export const CompatibilityUtils = {
  // Calculate compatibility score between two users
  calculateCompatibility(user1, user2) {
    let score = 0;
    let factors = [];

    // Age compatibility (10% weight)
    const ageScore = this.calculateAgeCompatibility(user1.age, user2.age);
    score += ageScore * 0.1;
    if (ageScore > 0.8) factors.push('age_compatible');

    // Shared interests (25% weight)
    const interestScore = this.calculateSharedInterests(user1.profile.interests, user2.profile.interests);
    score += interestScore * 0.25;
    if (interestScore > 0.6) factors.push('shared_interests');

    // Values alignment (30% weight)
    const valuesScore = this.calculateValuesAlignment(user1.profile.values, user2.profile.values);
    score += valuesScore * 0.3;
    if (valuesScore > 0.7) factors.push('aligned_values');

    // Personality compatibility (20% weight)
    const personalityScore = this.calculatePersonalityCompatibility(
      user1.profile.personalityType, 
      user2.profile.personalityType
    );
    score += personalityScore * 0.2;
    if (personalityScore > 0.6) factors.push('personality_match');

    // Lifestyle compatibility (15% weight)
    const lifestyleScore = this.calculateLifestyleCompatibility(
      user1.profile.lifestyle, 
      user2.profile.lifestyle
    );
    score += lifestyleScore * 0.15;
    if (lifestyleScore > 0.5) factors.push('lifestyle_compatible');

    return {
      score: Math.min(score, 1.0),
      factors,
      breakdown: {
        age: ageScore,
        interests: interestScore,
        values: valuesScore,
        personality: personalityScore,
        lifestyle: lifestyleScore
      }
    };
  },

  calculateAgeCompatibility(age1, age2) {
    const ageDiff = Math.abs(age1 - age2);
    if (ageDiff <= 2) return 1.0;
    if (ageDiff <= 5) return 0.9;
    if (ageDiff <= 8) return 0.7;
    if (ageDiff <= 12) return 0.5;
    return 0.2;
  },

  calculateSharedInterests(interests1, interests2) {
    if (!interests1 || !interests2 || interests1.length === 0 || interests2.length === 0) {
      return 0;
    }

    const shared = interests1.filter(interest => interests2.includes(interest));
    return shared.length / Math.max(interests1.length, interests2.length);
  },

  calculateValuesAlignment(values1, values2) {
    if (!values1 || !values2 || values1.length === 0 || values2.length === 0) {
      return 0;
    }

    const shared = values1.filter(value => values2.includes(value));
    return shared.length / Math.max(values1.length, values2.length);
  },

  calculatePersonalityCompatibility(type1, type2) {
    if (!type1 || !type2) return 0.5; // Neutral if unknown

    // MBTI compatibility matrix (simplified)
    const compatibilityMatrix = {
      'INTJ': ['ENFP', 'ENTP', 'INFJ', 'INFP'],
      'INTP': ['ENFJ', 'ENTJ', 'INFJ', 'INTJ'],
      'ENTJ': ['INFP', 'INTP', 'ENFP', 'ENTP'],
      'ENTP': ['INFJ', 'INTJ', 'ENFP', 'ENTJ'],
      'INFJ': ['ENFP', 'ENTP', 'INFP', 'INTJ'],
      'INFP': ['ENFJ', 'ENTJ', 'INFJ', 'ENFP'],
      'ENFJ': ['INFP', 'ISFP', 'INTP', 'INFJ'],
      'ENFP': ['INTJ', 'INFJ', 'ENTJ', 'ENTP'],
      'ISTJ': ['ESFP', 'ESTP', 'ISFJ', 'ESTJ'],
      'ISFJ': ['ESFP', 'ESTP', 'ISTJ', 'ESTJ'],
      'ESTJ': ['ISFP', 'ISTP', 'ISTJ', 'ISFJ'],
      'ESFJ': ['ISFP', 'ISTP', 'ISFJ', 'ESTJ'],
      'ISTP': ['ESFJ', 'ESTJ', 'ISFP', 'ESTP'],
      'ISFP': ['ESFJ', 'ESTJ', 'ISTP', 'ENFJ'],
      'ESTP': ['ISFJ', 'ISTJ', 'ISTP', 'ESFP'],
      'ESFP': ['ISFJ', 'ISTJ', 'ESTP', 'ISFP']
    };

    // Extract just the main type (remove -A/-T)
    const cleanType1 = type1.replace(/-[AT]$/, '');
    const cleanType2 = type2.replace(/-[AT]$/, '');

    if (cleanType1 === cleanType2) return 0.8; // Same type
    
    const compatibleTypes = compatibilityMatrix[cleanType1] || [];
    if (compatibleTypes.includes(cleanType2)) return 0.9; // High compatibility
    
    // Check for complementary functions
    const complementaryScore = this.calculateComplementaryFunctions(cleanType1, cleanType2);
    return complementaryScore;
  },

  calculateComplementaryFunctions(type1, type2) {
    // Simplified function stack compatibility
    const functionStacks = {
      'INTJ': ['Ni', 'Te', 'Fi', 'Se'],
      'ENFP': ['Ne', 'Fi', 'Te', 'Si'],
      'INFJ': ['Ni', 'Fe', 'Ti', 'Se'],
      'ENTP': ['Ne', 'Ti', 'Fe', 'Si'],
      'ISTJ': ['Si', 'Te', 'Fi', 'Ne'],
      'ESFP': ['Se', 'Fi', 'Te', 'Ni'],
      'ISFJ': ['Si', 'Fe', 'Ti', 'Ne'],
      'ESTP': ['Se', 'Ti', 'Fe', 'Ni']
    };

    const stack1 = functionStacks[type1];
    const stack2 = functionStacks[type2];

    if (!stack1 || !stack2) return 0.5;

    // Check if dominant functions complement each other
    if (stack1[0] === stack2[1] || stack1[1] === stack2[0]) return 0.8;
    if (stack1[0] === stack2[2] || stack1[2] === stack2[0]) return 0.6;
    
    return 0.4;
  },

  calculateLifestyleCompatibility(lifestyle1, lifestyle2) {
    if (!lifestyle1 || !lifestyle2) return 0.5;
    
    const shared = lifestyle1.filter(item => lifestyle2.includes(item));
    return shared.length / Math.max(lifestyle1.length, lifestyle2.length, 1);
  }
};

// Match quality assessment
export const MatchQualityUtils = {
  assessMatchQuality(match) {
    const score = match.compatibility?.score || 0;
    const factors = match.compatibility?.factors || [];
    
    let quality = 'low';
    let color = '#8E8E93';
    let description = '';

    if (score >= 0.9) {
      quality = 'exceptional';
      color = '#4ECDC4';
      description = 'Exceptional compatibility - rare and special connection';
    } else if (score >= 0.8) {
      quality = 'high';
      color = '#45B7D1';
      description = 'High compatibility - strong potential for lasting connection';
    } else if (score >= 0.6) {
      quality = 'medium';
      color = '#FFA500';
      description = 'Good compatibility - worth exploring further';
    } else if (score >= 0.4) {
      quality = 'low';
      color = '#FF6B6B';
      description = 'Some compatibility - conversation may reveal more';
    } else {
      quality = 'very_low';
      color = '#8E8E93';
      description = 'Limited compatibility indicators';
    }

    return {
      quality,
      color,
      description,
      score,
      factors,
      recommendation: this.getRecommendation(score, factors)
    };
  },

  getRecommendation(score, factors) {
    if (score >= 0.8) {
      return "This looks like a great match! Start with something you both enjoy.";
    } else if (score >= 0.6) {
      return "Good potential here. Find common ground to build connection.";
    } else if (score >= 0.4) {
      return "Worth a conversation to see if there's chemistry.";
    } else {
      return "Keep an open mind - sometimes opposites attract!";
    }
  }
};

// Conversation utilities
export const ConversationUtils = {
  generateIceBreakers(userProfile, matchProfile) {
    const iceBreakers = [];
    
    // Based on shared interests
    const sharedInterests = this.findSharedInterests(
      userProfile.interests, 
      matchProfile.interests
    );
    
    sharedInterests.forEach(interest => {
      iceBreakers.push({
        text: `I see we both love ${interest}! What got you into it?`,
        type: 'shared_interest',
        confidence: 0.9
      });
    });

    // Based on personality
    if (matchProfile.personalityType) {
      iceBreakers.push({
        text: `As a ${matchProfile.personalityType}, what energizes you most?`,
        type: 'personality',
        confidence: 0.7
      });
    }

    // Based on photos/location
    if (matchProfile.location) {
      iceBreakers.push({
        text: `How do you like living in ${matchProfile.location.city}?`,
        type: 'location',
        confidence: 0.6
      });
    }

    // Generic but engaging
    iceBreakers.push(
      {
        text: "What's been the highlight of your week so far?",
        type: 'general',
        confidence: 0.8
      },
      {
        text: "I'm curious - what's something you're passionate about lately?",
        type: 'general',
        confidence: 0.7
      }
    );

    return iceBreakers.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  },

  findSharedInterests(interests1, interests2) {
    if (!interests1 || !interests2) return [];
    return interests1.filter(interest => interests2.includes(interest));
  },

  analyzeConversationFlow(messages) {
    if (!messages || messages.length === 0) {
      return { quality: 'no_data', engagement: 0, balance: 0 };
    }

    const userMessages = messages.filter(msg => msg.from === 'user');
    const otherMessages = messages.filter(msg => msg.from !== 'user');
    
    // Engagement score
    const totalMessages = messages.length;
    const engagementScore = Math.min(totalMessages / 20, 1); // Normalize to 20 messages

    // Balance score (conversation should be balanced)
    const balanceScore = Math.min(userMessages.length, otherMessages.length) / 
                        Math.max(userMessages.length, otherMessages.length);

    // Quality indicators
    const avgMessageLength = messages.reduce((sum, msg) => sum + msg.text.length, 0) / messages.length;
    const qualityScore = Math.min(avgMessageLength / 50, 1); // Normalize to 50 chars

    let quality = 'poor';
    if (engagementScore > 0.7 && balanceScore > 0.6 && qualityScore > 0.5) {
      quality = 'excellent';
    } else if (engagementScore > 0.5 && balanceScore > 0.4) {
      quality = 'good';
    } else if (engagementScore > 0.3) {
      quality = 'fair';
    }

    return {
      quality,
      engagement: engagementScore,
      balance: balanceScore,
      avgMessageLength,
      totalMessages,
      recommendations: this.getConversationRecommendations(quality, balanceScore)
    };
  },

  getConversationRecommendations(quality, balance) {
    const recommendations = [];

    if (quality === 'poor') {
      recommendations.push('Try asking more open-ended questions');
      recommendations.push('Share something personal about yourself');
    }

    if (balance < 0.4) {
      recommendations.push('Give them space to share more');
      recommendations.push('Ask follow-up questions about their interests');
    }

    if (recommendations.length === 0) {
      recommendations.push('Keep the conversation flowing naturally');
      recommendations.push('Show genuine curiosity about their experiences');
    }

    return recommendations;
  }
};

// Profile completion utilities
export const ProfileUtils = {
  calculateCompleteness(profile) {
    const requiredFields = [
      { field: 'personalityType', weight: 20 },
      { field: 'interests', weight: 15, minLength: 3 },
      { field: 'values', weight: 15, minLength: 2 },
      { field: 'relationshipGoals', weight: 15 },
      { field: 'aboutMe', weight: 15, minLength: 50 },
      { field: 'communicationStyle', weight: 10 },
      { field: 'lifestyle', weight: 10, minLength: 2 }
    ];

    let totalScore = 0;
    let breakdown = {};

    requiredFields.forEach(({ field, weight, minLength }) => {
      let fieldScore = 0;
      const value = profile[field];

      if (value) {
        if (Array.isArray(value)) {
          fieldScore = minLength ? (value.length >= minLength ? 1 : value.length / minLength) : (value.length > 0 ? 1 : 0);
        } else if (typeof value === 'string') {
          if (minLength) {
            fieldScore = value.length >= minLength ? 1 : value.length / minLength;
          } else {
            fieldScore = value.trim() !== '' && value !== 'unknown' ? 1 : 0;
          }
        } else {
          fieldScore = 1;
        }
      }

      breakdown[field] = {
        score: fieldScore,
        weight,
        contribution: fieldScore * weight
      };

      totalScore += fieldScore * weight;
    });

    return {
      percentage: Math.round(totalScore),
      breakdown,
      nextSteps: this.getNextSteps(breakdown)
    };
  },

  getNextSteps(breakdown) {
    const incompleteFields = Object.entries(breakdown)
      .filter(([field, data]) => data.score < 1)
      .sort((a, b) => b[1].weight - a[1].weight)
      .slice(0, 3);

    return incompleteFields.map(([field, data]) => {
      const suggestions = {
        personalityType: 'Take our personality assessment to find better matches',
        interests: 'Add more interests to show your personality',
        values: 'Share what\'s important to you in relationships',
        relationshipGoals: 'Let others know what you\'re looking for',
        aboutMe: 'Write more about yourself to stand out',
        communicationStyle: 'Help others understand how you communicate',
        lifestyle: 'Share details about how you like to live'
      };

      return {
        field,
        suggestion: suggestions[field] || `Complete your ${field}`,
        priority: data.weight > 15 ? 'high' : 'medium'
      };
    });
  }
};

// Date and time utilities
export const DateUtils = {
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
  },

  formatMatchAge(createdAt) {
    const now = new Date();
    const matchTime = new Date(createdAt);
    const diffHours = (now - matchTime) / (1000 * 60 * 60);
    
    if (diffHours < 1) return 'Just matched';
    if (diffHours < 24) return `Matched ${Math.floor(diffHours)}h ago`;
    
    const diffDays = diffHours / 24;
    if (diffDays < 7) return `Matched ${Math.floor(diffDays)}d ago`;
    
    return `Matched ${Math.floor(diffDays / 7)}w ago`;
  },

  isRecent(timestamp, hours = 24) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffHours = (now - time) / (1000 * 60 * 60);
    return diffHours < hours;
  }
};

// Validation utilities
export const ValidationUtils = {
  validateProfile(profile) {
    const errors = [];

    if (!profile.aboutMe || profile.aboutMe.length < 10) {
      errors.push('About me should be at least 10 characters');
    }

    if (!profile.interests || profile.interests.length < 1) {
      errors.push('Add at least one interest');
    }

    if (!profile.relationshipGoals || profile.relationshipGoals === '') {
      errors.push('Specify what you\'re looking for');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  validateMessage(message) {
    if (!message || message.trim().length === 0) {
      return { isValid: false, error: 'Message cannot be empty' };
    }

    if (message.length > 1000) {
      return { isValid: false, error: 'Message is too long' };
    }

    return { isValid: true };
  }
};

// Location utilities
export const LocationUtils = {
  calculateDistance(location1, location2) {
    // Haversine formula for calculating distance between two points on Earth
    const R = 6371; // Earth's radius in kilometers

    const lat1 = location1.latitude * Math.PI / 180;
    const lat2 = location2.latitude * Math.PI / 180;
    const deltaLat = (location2.latitude - location1.latitude) * Math.PI / 180;
    const deltaLon = (location2.longitude - location1.longitude) * Math.PI / 180;

    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in kilometers
  },

  formatDistance(distance) {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    } else if (distance < 10) {
      return `${Math.round(distance * 10) / 10}km away`;
    } else {
      return `${Math.round(distance)}km away`;
    }
  },

  isWithinRange(userLocation, targetLocation, maxDistance) {
    if (!userLocation || !targetLocation) return true; // Skip check if no location data
    
    const distance = this.calculateDistance(userLocation, targetLocation);
    return distance <= maxDistance;
  }
};

// Notification utilities
export const NotificationUtils = {
  formatMatchNotification(match) {
    return {
      title: "It's a Match! 💕",
      body: `You and ${match.user.name} liked each other`,
      data: {
        type: 'match',
        matchId: match.id,
        userId: match.user.id
      }
    };
  },

  formatMessageNotification(message, sender) {
    return {
      title: sender.name,
      body: message.text.length > 50 ? message.text.substring(0, 50) + '...' : message.text,
      data: {
        type: 'message',
        senderId: sender.id,
        messageId: message.id
      }
    };
  },

  formatLikeNotification(user) {
    return {
      title: "Someone likes you! 👍",
      body: `${user.name} is interested in getting to know you`,
      data: {
        type: 'like',
        userId: user.id
      }
    };
  }
};

// Analytics utilities
export const AnalyticsUtils = {
  trackMatchQuality(matches) {
    if (!matches || matches.length === 0) return null;

    const scores = matches.map(match => match.compatibility?.score || 0);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    const qualityDistribution = {
      exceptional: scores.filter(s => s >= 0.9).length,
      high: scores.filter(s => s >= 0.8 && s < 0.9).length,
      medium: scores.filter(s => s >= 0.6 && s < 0.8).length,
      low: scores.filter(s => s < 0.6).length
    };

    return {
      averageScore: avgScore,
      totalMatches: matches.length,
      qualityDistribution,
      recommendations: this.getMatchingRecommendations(avgScore, qualityDistribution)
    };
  },

  getMatchingRecommendations(avgScore, distribution) {
    const recommendations = [];

    if (avgScore < 0.6) {
      recommendations.push('Consider expanding your preferences to find better matches');
      recommendations.push('Complete more of your profile to improve compatibility analysis');
    }

    if (distribution.exceptional === 0 && distribution.high === 0) {
      recommendations.push('Try being more specific about what you\'re looking for');
    }

    if (recommendations.length === 0) {
      recommendations.push('Your matching quality looks good! Keep an open mind.');
    }

    return recommendations;
  },

  calculateResponseRate(conversations) {
    if (!conversations || conversations.length === 0) return 0;

    const conversationsWithResponses = conversations.filter(conv => 
      conv.messages && conv.messages.length > 1
    );

    return conversationsWithResponses.length / conversations.length;
  }
};

// Export all utilities
export default {
  CompatibilityUtils,
  MatchQualityUtils,
  ConversationUtils,
  ProfileUtils,
  DateUtils,
  ValidationUtils,
  LocationUtils,
  NotificationUtils,
  AnalyticsUtils
};