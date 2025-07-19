const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const ProgressTracker = require('./ProgressTracker');
const PsychologyKnowledgeBase = require('./PsychologyKnowledgeBase');
const VirtueElicitationAgent = require('./agents/VirtueElicitationAgent');
const AffectiveAgent = require('./agents/AffectiveAgent');

class SoulAIOrchestrator {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      this.enabled = false;
      console.log('⚠️  SoulAI Orchestrator: No OpenAI API key found');
      return;
    }

    try {
      this.llm = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.7,
      });
      
      this.outputParser = new StringOutputParser();
      
      // Initialize specialized agents
      this.progressTracker = new ProgressTracker();
      this.knowledgeBase = new PsychologyKnowledgeBase();
      this.virtueAgent = new VirtueElicitationAgent();
      this.affectiveAgent = new AffectiveAgent();
      
      this.enabled = true;
      console.log('🧠✨ Enhanced SoulAI Orchestrator V3 initialized - Full Emotional Intelligence Active');
    } catch (error) {
      console.error('❌ Failed to initialize SoulAI Orchestrator V3:', error.message);
      this.enabled = false;
    }
  }

  async generateContextualResponse(userInput, conversationHistory, userProfile, matchingStatus) {
    if (!this.enabled) {
      return this.getFallbackResponse(userInput, matchingStatus);
    }

    // Step 1: Analyze emotional state
    const emotionalState = await this.affectiveAgent.analyzeEmotionalState(userInput, conversationHistory);
    const personalityOverlay = this.affectiveAgent.getPersonalityOverlay(emotionalState);
    
    console.log(`💝 Emotional State: ${emotionalState.primary_emotion} (${emotionalState.valence}, ${emotionalState.energy})`);
    console.log(`🎭 Using ${emotionalState.recommended_response_style} overlay`);

    // Step 2: Track progress and generate progress message
    const profileCompleteness = this.calculateProfileCompleteness(userProfile);
    const currentStage = this.progressTracker.getCurrentStage(profileCompleteness);
    const progressMessage = this.progressTracker.generateProgressMessage(currentStage);

    // Step 3: Generate response using emotional overlay
    const orchestratorTemplate = PromptTemplate.fromTemplate(`
      You are SoulAI, an emotionally attuned relationship companion with deep psychology expertise.
      
      EMOTIONAL CONTEXT:
      User's emotional state: {emotionalState}
      Recommended response style: {responseStyle}
      
      PROGRESS CONTEXT:
      Current stage: {currentStage}
      Profile completeness: {profileCompleteness}%
      
      USER PROFILE:
      - Personality: {userPersonality}
      - Values discovered: {discoveredValues}
      - Journey together: {sharedNarrative}
      
      CONVERSATION:
      {recentConversation}
      
      Latest message: "{userInput}"
      
      RESPONSE GUIDELINES FOR {responseStyle} OVERLAY:
      Tone: {overlayTone}
      Goal: {overlayGoal}
      Language patterns to use: {languagePatterns}
      Avoid: {avoidPatterns}
      
      CORE INSTRUCTIONS:
      1. **Use "WE" and "OUR JOURNEY" language** - Frame insights as discoveries made together
      2. **Express vulnerability when appropriate** - Say "I might be sensing..." when uncertain
      3. **Use paragraph breaks** - 2-4 short paragraphs, never one giant block
      4. **Include progress transparency** - Show what you're doing in background
      5. **Ask Socratic questions** - Help them discover rather than telling directly
      
      Generate a response that matches their emotional needs while advancing our shared journey.
    `);

    try {
      const chain = orchestratorTemplate.pipe(this.llm).pipe(this.outputParser);
      
      const result = await chain.invoke({
        emotionalState: JSON.stringify(emotionalState),
        responseStyle: emotionalState.recommended_response_style,
        currentStage: currentStage.name,
        profileCompleteness: profileCompleteness,
        userPersonality: userProfile?.personalityType || 'still discovering together',
        discoveredValues: this.formatDiscoveredValues(userProfile),
        sharedNarrative: this.generateSharedNarrative(conversationHistory, userProfile),
        recentConversation: conversationHistory?.slice(-4)?.map(msg => 
          `${msg.user ? 'You' : 'SoulAI'}: ${msg.text}`
        ).join('\n') || 'We\'re just beginning our journey together',
        userInput: userInput,
        overlayTone: personalityOverlay.tone,
        overlayGoal: personalityOverlay.goal,
        languagePatterns: personalityOverlay.language_patterns.join(', '),
        avoidPatterns: personalityOverlay.avoid.join(', ')
      });

      return result;
    } catch (error) {
      console.error('Error in SoulAI Orchestrator V3:', error);
      return this.getFallbackResponse(userInput, matchingStatus, emotionalState);
    }
  }

  generateSharedNarrative(conversationHistory, userProfile) {
    const messageCount = conversationHistory?.length || 0;
    
    if (messageCount < 5) {
      return "We're just starting to get to know each other, and I'm already sensing some beautiful qualities about who you are.";
    } else if (messageCount < 15) {
      return "Over our conversations, we've been discovering so much about what makes you unique and what you're truly looking for.";
    } else {
      return "Looking back on our journey together, it's amazing how much we've uncovered about your values, preferences, and the kind of connection that will truly fulfill you.";
    }
  }

  formatDiscoveredValues(userProfile) {
    const values = userProfile?.values || [];
    if (values.length === 0) return "still uncovering what matters most to you";
    
    return `we've discovered you value ${values.slice(0, 3).join(', ')}`;
  }

  calculateProfileCompleteness(userProfile) {
    if (!userProfile) return 0;
    
    let completeness = 0;
    const criticalFields = [
      { field: 'personalityType', weight: 20 },
      { field: 'interests', weight: 15 },
      { field: 'relationshipGoals', weight: 15 },
      { field: 'values', weight: 15 },
      { field: 'communicationStyle', weight: 10 },
      { field: 'loveLanguage', weight: 10 },
      { field: 'conflictStyle', weight: 5 },
      { field: 'lifestyle', weight: 5 },
      { field: 'virtueProfile', weight: 5 }
    ];
    
    criticalFields.forEach(({ field, weight }) => {
      if (userProfile[field] && userProfile[field].length > 0) {
        if (Array.isArray(userProfile[field])) {
          completeness += userProfile[field].length > 2 ? weight : weight * 0.5;
        } else {
          completeness += weight;
        }
      }
    });

    return Math.min(completeness, 100);
  }

  async shouldPresentMatches(conversationHistory, userProfile) {
    const profileCompleteness = this.calculateProfileCompleteness(userProfile);
    const conversationLength = conversationHistory?.length || 0;
    
    return profileCompleteness >= 80 && conversationLength >= 20;
  }

  getFallbackResponse(userInput, matchingStatus, emotionalState = null) {
    const currentStage = this.progressTracker.getCurrentStage(25);
    
    if (emotionalState?.recommended_response_style === 'sensitivity') {
      return `I can sense that you might be feeling a bit overwhelmed right now, and that's completely understandable. This journey of finding the right person can bring up a lot of emotions.

${currentStage.userMessage} We're taking this one step at a time, and there's no rush.

Right now, I'm just focused on understanding what makes you feel most supported and valued. What does emotional safety look like for you in relationships?

This helps me understand not just who might be compatible with you, but how to find someone who will truly appreciate the depth of who you are.`;
    }

    return `${currentStage.userMessage} Every conversation we have helps me understand you better.

I'm working in the background to build a comprehensive picture of what makes you tick and what kind of partnership will truly fulfill you. We're making real progress together.

What I'm most curious about right now is understanding your communication style. How do you typically like to connect with people? For example:
- Deep, meaningful conversations about life and dreams
- Playful banter and shared humor
- Thoughtful questions that help you both grow
- Comfortable silences and just being present together

This helps me find someone who will naturally communicate in a way that feels good to you.`;
  }
}

module.exports = SoulAIOrchestrator;