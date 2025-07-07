// services/CompatibilityEngine.js
// Advanced compatibility system that combines personality types, virtue profiles, and research insights

export class CompatibilityEngine {
  constructor(knowledgeBase) {
    this.knowledgeBase = knowledgeBase || {};
    this.weights = {
      // Based on research insights from your documents
      sn_similarity: 30, // Most important - how they perceive the world
      tf_similarity: 25, // How they make decisions and express care
      virtue_alignment: 25, // Deep character compatibility 
      identity_stability: 15, // Assertive/Turbulent - emotional stability
      ei_balance: 3, // Energy source - can be complementary
      jp_balance: 2  // Lifestyle - can be complementary
    };
  }

  // Main compatibility analysis function
  calculateCompatibility(user1, user2) {
    if (!user1.personalityType || !user2.personalityType) {
      return {
        score: 0,
        rating: "Unknown",
        factors: [],
        insights: ["Personality assessment needed for both users"],
        researchBased: false
      };
    }

    const factors = [];
    let totalScore = 0;
    const maxScore = 100;

    // 1. Core Communication Compatibility (S/N)
    const snScore = this.analyzeSensingIntuition(user1, user2);
    factors.push(snScore);
    totalScore += snScore.weightedScore;

    // 2. Decision-Making Compatibility (T/F) 
    const tfScore = this.analyzeThinkingFeeling(user1, user2);
    factors.push(tfScore);
    totalScore += tfScore.weightedScore;

    // 3. Virtue Alignment (if available)
    const virtueScore = this.analyzeVirtueAlignment(user1, user2);
    if (virtueScore) {
      factors.push(virtueScore);
      totalScore += virtueScore.weightedScore;
    }

    // 4. Emotional Stability (A/T)
    const stabilityScore = this.analyzeEmotionalStability(user1, user2);
    factors.push(stabilityScore);
    totalScore += stabilityScore.weightedScore;

    // 5. Energy Balance (E/I)
    const energyScore = this.analyzeEnergyBalance(user1, user2);
    factors.push(energyScore);
    totalScore += energyScore.weightedScore;

    // 6. Lifestyle Balance (J/P)
    const lifestyleScore = this.analyzeLifestyleBalance(user1, user2);
    factors.push(lifestyleScore);
    totalScore += lifestyleScore.weightedScore;

    const percentageScore = Math.round((totalScore / maxScore) * 100);
    const rating = this.getRatingFromScore(percentageScore);
    const insights = this.generateInsights(factors, user1, user2);

    return {
      score: percentageScore,
      rating,
      factors,
      insights,
      researchBased: true,
      user1Type: user1.personalityType,
      user2Type: user2.personalityType
    };
  }

  // Analyze S/N compatibility - most critical factor
  analyzeSensingIntuition(user1, user2) {
    const user1SN = user1.personalityType[1];
    const user2SN = user2.personalityType[1];
    const isMatch = user1SN === user2SN;
    
    const baseScore = isMatch ? this.weights.sn_similarity : 0;
    
    return {
      factor: "Worldview Compatibility (S/N)",
      user1Trait: user1SN === 'S' ? 'Sensing' : 'Intuitive',
      user2Trait: user2SN === 'S' ? 'Sensing' : 'Intuitive',
      isPositive: isMatch,
      rawScore: baseScore,
      weightedScore: baseScore,
      explanation: isMatch 
        ? "You both share the same way of taking in information, making communication natural and effortless."
        : "You perceive the world differently - one focuses on concrete details, the other on patterns and possibilities. This can create rich dialogue but may require extra understanding.",
      researchNote: "Research shows sharing S/N preference is highly beneficial for long-term compatibility."
    };
  }

  // Analyze T/F compatibility - second most critical
  analyzeThinkingFeeling(user1, user2) {
    const user1TF = user1.personalityType[2];
    const user2TF = user2.personalityType[2];
    const isMatch = user1TF === user2TF;
    
    const baseScore = isMatch ? this.weights.tf_similarity : 0;
    
    return {
      factor: "Decision-Making Compatibility (T/F)",
      user1Trait: user1TF === 'T' ? 'Thinking' : 'Feeling',
      user2Trait: user2TF === 'T' ? 'Thinking' : 'Feeling', 
      isPositive: isMatch,
      rawScore: baseScore,
      weightedScore: baseScore,
      explanation: isMatch
        ? "You both approach decisions in similar ways, whether through logical analysis or personal values."
        : "You have different decision-making styles. One prioritizes logic and objectivity, the other considers personal impact and values. This can be complementary but requires mutual understanding.",
      researchNote: "T/F differences can be a major source of misunderstanding if not addressed with good communication."
    };
  }

