// AI Profile Analyzer for SoulAI
// Analyzes other users' AI-generated profiles for compatibility

class AIProfileAnalyzer {
  constructor() {
    this.hhcCompatibilityEngine = null; // Will be initialized with HHC compatibility system
  }

  // Analyze another user's AI-generated profile for compatibility
  async analyzeProfileCompatibility(currentUserId, targetUserProfile, currentUserProfile = null) {
    try {
      console.log(`Analyzing compatibility between ${currentUserId} and target user`);
      
      // Get current user's profile if not provided
      if (!currentUserProfile) {
        currentUserProfile = await this.getCurrentUserProfile(currentUserId);
      }
      
      // Extract HHC from the target profile's stamp
      const targetHHC = this.extractHHCFromStamp(targetUserProfile.hhcStamp);
      const currentHHC = this.extractHHCFromStamp(currentUserProfile.hhcStamp);
      
      // Perform comprehensive compatibility analysis
      const compatibility = await this.performCompatibilityAnalysis(
        currentUserProfile,
        targetUserProfile,
        currentHHC,
        targetHHC
      );
      
      // Check basic filters (age, location, etc.)
      const filterMatch = this.checkCompatibilityFilters(
        currentUserProfile.compatibilityFilters,
        targetUserProfile
      );
      
      // Generate compatibility report
      const report = await this.generateCompatibilityReport(
        compatibility,
        filterMatch,
        currentUserProfile,
        targetUserProfile
      );
      
      console.log(`Compatibility analysis complete: ${Math.round(compatibility.overall_score * 100)}% match`);
      
      return report;
      
    } catch (error) {
      console.error('Profile compatibility analysis failed:', error);
      return this.generateErrorReport(error);
    }
  }

  // Extract HHC vector from profile stamp
  extractHHCFromStamp(hhcStamp) {
    if (!hhcStamp || !hhcStamp.vector) {
      console.warn('No HHC stamp found in profile');
      return null;
    }
    
    return {
      vector: hhcStamp.vector,
      code: hhcStamp.code,
      confidence: hhcStamp.confidence,
      generated_at: hhcStamp.generated_at
    };
  }

  // Perform comprehensive compatibility analysis
  async performCompatibilityAnalysis(currentProfile, targetProfile, currentHHC, targetHHC) {
    // HHC Vector Compatibility (primary matching)
    const hhcCompatibility = await this.calculateHHCCompatibility(currentHHC, targetHHC);
    
    // Personality Trait Analysis
    const personalityCompatibility = this.analyzePersonalityCompatibility(
      currentProfile.aiAnalysisData.personality_traits,
      targetProfile.aiAnalysisData.personality_traits
    );
    
    // Communication Style Compatibility
    const communicationCompatibility = this.analyzeCommunicationCompatibility(
      currentProfile.aiAnalysisData.communication_patterns,
      targetProfile.aiAnalysisData.communication_patterns
    );
    
    // Values Alignment
    const valuesCompatibility = this.analyzeValuesAlignment(
      currentProfile.aiGeneratedContent.valuesStatement,
      targetProfile.aiGeneratedContent.valuesStatement,
      currentProfile.aiAnalysisData.personality_traits.values,
      targetProfile.aiAnalysisData.personality_traits.values
    );
    
    // Lifestyle Compatibility
    const lifestyleCompatibility = this.analyzeLifestyleCompatibility(
      currentProfile.aiGeneratedContent.lifestyleNarrative,
      targetProfile.aiGeneratedContent.lifestyleNarrative,
      currentProfile.aiAnalysisData.personality_traits.lifestyle,
      targetProfile.aiAnalysisData.personality_traits.lifestyle
    );
    
    // Relationship Philosophy Alignment
    const relationshipCompatibility = this.analyzeRelationshipCompatibility(
      currentProfile.aiGeneratedContent.relationshipPhilosophy,
      targetProfile.aiGeneratedContent.relationshipPhilosophy,
      currentProfile.aiAnalysisData.relationship_readiness,
      targetProfile.aiAnalysisData.relationship_readiness
    );
    
    // Emotional Intelligence Compatibility
    const emotionalCompatibility = this.analyzeEmotionalCompatibility(
      currentProfile.aiAnalysisData.emotional_intelligence,
      targetProfile.aiAnalysisData.emotional_intelligence
    );
    
    // Calculate weighted overall score
    const weights = {
      hhc: 0.30,           // Primary compatibility from HHC vectors
      personality: 0.20,    // Big Five and core traits
      communication: 0.15,  // How they communicate
      values: 0.15,        // Core values alignment
      lifestyle: 0.10,     // Lifestyle compatibility
      relationship: 0.05,   // Relationship approach
      emotional: 0.05      // Emotional intelligence
    };
    
    const overall_score = 
      (hhcCompatibility.score * weights.hhc) +
      (personalityCompatibility.score * weights.personality) +
      (communicationCompatibility.score * weights.communication) +
      (valuesCompatibility.score * weights.values) +
      (lifestyleCompatibility.score * weights.lifestyle) +
      (relationshipCompatibility.score * weights.relationship) +
      (emotionalCompatibility.score * weights.emotional);
    
    return {
      overall_score,
      component_scores: {
        hhc: hhcCompatibility,
        personality: personalityCompatibility,
        communication: communicationCompatibility,
        values: valuesCompatibility,
        lifestyle: lifestyleCompatibility,
        relationship: relationshipCompatibility,
        emotional: emotionalCompatibility
      },
      confidence: this.calculateOverallConfidence([
        hhcCompatibility.confidence,
        personalityCompatibility.confidence,
        communicationCompatibility.confidence,
        valuesCompatibility.confidence,
        lifestyleCompatibility.confidence,
        relationshipCompatibility.confidence,
        emotionalCompatibility.confidence
      ])
    };
  }

