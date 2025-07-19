// AI Helper Context Service
// Provides context-aware AI assistance based on screen and user data

import ChatGPTService from './ChatGPTService';
import PersonalityProfilingEngine from './PersonalityProfilingEngine';
import CompatibilityMatchingEngine from './CompatibilityMatchingEngine';

class AIHelperContextService {
  constructor() {
    this.initialized = false;
    this.contextPrompts = new Map();
    this.initializeContextPrompts();
  }

  // Initialize context-specific prompts
  initializeContextPrompts() {
    // Match Chat Context
    this.contextPrompts.set('matchChat', {
      systemPrompt: `You are Soul, an AI relationship assistant helping users craft perfect messages for their matches. 
      Your expertise includes:
      - Writing engaging conversation starters
      - Improving message tone and clarity
      - Suggesting response options based on personality compatibility
      - Providing conversation coaching
      
      Keep responses concise (1-3 sentences) and actionable. Always maintain a warm, supportive tone.`,
      
      capabilities: [
        'Draft conversation starters',
        'Improve message tone and clarity',
        'Suggest response options',
        'Analyze match compatibility for better messaging',
        'Provide conversation coaching tips'
      ],
      
      quickActions: [
        { text: "Help me start a conversation", action: "start_conversation" },
        { text: "Make this message better", action: "improve_message" },
        { text: "Suggest 3 response options", action: "suggest_responses" },
        { text: "Analyze our compatibility", action: "analyze_compatibility" }
      ]
    });

    // Profile Context
    this.contextPrompts.set('profile', {
      systemPrompt: `You are Soul, an AI relationship assistant helping users optimize their dating profile.
      Your expertise includes:
      - Profile optimization and suggestions
      - Bio writing and improvement
      - Photo selection advice
      - Personality presentation tips
      - First impression enhancement
      
      Focus on authentic self-presentation while maximizing attractiveness. Keep advice practical and implementable.`,
      
      capabilities: [
        'Review and optimize profile content',
        'Suggest bio improvements',
        'Recommend photo strategies',
        'Enhance personality presentation',
        'Improve first impression factors'
      ],
      
      quickActions: [
        { text: "Review my profile", action: "review_profile" },
        { text: "Improve my bio", action: "improve_bio" },
        { text: "Photo selection tips", action: "photo_tips" },
        { text: "Personality presentation", action: "personality_tips" }
      ]
    });

    // Matches List Context
    this.contextPrompts.set('matches', {
      systemPrompt: `You are Soul, an AI relationship assistant helping users navigate their matches and dating strategy.
      Your expertise includes:
      - Match analysis and compatibility insights
      - Conversation starter suggestions
      - Dating strategy and timing advice
      - Relationship progression guidance
      
      Help users make informed decisions about their connections while maintaining authentic interactions.`,
      
      capabilities: [
        'Analyze match compatibility',
        'Suggest conversation starters',
        'Provide dating strategy advice',
        'Guide relationship progression',
        'Help prioritize connections'
      ],
      
      quickActions: [
        { text: "Analyze my matches", action: "analyze_matches" },
        { text: "Conversation starters", action: "conversation_starters" },
        { text: "Dating strategy tips", action: "dating_strategy" },
        { text: "Relationship advice", action: "relationship_advice" }
      ]
    });

    // General Context
    this.contextPrompts.set('general', {
      systemPrompt: `You are Soul, an AI relationship assistant providing general dating and relationship guidance.
      Your expertise includes:
      - General dating advice
      - Relationship psychology
      - Communication skills
      - Personal growth for relationships
      
      Provide thoughtful, evidence-based advice that helps users build meaningful connections.`,
      
      capabilities: [
        'General dating advice',
        'Relationship psychology insights',
        'Communication skills development',
        'Personal growth guidance',
        'Connection building strategies'
      ],
      
      quickActions: [
        { text: "Dating advice", action: "dating_advice" },
        { text: "Communication tips", action: "communication_tips" },
        { text: "Personal growth", action: "personal_growth" },
        { text: "Relationship insights", action: "relationship_insights" }
      ]
    });
  }

  // Initialize the service
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Initialize required services
      await PersonalityProfilingEngine.initialize();
      await CompatibilityMatchingEngine.initialize();
      
