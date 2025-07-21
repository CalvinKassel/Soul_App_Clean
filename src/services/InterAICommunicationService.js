// Inter-AI Communication Service for SoulAI
// Enables AI agents to communicate and collaborate on matchmaking

class InterAICommunicationService {
  constructor() {
    this.baseUrl = process.env.REACT_NATIVE_API_URL || 'http://localhost:3000';
    this.apiKey = process.env.REACT_NATIVE_API_KEY;
    this.activeConnections = new Map(); // Track active AI-to-AI connections
  }

  // Request analysis of another user's profile
  async requestProfileAnalysis(requestingUserId, targetUserId, analysisType = 'compatibility') {
    try {
      // Check privacy permissions first
      const canAnalyze = await this.checkAnalysisPermissions(requestingUserId, targetUserId);
      if (!canAnalyze.allowed) {
        console.log(`Analysis blocked: ${canAnalyze.reason}`);
        return null;
      }

      // Get target user's AI agent configuration
      const targetAI = await this.getAIAgent(targetUserId);
      if (!targetAI) {
        console.log(`No AI agent found for user ${targetUserId}`);
        return null;
      }

      // Perform the analysis request
      const analysis = await this.performAnalysisRequest(requestingUserId, targetUserId, analysisType);
      
      // Log the interaction for transparency
      await this.logInterAIInteraction(requestingUserId, targetUserId, 'profile_analysis', {
        analysis_type: analysisType,
        result_quality: analysis ? 'success' : 'failed'
      });

      return analysis;
    } catch (error) {
      console.error('Profile analysis request failed:', error);
      return null;
    }
  }

  // Enable bidirectional compatibility assessment
  async performMutualAnalysis(userAId, userBId) {
    try {
      // Perform both directions of analysis in parallel
      const [analysisAtoB, analysisBtoA] = await Promise.all([
        this.requestProfileAnalysis(userAId, userBId, 'full_compatibility'),
        this.requestProfileAnalysis(userBId, userAId, 'full_compatibility')
      ]);

      if (!analysisAtoB || !analysisBtoA) {
        return null;
      }

      // Synthesize mutual compatibility score
      const mutualScore = this.calculateMutualCompatibility(analysisAtoB, analysisBtoA);
      
      // Extract key compatibility factors
      const compatibilityFactors = this.extractCompatibilityFactors(analysisAtoB, analysisBtoA);

      const result = {
        user_a_perspective: analysisAtoB,
        user_b_perspective: analysisBtoA,
        mutual_compatibility: mutualScore,
        compatibility_factors: compatibilityFactors,
        analysis_timestamp: new Date().toISOString(),
        confidence_score: this.calculateAnalysisConfidence(analysisAtoB, analysisBtoA)
      };

      // Cache the result for future use
      await this.cacheMutualAnalysis(userAId, userBId, result);

      return result;
    } catch (error) {
      console.error('Mutual analysis failed:', error);
      return null;
    }
  }

  // Enable AI agents to "introduce" users to each other
  async facilitateIntroduction(matchmakerUserId, userAId, userBId, introductionContext = {}) {
    try {
      // Get or perform mutual analysis
      let mutualAnalysis = await this.getCachedMutualAnalysis(userAId, userBId);
      if (!mutualAnalysis) {
        mutualAnalysis = await this.performMutualAnalysis(userAId, userBId);
      }

      if (!mutualAnalysis || mutualAnalysis.mutual_compatibility.score < 0.6) {
        return {
          success: false, 
          reason: 'insufficient_compatibility',
          score: mutualAnalysis?.mutual_compatibility?.score || 0
        };
      }

      // Generate personalized introduction messages
      const introForA = await this.generateIntroductionMessage(userAId, userBId, mutualAnalysis, 'perspective_a');
      const introForB = await this.generateIntroductionMessage(userBId, userAId, mutualAnalysis, 'perspective_b');

      // Send introduction messages through their respective AI agents
      const [sentToA, sentToB] = await Promise.all([
        this.sendIntroductionMessage(userAId, introForA),
        this.sendIntroductionMessage(userBId, introForB)
      ]);

      if (sentToA && sentToB) {
        // Create mutual match record
        const matchRecord = await this.createMutualMatch(userAId, userBId, mutualAnalysis);
        
        // Log successful introduction
        await this.logInterAIInteraction(userAId, userBId, 'introduction_facilitated', {
          compatibility_score: mutualAnalysis.mutual_compatibility.score,
          introduction_context: introductionContext,
          match_id: matchRecord.id
        });

        return {
          success: true, 
          match_created: true,
          match_id: matchRecord.id,
          compatibility_score: mutualAnalysis.mutual_compatibility.score
        };
      }

      return {success: false, reason: 'message_delivery_failed'};
    } catch (error) {
      console.error('Introduction facilitation failed:', error);
      return {success: false, reason: 'system_error', error: error.message};
    }
  }