  // Calculate HHC vector compatibility using Harmony Algorithm
  async calculateHHCCompatibility(currentHHC, targetHHC) {
    if (!currentHHC || !targetHHC || !currentHHC.vector || !targetHHC.vector) {
      return { score: 0.5, confidence: 0.3, factors: ['insufficient_data'] };
    }
    
    const vector1 = currentHHC.vector;
    const vector2 = targetHHC.vector;
    
    // Calculate compatibility using multiple methods
    
    // 1. Cosine similarity for overall alignment
    const cosineSimilarity = this.calculateCosineSimilarity(vector1, vector2);
    
    // 2. Weighted dimensional analysis for specific traits
    const dimensionalAnalysis = this.analyzeDimensionalCompatibility(vector1, vector2);
    
    // 3. Harmony algorithm for attraction/repulsion forces
    const harmonyScore = this.calculateHarmonyScore(vector1, vector2);
    
    // 4. Complementary trait analysis
    const complementaryScore = this.analyzeComplementaryTraits(vector1, vector2);
    
    // Combine scores with weights
    const combinedScore = 
      (cosineSimilarity * 0.3) +
      (dimensionalAnalysis.score * 0.3) +
      (harmonyScore * 0.25) +
      (complementaryScore * 0.15);
    
    return {
      score: combinedScore,
      confidence: Math.min(currentHHC.confidence, targetHHC.confidence),
      factors: [
        `cosine_similarity: ${Math.round(cosineSimilarity * 100)}%`,
        `dimensional_analysis: ${Math.round(dimensionalAnalysis.score * 100)}%`,
        `harmony_score: ${Math.round(harmonyScore * 100)}%`,
        `complementary_traits: ${Math.round(complementaryScore * 100)}%`
      ],
      detailed_analysis: {
        cosine_similarity: cosineSimilarity,
        dimensional_analysis: dimensionalAnalysis,
        harmony_score: harmonyScore,
        complementary_score: complementaryScore,
        key_alignments: dimensionalAnalysis.alignments,
        key_differences: dimensionalAnalysis.differences
      }
    };
  }

  // Calculate cosine similarity between two vectors
  calculateCosineSimilarity(vector1, vector2) {
    if (vector1.length !== vector2.length) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
      norm1 += vector1[i] * vector1[i];
      norm2 += vector2[i] * vector2[i];
    }
    
