/**
 * personalityDemo.js
 * 
 * Demo personality configurations for testing HHC-based AI adaptation
 * These demonstrate how different personality types result in different AI interaction styles
 */

import { HHCPersonalitySystem } from '../services/compatibility/HHCPersonalitySystem';

export const DEMO_PERSONALITIES = {
  // Enthusiastic Extrovert - High E, High O, High A
  enthusiastic_extrovert: {
    id: 'demo_enthusiastic',
    name: 'Enthusiastic Emma',
    hhc: {
      personality: {
        openness: 0.85,           // Very creative and adventurous
        conscientiousness: 0.60,  // Moderately organized
        extraversion: 0.90,       // Very social and energetic
        agreeableness: 0.80,      // Very caring and supportive
        neuroticism: 0.25         // Very calm and optimistic
      },
      values: {
        adventure: 0.90,
        creativity: 0.85,
        social_connection: 0.95,
        achievement: 0.70
      },
      communication: {
        directness: 0.30,         // Gentle and encouraging
        emotional_expression: 0.90, // Very expressive
        humor_usage: 0.85,        // Uses lots of humor
        formality: 0.20           // Very casual
      }
    },
    expectedAIStyle: {
      tone: 'enthusiastic_cheerleader',
      verbosity: 'balanced',
      encouragement_style: 'highly_motivating',
      humor_level: 'playful_and_social'
    }
  },

  // Thoughtful Introvert - Low E, High C, High O
  thoughtful_introvert: {
    id: 'demo_thoughtful',
    name: 'Thoughtful Thomas',
    hhc: {
      personality: {
        openness: 0.75,           // Creative and philosophical
        conscientiousness: 0.85,  // Very organized and detailed
        extraversion: 0.25,       // Introverted and reflective
        agreeableness: 0.70,      // Caring but reserved
        neuroticism: 0.45         // Moderately sensitive
      },
      values: {
        knowledge: 0.90,
        creativity: 0.80,
        independence: 0.75,
        achievement: 0.85
      },
      communication: {
        directness: 0.70,         // Appreciates clarity
        emotional_expression: 0.40, // More reserved
        humor_usage: 0.30,        // Subtle humor
        formality: 0.60           // Somewhat formal
      }
    },
    expectedAIStyle: {
      tone: 'calm_and_thoughtful',
      verbosity: 'detailed_and_structured',
      detail_level: 'comprehensive',
      question_frequency: 'low'
    }
  },

  // Anxious Helper - High N, High A, High C
  anxious_helper: {
    id: 'demo_anxious',
    name: 'Caring Casey',
    hhc: {
      personality: {
        openness: 0.55,           // Moderately open
        conscientiousness: 0.80,  // Very organized (for control)
        extraversion: 0.40,       // Somewhat introverted
        agreeableness: 0.90,      // Extremely caring
        neuroticism: 0.75         // High anxiety and sensitivity
      },
      values: {
        security: 0.90,
        helping_others: 0.95,
        harmony: 0.85,
        achievement: 0.65
      },
      communication: {
        directness: 0.20,         // Very gentle approach
        emotional_expression: 0.70, // Emotionally aware
        humor_usage: 0.40,        // Light, comforting humor
        formality: 0.50           // Balanced formality
      }
    },
    expectedAIStyle: {
      tone: 'therapeutic_and_gentle',
      empathy_level: 'therapeutic',
      validation_style: 'deeply_validating',
      risk_tolerance: 'very_low'
    }
  },

  // Confident Achiever - Low N, High C, Low A
  confident_achiever: {
    id: 'demo_confident',
    name: 'Confident Chris',
    hhc: {
      personality: {
        openness: 0.60,           // Moderately creative
        conscientiousness: 0.90,  // Extremely organized
        extraversion: 0.70,       // Quite social
        agreeableness: 0.35,      // More competitive than cooperative
        neuroticism: 0.15         // Very calm and confident
      },
      values: {
        achievement: 0.95,
        independence: 0.85,
        efficiency: 0.90,
        leadership: 0.80
      },
      communication: {
        directness: 0.90,         // Very direct and honest
        emotional_expression: 0.50, // Moderate emotion
        humor_usage: 0.60,        // Confident humor
        formality: 0.70           // Professional but warm
      }
    },
    expectedAIStyle: {
      tone: 'confident_and_optimistic',
      directness: 'clear_and_organized',
      encouragement_style: 'challenge_oriented',
      risk_tolerance: 'calculated_risks'
    }
  },

  // Creative Free Spirit - High O, Low C, High E
  creative_spirit: {
    id: 'demo_creative',
    name: 'Creative Cosmos',
    hhc: {
      personality: {
        openness: 0.95,           // Extremely creative and open
        conscientiousness: 0.30,  // Very flexible and spontaneous
        extraversion: 0.75,       // Social and energetic
        agreeableness: 0.65,      // Generally friendly
        neuroticism: 0.50         // Balanced emotional stability
      },
      values: {
        creativity: 0.95,
        adventure: 0.90,
        freedom: 0.85,
        authenticity: 0.80
      },
      communication: {
        directness: 0.40,         // Meandering, creative expression
        emotional_expression: 0.85, // Very expressive
        humor_usage: 0.90,        // Creative, witty humor
        formality: 0.10           // Very casual and free-flowing
      }
    },
    expectedAIStyle: {
      tone: 'creative_and_exploratory',
      prompt_style: 'inquisitive_and_imaginative',
      verbosity: 'concise_and_flexible',
      examples_usage: 'rich_analogies'
    }
  }
};