  // Check if AI can analyze another user's profile
  async checkAnalysisPermissions(requestingUserId, targetUserId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/privacy/analysis-permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          requesting_user: requestingUserId,
          target_user: targetUserId
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Permission check failed:', error);
      return {allowed: false, reason: 'system_error'};
    }
  }

  // Get AI agent configuration for a user
  async getAIAgent(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/agent/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Failed to get AI agent:', error);
      return null;
    }
  }

  // Perform the actual analysis request
  async performAnalysisRequest(requestingUserId, targetUserId, analysisType) {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/cross-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          requesting_user: requestingUserId,
          target_user: targetUserId,
          analysis_type: analysisType,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) return null;
      const result = await response.json();
      return result.analysis;
    } catch (error) {
      console.error('Analysis request failed:', error);
      return null;
    }
  }

  // Calculate mutual compatibility from two analyses
  calculateMutualCompatibility(analysisAtoB, analysisBtoA) {
    const scoreA = analysisAtoB.compatibility_score || 0;
    const scoreB = analysisBtoA.compatibility_score || 0;
    
    // Use harmonic mean for mutual compatibility (more conservative)
    const mutualScore = (2 * scoreA * scoreB) / (scoreA + scoreB);
    
    // Extract key mutual factors
    const mutualFactors = this.findMutualFactors(analysisAtoB, analysisBtoA);
    
    return {
      score: mutualScore,
      individual_scores: {user_a: scoreA, user_b: scoreB},
      mutual_factors: mutualFactors,
      confidence: Math.min(analysisAtoB.confidence || 0.5, analysisBtoA.confidence || 0.5)
    };
  }

  // Extract compatibility factors from both analyses
  extractCompatibilityFactors(analysisAtoB, analysisBtoA) {
    const factorsA = analysisAtoB.factors || {};
    const factorsB = analysisBtoA.factors || {};
    
    return {
      shared_strengths: this.findSharedStrengths(factorsA, factorsB),
      complementary_traits: this.findComplementaryTraits(factorsA, factorsB),
      potential_challenges: this.findPotentialChallenges(factorsA, factorsB),
      conversation_compatibility: this.assessConversationCompatibility(factorsA, factorsB),
      lifestyle_alignment: this.assessLifestyleAlignment(factorsA, factorsB)
    };
  }

  // Generate personalized introduction message
  async generateIntroductionMessage(recipientId, introduceeId, mutualAnalysis, perspective) {
    const compatibilityScore = Math.round(mutualAnalysis.mutual_compatibility.score * 100);
    const topFactors = mutualAnalysis.compatibility_factors.shared_strengths.slice(0, 3);
    
    // Get profile info for personalization
    const [recipientProfile, introduceeProfile] = await Promise.all([
      this.getUserProfile(recipientId),
      this.getUserProfile(introduceeId)
    ]);

    const message = {
      type: 'introduction',
      content: `✨ I found someone really special for you!

**Meet ${introduceeProfile.display_name}, ${introduceeProfile.age}** 
📍 ${this.formatLocation(introduceeProfile.location)}

${introduceeProfile.bio}

**Why I think you two would click:**
• ${compatibilityScore}% compatibility score
• ${topFactors.map(factor => `${factor.description}`).join('\n• ')}

**What they love:** ${introduceeProfile.personality_traits.interests.slice(0, 3).join(', ')}

I have a really good feeling about this connection! Would you like me to introduce you? 💫`,
      
      metadata: {
        introducee_id: introduceeId,
        compatibility_score: compatibilityScore,
        mutual_analysis_id: mutualAnalysis.id,
        generated_at: new Date().toISOString()
      },
      
      quick_replies: [
        "Yes, introduce us!",
        "Tell me more about them",
        "What do we have in common?",
        "Maybe later"
      ]
    };

    return message;
  }

  // Send introduction message to user
  async sendIntroductionMessage(userId, message) {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/send-introduction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          user_id: userId,
          message: message,
          type: 'ai_introduction'
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send introduction message:', error);
      return false;
    }
  }

  // Create mutual match record
  async createMutualMatch(userAId, userBId, mutualAnalysis) {
    try {
      const response = await fetch(`${this.baseUrl}/api/matches/create-mutual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          user_a: userAId,
          user_b: userBId,
          mutual_analysis: mutualAnalysis,
          created_by: 'ai_introduction',
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to create match record');
      return await response.json();
    } catch (error) {
      console.error('Failed to create mutual match:', error);
      return null;
    }
  }

  // Log inter-AI interactions for transparency
  async logInterAIInteraction(userAId, userBId, interactionType, metadata = {}) {
    try {
      await fetch(`${this.baseUrl}/api/logs/ai-interaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          user_a: userAId,
          user_b: userBId,
          interaction_type: interactionType,
          metadata: metadata,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to log AI interaction:', error);
    }
  }

  // Helper methods
  findMutualFactors(analysisA, analysisB) {
    // Implementation for finding mutual compatibility factors
    return [];
  }

  findSharedStrengths(factorsA, factorsB) {
    // Implementation for finding shared strengths
    return [];
  }

  findComplementaryTraits(factorsA, factorsB) {
    // Implementation for finding complementary traits
    return [];
  }

  findPotentialChallenges(factorsA, factorsB) {
    // Implementation for finding potential challenges
    return [];
  }

  assessConversationCompatibility(factorsA, factorsB) {
    // Implementation for assessing conversation compatibility
    return {score: 0.8, factors: []};
  }

  assessLifestyleAlignment(factorsA, factorsB) {
    // Implementation for assessing lifestyle alignment
    return {score: 0.7, factors: []};
  }

  calculateAnalysisConfidence(analysisA, analysisB) {
    return Math.min(analysisA.confidence || 0.5, analysisB.confidence || 0.5);
  }

  async cacheMutualAnalysis(userAId, userBId, analysis) {
    // Implementation for caching analysis results
  }

  async getCachedMutualAnalysis(userAId, userBId) {
    // Implementation for retrieving cached analysis
    return null;
  }

  async getUserProfile(userId) {
    // Implementation for getting user profile
    return {display_name: 'User', age: 25, location: {city: 'City'}, bio: 'Bio', personality_traits: {interests: []}};
  }

  formatLocation(location) {
    return `${location.city}, ${location.state}`;
  }
}

export default new InterAICommunicationService();