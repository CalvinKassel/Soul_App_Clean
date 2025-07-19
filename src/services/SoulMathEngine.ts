// Soul Math Engine - Advanced mathematical compatibility scoring
// Implements Perplexity's mathematical formulation for hybrid HHC + factual matching

import {
  SoulUserProfile,
  SoulCompatibilityScore,
  FactualProfile,
  PartnerPreferences,
  SoulPreferenceWeights,
  ConnectionPotential,
  PersonalityInsights
} from '../types/SoulTypes';
import { HarmonyUserProfile } from '../types/HarmonyTypes';
import { calculateHarmonyDistance, getArchetypeFromHue } from './HarmonyCore';

/**
 * Soul Math Engine
 * Implements advanced mathematical compatibility scoring using:
 * 1. HHC 3D personality space distance calculations
 * 2. Weighted factual preference alignment
 * 3. Veto filter Boolean logic
 * 4. Multi-dimensional compatibility analysis
 */
export class SoulMathEngine {
  private config: {
    hhcWeight: number;
    factualWeight: number;
    distanceMetric: 'euclidean' | 'manhattan' | 'cosine';
    normalizationMethod: 'minmax' | 'zscore' | 'robust';
  };

  constructor(config = {
    hhcWeight: 0.6,
    factualWeight: 0.4,
    distanceMetric: 'euclidean' as const,
    normalizationMethod: 'minmax' as const
  }) {
    this.config = config;
  }

  /**
   * Calculate comprehensive compatibility score
   * Implements: Total_Comp(A,B) = Veto_Factor(A,B) × (W_HHC × S_HHC(A,B) + W_Factual × S_Factual(A,B))
   */
  calculateTotalCompatibility(
    seekerProfile: SoulUserProfile,
    candidateProfile: SoulUserProfile
  ): SoulCompatibilityScore {
    // Step 1: Calculate HHC compatibility score S_HHC(A,B)
    const hhcScore = this.calculateHHCCompatibility(
      seekerProfile.hhcProfile,
      candidateProfile.hhcProfile
    );

    // Step 2: Calculate veto factor - binary filter for hard requirements
    const vetoFactor = this.calculateVetoFactor(
      seekerProfile.partnerPreferences,
      candidateProfile.factualProfile
    );

    // Early return if veto criteria violated
    if (vetoFactor === 0) {
      return {
        totalScore: 0,
        hhcScore,
        factualScore: 0,
        vetoFactor,
        breakdown: {
          personalityAlignment: hhcScore,
          factualAlignment: 0,
          interestOverlap: 0,
          preferenceMatch: 0,
          vetoViolation: true
        },
        confidenceLevel: 0,
        explanation: 'Candidate violates mandatory requirements'
      };
    }

    // Step 3: Calculate factual compatibility score S_Factual(A,B)
    const factualScore = this.calculateFactualCompatibility(
      seekerProfile,
      candidateProfile
    );

    // Step 4: Calculate breakdown components
    const breakdown = this.calculateCompatibilityBreakdown(
      seekerProfile,
      candidateProfile,
      hhcScore,
      factualScore
    );

    // Step 5: Calculate final total compatibility
    const totalScore = vetoFactor * (
      this.config.hhcWeight * hhcScore +
      this.config.factualWeight * factualScore
    );

    // Step 6: Calculate confidence level
    const confidenceLevel = this.calculateConfidenceLevel(seekerProfile, candidateProfile);

    return {
      totalScore,
      hhcScore,
      factualScore,
      vetoFactor,
      breakdown,
      confidenceLevel,
      explanation: this.generateCompatibilityExplanation(totalScore, breakdown)
    };
  }

  /**
   * Calculate HHC compatibility using 3D personality space
   * Implements normalized distance metric with circular hue handling
   */
  private calculateHHCCompatibility(
    profileA: HarmonyUserProfile,
    profileB: HarmonyUserProfile
  ): number {
    // Extract 3D coordinates for each component
    const dimA = profileA.rawDimensions;
    const dimB = profileB.rawDimensions;

    // Calculate distances for each dimension
    const distances = this.calculateDimensionalDistances(dimA, dimB);

    // Calculate weighted total distance
    const totalDistance = this.calculateWeightedDistance(distances);

    // Normalize to [0,1] and invert (closer = more compatible)
    const maxDistance = this.calculateMaxPossibleDistance();
    const normalizedDistance = totalDistance / maxDistance;

    return 1 - normalizedDistance;
  }

