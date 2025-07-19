// models/Match.js - Database Model
// Save in: backend/models/Match.js

class Match {
  constructor(matchData = {}) {
    this.id = matchData.id || null;
    this.users = matchData.users || []; // Array of user IDs [userId1, userId2]
    this.status = matchData.status || 'pending'; // pending, confirmed, expired, blocked
    this.createdAt = matchData.createdAt || new Date();
    this.lastInteraction = matchData.lastInteraction || new Date();
    this.expiresAt = matchData.expiresAt || null;
    
    // Compatibility analysis from SoulAI
    this.compatibility = {
      score: 0,
      sharedValues: [],
      complementaryTraits: [],
      potentialChallenges: [],
      recommendation: 'unknown',
      confidence: 0,
      analysis: {},
      ...matchData.compatibility
    };

    // SoulAI conversation data
    this.soulAIConversation = {
      conversationId: '',
      stage: 'initial_assessment',
      messages: [],
      analysisHistory: [],
      finalRecommendation: null,
      ...matchData.soulAIConversation
    };

    // User interaction data
    this.interaction = {
      conversationStarted: false,
      messageCount: 0,
      lastMessageAt: null,
      initiatedBy: null, // which user started the conversation
      mutualLike: false,
      ...matchData.interaction
    };

    // Match metadata
    this.metadata = {
      matchingAlgorithmVersion: '1.0',
      soulAIVersion: '1.0',
      contextFactors: [],
      qualityScore: 0,
      ...matchData.metadata
    };

    // Privacy and moderation
    this.moderation = {
      isReported: false,
      reportedBy: null,
      reportReason: '',
      isBlocked: false,
      blockedBy: null,
      ...matchData.moderation
    };
  }

  // Status management
  confirm() {
    this.status = 'confirmed';
    this.lastInteraction = new Date();
    this.interaction.mutualLike = true;
  }

  expire() {
    this.status = 'expired';
    this.lastInteraction = new Date();
  }

  block(blockedBy, reason = '') {
    this.status = 'blocked';
    this.moderation.isBlocked = true;
    this.moderation.blockedBy = blockedBy;
    this.moderation.reportReason = reason;
    this.lastInteraction = new Date();
  }

  // Conversation management
  startConversation(initiatedBy) {
    this.interaction.conversationStarted = true;
    this.interaction.initiatedBy = initiatedBy;
    this.interaction.lastMessageAt = new Date();
    this.lastInteraction = new Date();
  }

  recordMessage(fromUserId) {
    this.interaction.messageCount++;
    this.interaction.lastMessageAt = new Date();
    this.lastInteraction = new Date();
  }

  // Compatibility methods
  updateCompatibility(compatibilityData) {
    this.compatibility = { ...this.compatibility, ...compatibilityData };
    this.lastInteraction = new Date();
  }

  getCompatibilityScore() {
    return this.compatibility.score;
  }

  hasHighCompatibility() {
    return this.compatibility.score >= 0.8;
  }

  hasMediumCompatibility() {
    return this.compatibility.score >= 0.6 && this.compatibility.score < 0.8;
  }

  hasLowCompatibility() {
    return this.compatibility.score < 0.6;
  }

  // SoulAI conversation management
  updateSoulAIConversation(conversationData) {
    this.soulAIConversation = { ...this.soulAIConversation, ...conversationData };
    this.lastInteraction = new Date();
  }

  addSoulAIMessage(message) {
    this.soulAIConversation.messages.push({
      timestamp: new Date(),
      ...message
    });
    this.lastInteraction = new Date();
  }

  setSoulAIStage(stage) {
    this.soulAIConversation.stage = stage;
    this.lastInteraction = new Date();
  }

  setFinalRecommendation(recommendation) {
    this.soulAIConversation.finalRecommendation = recommendation;
    this.lastInteraction = new Date();
  }

  // Utility methods
  getOtherUserId(currentUserId) {
    return this.users.find(userId => userId !== currentUserId);
  }

  includesUser(userId) {
    return this.users.includes(userId);
  }

  isActive() {
    return this.status === 'confirmed' || this.status === 'pending';
  }

  isExpired() {
    if (this.expiresAt && new Date() > this.expiresAt) {
      return true;
    }
    return this.status === 'expired';
  }

  isDormant() {
    const daysSinceLastInteraction = (new Date() - this.lastInteraction) / (1000 * 60 * 60 * 24);
    return daysSinceLastInteraction > 7; // No interaction for 7 days
  }

  // Analytics methods
  getMatchAge() {
    return new Date() - this.createdAt;
  }

  getMatchAgeInDays() {
    return Math.floor(this.getMatchAge() / (1000 * 60 * 60 * 24));
  }

  getConversationEngagement() {
    if (!this.interaction.conversationStarted) return 0;
    
    const daysSinceStart = this.getMatchAgeInDays();
    return daysSinceStart > 0 ? this.interaction.messageCount / daysSinceStart : 0;
  }

