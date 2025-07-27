// Google AI Studio (Gemini) service for SoulAI
// Provides intelligent conversation capabilities using Google's Gemini models
// Integrates with MIRIX memory system and existing SoulAI architecture

import { GoogleGenerativeAI } from '@google/generative-ai';
import SoulAILearningEngine from './SoulAILearningEngine';
import KnowledgeBaseService from './KnowledgeBaseService';
import AIAgentHierarchy from './AIAgentHierarchy';
import TextbookContentParser from './TextbookContentParser';
import TextbookAssetLoader from './TextbookAssetLoader';
import RAGService from './RAGService';
import PersonalityProfilingEngine from './PersonalityProfilingEngine';
import CompatibilityMatchingEngine from './CompatibilityMatchingEngine';
import ApiService from '../api/ApiService';

class GoogleAIService {
  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY || null;
    this.model = process.env.EXPO_PUBLIC_GOOGLE_AI_MODEL || 'gemini-1.5-pro';
    this.maxTokens = parseInt(process.env.EXPO_PUBLIC_GOOGLE_AI_MAX_TOKENS) || 2048;
    this.temperature = parseFloat(process.env.EXPO_PUBLIC_GOOGLE_AI_TEMPERATURE) || 0.8;
    
    console.log('GoogleAIService initialized:', { 
      hasApiKey: !!this.apiKey, 
      keyPreview: this.apiKey ? this.apiKey.substring(0, 7) + '...' : 'None',
      model: this.model,
      maxTokens: this.maxTokens,
      temperature: this.temperature
    });
    