  // Analyze virtue alignment if virtue profiles exist
  analyzeVirtueAlignment(user1, user2) {
    if (!user1.virtueProfile || !user2.virtueProfile) {
      return null;
    }

    let user1Top = [];
    let user2Top = [];

    try {
      user1Top = user1.virtueProfile.getTopVirtues ? user1.virtueProfile.getTopVirtues(3) : [];
      user2Top = user2.virtueProfile.getTopVirtues ? user2.virtueProfile.getTopVirtues(3) : [];
    } catch (error) {
      console.error('Error getting top virtues:', error);
      return null;
    }
    
    if (user1Top.length === 0 || user2Top.length === 0) {
      return null;
    }

    // Calculate overlap in top virtues
    const user1Virtues = new Set(user1Top.map(v => v.virtue));
    const user2Virtues = new Set(user2Top.map(v => v.virtue));
    
    const overlap = [...user1Virtues].filter(v => user2Virtues.has(v));
    const overlapScore = (overlap.length / 3) * this.weights.virtue_alignment;
    
    // Get virtue names for display
    const getVirtueName = (virtue) => {
      const virtueCategories = {
        'WISDOM': 'Wisdom',
        'COURAGE': 'Courage',
        'HUMANITY': 'Humanity',
        'JUSTICE': 'Justice',
        'TEMPERANCE': 'Temperance',
        'TRANSCENDENCE': 'Transcendence',
        'RESPECT': 'Respect',
        'INTEGRITY': 'Integrity'
      };
      return virtueCategories[virtue] || virtue;
    };
    
    return {
      factor: "Core Values Alignment",
      user1Trait: user1Top.map(v => v.customTerm || getVirtueName(v.virtue)).join(', '),
      user2Trait: user2Top.map(v => v.customTerm || getVirtueName(v.virtue)).join(', '),
      isPositive: overlap.length > 0,
      rawScore: overlapScore,
      weightedScore: overlapScore,
      sharedVirtues: overlap,
      explanation: overlap.length > 0 
        ? `You share ${overlap.length} core values: ${overlap.map(v => getVirtueName(v)).join(', ')}. This suggests deep compatibility in what matters most to you.`
        : "Your core values are different, which could lead to rich discussions but might require extra effort to understand each other's priorities.",
      researchNote: "Shared core values are one of the strongest predictors of long-term relationship satisfaction."
    };
  }

  // Analyze emotional stability (A/T) - critical for relationship health
  analyzeEmotionalStability(user1, user2) {
    const user1Identity = user1.personalityType[5];
    const user2Identity = user2.personalityType[5];
    
    let score = 0;
    let explanation = "";
    
    if (user1Identity === 'A' && user2Identity === 'A') {
      score = this.weights.identity_stability;
      explanation = "Both of you tend to be emotionally stable and resilient, creating a solid foundation for handling life's challenges together.";
    } else if (user1Identity === 'A' || user2Identity === 'A') {
      score = this.weights.identity_stability * 0.6;
      explanation = "One of you provides emotional stability while the other may be more sensitive and growth-oriented. This can create a supportive dynamic.";
    } else {
      score = 0;
      explanation = "Both of you may be more sensitive to stress and prone to self-doubt. While this can create deep empathy, you'll want to support each other's emotional well-being.";
    }
    
    return {
      factor: "Emotional Stability",
      user1Trait: user1Identity === 'A' ? 'Assertive' : 'Turbulent',
      user2Trait: user2Identity === 'A' ? 'Assertive' : 'Turbulent',
      isPositive: score > 0,
      rawScore: score,
      weightedScore: score,
      explanation,
      researchNote: "Low neuroticism (Assertive identity) is consistently linked to higher relationship satisfaction."
    };
  }

  // Analyze energy balance (E/I) - can be complementary
  analyzeEnergyBalance(user1, user2) {
    const user1EI = user1.personalityType[0];
    const user2EI = user2.personalityType[0];
    const isDifferent = user1EI !== user2EI;
    
    const score = isDifferent ? this.weights.ei_balance : this.weights.ei_balance * 0.5;
    
    return {
      factor: "Energy Balance",
      user1Trait: user1EI === 'E' ? 'Extraverted' : 'Introverted',
      user2Trait: user2EI === 'E' ? 'Extraverted' : 'Introverted',
      isPositive: true, // Both similarity and difference can work
      rawScore: score,
      weightedScore: score,
      explanation: isDifferent
        ? "Your different energy styles can create nice balance - one brings social energy, the other provides quiet depth."
        : "You both share similar energy preferences, which means you'll likely agree on social activities and downtime needs.",
      researchNote: "E/I differences can be complementary when both partners understand and respect each other's energy needs."
    };
  }

