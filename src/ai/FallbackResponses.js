// src/ai/FallbackResponses.js
// Intelligent offline responses for when backend is unavailable

export const FALLBACK_RESPONSES = {
  // Analyze message and return appropriate response
  getResponse(message) {
    const msg = message.toLowerCase();
    
    // Greeting responses
    if (this.isGreeting(msg)) {
      return this.getGreetingResponse();
    }
    
    // Relationship-focused responses
    if (this.isRelationshipTopic(msg)) {
      return this.getRelationshipResponse(msg);
    }
    
    // Emotion-focused responses
    if (this.isEmotionalTopic(msg)) {
      return this.getEmotionalResponse(msg);
    }
    
    // Personality/self-discovery responses
    if (this.isPersonalityTopic(msg)) {
      return this.getPersonalityResponse(msg);
    }
    
    // Compatibility/matching responses
    if (this.isCompatibilityTopic(msg)) {
      return this.getCompatibilityResponse(msg);
    }
    
    // Love/connection responses
    if (this.isLoveTopic(msg)) {
      return this.getLoveResponse(msg);
    }
    
    // Default thoughtful response
    return this.getDefaultResponse();
  },

  // Topic detection methods
  isGreeting(msg) {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good evening', 'how are you'];
    return greetings.some(greeting => msg.includes(greeting));
  },

  isRelationshipTopic(msg) {
    const keywords = ['relationship', 'dating', 'partner', 'boyfriend', 'girlfriend', 'romantic'];
    return keywords.some(keyword => msg.includes(keyword));
  },

  isEmotionalTopic(msg) {
    const keywords = ['feel', 'emotion', 'sad', 'happy', 'angry', 'frustrated', 'excited', 'anxious', 'lonely'];
    return keywords.some(keyword => msg.includes(keyword));
  },

  isPersonalityTopic(msg) {
    const keywords = ['personality', 'type', 'who am i', 'identity', 'character', 'traits', 'myself'];
    return keywords.some(keyword => msg.includes(keyword));
  },

  isCompatibilityTopic(msg) {
    const keywords = ['compatible', 'match', 'perfect', 'right person', 'soulmate', 'chemistry'];
    return keywords.some(keyword => msg.includes(keyword));
  },

  isLoveTopic(msg) {
    const keywords = ['love', 'connection', 'bond', 'affection', 'care', 'heart'];
    return keywords.some(keyword => msg.includes(keyword));
  },

  // Response generators
  getGreetingResponse() {
    const responses = [
      "Hello! It's wonderful to connect with you. I'm here to understand you deeply and help you discover meaningful connections. What's been on your mind about relationships or personal growth lately?",
      "Hi there! I'm Soul, and I'm here to help you explore what makes you uniquely you. What would you like to talk about today?",
      "Hey! Great to meet you. I love getting to know people on a deeper level. What's something about yourself you've been thinking about recently?",
      "Hello! I'm excited to be part of your journey toward meaningful connection. What's stirring in your heart today?"
    ];
    return this.getRandomResponse(responses);
  },

  getRelationshipResponse(msg) {
    const responses = [
      "Relationships are such a beautiful part of the human experience. I'd love to explore what authentic connection means to you. What qualities do you value most in the people you're drawn to?",
      "There's something profound about how we connect with others. Every relationship teaches us something about ourselves. What have your past connections shown you about what you're looking for?",
      "I find relationships fascinating because they're mirrors that reflect who we truly are. What kind of partnership would bring out the best version of yourself?",
      "Dating can feel overwhelming sometimes, but at its core, it's about finding someone who appreciates your authentic self. What does authenticity in a relationship look like to you?"
    ];
    return this.getRandomResponse(responses);
  },

  getEmotionalResponse(msg) {
    const responses = [
      "Thank you for sharing something so personal with me. Our emotions are such valuable guides to understanding ourselves. What's been stirring in your heart lately?",
      "I can sense there's depth behind what you're feeling. Emotions often point us toward what matters most to us. What do you think this feeling is trying to tell you?",
      "It takes courage to acknowledge and share our emotions. They're like messengers from our deeper selves. What would it mean to honor what you're feeling right now?",
      "Our emotional landscape is so rich and complex. Every feeling has something to teach us about who we are and what we need. What feels most important to process right now?"
    ];
    return this.getRandomResponse(responses);
  },

  getPersonalityResponse(msg) {
    const responses = [
      "Self-discovery is one of the most rewarding journeys we can take. I sense you're someone who thinks deeply about identity and growth. What aspects of yourself are you most curious about right now?",
      "There's something beautiful about the quest to understand ourselves. We're all such intricate beings with unique gifts. What part of your personality feels most true to who you are?",
      "I love how you're exploring these deeper questions about identity. Understanding ourselves is the foundation for all meaningful connections. What have you learned about yourself recently?",
      "Personality is like a constellation - there are so many facets that make up who we are. What traits or qualities do you feel define your authentic self?"
    ];
    return this.getRandomResponse(responses);
  },

  getCompatibilityResponse(msg) {
    const responses = [
      "True compatibility goes so much deeper than surface-level similarities. It's about values, communication styles, and how two people bring out the best in each other. What does compatibility mean to you?",
      "I think the most beautiful connections happen when two people can be completely themselves together. What would it feel like to be with someone who truly sees and appreciates your authentic self?",
      "Compatibility isn't about finding someone identical to you - it's about finding someone whose differences complement and enrich your life. What kind of energy do you hope to share with a partner?",
      "The best matches aren't perfect - they're two people who choose to grow together and support each other's becoming. What qualities would help someone be a good companion on your life journey?"
    ];
    return this.getRandomResponse(responses);
  },

  getLoveResponse(msg) {
    const responses = [
      "Love and connection are what make us most human. There's something beautiful about how you're exploring these deeper questions. What kind of love or connection are you hoping to cultivate in your life?",
      "Love is such a profound force - it has the power to transform us and help us become our best selves. What does love mean to you in this season of your life?",
      "Connection happens in so many ways - through shared values, deep conversations, laughter, and understanding. What forms of connection feel most meaningful to you?",
      "There's an art to loving well - it requires vulnerability, presence, and genuine care. What would it look like for you to both give and receive love fully?"
    ];
    return this.getRandomResponse(responses);
  },

  getDefaultResponse() {
    const responses = [
      "I can sense there's something meaningful behind what you're sharing. While I gather my thoughts, I'm curious - what's really at the heart of what you're thinking about right now?",
      "Thank you for opening up to me. Sometimes the most profound conversations need a moment of reflection. What would be most helpful for you to explore together?",
      "I want to give you a thoughtful response because what you're sharing matters. Can you tell me more about what's been on your mind?",
      "There's depth in what you're expressing, and I want to meet you there. What feels most important for you to process or understand right now?",
      "I hear you, and I want to respond with the care you deserve. What's calling for your attention in this moment?"
    ];
    return this.getRandomResponse(responses);
  },

  // Utility methods
  getRandomResponse(responses) {
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  },

  // Advanced response based on conversation context
  getContextualResponse(message, conversationHistory = []) {
    // If this is a follow-up question
    if (conversationHistory.length > 0) {
      const lastResponse = conversationHistory[conversationHistory.length - 1];
      
      if (lastResponse && lastResponse.sender === 'ai') {
        return "I'm reflecting on what you shared. That gives me a deeper understanding of who you are. What else would you like to explore together?";
      }
    }
    
    // Default to regular response logic
    return this.getResponse(message);
  },

  // Emergency fallback (absolute last resort)
  getEmergencyResponse() {
    return "I'm here with you, even when words feel hard to find. What's most important to you in this moment?";
  }
};