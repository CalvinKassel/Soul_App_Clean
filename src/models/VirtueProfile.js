// Minimal VirtueProfile for imports to work

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
    this.virtueScores = new Map();
    this.customValues = new Map();
    this.inferenceHistory = [];
    this.lastUpdated = new Date();
  }

  updateVirtueScore(virtue, change, source, userStory = null) {
    const currentScore = this.virtueScores.get(virtue) || 0;
    const newScore = Math.max(0, Math.min(1, currentScore + change));
    
    this.virtueScores.set(virtue, newScore);
    
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

  addCustomValue(userTerm, linkedVirtue, confidence = 0.8) {
    this.customValues.set(userTerm.toLowerCase(), {
      linkedVirtue,
      confidence,
      userDefined: true
    });
    
    this.updateVirtueScore(linkedVirtue, confidence * 0.3, 'user_definition', `User defined "${userTerm}"`);
  }

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

  getCustomTermForVirtue(virtue) {
    for (const [term, data] of this.customValues.entries()) {
      if (data.linkedVirtue === virtue) {
        return term;
      }
    }
    return null;
  }

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

  toJSON() {
    return {
      userId: this.userId,
      virtueScores: Object.fromEntries(this.virtueScores),
      customValues: Object.fromEntries(this.customValues),
      inferenceHistory: this.inferenceHistory,
      lastUpdated: this.lastUpdated
    };
  }

  static fromJSON(data) {
    const profile = new VirtueProfile(data.userId);
    profile.virtueScores = new Map(Object.entries(data.virtueScores || {}));
    profile.customValues = new Map(Object.entries(data.customValues || {}));
    profile.inferenceHistory = data.inferenceHistory || [];
    profile.lastUpdated = new Date(data.lastUpdated);
    return profile;
  }
}