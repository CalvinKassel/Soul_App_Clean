/**
 * Human Hex Code (HHC) Personality System
 * 
 * Models personality as a high-dimensional hexadecimal vector where each dimension
 * represents specific personality traits, values, and behavioral patterns.
 * This system enables precise compatibility calculations and dynamic adaptation.
 */

// Core personality dimensions in the HHC system
export const HHC_DIMENSIONS = {
  // Big Five personality traits (00-1F)
  OPENNESS: 0x00,
  CONSCIENTIOUSNESS: 0x01,
  EXTRAVERSION: 0x02,
  AGREEABLENESS: 0x03,
  NEUROTICISM: 0x04,
  
  // Myers-Briggs functions (20-3F)
  INTROVERTED_THINKING: 0x20,
  EXTRAVERTED_THINKING: 0x21,
  INTROVERTED_FEELING: 0x22,
  EXTRAVERTED_FEELING: 0x23,
  INTROVERTED_SENSING: 0x24,
  EXTRAVERTED_SENSING: 0x25,
  INTROVERTED_INTUITION: 0x26,
  EXTRAVERTED_INTUITION: 0x27,
  
  // Core values (40-5F)
  AUTHENTICITY: 0x40,
  ACHIEVEMENT: 0x41,
  SECURITY: 0x42,
  ADVENTURE: 0x43,
  SPIRITUALITY: 0x44,
  FAMILY: 0x45,
  CREATIVITY: 0x46,
  KNOWLEDGE: 0x47,
  SOCIAL_JUSTICE: 0x48,
  INDEPENDENCE: 0x49,
  
  // Communication styles (60-7F)
  DIRECT_COMMUNICATION: 0x60,
  DIPLOMATIC_COMMUNICATION: 0x61,
  EMOTIONAL_EXPRESSION: 0x62,
  LOGICAL_REASONING: 0x63,
  STORYTELLING: 0x64,
  HUMOR_USAGE: 0x65,
  
  // Relationship preferences (80-9F)
  COMMITMENT_LEVEL: 0x80,
  INTIMACY_PACE: 0x81,
  CONFLICT_RESOLUTION: 0x82,
  SHARED_ACTIVITIES: 0x83,
  PERSONAL_SPACE: 0x84,
  EMOTIONAL_SUPPORT: 0x85,
  
  // Lifestyle patterns (A0-BF)
  ACTIVITY_LEVEL: 0xA0,
  SOCIAL_FREQUENCY: 0xA1,
  ROUTINE_PREFERENCE: 0xA2,
  RISK_TOLERANCE: 0xA3,
  LEARNING_STYLE: 0xA4,
  DECISION_MAKING: 0xA5,
  
  // Interests and hobbies (C0-DF)
  ARTS_CULTURE: 0xC0,
  SPORTS_FITNESS: 0xC1,
  TECHNOLOGY: 0xC2,
  NATURE_OUTDOORS: 0xC3,
  TRAVEL: 0xC4,
  READING_LEARNING: 0xC5,
  MUSIC: 0xC6,
  COOKING_FOOD: 0xC7,
  
  // Emotional intelligence (E0-FF)
  SELF_AWARENESS: 0xE0,
  SELF_REGULATION: 0xE1,
  EMPATHY: 0xE2,
  SOCIAL_SKILLS: 0xE3,
  MOTIVATION: 0xE4,
  EMOTIONAL_RESILIENCE: 0xE5
};

export class HHCPersonalityVector {
  constructor(initialVector = null) {
    // Initialize 256-dimensional personality vector (0x00 to 0xFF)
    this.vector = new Float32Array(256);
    
    if (initialVector) {
      this.loadFromVector(initialVector);
    } else {
      this.initializeDefault();
    }
    
    this.lastUpdated = Date.now();
    this.updateCount = 0;
  }

  /**
   * Initialize with neutral/default personality values
   */
  initializeDefault() {
    // Set all dimensions to neutral (0.5) initially
    for (let i = 0; i < 256; i++) {
      this.vector[i] = 0.5;
    }
  }

