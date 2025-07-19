// Relationship Milestone Tracking System
// Revolutionary AI-powered relationship progress tracking and milestone recognition

import AsyncStorage from '@react-native-async-storage/async-storage';
import PersonalityProfilingEngine from './PersonalityProfilingEngine';
import CompatibilityMatchingEngine from './CompatibilityMatchingEngine';

class RelationshipMilestoneTracker {
  constructor() {
    this.initialized = false;
    this.storageKey = 'relationship_milestones';
    this.relationshipData = new Map();
    this.milestoneDefinitions = new Map();
    this.progressAnalyzer = new Map();
    
    // Initialize milestone definitions
    this.initializeMilestoneDefinitions();
  }

  // Initialize the milestone tracker
  async initialize() {
    if (this.initialized) return;

    try {
      await this.loadRelationshipData();
      this.initialized = true;
      console.log('Relationship Milestone Tracker initialized successfully');
    } catch (error) {
      console.error('Error initializing Relationship Milestone Tracker:', error);
      this.initialized = true; // Continue with empty data
    }
  }

  // Initialize milestone definitions
  initializeMilestoneDefinitions() {
    // Pre-relationship milestones
    this.milestoneDefinitions.set('first_contact', {
      category: 'pre_relationship',
      name: 'First Contact',
      description: 'Initial message or interaction',
      weight: 0.05,
      indicators: ['first_message', 'profile_view', 'initial_interaction'],
      significance: 'Beginning of potential connection'
    });

    this.milestoneDefinitions.set('mutual_interest', {
      category: 'pre_relationship',
      name: 'Mutual Interest',
      description: 'Both parties show interest in continuing conversation',
      weight: 0.10,
      indicators: ['response_consistency', 'question_asking', 'engagement_level'],
      significance: 'Foundation for deeper connection'
    });

    this.milestoneDefinitions.set('deeper_conversation', {
      category: 'pre_relationship',
      name: 'Deeper Conversation',
      description: 'Conversations move beyond surface level',
      weight: 0.15,
      indicators: ['personal_sharing', 'emotional_topics', 'vulnerability'],
      significance: 'Building emotional connection'
    });

    this.milestoneDefinitions.set('meeting_suggestion', {
      category: 'pre_relationship',
      name: 'Meeting Suggestion',
      description: 'One party suggests meeting in person',
      weight: 0.20,
      indicators: ['date_suggestion', 'meet_proposal', 'real_life_connection'],
      significance: 'Transition to real-world interaction'
    });

    // Early relationship milestones
    this.milestoneDefinitions.set('first_date', {
      category: 'early_relationship',
      name: 'First Date',
      description: 'First in-person meeting or date',
      weight: 0.25,
      indicators: ['meeting_confirmation', 'date_experience', 'physical_presence'],
      significance: 'Major step in relationship development'
    });

    this.milestoneDefinitions.set('consistent_communication', {
      category: 'early_relationship',
      name: 'Consistent Communication',
      description: 'Regular, daily communication pattern established',
      weight: 0.15,
      indicators: ['daily_messages', 'routine_communication', 'priority_status'],
      significance: 'Building relationship routine'
    });

    this.milestoneDefinitions.set('emotional_vulnerability', {
      category: 'early_relationship',
      name: 'Emotional Vulnerability',
      description: 'Sharing of deeper emotions and personal stories',
      weight: 0.20,
      indicators: ['personal_stories', 'emotional_sharing', 'trust_building'],
      significance: 'Deepening emotional intimacy'
    });

    this.milestoneDefinitions.set('physical_intimacy', {
      category: 'early_relationship',
      name: 'Physical Intimacy',
      description: 'Physical affection and intimacy development',
      weight: 0.18,
      indicators: ['physical_touch', 'affection_expression', 'intimacy_comfort'],
      significance: 'Physical connection establishment'
    });

    // Developing relationship milestones
    this.milestoneDefinitions.set('relationship_discussion', {
      category: 'developing_relationship',
      name: 'Relationship Discussion',
      description: 'Explicit discussion about relationship status',
      weight: 0.30,
      indicators: ['relationship_talk', 'status_clarification', 'future_discussion'],
      significance: 'Defining relationship boundaries'
    });

    this.milestoneDefinitions.set('meeting_friends_family', {
      category: 'developing_relationship',
      name: 'Meeting Friends/Family',
      description: 'Introduction to social circles',
      weight: 0.25,
      indicators: ['friend_introduction', 'family_meeting', 'social_integration'],
      significance: 'Social validation and integration'
    });

    this.milestoneDefinitions.set('future_planning', {
      category: 'developing_relationship',
      name: 'Future Planning',
      description: 'Making plans for shared future activities',
      weight: 0.22,
      indicators: ['future_plans', 'shared_goals', 'long_term_thinking'],
      significance: 'Commitment to future together'
    });

    this.milestoneDefinitions.set('conflict_resolution', {
      category: 'developing_relationship',
      name: 'Conflict Resolution',
      description: 'Successfully navigating first disagreements',
      weight: 0.20,
      indicators: ['disagreement_handling', 'resolution_skills', 'relationship_strengthening'],
      significance: 'Relationship resilience building'
    });

    // Committed relationship milestones
    this.milestoneDefinitions.set('exclusivity', {
      category: 'committed_relationship',
      name: 'Exclusivity',
      description: 'Commitment to exclusive relationship',
      weight: 0.35,
      indicators: ['exclusive_commitment', 'relationship_labels', 'monogamy_discussion'],
      significance: 'Major commitment milestone'
    });

    this.milestoneDefinitions.set('i_love_you', {
      category: 'committed_relationship',
      name: 'I Love You',
      description: 'First expression of love',
      weight: 0.40,
      indicators: ['love_expression', 'deep_emotions', 'commitment_deepening'],
      significance: 'Emotional commitment peak'
    });

    this.milestoneDefinitions.set('living_together', {
      category: 'committed_relationship',
      name: 'Living Together',
      description: 'Moving in together or cohabitation',
      weight: 0.35,
      indicators: ['cohabitation', 'shared_living', 'domestic_partnership'],
      significance: 'Major life integration step'
    });

    this.milestoneDefinitions.set('long_term_planning', {
      category: 'committed_relationship',
      name: 'Long-term Planning',
      description: 'Serious discussions about long-term future',
      weight: 0.30,
      indicators: ['marriage_discussion', 'life_goals', 'shared_vision'],
      significance: 'Future commitment planning'
    });
  }

