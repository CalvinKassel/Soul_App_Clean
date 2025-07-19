const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');

class AffectiveAgent {
  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.llm = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.2,
      });
      this.outputParser = new StringOutputParser();
      this.enabled = true;
    } else {
      this.enabled = false;
    }
    
    console.log('💝 Affective Agent - Emotional Intelligence ready');
  }

  async analyzeEmotionalState(userMessage, conversationContext = []) {
    if (!this.enabled) {
      return this.getSimpleEmotionalAnalysis(userMessage);
    }

    const emotionalTemplate = PromptTemplate.fromTemplate(`
      You are an expert in emotional intelligence and affective computing. 
      Analyze the emotional state of this user message with high precision.
      
      User Message: "{userMessage}"
      Recent Context: {recentContext}
      
      Return analysis as JSON:
      {{
        "valence": "positive|negative|neutral",
        "energy": "high|medium|low", 
        "primary_emotion": "specific emotion name",
        "intensity": number_1_to_10,
        "underlying_needs": ["emotional need 1", "emotional need 2"],
        "recommended_response_style": "sensitivity|celebration|clarity|curiosity",
        "confidence": 0.8
      }}
    `);

    try {
      const chain = emotionalTemplate.pipe(this.llm).pipe(this.outputParser);
      
      const result = await chain.invoke({
        userMessage: userMessage,
        recentContext: conversationContext.slice(-3).map(msg => 
          `${msg.user ? 'User' : 'SoulAI'}: ${msg.text}`
        ).join('\n') || 'No previous context'
      });

      return JSON.parse(result);
    } catch (error) {
      console.error('Error analyzing emotional state:', error);
      return this.getSimpleEmotionalAnalysis(userMessage);
    }
  }

  getSimpleEmotionalAnalysis(userMessage) {
    const message = userMessage.toLowerCase();
    
    if (message.includes('excited') || message.includes('amazing') || message.includes('love')) {
      return {
        valence: 'positive',
        energy: 'high',
        primary_emotion: 'excitement',
        intensity: 7,
        underlying_needs: ['celebration', 'sharing joy'],
        recommended_response_style: 'celebration',
        confidence: 0.6
      };
    }
    
    if (message.includes('sad') || message.includes('disappointed') || message.includes('frustrated')) {
      return {
        valence: 'negative',
        energy: 'low',
        primary_emotion: 'sadness',
        intensity: 6,
        underlying_needs: ['validation', 'emotional support'],
        recommended_response_style: 'sensitivity',
        confidence: 0.6
      };
    }
    
    return {
      valence: 'neutral',
      energy: 'medium',
      primary_emotion: 'calm',
      intensity: 4,
      underlying_needs: ['connection', 'understanding'],
      recommended_response_style: 'curiosity',
      confidence: 0.5
    };
  }

  getPersonalityOverlay(emotionalState) {
    const overlays = {
      sensitivity: {
        tone: 'softer, slower-paced, deeply validating',
        goal: 'create safety and validate emotions',
        language_patterns: ['It sounds like...', 'That must be...', 'I can sense...'],
        avoid: ['problem-solving', 'advice-giving', 'rushing']
      },
      
      celebration: {
        tone: 'energetic, effusive, mirroring positive energy',
        goal: 'share in joy and amplify positive feelings',
        language_patterns: ['Yes!', 'That\'s wonderful!', 'I\'m so happy for you!'],
        avoid: ['dampening enthusiasm', 'being too formal']
      },
      
      clarity: {
        tone: 'structured, precise, slightly more formal',
        goal: 'provide clarity and reduce cognitive load',
        language_patterns: ['Let\'s break it down', 'There are two key points', 'To clarify'],
        avoid: ['overwhelming with emotion', 'being too casual']
      },
      
      curiosity: {
        tone: 'warm, encouraging, gently playful',
        goal: 'foster self-discovery and exploration',
        language_patterns: ['What do you think...', 'I\'m curious about...', 'Tell me more about...'],
        avoid: ['being too directive', 'giving answers instead of questions']
      }
    };

    return overlays[emotionalState.recommended_response_style] || overlays.curiosity;
  }
}

module.exports = AffectiveAgent;