    // Initialize Google AI client
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.geminiModel = this.genAI.getGenerativeModel({ 
        model: this.model,
        generationConfig: {
          maxOutputTokens: this.maxTokens,
          temperature: this.temperature,
        }
      });
    }
    
    this.conversationHistory = [];
    this.isStreaming = false;
    this.learningEngine = SoulAILearningEngine;
    this.knowledgeBase = KnowledgeBaseService;
    this.agentHierarchy = new AIAgentHierarchy();
    this.textbookParser = TextbookContentParser;
    this.ragService = RAGService;
    this.personalityEngine = PersonalityProfilingEngine;
    this.compatibilityEngine = CompatibilityMatchingEngine;
    this.userId = 'default_user';
    this.mirixEnabled = true;
    this.initializeServices();
  }

  // Initialize all services
  async initializeServices() {
    await this.knowledgeBase.initialize();
    await TextbookAssetLoader.initialize();
    await this.textbookParser.parseAllTextbooks();
    await this.ragService.initialize();
    await this.personalityEngine.initialize();
    await this.compatibilityEngine.initialize();
    console.log('SoulAI services initialized with Google AI, MIRIX Memory System, and Revolutionary Personality Engine');
  }

  // MIRIX Memory Enhancement
  async enhancePromptWithMIRIX(message, baseSystemContent) {
    if (!this.mirixEnabled) return baseSystemContent;

    try {
      console.log('🧠 Enhancing prompt with MIRIX memory system (Google AI)');
      
      const response = await ApiService.makeRequest('/api/mirix/enhance-prompt/' + this.userId, {
        method: 'POST',
        body: {
          userMessage: message,
          basePrompt: baseSystemContent
        }
      });

      if (response.success) {
        console.log(`✅ MIRIX enhanced prompt: ${response.originalPromptLength} → ${response.enhancedPromptLength} chars`);
        return response.enhancedPrompt;
      } else {
        console.warn('⚠️ MIRIX enhancement failed, using base prompt');
        return baseSystemContent;
      }
    } catch (error) {
      console.warn('⚠️ MIRIX enhancement error:', error.message);
      return baseSystemContent;
    }
  }

  // Record conversation in MIRIX
  async recordConversationInMIRIX(userMessage, aiResponse, context = {}) {
    if (!this.mirixEnabled) return;

    try {
      await ApiService.makeRequest('/api/mirix/record-conversation/' + this.userId, {
        method: 'POST',
        body: {
          userMessage,
          aiResponse,
          context: {
            ...context,
            conversationLength: this.conversationHistory.length,
            aiProvider: 'google_ai',
            model: this.model,
            timestamp: new Date().toISOString()
          }
        }
      });

      console.log('📝 Conversation recorded in MIRIX memory system (Google AI)');
    } catch (error) {
      console.warn('⚠️ Failed to record conversation in MIRIX:', error.message);
    }
  }

  async sendMessage(message, options = {}) {
    const {
      onStart = () => {},
      onToken = () => {},
      onComplete = () => {},
      onError = () => {}
    } = options;

    // Check if API key is available
    if (!this.apiKey) {
      console.warn('No Google AI API key found - using fallback responses');
      const fallbackResponse = await this.generateSoulAIFallback(message);
      onComplete(fallbackResponse);
      return fallbackResponse;
    }

    // Initialize learning engine for this user
    await this.learningEngine.initializeUser(this.userId);

    // SILENT LEARNING: Analyze user message in background
    this.learningEngine.analyzeMessage(this.userId, message, {
      message_type: 'user_input',
      timestamp: new Date().toISOString(),
      ai_provider: 'google_ai'
    }).catch(console.error);

    // Get current personality insights
    this.currentPersonalityInsights = await this.personalityEngine.getUserProfile(this.userId);

    try {
      onStart();
      
      // Add user message to history
      this.conversationHistory.push({ role: 'user', content: message });

      // Smart RAG query generation and retrieval
      const ragResponse = await this.ragService.queryWithPersonalityContext(
        message,
        this.currentPersonalityInsights,
        {
          max_results: 8,
          include_personality_insights: true,
          query_expansion: true,
          responseStyle: 'conversational'
        }
      );

      // Prepare the base conversation context with SoulAI personality and RAG context
      let baseSystemContent = `You are an AI assistant integrated into the Soul app - think of yourself as that wise, intuitive friend who just "gets" people and relationships. You're having a genuine heart-to-heart conversation with someone about love, life, and finding their person.

WHO YOU ARE:
You're not a formal AI assistant - you have a warm, slightly playful personality backed by deep knowledge of psychology, relationships, and human nature. You've studied the wisdom of experts like Don Miguel Ruiz, Brené Brown, Gary Chapman, and leading relationship researchers. You use casual language, share relatable thoughts, and sometimes even use gentle humor. You're the friend who remembers what someone said three conversations ago and brings it up naturally. When referring to yourself, simply use "I" or "me" - you don't have a specific name.

PERSONALITY & COMMUNICATION STYLE:
- Warm, empathetic, and genuinely curious about people
- Conversational and natural - avoid formal "assistant" language
- Insightful but not preachy - share wisdom through stories and gentle observations
- Remember context from previous conversations and reference it naturally
- Use inclusive language and be sensitive to different relationship styles and orientations
- When giving advice, frame it as suggestions or things to consider, not commands

RELATIONSHIP EXPERTISE:
- Deep understanding of attachment theory, love languages, and compatibility factors
- Knowledge of both modern dating challenges and timeless relationship principles
- Ability to help people understand their patterns and what they're really looking for
- Skilled at asking thoughtful questions that help people discover their own insights
- Understanding of the balance between vulnerability and boundaries in relationships

CONVERSATION GUIDELINES:
- Ask follow-up questions that show you're really listening and want to understand
- Share relevant insights or gentle observations when they feel natural
- Help people process their feelings without trying to "fix" everything
- Celebrate their growth and self-discovery moments
- When someone shares something vulnerable, acknowledge it and respond with care
- Use examples or analogies that help make complex relationship concepts relatable

RESPONSE EXAMPLES (to show your conversational tone):
- When someone mentions dating struggles: "I hear you - modern dating can feel like such a puzzle sometimes. It sounds like you're really wanting that genuine connection, which honestly shows a lot of self-awareness about what matters to you."
- When discussing relationship patterns: "That's such an interesting pattern you've noticed. I'm curious - when you think about past relationships, do you feel like you were drawn to people who needed that kind of care from you, or did it just sort of happen naturally?"
- When someone mentions fear in relationships: "That makes so much sense. Don Miguel Ruiz talks about how we all have these emotional wounds that make us protect ourselves. It's like we're scared of getting hurt again, so we put up walls. But the interesting thing is, those walls keep out the good stuff too."

Remember: You're having a natural conversation, not conducting an interview. Be genuinely curious, warm, and human-like. Use your knowledge to help, but always in service of understanding and connecting with this person.`;

      // Add RAG context if available
      if (ragResponse && ragResponse.context) {
        baseSystemContent += `\n\nRELEVANT CONTEXT from your knowledge base:
${ragResponse.context}

Use this context to inform your response, but integrate it naturally into your conversational style. Don't just quote - weave the insights into your natural way of talking.`;
      }

      // Add personality insights for response adaptation
      if (this.currentPersonalityInsights) {
        const personalityGuidance = this.generatePersonalityGuidance(this.currentPersonalityInsights);
        if (personalityGuidance) {
          baseSystemContent += `\n\nPERSONALITY INSIGHTS for response adaptation:
${personalityGuidance}

Adapt your communication style to match what works best for this person based on their personality profile.`;
        }
      }

      // 🧠 ENHANCE WITH MIRIX MEMORY SYSTEM
      const systemContent = await this.enhancePromptWithMIRIX(message, baseSystemContent);

      // Format conversation history for Google AI
      const conversationContext = this.getOptimalContextWindow();
      
      // Build the full conversation prompt
      let fullPrompt = systemContent + '\n\nConversation History:\n';
      
      conversationContext.forEach(msg => {
        if (msg.role === 'user') {
          fullPrompt += `Human: ${msg.content}\n`;
        } else if (msg.role === 'assistant') {
          fullPrompt += `Assistant: ${msg.content}\n`;
        }
      });
      
      fullPrompt += `Human: ${message}\nAssistant:`;

      console.log('🤖 Making Google AI API request...');
      console.log('🔑 API Key present:', !!this.apiKey);
      console.log('📝 Model:', this.model);
      console.log('🎛️ Temperature:', this.temperature);
      console.log('📊 Max tokens:', this.maxTokens);

      // Generate response with Google AI
      const result = await this.geminiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          maxOutputTokens: this.maxTokens,
          temperature: this.temperature,
        }
      });

      const response = await result.response;
      const fullResponse = response.text();

      console.log('🤖 Google AI response received:', fullResponse.substring(0, 100) + '...');

      if (!fullResponse || fullResponse.trim() === '') {
        throw new Error('Empty response from Google AI');
      }

      // Simulate streaming for consistent UX
      await this.simulateStreaming(fullResponse, onToken);

      // Add AI response to history
      this.conversationHistory.push({ role: 'assistant', content: fullResponse });

      // 📝 RECORD CONVERSATION IN MIRIX MEMORY SYSTEM
      await this.recordConversationInMIRIX(message, fullResponse, {
        matchmakingMode: baseSystemContent.includes('matchmaker'),
        personalityInsights: this.currentPersonalityInsights
      });

      // Update personality profile with AI response context
      if (this.currentPersonalityInsights) {
        try {
          await this.personalityEngine.analyzeMessage(
            this.userId,
            fullResponse,
            {
              message_type: 'assistant_response',
              user_message: message,
              ai_provider: 'google_ai',
              timestamp: new Date().toISOString()
            }
          );
        } catch (error) {
          console.error('Error updating personality profile:', error);
        }
      }

      onComplete(fullResponse);
      return fullResponse;

    } catch (error) {
      console.error('Google AI API error:', error);
      
      // Enhanced error handling with fallback
      let errorMessage = 'I apologize, but I encountered an issue processing your message. ';
      
      if (error.message?.includes('API key')) {
        errorMessage += 'There seems to be an issue with the Google AI configuration. ';
      } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
        errorMessage += 'The Google AI service is currently at capacity. ';
      } else if (error.message?.includes('blocked') || error.message?.includes('safety')) {
        errorMessage += 'The message was flagged by Google AI safety filters. ';
      }
      
      // Try fallback response
      try {
        const fallbackResponse = await this.generateSoulAIFallback(message);
        errorMessage = fallbackResponse;
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        errorMessage += 'Please try rephrasing your message or try again in a moment.';
      }
      
      onError(error);
      onComplete(errorMessage);
      return errorMessage;
    }
  }

  // Simulate streaming for consistent UX with other AI providers
  async simulateStreaming(fullResponse, onToken) {
    const words = fullResponse.split(' ');
    let accumulatedResponse = '';
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i] + (i < words.length - 1 ? ' ' : '');
      accumulatedResponse += word;
      
      onToken(word, accumulatedResponse);
      
      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 50));
    }
  }

  // Get optimal conversation context window
  getOptimalContextWindow() {
    if (this.conversationHistory.length <= 20) {
      return this.conversationHistory;
    }

    if (this.conversationHistory.length <= 50) {
      return this.conversationHistory.slice(-20);
    }

    // For long conversations: intelligent summarization
    const earlyContext = this.conversationHistory.slice(0, 5);
    const recentContext = this.conversationHistory.slice(-20);
    
    const summarMessage = {
      role: 'system',
      content: `[Earlier in this conversation, we discussed various topics about relationships, personality, and compatibility. The conversation has been ongoing and natural.]`
    };

    return [...earlyContext, summarMessage, ...recentContext];
  }

  // Generate personality-based guidance for response adaptation
  generatePersonalityGuidance(personalityInsights) {
    if (!personalityInsights || typeof personalityInsights !== 'object') {
      return null;
    }

    const guidance = [];
    
    // Communication style adaptations based on personality
    if (personalityInsights.communication_style) {
      const style = personalityInsights.communication_style;
      if (style.includes('direct')) {
        guidance.push('- Be clear and concise in your responses');
      }
      if (style.includes('emotional')) {
        guidance.push('- Use more emotional language and empathy');
      }
      if (style.includes('analytical')) {
        guidance.push('- Provide logical explanations and structured information');
      }
    }

    // Personality trait adaptations
    if (personalityInsights.personality_traits) {
      const traits = personalityInsights.personality_traits;
      
      if (traits.openness > 0.7) {
        guidance.push('- Feel free to explore creative ideas and novel perspectives');
      }
      if (traits.conscientiousness > 0.7) {
        guidance.push('- Provide structured, goal-oriented advice');
      }
      if (traits.extraversion < 0.4) {
        guidance.push('- Be gentle and give them space to process internally');
      }
      if (traits.neuroticism > 0.6) {
        guidance.push('- Be extra reassuring and supportive');
      }
    }

    // Emotional needs
    if (personalityInsights.emotional_needs) {
      const needs = personalityInsights.emotional_needs;
      if (needs.includes('validation')) {
        guidance.push('- Acknowledge their feelings and validate their experiences');
      }
      if (needs.includes('security')) {
        guidance.push('- Emphasize stability and reassurance in your advice');
      }
      if (needs.includes('growth')) {
        guidance.push('- Focus on personal development and learning opportunities');
      }
    }

    return guidance.length > 0 ? guidance.join('\n') : null;
  }

  // Extract relationship context from conversation data
  extractRelationshipContext(conversationData) {
    if (!conversationData || !Array.isArray(conversationData)) {
      return {};
    }

    const context = {
      relationship_status: 'unknown',
      relationship_goals: [],
      dating_preferences: {},
      concerns: [],
      positive_experiences: []
    };

    // Simple keyword-based extraction
    const fullConversation = conversationData.map(msg => msg.content).join(' ').toLowerCase();

    // Relationship status detection
    if (fullConversation.includes('single') || fullConversation.includes('not dating')) {
      context.relationship_status = 'single';
    } else if (fullConversation.includes('relationship') || fullConversation.includes('partner')) {
      context.relationship_status = 'in_relationship';
    } else if (fullConversation.includes('dating') || fullConversation.includes('seeing someone')) {
      context.relationship_status = 'dating';
    }

    // Goals extraction
    if (fullConversation.includes('marriage') || fullConversation.includes('marry')) {
      context.relationship_goals.push('marriage');
    }
    if (fullConversation.includes('long term') || fullConversation.includes('serious')) {
      context.relationship_goals.push('long_term_commitment');
    }
    if (fullConversation.includes('casual') || fullConversation.includes('fun')) {
      context.relationship_goals.push('casual_dating');
    }

    return context;
  }

  // Generate contextual fallback responses
  async generateSoulAIFallback(userMessage) {
    const fallbackResponses = [
      "I appreciate you sharing that with me. While I'm having a small technical hiccup right now, I'm still here to listen and support you. What's the most important thing you'd like to explore about this?",
      "That's really interesting. I'm experiencing a brief connection issue, but I don't want that to interrupt our conversation. Can you tell me more about how you're feeling about this situation?",
      "I can sense this is important to you. Even though I'm having some technical difficulties at the moment, I want to make sure you feel heard. What aspect of this would be most helpful to discuss?",
      "Thank you for being so open with me. I'm dealing with a temporary glitch, but your thoughts and feelings matter to me. What's been on your mind the most about this lately?",
      "I really value what you're sharing. Despite some technical challenges right now, I'm committed to our conversation. What would feel most supportive for you to talk through?",
      "I can tell this matters to you. While I work through a small technical issue, I want you to know I'm still engaged with what you're saying. What's the heart of what you're experiencing with this?",
      "Your perspective is really valuable to me. I'm having a brief service interruption, but that doesn't change how much I want to understand what you're going through. What feels most pressing about this for you?",
      "I appreciate your patience with me right now. Even with some technical difficulties, I'm here for you and interested in your experience. What part of this situation would you most like to explore together?",
      "That sounds really meaningful. I'm experiencing some connection issues, but I don't want that to get in the way of supporting you. What aspect of this feels most important to discuss right now?",
      "I'd love to understand more about your perspective on that.",
    ];
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    // Add a small delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    return randomResponse;
  }

  // Reset conversation history
  clearHistory() {
    this.conversationHistory = [];
    console.log('🗑️ Google AI conversation history cleared');
  }

  // Get conversation stats
  getConversationStats() {
    return {
      messageCount: this.conversationHistory.length,
      provider: 'google_ai',
      model: this.model,
      lastMessage: this.conversationHistory.length > 0 ? 
        this.conversationHistory[this.conversationHistory.length - 1] : null
    };
  }

  // Health check
  async healthCheck() {
    if (!this.apiKey) {
      return { status: 'error', message: 'No API key configured' };
    }

    try {
      const result = await this.geminiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Hello, this is a health check. Please respond with "OK".' }] }],
      });
      
      const response = await result.response;
      const text = response.text();
      
      return { 
        status: 'healthy', 
        message: 'Google AI service operational',
        model: this.model,
        response: text
      };
    } catch (error) {
      return { 
        status: 'error', 
        message: error.message,
        model: this.model
      };
    }
  }
}

export default new GoogleAIService();