  // Track relationship progress for a couple
  async trackRelationshipProgress(userId1, userId2, interactionData) {
    if (!this.initialized) await this.initialize();

    try {
      const relationshipKey = this.getRelationshipKey(userId1, userId2);
      
      // Get or create relationship data
      let relationshipData = this.relationshipData.get(relationshipKey) || 
        this.createEmptyRelationshipData(userId1, userId2);

      // Analyze interaction for milestone indicators
      const milestoneAnalysis = await this.analyzeMilestoneIndicators(interactionData, relationshipData);

      // Update relationship data
      relationshipData = this.updateRelationshipData(relationshipData, milestoneAnalysis, interactionData);

      // Check for milestone achievements
      const newMilestones = this.checkMilestoneAchievements(relationshipData, milestoneAnalysis);

      // Update progress scores
      relationshipData.progressScore = this.calculateProgressScore(relationshipData);
      relationshipData.relationshipStage = this.determineRelationshipStage(relationshipData);

      // Store updated data
      this.relationshipData.set(relationshipKey, relationshipData);
      await this.saveRelationshipData();

      return {
        relationshipData,
        newMilestones,
        progressScore: relationshipData.progressScore,
        relationshipStage: relationshipData.relationshipStage,
        recommendations: this.generateProgressRecommendations(relationshipData)
      };

    } catch (error) {
      console.error('Error tracking relationship progress:', error);
      return null;
    }
  }

  // Analyze interaction for milestone indicators
  async analyzeMilestoneIndicators(interactionData, relationshipData) {
    const analysis = {
      timestamp: new Date().toISOString(),
      type: interactionData.type,
      content: interactionData.content,
      indicators: [],
      milestoneSignals: new Map()
    };

    const content = interactionData.content?.toLowerCase() || '';
    
    // Analyze different types of interactions
    switch (interactionData.type) {
      case 'message':
        analysis.indicators.push(...this.analyzeMessageForMilestones(content, relationshipData));
        break;
      case 'date_plan':
        analysis.indicators.push(...this.analyzeDatePlanForMilestones(interactionData, relationshipData));
        break;
      case 'photo_share':
        analysis.indicators.push(...this.analyzePhotoShareForMilestones(interactionData, relationshipData));
        break;
      case 'call':
        analysis.indicators.push(...this.analyzeCallForMilestones(interactionData, relationshipData));
        break;
      case 'meeting':
        analysis.indicators.push(...this.analyzeMeetingForMilestones(interactionData, relationshipData));
        break;
    }

    // Map indicators to milestone signals
    for (const indicator of analysis.indicators) {
      for (const [milestoneId, milestone] of this.milestoneDefinitions) {
        if (milestone.indicators.includes(indicator.type)) {
          if (!analysis.milestoneSignals.has(milestoneId)) {
            analysis.milestoneSignals.set(milestoneId, []);
          }
          analysis.milestoneSignals.get(milestoneId).push(indicator);
        }
      }
    }

    return analysis;
  }