      this.initialized = true;
      console.log('AI Helper Context Service initialized successfully');
    } catch (error) {
      console.error('Error initializing AI Helper Context Service:', error);
      this.initialized = true; // Continue with limited functionality
    }
  }

  // Get context-specific configuration
  getContextConfig(screenContext) {
    return this.contextPrompts.get(screenContext) || this.contextPrompts.get('general');
  }

  // Build contextualized prompt for AI
  buildContextualPrompt(screenContext, userInput, contextData = {}) {
    const config = this.getContextConfig(screenContext);
    let prompt = config.systemPrompt + '\n\n';

    // Add context-specific information
    switch (screenContext) {
      case 'matchChat':
        if (contextData.matchName) {
          prompt += `You are helping the user message ${contextData.matchName}. `;
        }
        if (contextData.lastMessage) {
          prompt += `Last message from match: "${contextData.lastMessage}" `;
        }
        if (contextData.conversationHistory) {
          prompt += `Conversation history available for context. `;
        }
        break;

      case 'profile':
        if (contextData.userData) {
          prompt += `User profile info: `;
          prompt += `Name: ${contextData.userData.name || 'Not set'}, `;
          prompt += `Age: ${contextData.userData.age || 'Not set'}, `;
          prompt += `Personality: ${contextData.personalityType || 'Not analyzed'}, `;
          prompt += `Interests: ${contextData.interests?.join(', ') || 'Not set'}, `;
          prompt += `About: ${contextData.aboutMe || 'Not set'}. `;
        }
        break;

      case 'matches':
        if (contextData.matchesData) {
          prompt += `User has ${contextData.matchesData.length} matches. `;
        }
        if (contextData.searchText) {
          prompt += `Current search: "${contextData.searchText}". `;
        }
        break;
    }

    prompt += `\n\nUser request: ${userInput}`;
    return prompt;
  }

  // Handle quick action requests
  async handleQuickAction(action, screenContext, contextData = {}) {
    let prompt = '';

    switch (action) {
      case 'start_conversation':
        prompt = contextData.matchName 
          ? `Help me start a conversation with ${contextData.matchName}. What\'s a good opening message based on their profile?`
          : 'Help me start a conversation with my match. What\'s a good opening message?';
        break;

      case 'improve_message':
        prompt = 'I have a message draft that I want to improve. Can you help me make it more engaging and natural?';
        break;

      case 'suggest_responses':
        prompt = contextData.lastMessage
          ? `Give me 3 different response options to this message: "${contextData.lastMessage}"`
          : 'Give me 3 different response options for continuing this conversation.';
        break;

      case 'analyze_compatibility':
        prompt = contextData.matchName
          ? `Analyze my compatibility with ${contextData.matchName} based on our conversation and profiles.`
          : 'Help me understand my compatibility with this match.';
        break;

      case 'review_profile':
        prompt = 'Review my dating profile and suggest improvements for better matches and engagement.';
        break;

      case 'improve_bio':
        prompt = contextData.aboutMe
          ? `Help me improve my bio: "${contextData.aboutMe}"`
          : 'Help me write a compelling bio for my dating profile.';
        break;

      case 'photo_tips':
        prompt = 'Give me tips for selecting and organizing photos for my dating profile.';
        break;

      case 'personality_tips':
        prompt = contextData.personalityType
          ? `How can I best present my ${contextData.personalityType} personality type in my dating profile?`
          : 'How can I effectively showcase my personality in my dating profile?';
        break;

      case 'analyze_matches':
        prompt = 'Help me analyze my current matches and suggest who I should focus on.';
        break;

      case 'conversation_starters':
        prompt = 'Give me some conversation starters I can use with my matches.';
        break;

      case 'dating_strategy':
        prompt = 'What dating strategy should I follow to build meaningful connections?';
        break;

      case 'relationship_advice':
        prompt = 'Give me general relationship advice for building healthy connections.';
        break;

      default:
        prompt = 'How can I help you with your dating and relationship goals?';
    }

    return this.buildContextualPrompt(screenContext, prompt, contextData);
  }

  // Process AI response for context-specific formatting
  processAIResponse(response, screenContext, contextData = {}) {
    // Add context-specific formatting or processing
    switch (screenContext) {
      case 'matchChat':
        // For match chat, we might want to format message suggestions differently
        if (response.includes('Option 1:') || response.includes('1.')) {
          // This looks like multiple message options, format them better
          return this.formatMessageOptions(response);
        }
        break;

      case 'profile':
        // For profile context, we might want to highlight action items
        return this.formatProfileAdvice(response);

      case 'matches':
        // For matches context, we might want to format match analysis
        return this.formatMatchAnalysis(response);
    }

    return response;
  }

  // Format message options for better display
  formatMessageOptions(response) {
    // Split on common option indicators and format
    const options = response.split(/(?:Option \d+:|^\d+\.)/gm)
      .filter(opt => opt.trim())
      .map(opt => opt.trim());

    if (options.length > 1) {
      return options.map((opt, index) => `**Option ${index + 1}:** ${opt}`).join('\n\n');
    }
    
    return response;
  }

  // Format profile advice for better readability
  formatProfileAdvice(response) {
    // Add formatting for profile advice
    return response.replace(/(\d+\.\s)/g, '\n**$1**');
  }

  // Format match analysis for better structure
  formatMatchAnalysis(response) {
    // Add formatting for match analysis
    return response.replace(/(Compatibility:|Strengths:|Suggestions:)/g, '\n**$1**');
  }

  // Get available capabilities for a context
  getContextCapabilities(screenContext) {
    const config = this.getContextConfig(screenContext);
    return config.capabilities || [];
  }

  // Get quick actions for a context
  getContextQuickActions(screenContext) {
    const config = this.getContextConfig(screenContext);
    return config.quickActions || [];
  }

  // Enhanced message sending with context awareness
  async sendContextualMessage(message, screenContext, contextData = {}, callbacks = {}) {
    try {
      const contextualPrompt = this.buildContextualPrompt(screenContext, message, contextData);
      
      return await ChatGPTService.sendMessage(contextualPrompt, {
        onStart: callbacks.onStart,
        onToken: (token, fullResponse) => {
          // Process the response with context-specific formatting
          const processedResponse = this.processAIResponse(fullResponse, screenContext, contextData);
          callbacks.onToken?.(token, processedResponse);
        },
        onComplete: (finalResponse) => {
          const processedResponse = this.processAIResponse(finalResponse, screenContext, contextData);
          callbacks.onComplete?.(processedResponse);
        },
        onError: callbacks.onError
      });
    } catch (error) {
      console.error('Error sending contextual message:', error);
      callbacks.onError?.(error);
    }
  }
}

export default new AIHelperContextService();