/**
 * Get demo personality by type
 */
export function getDemoPersonality(type) {
  return DEMO_PERSONALITIES[type] || DEMO_PERSONALITIES.enthusiastic_extrovert;
}

/**
 * Get random demo personality for testing
 */
export function getRandomDemoPersonality() {
  const types = Object.keys(DEMO_PERSONALITIES);
  const randomType = types[Math.floor(Math.random() * types.length)];
  return DEMO_PERSONALITIES[randomType];
}

/**
 * Generate personality comparison for testing
 */
export function generatePersonalityComparison() {
  return {
    user: getRandomDemoPersonality(),
    candidates: [
      getDemoPersonality('thoughtful_introvert'),
      getDemoPersonality('creative_spirit'),
      getDemoPersonality('confident_achiever')
    ]
  };
}

/**
 * Demo personality switching for testing UI
 */
export class PersonalityTester {
  constructor() {
    this.currentPersonality = 'enthusiastic_extrovert';
  }

  switchPersonality(type) {
    if (DEMO_PERSONALITIES[type]) {
      this.currentPersonality = type;
      console.log(`🎭 Switched to ${type} personality:`, DEMO_PERSONALITIES[type].name);
      return DEMO_PERSONALITIES[type];
    }
    return this.getCurrentPersonality();
  }

  getCurrentPersonality() {
    return DEMO_PERSONALITIES[this.currentPersonality];
  }

  getAvailableTypes() {
    return Object.keys(DEMO_PERSONALITIES);
  }

  describeCurrentPersonality() {
    const personality = this.getCurrentPersonality();
    const p = personality.hhc.personality;
    
    return {
      name: personality.name,
      traits: [
        `${Math.round(p.openness * 100)}% Openness`,
        `${Math.round(p.conscientiousness * 100)}% Conscientiousness`, 
        `${Math.round(p.extraversion * 100)}% Extraversion`,
        `${Math.round(p.agreeableness * 100)}% Agreeableness`,
        `${Math.round((1 - p.neuroticism) * 100)}% Emotional Stability`
      ],
      expectedStyle: personality.expectedAIStyle
    };
  }
}

// Global instance for easy testing
export const personalityTester = new PersonalityTester();

export default DEMO_PERSONALITIES;