  // Analyze message content for milestone indicators
  analyzeMessageForMilestones(content, relationshipData) {
    const indicators = [];
    
    // Personal sharing indicators
    if (content.includes('i feel') || content.includes('i\'m feeling') || content.includes('personally')) {
      indicators.push({ type: 'personal_sharing', strength: 0.6, evidence: 'emotional expression' });
    }
    
    // Vulnerability indicators
    if (content.includes('vulnerable') || content.includes('scared') || content.includes('insecure')) {
      indicators.push({ type: 'emotional_sharing', strength: 0.7, evidence: 'vulnerability expression' });
    }
    
    // Future planning indicators
    if (content.includes('future') || content.includes('plan') || content.includes('someday')) {
      indicators.push({ type: 'future_plans', strength: 0.5, evidence: 'future-oriented language' });
    }
    
    // Relationship discussion indicators
    if (content.includes('relationship') || content.includes('we are') || content.includes('us')) {
      indicators.push({ type: 'relationship_talk', strength: 0.8, evidence: 'relationship-focused discussion' });
    }
    
    // Love expression indicators
    if (content.includes('love you') || content.includes('i love') || content.includes('love u')) {
      indicators.push({ type: 'love_expression', strength: 0.9, evidence: 'love declaration' });
    }
    
    // Meeting suggestion indicators
    if (content.includes('meet') || content.includes('coffee') || content.includes('date')) {
      indicators.push({ type: 'date_suggestion', strength: 0.6, evidence: 'meeting proposal' });
    }
    
    // Daily communication indicators
    if (relationshipData.messageCount > 0 && this.isConsistentCommunication(relationshipData)) {
      indicators.push({ type: 'daily_messages', strength: 0.5, evidence: 'consistent communication pattern' });
    }
    
    return indicators;
  }

  // Analyze date planning for milestone indicators
  analyzeDatePlanForMilestones(interactionData, relationshipData) {
    const indicators = [];
    
    // Meeting confirmation
    if (interactionData.status === 'confirmed') {
      indicators.push({ type: 'meeting_confirmation', strength: 0.8, evidence: 'date confirmed' });
    }
    
    // Date experience
    if (interactionData.feedback) {
      indicators.push({ type: 'date_experience', strength: 0.7, evidence: 'date completed with feedback' });
    }
    
    // Future planning
    if (interactionData.suggestedNextDate) {
      indicators.push({ type: 'future_plans', strength: 0.6, evidence: 'next date suggested' });
    }
    
    return indicators;
  }

  // Analyze photo sharing for milestone indicators
  analyzePhotoShareForMilestones(interactionData, relationshipData) {
    const indicators = [];
    
    // Personal photo sharing
    if (interactionData.photoType === 'personal') {
      indicators.push({ type: 'personal_sharing', strength: 0.5, evidence: 'personal photo shared' });
    }
    
    // Intimate photo sharing
    if (interactionData.photoType === 'intimate') {
      indicators.push({ type: 'physical_intimacy', strength: 0.6, evidence: 'intimate photo shared' });
    }
    
    // Social integration
    if (interactionData.photoType === 'social') {
      indicators.push({ type: 'social_integration', strength: 0.4, evidence: 'social photo shared' });
    }
    
    return indicators;
  }

  // Analyze call for milestone indicators
  analyzeCallForMilestones(interactionData, relationshipData) {
    const indicators = [];
    
    // Regular communication
    if (interactionData.duration > 600) { // 10+ minutes
      indicators.push({ type: 'routine_communication', strength: 0.6, evidence: 'extended call' });
    }
    
    // Emotional sharing
    if (interactionData.topicsDiscussed?.includes('personal')) {
      indicators.push({ type: 'emotional_sharing', strength: 0.7, evidence: 'personal topics discussed' });
    }
    
    return indicators;
  }

