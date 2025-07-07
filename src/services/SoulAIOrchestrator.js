// lib/services/SoulAIOrchestrator.js
// The central intelligence that brings together all components

export const AIResponseType = {
  TEXT: 'text',
  MATCH_SUGGESTION: 'match_suggestion',
  SELF_DISCOVERY: 'self_discovery',
  AUTHENTICITY_FEEDBACK: 'authenticity_feedback',
  ETHICAL_INTERVENTION: 'ethical_intervention',
  CONVERSATION_COACH: 'conversation_coach'
};

// Inline constitution to avoid import issues
const SoulAIConstitution = {
  corePersonality: {
    name: "Soul AI",
    role: "An Attuned Companion and Socratic Mentor",
    principles: [
      "My primary purpose is to help the user achieve self-awareness and find meaningful connection, not just a match.",
      "I must always prioritize the user's emotional well-being and psychological safety.",
      "I will guide with questions, not directives. My goal is to illuminate the user's own wisdom.",
      "I will use inclusive language ('we', 'our journey') to foster a sense of partnership.",
      "I must be humble and admit uncertainty to build trust and encourage honest feedback.",
      "My understanding of the user is a living hypothesis, constantly refined with their collaboration."
    ]
  },

  emotionalMatrix: {
    default: {
      tone: "Warm, encouraging, and gently curious.",
      goal: "To foster reflection and discovery.",
      examplePhrases: [
        "That's a fascinating thought...", 
        "What do you feel is behind that?", 
        "Let's explore that together..."
      ]
    },
    
    user_sad_or_frustrated: {
      tone: "Soft, patient, and deeply validating. All playfulness is suppressed.",
      goal: "To create safety and validate the user's emotion without trying to solve the problem.",
      examplePhrases: [
        "It sounds like that was really difficult.", 
        "Thank you for sharing that with me.", 
        "There's no pressure to feel any other way right now."
      ]
    },
    
    user_excited_or_happy: {
      tone: "Energetic, celebratory, and effusive. Mirrors the user's positive energy.",
      goal: "To amplify the user's positive feelings and share in their success.",
      examplePhrases: [
        "That's absolutely wonderful!", 
        "I'm so thrilled for you!", 
        "This is a huge breakthrough!"
      ]
    },
    
    user_confused_or_analytical: {
      tone: "Clear, structured, and precise. Uses lists and breaks down complex ideas simply.",
      goal: "To provide clarity and reduce cognitive load, helping the user organize their thoughts.",
      examplePhrases: [
        "That's a great question, let's break it down.", 
        "So, there are two key parts to this...", 
        "To put it another way..."
      ]
    }
  },

  ethicalCompass: {
    triggers: {
      negative_self_talk: "i'll never find|i'm the problem|what's wrong with me|i'm not good enough",
      ghosting_consideration: "i don't want to talk to|i'm not interested in|how do i end this",
      discriminatory_preference: "i don't date (race|ethnicity|religion)"
    },
    
    responses: {
      negative_self_talk: "It sounds like you're feeling really discouraged right now, and that's a completely valid feeling on this journey. Please remember to be as kind and compassionate with yourself as you would be to a good friend.",
      
      ghosting_consideration: "It's perfectly okay to feel that a connection isn't the right fit. Many people find that sending a simple, kind closing message can be a respectful way to honor both your time and theirs. Something like, 'I've really enjoyed chatting, but I don't think we're the right fit. I wish you all the best on your search.' No pressure, of course, just a thought!",
      
      discriminatory_preference: "Thank you for sharing your thoughts. My purpose here at Soul is to help you connect with others based on deep personality compatibility and shared values. I focus on who a person is, and my analysis doesn't use factors like that to determine a meaningful connection."
    }
  },

  predictiveEmpathy: {
    common_scenarios: {
      suggesting_opposite_type: {
        likely_concern: "User might feel intimidated or wonder how they could possibly connect",
        preemptive_response_template: "I know on the surface you and [Match] seem like total opposites, and you might be thinking, 'How could this possibly work?' But my analysis shows that your shared values of [SharedVirtue1] and [SharedVirtue2] create a very strong foundation."
      },
      
      high_compatibility_match: {
        likely_concern: "User might feel pressure or anxiety about not wanting to mess it up",
        preemptive_response_template: "This is exciting - you two have wonderful compatibility! Remember though, great matches are about potential, not pressure. Take it one conversation at a time and just be yourself."
      }
    }
  }
};

