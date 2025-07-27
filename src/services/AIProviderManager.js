// AI Provider Manager for SoulAI
// Intelligently manages multiple AI providers (OpenAI, Google AI, Anthropic)
// Provides failover, load balancing, and optimal provider selection

import ChatGPTService from './ChatGPTService';
import GoogleAIService from './GoogleAIService';
import EnhancedSoulAIService from './EnhancedSoulAIService';

class AIProviderManager {
  constructor() {
    this.providers = {
      enhanced_soulai: EnhancedSoulAIService, // Prioritize our enhanced service
      openai: ChatGPTService,
      google: GoogleAIService,
      // Future: anthropic: AnthropicService
    };
    
    this.primaryProvider = process.env.EXPO_PUBLIC_PRIMARY_AI_PROVIDER || 'enhanced_soulai';
    this.fallbackProvider = process.env.EXPO_PUBLIC_FALLBACK_AI_PROVIDER || 'openai';
    
    this.providerHealth = {
      enhanced_soulai: { status: 'unknown', lastCheck: null },
      openai: { status: 'unknown', lastCheck: null },
      google: { status: 'unknown', lastCheck: null }
    };
    
    this.failoverCount = 0;
    this.maxFailovers = 3; // Maximum failovers before giving up
    this.healthCheckInterval = 5 * 60 * 1000; // 5 minutes
    
    console.log('🤖 AI Provider Manager initialized:', {
      primary: this.primaryProvider,
      fallback: this.fallbackProvider,
      availableProviders: Object.keys(this.providers)
    });
    
    // Start periodic health checks
    this.startHealthChecks();
  }

  // Start periodic health monitoring
  startHealthChecks() {
    setInterval(async () => {
      await this.checkAllProvidersHealth();
    }, this.healthCheckInterval);
    
    // Initial health check
    setTimeout(() => {
      this.checkAllProvidersHealth();
    }, 2000);
  }

  // Check health of all providers
  async checkAllProvidersHealth() {
    console.log('🏥 Performing AI provider health checks...');
    
    for (const [providerName, provider] of Object.entries(this.providers)) {
      try {
        if (provider.healthCheck) {
          const health = await provider.healthCheck();
          this.providerHealth[providerName] = {
            status: health.status === 'healthy' ? 'healthy' : 'unhealthy',
            lastCheck: new Date().toISOString(),
            details: health
          };
          
          console.log(`✅ ${providerName}: ${health.status}`);
        }
      } catch (error) {
        this.providerHealth[providerName] = {
          status: 'unhealthy',
          lastCheck: new Date().toISOString(),
          error: error.message
        };
        
        console.log(`❌ ${providerName}: ${error.message}`);
      }
    }
  }

  // Get the best available provider
  getBestProvider() {
    // Check if primary provider is healthy
    if (this.providerHealth[this.primaryProvider]?.status === 'healthy') {
      return {
        name: this.primaryProvider,
        service: this.providers[this.primaryProvider]
      };
    }
    
    // Check if fallback provider is healthy
    if (this.providerHealth[this.fallbackProvider]?.status === 'healthy') {
      console.log(`🔄 Using fallback provider: ${this.fallbackProvider}`);
      return {
        name: this.fallbackProvider,
        service: this.providers[this.fallbackProvider]
      };
    }
    
    // Find any healthy provider
    for (const [providerName, health] of Object.entries(this.providerHealth)) {
      if (health.status === 'healthy') {
        console.log(`🔄 Using alternative provider: ${providerName}`);
        return {
          name: providerName,
          service: this.providers[providerName]
        };
      }
    }
    
    // If no provider is confirmed healthy, try primary anyway
    console.log(`⚠️ No healthy providers confirmed, attempting with primary: ${this.primaryProvider}`);
    return {
      name: this.primaryProvider,
      service: this.providers[this.primaryProvider]
    };
  }

  // Send message with automatic failover
  async sendMessage(message, options = {}) {
    const {
      onStart = () => {},
      onToken = () => {},
      onComplete = () => {},
      onError = () => {},
      preferredProvider = null,
      maxRetries = 2
    } = options;

    let lastError = null;
    let attempts = 0;
    this.failoverCount = 0;

    while (attempts < maxRetries && this.failoverCount < this.maxFailovers) {
      const provider = preferredProvider ? 
        { name: preferredProvider, service: this.providers[preferredProvider] } :
        this.getBestProvider();

      if (!provider.service) {
        throw new Error(`Provider ${provider.name} not available`);
      }

      try {
        console.log(`🤖 Attempting message with ${provider.name} (attempt ${attempts + 1})`);
        
        const response = await provider.service.sendMessage(message, {
          onStart: () => {
            console.log(`✅ ${provider.name} started processing`);
            onStart();
          },
          onToken: (token, fullResponse) => {
            onToken(token, fullResponse, provider.name);
          },
          onComplete: (finalResponse) => {
            console.log(`✅ ${provider.name} completed successfully`);
            
            // Mark provider as healthy
            this.providerHealth[provider.name] = {
              status: 'healthy',
              lastCheck: new Date().toISOString()
            };
            
            onComplete(finalResponse, provider.name);
          },
          onError: (error) => {
            console.log(`❌ ${provider.name} encountered error:`, error.message);
            lastError = error;
            
            // Mark provider as potentially unhealthy
            this.providerHealth[provider.name] = {
              status: 'unhealthy',
              lastCheck: new Date().toISOString(),
              error: error.message
            };
          }
        });

        return response;

      } catch (error) {
        console.error(`❌ ${provider.name} failed:`, error.message);
        lastError = error;
        
        // Mark provider as unhealthy
        this.providerHealth[provider.name] = {
          status: 'unhealthy',
          lastCheck: new Date().toISOString(),
          error: error.message
        };

        attempts++;
        this.failoverCount++;

        // If this was the preferred provider and we have alternatives, try failover
        if (preferredProvider && attempts < maxRetries) {
          console.log(`🔄 Attempting failover from ${provider.name}...`);
          preferredProvider = null; // Clear preference for next attempt
        }
      }
    }

    // All providers failed
    console.error('❌ All AI providers failed after maximum retries');
    onError(lastError || new Error('All AI providers unavailable'));
    
    // Generate emergency fallback response
    const emergencyResponse = await this.generateEmergencyFallback(message);
    onComplete(emergencyResponse, 'fallback');
    
    return emergencyResponse;
  }

