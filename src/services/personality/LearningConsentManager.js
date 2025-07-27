/**
 * LearningConsentManager.js
 * 
 * Manages user consent for SoulAI's comprehensive learning system
 * Default: SoulAI learns from EVERYTHING unless user opts out
 * Provides granular control while maintaining learning-first approach
 */

export class LearningConsentManager {
  constructor() {
    this.userConsent = new Map(); // User consent preferences
    this.learningData = new Map(); // What we're learning per user
  }

  /**
   * Default Learning Configuration - EVERYTHING enabled by default
   */
  static DEFAULT_LEARNING_CONFIG = {
    // Core Learning Areas (All enabled by default)
    personalityLearning: true,        // Learn personality traits from behavior
    communicationStyleLearning: true, // Learn preferred communication patterns
    relationshipPreferenceLearning: true, // Learn dating/relationship preferences
    conversationPatternLearning: true,    // Learn conversation topics & responses
    emotionalPatternLearning: true,       // Learn emotional responses & triggers
    
    // Behavioral Learning (All enabled by default)
    appUsageLearning: true,          // Learn how user navigates the app
    messagingPatternLearning: true,   // Learn messaging frequency & timing
    matchInteractionLearning: true,   // Learn what makes user engage with matches
    feedbackPatternLearning: true,    // Learn from user feedback & corrections
    
    // Advanced Learning (All enabled by default)
    contextualLearning: true,         // Learn context-specific behaviors
    temporalLearning: true,           // Learn time-based patterns (mood, energy)
    crossSessionLearning: true,       // Learn patterns across multiple sessions
    socialGraphLearning: true,        // Learn from social connections & interactions
    
    // Content Learning (All enabled by default)
    topicPreferenceLearning: true,    // Learn preferred conversation topics
    languagePatternLearning: true,    // Learn vocabulary & expression preferences
    humorStyleLearning: true,         // Learn humor preferences & style
    supportStyleLearning: true,       // Learn preferred support & advice style
    
    // Meta Learning (All enabled by default)
    learningPreferenceLearning: true, // Learn how user wants to be learned about
    adaptationSpeedLearning: true,    // Learn how quickly to adapt to changes
    privacyComfortLearning: true,     // Learn user's privacy comfort levels
    
    // Consent metadata
    consentGiven: null,               // null = not asked, true = yes, false = no
    consentTimestamp: null,
    optOutAreas: [],                  // Specific areas user opted out of
    lastReviewDate: null,             // When user last reviewed consent
    reminderFrequency: '6months'      // How often to remind about consent
  };

  /**
   * Get user's current learning configuration
   */
  getUserLearningConfig(userId) {
    if (!this.userConsent.has(userId)) {
      // New user - use default learning configuration
      const defaultConfig = { ...LearningConsentManager.DEFAULT_LEARNING_CONFIG };
      defaultConfig.consentGiven = null; // Will trigger consent popup
      this.userConsent.set(userId, defaultConfig);
    }
    
    return this.userConsent.get(userId);
  }

  /**
   * Check if user needs to see consent popup
   */
  needsConsentPopup(userId) {
    const config = this.getUserLearningConfig(userId);
    
    // Show popup if:
    // 1. Never asked for consent
    // 2. Been 6+ months since last review
    // 3. Major learning features added since last consent
    
    if (config.consentGiven === null) {
      return {
        reason: 'first_time',
        message: 'Welcome to SoulAI! Let\'s set up your learning preferences.',
        urgent: true
      };
    }

    const sixMonthsAgo = Date.now() - (6 * 30 * 24 * 60 * 60 * 1000);
    if (config.lastReviewDate && config.lastReviewDate < sixMonthsAgo) {
      return {
        reason: 'periodic_review',
        message: 'Time to review your SoulAI learning preferences.',
        urgent: false
      };
    }

    return null;
  }

  /**
   * Process user's consent response
   */
  processConsentResponse(userId, response) {
    const config = this.getUserLearningConfig(userId);
    
    if (response.acceptAllLearning) {
      // User accepts default: SoulAI learns everything
      config.consentGiven = true;
      config.consentTimestamp = Date.now();
      config.lastReviewDate = Date.now();
      
      console.log('🧠 User accepted comprehensive learning - SoulAI will learn from everything');
      
    } else if (response.customizeLearning) {
      // User wants to customize what SoulAI learns
      config.consentGiven = true;
      config.consentTimestamp = Date.now();
      config.lastReviewDate = Date.now();
      
      // Apply user's specific choices
      Object.assign(config, response.learningPreferences);
      
      console.log('🎛️ User customized learning preferences:', response.learningPreferences);
      
    } else if (response.optOutCompletely) {
      // User opts out of all learning
      config.consentGiven = false;
      config.consentTimestamp = Date.now();
      config.lastReviewDate = Date.now();
      
      // Disable all learning
      Object.keys(config).forEach(key => {
        if (key.endsWith('Learning')) {
          config[key] = false;
        }
      });
      
      console.log('🚫 User opted out of all learning');
      
    } else if (response.remindLater) {
      // User wants to decide later - continue with defaults but remind soon
      config.consentGiven = null;
      config.lastReviewDate = Date.now() - (25 * 24 * 60 * 60 * 1000); // Remind in 5 days
      
      console.log('⏰ User chose to decide later - will remind soon');
    }

    this.userConsent.set(userId, config);
    return config;
  }