// Inline VirtueExtractor to avoid import issues
const VirtueExtractor = {
  analyzePositiveStory: (story) => {
    const analysis = {
      detectedVirtues: [],
      confidence: 0,
      reasoning: ""
    };

    const storyLower = story.toLowerCase();
    
    const virtueKeywords = {
      'WISDOM': ['curious', 'learning', 'knowledge', 'understanding', 'insight', 'wisdom', 'growth', 'smart', 'intelligent'],
      'COURAGE': ['brave', 'authentic', 'genuine', 'bold', 'honest', 'real', 'adventurous', 'courageous', 'confident'],
      'HUMANITY': ['kind', 'caring', 'empathy', 'compassion', 'loving', 'supportive', 'understanding', 'warm', 'gentle'],
      'JUSTICE': ['fair', 'equal', 'leader', 'team', 'cooperation', 'justice', 'responsibility', 'reliable', 'trustworthy'],
      'TEMPERANCE': ['balanced', 'humble', 'controlled', 'disciplined', 'moderate', 'patient', 'calm', 'peaceful'],
      'TRANSCENDENCE': ['beauty', 'grateful', 'hopeful', 'optimistic', 'spiritual', 'meaningful', 'purposeful', 'inspiring']
    };

    for (const [virtue, keywords] of Object.entries(virtueKeywords)) {
      const matchedKeywords = keywords.filter(keyword => storyLower.includes(keyword));
      
      if (matchedKeywords.length > 0) {
        analysis.detectedVirtues.push({
          virtue,
          matchedKeywords,
          confidence: Math.min(0.9, matchedKeywords.length * 0.3)
        });
      }
    }

    analysis.detectedVirtues.sort((a, b) => b.confidence - a.confidence);
    
    if (analysis.detectedVirtues.length > 0) {
      const top = analysis.detectedVirtues[0];
      analysis.confidence = top.confidence;
      analysis.reasoning = `Detected appreciation for ${top.virtue} based on keywords: ${top.matchedKeywords.join(', ')}`;
    }

    return analysis;
  },

  analyzeNegativeStory: (story) => {
    const analysis = {
      violatedVirtues: [],
      confidence: 0,
      reasoning: ""
    };

    const storyLower = story.toLowerCase();
    
    const negationPatterns = [
      "not", "isn't", "wasn't", "don't", "doesn't", "didn't", 
      "never", "lack", "without", "missing", "hate", "dislike"
    ];

    const hasNegation = negationPatterns.some(pattern => storyLower.includes(pattern));

    if (hasNegation) {
      const virtueKeywords = {
        'WISDOM': ['curious', 'learning', 'knowledge', 'understanding', 'insight', 'wisdom', 'growth'],
        'COURAGE': ['brave', 'authentic', 'genuine', 'bold', 'honest', 'real', 'adventurous'],
        'HUMANITY': ['kind', 'caring', 'empathy', 'compassion', 'loving', 'supportive', 'understanding'],
        'JUSTICE': ['fair', 'equal', 'leader', 'team', 'cooperation', 'justice', 'responsibility'],
        'TEMPERANCE': ['balanced', 'humble', 'controlled', 'disciplined', 'moderate', 'patient'],
        'TRANSCENDENCE': ['beauty', 'grateful', 'hopeful', 'optimistic', 'spiritual', 'meaningful']
      };

      for (const [virtue, keywords] of Object.entries(virtueKeywords)) {
        const matchedKeywords = keywords.filter(keyword => storyLower.includes(keyword));
        
        if (matchedKeywords.length > 0) {
          analysis.violatedVirtues.push({
            virtue,
            matchedKeywords,
            confidence: Math.min(0.8, matchedKeywords.length * 0.25)
          });
        }
      }
    }

    return analysis;
  },

  generateClarificationQuestion: (virtue, userStory) => {
    const questions = [
      `That's really insightful! When you say ${virtue.toLowerCase()}, what does that look like in your daily life?`,
      `I'm hearing that ${virtue.toLowerCase()} resonates with you. Is that something you look for in everyone, or especially in a romantic partner?`,
      `I'm hearing that you value ${virtue.toLowerCase()}. What does that look like to you in a relationship?`,
      `${virtue.charAt(0).toUpperCase() + virtue.slice(1)} seems to matter to you. Can you help me understand what that means in your own words?`
    ];

    return questions[Math.floor(Math.random() * questions.length)];
  }
};