    if (norm1 === 0 || norm2 === 0) return 0;
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  // Analyze dimensional compatibility with trait-specific weights
  analyzeDimensionalCompatibility(vector1, vector2) {
    const dimensions = {
      // Big Five (0-4) - High importance
      big_five: { start: 0, end: 4, weight: 3.0 },
      // Attachment styles (20-23) - High importance  
      attachment: { start: 20, end: 23, weight: 2.5 },
      // Love languages (40-44) - Medium importance
      love_languages: { start: 40, end: 44, weight: 2.0 },
      // Communication (60-64) - High importance
      communication: { start: 60, end: 64, weight: 2.5 },
      // Values (100-111) - Very high importance
      values: { start: 100, end: 111, weight: 3.5 },
      // Lifestyle (140-143) - Medium importance
      lifestyle: { start: 140, end: 143, weight: 1.5 },
      // Relationship readiness (180-183) - High importance
      relationship: { start: 180, end: 183, weight: 2.5 },
      // Interests (220-231) - Low importance
      interests: { start: 220, end: 231, weight: 1.0 }
    };
    
    let totalScore = 0;
    let totalWeight = 0;
    const alignments = [];
    const differences = [];
    
    for (const [dimName, dim] of Object.entries(dimensions)) {
      const dimScore = this.calculateDimensionalScore(
        vector1.slice(dim.start, dim.end + 1),
        vector2.slice(dim.start, dim.end + 1)
      );
      
      totalScore += dimScore * dim.weight;
      totalWeight += dim.weight;
      
      if (dimScore > 0.8) {
        alignments.push({ dimension: dimName, score: dimScore });
      } else if (dimScore < 0.3) {
        differences.push({ dimension: dimName, score: dimScore });
      }
    }
    
    return {
      score: totalScore / totalWeight,
      alignments: alignments.sort((a, b) => b.score - a.score),
      differences: differences.sort((a, b) => a.score - b.score)
    };
  }

  // Calculate score for a specific dimension
  calculateDimensionalScore(dim1, dim2) {
    if (dim1.length !== dim2.length) return 0;
    
    let totalDiff = 0;
    let activeValues = 0;
    
    for (let i = 0; i < dim1.length; i++) {
      if (dim1[i] > 0.1 || dim2[i] > 0.1) { // Only consider active traits
        totalDiff += Math.abs(dim1[i] - dim2[i]);
        activeValues++;
      }
    }
    
    if (activeValues === 0) return 0.5; // Neutral if no active traits
    
    return 1 - (totalDiff / activeValues); // Convert difference to similarity
  }

  // Calculate harmony score using attraction/repulsion forces
  calculateHarmonyScore(vector1, vector2) {
    // Identify traits that create attraction vs repulsion
    let attraction = 0;
    let repulsion = 0;
    
    // Certain trait combinations create strong attraction
    const attractionFactors = this.calculateAttractionFactors(vector1, vector2);
    const repulsionFactors = this.calculateRepulsionFactors(vector1, vector2);
    
    attraction = attractionFactors.reduce((sum, factor) => sum + factor.strength, 0);
    repulsion = repulsionFactors.reduce((sum, factor) => sum + factor.strength, 0);
    
    // Apply harmony formula: Harmony = (Attraction^1.2) / (1 + Repulsion^1.5)
    const harmonyScore = Math.pow(attraction, 1.2) / (1 + Math.pow(repulsion, 1.5));
    
    // Normalize to 0-1 range
    return Math.min(1.0, harmonyScore / 2.0);
  }

  // Analyze complementary traits (opposites that attract)
  analyzeComplementaryTraits(vector1, vector2) {
    // Identify beneficial complementary patterns
    const complementaryPairs = [
      { trait1: 2, trait2: 2, type: 'introvert_extrovert' }, // Extraversion
      { trait1: 1, trait2: 1, type: 'structure_flexibility' }, // Conscientiousness
      { trait1: 0, trait2: 0, type: 'stability_adventure' } // Openness
    ];
    
    let complementaryScore = 0;
    let complementaryCount = 0;
    
    complementaryPairs.forEach(pair => {
      const val1 = vector1[pair.trait1];
      const val2 = vector2[pair.trait2];
      
      // Check if they're complementary (one high, one low)
      if ((val1 > 0.7 && val2 < 0.3) || (val1 < 0.3 && val2 > 0.7)) {
        complementaryScore += 0.8; // Complementary traits get positive score
        complementaryCount++;
      } else if (Math.abs(val1 - val2) < 0.2) {
        complementaryScore += 0.6; // Similar traits get moderate score
        complementaryCount++;
      }
    });
    
    return complementaryCount > 0 ? complementaryScore / complementaryCount : 0.5;
  }

