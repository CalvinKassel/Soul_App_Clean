// lib/models/VirtueProfile.js
// This system goes beyond surface preferences to understand a user's deep character values

export const VirtueCategories = {
  WISDOM: {
    name: "Wisdom",
    description: "Curiosity, Love of Learning, Perspective",
    keywords: ["curious", "learning", "knowledge", "understanding", "insight", "wisdom", "growth"]
  },
  COURAGE: {
    name: "Courage", 
    description: "Bravery, Authenticity, Zest, Perseverance",
    keywords: ["brave", "authentic", "genuine", "bold", "honest", "real", "adventurous"]
  },
  HUMANITY: {
    name: "Humanity",
    description: "Kindness, Love, Social Intelligence, Compassion",
    keywords: ["kind", "caring", "empathy", "compassion", "loving", "supportive", "understanding"]
  },
  JUSTICE: {
    name: "Justice",
    description: "Fairness, Leadership, Teamwork, Citizenship", 
    keywords: ["fair", "equal", "leader", "team", "cooperation", "justice", "responsibility"]
  },
  TEMPERANCE: {
    name: "Temperance",
    description: "Forgiveness, Humility, Self-Control, Prudence",
    keywords: ["balanced", "humble", "controlled", "disciplined", "moderate", "patient"]
  },
  TRANSCENDENCE: {
    name: "Transcendence", 
    description: "Beauty, Gratitude, Hope, Humor, Spirituality",
    keywords: ["beauty", "grateful", "hopeful", "optimistic", "spiritual", "humor", "meaning"]
  },
  RESPECT: {
    name: "Respect",
    description: "Valuing others' time, autonomy, and dignity",
    keywords: ["respectful", "considerate", "punctual", "boundaries", "dignity", "courtesy"]
  },
  INTEGRITY: {
    name: "Integrity",
    description: "Honesty, Conscientiousness, Reliability, Authenticity",
    keywords: ["honest", "reliable", "trustworthy", "consistent", "principled", "dependable"]
  }
};

export class VirtueProfile {
  constructor(userId) {
    this.userId = userId;
    this.virtueScores = new Map(); // Virtue -> confidence score (0-1)
    this.customValues = new Map(); // User's own terms -> linked virtue
    this.inferenceHistory = []; // Track how we learned each virtue
    this.lastUpdated = new Date();
  }

  // Add or update a virtue score based on user story/feedback
  updateVirtueScore(virtue, change, source, userStory = null) {
    const currentScore = this.virtueScores.get(virtue) || 0;
    const newScore = Math.max(0, Math.min(1, currentScore + change));
    
    this.virtueScores.set(virtue, newScore);
    
    // Track how we learned this
    this.inferenceHistory.push({
      virtue,
      change,
      source,
      userStory,
      timestamp: new Date(),
      resultingScore: newScore
    });
    
    this.lastUpdated = new Date();
    return newScore;
  }

  // Allow users to define their own value terms
  addCustomValue(userTerm, linkedVirtue, confidence = 0.8) {
    this.customValues.set(userTerm.toLowerCase(), {
      linkedVirtue,
      confidence,
      userDefined: true
    });
    
    // Also update the linked virtue score
    this.updateVirtueScore(linkedVirtue, confidence * 0.3, 'user_definition', `User defined "${userTerm}"`);
  }

  // Get the top virtues for this user
  getTopVirtues(limit = 3) {
    const sorted = Array.from(this.virtueScores.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit);
    
    return sorted.map(([virtue, score]) => ({
      virtue,
      score,
      customTerm: this.getCustomTermForVirtue(virtue)
    }));
  }

  // Check if user has a custom term for a virtue
  getCustomTermForVirtue(virtue) {
    for (const [term, data] of this.customValues.entries()) {
      if (data.linkedVirtue === virtue) {
        return term;
      }
    }
    return null;
  }

  // Generate a user-friendly summary
  generateSummary() {
    const topVirtues = this.getTopVirtues(3);
    
    if (topVirtues.length === 0) {
      return "We're still getting to know what matters most to you.";
    }

    const virtueNames = topVirtues.map(({virtue, customTerm}) => 
      customTerm || VirtueCategories[virtue]?.name || virtue
    );

    return `From our conversations, it seems you particularly value ${virtueNames.join(', ')}. Does this feel accurate to you?`;
  }

  // Export for storage/API
  toJSON() {
    return {
      userId: this.userId,
      virtueScores: Object.fromEntries(this.virtueScores),
      customValues: Object.fromEntries(this.customValues),
      inferenceHistory: this.inferenceHistory,
      lastUpdated: this.lastUpdated
    };
  }

  // Import from storage/API
  static fromJSON(data) {
    const profile = new VirtueProfile(data.userId);
    profile.virtueScores = new Map(Object.entries(data.virtueScores || {}));
    profile.customValues = new Map(Object.entries(data.customValues || {}));
    profile.inferenceHistory = data.inferenceHistory || [];
    profile.lastUpdated = new Date(data.lastUpdated);
    return profile;
  }
}