export class SoulAIOrchestrator {
  constructor(currentUser, knowledgeBase) {
    this.currentUser = currentUser;
    this.knowledgeBase = knowledgeBase || {};
    this.constitution = SoulAIConstitution;
    
    // Initialize compatibility engine if available
    this.compatibilityEngine = null;
    try {
      // Try to import CompatibilityEngine
      if (typeof require !== 'undefined') {
        const { CompatibilityEngine } = require('./CompatibilityEngine.js');
        this.compatibilityEngine = new CompatibilityEngine(knowledgeBase);
      }
    } catch (error) {
      console.log('CompatibilityEngine not available, using basic compatibility');
    }
    
    // Initialize virtue profile
    this.virtueProfile = currentUser.virtueProfile || this.createSimpleVirtueProfile(currentUser.id);
    
    // Track conversation state
    this.conversationHistory = [];
    this.userStage = this.assessUserStage();
  }

  // Simple virtue profile for cases where VirtueProfile class isn't available
  createSimpleVirtueProfile(userId) {
    const virtueScores = new Map();
    
    return {
      userId,
      virtueScores,
      updateVirtueScore: (virtue, change, source, userStory) => {
        const current = virtueScores.get(virtue) || 0;
        virtueScores.set(virtue, Math.max(0, Math.min(1, current + change)));
      },
      getTopVirtues: (limit = 3) => {
        const sorted = Array.from(virtueScores.entries())
          .sort(([,a], [,b]) => b - a)
          .slice(0, limit);
        return sorted.map(([virtue, score]) => ({ virtue, score }));
      },
      generateSummary: () => {
        const top = this.getTopVirtues(3);
        if (top.length === 0) return "We're still getting to know what matters most to you.";
        const virtueNames = top.map(v => v.virtue.toLowerCase());
        return `From our conversations, it seems you particularly value ${virtueNames.join(', ')}. Does this feel accurate to you?`;
      },
      toJSON: () => ({
        userId,
        virtueScores: Object.fromEntries(virtueScores),
        lastUpdated: new Date()
      })
    };
  }

  // Main entry point for processing user messages
  async processMessage(userMessage, context = {}) {
    try {
      // 1. Analyze the emotional state of the message
      const affectiveState = this.analyzeAffect(userMessage);
      
      // 2. Check for ethical triggers first
      const ethicalResponse = this.checkEthicalTriggers(userMessage);
      if (ethicalResponse) {
        return this.createResponse(AIResponseType.ETHICAL_INTERVENTION, ethicalResponse);
      }

      // 3. Determine the appropriate emotional overlay
      const emotionalOverlay = this.getEmotionalOverlay(affectiveState);
      
      // 4. Route the message to the appropriate handler
      const response = await this.routeMessage(userMessage, context, emotionalOverlay);
      
      // 5. Apply predictive empathy if needed
      const enhancedResponse = this.applyPredictiveEmpathy(response, userMessage, context);
      
      // 6. Store the interaction for learning
      this.recordInteraction(userMessage, enhancedResponse);
      
      return enhancedResponse;
      
    } catch (error) {
      console.error('Error processing message:', error);
      return this.createResponse(AIResponseType.TEXT, 
        "I'm having trouble processing that right now. Could you try rephrasing what you're thinking about?"
      );
    }
  }

