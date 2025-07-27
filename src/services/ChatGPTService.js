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
import ApiService from '../api/ApiService';

class ChatGPTService {
  // Proper SSE stream parser for OpenAI responses
  async processOpenAIStream(response, onChunkReceived) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep any partial line for the next chunk

        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            const jsonStr = line.replace('data: ', '').trim();
            if (jsonStr === '[DONE]') {
              return; // Stream is finished
            }
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                onChunkReceived(content); // Send the actual text part to the UI
              }
            } catch (e) {
              console.error('Error parsing stream chunk JSON:', e);
            }
          }
        }
      }
    } finally {
      if (reader.locked) {
        reader.releaseLock();
      }
    }
  }

  constructor() {
    this.apiKey = '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';
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
    console.log('ChatGPTService initialized:', { 
      hasApiKey: !!this.apiKey, 
      keyPreview: this.apiKey ? this.apiKey.substring(0, 7) + '...' : 'None' 
    });
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
    this.mirixEnabled = true; // Enable MIRIX memory enhancement
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
    console.log('SoulAI services initialized with AI Agent Hierarchy, textbook knowledge, RAG system, Revolutionary Personality Engine, and MIRIX Memory System');
  }

  // MIRIX Memory Enhancement
  async enhancePromptWithMIRIX(message, baseSystemContent) {
    if (!this.mirixEnabled) return baseSystemContent;

    try {
      console.log('🧠 Enhancing prompt with MIRIX memory system');
      
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
            timestamp: new Date().toISOString()
          }
        }
      });

      console.log('📝 Conversation recorded in MIRIX memory system');
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
      console.warn('No OpenAI API key found - using fallback responses');
      const fallbackResponse = await this.generateSoulAIFallback(message);
      onComplete(fallbackResponse);
      return fallbackResponse;
    }

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

      // Prepare the base conversation context with SoulAI personality and RAG context
      let baseSystemContent = `You are an AI assistant integrated into the Soul app - think of yourself as that wise, intuitive friend who just "gets" people and relationships. You're having a genuine heart-to-heart conversation with someone about love, life, and finding their person.

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

      const messages = [
        {
          role: 'system',
          content: systemContent
        },
        ...this.getOptimalContextWindow() // Dynamic context management for infinite chat
      ];

      console.log('🤖 Making OpenAI API request...');
      console.log('🔑 API Key present:', !!this.apiKey);
      console.log('📨 Request body:', JSON.stringify({
        model: 'gpt-4',
        messages: messages.map(m => ({ role: m.role, content: m.content.substring(0, 100) + '...' })),
        stream: true,
        temperature: 0.8,
        max_tokens: 2000,
        presence_penalty: 0.6,
        frequency_penalty: 0.3,
      }, null, 2));

      let response;
      try {
        response = await fetch(this.baseUrl, {
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
      } catch (fetchError) {
        console.error('❌ Fetch error:', fetchError);
        throw new Error(`Network error: ${fetchError.message}`);
      }

      console.log('🤖 OpenAI API response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🤖 OpenAI API error details:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
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
      console.log('🔍 Handling OpenAI response, status:', response.status);
      console.log('🔍 Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));
      console.log('🔍 Response body type:', typeof response.body);
      console.log('🔍 Response body available:', !!response.body);
      console.log('🔍 getReader available:', !!(response.body && typeof response.body.getReader === 'function'));

      // Check if response has a readable body
      if (!response.body || typeof response.body.getReader !== 'function') {
        console.warn('⚠️ Response body is not readable, falling back to text response');
        try {
          const responseText = await response.text();
          console.log('📄 Response text length:', responseText.length);
          console.log('📄 Response text preview:', responseText.substring(0, 200));
          
          // Try to parse as JSON in case it's a complete OpenAI response
          const jsonResponse = JSON.parse(responseText);
          if (jsonResponse.choices && jsonResponse.choices[0] && jsonResponse.choices[0].message) {
            const content = jsonResponse.choices[0].message.content;
            console.log('✅ Successfully parsed non-streaming response');
            onComplete(content);
            return content;
          }
        } catch (parseError) {
          console.warn('❌ Could not parse OpenAI response:', parseError.message);
        }
        
        // Use fallback response if parsing fails
        console.log('🔄 Using fallback response');
        const fallbackResponse = await this.generateSoulAIFallback('I want to chat');
        onComplete(fallbackResponse);
        return fallbackResponse;
      }

      console.log('🚀 Starting streaming response processing');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let chunkCount = 0;
      let chunkBuffer = ''; // Buffer for incomplete chunks

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            console.log('✅ Streaming complete, total chunks processed:', chunkCount);
            break;
          }

          chunkCount++;
          const chunk = decoder.decode(value, { stream: true });
          console.log(`📦 Chunk ${chunkCount}:`, chunk.substring(0, 100) + (chunk.length > 100 ? '...' : ''));
          
          // Combine with buffer for incomplete chunks
          const combinedChunk = chunkBuffer + chunk;
          const lines = combinedChunk.split('\n');
          
          // Keep the last line in buffer if it doesn't end with newline
          // (it might be incomplete)
          if (!chunk.endsWith('\n')) {
            chunkBuffer = lines.pop() || '';
          } else {
            chunkBuffer = '';
          }

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            
            if (trimmedLine.startsWith('data: ')) {
              const data = trimmedLine.slice(6).trim();
              
              if (data === '[DONE]') {
                console.log('🏁 Received [DONE] signal');
                continue;
              }
              
              // Skip empty data lines
              if (!data) continue;

              try {
                const parsed = JSON.parse(data);
                
                // More robust content extraction
                if (parsed.choices && parsed.choices[0]) {
                  const delta = parsed.choices[0].delta;
                  const content = delta?.content || '';
                  
                  if (content) {
                    fullResponse += content;
                    onToken(content, fullResponse); // Stream tokens in real-time
                  }
                  
                  // Handle finish_reason
                  if (parsed.choices[0].finish_reason) {
                    console.log('🏁 Stream finished with reason:', parsed.choices[0].finish_reason);
                  }
                }
              } catch (parseError) {
                console.warn('⚠️ Parse error for chunk:', parseError.message);
                console.warn('📄 Problematic data:', data.substring(0, 200));
                
                // Skip malformed chunks instead of failing completely
                continue;
              }
            } else if (trimmedLine.startsWith('event:') || trimmedLine.startsWith('id:')) {
              // Handle SSE metadata lines (ignore for now)
              continue;
            } else if (trimmedLine !== '' && !trimmedLine.startsWith('data:')) {
              console.warn('⚠️ Unexpected line format:', trimmedLine.substring(0, 100));
            }
          }
        }
        
        // Process any remaining buffer content
        if (chunkBuffer.trim()) {
          console.log('📦 Processing final buffer:', chunkBuffer.substring(0, 100));
          const finalLine = chunkBuffer.trim();
          if (finalLine.startsWith('data: ')) {
            const data = finalLine.slice(6).trim();
            if (data && data !== '[DONE]') {
              try {
                const parsed = JSON.parse(data);
                if (parsed.choices && parsed.choices[0]) {
                  const content = parsed.choices[0].delta?.content || '';
                  if (content) {
                    fullResponse += content;
                    onToken(content, fullResponse);
                  }
                }
              } catch (parseError) {
                console.warn('⚠️ Parse error for final buffer:', parseError.message);
              }
            }
          }
        }
        
      } catch (streamError) {
        console.error('❌ Streaming error:', streamError);
        throw streamError;
      }

      if (!fullResponse) {
        throw new Error('No response content received');
      }

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
              user_response_to: this.conversationHistory[this.conversationHistory.length - 2]?.content
            }
          );
        } catch (error) {
          console.log('Assistant response personality analysis failed:', error);
        }
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
    
    // Simple conversational responses for common patterns
    const responses = {
      greetings: [
        "Hi there! I'm really glad you're here. What's been on your mind lately?",
        "Hello! I love connecting with new people. What would you like to talk about?",
        "Hey! I'm excited to get to know you better. What interests you most right now?",
        "Hi! Thanks for reaching out. What's something that's been important to you recently?"
      ],
      questions: [
        "That's a really thoughtful question. What's your perspective on it?",
        "I find that fascinating. What made you start thinking about that?",
        "That's something I think about too. How do you usually approach that?",
        "Great question! What's been your experience with that so far?"
      ],
      feelings: [
        "I appreciate you sharing that with me. How are you feeling about it?",
        "Thank you for being open about that. What's the most important part for you?",
        "I hear you. It sounds like that's really meaningful to you.",
        "That sounds significant. What would help you feel better about it?"
      ],
      general: [
        "That's really interesting! Tell me more about that.",
        "I love how thoughtful you are about that. What else comes to mind?",
        "That's a great point. What's been your experience with that?",
        "I'm curious about your perspective on that. What do you think?"
      ]
    };

    // Simple pattern matching for more engaging responses
    if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey') || msg.includes('sup')) {
      return responses.greetings[Math.floor(Math.random() * responses.greetings.length)];
    }
    if (msg.includes('?') || msg.includes('what') || msg.includes('how') || msg.includes('why')) {
      return responses.questions[Math.floor(Math.random() * responses.questions.length)];
    }
    if (msg.includes('feel') || msg.includes('think') || msg.includes('believe') || msg.includes('emotion')) {
      return responses.feelings[Math.floor(Math.random() * responses.feelings.length)];
    }
    
    // Add conversation memory
    this.conversationHistory.push({ role: 'user', content: message });
    this.conversationHistory.push({ role: 'assistant', content: responses.general[Math.floor(Math.random() * responses.general.length)] });

    return responses.general[Math.floor(Math.random() * responses.general.length)];
  }

  // Additional utility methods
  clearHistory() {
    this.conversationHistory = [];
  }

  getConversationHistory() {
    return this.conversationHistory;
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  // Extract relationship context from message (required by learning engine)
  extractRelationshipContext(message) {
    const contexts = [];
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('relationship') || lowerMessage.includes('partner')) {
      contexts.push('relationship_goals');
    }
    if (lowerMessage.includes('feel') || lowerMessage.includes('emotion')) {
      contexts.push('emotional_expression');
    }
    if (lowerMessage.includes('value') || lowerMessage.includes('important')) {
      contexts.push('values_discussion');
    }
    if (lowerMessage.includes('love') || lowerMessage.includes('care')) {
      contexts.push('love_language');
    }
    
    return contexts.length > 0 ? contexts : ['general_conversation'];
  }

  // Generate personality-based guidance for response adaptation
  generatePersonalityGuidance(personalityInsights) {
    if (!personalityInsights || typeof personalityInsights !== 'object') {
      return null;
    }

    const guidance = [];

    // Communication style guidance
    if (personalityInsights.communicationStyle) {
      const style = personalityInsights.communicationStyle;
      if (style === 'direct') {
        guidance.push('• Be direct and straightforward in responses');
        guidance.push('• Avoid excessive small talk or beating around the bush');
      } else if (style === 'nurturing') {
        guidance.push('• Use warm, supportive language');
        guidance.push('• Show empathy and emotional understanding');
      } else if (style === 'analytical') {
        guidance.push('• Provide logical, well-reasoned responses');
        guidance.push('• Include specific details and examples');
      }
    }

    // Emotional needs guidance
    if (personalityInsights.emotionalNeeds) {
      const needs = personalityInsights.emotionalNeeds;
      if (needs.includes('validation')) {
        guidance.push('• Acknowledge their feelings and perspectives');
        guidance.push('• Provide reassurance and positive feedback');
      }
      if (needs.includes('understanding')) {
        guidance.push('• Ask clarifying questions to show genuine interest');
        guidance.push('• Reflect back what they\'ve shared to show you\'re listening');
      }
      if (needs.includes('growth')) {
        guidance.push('• Encourage self-reflection and personal development');
        guidance.push('• Ask thought-provoking questions about their experiences');
      }
    }

    // Personality traits guidance
    if (personalityInsights.traits) {
      const traits = personalityInsights.traits;
      if (traits.openness > 0.7) {
        guidance.push('• Feel free to explore creative or abstract topics');
        guidance.push('• Introduce new perspectives and ideas');
      }
      if (traits.conscientiousness > 0.7) {
        guidance.push('• Be organized and thorough in your responses');
        guidance.push('• Follow up on previous conversation topics');
      }
      if (traits.extraversion > 0.7) {
        guidance.push('• Be enthusiastic and energetic in tone');
        guidance.push('• Ask about their social connections and experiences');
      }
      if (traits.agreeableness > 0.7) {
        guidance.push('• Focus on harmony and understanding');
        guidance.push('• Avoid confrontational or challenging topics');
      }
      if (traits.neuroticism > 0.7) {
        guidance.push('• Be reassuring and provide emotional support');
        guidance.push('• Avoid topics that might increase anxiety');
      }
    }

    return guidance.length > 0 ? guidance.join('\n') : null;
  }
}

// Export singleton instance
export default new ChatGPTService();