  // Analyze meeting for milestone indicators
  analyzeMeetingForMilestones(interactionData, relationshipData) {
    const indicators = [];
    
    // First date
    if (relationshipData.milestonesAchieved.size === 0) {
      indicators.push({ type: 'meeting_confirmation', strength: 0.9, evidence: 'first in-person meeting' });
    }
    
    // Physical presence
    indicators.push({ type: 'physical_presence', strength: 0.8, evidence: 'in-person interaction' });
    
    // Physical intimacy
    if (interactionData.physicalIntimacy) {
      indicators.push({ type: 'physical_touch', strength: 0.7, evidence: 'physical intimacy occurred' });
    }
    
    return indicators;
  }

  // Check for milestone achievements
  checkMilestoneAchievements(relationshipData, milestoneAnalysis) {
    const newMilestones = [];
    
    for (const [milestoneId, signals] of milestoneAnalysis.milestoneSignals) {
      // Skip if milestone already achieved
      if (relationshipData.milestonesAchieved.has(milestoneId)) continue;
      
      const milestone = this.milestoneDefinitions.get(milestoneId);
      if (!milestone) continue;
      
      // Calculate achievement score
      const achievementScore = this.calculateMilestoneAchievementScore(signals, milestone);
      
      // Check if milestone is achieved (threshold: 0.7)
      if (achievementScore >= 0.7) {
        const milestoneAchievement = {
          id: milestoneId,
          milestone: milestone,
          achievedAt: new Date().toISOString(),
          score: achievementScore,
          evidence: signals,
          significance: milestone.significance
        };
        
        relationshipData.milestonesAchieved.set(milestoneId, milestoneAchievement);
        newMilestones.push(milestoneAchievement);
      }
    }
    
    return newMilestones;
  }

  // Calculate milestone achievement score
  calculateMilestoneAchievementScore(signals, milestone) {
    if (signals.length === 0) return 0;
    
    // Calculate average signal strength
    const totalStrength = signals.reduce((sum, signal) => sum + signal.strength, 0);
    const averageStrength = totalStrength / signals.length;
    
    // Bonus for multiple indicators
    const indicatorBonus = Math.min(0.3, (signals.length - 1) * 0.1);
    
    // Bonus for milestone-specific indicators
    const specificIndicatorBonus = signals.some(signal => 
      milestone.indicators.includes(signal.type)
    ) ? 0.2 : 0;
    
    return Math.min(1, averageStrength + indicatorBonus + specificIndicatorBonus);
  }

  // Update relationship data
  updateRelationshipData(relationshipData, milestoneAnalysis, interactionData) {
    const updated = { ...relationshipData };
    
    // Update interaction history
    updated.interactionHistory.push({
      timestamp: new Date().toISOString(),
      type: interactionData.type,
      analysis: milestoneAnalysis,
      indicators: milestoneAnalysis.indicators
    });
    
    // Update message count
    if (interactionData.type === 'message') {
      updated.messageCount += 1;
    }
    
    // Update communication consistency
    this.updateCommunicationConsistency(updated);
    
    // Update last interaction
    updated.lastInteraction = new Date().toISOString();
    
    return updated;
  }