  getQualityScore() {
    let score = 0;
    
    // Compatibility score weight (40%)
    score += this.compatibility.score * 0.4;
    
    // Conversation engagement weight (30%)
    const engagement = this.getConversationEngagement();
    score += Math.min(engagement / 10, 1) * 0.3; // Normalize to 0-1
    
    // Match longevity weight (20%)
    const longevity = Math.min(this.getMatchAgeInDays() / 30, 1); // Up to 30 days
    score += longevity * 0.2;
    
    // SoulAI confidence weight (10%)
    score += this.compatibility.confidence * 0.1;
    
    this.metadata.qualityScore = Math.round(score * 100) / 100;
    return this.metadata.qualityScore;
  }

  // Moderation methods
  report(reportedBy, reason) {
    this.moderation.isReported = true;
    this.moderation.reportedBy = reportedBy;
    this.moderation.reportReason = reason;
    this.lastInteraction = new Date();
  }

  // Serialization methods
  toJSON() {
    return {
      id: this.id,
      users: this.users,
      status: this.status,
      createdAt: this.createdAt,
      lastInteraction: this.lastInteraction,
      expiresAt: this.expiresAt,
      compatibility: this.compatibility,
      soulAIConversation: this.soulAIConversation,
      interaction: this.interaction,
      metadata: this.metadata,
      moderation: this.moderation
    };
  }

  toPublicMatch(forUserId) {
    // Return match data appropriate for client consumption
    return {
      id: this.id,
      otherUserId: this.getOtherUserId(forUserId),
      status: this.status,
      createdAt: this.createdAt,
      lastInteraction: this.lastInteraction,
      compatibility: {
        score: this.compatibility.score,
        sharedValues: this.compatibility.sharedValues,
        recommendation: this.compatibility.recommendation
      },
      interaction: {
        conversationStarted: this.interaction.conversationStarted,
        messageCount: this.interaction.messageCount,
        lastMessageAt: this.interaction.lastMessageAt
      },
      qualityScore: this.getQualityScore(),
      matchAgeInDays: this.getMatchAgeInDays()
    };
  }

  toMinimalMatch(forUserId) {
    // Minimal match data for lists
    return {
      id: this.id,
      otherUserId: this.getOtherUserId(forUserId),
      status: this.status,
      compatibilityScore: this.compatibility.score,
      lastInteraction: this.lastInteraction,
      hasNewMessages: this.hasNewMessages(forUserId)
    };
  }

  // Helper methods for UI
  hasNewMessages(forUserId) {
    // In a real implementation, this would check against user's last read timestamp
    const recentThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
    return this.interaction.lastMessageAt && this.interaction.lastMessageAt > recentThreshold;
  }

  getStatusDisplay() {
    switch (this.status) {
      case 'pending':
        return { text: 'Pending', color: '#FFA500' };
      case 'confirmed':
        return { text: 'Matched', color: '#4ECDC4' };
      case 'expired':
        return { text: 'Expired', color: '#8E8E93' };
      case 'blocked':
        return { text: 'Blocked', color: '#FF6B6B' };
      default:
        return { text: 'Unknown', color: '#8E8E93' };
    }
  }

  getCompatibilityLevel() {
    if (this.compatibility.score >= 0.9) return 'exceptional';
    if (this.compatibility.score >= 0.8) return 'high';
    if (this.compatibility.score >= 0.6) return 'medium';
    if (this.compatibility.score >= 0.4) return 'low';
    return 'very_low';
  }

  // Validation
  validate() {
    const errors = [];

    if (!this.id) {
      errors.push('Match ID is required');
    }

    if (!Array.isArray(this.users) || this.users.length !== 2) {
      errors.push('Match must have exactly 2 users');
    }

    if (this.users[0] === this.users[1]) {
      errors.push('Match cannot be between the same user');
    }

    const validStatuses = ['pending', 'confirmed', 'expired', 'blocked'];
    if (!validStatuses.includes(this.status)) {
      errors.push('Invalid match status');
    }

    if (this.compatibility.score < 0 || this.compatibility.score > 1) {
      errors.push('Compatibility score must be between 0 and 1');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Static factory methods
  static createPending(userId1, userId2, compatibility) {
    return new Match({
      id: `match_${userId1}_${userId2}_${Date.now()}`,
      users: [userId1, userId2],
      status: 'pending',
      compatibility: compatibility,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
  }

  static createConfirmed(userId1, userId2, compatibility) {
    return new Match({
      id: `match_${userId1}_${userId2}_${Date.now()}`,
      users: [userId1, userId2],
      status: 'confirmed',
      compatibility: compatibility,
      interaction: { mutualLike: true }
    });
  }

  static fromJSON(matchData) {
    return new Match(matchData);
  }

  // Database operations (in a real app, these would interact with your database)
  async save() {
    // Placeholder for database save operation
    console.log(`💾 Saving match: ${this.id}`);
    return this;
  }

  static async findById(matchId) {
    // Placeholder for database find operation
    console.log(`🔍 Finding match by ID: ${matchId}`);
    return null;
  }

  static async findByUserId(userId) {
    // Placeholder for finding all matches for a user
    console.log(`🔍 Finding matches for user: ${userId}`);
    return [];
  }

  static async findActiveMatches() {
    // Placeholder for finding all active matches
    console.log('🔍 Finding all active matches');
    return [];
  }

  async delete() {
    // Placeholder for database delete operation
    console.log(`🗑️ Deleting match: ${this.id}`);
    return true;
  }
}

module.exports = Match;