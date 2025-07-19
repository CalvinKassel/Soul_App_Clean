/**
 * Harmony Algorithm for Advanced Compatibility Scoring
 * 
 * Implements a sophisticated compatibility engine that balances attraction and repulsion
 * forces across multiple personality dimensions, using dynamic weighting and learning
 * from user feedback to continuously improve matching accuracy.
 */

import { HHCPersonalityVector, HHC_DIMENSIONS } from './HHCPersonalitySystem.js';

/**
 * Force types in the Harmony Algorithm
 */
export const FORCE_TYPES = {
  ATTRACTION: 'attraction',
  REPULSION: 'repulsion',
  NEUTRAL: 'neutral'
};

/**
 * Compatibility factors with their base weights
 */
export const COMPATIBILITY_FACTORS = {
  // Core personality alignment (30%)
  PERSONALITY_MATCH: { weight: 0.30, type: FORCE_TYPES.ATTRACTION },
  
  // Values compatibility (25%)
  VALUES_ALIGNMENT: { weight: 0.25, type: FORCE_TYPES.ATTRACTION },
  
  // Communication style harmony (20%)
  COMMUNICATION_SYNC: { weight: 0.20, type: FORCE_TYPES.ATTRACTION },
  
  // Lifestyle compatibility (15%)
  LIFESTYLE_MATCH: { weight: 0.15, type: FORCE_TYPES.ATTRACTION },
  
  // Complementary differences (10%)
  HEALTHY_DIFFERENCES: { weight: 0.10, type: FORCE_TYPES.ATTRACTION },
  
  // Red flags and incompatibilities (-20% to -50%)
  MAJOR_CONFLICTS: { weight: -0.50, type: FORCE_TYPES.REPULSION },
  COMMUNICATION_BARRIERS: { weight: -0.30, type: FORCE_TYPES.REPULSION },
  LIFESTYLE_CONFLICTS: { weight: -0.20, type: FORCE_TYPES.REPULSION }
};

export class HarmonyAlgorithm {
  constructor() {
    this.weights = { ...COMPATIBILITY_FACTORS };
    this.learningRate = 0.1;
    this.feedbackHistory = [];
    this.personalizedWeights = new Map(); // User-specific weight adjustments
  }

  /**
   * Calculate comprehensive compatibility score between two users
   */
  calculateCompatibility(userA_HHC, userB_HHC, userA_id = null, feedbackContext = null) {
    const scores = {
      overall: 0,
      breakdown: {},
      forces: {
        attraction: 0,
        repulsion: 0,
        net: 0
      },
      confidence: 0.8, // Base confidence
      factors: []
    };

    // Get user-specific weights if available
    const weights = this.getPersonalizedWeights(userA_id);

    // Calculate individual compatibility factors
    scores.breakdown.personalityMatch = this.calculatePersonalityMatch(userA_HHC, userB_HHC);
    scores.breakdown.valuesAlignment = this.calculateValuesAlignment(userA_HHC, userB_HHC);
    scores.breakdown.communicationSync = this.calculateCommunicationSync(userA_HHC, userB_HHC);
    scores.breakdown.lifestyleMatch = this.calculateLifestyleMatch(userA_HHC, userB_HHC);
    scores.breakdown.healthyDifferences = this.calculateHealthyDifferences(userA_HHC, userB_HHC);
    
    // Calculate potential conflicts (repulsion forces)
    scores.breakdown.majorConflicts = this.calculateMajorConflicts(userA_HHC, userB_HHC);
    scores.breakdown.communicationBarriers = this.calculateCommunicationBarriers(userA_HHC, userB_HHC);
    scores.breakdown.lifestyleConflicts = this.calculateLifestyleConflicts(userA_HHC, userB_HHC);

    // Apply Harmony Algorithm with force balancing
    let attractionForce = 0;
    let repulsionForce = 0;

    // Attraction forces
    attractionForce += scores.breakdown.personalityMatch * weights.PERSONALITY_MATCH.weight;
    attractionForce += scores.breakdown.valuesAlignment * weights.VALUES_ALIGNMENT.weight;
    attractionForce += scores.breakdown.communicationSync * weights.COMMUNICATION_SYNC.weight;
    attractionForce += scores.breakdown.lifestyleMatch * weights.LIFESTYLE_MATCH.weight;
    attractionForce += scores.breakdown.healthyDifferences * weights.HEALTHY_DIFFERENCES.weight;

    // Repulsion forces (these reduce overall compatibility)
    repulsionForce += scores.breakdown.majorConflicts * Math.abs(weights.MAJOR_CONFLICTS.weight);
    repulsionForce += scores.breakdown.communicationBarriers * Math.abs(weights.COMMUNICATION_BARRIERS.weight);
    repulsionForce += scores.breakdown.lifestyleConflicts * Math.abs(weights.LIFESTYLE_CONFLICTS.weight);

    scores.forces.attraction = attractionForce;
    scores.forces.repulsion = repulsionForce;
    scores.forces.net = attractionForce - repulsionForce;

    // Calculate overall score using Harmony equation
    scores.overall = this.harmonyEquation(attractionForce, repulsionForce);

    // Adjust confidence based on data quality and consistency
    scores.confidence = this.calculateConfidence(scores.breakdown, userA_HHC, userB_HHC);

    // Generate detailed factors for explanation
    scores.factors = this.generateCompatibilityFactors(scores.breakdown, weights);

    return scores;
  }