  // Analyze lifestyle balance (J/P) - can be complementary  
  analyzeLifestyleBalance(user1, user2) {
    const user1JP = user1.personalityType[3];
    const user2JP = user2.personalityType[3];
    const isDifferent = user1JP !== user2JP;
    
    const score = isDifferent ? this.weights.jp_balance : this.weights.jp_balance * 0.5;
    
    return {
      factor: "Lifestyle Balance", 
      user1Trait: user1JP === 'J' ? 'Judging (Structured)' : 'Perceiving (Flexible)',
      user2Trait: user2JP === 'J' ? 'Judging (Structured)' : 'Perceiving (Flexible)',
      isPositive: true, // Both can work
      rawScore: score,
      weightedScore: score,
      explanation: isDifferent
        ? "One of you loves planning while the other prefers spontaneity. This can create wonderful balance when you communicate about expectations."
        : "You both share similar approaches to structure and planning, which can make day-to-day life harmonious.",
      researchNote: "J/P differences can be highly complementary - the J partner provides structure while P partner adds flexibility."
    };
  }

  // Convert numerical score to rating
  getRatingFromScore(score) {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Very High"; 
    if (score >= 55) return "High";
    if (score >= 40) return "Promising";
    return "Potential for Growth";
  }

  // Generate insights based on all factors
  generateInsights(factors, user1, user2) {
    const insights = [];
    
    // Find the strongest compatibility factor
    const strongestFactor = factors.reduce((max, factor) => 
      factor.weightedScore > max.weightedScore ? factor : max
    );
    
    if (strongestFactor.weightedScore > 15) {
      insights.push(`Your strongest compatibility area is ${strongestFactor.factor}. ${strongestFactor.explanation}`);
    }

    // Find potential growth areas
    const growthAreas = factors.filter(f => !f.isPositive || f.weightedScore < 10);
    if (growthAreas.length > 0) {
      const mainGrowthArea = growthAreas[0];
      insights.push(`An area for mutual understanding: ${mainGrowthArea.explanation}`);
    }

    // Add research-backed insights
    const snFactor = factors.find(f => f.factor.includes('S/N'));
    const tfFactor = factors.find(f => f.factor.includes('T/F'));
    
    if (snFactor && tfFactor && snFactor.isPositive && tfFactor.isPositive) {
      insights.push("Research shows that sharing both communication style (S/N) and decision-making approach (T/F) creates excellent foundations for understanding each other.");
    }

    return insights;
  }

  // Generate conversation starters based on compatibility analysis
  generateConversationStarters(user1, user2, compatibilityResult) {
    const starters = [];
    const user2Type = user2.personalityType.substring(0, 4);
    
    // Get type-specific starters from knowledge base
    if (this.knowledgeBase?.conversation_starters?.[user2Type]) {
      starters.push(...this.knowledgeBase.conversation_starters[user2Type]);
    }

    // Add compatibility-specific starters
    const strongFactors = compatibilityResult.factors.filter(f => f.isPositive && f.weightedScore > 15);
    
    if (strongFactors.some(f => f.factor.includes('Values'))) {
      starters.push("What's a cause or value that's really important to you?");
    }
    
    if (strongFactors.some(f => f.factor.includes('Worldview'))) {
      starters.push("What's something you've been thinking about or learning lately?");
    }

    // Default starters if none found
    if (starters.length === 0) {
      starters.push(
        "What's been the best part of your week?",
        "What are you most looking forward to?",
        "Tell me about something that made you smile recently."
      );
    }

    return starters.slice(0, 3); // Return top 3 starters
  }
}

// Example usage and testing
export const CompatibilityEngineExample = {
  createSampleUsers() {
    return {
      user1: {
        id: "user1", 
        personalityType: "INFJ-A",
        virtueProfile: {
          getTopVirtues: () => [
            { virtue: "WISDOM", customTerm: null },
            { virtue: "HUMANITY", customTerm: "emotional intelligence" },
            { virtue: "INTEGRITY", customTerm: null }
          ]
        }
      },
      user2: {
        id: "user2",
        personalityType: "ENFP-T", 
        virtueProfile: {
          getTopVirtues: () => [
            { virtue: "WISDOM", customTerm: "curiosity" },
            { virtue: "COURAGE", customTerm: null },
            { virtue: "HUMANITY", customTerm: null }
          ]
        }
      }
    };
  },

  testCompatibility() {
    const engine = new CompatibilityEngine();
    const { user1, user2 } = this.createSampleUsers();
    
    const result = engine.calculateCompatibility(user1, user2);
    
    console.log("Compatibility Analysis:");
    console.log(`Score: ${result.score}% (${result.rating})`);
    console.log("\nFactors:");
    result.factors.forEach(factor => {
      console.log(`- ${factor.factor}: ${factor.weightedScore.toFixed(1)} points`);
      console.log(`  ${factor.explanation}`);
    });
    console.log("\nInsights:");
    result.insights.forEach(insight => console.log(`- ${insight}`));
    
    return result;
  }
};