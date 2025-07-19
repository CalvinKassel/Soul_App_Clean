// src/services/SoulAIChatService.js
import { EventSource } from 'react-native-sse';

class SoulAIChatService {
  constructor() {
    this.baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
    this.conversationHistory = [];
    this.isConnected = false;
    this.currentStream = null;
  }

  // ChatGPT-like streaming chat with personality and memory
  async sendMessage(message, userId = 'user123', options = {}) {
    const {
      onThinking = () => {},
      onStreaming = () => {},
      onComplete = () => {},
      onError = () => {}
    } = options;

    try {
      // Show thinking state
      onThinking(true);

      // Try streaming first (preferred method)
      if (await this.isStreamingSupported()) {
        return this.sendStreamingMessage(message, userId, {
          onThinking,
          onStreaming,
          onComplete,
          onError
        });
      } else {
        // Fallback to regular fetch
        return this.sendRegularMessage(message, userId, {
          onThinking,
          onComplete,
          onError
        });
      }
    } catch (error) {
      console.error('SoulAI Chat Error:', error);
      onThinking(false);
      onError(error);
      return this.getFallbackResponse(message);
    }
  }

  // Streaming implementation for real-time responses
  async sendStreamingMessage(message, userId, callbacks) {
    const { onThinking, onStreaming, onComplete, onError } = callbacks;

    return new Promise((resolve, reject) => {
      const endpoint = `${this.baseUrl}/api/soulai/chat/stream`;
      
      // Close any existing stream
      if (this.currentStream) {
        this.currentStream.close();
      }

      // Prepare the request
      const requestData = {
        message,
        userId,
        conversationHistory: this.conversationHistory.slice(-10), // Last 10 messages for context
        timestamp: new Date().toISOString()
      };

      // Create EventSource for streaming
      this.currentStream = new EventSource(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(requestData)
      });

      let fullResponse = '';
      let thinkingComplete = false;

      this.currentStream.onopen = () => {
        console.log('✅ SoulAI Stream Connected');
        this.isConnected = true;
      };

      this.currentStream.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'thinking') {
            if (!thinkingComplete) {
              onThinking(false); // Stop thinking indicator
              thinkingComplete = true;
            }
          } else if (data.type === 'content') {
            fullResponse += data.content;
            onStreaming(fullResponse);
          } else if (data.type === 'complete') {
            this.currentStream.close();
            this.currentStream = null;
            
            // Store in conversation history
            this.addToHistory('user', message);
            this.addToHistory('ai', fullResponse);
            
            const finalResponse = {
              text: fullResponse,
              type: 'streaming',
              metadata: data.metadata || {},
              timestamp: new Date().toISOString()
            };
            
            onComplete(finalResponse);
            resolve(finalResponse);
          }
        } catch (parseError) {
          console.warn('Stream parsing error:', parseError);
        }
      };

      this.currentStream.onerror = (error) => {
        console.error('SoulAI Stream Error:', error);
        this.currentStream.close();
        this.currentStream = null;
        onThinking(false);
        onError(error);
        
        // Fallback to regular message
        this.sendRegularMessage(message, userId, { onComplete, onError })
          .then(resolve)
          .catch(reject);
      };

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.currentStream) {
          this.currentStream.close();
          this.currentStream = null;
          onError(new Error('Stream timeout'));
          
          // Fallback to regular message
          this.sendRegularMessage(message, userId, { onComplete, onError })
            .then(resolve)
            .catch(reject);
        }
      }, 30000);
    });
  }

  // Regular fetch implementation (fallback)
  async sendRegularMessage(message, userId, callbacks) {
    const { onThinking, onComplete, onError } = callbacks;

    try {
      const response = await fetch(`${this.baseUrl}/api/soulai/chat/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory: this.conversationHistory.slice(-10),
          timestamp: new Date().toISOString()
        }),
        timeout: 15000
      });

      onThinking(false);

      if (!response.ok) {
        throw new Error(`SoulAI API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Store in conversation history
      this.addToHistory('user', message);
      this.addToHistory('ai', data.response);

      const finalResponse = {
        text: data.response,
        type: 'regular',
        metadata: data.metadata || {},
        timestamp: new Date().toISOString()
      };

      onComplete(finalResponse);
      return finalResponse;

    } catch (error) {
      onThinking(false);
      onError(error);
      throw error;
    }
  }

  // Check if streaming is supported
  async isStreamingSupported() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.features?.streaming === true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Intelligent fallback responses
  getFallbackResponse(message) {
    const fallbacks = [
      "I understand you're sharing something meaningful with me. Let me take a moment to process that thoughtfully...",
      "That's really interesting. I want to give you a thoughtful response, but I'm having a moment of connection difficulty. Can you tell me more?",
      "I can sense the importance of what you're sharing. While I gather my thoughts, what would be most helpful for you right now?",
      "Thank you for opening up to me. Sometimes the most profound conversations need a moment of reflection. What's really on your heart?",
      "I hear you, and I want to respond with the care you deserve. Can we explore that feeling a bit more together?"
    ];

    const response = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    
    return {
      text: response,
      type: 'fallback',
      metadata: { isFallback: true },
      timestamp: new Date().toISOString()
    };
  }

  // Conversation memory management
  addToHistory(sender, message) {
    this.conversationHistory.push({
      sender,
      message,
      timestamp: new Date().toISOString()
    });

    // Keep only last 50 messages to prevent memory issues
    if (this.conversationHistory.length > 50) {
      this.conversationHistory = this.conversationHistory.slice(-50);
    }
  }

  // Get conversation insights
  getConversationInsights() {
    return {
      messageCount: this.conversationHistory.length,
      isConnected: this.isConnected,
      lastActivity: this.conversationHistory.length > 0 
        ? this.conversationHistory[this.conversationHistory.length - 1].timestamp 
        : null
    };
  }

  // Clean up resources
  disconnect() {
    if (this.currentStream) {
      this.currentStream.close();
      this.currentStream = null;
    }
    this.isConnected = false;
  }

  // Reset conversation
  clearHistory() {
    this.conversationHistory = [];
  }
}

// Export singleton instance
export default new SoulAIChatService();