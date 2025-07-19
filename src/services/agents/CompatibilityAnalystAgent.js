const KnowledgeBaseService = require('../KnowledgeBaseService');

class CompatibilityAnalystAgent {
  constructor() {
    this.knowledgeBase = new KnowledgeBaseService();
    console.log('🔬 Compatibility Analyst Agent ready');
  }

  async analyzeCompatibility(user1Profile, user2Profile, userPreferences = {}) {
    console.log(`🔍 Analyzing compatibility: ${user1Profile.personalityType} + ${user2Profile.personalityType}`);
    
    try {
      // Get detailed insights from knowledge base
      const insights = await this.knowledgeBase.retrieveCompatibilityInsights(
        user1Profile.personalityType,
        user2Profile.personalityType,
        userPreferences
      );

      // Add interest compatibility analysis
      const interestCompatibility = this.analyzeInterestCompatibility(
        user1Profile.interests || [],
        user2Profile.interests || []
      );

      // Combine all analysis
      return {
        personalityCompatibility: insights,
        interestCompatibility,
        overallScore: this.calculateOverallScore(insights, interestCompatibility),
        detailedAnalysis: this.generateDetailedAnalysis(insights, interestCompatibility, user1Profile, user2Profile)
      };
    } catch (error) {
      console.error('❌ Error in Compatibility Analyst:', error);
      throw error;
    }
  }

  analyzeInterestCompatibility(interests1, interests2) {
    const shared = interests1.filter(interest => 
      interests2.some(int2 => int2.toLowerCase().includes(interest.toLowerCase()) || 
                             interest.toLowerCase().includes(int2.toLowerCase()))
    );

    const complementary = this.findComplementaryInterests(interests1, interests2);
    
    return {
      sharedInterests: shared,
      complementaryInterests: complementary,
      score: (shared.length * 20) + (complementary.length * 10),
      analysis: this.generateInterestAnalysis(shared, complementary, interests1, interests2)
    };
  }

  findComplementaryInterests(interests1, interests2) {
    const complementaryPairs = {
      'reading': ['writing', 'literature', 'books'],
      'travel': ['photography', 'culture', 'adventure'],
      'music': ['concerts', 'dancing', 'instruments'],
      'fitness': ['hiking', 'sports', 'outdoor activities'],
      'cooking': ['food', 'restaurants', 'wine']
    };

    const complementary = [];
    
    interests1.forEach(int1 => {
      const lower1 = int1.toLowerCase();
      Object.keys(complementaryPairs).forEach(key => {
        if (lower1.includes(key)) {
          interests2.forEach(int2 => {
            const lower2 = int2.toLowerCase();
            if (complementaryPairs[key].some(comp => lower2.includes(comp))) {
              complementary.push({ interest1: int1, interest2: int2, connection: key });
            }
          });
        }
      });
    });

    return complementary;
  }

  generateInterestAnalysis(shared, complementary, interests1, interests2) {
    if (shared.length === 0 && complementary.length === 0) {
      return "While you don't share obvious common interests, this can be an opportunity to explore new activities together and learn from each other's passions.";
    }

    let analysis = '';
    
    if (shared.length > 0) {
      analysis += `You share ${shared.length} common interests (${shared.join(', ')}), which provides great foundation for activities you can enjoy together. `;
    }

    if (complementary.length > 0) {
      analysis += `Your interests complement each other well - for example, ${complementary[0].interest1} and ${complementary[0].interest2} often go hand in hand. `;
    }

    return analysis;
  }

  calculateOverallScore(personalityInsights, interestCompatibility) {
    const personalityWeight = 0.7;
    const interestWeight = 0.3;
    
    const personalityScore = personalityInsights.compatibility || 75;
    const interestScore = Math.min(interestCompatibility.score, 100);
    
    return Math.round((personalityScore * personalityWeight) + (interestScore * interestWeight));
  }

  generateDetailedAnalysis(insights, interestComp, user1, user2) {
    return {
      summary: `${user1.name || 'You'} and ${user2.name || 'this person'} have ${insights.compatibility}% personality compatibility with strong potential for a meaningful connection.`,
      strengthAreas: insights.strengths,
      growthAreas: insights.challenges,
      recommendations: insights.advice,
      interestSynergy: interestComp.analysis
    };
  }
}

module.exports = CompatibilityAnalystAgent;