  // Generate emergency fallback when all providers fail
  async generateEmergencyFallback(userMessage) {
    const emergencyResponses = [
      "I'm experiencing some technical difficulties right now, but I want you to know I'm still here for you. Sometimes the most important conversations happen when we slow down and really think about what matters most. What's been on your heart lately?",
      
      "I'm having a brief technical hiccup, but that gives us a moment to pause. You know, some of the best insights come when we step back from the noise and just reflect. What's something you've been curious about in your relationships or personal growth?",
      
      "While I work through some connection issues, I'm reminded that the best conversations often happen in quiet moments like this. What's something you've been wanting to explore about yourself or your relationships?",
      
      "I'm dealing with some technical challenges at the moment, but I don't want that to interrupt what feels like it could be an important conversation. What's something that's been meaningful to you recently?",
      
      "Even with some technical difficulties, I'm still here and interested in your thoughts. Sometimes these pauses give us space to think more deeply. What's been significant in your life lately that you'd like to explore?"
    ];
    
    const response = emergencyResponses[Math.floor(Math.random() * emergencyResponses.length)];
    
    // Add a small delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return response;
  }

  // Switch primary provider
  switchPrimaryProvider(newProvider) {
    if (!this.providers[newProvider]) {
      throw new Error(`Provider ${newProvider} not available`);
    }
    
    console.log(`🔄 Switching primary provider from ${this.primaryProvider} to ${newProvider}`);
    this.primaryProvider = newProvider;
  }

  // Get provider statistics
  getProviderStats() {
    return {
      primary: this.primaryProvider,
      fallback: this.fallbackProvider,
      health: this.providerHealth,
      failoverCount: this.failoverCount,
      availableProviders: Object.keys(this.providers)
    };
  }

  // Force health check for specific provider
  async checkProviderHealth(providerName) {
    if (!this.providers[providerName]) {
      throw new Error(`Provider ${providerName} not found`);
    }

    try {
      const health = await this.providers[providerName].healthCheck();
      this.providerHealth[providerName] = {
        status: health.status === 'healthy' ? 'healthy' : 'unhealthy',
        lastCheck: new Date().toISOString(),
        details: health
      };
      
      return this.providerHealth[providerName];
    } catch (error) {
      this.providerHealth[providerName] = {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        error: error.message
      };
      
      return this.providerHealth[providerName];
    }
  }

  // Clear conversation history for all providers
  clearAllHistory() {
    Object.values(this.providers).forEach(provider => {
      if (provider.clearHistory) {
        provider.clearHistory();
      }
    });
    
    console.log('🗑️ Cleared conversation history for all providers');
  }

  // Get conversation stats from active provider
  getConversationStats() {
    const provider = this.getBestProvider();
    
    if (provider.service.getConversationStats) {
      return {
        ...provider.service.getConversationStats(),
        activeProvider: provider.name,
        providerHealth: this.providerHealth
      };
    }
    
    return {
      activeProvider: provider.name,
      providerHealth: this.providerHealth
    };
  }

  // Manual provider selection for testing/debugging
  async testProvider(providerName, testMessage = "Hello, this is a test message.") {
    if (!this.providers[providerName]) {
      throw new Error(`Provider ${providerName} not found`);
    }

    console.log(`🧪 Testing provider: ${providerName}`);
    
    try {
      const startTime = Date.now();
      
      const response = await this.providers[providerName].sendMessage(testMessage, {
        onStart: () => console.log(`✅ ${providerName} test started`),
        onToken: (token) => process.stdout.write(token),
        onComplete: (response) => {
          const duration = Date.now() - startTime;
          console.log(`\n✅ ${providerName} test completed in ${duration}ms`);
        },
        onError: (error) => console.log(`❌ ${providerName} test failed:`, error.message)
      });

      return {
        provider: providerName,
        success: true,
        response: response.substring(0, 100) + '...',
        duration: Date.now() - startTime
      };

    } catch (error) {
      console.error(`❌ ${providerName} test failed:`, error.message);
      return {
        provider: providerName,
        success: false,
        error: error.message
      };
    }
  }
}

export default new AIProviderManager();