  /**
   * Calculate distances for each HHC dimension
   */
  private calculateDimensionalDistances(
    dimA: { hue: number; manifested: number; soul: number },
    dimB: { hue: number; manifested: number; soul: number }
  ): { hue: number; manifested: number; soul: number } {
    // Hue distance (circular, 0-360 degrees)
    const hueDistance = this.calculateCircularDistance(dimA.hue, dimB.hue, 360);

    // Manifested Self distance (linear, 0-255)
    const manifestedDistance = Math.abs(dimA.manifested - dimB.manifested);

    // Soul distance (linear, 0-255)
    const soulDistance = Math.abs(dimA.soul - dimB.soul);

    return {
      hue: hueDistance,
      manifested: manifestedDistance,
      soul: soulDistance
    };
  }

  /**
   * Calculate circular distance for hue values
   */
  private calculateCircularDistance(a: number, b: number, max: number): number {
    const diff = Math.abs(a - b);
    return Math.min(diff, max - diff);
  }

  /**
   * Calculate weighted distance across dimensions
   */
  private calculateWeightedDistance(distances: {
    hue: number;
    manifested: number;
    soul: number;
  }): number {
    // Normalize each dimension to [0,1] scale
    const normalizedHue = distances.hue / 180; // Max hue distance is 180
    const normalizedManifested = distances.manifested / 255;
    const normalizedSoul = distances.soul / 255;

    // Calculate Euclidean distance in normalized space
    switch (this.config.distanceMetric) {
      case 'euclidean':
        return Math.sqrt(
          Math.pow(normalizedHue, 2) +
          Math.pow(normalizedManifested, 2) +
          Math.pow(normalizedSoul, 2)
        );
      
      case 'manhattan':
        return normalizedHue + normalizedManifested + normalizedSoul;
      
      case 'cosine':
        const dotProduct = normalizedHue * normalizedManifested + 
                          normalizedManifested * normalizedSoul + 
                          normalizedSoul * normalizedHue;
        const magnitudeA = Math.sqrt(normalizedHue * normalizedHue + 
                                   normalizedManifested * normalizedManifested + 
                                   normalizedSoul * normalizedSoul);
        const magnitudeB = magnitudeA; // Same for normalized vectors
        return 1 - (dotProduct / (magnitudeA * magnitudeB));
      
      default:
        return Math.sqrt(
          Math.pow(normalizedHue, 2) +
          Math.pow(normalizedManifested, 2) +
          Math.pow(normalizedSoul, 2)
        );
    }
  }

  /**
   * Calculate maximum possible distance for normalization
   */
  private calculateMaxPossibleDistance(): number {
    switch (this.config.distanceMetric) {
      case 'euclidean':
        return Math.sqrt(3); // √(1² + 1² + 1²) in normalized space
      case 'manhattan':
        return 3; // 1 + 1 + 1 in normalized space
      case 'cosine':
        return 1; // Maximum cosine distance
      default:
        return Math.sqrt(3);
    }
  }