  // Check if target user meets current user's filters
  checkCompatibilityFilters(currentFilters, targetProfile) {
    const checks = {
      age: this.checkAgeFilter(currentFilters.age_range, targetProfile.basicInfo.age),
      location: this.checkLocationFilter(currentFilters.location_radius, targetProfile.basicInfo.location),
      relationship_goals: this.checkRelationshipGoalsFilter(currentFilters.relationship_goals, targetProfile),
      deal_breakers: this.checkDealBreakers(currentFilters.deal_breakers, targetProfile),
      must_haves: this.checkMustHaves(currentFilters.must_haves, targetProfile)
    };
    
    const passedChecks = Object.values(checks).filter(check => check.passed).length;
    const totalChecks = Object.keys(checks).length;
    
    return {
      overall_pass: passedChecks >= totalChecks - 1, // Allow one filter failure
      individual_checks: checks,
      pass_rate: passedChecks / totalChecks
    };
  }

  // Generate comprehensive compatibility report
  async generateCompatibilityReport(compatibility, filterMatch, currentProfile, targetProfile) {
    const overallScore = compatibility.overall_score;
    const isHighCompatibility = overallScore > 0.75;
    const isModerateCompatibility = overallScore > 0.6;
    
    // Extract key insights
    const topStrengths = this.identifyTopCompatibilityStrengths(compatibility);
    const potentialChallenges = this.identifyPotentialChallenges(compatibility);
    const conversationStarters = await this.generateConversationStarters(currentProfile, targetProfile);
    
    return {
      compatibility_score: overallScore,
      recommendation: this.generateRecommendation(overallScore, filterMatch),
      
      // Key insights
      top_strengths: topStrengths,
      potential_challenges: potentialChallenges,
      
      // Detailed breakdown
      detailed_scores: compatibility.component_scores,
      filter_results: filterMatch,
      
      // Interaction suggestions
      conversation_starters: conversationStarters,
      shared_interests: this.findSharedInterests(currentProfile, targetProfile),
      compatibility_summary: this.generateCompatibilitySummary(compatibility, targetProfile),
      
      // Metadata
      analysis_confidence: compatibility.confidence,
      analysis_timestamp: new Date().toISOString(),
      profiles_analyzed: {
        current_user_confidence: currentProfile.metadata.analysis_confidence,
        target_user_confidence: targetProfile.metadata.analysis_confidence
      }
    };
  }

  // Helper methods for specific compatibility analyses
  analyzePersonalityCompatibility(currentTraits, targetTraits) {
    // Big Five compatibility analysis
    const bigFiveScore = this.compareBigFive(currentTraits.bigFive, targetTraits.bigFive);
    
    return {
      score: bigFiveScore,
      confidence: 0.8,
      factors: ['big_five_alignment']
    };
  }

  analyzeCommunicationCompatibility(currentComm, targetComm) {
    if (!currentComm || !targetComm) {
      return { score: 0.5, confidence: 0.3, factors: ['insufficient_data'] };
    }
    
    // Calculate compatibility for each communication dimension
    const directnessMatch = 1 - Math.abs(currentComm.directness - targetComm.directness);
    const emotionalMatch = 1 - Math.abs(currentComm.emotionalExpression - targetComm.emotionalExpression);
    const humorMatch = 1 - Math.abs(currentComm.humor - targetComm.humor);
    
    const avgScore = (directnessMatch + emotionalMatch + humorMatch) / 3;
    
    return {
      score: avgScore,
      confidence: 0.7,
      factors: ['communication_style_alignment']
    };
  }

  analyzeValuesAlignment(currentValues, targetValues, currentValuesList, targetValuesList) {
    if (!currentValuesList || !targetValuesList) {
      return { score: 0.5, confidence: 0.3, factors: ['insufficient_data'] };
    }
    
    // Find shared values
    const sharedValues = currentValuesList.filter(value => targetValuesList.includes(value));
    const totalUniqueValues = new Set([...currentValuesList, ...targetValuesList]).size;
    
    const alignmentScore = sharedValues.length / Math.max(totalUniqueValues, 1);
    
    return {
      score: alignmentScore,
      confidence: 0.9,
      factors: [`shared_values: ${sharedValues.join(', ')}`]
    };
  }