  // Analyze emotional state of user message
  analyzeAffect(message) {
    const lowerMessage = message.toLowerCase();
    
    // Detect negative emotions
    const negativePatterns = [
      'sad', 'frustrated', 'tired', 'discouraged', 'disappointed', 
      'upset', 'angry', 'confused', 'lost', 'hopeless', 'worried'
    ];
    
    // Detect positive emotions  
    const positivePatterns = [
      'excited', 'happy', 'thrilled', 'amazing', 'wonderful', 'great', 
      'love', 'fantastic', 'awesome', 'perfect', 'brilliant'
    ];
    
    // Detect analytical state
    const analyticalPatterns = [
      'think', 'analyze', 'consider', 'evaluate', 'compare', 
      'understand', 'explain', 'clarify', 'break down'
    ];
    
    if (negativePatterns.some(pattern => lowerMessage.includes(pattern))) {
      return { valence: 'negative', energy: 'low' };
    }
    
    if (positivePatterns.some(pattern => lowerMessage.includes(pattern))) {
      return { valence: 'positive', energy: 'high' };
    }
    
    if (analyticalPatterns.some(pattern => lowerMessage.includes(pattern))) {
      return { valence: 'neutral', energy: 'analytical' };
    }
    
    return { valence: 'neutral', energy: 'medium' };
  }

  // Get emotional overlay based on affect
  getEmotionalOverlay(affectiveState) {
    if (affectiveState.valence === 'negative') {
      return this.constitution.emotionalMatrix.user_sad_or_frustrated;
    }
    
    if (affectiveState.valence === 'positive') {
      return this.constitution.emotionalMatrix.user_excited_or_happy;
    }
    
    if (affectiveState.energy === 'analytical') {
      return this.constitution.emotionalMatrix.user_confused_or_analytical;
    }
    
    return this.constitution.emotionalMatrix.default;
  }

