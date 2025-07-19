const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');

class MasterMindAgent {
  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.llm = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.6,
      });
      this.outputParser = new StringOutputParser();
      this.enabled = true;
    } else {
      this.enabled = false;
    }
    
    console.log('🧙‍♂️ MasterMind Agent initialized - Strategic oversight ready');
  }

  async conductWeeklyAnalysis(userProfile, conversationHistory, matchingHistory = [], userBehavior = {}) {
    if (!this.enabled) {
      return this.getFallbackAnalysis();
    }

    const strategicTemplate = PromptTemplate.fromTemplate(`
      You are the MasterMind agent conducting a strategic analysis of a user's dating journey. 
      You have a bird's-eye view of their entire experience and can identify patterns they might not see.

      USER PROFILE EVOLUTION:
      Current Profile: {currentProfile}
      
      CONVERSATION PATTERNS (Last 7 days):
      {recentConversations}
      
      MATCHING BEHAVIOR:
      {matchingHistory}
      
      BEHAVIORAL INSIGHTS:
      {userBehavior}

      STRATEGIC ANALYSIS FRAMEWORK:

      1. **Pattern Recognition**: What are the biggest patterns in their dating approach?
      2. **Blind Spots**: What might they be missing about themselves or their preferences?
      3. **Success Blockers**: What's preventing them from finding the right connection?
      4. **Untapped Potential**: What strengths aren't they leveraging?
      5. **Strategic Recommendation**: One major shift that could transform their dating success

      Provide insights as a wise relationship strategist who sees the bigger picture.
      Format your response in clear paragraphs with strategic insights.

      Focus on actionable, profound insights that could genuinely help them find love.
    `);

    try {
      const chain = strategicTemplate.pipe(this.llm).pipe(this.outputParser);
      
      const result = await chain.invoke({
        currentProfile: JSON.stringify(userProfile, null, 2),
        recentConversations: this.summarizeConversations(conversationHistory),
        matchingHistory: this.summarizeMatches(matchingHistory),
        userBehavior: JSON.stringify(userBehavior, null, 2)
      });

      return {
        type: 'strategic_analysis',
        analysis: result,
        actionableInsights: await this.extractActionableInsights(result),
        nextWeekFocus: await this.generateNextWeekStrategy(userProfile, result)
      };
    } catch (error) {
      console.error('Error in MasterMind strategic analysis:', error);
      return this.getFallbackAnalysis();
    }
  }

  async identifyBlindSpots(userProfile, userPreferences, actualMatchingSuccess) {
    const blindSpotTemplate = PromptTemplate.fromTemplate(`
      Analyze potential blind spots in this user's dating approach:

      What they SAY they want: {statedPreferences}
      What they actually RESPOND to: {actualBehavior}
      Their self-description: {selfDescription}

      Identify discrepancies between:
      1. What they think they want vs. what they actually respond to
      2. How they see themselves vs. how they might come across
      3. Their stated deal-breakers vs. their actual flexibility

      Provide gentle, insightful observations that could help them understand themselves better.
      Be supportive but honest about potential blind spots.
    `);

    try {
      const chain = blindSpotTemplate.pipe(this.llm).pipe(this.outputParser);
      
      const result = await chain.invoke({
        statedPreferences: JSON.stringify(userPreferences),
        actualBehavior: JSON.stringify(actualMatchingSuccess),
        selfDescription: userProfile.aboutMe || 'No self-description provided'
      });

      return result;
    } catch (error) {
      console.error('Error identifying blind spots:', error);
      return "I notice you have strong self-awareness. Keep staying open to unexpected connections that might surprise you.";
    }
  }

  async generateProactiveCheckin(userProfile, daysSinceLastActive = 0) {
    const checkinTemplate = PromptTemplate.fromTemplate(`
      Generate a proactive, personalized check-in message for a user who hasn't been active for {daysSinceLastActive} days.

      User Profile: {userProfile}

      Create a message that:
      1. Feels personal and shows you remember them
      2. Offers genuine value (insight, tip, or encouragement)
      3. Gently re-engages them in their dating journey
      4. Shows progress or new opportunities

      Make it feel like a caring friend checking in, not a generic notification.
      Keep it conversational and warm.
    `);

    try {
      const chain = checkinTemplate.pipe(this.llm).pipe(this.outputParser);
      
      const result = await chain.invoke({
        daysSinceLastActive: daysSinceLastActive,
        userProfile: JSON.stringify(userProfile, null, 2)
      });

      return {
        type: 'proactive_checkin',
        message: result,
        suggestedActions: [
          'Review new matches found while you were away',
          'Update your profile with recent insights',
          'Explore compatibility with someone new'
        ]
      };
    } catch (error) {
      console.error('Error generating proactive check-in:', error);
      return this.getFallbackCheckin();
    }
  }

  // Helper methods
  summarizeConversations(conversationHistory) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return 'No recent conversations';
    }

    const topics = [];
    const userMessages = conversationHistory.filter(msg => msg.user);
    
    userMessages.forEach(msg => {
      if (msg.text.length > 20) { // Only meaningful messages
        topics.push(msg.text.substring(0, 100) + '...');
      }
    });

    return topics.slice(-10).join('\n'); // Last 10 meaningful exchanges
  }

  summarizeMatches(matchingHistory) {
    if (!matchingHistory || matchingHistory.length === 0) {
      return 'No previous matches to analyze';
    }

    return matchingHistory.map(match => 
      `Match with ${match.name}: ${match.outcome || 'ongoing'}`
    ).join('\n');
  }

  async extractActionableInsights(analysis) {
    // Extract specific actionable items from the strategic analysis
    const insights = analysis.split('\n').filter(line => 
      line.includes('should') || line.includes('could') || line.includes('try')
    );

    return insights.slice(0, 3); // Top 3 actionable insights
  }

  async generateNextWeekStrategy(userProfile, analysis) {
    return {
      focus: 'Authentic connection building',
      goals: [
        'Have 3 meaningful conversations',
        'Ask one vulnerable question',
        'Practice active listening'
      ],
      experiment: 'Try connecting with someone slightly outside your usual type'
    };
  }

  getFallbackAnalysis() {
    return {
      type: 'strategic_analysis',
      analysis: `Based on your journey so far, I see someone who values authentic connections and is thoughtful about relationships. 

Your biggest strength is your self-awareness and commitment to finding genuine compatibility. This sets you apart from people who focus only on surface-level attraction.

One area for growth might be staying open to unexpected connections. Sometimes the best relationships come from people who surprise us in ways we didn't anticipate.

My strategic recommendation: Focus on having deeper conversations earlier in the process. Your depth is an asset - use it to quickly identify people who can match your level of emotional intelligence.`,
      actionableInsights: [
        'Ask more vulnerable questions in early conversations',
        'Stay open to people who might surprise you',
        'Lead with your authentic self rather than trying to appeal to everyone'
      ],
      nextWeekFocus: {
        focus: 'Authentic vulnerability',
        goals: ['Share something meaningful about yourself', 'Ask deeper questions', 'Practice being genuinely curious'],
        experiment: 'Connect with someone who has a different background but shared values'
      }
    };
  }

  getFallbackCheckin() {
    return {
      type: 'proactive_checkin',
      message: "I've been thinking about your dating journey and wanted to check in. You've shown such thoughtfulness in looking for genuine connection - that's rare and valuable. I have some new insights about your compatibility patterns that I think you'll find interesting. Ready to explore what I've discovered?",
      suggestedActions: [
        'Review your evolving preferences',
        'Explore new potential matches',
        'Get insights on your dating patterns'
      ]
    };
  }
}

module.exports = MasterMindAgent;