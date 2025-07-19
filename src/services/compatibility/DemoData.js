/**
 * Demo Data for SoulAI Chat-Based Matchmaking System
 * 
 * Provides sample candidates and user profiles to demonstrate the
 * advanced compatibility system with HHC personality vectors and
 * Harmony Algorithm scoring.
 */

import { HHCPersonalityVector, HHC_DIMENSIONS } from './HHCPersonalitySystem.js';

/**
 * Create sample candidates with realistic personality profiles
 */
export function createSampleCandidates() {
  const candidates = [
    {
      id: 'candidate_001',
      name: 'Emma',
      age: 24,
      location: 'San Francisco, CA',
      photos: ['https://i.pravatar.cc/400?img=44'],
      bio: 'Artist and philosophy enthusiast who loves deep conversations about life, creativity, and personal growth. Always exploring new ways to express myself through art.',
      interests: ['art', 'philosophy', 'travel', 'reading', 'hiking'],
      values: ['authenticity', 'creativity', 'personal growth'],
      mbtiType: 'INFP',
      bigFive: {
        openness: 90,
        conscientiousness: 65,
        extraversion: 35,
        agreeableness: 85,
        neuroticism: 45
      },
      lifestyle: {
        activityLevel: 70,
        socialFrequency: 40,
        routinePreference: 30
      }
    },
    
    {
      id: 'candidate_002',
      name: 'Sophia',
      age: 26,
      location: 'Berkeley, CA',
      photos: ['https://i.pravatar.cc/400?img=47'],
      bio: 'Psychology student and weekend adventurer. I believe understanding ourselves and others is the key to meaningful relationships. Love analyzing what makes people tick!',
      interests: ['psychology', 'hiking', 'reading', 'cooking', 'meditation'],
      values: ['knowledge', 'empathy', 'balance'],
      mbtiType: 'INFJ',
      bigFive: {
        openness: 85,
        conscientiousness: 80,
        extraversion: 45,
        agreeableness: 90,
        neuroticism: 35
      },
      lifestyle: {
        activityLevel: 75,
        socialFrequency: 50,
        routinePreference: 70
      }
    },
    
    {
      id: 'candidate_003',
      name: 'Isabella',
      age: 23,
      location: 'Palo Alto, CA',
      photos: ['https://i.pravatar.cc/400?img=48'],
      bio: 'Writer with a passion for storytelling and human connection. I find magic in everyday moments and love crafting stories that bring people together over coffee.',
      interests: ['writing', 'literature', 'coffee', 'travel', 'photography'],
      values: ['creativity', 'storytelling', 'connection'],
      mbtiType: 'ENFP',
      bigFive: {
        openness: 95,
        conscientiousness: 60,
        extraversion: 75,
        agreeableness: 80,
        neuroticism: 40
      },
      lifestyle: {
        activityLevel: 65,
        socialFrequency: 80,
        routinePreference: 25
      }
    },
    
    {
      id: 'candidate_004',
      name: 'Maya',
      age: 27,
      location: 'San Jose, CA',
      photos: ['https://i.pravatar.cc/400?img=49'],
      bio: 'Tech entrepreneur by day, salsa dancer by night. Building innovative solutions while staying grounded in what truly matters: authentic connections and shared adventures.',
      interests: ['technology', 'dancing', 'entrepreneurship', 'travel', 'music'],
      values: ['innovation', 'passion', 'adventure'],
      mbtiType: 'ENTJ',
      bigFive: {
        openness: 80,
        conscientiousness: 90,
        extraversion: 85,
        agreeableness: 70,
        neuroticism: 25
      },
      lifestyle: {
        activityLevel: 90,
        socialFrequency: 85,
        routinePreference: 75
      }
    },
    
    {
      id: 'candidate_005',
      name: 'Zoe',
      age: 25,
      location: 'Mountain View, CA',
      photos: ['https://i.pravatar.cc/400?img=32'],
      bio: 'Mindful software engineer who codes with intention and lives with purpose. Passionate about creating technology that brings people closer together.',
      interests: ['programming', 'meditation', 'yoga', 'nature', 'minimalism'],
      values: ['mindfulness', 'purpose', 'balance'],
      mbtiType: 'ISTJ',
      bigFive: {
        openness: 70,
        conscientiousness: 95,
        extraversion: 30,
        agreeableness: 75,
        neuroticism: 20
      },
      lifestyle: {
        activityLevel: 60,
        socialFrequency: 35,
        routinePreference: 90
      }
    }
  ];

  // Convert each candidate to include HHC personality vector
  return candidates.map(candidate => ({
    ...candidate,
    hhcVector: createHHCFromProfile(candidate)
  }));
}

