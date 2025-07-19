// Fallback fetchAIResponse - use ApiService instead for new features
import ApiService from './ApiService';

export default async function fetchAIResponse(userInput) {
  try {
    console.log('⚠️  Using legacy fetchAIResponse - consider upgrading to ApiService');
    
    // Try the new backend first
    const userProfile = {
      name: 'You',
      personalityType: 'Learning',
      interests: ['meaningful connections'],
      aboutMe: 'Getting to know you'
    };

    const matchProfile = {
      name: 'SoulAI',
      personalityType: 'ENFJ-A', 
      interests: ['helping others', 'psychology'],
      aboutMe: 'AI companion for meaningful conversations'
    };

    const response = await ApiService.suggestChatResponse(
      userProfile,
      matchProfile,
      [],
      userInput
    );

    return response.suggestedResponses[0] || "I'd love to hear more about that.";
    
  } catch (error) {
    console.error("❌ Fetch AI Response error:", error);
    
    // Fallback to simple responses
    const fallbackResponses = [
      "That's really interesting. Tell me more.",
      "I'd love to hear more about that.",
      "What else is on your mind?",
      "That gives me insight into who you are.",
      "How does that make you feel?"
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
}