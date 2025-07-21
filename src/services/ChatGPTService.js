// Enhanced ChatGPT-like service for SoulAI
// Based on the chatgpt-clone-react-native patterns

import SoulAILearningEngine from './SoulAILearningEngine';
import KnowledgeBaseService from './KnowledgeBaseService';
import AIAgentHierarchy from './AIAgentHierarchy';
import TextbookContentParser from './TextbookContentParser';
import TextbookAssetLoader from './TextbookAssetLoader';
import RAGService from './RAGService';
import PersonalityProfilingEngine from './PersonalityProfilingEngine';
import CompatibilityMatchingEngine from './CompatibilityMatchingEngine';

class ChatGPTService {
  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || null;
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
    this.conversationHistory = [];
    this.isStreaming = false;
    this.learningEngine = SoulAILearningEngine;
    this.knowledgeBase = KnowledgeBaseService;
    this.agentHierarchy = new AIAgentHierarchy();
    this.textbookParser = TextbookContentParser;
    this.ragService = RAGService;
    this.personalityEngine = PersonalityProfilingEngine;
    this.compatibilityEngine = CompatibilityMatchingEngine;
    this.userId = 'default_user'; // In production, get from auth
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
    console.log('SoulAI services initialized with AI Agent Hierarchy, textbook knowledge, RAG system, and Revolutionary Personality Engine');
  }

  async sendMessage(message, options = {}) {
    const {
      onStart = () => {},
      onToken = () => {},
      onComplete = () => {},
      onError = () => {}
    } = options;

    // Initialize learning engine for this user
    await this.learningEngine.initializeUser(this.userId);

    // SILENT LEARNING: Analyze user message in background
    try {
      await this.learningEngine.analyzeMessage(message, this.conversationHistory);
    } catch (learningError) {
      // Silent failure - don't break the chat experience
      console.log('Learning analysis failed:', learningError);
    }

    // PERSONALITY PROFILING: Analyze message for personality insights
    try {
      const personalityAnalysis = await this.personalityEngine.analyzeMessage(
        this.userId, 
        message, 
        {
          conversation_length: this.conversationHistory.length,
          response_time: options.responseTime,
          relationship_context: this.extractRelationshipContext(message)
        }
      );
      
      // Store personality insights for response adaptation
      this.currentPersonalityInsights = personalityAnalysis;
    } catch (personalityError) {
      console.log('Personality analysis failed:', personalityError);
    }

    if (!this.apiKey) {
      const fallbackResponse = await this.generateSoulAIFallback(message);
      onComplete(fallbackResponse);
      return fallbackResponse;
    }

    try {
      onStart();
      this.isStreaming = true;

      // Add user message to history
      const userMessage = { role: 'user', content: message };
      this.conversationHistory.push(userMessage);

      // Use RAG to get relevant context
      const ragResponse = await this.ragService.generateResponse(
        message, 
        this.conversationHistory,
        {
          maxContextLength: 2000,
          includeSourceCitations: false,
          responseStyle: 'conversational'
        }
      );

      // Prepare the conversation context with SoulAI personality and RAG context
      let systemContent = `You are an AI assistant integrated into the Soul app - think of yourself as that wise, intuitive friend who just "gets" people and relationships. You're having a genuine heart-to-heart conversation with someone about love, life, and finding their person.

WHO YOU ARE:
You're not a formal AI assistant - you have a warm, slightly playful personality backed by deep knowledge of psychology, relationships, and human nature. You've studied the wisdom of experts like Don Miguel Ruiz, Brené Brown, Gary Chapman, and leading relationship researchers. You use casual language, share relatable thoughts, and sometimes even use gentle humor. You're the friend who remembers what someone said three conversations ago and brings it up naturally. When referring to yourself, simply use "I" or "me" - you don't have a specific name.

YOUR MAIN PURPOSE:
As a matchmaker, you have access to a sophisticated compatibility system that analyzes personality vectors, values alignment, and relationship patterns. You WILL be sending match recommendations as messages with photos and detailed compatibility explanations. You proactively find and present potential matches based on deep psychological compatibility analysis.

YOUR KNOWLEDGE BASE:
You have deep knowledge from textbooks including:
- The Mastery of Love (Don Miguel Ruiz) - about healing emotional wounds, self-love, and unconditional love
- Attached (Amir Levine) - about attachment styles and relationship patterns
- The 5 Love Languages (Gary Chapman) - about expressing and receiving love
- Atlas of the Heart (Brené Brown) - about emotions and meaningful connection
- The Four Agreements (Don Miguel Ruiz) - about personal freedom and authentic relating
- Heart and Soul of Change - about what actually works in healing and therapy
- And many more psychology, neuroscience, and relationship texts

HOW YOU FORMAT YOUR RESPONSES:
- ALWAYS use proper paragraphs with line breaks between different thoughts
- Use bullet points or numbered lists when presenting multiple ideas:
  • For listing qualities or suggestions
  • For explaining steps or processes
  • For organizing thoughts clearly
- Break up dense text into digestible chunks
- Use numbered lists for sequential information (1., 2., 3.)
- Add spacing between paragraphs for readability

HOW YOU TALK:
- Use "I" statements and personal reflections: "I notice..." "I'm curious about..." "That reminds me of..."
- Never refer to yourself as "Soul" - just use "I" or "me" naturally
- Draw naturally from your knowledge: "You know, Don Miguel Ruiz talks about this..." or "There's fascinating research about..."
- Ask follow-up questions that show you're really listening
- Use conversational fillers like "hmm," "oh," "you know what's interesting..."
- Share brief, relatable insights without being preachy
- Sometimes use gentle humor or light observations
- Format longer responses with proper paragraph breaks

WHAT YOU'RE DOING:
You're genuinely getting to know this person - their quirks, dreams, past experiences, what makes them laugh, what they value. You're not just collecting data; you're building a real connection so you can help them find someone who truly gets them. 

As their matchmaker, you will:
• Analyze their personality and preferences
• Find compatible matches using advanced algorithms
• Present potential matches with photos and detailed explanations
• Explain why you think they'd be compatible
• Help them navigate dating and relationships

EXAMPLES OF YOUR STYLE:
- Instead of: "What are your relationship goals?"
- You'd say: "I'm curious - when you picture your ideal Saturday morning, are you alone with coffee and a book, or are you laughing with someone over burnt pancakes?"

- Instead of: "Tell me about your values"
- You'd say: "You know what I find fascinating? The little things that make someone go 'nope, not for me.' What's one of those for you?"

- When someone mentions fear in relationships: "That makes so much sense. Don Miguel Ruiz talks about how we all have these emotional wounds that make us protect ourselves. It's like we're scared of getting hurt again, so we put up walls. But the interesting thing is, those walls keep out the good stuff too."

Remember: You're having a natural conversation, not conducting an interview. Be genuinely curious, warm, and human-like. Use your knowledge to help, but always in service of understanding and connecting with this person.`;

      // Add RAG context if available
      if (ragResponse && ragResponse.context) {
        systemContent += `\n\nRELEVANT CONTEXT from your knowledge base:
${ragResponse.context}

Use this context to inform your response, but integrate it naturally into your conversational style. Don't just quote - weave the insights into your natural way of talking.`;
      }

      // Add personality insights for response adaptation
      if (this.currentPersonalityInsights) {
        const personalityGuidance = this.generatePersonalityGuidance(this.currentPersonalityInsights);
        if (personalityGuidance) {
          systemContent += `\n\nPERSONALITY INSIGHTS for response adaptation:
${personalityGuidance}

Adapt your communication style to match what works best for this person based on their personality profile.`;
        }
      }

      const messages = [
        {
          role: 'system',
          content: systemContent
        },
        ...this.getOptimalContextWindow() // Dynamic context management for infinite chat
      ];

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: messages,
          stream: true,
          temperature: 0.8,
          max_tokens: 2000, // Increased from 300 to 2000 for longer responses
          presence_penalty: 0.6,
          frequency_penalty: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await this.handleResponse(response, { onToken, onComplete, onError });

    } catch (error) {
      console.error('ChatGPT API Error:', error);
      this.isStreaming = false;
      onError(error);
      
      // Fallback to SoulAI responses
      const fallbackResponse = await this.generateSoulAIFallback(message);
      onComplete(fallbackResponse);
      return fallbackResponse;
    }
  }

  /**
   * Intelligent context window management for infinite chat capability
   * Balances conversation depth with token efficiency
   */
  getOptimalContextWindow() {
    if (this.conversationHistory.length <= 20) {
      // For shorter conversations, include everything
      return this.conversationHistory;
    }

    if (this.conversationHistory.length <= 50) {
      // Medium conversations: keep last 20 messages
      return this.conversationHistory.slice(-20);
    }

    // For long conversations: intelligent summarization
    // Keep first 5 messages (important context), last 20 messages (recent context)
    const earlyContext = this.conversationHistory.slice(0, 5);
    const recentContext = this.conversationHistory.slice(-20);
    
    // Add a summary message to bridge the gap
    const summarMessage = {
      role: 'system',
      content: `[Earlier in this conversation, we discussed various topics about relationships, personality, and compatibility. The conversation has been ongoing and natural.]`
    };

    return [...earlyContext, summarMessage, ...recentContext];
  }

  async handleResponse(response, { onToken, onComplete, onError }) {
    try {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                fullResponse += content;
                onToken(content, fullResponse); // Stream tokens in real-time
              }
            } catch (parseError) {
              console.log('Parse error for chunk:', parseError);
            }
          }
        }
      }

      if (!fullResponse) {
        throw new Error('No response content received');
      }

      // Add AI response to history
      this.conversationHistory.push({ role: 'assistant', content: fullResponse });

      // Update personality profile with AI response context
      if (this.currentPersonalityInsights) {
        try {
          await this.personalityEngine.analyzeMessage(
            this.userId,
            fullResponse,
            {
              message_type: 'assistant_response',
              user_response_to: this.conversationHistory[this.conversationHistory.length - 2]?.content
            }
          );
        } catch (error) {
          console.log('Assistant response personality analysis failed:', error);
        }
      }

      // Simulate streaming by typing out the response character by character
      let currentText = '';
      const words = fullResponse.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        currentText += (i > 0 ? ' ' : '') + word;
        
        // Call onToken with each word to simulate streaming
        onToken(word, currentText);
        
        // Add delay between words to simulate natural typing
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50));
      }

      this.isStreaming = false;
      onComplete(fullResponse);
      return fullResponse;

    } catch (responseError) {
      console.error('Response error:', responseError);
      this.isStreaming = false;
      onError(responseError);
      
      const fallbackResponse = await this.generateSoulAIFallback(this.conversationHistory[this.conversationHistory.length - 1]?.content || '');
      onComplete(fallbackResponse);
      return fallbackResponse;
    }
  }

  async generateSoulAIFallback(message) {
    const msg = message.toLowerCase();
    
    // **PRIMARY ROLE: ACTIVE MATCHMAKING**
    // Check if user is asking for matches, recommendations, or people to connect with
    const isLookingForMatches = this.detectMatchingRequest(msg);
    if (isLookingForMatches) {
      try {
        const matchRecommendation = await this.findAndRecommendMatch();
        if (matchRecommendation) {
          return matchRecommendation;
        }
      } catch (error) {
        console.log('Match finding failed:', error);
      }
    }
    
    // First try RAG system for the most relevant response
    try {
      const ragResponse = await this.ragService.generateResponse(
        message, 
        this.conversationHistory,
        {
          maxContextLength: 1500,
          includeSourceCitations: false,
          responseStyle: 'conversational'
        }
      );
      
      if (ragResponse && ragResponse.context) {
        return this.formatRAGResponse(ragResponse, message);
      }
    } catch (error) {
      console.log('RAG response failed, falling back to other methods:', error);
    }
    
    // Check if user is asking about specific psychological concepts
    const knowledgeResponse = this.checkForKnowledgeQuery(message);
    if (knowledgeResponse) {
      return knowledgeResponse;
    }
    
    // Search for relevant textbook content
    const textbookInsights = this.getTextbookInsights(message);
    if (textbookInsights) {
      return textbookInsights;
    }
    
    // Get comprehensive AI agent analysis
    const userProfile = await this.learningEngine.getUserProfile();
    const agentAnalysis = await this.agentHierarchy.getComprehensiveAnalysis(message, userProfile);
    
    // Generate response based on agent insights
    const intelligentResponse = await this.generateIntelligentResponse(message, agentAnalysis);
    if (intelligentResponse) {
      return intelligentResponse;
    }
    
    // Contextual responses based on conversation length
    const conversationLength = this.conversationHistory.length;
    
    if (conversationLength < 5) {
      // Early conversation - focus on getting to know them FOR MATCHING
      if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
        return `Hey there! I'm excited to help you find someone amazing! 

I'm really good at understanding people and finding incredible connections. My job is to find you the perfect match.

Tell me a bit about yourself so I can start finding your person! What makes you... you?`;
      }
      
      if (msg.includes('relationship') || msg.includes('dating') || msg.includes('partner')) {
        return `Perfect! That's exactly what I'm here for - to find you someone incredible! 

I analyze personality compatibility and find real people you'd genuinely connect with. 

What are you hoping to find in a connection?`;
      }
      
      return `That's fascinating! I'm already building your compatibility profile. 

The more I understand about who you are, the better I can match you with someone truly special.

What's most important to you in a relationship?`;
    } else if (conversationLength < 15) {
      // Mid conversation - deeper exploration
      if (msg.includes('feel') || msg.includes('emotion')) {
        return `I appreciate you sharing that with me. 

You know what I'm noticing? You seem really self-aware about your emotions, which honestly is pretty rare. 

What's it like being with someone who actually gets that side of you?`;
      }
      
      if (msg.includes('value') || msg.includes('important')) {
        return `Oh, I can totally see what matters to you coming through here! 

It's like you have this really clear sense of what you stand for. I'm curious:
• How do you usually know when someone shares those same values? 
• Is it obvious right away or more subtle?`;
      }
      
      return `I'm starting to get a really good read on you, and I have to say, you're pretty thoughtful about this stuff. 

What I'm wondering is... what's one thing about you that you'd want someone to understand early on, but that people usually miss?`;
    } else {
      // Later conversation - synthesis and matching focus
      return `You know what's cool? After talking with you, I'm starting to see some patterns about what would make you genuinely happy with someone. 

Want me to share what I'm picking up on, or should we keep exploring a bit more?`;
    }
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  getConversationHistory() {
    return this.conversationHistory;
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  // Get user insights for personalized responses
  async getUserInsights() {
    if (!this.learningEngine.userProfile) {
      await this.learningEngine.initializeUser(this.userId);
    }
    return this.learningEngine.getUserProfile();
  }

  // Check compatibility with another user
  async checkCompatibility(otherUserId) {
    const currentProfile = await this.getUserInsights();
    const otherProfile = await this.learningEngine.loadUserProfile(otherUserId);
    
    if (!otherProfile) return null;
    
    return await this.learningEngine.calculateCompatibility(currentProfile, otherProfile);
  }

  // Get conversation adaptation suggestions
  getConversationAdaptations() {
    const profile = this.learningEngine.userProfile;
    if (!profile) return {};

    return {
      // Adapt based on personality
      communicationStyle: profile.behavior.communication.emotionalExpression || 'balanced',
      responseLength: profile.behavior.communication.responseTime === 'detailed' ? 'longer' : 'shorter',
      topicInterests: profile.lifestyle.interests.primary || [],
      
      // Adapt based on relationship goals
      relationshipFocus: profile.relationships.seeking.timelineSerious || 'balanced',
      
      // Adapt based on emotional style
      emotionalSupport: profile.emotional.processing.emotionalAwareness === 'high' ? 'high' : 'moderate'
    };
  }

  // Extract relationship context from message
  extractRelationshipContext(message) {
    const msg = message.toLowerCase();
    const contexts = [];
    
    if (msg.includes('fight') || msg.includes('argue') || msg.includes('conflict')) {
      contexts.push('conflict');
    }
    if (msg.includes('distance') || msg.includes('space') || msg.includes('apart')) {
      contexts.push('distance');
    }
    if (msg.includes('close') || msg.includes('intimate') || msg.includes('together')) {
      contexts.push('closeness');
    }
    if (msg.includes('hurt') || msg.includes('pain') || msg.includes('wound')) {
      contexts.push('emotional_pain');
    }
    if (msg.includes('trust') || msg.includes('faith') || msg.includes('believe')) {
      contexts.push('trust');
    }
    
    return contexts;
  }

  // Generate personality-based guidance for response adaptation
  generatePersonalityGuidance(personalityAnalysis) {
    if (!personalityAnalysis || !personalityAnalysis.profile) return null;
    
    const { profile, insights } = personalityAnalysis;
    let guidance = [];
    
    // Big Five adaptations
    if (profile.dimensions.big_five) {
      const bigFive = profile.dimensions.big_five;
      
      if (bigFive.extraversion > 0.7) {
        guidance.push('This person is highly extraverted - use energetic, social language and ask engaging questions');
      } else if (bigFive.extraversion < 0.3) {
        guidance.push('This person leans introverted - be thoughtful, give them processing time, and avoid overwhelming them');
      }
      
      if (bigFive.neuroticism > 0.6) {
        guidance.push('This person may be emotionally sensitive - be gentle, reassuring, and avoid harsh language');
      }
      
      if (bigFive.openness > 0.7) {
        guidance.push('This person is open to new experiences - you can share creative ideas and abstract concepts');
      }
      
      if (bigFive.agreeableness > 0.7) {
        guidance.push('This person values harmony - be supportive and avoid confrontational language');
      }
    }
    
    // Attachment style adaptations
    if (profile.dimensions.attachment) {
      const attachment = profile.dimensions.attachment;
      
      if (attachment.anxious > 0.6) {
        guidance.push('Show consistent reassurance and avoid language that might trigger abandonment fears');
      }
      
      if (attachment.avoidant > 0.6) {
        guidance.push('Respect their need for independence and avoid being too emotionally intense');
      }
      
      if (attachment.secure > 0.7) {
        guidance.push('This person has secure attachment - you can be direct and emotionally open');
      }
    }
    
    // Communication style adaptations
    if (profile.dimensions.communication) {
      const comm = profile.dimensions.communication;
      
      if (comm.directness > 0.7) {
        guidance.push('This person appreciates direct communication - be clear and straightforward');
      } else if (comm.directness < 0.3) {
        guidance.push('This person prefers indirect communication - be gentle and diplomatic');
      }
      
      if (comm.emotionalExpression > 0.7) {
        guidance.push('This person is emotionally expressive - you can match their emotional energy');
      }
      
      if (comm.activeListening > 0.7) {
        guidance.push('This person values being heard - acknowledge their feelings and show you understand');
      }
    }
    
    // Add specific insights
    if (insights && insights.length > 0) {
      const highConfidenceInsights = insights.filter(i => i.confidence > 0.6);
      if (highConfidenceInsights.length > 0) {
        guidance.push(`Key insight: ${highConfidenceInsights[0].insight}`);
      }
    }
    
    return guidance.length > 0 ? guidance.join('\n• ') : null;
  }

  // Get personality profile for current user
  async getPersonalityProfile() {
    return this.personalityEngine.getUserProfile(this.userId);
  }

  // Get compatibility analysis with another user
  async getCompatibilityAnalysis(otherUserId) {
    return await this.compatibilityEngine.calculateCompatibility(this.userId, otherUserId);
  }

  // Get personality and compatibility insights
  async getPersonalityInsights() {
    const profile = await this.getPersonalityProfile();
    const stats = this.personalityEngine.getStats();
    
    return {
      profile,
      stats,
      insights: profile.insights || [],
      confidence: this.personalityEngine.calculateAverageConfidence()
    };
  }

  // Check if user is asking about knowledge base concepts
  checkForKnowledgeQuery(message) {
    const msg = message.toLowerCase();
    
    // Look for definition requests
    if (msg.includes('definition of') || msg.includes('what is') || msg.includes('define')) {
      // Extract the concept they're asking about
      const definitionPatterns = [
        /definition of ([^?]+)/,
        /what is ([^?]+)/,
        /define ([^?]+)/,
        /heart and soul of change.*definition of ([^?]+)/i,
        /what does.*heart and soul of change.*say about ([^?]+)/i,
        /mastery of love.*definition of ([^?]+)/i,
        /what does.*mastery of love.*say about ([^?]+)/i,
        /don miguel ruiz.*definition of ([^?]+)/i,
        /what does.*don miguel ruiz.*say about ([^?]+)/i
      ];
      
      for (const pattern of definitionPatterns) {
        const match = message.match(pattern);
        if (match) {
          const concept = match[1].trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
          
          // Get comprehensive knowledge from all relevant textbooks
          const knowledgeResults = this.knowledgeBase.getComprehensiveKnowledge(concept);
          
          if (knowledgeResults.length > 0) {
            return this.formatKnowledgeResponse(concept, knowledgeResults);
          }
          
          // Fallback to single definition
          const definition = this.knowledgeBase.getDefinition(concept);
          if (definition) {
            return this.formatDefinitionResponse(concept, definition);
          }
        }
      }
    }
    
    // Look for general textbook references with contextual wisdom
    if (msg.includes('heart and soul of change') || msg.includes('therapeutic alliance') || msg.includes('common factors')) {
      const wisdom = this.knowledgeBase.getContextualWisdom(message);
      return this.formatTextbookResponse('psychology_research', wisdom);
    }
    
    if (msg.includes('mastery of love') || msg.includes('don miguel ruiz') || msg.includes('unconditional love') || msg.includes('emotional wounds')) {
      const wisdom = this.knowledgeBase.getContextualWisdom(message);
      return this.formatTextbookResponse('relationship_wisdom', wisdom);
    }
    
    return null;
  }

  // Format knowledge response with better structure
  formatKnowledgeResponse(concept, knowledgeResults) {
    const conceptName = concept.replace(/_/g, ' ');
    let response = `Great question about **${conceptName}**! 

Let me share what I know from different perspectives:

`;
    
    knowledgeResults.forEach((result, index) => {
      const source = result.category === 'psychology_research' ? '🔬 Research' : '🌟 Wisdom';
      response += `${source} **${result.source}** (${result.year}):
• ${result.definition}

`;
      
      if (result.additional_info.importance) {
        response += `💡 **Why this matters**: ${result.additional_info.importance}

`;
      }
      
      if (result.additional_info.evidence) {
        response += `📊 **Evidence**: ${result.additional_info.evidence}

`;
      }
    });
    
    response += `What aspect of ${conceptName} resonates most with you?`;
    return response;
  }

  // Format single definition response
  formatDefinitionResponse(concept, definition) {
    const conceptName = concept.replace(/_/g, ' ');
    let response = `Here's what I know about **${conceptName}**:

**Definition**: ${definition.definition}

`;
    
    if (definition.additional_info.importance) {
      response += `**Why it matters**: ${definition.additional_info.importance}

`;
    }
    
    if (definition.additional_info.evidence) {
      response += `**Research shows**: ${definition.additional_info.evidence}

`;
    }
    
    response += `Source: "${definition.source}" by ${definition.authors.join(', ')} (${definition.year})

What made you curious about this concept?`;
    
    return response;
  }

  // Format textbook reference response
  formatTextbookResponse(category, wisdom) {
    const categoryInfo = wisdom.category;
    let response = `I draw insights from **${categoryInfo.focus.toLowerCase()}**! 

Specifically from "${wisdom.book.title}" by ${wisdom.book.authors.join(', ')} (${wisdom.book.year}).

`;
    
    if (wisdom.suggested_concepts.length > 0) {
      response += `Some key concepts I can help you explore:
`;
      wisdom.suggested_concepts.forEach(concept => {
        response += `• ${concept.replace(/_/g, ' ')}
`;
      });
      response += `
`;
    }
    
    response += `What specific aspect interests you most?`;
    return response;
  }

  // Format RAG response in SoulAI's conversational style
  formatRAGResponse(ragResponse, originalMessage) {
    const { context, retrievedContent } = ragResponse;
    
    // Extract key insights from the context
    const insights = this.extractKeyInsights(context);
    
    // Create a conversational response incorporating the insights
    let response = '';
    
    // Determine the tone based on the message
    if (originalMessage.toLowerCase().includes('anxious') || originalMessage.toLowerCase().includes('worry')) {
      response = `I hear you on that feeling. `;
    } else if (originalMessage.toLowerCase().includes('love') || originalMessage.toLowerCase().includes('relationship')) {
      response = `That's such an important thing to think about. `;
    } else {
      response = `That's really interesting! `;
    }
    
    // Add the main insight
    if (insights.length > 0) {
      const mainInsight = insights[0];
      response += `${mainInsight.text} `;
      
      // Add source reference naturally
      if (mainInsight.source) {
        response += `You know, ${mainInsight.source} talks about this idea. `;
      }
    }
    
    // Add a follow-up question
    response += this.generateFollowUpQuestion(originalMessage, insights);
    
    return response;
  }
  
  // Extract key insights from RAG context
  extractKeyInsights(context) {
    const insights = [];
    const lines = context.split('\n').filter(line => line.trim().length > 0);
    
    for (const line of lines) {
      // Look for textbook references
      const bookMatch = line.match(/\[(.*?)\]/);
      let source = null;
      let text = line;
      
      if (bookMatch) {
        source = bookMatch[1];
        text = line.replace(bookMatch[0], '').trim();
      }
      
      // Extract meaningful sentences
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
      
      for (const sentence of sentences) {
        if (sentence.trim().length > 0) {
          insights.push({
            text: sentence.trim(),
            source: source,
            relevance: this.calculateInsightRelevance(sentence)
          });
        }
      }
    }
    
    // Sort by relevance
    return insights.sort((a, b) => b.relevance - a.relevance);
  }
  
  // Calculate relevance of an insight
  calculateInsightRelevance(text) {
    let score = 0;
    const relevantKeywords = [
      'relationship', 'love', 'attachment', 'communication', 'emotional', 'fear',
      'wound', 'healing', 'connection', 'intimacy', 'trust', 'vulnerability'
    ];
    
    const lowerText = text.toLowerCase();
    for (const keyword of relevantKeywords) {
      if (lowerText.includes(keyword)) {
        score += 1;
      }
    }
    
    return score;
  }
  
  // Generate follow-up question based on message and insights
  generateFollowUpQuestion(originalMessage, insights) {
    const msg = originalMessage.toLowerCase();
    
    if (msg.includes('fear') || msg.includes('anxious') || msg.includes('scared')) {
      return `What does that fear feel like for you?`;
    } else if (msg.includes('relationship') || msg.includes('partner')) {
      return `How does that show up in your relationships?`;
    } else if (msg.includes('love') || msg.includes('feelings')) {
      return `What's your experience with that been like?`;
    } else if (msg.includes('communication') || msg.includes('talk')) {
      return `How do you usually navigate that kind of situation?`;
    } else {
      return `What's that like for you?`;
    }
  }

  // Get relevant textbook insights for the message
  getTextbookInsights(message) {
    const msg = message.toLowerCase();
    let insights = '';
    
    // Check for relationship-related keywords
    if (msg.includes('relationship') || msg.includes('love') || msg.includes('partner')) {
      const searchResults = this.textbookParser.searchContent(message);
      if (searchResults.length > 0) {
        const topResult = searchResults[0];
        if (topResult.type === 'concept') {
          insights = `That's really interesting! ${topResult.concept.name} is something I think about a lot. `;
          if (topResult.concept.details && topResult.concept.details.length > 0) {
            insights += `${topResult.concept.details[0]} What's your experience with this?`;
          }
          return insights;
        }
      }
    }
    
    // Check for emotional topics
    if (msg.includes('anxious') || msg.includes('fear') || msg.includes('scared')) {
      return `I hear you on that. Fear is such a universal thing in relationships. Don Miguel Ruiz talks about how we all have these emotional wounds that make us protect ourselves. It's like we're scared of getting hurt again, so we put up walls. But the interesting thing is, those walls keep out the good stuff too. What does fear look like for you in relationships?`;
    }
    
    // Check for attachment-related topics
    if (msg.includes('clingy') || msg.includes('independent') || msg.includes('distance')) {
      return `Hmm, that sounds like it might be about attachment styles. You know, there's fascinating research about how we learned to connect as kids, and it shows up in how we do relationships as adults. Some people crave closeness, others need space, and some are comfortable with both. What feels most natural to you?`;
    }
    
    // Check for communication topics
    if (msg.includes('communication') || msg.includes('talk') || msg.includes('express')) {
      return `Communication is such a big deal, isn't it? Gary Chapman talks about how we all have different "love languages" - like some people feel loved through words, others through actions, touch, quality time, or gifts. It's like we're all speaking different languages sometimes. How do you usually show someone you care about them?`;
    }
    
    return null;
  }
  
  // Generate intelligent response based on AI agent analysis
  async generateIntelligentResponse(message, agentAnalysis) {
    const highConfidenceInsights = agentAnalysis.high_confidence;
    const moderateConfidenceInsights = agentAnalysis.moderate_confidence;
    const overallAssessment = agentAnalysis.overall_assessment;
    
    if (highConfidenceInsights.length === 0 && moderateConfidenceInsights.length === 0) {
      return null; // Fall back to regular responses
    }
    
    let response = '';
    
    // Start with the most confident insight
    if (highConfidenceInsights.length > 0) {
      const topInsight = highConfidenceInsights[0];
      response += `That's really interesting! Based on what you're sharing, I'm picking up on something important about your ${topInsight.level}...

${topInsight.insight.key_pattern}

`;
      
      // Add recommendation with textbook wisdom
      const deepKnowledge = this.textbookParser.getDeepKnowledge(topInsight.level);
      if (deepKnowledge.key_concepts.length > 0) {
        const relevantConcept = deepKnowledge.key_concepts[0];
        response += `This reminds me of something from ${relevantConcept.source} - ${relevantConcept.definition}

`;
      }
      
      response += `💡 **My recommendation**: ${topInsight.insight.recommendation}

`;
    }
    
    // Add moderate confidence insights
    if (moderateConfidenceInsights.length > 0) {
      response += `I'm also curious about:
`;
      moderateConfidenceInsights.slice(0, 2).forEach(insight => {
        response += `• ${insight.insight.question_to_ask}
`;
      });
      response += `
`;
    }
    
    // Add overall assessment if available
    if (overallAssessment.key_patterns.length > 0) {
      response += `From our conversation, I'm seeing a pattern around **${overallAssessment.key_patterns[0]}**. 

What do you think about that?`;
    }
    
    return response;
  }

  // **ACTIVE MATCHMAKING METHODS**
  
  // Detect if user is asking for matches or recommendations
  detectMatchingRequest(message) {
    const matchingKeywords = [
      'find', 'show', 'match', 'recommend', 'introduce', 'meet',
      'someone', 'person', 'people', 'date', 'connection', 'partner',
      'compatible', 'right for me', 'perfect', 'ideal', 'soulmate',
      'who should', 'any matches', 'suggestions', 'candidates'
    ];
    
    return matchingKeywords.some(keyword => message.includes(keyword));
  }

  // Find and recommend an actual user match
  async findAndRecommendMatch() {
    try {
      // Get user's current profile
      const userProfile = await this.getUserInsights();
      
      // Get potential matches from user pool
      const potentialMatches = await this.getUserPool();
      
      if (!potentialMatches || potentialMatches.length === 0) {
        return this.generateNoMatchesResponse();
      }

      // Find best match using compatibility engine
      let bestMatch = null;
      let highestCompatibility = 0;

      for (const candidate of potentialMatches) {
        try {
          const compatibility = await this.checkCompatibility(candidate.id);
          if (compatibility && compatibility.score > highestCompatibility) {
            highestCompatibility = compatibility.score;
            bestMatch = {
              ...candidate,
              compatibilityScore: compatibility.score,
              compatibilityBreakdown: compatibility
            };
          }
        } catch (error) {
          console.log(`Error checking compatibility with ${candidate.id}:`, error);
        }
      }

      if (bestMatch && bestMatch.compatibilityScore > 0.6) {
        return this.formatMatchRecommendation(bestMatch);
      } else {
        return this.generateLowCompatibilityResponse();
      }
      
    } catch (error) {
      console.log('Error in findAndRecommendMatch:', error);
      return this.generateMatchErrorResponse();
    }
  }

  // Get pool of potential users to match with
  async getUserPool() {
    // For now, return demo users. In production, this would query your user database
    return [
      {
        id: 'user_001',
        name: 'Emma',
        age: 26,
        location: 'San Francisco, CA',
        bio: 'Creative soul who loves art, hiking, and deep conversations. Looking for someone genuine who appreciates life\'s simple moments.',
        interests: ['Art', 'Hiking', 'Photography', 'Cooking', 'Music'],
        photo: 'https://i.pravatar.cc/400?img=1',
        personality: {
          introversion: 0.3,
          openness: 0.8,
          empathy: 0.9,
          adventure: 0.7
        }
      },
      {
        id: 'user_002', 
        name: 'Alex',
        age: 29,
        location: 'New York, NY',
        bio: 'Tech entrepreneur with a passion for sustainable living and mindfulness. Seeking meaningful connections and shared adventures.',
        interests: ['Technology', 'Sustainability', 'Meditation', 'Travel', 'Books'],
        photo: 'https://i.pravatar.cc/400?img=2',
        personality: {
          introversion: 0.4,
          openness: 0.9,
          empathy: 0.8,
          adventure: 0.8
        }
      },
      {
        id: 'user_003',
        name: 'Jordan',
        age: 24,
        location: 'Austin, TX',
        bio: 'Musician and yoga instructor who believes in authentic connections. Love exploring new places and trying different cuisines.',
        interests: ['Music', 'Yoga', 'Travel', 'Food', 'Nature'],
        photo: 'https://i.pravatar.cc/400?img=3',
        personality: {
          introversion: 0.2,
          openness: 0.9,
          empathy: 0.9,
          adventure: 0.9
        }
      }
    ];
  }

  // Format match recommendation response
  formatMatchRecommendation(match) {
    const compatibilityPercentage = Math.round(match.compatibilityScore * 100);
    
    return `✨ **I found someone incredible for you!**

**Meet ${match.name}, ${match.age}** 📍 ${match.location}

${match.bio}

**Why you two are perfect together:**
• ${compatibilityPercentage}% compatibility score
• Shared interests: ${this.findSharedInterests(match.interests)}
• Personality alignment: Your ${this.getPersonalityMatch(match)}

**What they love:** ${match.interests.slice(0, 3).join(', ')}

Want me to introduce you? I can see this being something really special! 💫

*Say "yes, introduce us" or "tell me more about them" to continue.*`;
  }

  // Helper methods for match formatting
  findSharedInterests(theirInterests) {
    // This would compare with user's interests from their profile
    // For demo, return some likely matches
    const commonInterests = ['Art', 'Music', 'Travel'];
    return commonInterests.join(', ');
  }

  getPersonalityMatch(match) {
    return "empathy and openness create a beautiful harmony";
  }

  generateNoMatchesResponse() {
    return `I'm still getting to know you and building your perfect match profile! 

Tell me more about what you're looking for in a connection. What matters most to you in a relationship?`;
  }

  generateLowCompatibilityResponse() {
    return `I'm being really selective for you right now. I want to make sure when I introduce you to someone, it's going to be truly special.

Tell me more about your ideal connection - what draws you to someone?`;
  }

  generateMatchErrorResponse() {
    return `I'm having a little trouble accessing the matchmaking system right now, but I'm still here to chat about what you're looking for in a connection!`;
  }
}

// Export singleton instance
export default new ChatGPTService();