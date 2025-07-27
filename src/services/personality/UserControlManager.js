/**
 * UserControlManager.js
 * 
 * Ensures users maintain full control over AI personality adaptation
 * Provides overrides, customization, and transparency features
 */

export class UserControlManager {
  constructor() {
    this.userOverrides = new Map(); // User-specific overrides
    this.adaptationSettings = new Map(); // Per-user adaptation preferences
  }

  /**
   * User Control Levels - from most to least adaptive
   */
  static CONTROL_LEVELS = {
    FULL_ADAPTIVE: 'full_adaptive',       // AI fully adapts to HHC
    GUIDED_ADAPTIVE: 'guided_adaptive',   // AI adapts with user guidance
    SELECTIVE: 'selective',               // User chooses which traits to adapt
    MANUAL_ONLY: 'manual_only',          // User manually sets AI style
    DISABLED: 'disabled'                 // No personality adaptation
  };

  /**
   * Get user's control preferences
   */
  getUserControlSettings(userId) {
    return this.adaptationSettings.get(userId) || {
      controlLevel: UserControlManager.CONTROL_LEVELS.GUIDED_ADAPTIVE,
      allowedAdaptations: {
        tone: true,
        verbosity: true,
        empathy: true,
        directness: false,  // Many users prefer to control this
        humor: true,
        formality: false    // Often context-dependent
      },
      manualOverrides: {},
      adaptationTransparency: true,  // Show why AI behaves certain way
      feedbackEnabled: true         // Allow real-time adjustment
    };
  }

  /**
   * Apply user control filters to interaction profile
   */
  applyUserControl(userId, baseProfile) {
    const settings = this.getUserControlSettings(userId);
    const userOverrides = this.userOverrides.get(userId) || {};

    // If adaptation is disabled, return neutral profile
    if (settings.controlLevel === UserControlManager.CONTROL_LEVELS.DISABLED) {
      return this.getNeutralProfile();
    }

    let controlledProfile = { ...baseProfile };

    // Apply manual overrides first (highest priority)
    Object.assign(controlledProfile, userOverrides);

    // Filter based on allowed adaptations
    if (settings.controlLevel === UserControlManager.CONTROL_LEVELS.SELECTIVE) {
      Object.keys(controlledProfile).forEach(key => {
        if (settings.allowedAdaptations[key] === false) {
          // Revert to neutral/default value
          controlledProfile[key] = this.getNeutralProfile()[key];
        }
      });
    }

    return controlledProfile;
  }

  /**
   * User feedback system - allows real-time adjustments
   */
  processFeedback(userId, feedback) {
    const currentOverrides = this.userOverrides.get(userId) || {};
    
    // Convert feedback to specific overrides
    const newOverrides = { ...currentOverrides };

    if (feedback.tooEnthusiastic) {
      newOverrides.tone = 'calm_and_thoughtful';
      newOverrides.encouragement_style = 'gentle_positive';
    }

    if (feedback.tooVerbose) {
      newOverrides.verbosity = 'concise_and_clear';
    }

    if (feedback.notEmpathetic) {
      newOverrides.empathy_level = 'very_high';
      newOverrides.validation_style = 'deeply_understanding';
    }

    if (feedback.tooFormal) {
      newOverrides.formality = 'very_casual';
    }

    if (feedback.notDirectEnough) {
      newOverrides.directness = 'honest_and_straightforward';
    }

    this.userOverrides.set(userId, newOverrides);
    
    console.log('🎛️ Applied user feedback overrides:', newOverrides);
    return newOverrides;
  }

  /**
   * Manual style selection - user chooses AI personality
   */
  setManualStyle(userId, stylePreferences) {
    const settings = this.getUserControlSettings(userId);
    settings.controlLevel = UserControlManager.CONTROL_LEVELS.MANUAL_ONLY;
    settings.manualOverrides = stylePreferences;
    
    this.adaptationSettings.set(userId, settings);
    this.userOverrides.set(userId, stylePreferences);

    console.log('🎛️ User set manual AI style:', stylePreferences);
  }