// Utility class for analyzing user stories to extract virtues
export class VirtueExtractor {
  
  // Analyze a user's positive story about someone to infer what they value
  static analyzePositiveStory(story) {
    const analysis = {
      detectedVirtues: [],
      confidence: 0,
      reasoning: ""
    };

    const storyLower = story.toLowerCase();
    
    // Check each virtue category for keyword matches
    for (const [virtueKey, virtue] of Object.entries(VirtueCategories)) {
      const matches = virtue.keywords.filter(keyword => 
        storyLower.includes(keyword)
      );
      
      if (matches.length > 0) {
        const confidence = Math.min(0.9, matches.length * 0.3);
        analysis.detectedVirtues.push({
          virtue: virtueKey,
          confidence,
          matchedKeywords: matches
        });
      }
    }

    // Sort by confidence
    analysis.detectedVirtues.sort((a, b) => b.confidence - a.confidence);
    
    if (analysis.detectedVirtues.length > 0) {
      const top = analysis.detectedVirtues[0];
      analysis.confidence = top.confidence;
      analysis.reasoning = `Detected appreciation for ${VirtueCategories[top.virtue].name} based on keywords: ${top.matchedKeywords.join(', ')}`;
    }

    return analysis;
  }

  // Analyze a user's complaint/frustration to infer violated values
  static analyzeNegativeStory(story) {
    const analysis = {
      violatedVirtues: [],
      confidence: 0,
      reasoning: ""
    };

    const storyLower = story.toLowerCase();
    
    // Look for negation patterns and virtue keywords
    const negationPatterns = [
      "not", "isn't", "wasn't", "don't", "doesn't", "didn't", 
      "never", "lack", "without", "missing", "hate", "dislike"
    ];

    let hasNegation = negationPatterns.some(pattern => 
      storyLower.includes(pattern)
    );

    if (hasNegation) {
      for (const [virtueKey, virtue] of Object.entries(VirtueCategories)) {
        const matches = virtue.keywords.filter(keyword => 
          storyLower.includes(keyword)
        );
        
        if (matches.length > 0) {
          const confidence = Math.min(0.8, matches.length * 0.4);
          analysis.violatedVirtues.push({
            virtue: virtueKey,
            confidence,
            matchedKeywords: matches
          });
        }
      }
    }

    // Sort by confidence  
    analysis.violatedVirtues.sort((a, b) => b.confidence - a.confidence);
    
    if (analysis.violatedVirtues.length > 0) {
      const top = analysis.violatedVirtues[0];
      analysis.confidence = top.confidence;
      analysis.reasoning = `Detected frustration with lack of ${VirtueCategories[top.virtue].name} based on context`;
    }

    return analysis;
  }

  // Generate a follow-up question to clarify the user's values
  static generateClarificationQuestion(detectedVirtue, userStory) {
    const virtue = VirtueCategories[detectedVirtue];
    if (!virtue) return "Can you tell me more about what's important to you?";

    const questions = [
      `It sounds like ${virtue.name.toLowerCase()} is really important to you. Is that something you look for in everyone, or especially in a romantic partner?`,
      `I'm hearing that you value ${virtue.name.toLowerCase()}. What does that look like to you in a relationship?`,
      `${virtue.name} seems to matter to you. Can you help me understand what that means in your own words?`
    ];

    return questions[Math.floor(Math.random() * questions.length)];
  }
}

// Example usage and test functions
export const VirtueProfileExample = {
  // Simulate learning from user interactions
  createSampleProfile() {
    const profile = new VirtueProfile("user123");
    
    // User says: "I loved how thoughtful and curious she was about everything"
    const analysis1 = VirtueExtractor.analyzePositiveStory("I loved how thoughtful and curious she was about everything");
    if (analysis1.detectedVirtues.length > 0) {
      const top = analysis1.detectedVirtues[0];
      profile.updateVirtueScore(top.virtue, top.confidence, 'positive_story', "loved how thoughtful and curious she was");
    }
    
    // User says: "I can't stand when people are flaky and unreliable"
    const analysis2 = VirtueExtractor.analyzeNegativeStory("I can't stand when people are flaky and unreliable");
    if (analysis2.violatedVirtues.length > 0) {
      const top = analysis2.violatedVirtues[0];
      profile.updateVirtueScore(top.virtue, top.confidence, 'negative_story', "can't stand flaky and unreliable people");
    }
    
    // User defines custom value: "For me, it's more about 'emotional intelligence'"
    profile.addCustomValue("emotional intelligence", "HUMANITY", 0.9);
    
    return profile;
  },
  
  // Test the system
  testProfile() {
    const profile = this.createSampleProfile();
    console.log("Sample Virtue Profile:");
    console.log("Top Virtues:", profile.getTopVirtues());
    console.log("Summary:", profile.generateSummary());
    console.log("Full Profile:", profile.toJSON());
    
    return profile;
  }
};