/**
 * Create HHC personality vector from profile data
 */
function createHHCFromProfile(profile) {
  const hhc = new HHCPersonalityVector();
  const adjustments = {};

  // Apply Big Five scores
  if (profile.bigFive) {
    adjustments[HHC_DIMENSIONS.OPENNESS] = profile.bigFive.openness / 100;
    adjustments[HHC_DIMENSIONS.CONSCIENTIOUSNESS] = profile.bigFive.conscientiousness / 100;
    adjustments[HHC_DIMENSIONS.EXTRAVERSION] = profile.bigFive.extraversion / 100;
    adjustments[HHC_DIMENSIONS.AGREEABLENESS] = profile.bigFive.agreeableness / 100;
    adjustments[HHC_DIMENSIONS.NEUROTICISM] = profile.bigFive.neuroticism / 100;
  }

  // Apply MBTI type influences
  if (profile.mbtiType) {
    const mbtiAdjustments = convertMBTIToHHC(profile.mbtiType);
    Object.assign(adjustments, mbtiAdjustments);
  }

  // Apply interests
  if (profile.interests) {
    const interestAdjustments = convertInterestsToHHC(profile.interests);
    Object.assign(adjustments, interestAdjustments);
  }

  // Apply values
  if (profile.values) {
    const valueAdjustments = convertValuesToHHC(profile.values);
    Object.assign(adjustments, valueAdjustments);
  }

  // Apply lifestyle preferences
  if (profile.lifestyle) {
    const lifestyleAdjustments = convertLifestyleToHHC(profile.lifestyle);
    Object.assign(adjustments, lifestyleAdjustments);
  }

  // Update the HHC vector
  hhc.updateDimensions(adjustments);
  
  return hhc;
}

/**
 * Convert MBTI type to HHC adjustments
 */
function convertMBTIToHHC(mbtiType) {
  const adjustments = {};
  
  // Cognitive function preferences
  if (mbtiType.includes('N')) {
    adjustments[HHC_DIMENSIONS.EXTRAVERTED_INTUITION] = 0.8;
    adjustments[HHC_DIMENSIONS.INTROVERTED_INTUITION] = 0.7;
  }
  if (mbtiType.includes('S')) {
    adjustments[HHC_DIMENSIONS.EXTRAVERTED_SENSING] = 0.8;
    adjustments[HHC_DIMENSIONS.INTROVERTED_SENSING] = 0.7;
  }
  if (mbtiType.includes('T')) {
    adjustments[HHC_DIMENSIONS.EXTRAVERTED_THINKING] = 0.8;
    adjustments[HHC_DIMENSIONS.LOGICAL_REASONING] = 0.9;
  }
  if (mbtiType.includes('F')) {
    adjustments[HHC_DIMENSIONS.EXTRAVERTED_FEELING] = 0.8;
    adjustments[HHC_DIMENSIONS.EMOTIONAL_EXPRESSION] = 0.8;
  }

  return adjustments;
}

/**
 * Convert interests to HHC adjustments
 */
function convertInterestsToHHC(interests) {
  const adjustments = {};
  const interestMapping = {
    'art': [HHC_DIMENSIONS.ARTS_CULTURE, 0.9],
    'philosophy': [HHC_DIMENSIONS.READING_LEARNING, 0.8],
    'travel': [HHC_DIMENSIONS.TRAVEL, 0.9],
    'hiking': [HHC_DIMENSIONS.NATURE_OUTDOORS, 0.8],
    'psychology': [HHC_DIMENSIONS.READING_LEARNING, 0.9],
    'reading': [HHC_DIMENSIONS.READING_LEARNING, 0.8],
    'cooking': [HHC_DIMENSIONS.COOKING_FOOD, 0.8],
    'meditation': [HHC_DIMENSIONS.SPIRITUALITY, 0.7],
    'writing': [HHC_DIMENSIONS.CREATIVITY, 0.9],
    'literature': [HHC_DIMENSIONS.ARTS_CULTURE, 0.8],
    'coffee': [HHC_DIMENSIONS.COOKING_FOOD, 0.6],
    'photography': [HHC_DIMENSIONS.ARTS_CULTURE, 0.7],
    'technology': [HHC_DIMENSIONS.TECHNOLOGY, 0.9],
    'dancing': [HHC_DIMENSIONS.ARTS_CULTURE, 0.8],
    'entrepreneurship': [HHC_DIMENSIONS.ACHIEVEMENT, 0.9],
    'music': [HHC_DIMENSIONS.MUSIC, 0.8],
    'programming': [HHC_DIMENSIONS.TECHNOLOGY, 0.9],
    'yoga': [HHC_DIMENSIONS.SPIRITUALITY, 0.6],
    'nature': [HHC_DIMENSIONS.NATURE_OUTDOORS, 0.8],
    'minimalism': [HHC_DIMENSIONS.INDEPENDENCE, 0.7]
  };

  for (const interest of interests) {
    const mapping = interestMapping[interest.toLowerCase()];
    if (mapping) {
      const [dimension, value] = mapping;
      adjustments[dimension] = value;
    }
  }

  return adjustments;
}