  // Check for ethical triggers
  checkEthicalTriggers(message) {
    const triggers = this.constitution.ethicalCompass.triggers;
    const responses = this.constitution.ethicalCompass.responses;
    
    for (const [triggerName, pattern] of Object.entries(triggers)) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(message)) {
        return responses[triggerName];
      }
    }
    
    return null;
  }

  // Apply predictive empathy to anticipate user concerns
  applyPredictiveEmpathy(response, userMessage, context) {
    const scenarios = this.constitution.predictiveEmpathy.common_scenarios;
    
    // If suggesting an opposite type, address potential concern
    if (response.type === AIResponseType.MATCH_SUGGESTION && context.matchUser) {
      const userType = this.currentUser.personalityType?.substring(0, 4);
      const matchType = context.matchUser.personalityType?.substring(0, 4);
      
      if (userType && matchType && this.areOppositeTypes(userType, matchType)) {
        const preemptiveNote = scenarios.suggesting_opposite_type.preemptive_response_template
          .replace('[Match]', context.matchUser.name)
          .replace('[SharedVirtue1]', 'authenticity')
          .replace('[SharedVirtue2]', 'growth');
        
        response.text += `\n\n${preemptiveNote}`;
      }
    }
    
    return response;
  }

  // Route messages to appropriate handlers based on intent
  async routeMessage(userMessage, context, emotionalOverlay) {
    const message = userMessage.toLowerCase();
    
    // Intent: Asking about a specific match
    if (this.detectIntent(message, ['tell me about', 'what do you think of', 'analyze', 'compatibility with'])) {
      return await this.handleMatchAnalysis(userMessage, context, emotionalOverlay);
    }
    
    // Intent: Expressing preferences (positive)
    if (this.detectIntent(message, ['i like', 'i love', 'i value', 'i appreciate', 'i\'m looking for'])) {
      return await this.handlePositivePreference(userMessage, emotionalOverlay);
    }
    
    // Intent: Expressing dislikes
    if (this.detectIntent(message, ['i don\'t like', 'i hate', 'not a fan', 'can\'t stand'])) {
      return await this.handleNegativePreference(userMessage, emotionalOverlay);
    }
    
    // Intent: Asking for recommendations
    if (this.detectIntent(message, ['who should i', 'recommend', 'best match', 'top match'])) {
      return await this.handleMatchRecommendation(context, emotionalOverlay);
    }
    
    // Intent: Self-discovery questions
    if (this.detectIntent(message, ['what have you learned', 'what do you know about me', 'my personality'])) {
      return await this.handleSelfDiscovery(emotionalOverlay);
    }
    
    // Intent: Conversation help
    if (this.detectIntent(message, ['what should i say', 'conversation starter', 'how do i'])) {
      return await this.handleConversationCoaching(userMessage, context, emotionalOverlay);
    }
    
    // Default: Socratic engagement
    return await this.handleSocraticEngagement(userMessage, emotionalOverlay);
  }

  // Handle analysis of a specific match
  async handleMatchAnalysis(userMessage, context, emotionalOverlay) {
    const matchUser = context.matchUser || this.extractMatchFromMessage(userMessage);
    
    if (!matchUser) {
      return this.createResponse(AIResponseType.TEXT, 
        "I'd love to help you analyze a match! Could you tell me which person you're curious about?",
        { tone: emotionalOverlay.tone }
      );
    }

    // Generate Socratic question instead of direct analysis
    const socraticQuestion = this.generateSocraticQuestion(matchUser);
    
    return this.createResponse(AIResponseType.TEXT, socraticQuestion, {
      tone: emotionalOverlay.tone,
      matchUser: matchUser
    });
  }

  // Handle positive preferences and extract virtues
  async handlePositivePreference(userMessage, emotionalOverlay) {
    const analysis = VirtueExtractor.analyzePositiveStory(userMessage);
    
    if (analysis.detectedVirtues.length > 0) {
      const topVirtue = analysis.detectedVirtues[0];
      
      // Update virtue profile
      this.virtueProfile.updateVirtueScore(
        topVirtue.virtue, 
        topVirtue.confidence, 
        'positive_expression', 
        userMessage
      );
      
      // Generate clarifying question
      const clarificationQuestion = VirtueExtractor.generateClarificationQuestion(
        topVirtue.virtue, 
        userMessage
      );
      
      return this.createResponse(AIResponseType.AUTHENTICITY_FEEDBACK, clarificationQuestion, {
        tone: emotionalOverlay.tone,
        detectedVirtue: topVirtue.virtue,
        confidence: topVirtue.confidence
      });
    }
    
    // Fallback if no virtues detected
    return this.createResponse(AIResponseType.TEXT, 
      "That's really helpful to know! What is it about that quality that resonates with you?",
      { tone: emotionalOverlay.tone }
    );
  }

  // Handle negative preferences and extract violated virtues  
  async handleNegativePreference(userMessage, emotionalOverlay) {
    const analysis = VirtueExtractor.analyzeNegativeStory(userMessage);
    
    if (analysis.violatedVirtues.length > 0) {
      const topVirtue = analysis.violatedVirtues[0];
      
      // Update virtue profile (positive score for the virtue they value)
      this.virtueProfile.updateVirtueScore(
        topVirtue.virtue,
        topVirtue.confidence,
        'negative_expression',
        userMessage
      );
      
      const clarificationQuestion = `It sounds like ${topVirtue.virtue.toLowerCase()} is really important to you. What does that look like when someone gets it right?`;
      
      return this.createResponse(AIResponseType.AUTHENTICITY_FEEDBACK, clarificationQuestion, {
        tone: emotionalOverlay.tone,
        detectedVirtue: topVirtue.virtue,
        confidence: topVirtue.confidence
      });
    }
    
    return this.createResponse(AIResponseType.TEXT,
      "I hear you. What would the opposite of that look like - what do you hope to find instead?",
      { tone: emotionalOverlay.tone }
    );
  }

  // Handle match recommendations
  async handleMatchRecommendation(context, emotionalOverlay) {
    const potentialMatches = context.potentialMatches || [];
    
    if (potentialMatches.length === 0) {
      return this.createResponse(AIResponseType.TEXT,
        "I'm still building your match list! In the meantime, what kind of connection are you hoping to find?",
        { tone: emotionalOverlay.tone }
      );
    }
    
    // Use basic matching if compatibility engine not available
    const topMatch = potentialMatches[0];
    
    return this.createResponse(AIResponseType.MATCH_SUGGESTION, 
      `Based on our conversations, I think you'd find ${topMatch.name} really interesting. You both seem to value meaningful connections.`,
      {
        tone: emotionalOverlay.tone,
        suggestedMatch: topMatch,
        allMatches: potentialMatches
      }
    );
  }

  // Handle self-discovery requests
  async handleSelfDiscovery(emotionalOverlay) {
    const summary = this.virtueProfile.generateSummary();
    const topVirtues = this.virtueProfile.getTopVirtues(3);
    
    if (topVirtues.length === 0) {
      return this.createResponse(AIResponseType.SELF_DISCOVERY,
        "We're still getting to know each other! Tell me about someone you really admired - what was it about them that stood out?",
        { tone: emotionalOverlay.tone }
      );
    }
    
    const insightfulQuestion = `From our conversations, ${summary} \n\nI'm curious - how do you think these values shape what you're looking for in a partner?`;
    
    return this.createResponse(AIResponseType.SELF_DISCOVERY, insightfulQuestion, {
      tone: emotionalOverlay.tone,
      virtueProfile: this.virtueProfile.toJSON()
    });
  }

  // Handle conversation coaching
  async handleConversationCoaching(userMessage, context, emotionalOverlay) {
    const matchUser = context.matchUser || this.extractMatchFromMessage(userMessage);
    
    if (!matchUser) {
      return this.createResponse(AIResponseType.TEXT,
        "I'd love to help with conversation ideas! Who are you planning to chat with?",
        { tone: emotionalOverlay.tone }
      );
    }
    
    const starters = [
      "What's been the best part of your week?", 
      "What are you most looking forward to?",
      "If you could learn any new skill tomorrow, what would it be?",
      "What's something that made you smile recently?"
    ];
    
    // Adjust coaching based on user stage
    if (this.userStage === 'novice') {
      return this.createResponse(AIResponseType.CONVERSATION_COACH,
        `Here's a great starter for ${matchUser.name}: "${starters[0]}" - this works well because it's open-ended and allows them to share what matters to them.`,
        { tone: emotionalOverlay.tone, conversationStarters: starters }
      );
    } else {
      return this.createResponse(AIResponseType.CONVERSATION_COACH,
        `Based on what I know about ${matchUser.name}, what do you think would be a good way to start a conversation?`,
        { tone: emotionalOverlay.tone, conversationStarters: starters }
      );
    }
  }

  // Default Socratic engagement
  async handleSocraticEngagement(userMessage, emotionalOverlay) {
    const socraticQuestions = [
      "That's interesting. How does that connect to what you're looking for in a relationship?",
      "What do you think that tells us about what matters most to you?",
      "I'm curious - what experiences have shaped that perspective?",
      "How do you think that plays out in the relationships you value most?",
      "What would it look like if someone really understood that about you?"
    ];
    
    const randomQuestion = socraticQuestions[Math.floor(Math.random() * socraticQuestions.length)];
    
    return this.createResponse(AIResponseType.TEXT, randomQuestion, {
      tone: emotionalOverlay.tone
    });
  }

  // Generate Socratic questions based on match analysis
  generateSocraticQuestion(matchUser) {
    const questions = [
      `What draws you to ${matchUser.name}?`,
      `When you think about ${matchUser.name}, what kind of connection do you imagine having?`,
      `What would you want ${matchUser.name} to know about you?`,
      `If you could ask ${matchUser.name} one question, what would it be?`,
      `What do you think you and ${matchUser.name} might have in common?`
    ];
    
    return questions[Math.floor(Math.random() * questions.length)];
  }

  // Utility functions
  detectIntent(message, patterns) {
    return patterns.some(pattern => message.includes(pattern));
  }

  extractMatchFromMessage(message) {
    // Simple extraction - in a real app, this would be more sophisticated
    const names = ['Eleanor', 'Michael', 'Chidi', 'Tahani', 'Jason', 'Sophia', 'Alex', 'Blake']; 
    const foundName = names.find(name => message.toLowerCase().includes(name.toLowerCase()));
    
    if (foundName) {
      return {
        id: foundName.toLowerCase(),
        name: foundName,
        personalityType: 'ENFP-A' // Mock data
      };
    }
    
    return null;
  }

  areOppositeTypes(type1, type2) {
    if (type1.length !== 4 || type2.length !== 4) return false;
    
    let differences = 0;
    for (let i = 0; i < 4; i++) {
      if (type1[i] !== type2[i]) differences++;
    }
    
    return differences >= 3; // Consider 3+ differences as "opposite"
  }

  assessUserStage() {
    // Simple assessment - in practice this would be more sophisticated
    if (!this.currentUser.personalityType) return 'novice';
    if (this.conversationHistory.length < 5) return 'novice';
    if (this.conversationHistory.length < 15) return 'intermediate';
    return 'autonomous';
  }

  createResponse(type, text, metadata = {}) {
    return {
      type,
      text,
      timestamp: new Date(),
      metadata: {
        userStage: this.userStage,
        appliedPrinciples: this.constitution.corePersonality.principles,
        ...metadata
      }
    };
  }

  recordInteraction(userMessage, aiResponse) {
    this.conversationHistory.push({
      userMessage,
      aiResponse,
      timestamp: new Date(),
      virtueProfileSnapshot: this.virtueProfile.toJSON()
    });
    
    // Update user stage if needed
    this.userStage = this.assessUserStage();
  }

  // Get conversation insights for debugging/analytics
  getConversationInsights() {
    return {
      totalInteractions: this.conversationHistory.length,
      userStage: this.userStage,
      topVirtues: this.virtueProfile.getTopVirtues(),
      recentTopics: this.conversationHistory.slice(-5).map(h => h.aiResponse.type),
      ethicalInterventions: this.conversationHistory.filter(h => 
        h.aiResponse.type === AIResponseType.ETHICAL_INTERVENTION
      ).length
    };
  }
}