  /**
   * Core Harmony equation balancing attraction and repulsion forces
   */
  harmonyEquation(attraction, repulsion) {
    // Harmony = (Attraction^1.2) / (1 + Repulsion^1.5)
    // This gives more weight to strong attractions while heavily penalizing conflicts
    const harmonicAttraction = Math.pow(Math.max(0, attraction), 1.2);
    const harmonicRepulsion = Math.pow(Math.max(0, repulsion), 1.5);
    
    const harmony = harmonicAttraction / (1 + harmonicRepulsion);
    
    // Normalize to 0-1 scale and apply sigmoid for natural curve
    return this.sigmoid(harmony * 2 - 1);
  }

  /**
   * Sigmoid activation function for smooth compatibility curves
   */
  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  /**
   * Calculate personality match using Big Five and cognitive functions
   */
  calculatePersonalityMatch(hhcA, hhcB) {
    const bigFiveMatch = hhcA.getCategoryCompatibility(hhcB, 'bigFive');
    const mbMatch = hhcA.getCategoryCompatibility(hhcB, 'myersBriggs');
    
    // Weight Big Five more heavily as it's more scientifically validated
    return (bigFiveMatch * 0.7) + (mbMatch * 0.3);
  }

  /**
   * Calculate values alignment
   */
  calculateValuesAlignment(hhcA, hhcB) {
    return hhcA.getCategoryCompatibility(hhcB, 'values');
  }

  /**
   * Calculate communication style synchronization
   */
  calculateCommunicationSync(hhcA, hhcB) {
    return hhcA.getCategoryCompatibility(hhcB, 'communication');
  }

  /**
   * Calculate lifestyle compatibility
   */
  calculateLifestyleMatch(hhcA, hhcB) {
    return hhcA.getCategoryCompatibility(hhcB, 'lifestyle');
  }

  /**
   * Calculate healthy differences that create attraction
   */
  calculateHealthyDifferences(hhcA, hhcB) {
    // Some differences are attractive (complementary traits)
    const complementaryPairs = [
      [HHC_DIMENSIONS.EXTRAVERSION, HHC_DIMENSIONS.EXTRAVERSION], // Moderate difference is good
      [HHC_DIMENSIONS.ROUTINE_PREFERENCE, HHC_DIMENSIONS.ROUTINE_PREFERENCE], // Balance structure with spontaneity
      [HHC_DIMENSIONS.DECISION_MAKING, HHC_DIMENSIONS.DECISION_MAKING] // Different approaches can complement
    ];

    let complementarity = 0;
    let count = 0;

    for (const [dimA, dimB] of complementaryPairs) {
      const diff = Math.abs(hhcA.getDimension(dimA) - hhcB.getDimension(dimB));
      // Sweet spot: moderate differences (0.2-0.5) are attractive
      if (diff >= 0.2 && diff <= 0.5) {
        complementarity += diff * 2; // Bonus for healthy differences
      } else if (diff > 0.5) {
        complementarity -= (diff - 0.5); // Penalty for too much difference
      }
      count++;
    }

    return Math.max(0, complementarity / count);
  }

  /**
   * Detect major personality conflicts
   */
  calculateMajorConflicts(hhcA, hhcB) {
    let conflicts = 0;
    
    // Critical incompatibilities
    const criticalDimensions = [
      HHC_DIMENSIONS.COMMITMENT_LEVEL,
      HHC_DIMENSIONS.FAMILY,
      HHC_DIMENSIONS.SPIRITUALITY,
      HHC_DIMENSIONS.SOCIAL_JUSTICE
    ];

    for (const dim of criticalDimensions) {
      const diff = Math.abs(hhcA.getDimension(dim) - hhcB.getDimension(dim));
      if (diff > 0.7) { // Major disagreement on important values
        conflicts += diff;
      }
    }

    return Math.min(1.0, conflicts / criticalDimensions.length);
  }