  /**
   * Load personality vector from existing data
   */
  loadFromVector(data) {
    if (data.length !== 256) {
      throw new Error('HHC personality vector must have exactly 256 dimensions');
    }
    
    for (let i = 0; i < 256; i++) {
      this.vector[i] = Math.max(0, Math.min(1, data[i])); // Clamp to [0,1]
    }
  }

  /**
   * Get value for a specific personality dimension
   */
  getDimension(dimension) {
    if (dimension < 0 || dimension > 255) {
      throw new Error('Dimension must be between 0x00 and 0xFF');
    }
    return this.vector[dimension];
  }

  /**
   * Set value for a specific personality dimension
   */
  setDimension(dimension, value) {
    if (dimension < 0 || dimension > 255) {
      throw new Error('Dimension must be between 0x00 and 0xFF');
    }
    
    this.vector[dimension] = Math.max(0, Math.min(1, value)); // Clamp to [0,1]
    this.lastUpdated = Date.now();
    this.updateCount++;
  }

  /**
   * Update multiple dimensions at once
   */
  updateDimensions(updates) {
    for (const [dimension, value] of Object.entries(updates)) {
      this.setDimension(parseInt(dimension), value);
    }
  }

  /**
   * Calculate Euclidean distance between two personality vectors
   */
  calculateDistance(otherVector) {
    let distance = 0;
    for (let i = 0; i < 256; i++) {
      const diff = this.vector[i] - otherVector.vector[i];
      distance += diff * diff;
    }
    return Math.sqrt(distance);
  }

