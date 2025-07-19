// IntelligentAIEngine.js - Advanced AI Conversation Processing

class IntelligentAIEngine {
  constructor() {
    this.personalityKnowledge = this.loadPersonalityKnowledge();
    this.conversationPatterns = this.loadConversationPatterns();
    this.emotionalStates = ['curious', 'supportive', 'analytical', 'empathetic', 'encouraging'];
    this.conversationStage = 'initial'; // initial, discovery, deeper, analysis, guidance
    this.userProfile = {
      detectedTraits: {},
      interests: [],
      communicationStyle: null,
      personalityIndicators: {},
      emotionalState: 'neutral'
    };
  }

  // Main conversation processing method
  async generateResponse(userMessage, conversationHistory, userContext) {
    try {
      // 1. Analyze the user's message
      const messageAnalysis = this.analyzeUserMessage(userMessage, conversationHistory);
      
      // 2. Update user profile based on analysis
      this.updateUserProfile(messageAnalysis);
      
      // 3. Determine conversation stage and appropriate response type
      const responseStrategy = this.determineResponseStrategy(messageAnalysis, conversationHistory);
      
      // 4. Generate contextual, personalized response
      const response = await this.generateContextualResponse(
        messageAnalysis,
        responseStrategy,
        conversationHistory,
        userContext
      );
      
      // 5. Add conversation coaching if appropriate
      const enhancedResponse = this.addConversationGuidance(response, messageAnalysis);
      
      return enhancedResponse;
      
    } catch (error) {
      console.error('Error in AI response generation:', error);
      return this.generateFallbackResponse(userMessage);
    }
  }

  // Analyze user message for personality traits, emotions, and intent
  analyzeUserMessage(message, history) {
    const analysis = {
      content: message,
      intent: this.detectIntent(message),
      emotionalTone: this.detectEmotionalTone(message),
      personalityTraits: this.detectPersonalityTraits(message),
      topicsDiscussed: this.extractTopics(message),
      questionTypes: this.identifyQuestionTypes(message),
      communicationStyle: this.analyzeCommunicationStyle(message),
      conversationFlow: this.analyzeConversationFlow(message, history)
    };

    return analysis;
  }