  /**
   * Calculate veto factor - binary filter for hard requirements
   * Implements: Veto_Factor(A,B) ∈ {0,1}
   */
  private calculateVetoFactor(
    preferences: PartnerPreferences,
    candidateProfile: FactualProfile
  ): number {
    // Age range veto
    if (preferences.desiredAgeRange && candidateProfile.age) {
      const [minAge, maxAge] = preferences.desiredAgeRange;
      if (candidateProfile.age < minAge || candidateProfile.age > maxAge) {
        return 0;
      }
    }

    // Gender interest veto
    if (preferences.interestedInGenders && candidateProfile.genderIdentity) {
      if (!preferences.interestedInGenders.includes(candidateProfile.genderIdentity)) {
        return 0;
      }
    }

    // Height veto
    if (preferences.desiredPartnerHeight && candidateProfile.heightCm) {
      const { min, max } = preferences.desiredPartnerHeight;
      if (candidateProfile.heightCm < min || candidateProfile.heightCm > max) {
        return 0;
      }
    }

    // Process hard veto criteria
    if (preferences.vetoCriteria) {
      // Non-smoker requirement
      if (preferences.vetoCriteria.nonSmokerOnly && 
          candidateProfile.smokingHabits !== 'never') {
        return 0;
      }

      // Must want children
      if (preferences.vetoCriteria.mustWantChildren && 
          candidateProfile.familyPlans !== 'wants children') {
        return 0;
      }

      // Must not have children
      if (preferences.vetoCriteria.mustNotHaveChildren && 
          candidateProfile.familyPlans === 'has children') {
        return 0;
      }

      // Minimum/maximum age overrides
      if (preferences.vetoCriteria.minimumAge && candidateProfile.age &&
          candidateProfile.age < preferences.vetoCriteria.minimumAge) {
        return 0;
      }

      if (preferences.vetoCriteria.maximumAge && candidateProfile.age &&
          candidateProfile.age > preferences.vetoCriteria.maximumAge) {
        return 0;
      }

      // Deal-breaker interests
      if (preferences.vetoCriteria.dealBreakerInterests && candidateProfile.interests) {
        const hasDealbreakerInterest = preferences.vetoCriteria.dealBreakerInterests.some(
          interest => candidateProfile.interests!.includes(interest)
        );
        if (hasDealbreakerInterest) {
          return 0;
        }
      }

      // Required interests
      if (preferences.vetoCriteria.requiredInterests && candidateProfile.interests) {
        const hasAllRequiredInterests = preferences.vetoCriteria.requiredInterests.every(
          interest => candidateProfile.interests!.includes(interest)
        );
        if (!hasAllRequiredInterests) {
          return 0;
        }
      }
    }

    return 1; // Passes all veto criteria
  }