  /**
   * Detect communication barriers
   */
  calculateCommunicationBarriers(hhcA, hhcB) {
    // Check for incompatible communication styles
    const directnessA = hhcA.getDimension(HHC_DIMENSIONS.DIRECT_COMMUNICATION);
    const directnessB = hhcB.getDimension(HHC_DIMENSIONS.DIRECT_COMMUNICATION);
    const emotionalA = hhcA.getDimension(HHC_DIMENSIONS.EMOTIONAL_EXPRESSION);
    const emotionalB = hhcB.getDimension(HHC_DIMENSIONS.EMOTIONAL_EXPRESSION);
    
    let barriers = 0;
    
    // Extreme differences in directness can cause issues
    if (Math.abs(directnessA - directnessB) > 0.6) {
      barriers += 0.5;
    }
    
    // Very different emotional expression levels
    if (Math.abs(emotionalA - emotionalB) > 0.7) {
      barriers += 0.3;
    }
    
    return Math.min(1.0, barriers);
  }

  /**
   * Calculate lifestyle conflicts
   */
  calculateLifestyleConflicts(hhcA, hhcB) {
    const lifestyleCompatibility = hhcA.getCategoryCompatibility(hhcB, 'lifestyle');
    // Convert compatibility to conflict (inverse relationship)
    return 1.0 - lifestyleCompatibility;
  }

  /**
   * Calculate confidence in the compatibility score
   */
  calculateConfidence(breakdown, hhcA, hhcB) {
    let confidence = 0.8; // Base confidence
    
    // Reduce confidence if personality vectors are not well-developed
    if (hhcA.updateCount < 10) confidence -= 0.2;
    if (hhcB.updateCount < 10) confidence -= 0.2;
    
    // Increase confidence if scores are consistent across categories
    const scores = Object.values(breakdown);
    const variance = this.calculateVariance(scores);
    if (variance < 0.1) confidence += 0.1;
    
    return Math.max(0.3, Math.min(1.0, confidence));
  }

  /**
   * Calculate variance for consistency checking
   */
  calculateVariance(scores) {
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    return variance;
  }

  /**
   * Generate human-readable compatibility factors
   */
  generateCompatibilityFactors(breakdown, weights) {
    const factors = [];
    
    // Positive factors (attractions)
    if (breakdown.personalityMatch > 0.7) {
      factors.push({
        type: 'strength',
        category: 'personality',
        description: 'Strong personality compatibility',
        score: breakdown.personalityMatch,
        impact: breakdown.personalityMatch * weights.PERSONALITY_MATCH.weight
      });
    }
    
    if (breakdown.valuesAlignment > 0.7) {
      factors.push({
        type: 'strength',
        category: 'values',
        description: 'Shared core values and life goals',
        score: breakdown.valuesAlignment,
        impact: breakdown.valuesAlignment * weights.VALUES_ALIGNMENT.weight
      });
    }
    
    if (breakdown.communicationSync > 0.7) {
      factors.push({
        type: 'strength',
        category: 'communication',
        description: 'Compatible communication styles',
        score: breakdown.communicationSync,
        impact: breakdown.communicationSync * weights.COMMUNICATION_SYNC.weight
      });
    }
    
    // Negative factors (conflicts)
    if (breakdown.majorConflicts > 0.5) {
      factors.push({
        type: 'concern',
        category: 'conflicts',
        description: 'Potential major disagreements',
        score: breakdown.majorConflicts,
        impact: breakdown.majorConflicts * weights.MAJOR_CONFLICTS.weight
      });
    }
    
    if (breakdown.communicationBarriers > 0.5) {
      factors.push({
        type: 'concern',
        category: 'communication',
        description: 'Different communication preferences',
        score: breakdown.communicationBarriers,
        impact: breakdown.communicationBarriers * weights.COMMUNICATION_BARRIERS.weight
      });
    }
    
    return factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  }