  /**
   * Calculate cosine similarity between two personality vectors
   */
  calculateCosineSimilarity(otherVector) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < 256; i++) {
      dotProduct += this.vector[i] * otherVector.vector[i];
      normA += this.vector[i] * this.vector[i];
      normB += otherVector.vector[i] * otherVector.vector[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Get dimensional compatibility score for specific trait categories
   */
  getCategoryCompatibility(otherVector, category) {
    const categoryRanges = {
      bigFive: [0x00, 0x1F],
      myersBriggs: [0x20, 0x3F],
      values: [0x40, 0x5F],
      communication: [0x60, 0x7F],
      relationship: [0x80, 0x9F],
      lifestyle: [0xA0, 0xBF],
      interests: [0xC0, 0xDF],
      emotional: [0xE0, 0xFF]
    };

    const [start, end] = categoryRanges[category];
    if (!start && start !== 0) return 0;

    let similarity = 0;
    let count = 0;
    
    for (let i = start; i <= end; i++) {
      const diff = Math.abs(this.vector[i] - otherVector.vector[i]);
      similarity += 1 - diff; // Convert difference to similarity
      count++;
    }
    
    return similarity / count;
  }

  /**
   * Convert personality vector to hexadecimal string representation
   */
  toHexString() {
    const hexValues = [];
    for (let i = 0; i < 256; i++) {
      const hexValue = Math.round(this.vector[i] * 255).toString(16).padStart(2, '0');
      hexValues.push(hexValue);
    }
    return hexValues.join('');
  }

  /**
   * Load personality vector from hexadecimal string
   */
  fromHexString(hexString) {
    if (hexString.length !== 512) { // 256 dimensions * 2 hex chars each
      throw new Error('Hex string must be exactly 512 characters (256 dimensions)');
    }

    for (let i = 0; i < 256; i++) {
      const hexValue = hexString.substr(i * 2, 2);
      this.vector[i] = parseInt(hexValue, 16) / 255;
    }
    
    this.lastUpdated = Date.now();
  }

  /**
   * Get human-readable personality summary
   */
  getPersonalitySummary() {
    const summary = {};
    
    // Big Five
    summary.bigFive = {
      openness: this.getDimension(HHC_DIMENSIONS.OPENNESS),
      conscientiousness: this.getDimension(HHC_DIMENSIONS.CONSCIENTIOUSNESS),
      extraversion: this.getDimension(HHC_DIMENSIONS.EXTRAVERSION),
      agreeableness: this.getDimension(HHC_DIMENSIONS.AGREEABLENESS),
      neuroticism: this.getDimension(HHC_DIMENSIONS.NEUROTICISM)
    };

    // Core values (top 3)
    const values = [];
    for (let i = 0x40; i <= 0x5F; i++) {
      values.push({ dimension: i, value: this.vector[i] });
    }
    values.sort((a, b) => b.value - a.value);
    summary.topValues = values.slice(0, 3);

    // Communication style
    summary.communication = {
      directness: this.getDimension(HHC_DIMENSIONS.DIRECT_COMMUNICATION),
      emotionalExpression: this.getDimension(HHC_DIMENSIONS.EMOTIONAL_EXPRESSION),
      humor: this.getDimension(HHC_DIMENSIONS.HUMOR_USAGE)
    };

    return summary;
  }

  /**
   * Clone the personality vector
   */
  clone() {
    const cloned = new HHCPersonalityVector();
    cloned.loadFromVector(this.vector);
    return cloned;
  }

  /**
   * Export to JSON for storage
   */
  toJSON() {
    return {
      vector: Array.from(this.vector),
      lastUpdated: this.lastUpdated,
      updateCount: this.updateCount,
      hexCode: this.toHexString()
    };
  }

  /**
   * Import from JSON
   */
  static fromJSON(data) {
    const hhc = new HHCPersonalityVector();
    hhc.loadFromVector(data.vector);
    hhc.lastUpdated = data.lastUpdated || Date.now();
    hhc.updateCount = data.updateCount || 0;
    return hhc;
  }
}

/**
 * Utility functions for HHC system
 */
export class HHCUtils {
  /**
   * Convert MBTI type to HHC vector adjustments
   */
  static mbtiToHHC(mbtiType) {
    const adjustments = {};
    
    // Map MBTI preferences to HHC dimensions
    if (mbtiType.includes('E')) adjustments[HHC_DIMENSIONS.EXTRAVERSION] = 0.8;
    if (mbtiType.includes('I')) adjustments[HHC_DIMENSIONS.EXTRAVERSION] = 0.2;
    if (mbtiType.includes('S')) adjustments[HHC_DIMENSIONS.EXTRAVERTED_SENSING] = 0.8;
    if (mbtiType.includes('N')) adjustments[HHC_DIMENSIONS.EXTRAVERTED_INTUITION] = 0.8;
    if (mbtiType.includes('T')) adjustments[HHC_DIMENSIONS.EXTRAVERTED_THINKING] = 0.8;
    if (mbtiType.includes('F')) adjustments[HHC_DIMENSIONS.EXTRAVERTED_FEELING] = 0.8;
    if (mbtiType.includes('J')) adjustments[HHC_DIMENSIONS.CONSCIENTIOUSNESS] = 0.8;
    if (mbtiType.includes('P')) adjustments[HHC_DIMENSIONS.OPENNESS] = 0.8;
    
    return adjustments;
  }

  /**
   * Convert Big Five scores to HHC adjustments
   */
  static bigFiveToHHC(bigFiveScores) {
    return {
      [HHC_DIMENSIONS.OPENNESS]: bigFiveScores.openness / 100,
      [HHC_DIMENSIONS.CONSCIENTIOUSNESS]: bigFiveScores.conscientiousness / 100,
      [HHC_DIMENSIONS.EXTRAVERSION]: bigFiveScores.extraversion / 100,
      [HHC_DIMENSIONS.AGREEABLENESS]: bigFiveScores.agreeableness / 100,
      [HHC_DIMENSIONS.NEUROTICISM]: bigFiveScores.neuroticism / 100
    };
  }

  /**
   * Generate personality insights from HHC vector
   */
  static generateInsights(hhcVector) {
    const insights = [];
    const summary = hhcVector.getPersonalitySummary();

    // Analyze Big Five
    if (summary.bigFive.extraversion > 0.7) {
      insights.push("Highly social and energetic personality");
    } else if (summary.bigFive.extraversion < 0.3) {
      insights.push("Prefers quiet, intimate settings");
    }

    if (summary.bigFive.openness > 0.7) {
      insights.push("Loves new experiences and creative thinking");
    }

    if (summary.bigFive.conscientiousness > 0.7) {
      insights.push("Highly organized and goal-oriented");
    }

    // Analyze communication style
    if (summary.communication.directness > 0.7) {
      insights.push("Values honest, straightforward communication");
    }

    if (summary.communication.humor > 0.7) {
      insights.push("Uses humor to connect with others");
    }

    return insights;
  }
}