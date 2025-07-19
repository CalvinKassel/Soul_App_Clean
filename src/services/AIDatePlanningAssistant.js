// AI-Powered Date Planning Assistant
// Revolutionary personalized date planning based on personality, compatibility, and relationship stage

import PersonalityProfilingEngine from './PersonalityProfilingEngine';
import CompatibilityMatchingEngine from './CompatibilityMatchingEngine';
import RelationshipMilestoneTracker from './RelationshipMilestoneTracker';
import RAGService from './RAGService';

class AIDatePlanningAssistant {
  constructor() {
    this.initialized = false;
    this.datePlanCache = new Map();
    this.cacheTimeout = 2 * 60 * 60 * 1000; // 2 hours
    this.dateCategories = new Map();
    this.activityDatabase = new Map();
    
    // Initialize date categories and activities
    this.initializeDateCategories();
    this.initializeActivityDatabase();
  }

  // Initialize the date planning assistant
  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize required services
      await PersonalityProfilingEngine.initialize();
      await CompatibilityMatchingEngine.initialize();
      await RelationshipMilestoneTracker.initialize();
      await RAGService.initialize();
      
      this.initialized = true;
      console.log('AI Date Planning Assistant initialized successfully');
    } catch (error) {
      console.error('Error initializing AI Date Planning Assistant:', error);
      this.initialized = true; // Continue with limited functionality
    }
  }

  // Initialize date categories with personality mappings
  initializeDateCategories() {
    this.dateCategories.set('adventure', {
      name: 'Adventure & Exploration',
      personalityFit: {
        big_five: { openness: 0.7, extraversion: 0.6 },
        values: { adventure: 0.8, independence: 0.6 }
      },
      relationshipStages: ['early_relationship', 'developing_relationship', 'committed_relationship'],
      energy_level: 'high',
      intimacy_level: 'medium',
      cost_range: 'medium_high',
      weather_dependent: true
    });

    this.dateCategories.set('cultural', {
      name: 'Cultural & Intellectual',
      personalityFit: {
        big_five: { openness: 0.8, conscientiousness: 0.6 },
        values: { creativity: 0.7, independence: 0.5 }
      },
      relationshipStages: ['pre_relationship', 'early_relationship', 'developing_relationship'],
      energy_level: 'medium',
      intimacy_level: 'medium',
      cost_range: 'medium',
      weather_dependent: false
    });

    this.dateCategories.set('intimate', {
      name: 'Intimate & Cozy',
      personalityFit: {
        big_five: { agreeableness: 0.7, neuroticism: -0.3 },
        values: { security: 0.7, family: 0.6 }
      },
      relationshipStages: ['developing_relationship', 'committed_relationship'],
      energy_level: 'low',
      intimacy_level: 'high',
      cost_range: 'low_medium',
      weather_dependent: false
    });

    this.dateCategories.set('social', {
      name: 'Social & Fun',
      personalityFit: {
        big_five: { extraversion: 0.8, agreeableness: 0.6 },
        values: { helping: 0.6, independence: 0.4 }
      },
      relationshipStages: ['early_relationship', 'developing_relationship'],
      energy_level: 'high',
      intimacy_level: 'low',
      cost_range: 'medium',
      weather_dependent: false
    });

    this.dateCategories.set('active', {
      name: 'Active & Sporty',
      personalityFit: {
        big_five: { extraversion: 0.6, conscientiousness: 0.7 },
        values: { adventure: 0.6, independence: 0.8 }
      },
      relationshipStages: ['early_relationship', 'developing_relationship', 'committed_relationship'],
      energy_level: 'high',
      intimacy_level: 'medium',
      cost_range: 'medium',
      weather_dependent: true
    });

    this.dateCategories.set('relaxed', {
      name: 'Relaxed & Casual',
      personalityFit: {
        big_five: { neuroticism: 0.4, agreeableness: 0.6 },
        values: { security: 0.6, family: 0.5 }
      },
      relationshipStages: ['pre_relationship', 'early_relationship'],
      energy_level: 'low',
      intimacy_level: 'low',
      cost_range: 'low',
      weather_dependent: false
    });

    this.dateCategories.set('creative', {
      name: 'Creative & Artistic',
      personalityFit: {
        big_five: { openness: 0.9, conscientiousness: 0.5 },
        values: { creativity: 0.9, independence: 0.6 }
      },
      relationshipStages: ['early_relationship', 'developing_relationship'],
      energy_level: 'medium',
      intimacy_level: 'medium',
      cost_range: 'medium',
      weather_dependent: false
    });

    this.dateCategories.set('romantic', {
      name: 'Romantic & Traditional',
      personalityFit: {
        big_five: { agreeableness: 0.8, conscientiousness: 0.6 },
        values: { family: 0.7, security: 0.6 }
      },
      relationshipStages: ['developing_relationship', 'committed_relationship'],
      energy_level: 'medium',
      intimacy_level: 'high',
      cost_range: 'medium_high',
      weather_dependent: false
    });
  }

  // Initialize activity database
  initializeActivityDatabase() {
    // Adventure activities
    this.activityDatabase.set('hiking', {
      category: 'adventure',
      name: 'Nature Hiking',
      description: 'Explore scenic trails and connect with nature',
      duration: '2-4 hours',
      cost: 'free',
      location_type: 'outdoor',
      season: ['spring', 'summer', 'fall'],
      conversation_opportunities: 'high',
      physical_activity: 'high',
      personality_requirements: { big_five: { openness: 0.6, extraversion: 0.5 } }
    });

    this.activityDatabase.set('rock_climbing', {
      category: 'adventure',
      name: 'Rock Climbing',
      description: 'Challenge yourselves with indoor or outdoor climbing',
      duration: '2-3 hours',
      cost: 'medium',
      location_type: 'indoor_outdoor',
      season: ['all'],
      conversation_opportunities: 'medium',
      physical_activity: 'very_high',
      personality_requirements: { big_five: { openness: 0.7, extraversion: 0.6 } }
    });

    // Cultural activities
    this.activityDatabase.set('museum_visit', {
      category: 'cultural',
      name: 'Museum Visit',
      description: 'Explore art, history, or science exhibitions together',
      duration: '2-3 hours',
      cost: 'low_medium',
      location_type: 'indoor',
      season: ['all'],
      conversation_opportunities: 'very_high',
      physical_activity: 'low',
      personality_requirements: { big_five: { openness: 0.8, conscientiousness: 0.6 } }
    });

    this.activityDatabase.set('art_gallery', {
      category: 'cultural',
      name: 'Art Gallery Opening',
      description: 'Attend a gallery opening or exhibition',
      duration: '1-2 hours',
      cost: 'free_low',
      location_type: 'indoor',
      season: ['all'],
      conversation_opportunities: 'high',
      physical_activity: 'low',
      personality_requirements: { big_five: { openness: 0.9, agreeableness: 0.6 } }
    });

    // Intimate activities
    this.activityDatabase.set('cooking_together', {
      category: 'intimate',
      name: 'Cooking Together',
      description: 'Prepare a meal together at home',
      duration: '2-3 hours',
      cost: 'medium',
      location_type: 'indoor',
      season: ['all'],
      conversation_opportunities: 'very_high',
      physical_activity: 'low',
      personality_requirements: { big_five: { agreeableness: 0.7, conscientiousness: 0.6 } }
    });

    this.activityDatabase.set('movie_night', {
      category: 'intimate',
      name: 'Cozy Movie Night',
      description: 'Watch movies together with snacks and blankets',
      duration: '3-4 hours',
      cost: 'low',
      location_type: 'indoor',
      season: ['all'],
      conversation_opportunities: 'medium',
      physical_activity: 'very_low',
      personality_requirements: { big_five: { agreeableness: 0.6, neuroticism: 0.4 } }
    });

    // Social activities
    this.activityDatabase.set('trivia_night', {
      category: 'social',
      name: 'Trivia Night',
      description: 'Test your knowledge at a local trivia night',
      duration: '2-3 hours',
      cost: 'medium',
      location_type: 'indoor',
      season: ['all'],
      conversation_opportunities: 'high',
      physical_activity: 'low',
      personality_requirements: { big_five: { extraversion: 0.7, openness: 0.6 } }
    });

    this.activityDatabase.set('game_night', {
      category: 'social',
      name: 'Board Game Café',
      description: 'Play games at a board game café or bar',
      duration: '2-4 hours',
      cost: 'medium',
      location_type: 'indoor',
      season: ['all'],
      conversation_opportunities: 'high',
      physical_activity: 'low',
      personality_requirements: { big_five: { extraversion: 0.6, agreeableness: 0.7 } }
    });

    // Active activities
    this.activityDatabase.set('mini_golf', {
      category: 'active',
      name: 'Mini Golf',
      description: 'Fun and competitive mini golf game',
      duration: '1-2 hours',
      cost: 'low',
      location_type: 'indoor_outdoor',
      season: ['all'],
      conversation_opportunities: 'high',
      physical_activity: 'medium',
      personality_requirements: { big_five: { extraversion: 0.5, agreeableness: 0.6 } }
    });

    this.activityDatabase.set('dancing', {
      category: 'active',
      name: 'Dancing Class',
      description: 'Learn to dance together or go social dancing',
      duration: '1-2 hours',
      cost: 'medium',
      location_type: 'indoor',
      season: ['all'],
      conversation_opportunities: 'medium',
      physical_activity: 'high',
      personality_requirements: { big_five: { extraversion: 0.8, openness: 0.7 } }
    });

    // Relaxed activities
    this.activityDatabase.set('coffee_date', {
      category: 'relaxed',
      name: 'Coffee Shop Date',
      description: 'Casual conversation over coffee',
      duration: '1-2 hours',
      cost: 'low',
      location_type: 'indoor',
      season: ['all'],
      conversation_opportunities: 'very_high',
      physical_activity: 'very_low',
      personality_requirements: { big_five: { agreeableness: 0.6, neuroticism: 0.4 } }
    });

    this.activityDatabase.set('park_walk', {
      category: 'relaxed',
      name: 'Park Walk',
      description: 'Leisurely walk in a beautiful park',
      duration: '1-2 hours',
      cost: 'free',
      location_type: 'outdoor',
      season: ['spring', 'summer', 'fall'],
      conversation_opportunities: 'high',
      physical_activity: 'low',
      personality_requirements: { big_five: { openness: 0.5, agreeableness: 0.6 } }
    });

    // Creative activities
    this.activityDatabase.set('pottery_class', {
      category: 'creative',
      name: 'Pottery Class',
      description: 'Create something together with clay',
      duration: '2-3 hours',
      cost: 'medium',
      location_type: 'indoor',
      season: ['all'],
      conversation_opportunities: 'high',
      physical_activity: 'medium',
      personality_requirements: { big_five: { openness: 0.8, conscientiousness: 0.6 } }
    });

    this.activityDatabase.set('paint_night', {
      category: 'creative',
      name: 'Paint Night',
      description: 'Paint together at a paint-and-sip studio',
      duration: '2-3 hours',
      cost: 'medium',
      location_type: 'indoor',
      season: ['all'],
      conversation_opportunities: 'high',
      physical_activity: 'low',
      personality_requirements: { big_five: { openness: 0.9, agreeableness: 0.6 } }
    });

    // Romantic activities
    this.activityDatabase.set('romantic_dinner', {
      category: 'romantic',
      name: 'Romantic Dinner',
      description: 'Intimate dinner at a nice restaurant',
      duration: '2-3 hours',
      cost: 'high',
      location_type: 'indoor',
      season: ['all'],
      conversation_opportunities: 'very_high',
      physical_activity: 'very_low',
      personality_requirements: { big_five: { agreeableness: 0.7, conscientiousness: 0.6 } }
    });

    this.activityDatabase.set('sunset_picnic', {
      category: 'romantic',
      name: 'Sunset Picnic',
      description: 'Romantic picnic watching the sunset',
      duration: '2-3 hours',
      cost: 'low',
      location_type: 'outdoor',
      season: ['spring', 'summer', 'fall'],
      conversation_opportunities: 'very_high',
      physical_activity: 'low',
      personality_requirements: { big_five: { openness: 0.6, agreeableness: 0.8 } }
    });
  }

  // Generate personalized date plan
  async generateDatePlan(userId1, userId2, preferences = {}) {
    if (!this.initialized) await this.initialize();

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(userId1, userId2, preferences);
      const cached = this.datePlanCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.plan;
      }

      // Get personality profiles
      const profile1 = PersonalityProfilingEngine.getUserProfile(userId1);
      const profile2 = PersonalityProfilingEngine.getUserProfile(userId2);

      // Get compatibility analysis
      const compatibility = await CompatibilityMatchingEngine.calculateCompatibility(userId1, userId2);

      // Get relationship milestone data
      const relationshipData = RelationshipMilestoneTracker.getRelationshipData(userId1, userId2);

      // Generate comprehensive date plan
      const datePlan = await this.createPersonalizedDatePlan(
        profile1,
        profile2,
        compatibility,
        relationshipData,
        preferences
      );

      // Cache the result
      this.datePlanCache.set(cacheKey, {
        plan: datePlan,
        timestamp: Date.now()
      });

      return datePlan;

    } catch (error) {
      console.error('Error generating date plan:', error);
      return this.getDefaultDatePlan(preferences);
    }
  }

  // Create personalized date plan
  async createPersonalizedDatePlan(profile1, profile2, compatibility, relationshipData, preferences) {
    const plan = {
      timestamp: new Date().toISOString(),
      relationshipStage: relationshipData?.relationshipStage || 'pre_relationship',
      compatibilityScore: compatibility.overall,
      personalityFit: this.calculatePersonalityFit(profile1, profile2),
      recommendations: [],
      alternatives: [],
      tips: [],
      logistics: {}
    };

    // Analyze optimal date categories
    const optimalCategories = this.analyzeOptimalDateCategories(
      profile1,
      profile2,
      compatibility,
      relationshipData
    );

    // Generate primary recommendations
    plan.recommendations = await this.generateDateRecommendations(
      optimalCategories,
      profile1,
      profile2,
      preferences,
      3 // Number of recommendations
    );

    // Generate alternative options
    plan.alternatives = await this.generateDateRecommendations(
      optimalCategories,
      profile1,
      profile2,
      preferences,
      2,
      true // Alternative options
    );

    // Generate personalized tips
    plan.tips = this.generateDateTips(profile1, profile2, compatibility, relationshipData);

    // Generate logistics suggestions
    plan.logistics = this.generateLogisticsSuggestions(
      profile1,
      profile2,
      plan.recommendations[0], // Based on top recommendation
      preferences
    );

    return plan;
  }

  // Analyze optimal date categories based on personality and compatibility
  analyzeOptimalDateCategories(profile1, profile2, compatibility, relationshipData) {
    const categoryScores = new Map();

    // Analyze each date category
    for (const [categoryId, category] of this.dateCategories) {
      let score = 0;

      // Personality fit scoring
      if (category.personalityFit.big_five) {
        score += this.calculateBigFiveFit(profile1, profile2, category.personalityFit.big_five);
      }

      if (category.personalityFit.values) {
        score += this.calculateValuesFit(profile1, profile2, category.personalityFit.values);
      }

      // Relationship stage appropriateness
      const currentStage = relationshipData?.relationshipStage || 'pre_relationship';
      if (category.relationshipStages.includes(currentStage)) {
        score += 0.3;
      }

      // Compatibility considerations
      if (compatibility.dimensions.communication.score > 0.7 && category.intimacy_level === 'high') {
        score += 0.2;
      }

      if (compatibility.dimensions.personality.score > 0.8 && category.energy_level === 'high') {
        score += 0.15;
      }

      categoryScores.set(categoryId, { category, score });
    }

    // Sort by score and return top categories
    return Array.from(categoryScores.entries())
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, 4) // Top 4 categories
      .map(([id, data]) => ({ id, ...data }));
  }

  // Calculate Big Five personality fit
  calculateBigFiveFit(profile1, profile2, targetTraits) {
    let fit = 0;
    let count = 0;

    const bigFive1 = profile1.dimensions.big_five || {};
    const bigFive2 = profile2.dimensions.big_five || {};

    for (const [trait, targetValue] of Object.entries(targetTraits)) {
      if (bigFive1[trait] !== undefined && bigFive2[trait] !== undefined) {
        const avgValue = (bigFive1[trait] + bigFive2[trait]) / 2;
        
        if (targetValue > 0) {
          fit += Math.min(avgValue / targetValue, 1);
        } else {
          fit += Math.max(0, 1 + (avgValue / Math.abs(targetValue)));
        }
        count++;
      }
    }

    return count > 0 ? (fit / count) * 0.4 : 0;
  }

  // Calculate values fit
  calculateValuesFit(profile1, profile2, targetValues) {
    let fit = 0;
    let count = 0;

    const values1 = profile1.dimensions.values || {};
    const values2 = profile2.dimensions.values || {};

    for (const [value, targetLevel] of Object.entries(targetValues)) {
      if (values1[value] !== undefined && values2[value] !== undefined) {
        const avgValue = (values1[value] + values2[value]) / 2;
        fit += Math.min(avgValue / targetLevel, 1);
        count++;
      }
    }

    return count > 0 ? (fit / count) * 0.3 : 0;
  }

  // Generate date recommendations
  async generateDateRecommendations(optimalCategories, profile1, profile2, preferences, count, isAlternative = false) {
    const recommendations = [];

    for (const categoryData of optimalCategories) {
      if (recommendations.length >= count) break;

      // Get activities for this category
      const activities = this.getActivitiesForCategory(categoryData.id, preferences);

      for (const activity of activities) {
        if (recommendations.length >= count) break;

        // Score activity based on personality fit
        const activityScore = this.scoreActivity(activity, profile1, profile2, preferences);

        if (activityScore > 0.6) {
          const recommendation = {
            id: activity.id,
            activity: activity,
            category: categoryData.category,
            score: activityScore,
            personalizedReason: this.generatePersonalizedReason(activity, profile1, profile2),
            tips: this.generateActivityTips(activity, profile1, profile2),
            logistics: this.generateActivityLogistics(activity, preferences)
          };

          recommendations.push(recommendation);
        }
      }
    }

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  // Get activities for a specific category
  getActivitiesForCategory(categoryId, preferences) {
    const activities = [];

    for (const [activityId, activity] of this.activityDatabase) {
      if (activity.category === categoryId) {
        // Apply preference filters
        if (preferences.budget && !this.matchesBudget(activity, preferences.budget)) {
          continue;
        }

        if (preferences.weather && !this.matchesWeather(activity, preferences.weather)) {
          continue;
        }

        if (preferences.location && !this.matchesLocation(activity, preferences.location)) {
          continue;
        }

        activities.push({ id: activityId, ...activity });
      }
    }

    return activities;
  }

  // Score activity based on personality fit
  scoreActivity(activity, profile1, profile2, preferences) {
    let score = 0.5; // Base score

    // Personality requirements scoring
    if (activity.personality_requirements) {
      const personalityFit = this.calculatePersonalityRequirementsFit(
        activity.personality_requirements,
        profile1,
        profile2
      );
      score += personalityFit * 0.4;
    }

    // Conversation opportunities
    const communicationScore = this.getCommunicationScore(profile1, profile2);
    if (activity.conversation_opportunities === 'very_high' && communicationScore > 0.7) {
      score += 0.2;
    } else if (activity.conversation_opportunities === 'high' && communicationScore > 0.6) {
      score += 0.1;
    }

    // Physical activity preferences
    const activityPreference = this.getActivityPreference(profile1, profile2);
    if (this.matchesActivityPreference(activity, activityPreference)) {
      score += 0.1;
    }

    // Preference bonuses
    if (preferences.preferred_activities?.includes(activity.id)) {
      score += 0.2;
    }

    return Math.min(1, score);
  }

  // Calculate personality requirements fit
  calculatePersonalityRequirementsFit(requirements, profile1, profile2) {
    let fit = 0;
    let count = 0;

    if (requirements.big_five) {
      for (const [trait, required] of Object.entries(requirements.big_five)) {
        const value1 = profile1.dimensions.big_five?.[trait] || 0.5;
        const value2 = profile2.dimensions.big_five?.[trait] || 0.5;
        const avgValue = (value1 + value2) / 2;

        if (avgValue >= required) {
          fit += 1;
        } else {
          fit += avgValue / required;
        }
        count++;
      }
    }

    return count > 0 ? fit / count : 0.5;
  }

  // Get communication score
  getCommunicationScore(profile1, profile2) {
    const comm1 = profile1.dimensions.communication || {};
    const comm2 = profile2.dimensions.communication || {};

    const avgActiveListening = ((comm1.activeListening || 0.5) + (comm2.activeListening || 0.5)) / 2;
    const avgEmotionalExpression = ((comm1.emotionalExpression || 0.5) + (comm2.emotionalExpression || 0.5)) / 2;

    return (avgActiveListening + avgEmotionalExpression) / 2;
  }

  // Get activity preference
  getActivityPreference(profile1, profile2) {
    const values1 = profile1.dimensions.values || {};
    const values2 = profile2.dimensions.values || {};

    const avgAdventure = ((values1.adventure || 0.5) + (values2.adventure || 0.5)) / 2;
    const avgSecurity = ((values1.security || 0.5) + (values2.security || 0.5)) / 2;

    if (avgAdventure > 0.7) return 'high_activity';
    if (avgSecurity > 0.7) return 'low_activity';
    return 'medium_activity';
  }

  // Check if activity matches preference
  matchesActivityPreference(activity, preference) {
    const activityLevels = {
      'very_low': 1,
      'low': 2,
      'medium': 3,
      'high': 4,
      'very_high': 5
    };

    const activityLevel = activityLevels[activity.physical_activity] || 3;

    switch (preference) {
      case 'high_activity':
        return activityLevel >= 4;
      case 'low_activity':
        return activityLevel <= 2;
      case 'medium_activity':
        return activityLevel >= 2 && activityLevel <= 4;
      default:
        return true;
    }
  }

  // Generate personalized reason
  generatePersonalizedReason(activity, profile1, profile2) {
    const reasons = [];

    // Personality-based reasons
    const bigFive1 = profile1.dimensions.big_five || {};
    const bigFive2 = profile2.dimensions.big_five || {};

    if (activity.category === 'adventure' && (bigFive1.openness > 0.7 || bigFive2.openness > 0.7)) {
      reasons.push('Perfect for your adventurous spirit and openness to new experiences');
    }

    if (activity.conversation_opportunities === 'very_high' && this.getCommunicationScore(profile1, profile2) > 0.7) {
      reasons.push('Great opportunity for meaningful conversation, which aligns with your communication styles');
    }

    if (activity.category === 'creative' && (bigFive1.openness > 0.8 || bigFive2.openness > 0.8)) {
      reasons.push('Appeals to your creative and artistic nature');
    }

    if (activity.intimacy_level === 'high' && (bigFive1.agreeableness > 0.7 || bigFive2.agreeableness > 0.7)) {
      reasons.push('Creates intimate moments that suit your warm and caring personalities');
    }

    return reasons.length > 0 ? reasons[0] : 'A great match for your personalities and interests';
  }

  // Generate activity tips
  generateActivityTips(activity, profile1, profile2) {
    const tips = [];

    // Communication tips
    if (activity.conversation_opportunities === 'very_high') {
      tips.push('Use this time to ask open-ended questions and really listen to each other');
    }

    // Physical activity tips
    if (activity.physical_activity === 'high' || activity.physical_activity === 'very_high') {
      tips.push('Take breaks to rest and connect - it\'s about being together, not just the activity');
    }

    // Intimacy tips
    if (activity.intimacy_level === 'high') {
      tips.push('Focus on creating a comfortable, pressure-free environment for both of you');
    }

    // Category-specific tips
    switch (activity.category) {
      case 'adventure':
        tips.push('Be flexible with plans and enjoy the journey together');
        break;
      case 'cultural':
        tips.push('Share your thoughts and reactions - different perspectives can be fascinating');
        break;
      case 'creative':
        tips.push('Focus on the fun process rather than the end result');
        break;
    }

    return tips;
  }

  // Generate activity logistics
  generateActivityLogistics(activity, preferences) {
    const logistics = {
      duration: activity.duration,
      estimatedCost: activity.cost,
      bestTimeOfDay: this.suggestBestTimeOfDay(activity),
      whatToBring: this.suggestWhatToBring(activity),
      backupPlan: this.suggestBackupPlan(activity)
    };

    if (preferences.location) {
      logistics.suggestedArea = preferences.location;
    }

    return logistics;
  }

  // Suggest best time of day
  suggestBestTimeOfDay(activity) {
    switch (activity.category) {
      case 'adventure':
        return 'Morning or early afternoon for best weather and energy';
      case 'cultural':
        return 'Afternoon or early evening when venues are less crowded';
      case 'intimate':
        return 'Evening for a more romantic atmosphere';
      case 'active':
        return 'Morning or late afternoon to avoid peak heat';
      case 'romantic':
        return 'Evening or sunset for romantic ambiance';
      default:
        return 'Afternoon or early evening';
    }
  }

  // Suggest what to bring
  suggestWhatToBring(activity) {
    const suggestions = [];

    if (activity.location_type === 'outdoor') {
      suggestions.push('Weather-appropriate clothing');
      suggestions.push('Water bottles');
    }

    if (activity.physical_activity === 'high' || activity.physical_activity === 'very_high') {
      suggestions.push('Comfortable shoes');
      suggestions.push('Small towel');
    }

    if (activity.category === 'romantic') {
      suggestions.push('Small surprise or thoughtful gesture');
    }

    return suggestions;
  }

  // Suggest backup plan
  suggestBackupPlan(activity) {
    if (activity.location_type === 'outdoor') {
      return 'Have an indoor alternative ready in case of bad weather';
    }

    if (activity.cost === 'high') {
      return 'Consider a more budget-friendly version of the same activity';
    }

    return 'Have a simple coffee or walk option as backup';
  }

  // Generate date tips
  generateDateTips(profile1, profile2, compatibility, relationshipData) {
    const tips = [];

    // Communication tips
    if (compatibility.dimensions.communication.score < 0.6) {
      tips.push({
        category: 'communication',
        tip: 'Focus on asking open-ended questions and really listening to their responses',
        reason: 'Based on your communication styles, this will help you connect better'
      });
    }

    // Personality-based tips
    const bigFive1 = profile1.dimensions.big_five || {};
    const bigFive2 = profile2.dimensions.big_five || {};

    if (bigFive1.neuroticism > 0.6 || bigFive2.neuroticism > 0.6) {
      tips.push({
        category: 'comfort',
        tip: 'Choose familiar, comfortable environments to help everyone feel at ease',
        reason: 'This will help reduce any nervousness and create a more relaxed atmosphere'
      });
    }

    if (bigFive1.extraversion > 0.7 && bigFive2.extraversion < 0.4) {
      tips.push({
        category: 'balance',
        tip: 'Balance social activities with quieter, more intimate moments',
        reason: 'This accommodates both your social energy and their need for quieter connection'
      });
    }

    // Relationship stage tips
    const stage = relationshipData?.relationshipStage || 'pre_relationship';
    switch (stage) {
      case 'pre_relationship':
        tips.push({
          category: 'getting_to_know',
          tip: 'Focus on learning about each other\'s interests and values',
          reason: 'This early stage is perfect for building foundation knowledge about each other'
        });
        break;
      case 'early_relationship':
        tips.push({
          category: 'deepening',
          tip: 'Share more personal stories and experiences',
          reason: 'You\'re ready to deepen your emotional connection'
        });
        break;
      case 'developing_relationship':
        tips.push({
          category: 'future_focus',
          tip: 'Discuss future plans and shared goals',
          reason: 'Your relationship is developing toward more serious commitment'
        });
        break;
    }

    return tips;
  }

  // Generate logistics suggestions
  generateLogisticsSuggestions(profile1, profile2, topRecommendation, preferences) {
    const logistics = {
      timing: this.suggestOptimalTiming(profile1, profile2, topRecommendation),
      location: this.suggestOptimalLocation(preferences),
      preparation: this.suggestPreparation(topRecommendation),
      followUp: this.suggestFollowUp(profile1, profile2, topRecommendation)
    };

    return logistics;
  }

  // Suggest optimal timing
  suggestOptimalTiming(profile1, profile2, recommendation) {
    const timing = {
      dayOfWeek: 'Weekend for more relaxed atmosphere',
      timeOfDay: recommendation.logistics.bestTimeOfDay,
      duration: recommendation.activity.duration,
      scheduling: 'Plan 2-3 days in advance to show thoughtfulness'
    };

    return timing;
  }

  // Suggest optimal location
  suggestOptimalLocation(preferences) {
    return {
      area: preferences.location || 'Convenient for both parties',
      parking: 'Consider parking availability and public transport',
      accessibility: 'Ensure location is accessible for everyone',
      backup: 'Have an alternative nearby location in mind'
    };
  }

  // Suggest preparation
  suggestPreparation(recommendation) {
    const prep = {
      research: 'Look up the venue/activity details in advance',
      timing: 'Check operating hours and busy periods',
      backup: 'Have an alternative plan ready',
      personal: 'Be well-rested and in a positive mindset'
    };

    if (recommendation.activity.cost !== 'free') {
      prep.budget = 'Discuss payment expectations beforehand';
    }

    return prep;
  }

  // Suggest follow-up
  suggestFollowUp(profile1, profile2, recommendation) {
    return {
      immediate: 'Send a message within 24 hours sharing what you enjoyed',
      reflection: 'Think about what you learned about each other',
      next_steps: 'If it went well, suggest a follow-up activity within a week',
      feedback: 'Be open about what worked and what could be improved'
    };
  }

  // Helper methods
  generateCacheKey(userId1, userId2, preferences) {
    const key = {
      users: [userId1, userId2].sort(),
      preferences: preferences,
      timestamp: Math.floor(Date.now() / this.cacheTimeout)
    };
    return JSON.stringify(key);
  }

  matchesBudget(activity, budget) {
    const budgetLevels = {
      'free': 0,
      'low': 1,
      'low_medium': 2,
      'medium': 3,
      'medium_high': 4,
      'high': 5
    };

    const activityLevel = budgetLevels[activity.cost] || 3;
    const maxBudgetLevel = budgetLevels[budget] || 5;

    return activityLevel <= maxBudgetLevel;
  }

  matchesWeather(activity, weather) {
    if (activity.location_type === 'indoor') return true;
    if (weather === 'good' && activity.location_type === 'outdoor') return true;
    if (weather === 'bad' && activity.location_type === 'indoor_outdoor') return true;
    return false;
  }

  matchesLocation(activity, location) {
    // Simple location matching - in real app, this would be more sophisticated
    return true;
  }

  calculatePersonalityFit(profile1, profile2) {
    const bigFive1 = profile1.dimensions.big_five || {};
    const bigFive2 = profile2.dimensions.big_five || {};

    const traits = ['extraversion', 'openness', 'conscientiousness', 'agreeableness', 'neuroticism'];
    let totalFit = 0;

    for (const trait of traits) {
      const value1 = bigFive1[trait] || 0.5;
      const value2 = bigFive2[trait] || 0.5;
      const compatibility = 1 - Math.abs(value1 - value2);
      totalFit += compatibility;
    }

    return totalFit / traits.length;
  }

  getDefaultDatePlan(preferences) {
    return {
      timestamp: new Date().toISOString(),
      relationshipStage: 'unknown',
      compatibilityScore: 0.5,
      personalityFit: 0.5,
      recommendations: [{
        id: 'coffee_date',
        activity: this.activityDatabase.get('coffee_date'),
        category: this.dateCategories.get('relaxed'),
        score: 0.7,
        personalizedReason: 'A safe, comfortable option for getting to know each other',
        tips: ['Focus on asking open-ended questions', 'Be present and engaged'],
        logistics: {
          duration: '1-2 hours',
          estimatedCost: 'low',
          bestTimeOfDay: 'Afternoon',
          whatToBring: [],
          backupPlan: 'Have a walk option nearby'
        }
      }],
      alternatives: [],
      tips: [],
      logistics: {},
      error: 'Limited functionality - using default plan'
    };
  }

  // Get assistant statistics
  getStats() {
    return {
      initialized: this.initialized,
      cacheSize: this.datePlanCache.size,
      dateCategories: this.dateCategories.size,
      totalActivities: this.activityDatabase.size,
      categoriesSupported: Array.from(this.dateCategories.keys())
    };
  }

  // Clear cache
  clearCache() {
    this.datePlanCache.clear();
  }
}

export default new AIDatePlanningAssistant();