  analyzeLifestyleCompatibility(currentLifestyle, targetLifestyle, currentLifestyleData, targetLifestyleData) {
    if (!currentLifestyleData || !targetLifestyleData) {
      return { score: 0.5, confidence: 0.3, factors: ['insufficient_data'] };
    }
    
    // Compare lifestyle factors
    const socialMatch = 1 - Math.abs(currentLifestyleData.socialLevel - targetLifestyleData.socialLevel);
    const activityMatch = 1 - Math.abs(currentLifestyleData.activityLevel - targetLifestyleData.activityLevel);
    const routineMatch = 1 - Math.abs(currentLifestyleData.routinePreference - targetLifestyleData.routinePreference);
    
    const avgScore = (socialMatch + activityMatch + routineMatch) / 3;
    
    return {
      score: avgScore,
      confidence: 0.6,
      factors: ['lifestyle_alignment']
    };
  }

  analyzeRelationshipCompatibility(currentPhilosophy, targetPhilosophy, currentReadiness, targetReadiness) {
    if (!currentReadiness || !targetReadiness) {
      return { score: 0.5, confidence: 0.3, factors: ['insufficient_data'] };
    }
    
    // Compare relationship readiness factors
    const commitmentMatch = 1 - Math.abs(currentReadiness.commitment - targetReadiness.commitment);
    const availabilityMatch = 1 - Math.abs(currentReadiness.emotional_availability - targetReadiness.emotional_availability);
    
    const avgScore = (commitmentMatch + availabilityMatch) / 2;
    
    return {
      score: avgScore,
      confidence: 0.7,
      factors: ['relationship_readiness_alignment']
    };
  }

  analyzeEmotionalCompatibility(currentEI, targetEI) {
    if (!currentEI || !targetEI) {
      return { score: 0.5, confidence: 0.3, factors: ['insufficient_data'] };
    }
    
    // Compare emotional intelligence factors
    const selfAwarenessMatch = 1 - Math.abs(currentEI.self_awareness - targetEI.self_awareness);
    const empathyMatch = 1 - Math.abs(currentEI.empathy - targetEI.empathy);
    
    const avgScore = (selfAwarenessMatch + empathyMatch) / 2;
    
    return {
      score: avgScore,
      confidence: 0.6,
      factors: ['emotional_intelligence_alignment']
    };
  }

  // Additional helper methods would be implemented here...
  
  calculateOverallConfidence(confidences) {
    const validConfidences = confidences.filter(c => c && c > 0);
    return validConfidences.length > 0 ? 
      validConfidences.reduce((sum, c) => sum + c, 0) / validConfidences.length : 0.5;
  }

  // Placeholder methods that would be fully implemented
  compareBigFive(bigFive1, bigFive2) { return 0.7; }
  calculateAttractionFactors(v1, v2) { return [{strength: 0.8}]; }
  calculateRepulsionFactors(v1, v2) { return [{strength: 0.2}]; }
  checkAgeFilter(range, age) { return {passed: true}; }
  checkLocationFilter(radius, location) { return {passed: true}; }
  checkRelationshipGoalsFilter(goals, profile) { return {passed: true}; }
  checkDealBreakers(breakers, profile) { return {passed: true}; }
  checkMustHaves(mustHaves, profile) { return {passed: true}; }
  identifyTopCompatibilityStrengths(comp) { return ['shared values', 'communication style']; }
  identifyPotentialChallenges(comp) { return []; }
  async generateConversationStarters(p1, p2) { return ['Ask about their interests']; }
  findSharedInterests(p1, p2) { return []; }
  generateCompatibilitySummary(comp, profile) { return 'High compatibility match'; }
  generateRecommendation(score, filters) { return 'Highly recommended match'; }
  async getCurrentUserProfile(userId) { return {}; }
  generateErrorReport(error) { return {error: error.message, score: 0}; }
}

export default new AIProfileAnalyzer();