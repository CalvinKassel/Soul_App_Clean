// SoulAI Integration - Connect to backend instead of direct Vertex AI
export const sendMessageToAgent = async (userMessage) => {
  try {
    // Call your backend which has the proper Vertex AI integration
    const response = await fetch('https://e33cb582cc47.ngrok-free.app/api/vertex-ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        sessionId: 'mobile-app-session'
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend call failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.response || "I'm not sure what to say.";

  } catch (error) {
    console.error("Error communicating with SoulAI:", error);
    
    // Fallback to your existing SoulAI chat system
    try {
      const fallbackResponse = await fetch('https://e33cb582cc47.ngrok-free.app/api/tools/analyze-personality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessages: [userMessage],
          context: 'dating'
        }),
      });

      if (fallbackResponse.ok) {
        const personalityData = await fallbackResponse.json();
        return `Based on your message, you seem like a ${personalityData.personalityType} with an HHC code of ${personalityData.hhcCode}. ${personalityData.summary}`;
      }
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
    }
    
    return "I'm having trouble connecting right now, but I'm here to help you with personality analysis and dating advice!";
  }
};