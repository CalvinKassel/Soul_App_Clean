// Personalized Growth Challenge System
// Revolutionary AI-powered personal development challenges for relationship growth

import PersonalityProfilingEngine from './PersonalityProfilingEngine';
import CompatibilityMatchingEngine from './CompatibilityMatchingEngine';
import RelationshipMilestoneTracker from './RelationshipMilestoneTracker';
import RelationshipSuccessPredictor from './RelationshipSuccessPredictor';
import AsyncStorage from '@react-native-async-storage/async-storage';

class PersonalizedGrowthChallengeSystem {
  constructor() {
    this.initialized = false;
    this.storageKey = 'growth_challenges';
    this.userChallenges = new Map();
    this.challengeTemplates = new Map();
    this.progressTracking = new Map();
    this.achievementHistory = new Map();
    
    // Challenge categories
    this.challengeCategories = {
      communication: {
        name: 'Communication Skills',
        description: 'Improve how you express yourself and listen to others',
        personality_focus: ['communication', 'emotional_intelligence'],
        difficulty_levels: ['beginner', 'intermediate', 'advanced'],
        expected_impact: 'high'
      },
      emotional_intelligence: {
        name: 'Emotional Intelligence',
        description: 'Develop better emotional awareness and regulation',
        personality_focus: ['emotional_intelligence', 'big_five'],
        difficulty_levels: ['beginner', 'intermediate', 'advanced'],
        expected_impact: 'high'
      },
      attachment_security: {
        name: 'Attachment Security',
        description: 'Build more secure attachment patterns',
        personality_focus: ['attachment'],
        difficulty_levels: ['beginner', 'intermediate', 'advanced'],
        expected_impact: 'very_high'
      },
      conflict_resolution: {
        name: 'Conflict Resolution',
        description: 'Learn to navigate disagreements constructively',
        personality_focus: ['communication', 'emotional_intelligence'],
        difficulty_levels: ['intermediate', 'advanced'],
        expected_impact: 'high'
      },
      intimacy_building: {
        name: 'Intimacy Building',
        description: 'Deepen emotional and physical connection',
        personality_focus: ['attachment', 'emotional_intelligence'],
        difficulty_levels: ['beginner', 'intermediate', 'advanced'],
        expected_impact: 'high'
      },
      self_awareness: {
        name: 'Self-Awareness',
        description: 'Understand your patterns and triggers better',
        personality_focus: ['big_five', 'emotional_intelligence'],
        difficulty_levels: ['beginner', 'intermediate', 'advanced'],
        expected_impact: 'medium'
      },
      relationship_skills: {
        name: 'Relationship Skills',
        description: 'Build practical relationship management skills',
        personality_focus: ['communication', 'values'],
        difficulty_levels: ['beginner', 'intermediate', 'advanced'],
        expected_impact: 'high'
      },
      personal_growth: {
        name: 'Personal Growth',
        description: 'Develop as an individual to improve relationships',
        personality_focus: ['big_five', 'values'],
        difficulty_levels: ['beginner', 'intermediate', 'advanced'],
        expected_impact: 'medium'
      }
    };

    // Initialize challenge templates
    this.initializeChallengeTemplates();
  }

  // Initialize the growth challenge system
  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize required services
      await PersonalityProfilingEngine.initialize();
      await CompatibilityMatchingEngine.initialize();
      await RelationshipMilestoneTracker.initialize();
      await RelationshipSuccessPredictor.initialize();
      
      // Load user challenges and progress
      await this.loadUserChallenges();
      await this.loadProgressTracking();
      
