import ApiService from '../services/ApiService';

// Enhanced AI response using multi-agent system V2
export async function getEnhancedAIResponse(userInput, conversationHistory = [], userProfile = {}) {
  try {
    console.log('🧠 Getting response from SoulAI Multi-Agent System V2...');
    
    // Enhanced user profile that grows over time
    const enhancedProfile = {
      name: 'User',
      personalityType: userProfile.personalityType || 'Learning about you',
      interests: userProfile.interests || ['meaningful connections'],
      relationshipGoals: userProfile.relationshipGoals || 'Finding the right person',
      values: userProfile.values || [],
      communicationStyle: userProfile.communicationStyle || 'Discovering',
      lifestyle: userProfile.lifestyle || [],
      ...userProfile
    };

    // Determine matching status
    const matchingStatus = getMatchingStatus(conversationHistory, enhancedProfile);

    // Format conversation history
    const formattedHistory = conversationHistory.map(msg => ({
      user: msg.user,
      text: msg.text,
      timestamp: msg.timestamp || new Date().toISOString()
    }));

    // Call the V2 multi-agent endpoint
    const response = await ApiService.soulConversationV2(
      userInput,
      formattedHistory,
      enhancedProfile,
      matchingStatus
    );

    // Handle agent insights
    if (response.agentInsights) {
      console.log(`🤖 Agent used: ${response.agentInsights.intent}`);
    }

    // Handle match readiness
    if (response.shouldPresentMatches) {
      console.log('🎯 User is ready for matches!');
    }

    console.log(`📊 Profile ${response.profileCompleteness}% complete`);
    console.log(`🔄 Next step: ${response.nextSteps}`);

    return response.response;
    
  } catch (error) {
    console.error("Error with SoulAI Multi-Agent System:", error);

    // Intelligent fallbacks based on conversation stage
    const fallbackResponses = getFallbackForStage(conversationHistory.length);
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
}

function getMatchingStatus(conversationHistory, userProfile) {
  const messageCount = conversationHistory.length;
  const hasPersonality = userProfile.personalityType && userProfile.personalityType !== 'Learning about you';
  const hasInterests = userProfile.interests && userProfile.interests.length > 1;
  const hasGoals = userProfile.relationshipGoals && userProfile.relationshipGoals !== 'Finding the right person';

  if (messageCount < 5) return 'analyzing_preferences';
  if (messageCount < 15) return 'building_profile';
  if (messageCount < 25 && (!hasPersonality || !hasInterests)) return 'building_profile';
  if (messageCount < 30 && !hasGoals) return 'scanning_matches';
  return 'ready_to_match';
}

function getFallbackForStage(messageCount) {
  if (messageCount < 10) {
    return [
      `I'm getting to know you so I can find your perfect match. This helps me understand what kind of connection will truly work for you.

While we chat, I'm building a comprehensive picture of your ideal match using relationship psychology research. Every detail you share helps me narrow down the search.

What kind of activities make you feel most energized? For example:
- Creative projects like writing, art, or music
- Social gatherings with friends and family  
- Outdoor adventures and physical activities
- Quiet solo time for reading or reflection

This tells me about your energy patterns and lifestyle compatibility needs.`
    ];
  } else {
    return [
      `I'm getting close to having some exceptional people to introduce you to! Based on everything you've shared, I'm building a comprehensive compatibility profile.

I've been running advanced compatibility analyses in the background, and I'm excited about the quality of matches I'm finding.

What's something you absolutely need your future partner to understand about you? For example:
- Your need for personal growth and self-improvement
- Your passion for your career or creative pursuits
- Your communication style and emotional needs
- Your values around family, lifestyle, or future goals

This helps me find people who will truly "get" you from the start.`
    ];
  }
}

// Legacy function for backward compatibility
export async function callOpenAI(userInput, conversationHistory = []) {
  return getEnhancedAIResponse(userInput, conversationHistory);
}import ApiService from '../services/ApiService';

// Enhanced AI response using V3 Emotional Intelligence System
export async function getEnhancedAIResponse(userInput, conversationHistory = [], userProfile = {}) {
  try {
    console.log('🧠✨ Getting response from SoulAI V3 - Emotional Intelligence System...');
    
    // Enhanced user profile that grows over time
    const enhancedProfile = {
      name: 'User',
      personalityType: userProfile.personalityType || 'Learning about you',
      interests: userProfile.interests || ['meaningful connections'],
      relationshipGoals: userProfile.relationshipGoals || 'Finding the right person',
      values: userProfile.values || [],
      communicationStyle: userProfile.communicationStyle || 'Discovering',
      loveLanguage: userProfile.loveLanguage || 'Learning',
      conflictStyle: userProfile.conflictStyle || 'Exploring',
      lifestyle: userProfile.lifestyle || [],
      virtueProfile: userProfile.virtueProfile || {},
      ...userProfile
    };

    // Determine matching status
    const matchingStatus = getMatchingStatus(conversationHistory, enhancedProfile);

    // Format conversation history
    const formattedHistory = conversationHistory.map(msg => ({
      user: msg.user,
      text: msg.text,
      timestamp: msg.timestamp || new Date().toISOString()
    }));

    // Call the V3 emotional intelligence endpoint
    const response = await ApiService.request('/api/chat/soul-conversation-v3', {
      method: 'POST',
      body: JSON.stringify({
        userInput,
        conversationHistory: formattedHistory,
        userProfile: enhancedProfile,
        matchingStatus
      }),
    });

    // Handle progress updates
    if (response.currentStage) {
      console.log(`${response.currentStage.icon} Stage: ${response.currentStage.name} (${response.currentStage.stageNumber}/${response.currentStage.totalStages})`);
      console.log(`📊 Profile ${response.profileCompleteness}% complete`);
      console.log(`⏱️ Estimate: ${response.timeEstimate} until matches`);
    }

    // Handle match readiness
    if (response.shouldPresentMatches) {
      console.log('✨ Ready for matches! User has completed the journey');
      // TODO: Trigger match presentation in your app
    }

    return response.response;
    
  } catch (error) {
    console.error("Error with SoulAI V3 Emotional Intelligence System:", error);

    // Emotionally intelligent fallbacks
    const fallbackResponses = getEmotionallyIntelligentFallbacks(conversationHistory.length, userInput);
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
}

function getMatchingStatus(conversationHistory, userProfile) {
  const messageCount = conversationHistory.length;
  const profileFields = ['personalityType', 'interests', 'relationshipGoals', 'values', 'communicationStyle'];
  const completedFields = profileFields.filter(field => 
    userProfile[field] && 
    (Array.isArray(userProfile[field]) ? userProfile[field].length > 0 : userProfile[field] !== 'Learning about you')
  );

  if (messageCount < 5) return 'analyzing_preferences';
  if (messageCount < 15 || completedFields.length < 2) return 'building_profile';
  if (messageCount < 25 || completedFields.length < 4) return 'scanning_matches';
  return 'ready_to_match';
}

function getEmotionallyIntelligentFallbacks(messageCount, userInput) {
  // Detect emotional tone for better fallbacks
  const input = userInput.toLowerCase();
  
  if (input.includes('frustrated') || input.includes('tired') || input.includes('giving up')) {
    return [
      `I can sense some frustration, and that's completely understandable. Finding the right person is one of life's biggest challenges, and it's okay to feel overwhelmed sometimes.

We're in this journey together, and there's no rush. Right now, I'm focused on truly understanding who you are so that when we do find your person, it'll be absolutely worth the wait.

What would help you feel most supported right now? Sometimes just talking about what a fulfilling relationship looks like can help us both get clarity on what we're working toward.`
    ];
  }

  if (input.includes('excited') || input.includes('amazing') || input.includes('can\'t wait')) {
    return [
      `Your excitement is absolutely contagious! I love seeing this energy from you - it tells me so much about what truly lights you up and gets you motivated.

We're making wonderful progress in understanding what kind of connection will make your heart sing. Your enthusiasm is actually giving me valuable insights into what brings out the best in you.

What is it about this process that feels most exciting to you? That joy you're feeling is exactly the kind of energy that's going to attract an amazing person into your life.`
    ];
  }

  // Default responses based on conversation progress
  if (messageCount < 10) {
    return [
      `We're just getting started on this journey together, and I'm already sensing some beautiful qualities about who you are. Each conversation we have helps me understand you better.

I'm currently building a comprehensive picture of your personality, values, and what makes you feel most understood. Think of this like a master artist getting to know their subject before creating a masterpiece.

What I'm most curious about right now is understanding what makes you feel most appreciated in relationships. This helps me find someone who will naturally make you feel valued and cherished.`
    ];
  } else {
    return [
      `Looking back on our conversations, it's amazing how much we've discovered together about what you're truly looking for. We're building something really special here - a deep understanding of your heart.

I'm about 70% of the way through understanding what makes you tick, and I'm getting genuinely excited about the quality of matches this is going to produce.

What's something you want your future partner to understand about you from day one? This helps me find people who will appreciate the real you, right from the start.`
    ];
  }
}

// Function to get progress information
export async function getProgressUpdate(conversationHistory, userProfile) {
  try {
    const response = await getEnhancedAIResponse("progress_check", conversationHistory, userProfile);
    return response;
  } catch (error) {
    console.error('Error getting progress update:', error);
    return null;
  }
}

// Legacy functions for backward compatibility
export async function callOpenAI(userInput, conversationHistory = []) {
  return getEnhancedAIResponse(userInput, conversationHistory);
}