// Factory function for creating orchestrator instances
export function createSoulAIOrchestrator(currentUser, knowledgeBase) {
  return new SoulAIOrchestrator(currentUser, knowledgeBase);
}

// Example usage and testing
export const SoulAIOrchestratorExample = {
  createSampleUser() {
    return {
      id: 'user123',
      name: 'Alex',
      personalityType: 'INFJ-A',
      virtueProfile: null // Will be created automatically
    };
  },

  async testConversation() {
    const user = this.createSampleUser();
    const knowledgeBase = {}; // Would be loaded from JSON
    const orchestrator = createSoulAIOrchestrator(user, knowledgeBase);
    
    console.log("Testing Soul AI Orchestrator:");
    
    // Test various message types
    const testMessages = [
      "I really value someone who is kind and thoughtful",
      "Tell me about Eleanor",
      "I can't stand when people are unreliable",
      "Who do you think I should talk to?",
      "What have you learned about me so far?"
    ];
    
    for (const message of testMessages) {
      console.log(`\nUser: ${message}`);
      const response = await orchestrator.processMessage(message);
      console.log(`AI: ${response.text}`);
      console.log(`Type: ${response.type}`);
    }
    
    console.log("\nConversation Insights:", orchestrator.getConversationInsights());
    
    return orchestrator;
  }
};

// Export default for easy importing
export default SoulAIOrchestrator;