      this.initialized = true;
      console.log('Personalized Growth Challenge System initialized successfully');
    } catch (error) {
      console.error('Error initializing Personalized Growth Challenge System:', error);
      this.initialized = true; // Continue with limited functionality
    }
  }

  // Initialize challenge templates
  initializeChallengeTemplates() {
    // Communication challenges
    this.challengeTemplates.set('active_listening_beginner', {
      id: 'active_listening_beginner',
      category: 'communication',
      difficulty: 'beginner',
      title: 'Active Listening Foundation',
      description: 'Master the basics of truly hearing your partner',
      duration: 7, // days
      personality_requirements: { communication: { activeListening: 0.3 } },
      goals: [
        'Practice reflecting back what you hear',
        'Ask follow-up questions to show interest',
        'Put away distractions during conversations'
      ],
      daily_tasks: [
        'Have one conversation where you focus entirely on listening',
        'Use phrases like "What I hear you saying is..." at least once',
        'Ask "Tell me more about that" when appropriate'
      ],
      success_metrics: {
        engagement_increase: 0.2,
        conversation_quality: 0.3,
        partner_satisfaction: 0.25
      },
      rewards: {
        points: 100,
        badges: ['Good Listener'],
        unlocks: ['active_listening_intermediate']
      }
    });

    this.challengeTemplates.set('emotional_expression_beginner', {
      id: 'emotional_expression_beginner',
      category: 'emotional_intelligence',
      difficulty: 'beginner',
      title: 'Emotional Expression Basics',
      description: 'Learn to share your feelings more openly',
      duration: 5,
      personality_requirements: { communication: { emotionalExpression: 0.3 } },
      goals: [
        'Express one emotion clearly each day',
        'Use "I feel..." statements regularly',
        'Share the reason behind your emotions'
      ],
      daily_tasks: [
        'Tell your partner one thing you felt today and why',
        'Use emotion words instead of "good" or "bad"',
        'Practice expressing emotions as they arise'
      ],
      success_metrics: {
        emotional_connection: 0.3,
        intimacy_level: 0.2,
        communication_depth: 0.25
      },
      rewards: {
        points: 80,
        badges: ['Emotionally Open'],
        unlocks: ['emotional_expression_intermediate']
      }
    });

    this.challengeTemplates.set('vulnerability_intermediate', {
      id: 'vulnerability_intermediate',
      category: 'intimacy_building',
      difficulty: 'intermediate',
      title: 'Vulnerability Challenge',
      description: 'Share deeper parts of yourself to build intimacy',
      duration: 10,
      personality_requirements: { 
        attachment: { secure: 0.4 },
        emotional_intelligence: { selfAwareness: 0.5 }
      },
      goals: [
        'Share a personal fear or insecurity',
        'Talk about a childhood memory that shaped you',
        'Admit when you need support or help'
      ],
      daily_tasks: [
        'Share one thing you normally keep private',
        'Ask for emotional support when you need it',
        'Express gratitude for your partner\'s vulnerability'
      ],
      success_metrics: {
        intimacy_level: 0.4,
        trust_building: 0.3,
        emotional_connection: 0.35
      },
      rewards: {
        points: 150,
        badges: ['Brave Heart', 'Trust Builder'],
        unlocks: ['vulnerability_advanced']
      }
    });

    this.challengeTemplates.set('conflict_resolution_intermediate', {
      id: 'conflict_resolution_intermediate',
      category: 'conflict_resolution',
      difficulty: 'intermediate',
      title: 'Healthy Conflict Navigation',
      description: 'Turn disagreements into opportunities for growth',
      duration: 14,
      personality_requirements: { 
        communication: { conflictStyle: 0.5 },
        emotional_intelligence: { emotionalRegulation: 0.5 }
      },
      goals: [
        'Practice "I" statements during disagreements',
        'Find common ground in at least one conflict',
        'Use time-outs when emotions get too high'
      ],
      daily_tasks: [
        'Practice staying calm during one disagreement',
        'Look for your partner\'s underlying needs',
        'Apologize when you make mistakes'
      ],
      success_metrics: {
        conflict_resolution_skill: 0.4,
        relationship_satisfaction: 0.3,
        stress_reduction: 0.25
      },
      rewards: {
        points: 200,
        badges: ['Peacemaker', 'Conflict Navigator'],
        unlocks: ['conflict_resolution_advanced']
      }
    });

    this.challengeTemplates.set('attachment_security_beginner', {
      id: 'attachment_security_beginner',
      category: 'attachment_security',
      difficulty: 'beginner',
      title: 'Building Secure Attachment',
      description: 'Develop more secure patterns in relationships',
      duration: 21,
      personality_requirements: { attachment: { secure: 0.2 } },
      goals: [
        'Practice self-soothing when anxious',
        'Communicate needs clearly instead of expecting mind-reading',
        'Give your partner space without feeling abandoned'
      ],
      daily_tasks: [
        'Use breathing exercises when feeling insecure',
        'Ask for what you need directly',
        'Support your partner\'s independence'
      ],
      success_metrics: {
        attachment_security: 0.3,
        relationship_stability: 0.25,
        anxiety_reduction: 0.2
      },
      rewards: {
        points: 250,
        badges: ['Secure Base', 'Anxiety Warrior'],
        unlocks: ['attachment_security_intermediate']
      }
    });

    this.challengeTemplates.set('gratitude_appreciation_beginner', {
      id: 'gratitude_appreciation_beginner',
      category: 'relationship_skills',
      difficulty: 'beginner',
      title: 'Daily Appreciation Practice',
      description: 'Build a habit of expressing gratitude and appreciation',
      duration: 14,
      personality_requirements: {},
      goals: [
        'Express appreciation daily',
        'Notice and acknowledge small gestures',
        'Write appreciation notes or messages'
      ],
      daily_tasks: [
        'Tell your partner one specific thing you appreciate',
        'Thank them for something they did, however small',
        'Leave a note or text expressing gratitude'
      ],
      success_metrics: {
        relationship_satisfaction: 0.3,
        positive_communication: 0.35,
        emotional_connection: 0.2
      },
      rewards: {
        points: 120,
        badges: ['Grateful Heart', 'Appreciation Expert'],
        unlocks: ['gratitude_appreciation_intermediate']
      }
    });

    this.challengeTemplates.set('mindfulness_presence_beginner', {
      id: 'mindfulness_presence_beginner',
      category: 'self_awareness',
      difficulty: 'beginner',
      title: 'Mindful Presence Practice',
      description: 'Develop awareness of your thoughts and reactions',
      duration: 10,
      personality_requirements: { big_five: { neuroticism: 0.6 } },
      goals: [
        'Practice daily mindfulness meditation',
        'Notice your emotional triggers',
        'Pause before reacting in difficult moments'
      ],
      daily_tasks: [
        'Spend 5 minutes in mindful breathing',
        'Notice one emotional trigger and your response',
        'Practice the "pause" technique once'
      ],
      success_metrics: {
        emotional_regulation: 0.3,
        self_awareness: 0.4,
        stress_reduction: 0.25
      },
      rewards: {
        points: 90,
        badges: ['Mindful Soul', 'Present Moment'],
        unlocks: ['mindfulness_presence_intermediate']
      }
    });

    this.challengeTemplates.set('boundary_setting_intermediate', {
      id: 'boundary_setting_intermediate',
      category: 'personal_growth',
      difficulty: 'intermediate',
      title: 'Healthy Boundaries Challenge',
      description: 'Learn to set and maintain healthy relationship boundaries',
      duration: 14,
      personality_requirements: { 
        big_five: { agreeableness: 0.7 },
        values: { independence: 0.4 }
      },
      goals: [
        'Identify your personal boundaries',
        'Communicate boundaries clearly and kindly',
        'Respect your partner\'s boundaries'
      ],
      daily_tasks: [
        'Practice saying "no" to one request that crosses your boundaries',
        'Communicate one boundary need to your partner',
        'Ask about and respect one of their boundaries'
      ],
      success_metrics: {
        self_respect: 0.4,
        relationship_balance: 0.3,
        communication_clarity: 0.25
      },
      rewards: {
        points: 180,
        badges: ['Boundary Keeper', 'Self-Advocate'],
        unlocks: ['boundary_setting_advanced']
      }
    });

    this.challengeTemplates.set('quality_time_beginner', {
      id: 'quality_time_beginner',
      category: 'relationship_skills',
      difficulty: 'beginner',
      title: 'Quality Time Connection',
      description: 'Create meaningful shared experiences',
      duration: 7,
      personality_requirements: {},
      goals: [
        'Have device-free time together daily',
        'Try one new activity together',
        'Practice being fully present during conversations'
      ],
      daily_tasks: [
        'Spend 30 minutes without devices together',
        'Ask meaningful questions about their day',
        'Share one meaningful experience or memory'
      ],
      success_metrics: {
        relationship_satisfaction: 0.3,
        connection_depth: 0.35,
        intimacy_level: 0.2
      },
      rewards: {
        points: 100,
        badges: ['Quality Time Expert', 'Connection Creator'],
        unlocks: ['quality_time_intermediate']
      }
    });

    this.challengeTemplates.set('emotional_regulation_intermediate', {
      id: 'emotional_regulation_intermediate',
      category: 'emotional_intelligence',
      difficulty: 'intermediate',
      title: 'Emotional Regulation Mastery',
      description: 'Learn to manage intense emotions effectively',
      duration: 21,
      personality_requirements: { 
        big_five: { neuroticism: 0.6 },
        emotional_intelligence: { emotionalRegulation: 0.3 }
      },
      goals: [
        'Practice calming techniques when upset',
        'Identify emotion triggers before they escalate',
        'Communicate emotions without blame'
      ],
      daily_tasks: [
        'Use breathing techniques when feeling stressed',
        'Journal about one emotional trigger',
        'Express difficult emotions without attacking'
      ],
      success_metrics: {
        emotional_stability: 0.4,
        conflict_reduction: 0.3,
        relationship_harmony: 0.25
      },
      rewards: {
        points: 200,
        badges: ['Emotion Master', 'Calm Navigator'],
        unlocks: ['emotional_regulation_advanced']
      }
    });
  }

  // Generate personalized challenges for a user
  async generatePersonalizedChallenges(userId, partnerId = null, preferences = {}) {
    if (!this.initialized) await this.initialize();

    try {
      // Get user's personality profile
      const userProfile = PersonalityProfilingEngine.getUserProfile(userId);
      
      // Get compatibility data if partner provided
      let compatibility = null;
      if (partnerId) {
        compatibility = await CompatibilityMatchingEngine.calculateCompatibility(userId, partnerId);
      }

      // Get relationship data if available
      let relationshipData = null;
      if (partnerId) {
        relationshipData = RelationshipMilestoneTracker.getRelationshipData(userId, partnerId);
      }

      // Get success prediction if available
      let successPrediction = null;
      if (partnerId) {
        successPrediction = await RelationshipSuccessPredictor.generateSuccessPrediction(userId, partnerId);
      }

      // Analyze growth areas
      const growthAreas = this.analyzeGrowthAreas(userProfile, compatibility, relationshipData, successPrediction);

      // Generate personalized challenges
      const challenges = this.selectPersonalizedChallenges(growthAreas, userProfile, preferences);

      return {
        userId,
        partnerId,
        timestamp: new Date().toISOString(),
        growthAreas,
        recommendedChallenges: challenges,
        personalizationFactors: this.getPersonalizationFactors(userProfile, compatibility)
      };

    } catch (error) {
      console.error('Error generating personalized challenges:', error);
      return this.getDefaultChallenges(userId);
    }
  }

  // Analyze growth areas based on user data
  analyzeGrowthAreas(userProfile, compatibility, relationshipData, successPrediction) {
    const growthAreas = {
      communication: { priority: 0.5, specific_needs: [] },
      emotional_intelligence: { priority: 0.5, specific_needs: [] },
      attachment_security: { priority: 0.5, specific_needs: [] },
      conflict_resolution: { priority: 0.5, specific_needs: [] },
      intimacy_building: { priority: 0.5, specific_needs: [] },
      self_awareness: { priority: 0.5, specific_needs: [] },
      relationship_skills: { priority: 0.5, specific_needs: [] },
      personal_growth: { priority: 0.5, specific_needs: [] }
    };

    // Analyze from personality profile
    if (userProfile.dimensions) {
      // Communication analysis
      const comm = userProfile.dimensions.communication;
      if (comm && comm.activeListening < 0.5) {
        growthAreas.communication.priority += 0.3;
        growthAreas.communication.specific_needs.push('active_listening');
      }
      if (comm && comm.emotionalExpression < 0.5) {
        growthAreas.communication.priority += 0.2;
        growthAreas.communication.specific_needs.push('emotional_expression');
      }

      // Emotional intelligence analysis
      const ei = userProfile.dimensions.emotional_intelligence;
      if (ei && ei.emotionalRegulation < 0.5) {
        growthAreas.emotional_intelligence.priority += 0.3;
        growthAreas.emotional_intelligence.specific_needs.push('emotion_regulation');
      }
      if (ei && ei.empathy < 0.5) {
        growthAreas.emotional_intelligence.priority += 0.2;
        growthAreas.emotional_intelligence.specific_needs.push('empathy');
      }

      // Attachment analysis
      const attachment = userProfile.dimensions.attachment;
      if (attachment && attachment.secure < 0.5) {
        growthAreas.attachment_security.priority += 0.4;
        if (attachment.anxious > 0.6) {
          growthAreas.attachment_security.specific_needs.push('anxiety_management');
        }
        if (attachment.avoidant > 0.6) {
          growthAreas.attachment_security.specific_needs.push('intimacy_comfort');
        }
      }

      // Big Five analysis
      const bigFive = userProfile.dimensions.big_five;
      if (bigFive) {
        if (bigFive.neuroticism > 0.6) {
          growthAreas.emotional_intelligence.priority += 0.2;
          growthAreas.self_awareness.priority += 0.2;
          growthAreas.self_awareness.specific_needs.push('stress_management');
        }
        if (bigFive.agreeableness > 0.8) {
          growthAreas.personal_growth.priority += 0.2;
          growthAreas.personal_growth.specific_needs.push('boundary_setting');
        }
        if (bigFive.openness < 0.4) {
          growthAreas.personal_growth.priority += 0.15;
          growthAreas.personal_growth.specific_needs.push('openness_to_experience');
        }
      }
    }

    // Analyze from compatibility data
    if (compatibility) {
      if (compatibility.dimensions.communication.score < 0.6) {
        growthAreas.communication.priority += 0.3;
        growthAreas.conflict_resolution.priority += 0.2;
      }
      if (compatibility.dimensions.attachment.score < 0.6) {
        growthAreas.attachment_security.priority += 0.3;
        growthAreas.intimacy_building.priority += 0.2;
      }
    }

    // Analyze from success prediction
    if (successPrediction && successPrediction.riskFactors) {
      for (const risk of successPrediction.riskFactors) {
        switch (risk.category) {
          case 'communication':
            growthAreas.communication.priority += 0.4;
            growthAreas.conflict_resolution.priority += 0.3;
            break;
          case 'attachment':
            growthAreas.attachment_security.priority += 0.4;
            growthAreas.intimacy_building.priority += 0.2;
            break;
          case 'emotional_stability':
            growthAreas.emotional_intelligence.priority += 0.4;
            growthAreas.self_awareness.priority += 0.3;
            break;
        }
      }
    }

    // Normalize priorities
    for (const area of Object.values(growthAreas)) {
      area.priority = Math.min(1, area.priority);
    }

    return growthAreas;
  }

  // Select personalized challenges based on growth areas
  selectPersonalizedChallenges(growthAreas, userProfile, preferences) {
    const challenges = [];

    // Sort growth areas by priority
    const sortedAreas = Object.entries(growthAreas)
      .sort((a, b) => b[1].priority - a[1].priority)
      .slice(0, 5); // Top 5 areas

    // Select challenges for each priority area
    for (const [areaName, areaData] of sortedAreas) {
      const areaTemplates = this.getChallengeTemplatesForArea(areaName);
      const suitableTemplate = this.selectSuitableTemplate(areaTemplates, userProfile, preferences);
      
      if (suitableTemplate) {
        const personalizedChallenge = this.personalizeChallenge(suitableTemplate, areaData, userProfile);
        challenges.push(personalizedChallenge);
      }
    }

    // Ensure variety in difficulty levels
    return this.balanceDifficultyLevels(challenges);
  }

  // Get challenge templates for a specific area
  getChallengeTemplatesForArea(areaName) {
    const templates = [];
    
    for (const [templateId, template] of this.challengeTemplates) {
      if (template.category === areaName) {
        templates.push(template);
      }
    }
    
    return templates;
  }

  // Select suitable template based on user profile
  selectSuitableTemplate(templates, userProfile, preferences) {
    let bestTemplate = null;
    let bestScore = 0;

    for (const template of templates) {
      const score = this.calculateTemplateScore(template, userProfile, preferences);
      if (score > bestScore) {
        bestScore = score;
        bestTemplate = template;
      }
    }

    return bestTemplate;
  }

  // Calculate template suitability score
  calculateTemplateScore(template, userProfile, preferences) {
    let score = 0.5; // Base score

    // Check personality requirements
    if (template.personality_requirements) {
      const requirementsMet = this.checkPersonalityRequirements(
        template.personality_requirements, 
        userProfile
      );
      score += requirementsMet * 0.3;
    }

    // Check difficulty preference
    if (preferences.difficulty) {
      if (template.difficulty === preferences.difficulty) {
        score += 0.2;
      } else if (Math.abs(this.getDifficultyLevel(template.difficulty) - 
                          this.getDifficultyLevel(preferences.difficulty)) <= 1) {
        score += 0.1;
      }
    }

    // Check category preference
    if (preferences.categories && preferences.categories.includes(template.category)) {
      score += 0.2;
    }

    // Check duration preference
    if (preferences.duration) {
      const durationDiff = Math.abs(template.duration - preferences.duration);
      if (durationDiff <= 2) {
        score += 0.1;
      }
    }

    return Math.min(1, score);
  }

  // Check personality requirements
  checkPersonalityRequirements(requirements, userProfile) {
    let met = 0;
    let total = 0;

    for (const [dimension, criteria] of Object.entries(requirements)) {
      const userDimension = userProfile.dimensions[dimension];
      if (userDimension) {
        for (const [trait, requiredLevel] of Object.entries(criteria)) {
          total++;
          if (userDimension[trait] >= requiredLevel) {
            met++;
          } else {
            met += userDimension[trait] / requiredLevel; // Partial credit
          }
        }
      }
    }

    return total > 0 ? met / total : 1;
  }

  // Personalize challenge based on user data
  personalizeChallenge(template, areaData, userProfile) {
    const personalizedChallenge = {
      ...template,
      personalized: true,
      personalizedGoals: this.personalizeGoals(template.goals, areaData, userProfile),
      personalizedTasks: this.personalizeTasks(template.daily_tasks, areaData, userProfile),
      motivationalMessage: this.generateMotivationalMessage(template, userProfile),
      expectedBenefits: this.generateExpectedBenefits(template, areaData)
    };

    return personalizedChallenge;
  }

  // Personalize goals
  personalizeGoals(goals, areaData, userProfile) {
    const personalizedGoals = [...goals];

    // Add specific goals based on area needs
    for (const need of areaData.specific_needs) {
      switch (need) {
        case 'active_listening':
          personalizedGoals.push('Focus especially on listening without interrupting');
          break;
        case 'emotional_expression':
          personalizedGoals.push('Practice expressing emotions in real-time');
          break;
        case 'anxiety_management':
          personalizedGoals.push('Use self-soothing techniques when feeling anxious');
          break;
        case 'boundary_setting':
          personalizedGoals.push('Practice saying no to requests that overwhelm you');
          break;
      }
    }

    return personalizedGoals;
  }

  // Personalize tasks
  personalizeTasks(tasks, areaData, userProfile) {
    const personalizedTasks = [...tasks];

    // Add personality-specific tasks
    if (userProfile.dimensions.big_five?.neuroticism > 0.7) {
      personalizedTasks.push('Practice calming techniques when feeling overwhelmed');
    }

    if (userProfile.dimensions.big_five?.extraversion < 0.3) {
      personalizedTasks.push('Take breaks for solitude when needed');
    }

    return personalizedTasks;
  }

  // Generate motivational message
  generateMotivationalMessage(template, userProfile) {
    const messages = [
      `This ${template.title} challenge is designed specifically for your growth journey.`,
      `Based on your personality, this challenge will help you develop stronger relationships.`,
      `You have the potential to master these skills - let's take it one day at a time.`,
      `This challenge addresses an area that will significantly impact your relationship success.`
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Generate expected benefits
  generateExpectedBenefits(template, areaData) {
    const benefits = [
      `Improved ${template.category} skills`,
      `Better relationship satisfaction`,
      `Increased personal confidence`
    ];

    // Add specific benefits based on area needs
    for (const need of areaData.specific_needs) {
      switch (need) {
        case 'active_listening':
          benefits.push('Partner will feel more heard and understood');
          break;
        case 'emotional_expression':
          benefits.push('Deeper emotional connection with partner');
          break;
        case 'anxiety_management':
          benefits.push('Reduced relationship anxiety and stress');
          break;
      }
    }

    return benefits;
  }

  // Balance difficulty levels
  balanceDifficultyLevels(challenges) {
    const beginnerCount = challenges.filter(c => c.difficulty === 'beginner').length;
    const intermediateCount = challenges.filter(c => c.difficulty === 'intermediate').length;
    const advancedCount = challenges.filter(c => c.difficulty === 'advanced').length;

    // Ensure at least one beginner challenge
    if (beginnerCount === 0 && challenges.length > 0) {
      // Replace lowest priority intermediate/advanced with beginner
      const nonBeginnerIndex = challenges.findIndex(c => c.difficulty !== 'beginner');
      if (nonBeginnerIndex !== -1) {
        const beginnerAlternative = this.findBeginnerAlternative(challenges[nonBeginnerIndex]);
        if (beginnerAlternative) {
          challenges[nonBeginnerIndex] = beginnerAlternative;
        }
      }
    }

    return challenges.slice(0, 3); // Return top 3 challenges
  }

  // Find beginner alternative for a challenge
  findBeginnerAlternative(challenge) {
    const beginnerTemplates = Array.from(this.challengeTemplates.values())
      .filter(template => template.category === challenge.category && template.difficulty === 'beginner');

    return beginnerTemplates.length > 0 ? beginnerTemplates[0] : null;
  }

  // Start a challenge for a user
  async startChallenge(userId, challengeId, partnerId = null) {
    if (!this.initialized) await this.initialize();

    try {
      const template = this.challengeTemplates.get(challengeId);
      if (!template) {
        throw new Error('Challenge template not found');
      }

      const challengeInstance = {
        id: `${userId}-${challengeId}-${Date.now()}`,
        userId,
        partnerId,
        challengeId,
        template,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + template.duration * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        progress: {
          currentDay: 1,
          completedTasks: [],
          dailyProgress: {},
          overallProgress: 0
        },
        metrics: {
          startingValues: await this.captureStartingMetrics(userId, template, partnerId),
          currentValues: {},
          improvements: {}
        },
        achievements: [],
        notes: []
      };

      // Store challenge instance
      if (!this.userChallenges.has(userId)) {
        this.userChallenges.set(userId, []);
      }
      this.userChallenges.get(userId).push(challengeInstance);

      // Initialize progress tracking
      this.initializeProgressTracking(challengeInstance);

      await this.saveUserChallenges();

      return challengeInstance;

    } catch (error) {
      console.error('Error starting challenge:', error);
      return null;
    }
  }

  // Capture starting metrics
  async captureStartingMetrics(userId, template, partnerId) {
    const metrics = {};

    // Capture personality-related metrics
    const userProfile = PersonalityProfilingEngine.getUserProfile(userId);
    if (userProfile.dimensions) {
      metrics.personality = {
        communication: userProfile.dimensions.communication || {},
        emotional_intelligence: userProfile.dimensions.emotional_intelligence || {},
        attachment: userProfile.dimensions.attachment || {},
        big_five: userProfile.dimensions.big_five || {}
      };
    }

    // Capture relationship metrics if partner provided
    if (partnerId) {
      const compatibility = await CompatibilityMatchingEngine.calculateCompatibility(userId, partnerId);
      metrics.relationship = {
        compatibility_score: compatibility.overall,
        communication_score: compatibility.dimensions.communication?.score || 0.5,
        attachment_score: compatibility.dimensions.attachment?.score || 0.5
      };
    }

    metrics.timestamp = new Date().toISOString();
    return metrics;
  }

  // Initialize progress tracking
  initializeProgressTracking(challengeInstance) {
    const trackingData = {
      challengeId: challengeInstance.id,
      userId: challengeInstance.userId,
      startDate: challengeInstance.startDate,
      dailyTracking: {},
      milestones: [],
      streaks: {
        current: 0,
        longest: 0
      }
    };

    this.progressTracking.set(challengeInstance.id, trackingData);
  }

  // Update daily progress
  async updateDailyProgress(challengeId, taskCompletions, notes = '') {
    const challenge = this.findChallengeById(challengeId);
    if (!challenge) return null;

    const today = new Date().toISOString().split('T')[0];
    const dayNumber = Math.floor((Date.now() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Update progress
    challenge.progress.currentDay = dayNumber;
    challenge.progress.dailyProgress[today] = {
      taskCompletions,
      notes,
      completionRate: taskCompletions.length / challenge.template.daily_tasks.length,
      timestamp: new Date().toISOString()
    };

    // Calculate overall progress
    const totalDays = Object.keys(challenge.progress.dailyProgress).length;
    const totalCompletionRate = Object.values(challenge.progress.dailyProgress)
      .reduce((sum, day) => sum + day.completionRate, 0) / totalDays;
    
    challenge.progress.overallProgress = totalCompletionRate;

    // Update streak tracking
    this.updateStreakTracking(challengeId, taskCompletions.length > 0);

    // Check for achievements
    const newAchievements = this.checkAchievements(challenge);
    challenge.achievements.push(...newAchievements);

    // Add notes
    if (notes) {
      challenge.notes.push({
        date: today,
        note: notes,
        timestamp: new Date().toISOString()
      });
    }

    await this.saveUserChallenges();
    return challenge;
  }

  // Update streak tracking
  updateStreakTracking(challengeId, completedToday) {
    const tracking = this.progressTracking.get(challengeId);
    if (!tracking) return;

    if (completedToday) {
      tracking.streaks.current++;
      tracking.streaks.longest = Math.max(tracking.streaks.longest, tracking.streaks.current);
    } else {
      tracking.streaks.current = 0;
    }
  }

  // Check achievements
  checkAchievements(challenge) {
    const achievements = [];
    const progress = challenge.progress;

    // First day completion
    if (Object.keys(progress.dailyProgress).length === 1) {
      achievements.push({
        id: 'first_day',
        name: 'First Step',
        description: 'Completed your first day of the challenge',
        timestamp: new Date().toISOString(),
        points: 10
      });
    }

    // Streak achievements
    const tracking = this.progressTracking.get(challenge.id);
    if (tracking) {
      if (tracking.streaks.current === 3) {
        achievements.push({
          id: 'streak_3',
          name: '3-Day Streak',
          description: 'Completed 3 days in a row',
          timestamp: new Date().toISOString(),
          points: 30
        });
      } else if (tracking.streaks.current === 7) {
        achievements.push({
          id: 'streak_7',
          name: 'Week Warrior',
          description: 'Completed 7 days in a row',
          timestamp: new Date().toISOString(),
          points: 70
        });
      }
    }

    // Progress milestones
    if (progress.overallProgress >= 0.5 && !challenge.achievements.find(a => a.id === 'halfway')) {
      achievements.push({
        id: 'halfway',
        name: 'Halfway Hero',
        description: 'Reached 50% completion',
        timestamp: new Date().toISOString(),
        points: 50
      });
    }

    if (progress.overallProgress >= 0.8 && !challenge.achievements.find(a => a.id === 'almost_there')) {
      achievements.push({
        id: 'almost_there',
        name: 'Almost There',
        description: 'Reached 80% completion',
        timestamp: new Date().toISOString(),
        points: 80
      });
    }

    return achievements;
  }

  // Complete challenge
  async completeChallenge(challengeId) {
    const challenge = this.findChallengeById(challengeId);
    if (!challenge) return null;

    challenge.status = 'completed';
    challenge.completedDate = new Date().toISOString();

    // Calculate final metrics
    const finalMetrics = await this.captureStartingMetrics(
      challenge.userId, 
      challenge.template, 
      challenge.partnerId
    );

    challenge.metrics.currentValues = finalMetrics;
    challenge.metrics.improvements = this.calculateImprovements(
      challenge.metrics.startingValues,
      challenge.metrics.currentValues
    );

    // Award completion rewards
    const completionAchievement = {
      id: 'challenge_complete',
      name: 'Challenge Champion',
      description: `Completed ${challenge.template.title}`,
      timestamp: new Date().toISOString(),
      points: challenge.template.rewards.points
    };

    challenge.achievements.push(completionAchievement);

    // Store in achievement history
    if (!this.achievementHistory.has(challenge.userId)) {
      this.achievementHistory.set(challenge.userId, []);
    }
    this.achievementHistory.get(challenge.userId).push(challenge);

    await this.saveUserChallenges();
    return challenge;
  }

  // Calculate improvements
  calculateImprovements(startingValues, currentValues) {
    const improvements = {};

    if (startingValues.personality && currentValues.personality) {
      improvements.personality = {};
      
      for (const [dimension, startData] of Object.entries(startingValues.personality)) {
        const currentData = currentValues.personality[dimension];
        if (currentData) {
          improvements.personality[dimension] = {};
          
          for (const [trait, startValue] of Object.entries(startData)) {
            const currentValue = currentData[trait];
            if (typeof startValue === 'number' && typeof currentValue === 'number') {
              improvements.personality[dimension][trait] = currentValue - startValue;
            }
          }
        }
      }
    }

    if (startingValues.relationship && currentValues.relationship) {
      improvements.relationship = {};
      
      for (const [metric, startValue] of Object.entries(startingValues.relationship)) {
        const currentValue = currentValues.relationship[metric];
        if (typeof startValue === 'number' && typeof currentValue === 'number') {
          improvements.relationship[metric] = currentValue - startValue;
        }
      }
    }

    return improvements;
  }

  // Helper methods
  findChallengeById(challengeId) {
    for (const userChallenges of this.userChallenges.values()) {
      const challenge = userChallenges.find(c => c.id === challengeId);
      if (challenge) return challenge;
    }
    return null;
  }

  getDifficultyLevel(difficulty) {
    const levels = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
    return levels[difficulty] || 1;
  }

  getPersonalizationFactors(userProfile, compatibility) {
    const factors = {
      personality_traits: {},
      relationship_factors: {},
      growth_priorities: []
    };

    // Extract personality traits
    if (userProfile.dimensions) {
      factors.personality_traits = {
        communication_style: userProfile.dimensions.communication || {},
        emotional_patterns: userProfile.dimensions.emotional_intelligence || {},
        attachment_style: userProfile.dimensions.attachment || {},
        big_five_traits: userProfile.dimensions.big_five || {}
      };
    }

    // Extract relationship factors
    if (compatibility) {
      factors.relationship_factors = {
        compatibility_score: compatibility.overall,
        communication_compatibility: compatibility.dimensions.communication?.score || 0.5,
        attachment_compatibility: compatibility.dimensions.attachment?.score || 0.5,
        values_alignment: compatibility.dimensions.values?.score || 0.5
      };
    }

    return factors;
  }

  getDefaultChallenges(userId) {
    return {
      userId,
      timestamp: new Date().toISOString(),
      growthAreas: {
        communication: { priority: 0.6, specific_needs: ['active_listening'] },
        emotional_intelligence: { priority: 0.5, specific_needs: ['emotional_expression'] },
        relationship_skills: { priority: 0.4, specific_needs: ['appreciation'] }
      },
      recommendedChallenges: [
        this.challengeTemplates.get('active_listening_beginner'),
        this.challengeTemplates.get('emotional_expression_beginner'),
        this.challengeTemplates.get('gratitude_appreciation_beginner')
      ],
      personalizationFactors: {},
      error: 'Limited data available - using default challenges'
    };
  }

  // Get user's challenge history
  getUserChallenges(userId) {
    return this.userChallenges.get(userId) || [];
  }

  // Get user's achievements
  getUserAchievements(userId) {
    return this.achievementHistory.get(userId) || [];
  }

  // Save user challenges
  async saveUserChallenges() {
    try {
      const data = {
        userChallenges: Array.from(this.userChallenges.entries()),
        progressTracking: Array.from(this.progressTracking.entries()),
        achievementHistory: Array.from(this.achievementHistory.entries()),
        savedAt: new Date().toISOString()
      };
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving user challenges:', error);
    }
  }

  // Load user challenges
  async loadUserChallenges() {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.userChallenges = new Map(parsed.userChallenges);
        this.progressTracking = new Map(parsed.progressTracking);
        this.achievementHistory = new Map(parsed.achievementHistory);
        console.log('Loaded user challenges from storage');
      }
    } catch (error) {
      console.error('Error loading user challenges:', error);
    }
  }

  // Load progress tracking
  async loadProgressTracking() {
    // Progress tracking is loaded with user challenges
  }

  // Get system statistics
  getStats() {
    return {
      initialized: this.initialized,
      totalChallengeTemplates: this.challengeTemplates.size,
      activeUsers: this.userChallenges.size,
      totalCompletedChallenges: Array.from(this.achievementHistory.values()).length,
      challengeCategories: Object.keys(this.challengeCategories).length,
      averageCompletionRate: this.calculateAverageCompletionRate()
    };
  }

  calculateAverageCompletionRate() {
    let totalChallenges = 0;
    let completedChallenges = 0;

    for (const userChallenges of this.userChallenges.values()) {
      totalChallenges += userChallenges.length;
      completedChallenges += userChallenges.filter(c => c.status === 'completed').length;
    }

    return totalChallenges > 0 ? completedChallenges / totalChallenges : 0;
  }
}

export default new PersonalizedGrowthChallengeSystem();