/**
 * InteractionStyler.js
 * 
 * Maps HHC (Human Hex Code) personality vectors to AI interaction styles.
 * This creates a personalized interaction profile that determines how SoulAI 
 * communicates with each user.
 */

export class InteractionStyler {
  
  /**
   * Creates an interaction profile from a user's HHC vector
   * @param {Object} hhc - Human Hex Code personality vector
   * @returns {Object} InteractionProfile - AI behavior directives
   */
  static createInteractionProfile(hhc) {
    // Default neutral profile for new users or fallback
    const profile = {
      tone: 'warm_and_supportive',
      verbosity: 'balanced',
      emotional_mirroring: 'medium',
      prompt_style: 'open_ended',
      formality: 'casual_friendly',
      risk_tolerance: 'moderate',
      detail_level: 'standard',
      empathy_level: 'high',
      directness: 'moderate',
      encouragement_style: 'gentle_positive',
      question_frequency: 'moderate',
      examples_usage: 'when_helpful',
      humor_level: 'light',
      validation_style: 'affirming'
    };

    if (!hhc || !hhc.personality) {
      console.log('No HHC data provided, using default interaction profile');
      return profile;
    }

    const { personality } = hhc;

    // === OPENNESS TO EXPERIENCE ===
    if (personality.openness > 0.75) {
      profile.tone = 'creative_and_exploratory';
      profile.prompt_style = 'inquisitive_and_imaginative';
      profile.humor_level = 'creative_and_witty';
      profile.examples_usage = 'rich_analogies';
    } else if (personality.openness < 0.3) {
      profile.prompt_style = 'practical_and_concrete';
      profile.examples_usage = 'real_world_examples';
      profile.detail_level = 'specific_and_clear';
    }

    // === CONSCIENTIOUSNESS ===
    if (personality.conscientiousness > 0.8) {
      profile.verbosity = 'detailed_and_structured';
      profile.detail_level = 'comprehensive';
      profile.formality = 'professional_warm';
      profile.directness = 'clear_and_organized';
    } else if (personality.conscientiousness < 0.3) {
      profile.verbosity = 'concise_and_flexible';
      profile.formality = 'very_casual';
      profile.prompt_style = 'go_with_flow';
    }

    // === EXTRAVERSION ===
    if (personality.extraversion > 0.7) {
      profile.tone = 'enthusiastic_and_energetic';
      profile.encouragement_style = 'highly_motivating';
      profile.question_frequency = 'high';
      profile.emotional_mirroring = 'high';
      profile.humor_level = 'playful_and_social';
    } else if (personality.extraversion < 0.3) {
      profile.tone = 'calm_and_thoughtful';
      profile.question_frequency = 'low';
      profile.encouragement_style = 'quiet_confidence';
      profile.verbosity = 'reflective';
    }

    // === AGREEABLENESS ===
    if (personality.agreeableness > 0.8) {
      profile.empathy_level = 'very_high';
      profile.validation_style = 'deeply_understanding';
      profile.directness = 'gentle_and_kind';
      profile.tone = 'nurturing_and_supportive';
    } else if (personality.agreeableness < 0.3) {
      profile.directness = 'honest_and_straightforward';
      profile.validation_style = 'realistic_feedback';
      profile.empathy_level = 'balanced';
    }

    // === NEUROTICISM ===
    if (personality.neuroticism > 0.7) {
      profile.tone = 'calming_and_reassuring';
      profile.empathy_level = 'very_high';
      profile.encouragement_style = 'gentle_and_patient';
      profile.risk_tolerance = 'very_low';
      profile.validation_style = 'stress_reducing';
    } else if (personality.neuroticism < 0.3) {
      profile.risk_tolerance = 'high';
      profile.encouragement_style = 'challenge_oriented';
      profile.tone = 'confident_and_optimistic';
    }

    // === PERSONALITY COMBINATIONS (Advanced Logic) ===
    
    // High Openness + High Conscientiousness = Creative but Organized
    if (personality.openness > 0.7 && personality.conscientiousness > 0.7) {
      profile.prompt_style = 'creative_yet_structured';
      profile.detail_level = 'comprehensive_with_examples';
    }

    // High Extraversion + High Agreeableness = Warm Social Coach
    if (personality.extraversion > 0.7 && personality.agreeableness > 0.7) {
      profile.tone = 'enthusiastic_cheerleader';
      profile.encouragement_style = 'highly_supportive';
      profile.emotional_mirroring = 'very_high';
    }

    // Low Neuroticism + High Conscientiousness = Confident Mentor
    if (personality.neuroticism < 0.3 && personality.conscientiousness > 0.7) {
      profile.encouragement_style = 'confident_guidance';
      profile.directness = 'clear_and_supportive';
      profile.risk_tolerance = 'calculated_risks';
    }

    // High Neuroticism + High Agreeableness = Gentle Therapy Style
    if (personality.neuroticism > 0.6 && personality.agreeableness > 0.7) {
      profile.tone = 'therapeutic_and_gentle';
      profile.validation_style = 'deeply_validating';
      profile.question_frequency = 'careful_and_low';
      profile.empathy_level = 'therapeutic';
    }

    return profile;
  }