  detectIntent(message) {
    const intents = {
      'self_discovery': ['understand myself', 'who am i', 'personality', 'traits', 'character'],
      'relationship_seeking': ['looking for', 'want to find', 'ideal partner', 'relationship'],
      'sharing_experience': ['happened to me', 'i think', 'i feel', 'my experience'],
      'asking_advice': ['what should', 'how do i', 'advice', 'recommend', 'suggest'],
      'expressing_emotion': ['feel', 'excited', 'nervous', 'happy', 'sad', 'frustrated'],
      'philosophical_discussion': ['meaning', 'philosophy', 'believe', 'think about life'],
      'casual_conversation': ['how are you', 'what\'s up', 'hello', 'hi', 'good morning']
    };

    const lowerMessage = message.toLowerCase();
    
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return intent;
      }
    }
    
    return 'general_conversation';
  }

  detectEmotionalTone(message) {
    const emotionalKeywords = {
      'excited': ['excited', 'thrilled', 'amazing', 'fantastic', 'awesome', '!'],
      'curious': ['wonder', 'curious', 'interested', 'want to know', '?'],
      'thoughtful': ['think', 'believe', 'consider', 'reflect', 'ponder'],
      'uncertain': ['not sure', 'maybe', 'perhaps', 'might', 'confused'],
      'confident': ['definitely', 'absolutely', 'certain', 'sure', 'confident'],
      'vulnerable': ['nervous', 'scared', 'worry', 'anxious', 'difficult']
    };

    const lowerMessage = message.toLowerCase();
    const scores = {};

    for (const [emotion, keywords] of Object.entries(emotionalKeywords)) {
      scores[emotion] = keywords.reduce((score, keyword) => {
        return score + (lowerMessage.includes(keyword) ? 1 : 0);
      }, 0);
    }

    const dominantEmotion = Object.keys(scores).reduce((a, b) => 
      scores[a] > scores[b] ? a : b
    );

    return scores[dominantEmotion] > 0 ? dominantEmotion : 'neutral';
  }

  detectPersonalityTraits(message) {
    const traits = {
      'extraversion': {
        keywords: ['social', 'party', 'people', 'outgoing', 'talk', 'meet'],
        indicators: ['enjoys social activities', 'mentions groups/parties', 'talkative style']
      },
      'openness': {
        keywords: ['creative', 'art', 'new', 'different', 'explore', 'imagination'],
        indicators: ['discusses abstract concepts', 'mentions creativity', 'openness to experience']
      },
      'conscientiousness': {
        keywords: ['plan', 'organize', 'goal', 'work', 'responsible', 'careful'],
        indicators: ['structured communication', 'mentions planning', 'detail-oriented']
      },
      'agreeableness': {
        keywords: ['help', 'kind', 'care', 'support', 'understand', 'empathy'],
        indicators: ['considerate language', 'mentions helping others', 'collaborative tone']
      },
      'neuroticism': {
        keywords: ['stress', 'worry', 'anxious', 'nervous', 'overwhelmed', 'difficult'],
        indicators: ['expresses concerns', 'emotional language', 'seeks reassurance']
      }
    };

    const detected = {};
    const lowerMessage = message.toLowerCase();

    for (const [trait, data] of Object.entries(traits)) {
      const score = data.keywords.reduce((count, keyword) => {
        return count + (lowerMessage.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (score > 0) {
        detected[trait] = {
          strength: Math.min(score / data.keywords.length, 1),
          evidence: data.keywords.filter(k => lowerMessage.includes(k))
        };
      }
    }

    return detected;
  }

  extractTopics(message) {
    const topics = {
      'relationships': ['relationship', 'dating', 'love', 'partner', 'romance'],
      'career': ['work', 'job', 'career', 'professional', 'business'],
      'hobbies': ['hobby', 'interest', 'enjoy', 'fun', 'activity'],
      'philosophy': ['philosophy', 'meaning', 'purpose', 'belief', 'spiritual'],
      'travel': ['travel', 'trip', 'vacation', 'explore', 'adventure'],
      'creativity': ['art', 'music', 'creative', 'design', 'writing'],
      'science': ['science', 'research', 'technology', 'innovation', 'discovery'],
      'personal_growth': ['growth', 'improve', 'learn', 'develop', 'change']
    };

    const mentioned = [];
    const lowerMessage = message.toLowerCase();

    for (const [topic, keywords] of Object.entries(topics)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        mentioned.push(topic);
      }
    }

    return mentioned;
  }

  updateUserProfile(analysis) {
    // Update detected personality traits
    for (const [trait, data] of Object.entries(analysis.personalityTraits)) {
      if (!this.userProfile.detectedTraits[trait]) {
        this.userProfile.detectedTraits[trait] = { strength: 0, instances: 0 };
      }
      
      this.userProfile.detectedTraits[trait].strength = 
        (this.userProfile.detectedTraits[trait].strength + data.strength) / 2;
      this.userProfile.detectedTraits[trait].instances++;
    }

    // Update interests
    analysis.topicsDiscussed.forEach(topic => {
      if (!this.userProfile.interests.includes(topic)) {
        this.userProfile.interests.push(topic);
      }
    });

    // Update communication style
    this.userProfile.communicationStyle = analysis.communicationStyle;
    this.userProfile.emotionalState = analysis.emotionalTone;
  }

  determineResponseStrategy(analysis, history) {
    const strategy = {
      approach: 'supportive', // supportive, analytical, exploratory, guidance
      depth: 'medium', // light, medium, deep
      focus: 'current_topic', // current_topic, personality_exploration, relationship_guidance
      tone: 'warm', // warm, professional, casual, empathetic
      includeInsight: false,
      askFollowUp: true
    };

    // Adjust strategy based on conversation stage
    if (history.length < 3) {
      strategy.approach = 'exploratory';
      strategy.depth = 'light';
      strategy.tone = 'warm';
    } else if (history.length < 8) {
      strategy.approach = 'supportive';
      strategy.depth = 'medium';
      strategy.focus = 'personality_exploration';
    } else {
      strategy.approach = 'analytical';
      strategy.depth = 'deep';
      strategy.includeInsight = true;
      strategy.focus = 'relationship_guidance';
    }

    // Adjust based on user's emotional state
    if (analysis.emotionalTone === 'vulnerable') {
      strategy.approach = 'supportive';
      strategy.tone = 'empathetic';
      strategy.depth = 'light';
    } else if (analysis.emotionalTone === 'curious') {
      strategy.approach = 'exploratory';
      strategy.depth = 'deep';
    }

    return strategy;
  }

  async generateContextualResponse(analysis, strategy, history, userContext) {
    // Build response components
    const components = {
      acknowledgment: this.generateAcknowledment(analysis, strategy),
      mainContent: this.generateMainContent(analysis, strategy, history),
      insight: strategy.includeInsight ? this.generatePersonalityInsight(analysis) : null,
      followUp: strategy.askFollowUp ? this.generateFollowUpQuestion(analysis, strategy) : null
    };

    // Combine into natural response
    let response = components.acknowledgment;
    
    if (components.mainContent) {
      response += ' ' + components.mainContent;
    }
    
    if (components.insight) {
      response += '\n\n' + components.insight;
    }
    
    if (components.followUp) {
      response += '\n\n' + components.followUp;
    }

    return {
      text: response,
      type: 'conversational',
      metadata: {
        strategy: strategy,
        detectedTraits: analysis.personalityTraits,
        emotionalTone: analysis.emotionalTone,
        topics: analysis.topicsDiscussed
      }
    };
  }

  generateAcknowledment(analysis, strategy) {
    const acknowledgments = {
      'excited': [
        "I can feel your excitement - that's wonderful!",
        "Your enthusiasm really comes through!",
        "I love that energy!"
      ],
      'curious': [
        "That's such a thoughtful question.",
        "I appreciate your curiosity about this.",
        "Your interest in exploring this is really meaningful."
      ],
      'thoughtful': [
        "I can sense how much thought you've put into this.",
        "That's a really reflective perspective.",
        "Your thoughtfulness really shows."
      ],
      'vulnerable': [
        "Thank you for sharing something so personal.",
        "I appreciate your openness about this.",
        "It takes courage to share that."
      ],
      'confident': [
        "I admire your clarity about this.",
        "Your confidence in your perspective shows.",
        "That's a really strong stance."
      ],
      'neutral': [
        "I understand what you're saying.",
        "That's interesting to consider.",
        "I appreciate you sharing that."
      ]
    };

    const options = acknowledgments[analysis.emotionalTone] || acknowledgments['neutral'];
    return options[Math.floor(Math.random() * options.length)];
  }

  generateMainContent(analysis, strategy, history) {
    // Generate response based on detected intent and strategy
    const contentGenerators = {
      'self_discovery': () => this.generateSelfDiscoveryContent(analysis, strategy),
      'relationship_seeking': () => this.generateRelationshipContent(analysis, strategy),
      'sharing_experience': () => this.generateExperienceResponse(analysis, strategy),
      'asking_advice': () => this.generateAdviceContent(analysis, strategy),
      'expressing_emotion': () => this.generateEmotionalResponse(analysis, strategy),
      'philosophical_discussion': () => this.generatePhilosophicalContent(analysis, strategy),
      'casual_conversation': () => this.generateCasualContent(analysis, strategy)
    };

    const generator = contentGenerators[analysis.intent] || contentGenerators['casual_conversation'];
    return generator();
  }

  generateSelfDiscoveryContent(analysis, strategy) {
    const responses = [
      "Self-discovery is such a powerful journey. From what you've shared, I'm noticing some interesting patterns in how you think and communicate.",
      "Understanding yourself is one of the most valuable things you can do. I'm picking up on some fascinating aspects of your personality.",
      "Your curiosity about yourself shows real wisdom. There's so much depth to explore in who you are."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  generateRelationshipContent(analysis, strategy) {
    const responses = [
      "Finding meaningful connections is about understanding both yourself and what you truly value in a partner.",
      "The best relationships happen when people understand their own needs and can communicate them clearly.",
      "Your approach to relationships says a lot about your emotional intelligence and self-awareness."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  generatePersonalityInsight(analysis) {
    const traits = Object.keys(analysis.personalityTraits);
    if (traits.length === 0) return null;

    const dominantTrait = traits.reduce((a, b) => 
      analysis.personalityTraits[a].strength > analysis.personalityTraits[b].strength ? a : b
    );

    const insights = {
      'extraversion': "You seem to draw energy from social connections and enjoy engaging with others.",
      'openness': "Your openness to new experiences and ideas really comes through in how you communicate.",
      'conscientiousness': "I notice you have a thoughtful, organized approach to things.",
      'agreeableness': "Your considerate and empathetic nature is really apparent.",
      'neuroticism': "You're very in touch with your emotions and inner experience."
    };

    return `💡 Insight: ${insights[dominantTrait] || 'You have a unique way of seeing and expressing yourself.'}`;
  }

  generateFollowUpQuestion(analysis, strategy) {
    const questions = {
      'self_discovery': [
        "What aspects of your personality do you think your closest friends would say define you?",
        "When you're at your best, what does that look like?",
        "What kind of environment helps you feel most like yourself?"
      ],
      'relationship_seeking': [
        "What does emotional connection mean to you in a relationship?",
        "What have past relationships taught you about what you need?",
        "How do you know when you really click with someone?"
      ],
      'general': [
        "What's been on your mind lately?",
        "How do you typically like to spend your free time?",
        "What's something you're passionate about right now?"
      ]
    };

    const questionSet = questions[analysis.intent] || questions['general'];
    return questionSet[Math.floor(Math.random() * questionSet.length)];
  }

  // Helper methods for other content types
  generateExperienceResponse(analysis, strategy) {
    return "Your experiences shape who you are in such meaningful ways. It sounds like this has been important in your journey.";
  }

  generateAdviceContent(analysis, strategy) {
    return "I'd love to help you think through this. The best guidance usually comes from understanding your own values and instincts.";
  }

  generateEmotionalResponse(analysis, strategy) {
    return "I really appreciate you sharing how you're feeling. Emotions are such valuable information about what matters to us.";
  }

  generatePhilosophicalContent(analysis, strategy) {
    return "I love exploring deeper questions like this. Philosophy and personal values often reveal so much about who we are.";
  }

  generateCasualContent(analysis, strategy) {
    return "It's nice to chat with you! I'm always curious to learn more about the people I talk with.";
  }

  addConversationGuidance(response, analysis) {
    // Add coaching tips occasionally
    if (Math.random() < 0.3 && analysis.intent === 'relationship_seeking') {
      response.coaching = {
        tip: "💬 Conversation Tip: When talking to potential matches, sharing specific examples often creates deeper connections than general statements.",
        suggestions: [
          "Share a specific moment that illustrates your values",
          "Ask about their experiences rather than just preferences",
          "Find common ground in shared experiences or interests"
        ]
      };
    }

    return response;
  }

  generateFallbackResponse(message) {
    const fallbacks = [
      "That's really interesting. Could you tell me more about that?",
      "I'd love to understand your perspective better. What draws you to think about this?",
      "You've touched on something meaningful there. What's your experience been with this?",
      "That's a great point. How does that connect to what you're looking for in relationships?"
    ];

    return {
      text: fallbacks[Math.floor(Math.random() * fallbacks.length)],
      type: 'fallback',
      metadata: { fallback: true }
    };
  }

  // Knowledge base loading methods
  loadPersonalityKnowledge() {
    return {
      mbti: {
        // MBTI personality type information
        types: {
          'INTJ': { traits: ['analytical', 'independent', 'strategic'], compatibility: ['ENFP', 'ENTP'] },
          'ENFP': { traits: ['enthusiastic', 'creative', 'people-focused'], compatibility: ['INTJ', 'INFJ'] },
          // ... more types
        }
      },
      bigFive: {
        // Big Five personality model
        factors: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
      }
    };
  }

  loadConversationPatterns() {
    return {
      greeting: ['initial contact patterns'],
      deepening: ['vulnerability and trust building'],
      exploration: ['personality discovery patterns'],
      guidance: ['relationship advice patterns']
    };
  }

  // Additional helper methods
  analyzeCommunicationStyle(message) {
    // Analyze how the user communicates
    return 'thoughtful'; // simplified
  }

  analyzeConversationFlow(message, history) {
    // Analyze the flow and progression of conversation
    return 'natural'; // simplified
  }

  identifyQuestionTypes(message) {
    // Identify what kinds of questions the user asks
    return []; // simplified
  }
}

// Export singleton instance
const intelligentAIEngine = new IntelligentAIEngine();
export default intelligentAIEngine;