  /**
   * Transparency - explain why AI behaves certain way
   */
  explainAdaptation(userId, interactionProfile, hhc) {
    const settings = this.getUserControlSettings(userId);
    
    if (!settings.adaptationTransparency) {
      return null;
    }

    const explanations = [];

    // Explain tone choice
    if (hhc?.personality?.extraversion > 0.7) {
      explanations.push("I'm being enthusiastic because you seem to enjoy energetic conversations");
    } else if (hhc?.personality?.neuroticism > 0.6) {
      explanations.push("I'm using a calming tone because you prefer gentle, supportive communication");
    }

    // Explain verbosity
    if (hhc?.personality?.conscientiousness > 0.7) {
      explanations.push("I'm giving detailed responses because you appreciate thorough information");
    }

    // Explain empathy level
    if (hhc?.personality?.agreeableness > 0.7) {
      explanations.push("I'm being extra understanding because emotional support seems important to you");
    }

    return {
      adaptations: explanations,
      canAdjust: true,
      currentStyle: this.describeStyle(interactionProfile)
    };
  }

  /**
   * Style presets - quick user selection
   */
  static STYLE_PRESETS = {
    supportive_friend: {
      tone: 'warm_and_supportive',
      empathy_level: 'very_high',
      encouragement_style: 'gentle_positive',
      directness: 'gentle_and_kind'
    },
    professional_coach: {
      tone: 'confident_and_optimistic',
      directness: 'clear_and_organized',
      encouragement_style: 'challenge_oriented',
      formality: 'professional_warm'
    },
    casual_buddy: {
      tone: 'enthusiastic_and_energetic',
      formality: 'very_casual',
      humor_level: 'playful_and_social',
      directness: 'honest_and_straightforward'
    },
    therapist_style: {
      tone: 'therapeutic_and_gentle',
      empathy_level: 'therapeutic',
      validation_style: 'deeply_validating',
      question_frequency: 'careful_and_low'
    }
  };

  /**
   * Quick preset application
   */
  applyPreset(userId, presetName) {
    const preset = UserControlManager.STYLE_PRESETS[presetName];
    if (preset) {
      this.setManualStyle(userId, preset);
      return preset;
    }
    return null;
  }

  /**
   * Neutral/default profile for when adaptation is disabled
   */
  getNeutralProfile() {
    return {
      tone: 'warm_and_supportive',
      verbosity: 'balanced',
      empathy_level: 'high',
      directness: 'moderate',
      formality: 'casual_friendly',
      encouragement_style: 'gentle_positive',
      humor_level: 'light',
      validation_style: 'affirming'
    };
  }

  /**
   * Describe current AI style in user-friendly terms
   */
  describeStyle(profile) {
    const descriptions = {
      tone: {
        'enthusiastic_and_energetic': 'Upbeat and motivating',
        'calm_and_thoughtful': 'Reflective and peaceful',
        'therapeutic_and_gentle': 'Caring and therapeutic',
        'confident_and_optimistic': 'Confident and positive',
        'warm_and_supportive': 'Friendly and supportive'
      },
      verbosity: {
        'detailed_and_structured': 'Comprehensive and organized',
        'concise_and_clear': 'Brief and to the point',
        'balanced': 'Balanced detail level'
      },
      empathy_level: {
        'very_high': 'Deeply understanding',
        'high': 'Very caring',
        'therapeutic': 'Therapeutically supportive'
      }
    };

    return {
      tone: descriptions.tone[profile.tone] || 'Balanced',
      detail: descriptions.verbosity[profile.verbosity] || 'Balanced',
      empathy: descriptions.empathy_level[profile.empathy_level] || 'Caring'
    };
  }

  /**
   * User control UI data - what to show in settings
   */
  getUserControlUI(userId) {
    const settings = this.getUserControlSettings(userId);
    const currentOverrides = this.userOverrides.get(userId) || {};

    return {
      controlLevel: settings.controlLevel,
      presets: Object.keys(UserControlManager.STYLE_PRESETS),
      currentStyle: this.describeStyle(currentOverrides),
      availableControls: [
        { key: 'tone', label: 'Communication Tone', enabled: settings.allowedAdaptations.tone },
        { key: 'verbosity', label: 'Response Length', enabled: settings.allowedAdaptations.verbosity },
        { key: 'empathy', label: 'Emotional Support', enabled: settings.allowedAdaptations.empathy },
        { key: 'directness', label: 'Communication Style', enabled: settings.allowedAdaptations.directness },
        { key: 'humor', label: 'Humor Level', enabled: settings.allowedAdaptations.humor }
      ],
      feedbackEnabled: settings.feedbackEnabled,
      transparencyEnabled: settings.adaptationTransparency
    };
  }

  /**
   * Emergency reset - return to defaults
   */
  resetToDefaults(userId) {
    this.userOverrides.delete(userId);
    this.adaptationSettings.delete(userId);
    console.log('🔄 Reset user AI control settings to defaults');
  }
}

// Global instance
export const userControlManager = new UserControlManager();
export default UserControlManager;