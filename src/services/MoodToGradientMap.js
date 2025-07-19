// Mood to Gradient Mapping Service
// Maps emotional states to beautiful color gradients for the Mood Ring feature

export const MOOD_GRADIENTS = {
  // Positive/Uplifting Moods
  joyful: {
    name: 'Joyful',
    colors: ['#A522D2', '#E441F2', '#FC97FA'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    description: 'Bright, vibrant energy'
  },
  
  happy: {
    name: 'Happy',
    colors: ['#6816BA', '#A522D2', '#E441F2'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    description: 'Warm, cheerful vibes'
  },
  
  excited: {
    name: 'Excited',
    colors: ['#E441F2', '#FC97FA', '#FF6B9D'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    description: 'High energy, anticipation'
  },
  
  loving: {
    name: 'Loving',
    colors: ['#E441F2', '#FC97FA', '#FFB3E6'],
    locations: [0, 0.6, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    description: 'Warm, affectionate connection'
  },
  
  hopeful: {
    name: 'Hopeful',
    colors: ['#6816BA', '#A522D2', '#FC97FA'],
    locations: [0, 0.4, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    description: 'Optimistic, forward-looking'
  },
  
  grateful: {
    name: 'Grateful',
    colors: ['#8B5CF6', '#A855F7', '#C084FC'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    description: 'Appreciative, thankful'
  },
  
  confident: {
    name: 'Confident',
    colors: ['#7C3AED', '#A855F7', '#C084FC'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    description: 'Self-assured, empowered'
  },
  
  // Neutral/Balanced Moods
  calm: {
    name: 'Calm',
    colors: ['#11104E', '#0D1580', '#1E3A8A'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    description: 'Peaceful, serene state'
  },
  
  neutral: {
    name: 'Neutral',
    colors: ['#4C1D95', '#5B21B6', '#6B46C1'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    description: 'Balanced, steady'
  },
  
  content: {
    name: 'Content',
    colors: ['#6366F1', '#8B5CF6', '#A855F7'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    description: 'Satisfied, at peace'
  },
  
  thoughtful: {
    name: 'Thoughtful',
    colors: ['#312E81', '#4338CA', '#6366F1'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    description: 'Reflective, contemplative'
  },
  
  curious: {
    name: 'Curious',
    colors: ['#4338CA', '#6366F1', '#8B5CF6'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    description: 'Inquisitive, interested'
  },
  
  // Challenging/Difficult Moods
  anxious: {
    name: 'Anxious',
    colors: ['#0D1580', '#34117A', '#4C1D95'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    description: 'Worried, uncertain'
  },
  
  sad: {
    name: 'Sad',
    colors: ['#0D1580', '#18148E', '#312E81'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    description: 'Melancholy, down'
  },
  
  frustrated: {
    name: 'Frustrated',
    colors: ['#581C87', '#7C2D12', '#92400E'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    description: 'Irritated, blocked'
  },
  
  lonely: {
    name: 'Lonely',
    colors: ['#1E1B4B', '#312E81', '#4C1D95'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    description: 'Isolated, disconnected'
  },
  
  nervous: {
    name: 'Nervous',
    colors: ['#1E3A8A', '#3730A3', '#4338CA'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    description: 'Jittery, apprehensive'
  },
  
  overwhelmed: {
    name: 'Overwhelmed',
    colors: ['#1E1B4B', '#374151', '#4B5563'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    description: 'Too much, stressed'
  },
  
  // Romantic/Dating Specific Moods
  flirty: {
    name: 'Flirty',
    colors: ['#EC4899', '#F472B6', '#F9A8D4'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    description: 'Playful, romantic'
  },
  
  romantic: {
    name: 'Romantic',
    colors: ['#BE185D', '#EC4899', '#F472B6'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    description: 'Intimate, loving'
  },
  
  playful: {
    name: 'Playful',
    colors: ['#A855F7', '#C084FC', '#DDD6FE'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    description: 'Fun, lighthearted'
  },
  
  vulnerable: {
    name: 'Vulnerable',
    colors: ['#7C3AED', '#8B5CF6', '#A78BFA'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    description: 'Open, exposed'
  },
  
  passionate: {
    name: 'Passionate',
    colors: ['#7C2D12', '#DC2626', '#EF4444'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    description: 'Intense, fervent'
  },
  
  // Default/Fallback
  default: {
    name: 'Default',
    colors: ['#cbbaf1', '#e8bef3', '#B8E6FF', '#9eb7ec'], // Original cotton candy
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    description: 'Standard Soul gradient'
  }
};

// Mood categories for easier management
export const MOOD_CATEGORIES = {
  POSITIVE: ['joyful', 'happy', 'excited', 'loving', 'hopeful', 'grateful', 'confident'],
  NEUTRAL: ['calm', 'neutral', 'content', 'thoughtful', 'curious'],
  CHALLENGING: ['anxious', 'sad', 'frustrated', 'lonely', 'nervous', 'overwhelmed'],
  ROMANTIC: ['flirty', 'romantic', 'playful', 'vulnerable', 'passionate']
};

// Mood intensity levels (for future gradient variations)
export const MOOD_INTENSITY = {
  LOW: 0.3,
  MEDIUM: 0.6,
  HIGH: 1.0
};

// Helper functions
export const getMoodGradient = (mood) => {
  const normalizedMood = mood?.toLowerCase() || 'default';
  return MOOD_GRADIENTS[normalizedMood] || MOOD_GRADIENTS.default;
};

export const getMoodCategory = (mood) => {
  const normalizedMood = mood?.toLowerCase();
  
  for (const [category, moods] of Object.entries(MOOD_CATEGORIES)) {
    if (moods.includes(normalizedMood)) {
      return category;
    }
  }
  
  return 'NEUTRAL';
};

export const getAllMoods = () => {
  return Object.keys(MOOD_GRADIENTS).filter(mood => mood !== 'default');
};

export const getMoodsByCategory = (category) => {
  return MOOD_CATEGORIES[category] || [];
};

// Mood transition weights for smooth gradient changes
export const getMoodTransitionWeight = (fromMood, toMood) => {
  const fromCategory = getMoodCategory(fromMood);
  const toCategory = getMoodCategory(toMood);
  
  // Same category = smooth transition
  if (fromCategory === toCategory) return 1.0;
  
  // Opposite categories = slower transition
  if (
    (fromCategory === 'POSITIVE' && toCategory === 'CHALLENGING') ||
    (fromCategory === 'CHALLENGING' && toCategory === 'POSITIVE')
  ) {
    return 0.3;
  }
  
  // Default transition speed
  return 0.6;
};

// Mood confidence thresholds for gradient application
export const MOOD_CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,    // Apply gradient immediately
  MEDIUM: 0.6,  // Apply gradient with slight delay
  LOW: 0.4      // Only apply if consistent across multiple messages
};

export default MOOD_GRADIENTS;