  /**
   * Learn from user feedback to improve future recommendations
   */
  updateFromFeedback(userA_id, userB_id, userA_HHC, userB_HHC, feedback) {
    const feedbackData = {
      timestamp: Date.now(),
      userA_id,
      userB_id,
      feedback,
      originalScore: this.calculateCompatibility(userA_HHC, userB_HHC, userA_id)
    };
    
    this.feedbackHistory.push(feedbackData);
    
    // Update personalized weights based on feedback
    this.adjustPersonalizedWeights(userA_id, userA_HHC, userB_HHC, feedback);
    
    return feedbackData;
  }

  /**
   * Adjust personalized weights based on user feedback
   */
  adjustPersonalizedWeights(userId, userA_HHC, userB_HHC, feedback) {
    if (!this.personalizedWeights.has(userId)) {
      this.personalizedWeights.set(userId, { ...this.weights });
    }
    
    const userWeights = this.personalizedWeights.get(userId);
    const compatibility = this.calculateCompatibility(userA_HHC, userB_HHC);
    
    // Adjust weights based on feedback type
    const adjustment = this.learningRate * (feedback.liked ? 1 : -1);
    
    // Focus adjustments on the most influential factors
    for (const factor of compatibility.factors) {
      if (Math.abs(factor.impact) > 0.1) {
        const weightKey = this.getWeightKeyFromCategory(factor.category);
        if (weightKey && userWeights[weightKey]) {
          userWeights[weightKey].weight *= (1 + adjustment);
          // Clamp weights to reasonable bounds
          userWeights[weightKey].weight = Math.max(0.05, Math.min(1.0, userWeights[weightKey].weight));
        }
      }
    }
    
    this.personalizedWeights.set(userId, userWeights);
  }

  /**
   * Get weight key from factor category
   */
  getWeightKeyFromCategory(category) {
    const mapping = {
      'personality': 'PERSONALITY_MATCH',
      'values': 'VALUES_ALIGNMENT',
      'communication': 'COMMUNICATION_SYNC',
      'lifestyle': 'LIFESTYLE_MATCH',
      'conflicts': 'MAJOR_CONFLICTS'
    };
    return mapping[category];
  }

  /**
   * Get personalized weights for a user
   */
  getPersonalizedWeights(userId) {
    if (userId && this.personalizedWeights.has(userId)) {
      return this.personalizedWeights.get(userId);
    }
    return this.weights;
  }

  /**
   * Generate explanation for compatibility score
   */
  explainCompatibility(compatibilityResult) {
    const explanation = {
      summary: this.generateSummary(compatibilityResult),
      strengths: [],
      concerns: [],
      suggestions: []
    };
    
    // Extract strengths and concerns
    for (const factor of compatibilityResult.factors) {
      if (factor.type === 'strength') {
        explanation.strengths.push(factor.description);
      } else if (factor.type === 'concern') {
        explanation.concerns.push(factor.description);
      }
    }
    
    // Generate suggestions
    explanation.suggestions = this.generateSuggestions(compatibilityResult);
    
    return explanation;
  }

  /**
   * Generate compatibility summary
   */
  generateSummary(result) {
    const score = result.overall;
    
    if (score >= 0.85) {
      return "Exceptional compatibility with strong alignment across multiple dimensions";
    } else if (score >= 0.7) {
      return "High compatibility with good potential for a meaningful connection";
    } else if (score >= 0.55) {
      return "Moderate compatibility with some areas of alignment";
    } else if (score >= 0.4) {
      return "Limited compatibility with potential challenges";
    } else {
      return "Low compatibility with significant differences";
    }
  }

  /**
   * Generate personalized suggestions
   */
  generateSuggestions(result) {
    const suggestions = [];
    
    if (result.breakdown.communicationSync < 0.5) {
      suggestions.push("Focus on understanding each other's communication preferences");
    }
    
    if (result.breakdown.healthyDifferences > 0.7) {
      suggestions.push("Embrace your differences as opportunities for growth");
    }
    
    if (result.breakdown.valuesAlignment > 0.8) {
      suggestions.push("Build on your shared values and life goals");
    }
    
    return suggestions;
  }

  /**
   * Export algorithm state for persistence
   */
  exportState() {
    return {
      weights: this.weights,
      learningRate: this.learningRate,
      feedbackHistory: this.feedbackHistory.slice(-100), // Keep last 100 feedback items
      personalizedWeights: Object.fromEntries(this.personalizedWeights)
    };
  }

  /**
   * Import algorithm state
   */
  importState(state) {
    this.weights = state.weights || this.weights;
    this.learningRate = state.learningRate || this.learningRate;
    this.feedbackHistory = state.feedbackHistory || [];
    this.personalizedWeights = new Map(Object.entries(state.personalizedWeights || {}));
  }
}