  /**
   * Check if specific learning is allowed
   */
  canLearnAbout(userId, learningType) {
    const config = this.getUserLearningConfig(userId);
    
    // If user never gave consent, use defaults (learning enabled)
    if (config.consentGiven === null) {
      return LearningConsentManager.DEFAULT_LEARNING_CONFIG[learningType] || false;
    }
    
    return config[learningType] || false;
  }

  /**
   * Log learning activity (for transparency)
   */
  logLearningActivity(userId, learningType, dataCollected, insights) {
    if (!this.canLearnAbout(userId, learningType)) {
      return false; // Learning not permitted
    }

    const userLog = this.learningData.get(userId) || [];
    const entry = {
      timestamp: Date.now(),
      type: learningType,
      data: dataCollected,
      insights: insights,
      source: 'user_interaction'
    };

    userLog.push(entry);
    
    // Keep only last 1000 entries per user
    if (userLog.length > 1000) {
      userLog.splice(0, userLog.length - 1000);
    }

    this.learningData.set(userId, userLog);
    
    console.log(`📚 Learned about ${learningType} for user ${userId}:`, insights);
    return true;
  }

  /**
   * Get learning transparency report for user
   */
  getLearningReport(userId) {
    const config = this.getUserLearningConfig(userId);
    const learningLog = this.learningData.get(userId) || [];
    
    const report = {
      totalLearningEvents: learningLog.length,
      learningAreas: {},
      recentInsights: learningLog.slice(-10),
      learningEnabled: config.consentGiven !== false,
      lastUpdated: config.lastReviewDate,
      canModify: true
    };

    // Categorize learning events
    learningLog.forEach(entry => {
      if (!report.learningAreas[entry.type]) {
        report.learningAreas[entry.type] = 0;
      }
      report.learningAreas[entry.type]++;
    });

    return report;
  }

  /**
   * Generate consent popup content
   */
  generateConsentPopup(userId) {
    const needsPopup = this.needsConsentPopup(userId);
    
    if (!needsPopup) return null;

    return {
      title: needsPopup.reason === 'first_time' 
        ? "Welcome to SoulAI!" 
        : "Learning Preferences Review",
        
      message: needsPopup.reason === 'first_time'
        ? "SoulAI learns from your conversations, preferences, and interactions to provide better matches and more personalized support. This helps create deeper connections and more relevant advice."
        : "It's time to review what SoulAI learns about you. Your preferences help us serve you better.",
        
      benefits: [
        "🎯 More accurate personality matching",
        "💬 Conversations that feel natural to you", 
        "🎭 AI that adapts to your communication style",
        "💕 Better relationship recommendations",
        "📈 Improved over time as we learn your preferences"
      ],
      
      options: [
        {
          id: 'accept_all',
          title: "Yes, SoulAI can learn from everything",
          subtitle: "Recommended for best experience",
          icon: "🧠",
          action: 'acceptAllLearning',
          default: true
        },
        {
          id: 'customize',
          title: "Let me choose what to learn about",
          subtitle: "Customize your learning preferences",
          icon: "⚙️",
          action: 'customizeLearning'
        },
        {
          id: 'opt_out',
          title: "Don't learn about me",
          subtitle: "Use SoulAI without personalized learning",
          icon: "🚫",
          action: 'optOutCompletely'
        },
        {
          id: 'later',
          title: "Remind me later",
          subtitle: "Continue with defaults, ask again soon",
          icon: "⏰",
          action: 'remindLater'
        }
      ],
      
      footerText: "You can change these preferences anytime in Settings. We never share your personal data with third parties.",
      urgent: needsPopup.urgent
    };
  }

  /**
   * Quick learning status check
   */
  getLearningStatus(userId) {
    const config = this.getUserLearningConfig(userId);
    
    if (config.consentGiven === null) {
      return {
        status: 'pending_consent',
        message: 'Learning with defaults, consent pending',
        learningActive: true // Default behavior
      };
    }
    
    if (config.consentGiven === false) {
      return {
        status: 'opted_out',
        message: 'User opted out of learning',
        learningActive: false
      };
    }
    
    const enabledCount = Object.keys(config).filter(key => 
      key.endsWith('Learning') && config[key]
    ).length;
    
    return {
      status: 'active',
      message: `Learning from ${enabledCount} areas`,
      learningActive: true,
      enabledAreas: enabledCount
    };
  }

  /**
   * Update specific learning preference
   */
  updateLearningPreference(userId, learningType, enabled) {
    const config = this.getUserLearningConfig(userId);
    config[learningType] = enabled;
    config.lastReviewDate = Date.now();
    
    this.userConsent.set(userId, config);
    
    console.log(`🔧 Updated ${learningType} to ${enabled} for user ${userId}`);
    return config;
  }

  /**
   * Reset all learning data for user (GDPR compliance)
   */
  resetUserLearning(userId) {
    this.userConsent.delete(userId);
    this.learningData.delete(userId);
    
    console.log(`🗑️ Reset all learning data for user ${userId}`);
  }
}

// Global instance
export const learningConsentManager = new LearningConsentManager();
export default LearningConsentManager;