  /**
   * Calculate factual compatibility score
   * Implements: S_Factual(A,B) = Σ(w_i × s_i(A,B)) / Σ(w_i)
   */
  private calculateFactualCompatibility(
    seekerProfile: SoulUserProfile,
    candidateProfile: SoulUserProfile
  ): number {
    const weights = seekerProfile.dynamicPreferenceWeights;
    const preferences = seekerProfile.partnerPreferences;
    const candidateFactual = candidateProfile.factualProfile;

    let totalScore = 0;
    let totalWeight = 0;

    // Age compatibility
    if (weights.age > 0 && preferences.desiredAgeRange && candidateFactual.age) {
      const ageScore = this.calculateAgeCompatibilityScore(
        preferences.desiredAgeRange,
        candidateFactual.age
      );
      totalScore += weights.age * ageScore;
      totalWeight += weights.age;
    }

    // Height compatibility
    if (weights.height > 0 && preferences.desiredPartnerHeight && candidateFactual.heightCm) {
      const heightScore = this.calculateHeightCompatibilityScore(
        preferences.desiredPartnerHeight,
        candidateFactual.heightCm
      );
      totalScore += weights.height * heightScore;
      totalWeight += weights.height;
    }

    // Relationship goal compatibility
    if (weights.relationshipGoal > 0 && candidateFactual.relationshipGoal) {
      const goalScore = this.calculateCategoricalCompatibility(
        preferences.relationshipGoal,
        candidateFactual.relationshipGoal
      );
      totalScore += weights.relationshipGoal * goalScore;
      totalWeight += weights.relationshipGoal;
    }

    // Family plans compatibility
    if (weights.familyPlans > 0 && candidateFactual.familyPlans) {
      const familyScore = this.calculateCategoricalCompatibility(
        preferences.familyPlans,
        candidateFactual.familyPlans
      );
      totalScore += weights.familyPlans * familyScore;
      totalWeight += weights.familyPlans;
    }

    // Interest overlap compatibility
    if (weights.interests > 0 && candidateFactual.interests) {
      const interestScore = this.calculateInterestOverlapScore(
        seekerProfile.factualProfile.interests || [],
        candidateFactual.interests,
        preferences.interestPreferenceWeights
      );
      totalScore += weights.interests * interestScore;
      totalWeight += weights.interests;
    }

    // Lifestyle compatibility
    if (weights.lifestyle > 0) {
      const lifestyleScore = this.calculateLifestyleCompatibility(
        seekerProfile.factualProfile,
        candidateFactual,
        weights
      );
      totalScore += weights.lifestyle * lifestyleScore;
      totalWeight += weights.lifestyle;
    }

    // Communication style compatibility
    if (weights.communicationStyle > 0 && candidateFactual.communicationStyle) {
      const commScore = this.calculateCommunicationCompatibility(
        seekerProfile.factualProfile.communicationStyle,
        candidateFactual.communicationStyle
      );
      totalScore += weights.communicationStyle * commScore;
      totalWeight += weights.communicationStyle;
    }

    // Normalize by total weight
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Calculate age compatibility using Gaussian scoring
   */
  private calculateAgeCompatibilityScore(
    preferredRange: [number, number],
    candidateAge: number
  ): number {
    const [minAge, maxAge] = preferredRange;
    const center = (minAge + maxAge) / 2;
    const sigma = (maxAge - minAge) / 4; // Standard deviation

    // Perfect score within range
    if (candidateAge >= minAge && candidateAge <= maxAge) {
      return 1.0;
    }

    // Gaussian decay outside range
    const deviation = Math.abs(candidateAge - center);
    return Math.exp(-Math.pow(deviation, 2) / (2 * sigma * sigma));
  }

  /**
   * Calculate height compatibility using linear decay
   */
  private calculateHeightCompatibilityScore(
    preferredHeight: { min: number; max: number },
    candidateHeight: number
  ): number {
    const { min, max } = preferredHeight;

    // Perfect score within range
    if (candidateHeight >= min && candidateHeight <= max) {
      return 1.0;
    }

    // Linear decay outside range with tolerance
    const tolerance = 10; // 10cm tolerance
    const deviation = candidateHeight < min ? min - candidateHeight : candidateHeight - max;
    
    return Math.max(0, 1 - deviation / tolerance);
  }

  /**
   * Calculate categorical compatibility (exact match or scaled)
   */
  private calculateCategoricalCompatibility(
    preferred: string | string[] | undefined,
    candidate: string
  ): number {
    if (!preferred) return 0.5; // Neutral if no preference

    const preferredArray = Array.isArray(preferred) ? preferred : [preferred];
    return preferredArray.includes(candidate) ? 1.0 : 0.0;
  }

  /**
   * Calculate interest overlap using Jaccard similarity with weights
   */
  private calculateInterestOverlapScore(
    seekerInterests: string[],
    candidateInterests: string[],
    interestWeights?: Record<string, number>
  ): number {
    if (seekerInterests.length === 0 || candidateInterests.length === 0) {
      return 0;
    }

    const seekerSet = new Set(seekerInterests);
    const candidateSet = new Set(candidateInterests);
    
    // Calculate weighted Jaccard similarity
    const intersection = new Set([...seekerSet].filter(x => candidateSet.has(x)));
    const union = new Set([...seekerSet, ...candidateSet]);

    if (union.size === 0) return 0;

    // Apply weights if provided
    if (interestWeights) {
      let weightedIntersection = 0;
      let weightedUnion = 0;

      for (const interest of intersection) {
        weightedIntersection += interestWeights[interest] || 1;
      }

      for (const interest of union) {
        weightedUnion += interestWeights[interest] || 1;
      }

      return weightedIntersection / weightedUnion;
    }

    // Standard Jaccard similarity
    return intersection.size / union.size;
  }

  /**
   * Calculate lifestyle compatibility across multiple factors
   */
  private calculateLifestyleCompatibility(
    seekerProfile: FactualProfile,
    candidateProfile: FactualProfile,
    weights: SoulPreferenceWeights
  ): number {
    let score = 0;
    let factors = 0;

    // Exercise habits
    if (seekerProfile.exerciseHabits && candidateProfile.exerciseHabits) {
      score += this.calculateExerciseCompatibility(
        seekerProfile.exerciseHabits,
        candidateProfile.exerciseHabits
      );
      factors++;
    }

    // Sleeping habits
    if (seekerProfile.sleepingHabits && candidateProfile.sleepingHabits) {
      score += this.calculateSleepCompatibility(
        seekerProfile.sleepingHabits,
        candidateProfile.sleepingHabits
      );
      factors++;
    }

    // Dietary preferences
    if (seekerProfile.dietaryPreferences && candidateProfile.dietaryPreferences) {
      score += this.calculateDietaryCompatibility(
        seekerProfile.dietaryPreferences,
        candidateProfile.dietaryPreferences
      );
      factors++;
    }

    // Drinking habits
    if (seekerProfile.drinkingHabits && candidateProfile.drinkingHabits) {
      score += this.calculateDrinkingCompatibility(
        seekerProfile.drinkingHabits,
        candidateProfile.drinkingHabits
      );
      factors++;
    }

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Calculate exercise compatibility with nuanced scoring
   */
  private calculateExerciseCompatibility(seeker: string, candidate: string): number {
    const compatibilityMatrix: { [key: string]: { [key: string]: number } } = {
      'regularly': { 'regularly': 1.0, 'sometimes': 0.7, 'never': 0.2 },
      'sometimes': { 'regularly': 0.8, 'sometimes': 1.0, 'never': 0.5 },
      'never': { 'regularly': 0.3, 'sometimes': 0.6, 'never': 1.0 }
    };

    return compatibilityMatrix[seeker]?.[candidate] || 0.5;
  }

  /**
   * Calculate sleep compatibility
   */
  private calculateSleepCompatibility(seeker: string, candidate: string): number {
    const compatibilityMatrix: { [key: string]: { [key: string]: number } } = {
      'early_bird': { 'early_bird': 1.0, 'night_owl': 0.3 },
      'night_owl': { 'early_bird': 0.3, 'night_owl': 1.0 }
    };

    return compatibilityMatrix[seeker]?.[candidate] || 0.7; // Neutral for mixed types
  }

  /**
   * Calculate dietary compatibility
   */
  private calculateDietaryCompatibility(seeker: string, candidate: string): number {
    const compatibilityMatrix: { [key: string]: { [key: string]: number } } = {
      'vegan': { 'vegan': 1.0, 'vegetarian': 0.8, 'omnivore': 0.4 },
      'vegetarian': { 'vegan': 0.9, 'vegetarian': 1.0, 'omnivore': 0.6 },
      'omnivore': { 'vegan': 0.5, 'vegetarian': 0.7, 'omnivore': 1.0 }
    };

    return compatibilityMatrix[seeker]?.[candidate] || 0.6;
  }

  /**
   * Calculate drinking compatibility
   */
  private calculateDrinkingCompatibility(seeker: string, candidate: string): number {
    const compatibilityMatrix: { [key: string]: { [key: string]: number } } = {
      'never': { 'never': 1.0, 'socially': 0.6, 'regularly': 0.2 },
      'socially': { 'never': 0.7, 'socially': 1.0, 'regularly': 0.8 },
      'regularly': { 'never': 0.3, 'socially': 0.8, 'regularly': 1.0 }
    };

    return compatibilityMatrix[seeker]?.[candidate] || 0.5;
  }

  /**
   * Calculate communication compatibility
   */
  private calculateCommunicationCompatibility(
    seekerStyle: string | undefined,
    candidateStyle: string
  ): number {
    if (!seekerStyle) return 0.5;

    const compatibilityMatrix: { [key: string]: { [key: string]: number } } = {
      'direct': { 'direct': 1.0, 'indirect': 0.4, 'empathetic': 0.7 },
      'indirect': { 'direct': 0.5, 'indirect': 1.0, 'empathetic': 0.8 },
      'empathetic': { 'direct': 0.6, 'indirect': 0.9, 'empathetic': 1.0 }
    };

    return compatibilityMatrix[seekerStyle]?.[candidateStyle] || 0.6;
  }

  /**
   * Calculate detailed compatibility breakdown
   */
  private calculateCompatibilityBreakdown(
    seekerProfile: SoulUserProfile,
    candidateProfile: SoulUserProfile,
    hhcScore: number,
    factualScore: number
  ): {
    personalityAlignment: number;
    factualAlignment: number;
    interestOverlap: number;
    preferenceMatch: number;
    vetoViolation: boolean;
  } {
    const interestOverlap = this.calculateInterestOverlapScore(
      seekerProfile.factualProfile.interests || [],
      candidateProfile.factualProfile.interests || []
    );

    const preferenceMatch = this.calculateOverallPreferenceMatch(
      seekerProfile,
      candidateProfile
    );

    return {
      personalityAlignment: hhcScore,
      factualAlignment: factualScore,
      interestOverlap,
      preferenceMatch,
      vetoViolation: false
    };
  }

  /**
   * Calculate overall preference match
   */
  private calculateOverallPreferenceMatch(
    seekerProfile: SoulUserProfile,
    candidateProfile: SoulUserProfile
  ): number {
    // This would calculate how well the candidate matches the seeker's overall preferences
    // considering weights and preference patterns
    
    const weights = seekerProfile.dynamicPreferenceWeights;
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    
    if (totalWeight === 0) return 0.5;

    // Calculate weighted preference satisfaction
    let satisfactionScore = 0;
    let applicableWeight = 0;

    for (const [attribute, weight] of Object.entries(weights)) {
      const satisfaction = this.calculateAttributeSatisfaction(
        attribute,
        seekerProfile,
        candidateProfile
      );
      
      if (satisfaction !== null) {
        satisfactionScore += weight * satisfaction;
        applicableWeight += weight;
      }
    }

    return applicableWeight > 0 ? satisfactionScore / applicableWeight : 0.5;
  }

  /**
   * Calculate satisfaction for a specific attribute
   */
  private calculateAttributeSatisfaction(
    attribute: string,
    seekerProfile: SoulUserProfile,
    candidateProfile: SoulUserProfile
  ): number | null {
    const seeker = seekerProfile.factualProfile;
    const candidate = candidateProfile.factualProfile;

    switch (attribute) {
      case 'age':
        if (seekerProfile.partnerPreferences.desiredAgeRange && candidate.age) {
          return this.calculateAgeCompatibilityScore(
            seekerProfile.partnerPreferences.desiredAgeRange,
            candidate.age
          );
        }
        return null;

      case 'height':
        if (seekerProfile.partnerPreferences.desiredPartnerHeight && candidate.heightCm) {
          return this.calculateHeightCompatibilityScore(
            seekerProfile.partnerPreferences.desiredPartnerHeight,
            candidate.heightCm
          );
        }
        return null;

      case 'interests':
        if (seeker.interests && candidate.interests) {
          return this.calculateInterestOverlapScore(
            seeker.interests,
            candidate.interests,
            seekerProfile.partnerPreferences.interestPreferenceWeights
          );
        }
        return null;

      case 'exerciseHabits':
        if (seeker.exerciseHabits && candidate.exerciseHabits) {
          return this.calculateExerciseCompatibility(seeker.exerciseHabits, candidate.exerciseHabits);
        }
        return null;

      case 'smokingHabits':
        if (seeker.smokingHabits && candidate.smokingHabits) {
          return seeker.smokingHabits === candidate.smokingHabits ? 1.0 : 0.0;
        }
        return null;

      default:
        return null;
    }
  }

  /**
   * Calculate confidence level of the compatibility assessment
   */
  private calculateConfidenceLevel(
    seekerProfile: SoulUserProfile,
    candidateProfile: SoulUserProfile
  ): number {
    // Base confidence on profile completeness
    const seekerCompleteness = seekerProfile.metadata.profileCompleteness;
    const candidateCompleteness = candidateProfile.metadata.profileCompleteness;
    
    // Learning history depth
    const learningDepth = Math.min(1, seekerProfile.learningHistory.totalInteractions / 50);
    
    // Weight stabilization
    const weights = seekerProfile.dynamicPreferenceWeights;
    const weightVariance = this.calculateWeightVariance(weights);
    const stabilizationScore = 1 - Math.min(1, weightVariance);
    
    // Combine factors
    const confidence = (
      seekerCompleteness * 0.3 +
      candidateCompleteness * 0.2 +
      learningDepth * 0.3 +
      stabilizationScore * 0.2
    );

    return Math.max(0.1, Math.min(1, confidence));
  }

  /**
   * Calculate variance in preference weights
   */
  private calculateWeightVariance(weights: SoulPreferenceWeights): number {
    const values = Object.values(weights);
    const mean = values.reduce((sum, w) => sum + w, 0) / values.length;
    const variance = values.reduce((sum, w) => sum + Math.pow(w - mean, 2), 0) / values.length;
    return variance;
  }

  /**
   * Generate compatibility explanation
   */
  private generateCompatibilityExplanation(
    totalScore: number,
    breakdown: any
  ): string {
    if (totalScore >= 0.9) {
      return 'Exceptional compatibility - rare alignment across all dimensions';
    } else if (totalScore >= 0.8) {
      return 'Outstanding compatibility with strong potential for deep connection';
    } else if (totalScore >= 0.7) {
      return 'Very high compatibility with excellent relationship potential';
    } else if (totalScore >= 0.6) {
      return 'Good compatibility with solid foundation for growth';
    } else if (totalScore >= 0.5) {
      return 'Moderate compatibility with some areas of alignment';
    } else if (totalScore >= 0.3) {
      return 'Limited compatibility with significant differences';
    } else {
      return 'Poor compatibility - fundamental misalignment';
    }
  }

  /**
   * Calculate connection potential across multiple dimensions
   */
  calculateConnectionPotential(
    seekerProfile: SoulUserProfile,
    candidateProfile: SoulUserProfile,
    compatibilityScore: SoulCompatibilityScore
  ): ConnectionPotential {
    const shortTermCompatibility = this.calculateShortTermPotential(
      seekerProfile,
      candidateProfile,
      compatibilityScore
    );

    const longTermCompatibility = this.calculateLongTermPotential(
      seekerProfile,
      candidateProfile,
      compatibilityScore
    );

    const growthPotential = this.calculateGrowthPotential(
      seekerProfile,
      candidateProfile
    );

    const passionAlignment = this.calculatePassionAlignment(
      seekerProfile,
      candidateProfile
    );

    const stabilityFactor = this.calculateStabilityFactor(
      seekerProfile,
      candidateProfile
    );

    const adventureCompatibility = this.calculateAdventureCompatibility(
      seekerProfile,
      candidateProfile
    );

    return {
      shortTermCompatibility,
      longTermCompatibility,
      growthPotential,
      passionAlignment,
      stabilityFactor,
      adventureCompatibility
    };
  }

  /**
   * Calculate short-term relationship potential
   */
  private calculateShortTermPotential(
    seekerProfile: SoulUserProfile,
    candidateProfile: SoulUserProfile,
    compatibilityScore: SoulCompatibilityScore
  ): number {
    // Short-term focuses on immediate attraction and compatibility
    const personalityAttraction = compatibilityScore.hhcScore * 0.6;
    const interestAlignment = compatibilityScore.breakdown.interestOverlap * 0.4;
    
    return personalityAttraction + interestAlignment;
  }

  /**
   * Calculate long-term relationship potential
   */
  private calculateLongTermPotential(
    seekerProfile: SoulUserProfile,
    candidateProfile: SoulUserProfile,
    compatibilityScore: SoulCompatibilityScore
  ): number {
    // Long-term focuses on values, goals, and life compatibility
    const valuesAlignment = compatibilityScore.factualScore * 0.4;
    const goalAlignment = this.calculateGoalAlignment(seekerProfile, candidateProfile) * 0.3;
    const personalityStability = compatibilityScore.hhcScore * 0.3;
    
    return valuesAlignment + goalAlignment + personalityStability;
  }

  /**
   * Calculate growth potential together
   */
  private calculateGrowthPotential(
    seekerProfile: SoulUserProfile,
    candidateProfile: SoulUserProfile
  ): number {
    // Growth potential based on complementary strengths and shared values
    const seekerArchetype = getArchetypeFromHue(seekerProfile.hhcProfile.rawDimensions.hue);
    const candidateArchetype = getArchetypeFromHue(candidateProfile.hhcProfile.rawDimensions.hue);
    
    // Different archetypes can offer growth opportunities
    const archetypeComplementarity = seekerArchetype.name !== candidateArchetype.name ? 0.7 : 0.3;
    
    // Shared growth interests
    const sharedGrowthInterests = this.calculateSharedGrowthInterests(seekerProfile, candidateProfile);
    
    return (archetypeComplementarity * 0.6) + (sharedGrowthInterests * 0.4);
  }

  /**
   * Calculate passion alignment
   */
  private calculatePassionAlignment(
    seekerProfile: SoulUserProfile,
    candidateProfile: SoulUserProfile
  ): number {
    // Focus on high-weight interests and passions
    const seekerInterests = seekerProfile.factualProfile.interests || [];
    const candidateInterests = candidateProfile.factualProfile.interests || [];
    const interestWeights = seekerProfile.partnerPreferences.interestPreferenceWeights || {};
    
    // Calculate weighted passion overlap
    return this.calculateInterestOverlapScore(
      seekerInterests,
      candidateInterests,
      interestWeights
    );
  }

  /**
   * Calculate stability factor
   */
  private calculateStabilityFactor(
    seekerProfile: SoulUserProfile,
    candidateProfile: SoulUserProfile
  ): number {
    // Stability based on consistent values and lifestyle alignment
    const lifestyleStability = this.calculateLifestyleCompatibility(
      seekerProfile.factualProfile,
      candidateProfile.factualProfile,
      seekerProfile.dynamicPreferenceWeights
    );
    
    const goalStability = this.calculateGoalAlignment(seekerProfile, candidateProfile);
    
    return (lifestyleStability * 0.6) + (goalStability * 0.4);
  }

  /**
   * Calculate adventure compatibility
   */
  private calculateAdventureCompatibility(
    seekerProfile: SoulUserProfile,
    candidateProfile: SoulUserProfile
  ): number {
    // Adventure compatibility based on openness and shared adventurous interests
    const seekerOpenness = this.calculateOpenness(seekerProfile);
    const candidateOpenness = this.calculateOpenness(candidateProfile);
    
    const opennessAlignment = 1 - Math.abs(seekerOpenness - candidateOpenness);
    
    // Shared adventurous interests
    const adventurousInterests = ['travel', 'hiking', 'adventure sports', 'exploring', 'outdoor activities'];
    const sharedAdventure = this.calculateSpecificInterestOverlap(
      seekerProfile.factualProfile.interests || [],
      candidateProfile.factualProfile.interests || [],
      adventurousInterests
    );
    
    return (opennessAlignment * 0.7) + (sharedAdventure * 0.3);
  }

  /**
   * Helper methods
   */
  private calculateGoalAlignment(
    seekerProfile: SoulUserProfile,
    candidateProfile: SoulUserProfile
  ): number {
    let alignmentScore = 0;
    let factors = 0;

    // Relationship goals
    if (seekerProfile.factualProfile.relationshipGoal && candidateProfile.factualProfile.relationshipGoal) {
      alignmentScore += this.calculateCategoricalCompatibility(
        seekerProfile.factualProfile.relationshipGoal,
        candidateProfile.factualProfile.relationshipGoal
      );
      factors++;
    }

    // Family plans
    if (seekerProfile.factualProfile.familyPlans && candidateProfile.factualProfile.familyPlans) {
      alignmentScore += this.calculateCategoricalCompatibility(
        seekerProfile.factualProfile.familyPlans,
        candidateProfile.factualProfile.familyPlans
      );
      factors++;
    }

    return factors > 0 ? alignmentScore / factors : 0.5;
  }

  private calculateSharedGrowthInterests(
    seekerProfile: SoulUserProfile,
    candidateProfile: SoulUserProfile
  ): number {
    const growthInterests = ['learning', 'personal development', 'reading', 'spirituality', 'meditation'];
    return this.calculateSpecificInterestOverlap(
      seekerProfile.factualProfile.interests || [],
      candidateProfile.factualProfile.interests || [],
      growthInterests
    );
  }

  private calculateOpenness(profile: SoulUserProfile): number {
    // Estimate openness based on interests diversity and certain personality indicators
    const interests = profile.factualProfile.interests || [];
    const diversityScore = Math.min(1, interests.length / 10);
    
    // Could be enhanced with personality data
    return diversityScore;
  }

  private calculateSpecificInterestOverlap(
    seekerInterests: string[],
    candidateInterests: string[],
    targetInterests: string[]
  ): number {
    const seekerTarget = seekerInterests.filter(i => targetInterests.includes(i));
    const candidateTarget = candidateInterests.filter(i => targetInterests.includes(i));
    
    if (seekerTarget.length === 0 && candidateTarget.length === 0) return 0.5;
    
    return this.calculateInterestOverlapScore(seekerTarget, candidateTarget);
  }
}

export default SoulMathEngine;