  /**
   * Converts interaction profile to natural language description
   * Useful for debugging and user transparency
   */
  static describeProfile(profile) {
    return `AI Personality: ${profile.tone} tone, ${profile.verbosity} responses, ` +
           `${profile.empathy_level} empathy, ${profile.directness} communication style`;
  }

  /**
   * Creates system prompt instructions from interaction profile
   * This is what gets injected into the AI's context
   */
  static generateSystemPrompt(profile, userName = "user") {
    const instructions = [];

    // Tone instructions
    switch (profile.tone) {
      case 'creative_and_exploratory':
        instructions.push("Be imaginative, curious, and encourage creative thinking");
        break;
      case 'enthusiastic_and_energetic':
        instructions.push("Be upbeat, motivating, and match their social energy");
        break;
      case 'calm_and_thoughtful':
        instructions.push("Be reflective, gentle, and give them space to think");
        break;
      case 'nurturing_and_supportive':
        instructions.push("Be caring, understanding, and deeply supportive");
        break;
      case 'calming_and_reassuring':
        instructions.push("Be soothing, patient, and focus on reducing anxiety");
        break;
      case 'therapeutic_and_gentle':
        instructions.push("Use therapeutic communication, validate emotions deeply");
        break;
      case 'confident_and_optimistic':
        instructions.push("Be confident, encouraging, and focus on possibilities");
        break;
      case 'enthusiastic_cheerleader':
        instructions.push("Be their biggest supporter with high energy and warmth");
        break;
      default:
        instructions.push("Be warm, supportive, and genuinely helpful");
    }

    // Verbosity instructions
    switch (profile.verbosity) {
      case 'detailed_and_structured':
        instructions.push("Provide comprehensive, well-organized responses");
        break;
      case 'concise_and_flexible':
        instructions.push("Keep responses brief and adaptable");
        break;
      case 'reflective':
        instructions.push("Give thoughtful, contemplative responses");
        break;
      default:
        instructions.push("Balance detail with clarity");
    }

    // Directness instructions
    switch (profile.directness) {
      case 'clear_and_organized':
        instructions.push("Be direct but organize information clearly");
        break;
      case 'gentle_and_kind':
        instructions.push("Be soft in delivery while being helpful");
        break;
      case 'honest_and_straightforward':
        instructions.push("Be direct and honest, avoiding sugar-coating");
        break;
      case 'clear_and_supportive':
        instructions.push("Be clear and direct while remaining supportive");
        break;
      default:
        instructions.push("Balance honesty with kindness");
    }

    // Empathy level instructions
    switch (profile.empathy_level) {
      case 'very_high':
      case 'therapeutic':
        instructions.push("Show deep emotional understanding and validation");
        break;
      case 'high':
        instructions.push("Be emotionally attuned and compassionate");
        break;
      case 'balanced':
        instructions.push("Show appropriate emotional sensitivity");
        break;
    }

    return `You are SoulAI, an AI relationship coach and companion. For this conversation with ${userName}, adapt your personality as follows:

${instructions.map(instruction => `- ${instruction}`).join('\n')}

Always maintain your core purpose of helping with relationships, personal growth, and emotional well-being, but adjust your communication style to match these preferences.`;
  }

  /**
   * Cache key for storing interaction profiles
   */
  static getCacheKey(userId) {
    return `interaction_profile:${userId}`;
  }

  /**
   * Updates interaction profile based on user feedback
   * This allows the system to learn and adapt over time
   */
  static updateProfileFromFeedback(currentProfile, feedback) {
    const updatedProfile = { ...currentProfile };

    // Example feedback adaptations
    if (feedback.tooVerbose) {
      updatedProfile.verbosity = 'concise_and_flexible';
    }
    if (feedback.notEmpathetic) {
      updatedProfile.empathy_level = 'very_high';
    }
    if (feedback.tooFormal) {
      updatedProfile.formality = 'very_casual';
    }
    if (feedback.wantMoreEncouragement) {
      updatedProfile.encouragement_style = 'highly_motivating';
    }

    return updatedProfile;
  }
}

export default InteractionStyler;