/**
 * Convert values to HHC adjustments
 */
function convertValuesToHHC(values) {
  const adjustments = {};
  const valueMapping = {
    'authenticity': [HHC_DIMENSIONS.AUTHENTICITY, 0.9],
    'creativity': [HHC_DIMENSIONS.CREATIVITY, 0.9],
    'personal growth': [HHC_DIMENSIONS.KNOWLEDGE, 0.8],
    'knowledge': [HHC_DIMENSIONS.KNOWLEDGE, 0.9],
    'empathy': [HHC_DIMENSIONS.EMPATHY, 0.9],
    'balance': [HHC_DIMENSIONS.SECURITY, 0.7],
    'storytelling': [HHC_DIMENSIONS.CREATIVITY, 0.8],
    'connection': [HHC_DIMENSIONS.SOCIAL_SKILLS, 0.8],
    'innovation': [HHC_DIMENSIONS.ACHIEVEMENT, 0.8],
    'passion': [HHC_DIMENSIONS.MOTIVATION, 0.9],
    'adventure': [HHC_DIMENSIONS.ADVENTURE, 0.9],
    'mindfulness': [HHC_DIMENSIONS.SELF_AWARENESS, 0.9],
    'purpose': [HHC_DIMENSIONS.MOTIVATION, 0.8]
  };

  for (const value of values) {
    const mapping = valueMapping[value.toLowerCase()];
    if (mapping) {
      const [dimension, valueScore] = mapping;
      adjustments[dimension] = valueScore;
    }
  }

  return adjustments;
}

/**
 * Convert lifestyle preferences to HHC adjustments
 */
function convertLifestyleToHHC(lifestyle) {
  const adjustments = {};

  if (lifestyle.activityLevel !== undefined) {
    adjustments[HHC_DIMENSIONS.ACTIVITY_LEVEL] = lifestyle.activityLevel / 100;
  }
  if (lifestyle.socialFrequency !== undefined) {
    adjustments[HHC_DIMENSIONS.SOCIAL_FREQUENCY] = lifestyle.socialFrequency / 100;
  }
  if (lifestyle.routinePreference !== undefined) {
    adjustments[HHC_DIMENSIONS.ROUTINE_PREFERENCE] = lifestyle.routinePreference / 100;
  }

  return adjustments;
}

/**
 * Sample conversation scenarios for testing
 */
export const SAMPLE_CONVERSATIONS = [
  {
    name: 'Positive Match Feedback',
    messages: [
      "I love that she's into philosophy and art! That's exactly what I'm looking for.",
      "She seems really thoughtful and creative. I'd love to know more about her artwork.",
      "This is great! Can you tell me more about her personality?"
    ]
  },
  {
    name: 'Mixed Feedback',
    messages: [
      "She seems nice, but I'm not sure about the hiking thing. I'm more of an indoor person.",
      "I like that she's introspective, but I prefer someone more outgoing.",
      "Can you find someone who shares my love of technology?"
    ]
  },
  {
    name: 'Negative Feedback',
    messages: [
      "Not really my type. Too artsy for me.",
      "I'm looking for someone more career-focused.",
      "Can you show me someone different? Maybe more into sports?"
    ]
  },
  {
    name: 'Questions and Curiosity',
    messages: [
      "Why do you think we're compatible?",
      "What kind of art does she do?",
      "How did you calculate that compatibility score?",
      "Tell me more about her personality type."
    ]
  }
];

/**
 * Initialize the matchmaking service with demo data
 */
export async function initializeDemoMatchmaking(matchmakingService) {
  // Add sample candidates to the system
  const candidates = createSampleCandidates();
  
  for (const candidate of candidates) {
    matchmakingService.recommendationEngine.addCandidate(candidate);
  }

  console.log('Demo matchmaking system initialized with', candidates.length, 'candidates');
  
  return {
    candidatesAdded: candidates.length,
    sampleProfiles: candidates.map(c => ({ id: c.id, name: c.name, age: c.age }))
  };
}