  // Update communication consistency tracking
  updateCommunicationConsistency(relationshipData) {
    const now = new Date();
    const dayKey = now.toISOString().split('T')[0];
    
    // Initialize daily messages if needed
    if (!relationshipData.dailyMessages) {
      relationshipData.dailyMessages = new Map();
    }
    
    // Update today's message count
    const currentCount = relationshipData.dailyMessages.get(dayKey) || 0;
    relationshipData.dailyMessages.set(dayKey, currentCount + 1);
    
    // Clean up old data (keep last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    for (const [date, count] of relationshipData.dailyMessages) {
      if (new Date(date) < thirtyDaysAgo) {
        relationshipData.dailyMessages.delete(date);
      }
    }
  }

  // Check if communication is consistent
  isConsistentCommunication(relationshipData) {
    if (!relationshipData.dailyMessages) return false;
    
    const last7Days = [];
    const now = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayKey = date.toISOString().split('T')[0];
      const count = relationshipData.dailyMessages.get(dayKey) || 0;
      last7Days.push(count);
    }
    
    // Check if there's communication on at least 5 of the last 7 days
    const daysWithCommunication = last7Days.filter(count => count > 0).length;
    return daysWithCommunication >= 5;
  }

  // Calculate overall progress score
  calculateProgressScore(relationshipData) {
    if (relationshipData.milestonesAchieved.size === 0) return 0;
    
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const [milestoneId, achievement] of relationshipData.milestonesAchieved) {
      const milestone = this.milestoneDefinitions.get(milestoneId);
      if (milestone) {
        totalScore += achievement.score * milestone.weight;
        totalWeight += milestone.weight;
      }
    }
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  // Determine relationship stage
  determineRelationshipStage(relationshipData) {
    const achievedMilestones = Array.from(relationshipData.milestonesAchieved.keys());
    
    // Committed relationship stage
    if (achievedMilestones.some(id => ['exclusivity', 'i_love_you', 'living_together'].includes(id))) {
      return 'committed_relationship';
    }
    
    // Developing relationship stage
    if (achievedMilestones.some(id => ['relationship_discussion', 'meeting_friends_family', 'future_planning'].includes(id))) {
      return 'developing_relationship';
    }
    
    // Early relationship stage
    if (achievedMilestones.some(id => ['first_date', 'consistent_communication', 'emotional_vulnerability'].includes(id))) {
      return 'early_relationship';
    }
    
    // Pre-relationship stage
    if (achievedMilestones.some(id => ['first_contact', 'mutual_interest', 'deeper_conversation'].includes(id))) {
      return 'pre_relationship';
    }
    
    return 'initial_contact';
  }

  // Generate progress recommendations
  generateProgressRecommendations(relationshipData) {
    const recommendations = [];
    const currentStage = relationshipData.relationshipStage;
    const achievedMilestones = Array.from(relationshipData.milestonesAchieved.keys());
    
    // Stage-specific recommendations
    switch (currentStage) {
      case 'initial_contact':
        recommendations.push({
          category: 'communication',
          priority: 'high',
          title: 'Build Initial Connection',
          description: 'Focus on engaging conversation and showing genuine interest',
          actions: ['Ask thoughtful questions', 'Share personal interests', 'Be responsive and engaging']
        });
        break;
        
      case 'pre_relationship':
        if (!achievedMilestones.includes('deeper_conversation')) {
          recommendations.push({
            category: 'emotional_connection',
            priority: 'high',
            title: 'Deepen Conversations',
            description: 'Move beyond surface-level topics to build emotional connection',
            actions: ['Share personal stories', 'Ask about feelings and experiences', 'Show vulnerability']
          });
        }
        
        if (!achievedMilestones.includes('meeting_suggestion')) {
          recommendations.push({
            category: 'meeting',
            priority: 'medium',
            title: 'Suggest Meeting',
            description: 'Consider suggesting an in-person meeting when comfortable',
            actions: ['Propose casual coffee date', 'Suggest activity-based meeting', 'Be flexible with timing']
          });
        }
        break;
        
      case 'early_relationship':
        if (!achievedMilestones.includes('consistent_communication')) {
          recommendations.push({
            category: 'communication',
            priority: 'high',
            title: 'Establish Communication Routine',
            description: 'Build consistent daily communication pattern',
            actions: ['Regular check-ins', 'Share daily experiences', 'Be reliable in responses']
          });
        }
        
        if (!achievedMilestones.includes('emotional_vulnerability')) {
          recommendations.push({
            category: 'intimacy',
            priority: 'medium',
            title: 'Share Deeper Emotions',
            description: 'Continue building emotional intimacy through vulnerability',
            actions: ['Share personal challenges', 'Express feelings openly', 'Create safe space for sharing']
          });
        }
        break;
        
      case 'developing_relationship':
        if (!achievedMilestones.includes('relationship_discussion')) {
          recommendations.push({
            category: 'commitment',
            priority: 'high',
            title: 'Discuss Relationship Status',
            description: 'Have open conversation about where the relationship is heading',
            actions: ['Express your feelings', 'Discuss expectations', 'Define relationship boundaries']
          });
        }
        
        if (!achievedMilestones.includes('meeting_friends_family')) {
          recommendations.push({
            category: 'social_integration',
            priority: 'medium',
            title: 'Introduce to Social Circle',
            description: 'Begin integrating into each other\'s social circles',
            actions: ['Introduce to close friends', 'Attend social events together', 'Meet family when appropriate']
          });
        }
        break;
        
      case 'committed_relationship':
        recommendations.push({
          category: 'relationship_growth',
          priority: 'medium',
          title: 'Continue Growing Together',
          description: 'Focus on deepening your committed relationship',
          actions: ['Plan future together', 'Work on shared goals', 'Maintain individual growth']
        });
        break;
    }
    
    return recommendations;
  }

  // Create empty relationship data structure
  createEmptyRelationshipData(userId1, userId2) {
    return {
      userId1,
      userId2,
      startDate: new Date().toISOString(),
      lastInteraction: new Date().toISOString(),
      relationshipStage: 'initial_contact',
      progressScore: 0,
      messageCount: 0,
      milestonesAchieved: new Map(),
      interactionHistory: [],
      dailyMessages: new Map(),
      metadata: {
        version: '1.0',
        trackingEngine: 'RelationshipMilestoneTracker'
      }
    };
  }

  // Helper methods
  getRelationshipKey(userId1, userId2) {
    return [userId1, userId2].sort().join('-');
  }

  // Get relationship data
  getRelationshipData(userId1, userId2) {
    const key = this.getRelationshipKey(userId1, userId2);
    return this.relationshipData.get(key);
  }

  // Get milestone progress
  getMilestoneProgress(userId1, userId2) {
    const relationshipData = this.getRelationshipData(userId1, userId2);
    if (!relationshipData) return null;
    
    const progress = {
      currentStage: relationshipData.relationshipStage,
      progressScore: relationshipData.progressScore,
      achievedMilestones: Array.from(relationshipData.milestonesAchieved.values()),
      nextMilestones: this.getNextMilestones(relationshipData),
      recommendations: this.generateProgressRecommendations(relationshipData)
    };
    
    return progress;
  }

  // Get next milestone suggestions
  getNextMilestones(relationshipData) {
    const currentStage = relationshipData.relationshipStage;
    const achievedMilestones = Array.from(relationshipData.milestonesAchieved.keys());
    const nextMilestones = [];
    
    // Get stage-appropriate milestones that haven't been achieved
    for (const [milestoneId, milestone] of this.milestoneDefinitions) {
      if (achievedMilestones.includes(milestoneId)) continue;
      
      // Check if milestone is appropriate for current stage
      if (this.isMilestoneAppropriate(milestone, currentStage, achievedMilestones)) {
        nextMilestones.push({
          id: milestoneId,
          milestone: milestone,
          priority: this.calculateMilestonePriority(milestone, relationshipData)
        });
      }
    }
    
    // Sort by priority
    nextMilestones.sort((a, b) => b.priority - a.priority);
    
    return nextMilestones.slice(0, 3); // Return top 3 next milestones
  }

  // Check if milestone is appropriate for current stage
  isMilestoneAppropriate(milestone, currentStage, achievedMilestones) {
    const stageHierarchy = {
      'initial_contact': ['pre_relationship'],
      'pre_relationship': ['pre_relationship', 'early_relationship'],
      'early_relationship': ['early_relationship', 'developing_relationship'],
      'developing_relationship': ['developing_relationship', 'committed_relationship'],
      'committed_relationship': ['committed_relationship']
    };
    
    const appropriateCategories = stageHierarchy[currentStage] || [];
    return appropriateCategories.includes(milestone.category);
  }

  // Calculate milestone priority
  calculateMilestonePriority(milestone, relationshipData) {
    let priority = milestone.weight;
    
    // Boost priority for stage-appropriate milestones
    if (milestone.category === relationshipData.relationshipStage) {
      priority *= 1.5;
    }
    
    // Boost priority based on communication consistency
    if (milestone.indicators.includes('routine_communication') && this.isConsistentCommunication(relationshipData)) {
      priority *= 1.3;
    }
    
    return priority;
  }

  // Save relationship data to storage
  async saveRelationshipData() {
    try {
      const data = {
        relationships: Array.from(this.relationshipData.entries()),
        savedAt: new Date().toISOString()
      };
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving relationship data:', error);
    }
  }

  // Load relationship data from storage
  async loadRelationshipData() {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.relationshipData = new Map(parsed.relationships);
        console.log('Loaded relationship data from storage');
      }
    } catch (error) {
      console.error('Error loading relationship data:', error);
    }
  }

  // Get tracker statistics
  getStats() {
    const stats = {
      initialized: this.initialized,
      trackedRelationships: this.relationshipData.size,
      totalMilestones: this.milestoneDefinitions.size,
      milestoneCategories: [...new Set(Array.from(this.milestoneDefinitions.values()).map(m => m.category))],
      averageProgress: this.calculateAverageProgress()
    };
    
    return stats;
  }

  calculateAverageProgress() {
    if (this.relationshipData.size === 0) return 0;
    
    const totalProgress = Array.from(this.relationshipData.values())
      .reduce((sum, data) => sum + data.progressScore, 0);
    
    return totalProgress / this.relationshipData.size;
  }
}

export default new RelationshipMilestoneTracker();