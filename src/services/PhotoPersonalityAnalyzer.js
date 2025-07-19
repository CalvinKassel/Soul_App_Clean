// Photo Personality Analysis Engine
// Revolutionary AI-powered personality insights from photos

import VectorEmbeddingService from './VectorEmbeddingService';
import PersonalityProfilingEngine from './PersonalityProfilingEngine';

class PhotoPersonalityAnalyzer {
  constructor() {
    this.initialized = false;
    this.analysisCache = new Map();
    this.cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours
    
    // Photo analysis dimensions
    this.analysisDimensions = {
      facial_expressions: {
        weight: 0.25,
        indicators: ['smile', 'eye_contact', 'eyebrow_position', 'mouth_curve']
      },
      body_language: {
        weight: 0.20,
        indicators: ['posture', 'arm_position', 'hand_gestures', 'stance']
      },
      environmental_context: {
        weight: 0.15,
        indicators: ['setting', 'social_context', 'activity', 'formality']
      },
      style_choices: {
        weight: 0.15,
        indicators: ['clothing_style', 'accessories', 'grooming', 'color_choices']
      },
      photo_composition: {
        weight: 0.10,
        indicators: ['angle', 'lighting', 'framing', 'background']
      },
      social_indicators: {
        weight: 0.15,
        indicators: ['group_size', 'interaction_type', 'social_setting', 'activity_type']
      }
    };
  }

  // Initialize the photo analyzer
  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize embedding service for photo description analysis
      await VectorEmbeddingService.initialize();
      this.initialized = true;
      console.log('Photo Personality Analyzer initialized successfully');
    } catch (error) {
      console.error('Error initializing Photo Personality Analyzer:', error);
      this.initialized = true; // Continue with limited functionality
    }
  }

  // Analyze photo for personality insights
  async analyzePhoto(userId, photoData, metadata = {}) {
    if (!this.initialized) await this.initialize();

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(photoData, metadata);
      const cached = this.analysisCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.analysis;
      }

      // Generate photo description for analysis
      const photoDescription = await this.generatePhotoDescription(photoData, metadata);
      
      // Analyze personality dimensions from photo
      const analysis = await this.performPhotoAnalysis(photoDescription, metadata);
      
      // Integrate with existing personality profile
      const personalityResult = await this.integrateWithPersonalityProfile(userId, analysis, metadata);
      
      // Cache the result
      this.analysisCache.set(cacheKey, {
        analysis: personalityResult,
        timestamp: Date.now()
      });

      return personalityResult;

    } catch (error) {
      console.error('Error analyzing photo:', error);
      return this.getDefaultPhotoAnalysis();
    }
  }

  // Generate descriptive text from photo for AI analysis
  async generatePhotoDescription(photoData, metadata) {
    // In a real implementation, this would use computer vision APIs
    // For now, we'll work with metadata and simulate analysis
    
    let description = '';
    
    // Analyze metadata for clues
    if (metadata.setting) {
      description += `Photo taken in ${metadata.setting}. `;
    }
    
    if (metadata.activity) {
      description += `Person is engaged in ${metadata.activity}. `;
    }
    
    if (metadata.social_context) {
      description += `Social context: ${metadata.social_context}. `;
    }
    
    if (metadata.style_notes) {
      description += `Style observation: ${metadata.style_notes}. `;
    }
    
    if (metadata.expression_notes) {
      description += `Facial expression: ${metadata.expression_notes}. `;
    }
    
    if (metadata.body_language_notes) {
      description += `Body language: ${metadata.body_language_notes}. `;
    }
    
    // Add default description if no metadata
    if (!description) {
      description = 'Photo shows person in casual setting with natural expression and relaxed posture.';
    }
    
    return description;
  }

  // Perform comprehensive photo analysis
  async performPhotoAnalysis(photoDescription, metadata) {
    const analysis = {
      timestamp: new Date().toISOString(),
      description: photoDescription,
      metadata: metadata,
      personality_insights: {}
    };

    // Analyze each dimension
    analysis.personality_insights = {
      extraversion: await this.analyzeExtraversion(photoDescription, metadata),
      openness: await this.analyzeOpenness(photoDescription, metadata),
      conscientiousness: await this.analyzeConscientiousness(photoDescription, metadata),
      agreeableness: await this.analyzeAgreeableness(photoDescription, metadata),
      neuroticism: await this.analyzeNeuroticism(photoDescription, metadata),
      attachment_style: await this.analyzeAttachmentStyle(photoDescription, metadata),
      values: await this.analyzeValues(photoDescription, metadata),
      confidence: await this.analyzeConfidence(photoDescription, metadata)
    };

    return analysis;
  }

  // Analyze extraversion from photo
  async analyzeExtraversion(description, metadata) {
    const analysis = {
      score: 0.5,
      confidence: 0.3,
      indicators: [],
      reasoning: ''
    };

    const desc = description.toLowerCase();
    
    // Social context indicators
    if (desc.includes('group') || desc.includes('party') || desc.includes('crowd')) {
      analysis.score += 0.2;
      analysis.indicators.push('Social group setting');
    }
    
    if (desc.includes('alone') || desc.includes('solo') || desc.includes('individual')) {
      analysis.score -= 0.1;
      analysis.indicators.push('Solo activity');
    }
    
    // Activity indicators
    if (desc.includes('performing') || desc.includes('stage') || desc.includes('presentation')) {
      analysis.score += 0.25;
      analysis.indicators.push('Performance/presentation context');
    }
    
    if (desc.includes('quiet') || desc.includes('reading') || desc.includes('meditation')) {
      analysis.score -= 0.15;
      analysis.indicators.push('Quiet/introspective activity');
    }
    
    // Expression indicators
    if (desc.includes('big smile') || desc.includes('laughing') || desc.includes('animated')) {
      analysis.score += 0.15;
      analysis.indicators.push('Expressive, animated demeanor');
    }
    
    if (desc.includes('subtle smile') || desc.includes('reserved') || desc.includes('calm')) {
      analysis.score -= 0.1;
      analysis.indicators.push('Reserved expression');
    }
    
    // Body language indicators
    if (desc.includes('open arms') || desc.includes('gesturing') || desc.includes('dynamic pose')) {
      analysis.score += 0.1;
      analysis.indicators.push('Open, dynamic body language');
    }
    
    // Normalize score
    analysis.score = Math.max(0, Math.min(1, analysis.score));
    
    // Increase confidence based on indicators
    analysis.confidence = Math.min(0.7, 0.3 + (analysis.indicators.length * 0.1));
    
    analysis.reasoning = this.generateExtraversionReasoning(analysis);
    
    return analysis;
  }

  // Analyze openness from photo
  async analyzeOpenness(description, metadata) {
    const analysis = {
      score: 0.5,
      confidence: 0.3,
      indicators: [],
      reasoning: ''
    };

    const desc = description.toLowerCase();
    
    // Setting indicators
    if (desc.includes('travel') || desc.includes('foreign') || desc.includes('exotic')) {
      analysis.score += 0.2;
      analysis.indicators.push('Travel/exotic setting');
    }
    
    if (desc.includes('art') || desc.includes('museum') || desc.includes('gallery')) {
      analysis.score += 0.15;
      analysis.indicators.push('Cultural/artistic context');
    }
    
    if (desc.includes('nature') || desc.includes('hiking') || desc.includes('adventure')) {
      analysis.score += 0.15;
      analysis.indicators.push('Adventure/nature activity');
    }
    
    // Style indicators
    if (desc.includes('unique') || desc.includes('creative') || desc.includes('artistic')) {
      analysis.score += 0.1;
      analysis.indicators.push('Creative/unique style');
    }
    
    if (desc.includes('conventional') || desc.includes('traditional') || desc.includes('standard')) {
      analysis.score -= 0.1;
      analysis.indicators.push('Conventional style');
    }
    
    // Activity indicators
    if (desc.includes('experiment') || desc.includes('new') || desc.includes('different')) {
      analysis.score += 0.1;
      analysis.indicators.push('Novel/experimental activity');
    }
    
    // Normalize score
    analysis.score = Math.max(0, Math.min(1, analysis.score));
    analysis.confidence = Math.min(0.6, 0.3 + (analysis.indicators.length * 0.08));
    analysis.reasoning = this.generateOpennessReasoning(analysis);
    
    return analysis;
  }

  // Analyze conscientiousness from photo
  async analyzeConscientiousness(description, metadata) {
    const analysis = {
      score: 0.5,
      confidence: 0.3,
      indicators: [],
      reasoning: ''
    };

    const desc = description.toLowerCase();
    
    // Grooming indicators
    if (desc.includes('well-groomed') || desc.includes('neat') || desc.includes('tidy')) {
      analysis.score += 0.2;
      analysis.indicators.push('Well-groomed appearance');
    }
    
    if (desc.includes('disheveled') || desc.includes('messy') || desc.includes('unkempt')) {
      analysis.score -= 0.15;
      analysis.indicators.push('Casual/relaxed grooming');
    }
    
    // Setting indicators
    if (desc.includes('organized') || desc.includes('clean') || desc.includes('orderly')) {
      analysis.score += 0.15;
      analysis.indicators.push('Organized environment');
    }
    
    if (desc.includes('cluttered') || desc.includes('messy') || desc.includes('chaotic')) {
      analysis.score -= 0.1;
      analysis.indicators.push('Disorganized environment');
    }
    
    // Activity indicators
    if (desc.includes('work') || desc.includes('study') || desc.includes('professional')) {
      analysis.score += 0.1;
      analysis.indicators.push('Work/study context');
    }
    
    if (desc.includes('formal') || desc.includes('business') || desc.includes('structured')) {
      analysis.score += 0.1;
      analysis.indicators.push('Formal/structured setting');
    }
    
    // Normalize score
    analysis.score = Math.max(0, Math.min(1, analysis.score));
    analysis.confidence = Math.min(0.6, 0.3 + (analysis.indicators.length * 0.08));
    analysis.reasoning = this.generateConscientiousnessReasoning(analysis);
    
    return analysis;
  }

  // Analyze agreeableness from photo
  async analyzeAgreeableness(description, metadata) {
    const analysis = {
      score: 0.5,
      confidence: 0.3,
      indicators: [],
      reasoning: ''
    };

    const desc = description.toLowerCase();
    
    // Expression indicators
    if (desc.includes('warm smile') || desc.includes('kind eyes') || desc.includes('gentle')) {
      analysis.score += 0.2;
      analysis.indicators.push('Warm, gentle expression');
    }
    
    if (desc.includes('stern') || desc.includes('serious') || desc.includes('intense')) {
      analysis.score -= 0.1;
      analysis.indicators.push('Serious/intense expression');
    }
    
    // Social context indicators
    if (desc.includes('helping') || desc.includes('caring') || desc.includes('supportive')) {
      analysis.score += 0.15;
      analysis.indicators.push('Helping/caring behavior');
    }
    
    if (desc.includes('with children') || desc.includes('with elderly') || desc.includes('volunteering')) {
      analysis.score += 0.15;
      analysis.indicators.push('Nurturing/service context');
    }
    
    // Body language indicators
    if (desc.includes('open posture') || desc.includes('welcoming') || desc.includes('approachable')) {
      analysis.score += 0.1;
      analysis.indicators.push('Open, welcoming posture');
    }
    
    if (desc.includes('closed off') || desc.includes('defensive') || desc.includes('distant')) {
      analysis.score -= 0.1;
      analysis.indicators.push('Closed/defensive posture');
    }
    
    // Normalize score
    analysis.score = Math.max(0, Math.min(1, analysis.score));
    analysis.confidence = Math.min(0.6, 0.3 + (analysis.indicators.length * 0.08));
    analysis.reasoning = this.generateAgreeablenessReasoning(analysis);
    
    return analysis;
  }

  // Analyze neuroticism from photo
  async analyzeNeuroticism(description, metadata) {
    const analysis = {
      score: 0.5,
      confidence: 0.3,
      indicators: [],
      reasoning: ''
    };

    const desc = description.toLowerCase();
    
    // Expression indicators
    if (desc.includes('tense') || desc.includes('worried') || desc.includes('anxious')) {
      analysis.score += 0.2;
      analysis.indicators.push('Tense/worried expression');
    }
    
    if (desc.includes('relaxed') || desc.includes('calm') || desc.includes('peaceful')) {
      analysis.score -= 0.15;
      analysis.indicators.push('Relaxed, calm demeanor');
    }
    
    // Body language indicators
    if (desc.includes('rigid') || desc.includes('tight') || desc.includes('stiff')) {
      analysis.score += 0.15;
      analysis.indicators.push('Rigid/tense body language');
    }
    
    if (desc.includes('loose') || desc.includes('fluid') || desc.includes('natural')) {
      analysis.score -= 0.1;
      analysis.indicators.push('Natural, relaxed posture');
    }
    
    // Context indicators
    if (desc.includes('stressful') || desc.includes('challenging') || desc.includes('pressure')) {
      analysis.score += 0.1;
      analysis.indicators.push('Stressful context');
    }
    
    if (desc.includes('peaceful') || desc.includes('serene') || desc.includes('tranquil')) {
      analysis.score -= 0.1;
      analysis.indicators.push('Peaceful environment');
    }
    
    // Normalize score
    analysis.score = Math.max(0, Math.min(1, analysis.score));
    analysis.confidence = Math.min(0.5, 0.3 + (analysis.indicators.length * 0.07));
    analysis.reasoning = this.generateNeuroticismReasoning(analysis);
    
    return analysis;
  }

  // Analyze attachment style from photo
  async analyzeAttachmentStyle(description, metadata) {
    const analysis = {
      secure: 0.25,
      anxious: 0.25,
      avoidant: 0.25,
      disorganized: 0.25,
      confidence: 0.2,
      indicators: [],
      reasoning: ''
    };

    const desc = description.toLowerCase();
    
    // Secure attachment indicators
    if (desc.includes('comfortable') || desc.includes('natural') || desc.includes('confident')) {
      analysis.secure += 0.2;
      analysis.indicators.push('Comfortable, natural demeanor');
    }
    
    if (desc.includes('close contact') || desc.includes('intimate') || desc.includes('connected')) {
      analysis.secure += 0.15;
      analysis.indicators.push('Comfortable with closeness');
    }
    
    // Anxious attachment indicators
    if (desc.includes('clingy') || desc.includes('needy') || desc.includes('attention-seeking')) {
      analysis.anxious += 0.15;
      analysis.indicators.push('Attention-seeking behavior');
    }
    
    if (desc.includes('worried') || desc.includes('insecure') || desc.includes('uncertain')) {
      analysis.anxious += 0.1;
      analysis.indicators.push('Worried/insecure expression');
    }
    
    // Avoidant attachment indicators
    if (desc.includes('distant') || desc.includes('independent') || desc.includes('aloof')) {
      analysis.avoidant += 0.15;
      analysis.indicators.push('Distant/independent stance');
    }
    
    if (desc.includes('minimal contact') || desc.includes('separated') || desc.includes('isolated')) {
      analysis.avoidant += 0.1;
      analysis.indicators.push('Minimal physical contact');
    }
    
    // Disorganized attachment indicators
    if (desc.includes('conflicted') || desc.includes('confused') || desc.includes('inconsistent')) {
      analysis.disorganized += 0.1;
      analysis.indicators.push('Conflicted/confused signals');
    }
    
    // Normalize scores
    const total = analysis.secure + analysis.anxious + analysis.avoidant + analysis.disorganized;
    if (total > 0) {
      analysis.secure /= total;
      analysis.anxious /= total;
      analysis.avoidant /= total;
      analysis.disorganized /= total;
    }
    
    analysis.confidence = Math.min(0.4, 0.2 + (analysis.indicators.length * 0.05));
    analysis.reasoning = this.generateAttachmentReasoning(analysis);
    
    return analysis;
  }

  // Analyze values from photo
  async analyzeValues(description, metadata) {
    const analysis = {
      family: 0.5,
      career: 0.5,
      adventure: 0.5,
      security: 0.5,
      creativity: 0.5,
      helping: 0.5,
      independence: 0.5,
      spirituality: 0.5,
      confidence: 0.3,
      indicators: [],
      reasoning: ''
    };

    const desc = description.toLowerCase();
    
    // Family values
    if (desc.includes('family') || desc.includes('children') || desc.includes('home')) {
      analysis.family += 0.2;
      analysis.indicators.push('Family-oriented context');
    }
    
    // Career values
    if (desc.includes('professional') || desc.includes('work') || desc.includes('business')) {
      analysis.career += 0.2;
      analysis.indicators.push('Professional/career context');
    }
    
    // Adventure values
    if (desc.includes('travel') || desc.includes('adventure') || desc.includes('explore')) {
      analysis.adventure += 0.2;
      analysis.indicators.push('Adventure/exploration activity');
    }
    
    // Security values
    if (desc.includes('home') || desc.includes('safe') || desc.includes('stable')) {
      analysis.security += 0.15;
      analysis.indicators.push('Security/stability context');
    }
    
    // Creativity values
    if (desc.includes('art') || desc.includes('creative') || desc.includes('music')) {
      analysis.creativity += 0.2;
      analysis.indicators.push('Creative/artistic context');
    }
    
    // Helping values
    if (desc.includes('volunteer') || desc.includes('helping') || desc.includes('service')) {
      analysis.helping += 0.2;
      analysis.indicators.push('Helping/service activity');
    }
    
    // Independence values
    if (desc.includes('solo') || desc.includes('independent') || desc.includes('self-reliant')) {
      analysis.independence += 0.15;
      analysis.indicators.push('Independent activity');
    }
    
    // Spirituality values
    if (desc.includes('spiritual') || desc.includes('meditation') || desc.includes('nature')) {
      analysis.spirituality += 0.15;
      analysis.indicators.push('Spiritual/reflective context');
    }
    
    // Normalize scores
    for (const key of Object.keys(analysis)) {
      if (typeof analysis[key] === 'number' && key !== 'confidence') {
        analysis[key] = Math.max(0, Math.min(1, analysis[key]));
      }
    }
    
    analysis.confidence = Math.min(0.5, 0.3 + (analysis.indicators.length * 0.05));
    analysis.reasoning = this.generateValuesReasoning(analysis);
    
    return analysis;
  }

  // Analyze confidence from photo
  async analyzeConfidence(description, metadata) {
    const analysis = {
      score: 0.5,
      confidence: 0.4,
      indicators: [],
      reasoning: ''
    };

    const desc = description.toLowerCase();
    
    // Posture indicators
    if (desc.includes('straight posture') || desc.includes('upright') || desc.includes('tall')) {
      analysis.score += 0.15;
      analysis.indicators.push('Confident posture');
    }
    
    if (desc.includes('slouched') || desc.includes('hunched') || desc.includes('defensive')) {
      analysis.score -= 0.1;
      analysis.indicators.push('Defensive/uncertain posture');
    }
    
    // Eye contact indicators
    if (desc.includes('direct gaze') || desc.includes('eye contact') || desc.includes('looking directly')) {
      analysis.score += 0.15;
      analysis.indicators.push('Direct eye contact');
    }
    
    if (desc.includes('looking away') || desc.includes('averted gaze') || desc.includes('shy')) {
      analysis.score -= 0.1;
      analysis.indicators.push('Averted gaze');
    }
    
    // Expression indicators
    if (desc.includes('confident smile') || desc.includes('self-assured') || desc.includes('composed')) {
      analysis.score += 0.1;
      analysis.indicators.push('Confident expression');
    }
    
    if (desc.includes('nervous') || desc.includes('hesitant') || desc.includes('uncertain')) {
      analysis.score -= 0.1;
      analysis.indicators.push('Nervous/uncertain expression');
    }
    
    // Normalize score
    analysis.score = Math.max(0, Math.min(1, analysis.score));
    analysis.confidence = Math.min(0.6, 0.4 + (analysis.indicators.length * 0.05));
    analysis.reasoning = this.generateConfidenceReasoning(analysis);
    
    return analysis;
  }

  // Integrate photo analysis with existing personality profile
  async integrateWithPersonalityProfile(userId, photoAnalysis, metadata) {
    try {
      // Get existing personality profile
      const existingProfile = PersonalityProfilingEngine.getUserProfile(userId);
      
      // Create integration message for personality engine
      const integrationMessage = this.createIntegrationMessage(photoAnalysis, metadata);
      
      // Analyze the photo insights as if they were a message
      const personalityResult = await PersonalityProfilingEngine.analyzeMessage(
        userId,
        integrationMessage,
        {
          source: 'photo_analysis',
          photo_metadata: metadata,
          analysis_type: 'visual_personality_assessment'
        }
      );
      
      // Add photo-specific insights
      const enhancedResult = {
        ...personalityResult,
        photoAnalysis: photoAnalysis,
        photoInsights: this.generatePhotoInsights(photoAnalysis),
        visualPersonalityMarkers: this.extractVisualMarkers(photoAnalysis)
      };
      
      return enhancedResult;
      
    } catch (error) {
      console.error('Error integrating photo analysis with personality profile:', error);
      return {
        photoAnalysis: photoAnalysis,
        photoInsights: this.generatePhotoInsights(photoAnalysis),
        error: 'Integration failed, returning photo analysis only'
      };
    }
  }

  // Create integration message from photo analysis
  createIntegrationMessage(photoAnalysis, metadata) {
    const insights = photoAnalysis.personality_insights;
    let message = 'Based on visual analysis, ';
    
    // Extraversion
    if (insights.extraversion.score > 0.6) {
      message += 'I appear outgoing and social. ';
    } else if (insights.extraversion.score < 0.4) {
      message += 'I prefer quieter, more intimate settings. ';
    }
    
    // Openness
    if (insights.openness.score > 0.6) {
      message += 'I enjoy new experiences and creative activities. ';
    } else if (insights.openness.score < 0.4) {
      message += 'I prefer familiar and traditional activities. ';
    }
    
    // Conscientiousness
    if (insights.conscientiousness.score > 0.6) {
      message += 'I value organization and attention to detail. ';
    } else if (insights.conscientiousness.score < 0.4) {
      message += 'I have a more relaxed approach to structure. ';
    }
    
    // Agreeableness
    if (insights.agreeableness.score > 0.6) {
      message += 'I seem warm and approachable. ';
    } else if (insights.agreeableness.score < 0.4) {
      message += 'I appear more serious and focused. ';
    }
    
    // Values
    const topValues = Object.entries(insights.values)
      .filter(([key, value]) => typeof value === 'number' && value > 0.6)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);
    
    if (topValues.length > 0) {
      message += `I value ${topValues.map(([key]) => key).join(' and ')}. `;
    }
    
    return message;
  }

  // Generate photo insights
  generatePhotoInsights(photoAnalysis) {
    const insights = [];
    const personalityInsights = photoAnalysis.personality_insights;
    
    // Extraversion insights
    if (personalityInsights.extraversion.score > 0.7) {
      insights.push({
        category: 'social_energy',
        insight: 'Shows high social energy and comfort in social situations',
        confidence: personalityInsights.extraversion.confidence,
        evidence: personalityInsights.extraversion.indicators
      });
    }
    
    // Openness insights
    if (personalityInsights.openness.score > 0.7) {
      insights.push({
        category: 'openness',
        insight: 'Demonstrates openness to new experiences and creativity',
        confidence: personalityInsights.openness.confidence,
        evidence: personalityInsights.openness.indicators
      });
    }
    
    // Conscientiousness insights
    if (personalityInsights.conscientiousness.score > 0.7) {
      insights.push({
        category: 'organization',
        insight: 'Shows attention to detail and organizational skills',
        confidence: personalityInsights.conscientiousness.confidence,
        evidence: personalityInsights.conscientiousness.indicators
      });
    }
    
    // Agreeableness insights
    if (personalityInsights.agreeableness.score > 0.7) {
      insights.push({
        category: 'warmth',
        insight: 'Displays warmth and approachability',
        confidence: personalityInsights.agreeableness.confidence,
        evidence: personalityInsights.agreeableness.indicators
      });
    }
    
    // Confidence insights
    if (personalityInsights.confidence.score > 0.7) {
      insights.push({
        category: 'confidence',
        insight: 'Projects confidence and self-assurance',
        confidence: personalityInsights.confidence.confidence,
        evidence: personalityInsights.confidence.indicators
      });
    }
    
    return insights;
  }

  // Extract visual personality markers
  extractVisualMarkers(photoAnalysis) {
    const markers = {};
    const insights = photoAnalysis.personality_insights;
    
    // Extract top personality dimensions
    const dimensions = ['extraversion', 'openness', 'conscientiousness', 'agreeableness', 'neuroticism'];
    
    for (const dimension of dimensions) {
      if (insights[dimension] && insights[dimension].score > 0.6) {
        markers[dimension] = {
          strength: insights[dimension].score,
          confidence: insights[dimension].confidence,
          visualIndicators: insights[dimension].indicators
        };
      }
    }
    
    // Extract attachment style markers
    if (insights.attachment_style) {
      const primaryStyle = Object.entries(insights.attachment_style)
        .filter(([key, value]) => typeof value === 'number')
        .sort((a, b) => b[1] - a[1])[0];
      
      if (primaryStyle && primaryStyle[1] > 0.4) {
        markers.attachment = {
          style: primaryStyle[0],
          strength: primaryStyle[1],
          confidence: insights.attachment_style.confidence
        };
      }
    }
    
    return markers;
  }

  // Reasoning generators
  generateExtraversionReasoning(analysis) {
    if (analysis.score > 0.6) {
      return `High extraversion indicated by ${analysis.indicators.join(', ')}`;
    } else if (analysis.score < 0.4) {
      return `Lower extraversion suggested by ${analysis.indicators.join(', ')}`;
    }
    return 'Moderate extraversion with mixed indicators';
  }

  generateOpennessReasoning(analysis) {
    if (analysis.score > 0.6) {
      return `High openness shown through ${analysis.indicators.join(', ')}`;
    } else if (analysis.score < 0.4) {
      return `More conventional preferences indicated by ${analysis.indicators.join(', ')}`;
    }
    return 'Moderate openness with balanced indicators';
  }

  generateConscientiousnessReasoning(analysis) {
    if (analysis.score > 0.6) {
      return `High conscientiousness evident in ${analysis.indicators.join(', ')}`;
    } else if (analysis.score < 0.4) {
      return `More relaxed approach suggested by ${analysis.indicators.join(', ')}`;
    }
    return 'Moderate conscientiousness with mixed signals';
  }

  generateAgreeablenessReasoning(analysis) {
    if (analysis.score > 0.6) {
      return `High agreeableness displayed through ${analysis.indicators.join(', ')}`;
    } else if (analysis.score < 0.4) {
      return `More serious demeanor shown by ${analysis.indicators.join(', ')}`;
    }
    return 'Moderate agreeableness with balanced presentation';
  }

  generateNeuroticismReasoning(analysis) {
    if (analysis.score > 0.6) {
      return `Higher stress/tension indicated by ${analysis.indicators.join(', ')}`;
    } else if (analysis.score < 0.4) {
      return `Emotional stability shown through ${analysis.indicators.join(', ')}`;
    }
    return 'Moderate emotional stability with mixed indicators';
  }

  generateAttachmentReasoning(analysis) {
    const primary = Object.entries(analysis)
      .filter(([key, value]) => typeof value === 'number')
      .sort((a, b) => b[1] - a[1])[0];
    
    return `Primary attachment style appears to be ${primary[0]} based on ${analysis.indicators.join(', ')}`;
  }

  generateValuesReasoning(analysis) {
    const topValues = Object.entries(analysis)
      .filter(([key, value]) => typeof value === 'number' && value > 0.6)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);
    
    if (topValues.length > 0) {
      return `Primary values appear to be ${topValues.map(([key]) => key).join(' and ')} based on ${analysis.indicators.join(', ')}`;
    }
    return 'Values analysis shows balanced priorities';
  }

  generateConfidenceReasoning(analysis) {
    if (analysis.score > 0.6) {
      return `High confidence displayed through ${analysis.indicators.join(', ')}`;
    } else if (analysis.score < 0.4) {
      return `More reserved confidence suggested by ${analysis.indicators.join(', ')}`;
    }
    return 'Moderate confidence with mixed indicators';
  }

  // Helper methods
  generateCacheKey(photoData, metadata) {
    // Generate a simple cache key based on metadata
    const keyData = {
      setting: metadata.setting,
      activity: metadata.activity,
      social_context: metadata.social_context,
      timestamp: Math.floor(Date.now() / (1000 * 60 * 60)) // Hour-based caching
    };
    return JSON.stringify(keyData);
  }

  getDefaultPhotoAnalysis() {
    return {
      timestamp: new Date().toISOString(),
      description: 'Unable to analyze photo',
      personality_insights: {
        extraversion: { score: 0.5, confidence: 0.1, indicators: [], reasoning: 'Analysis failed' },
        openness: { score: 0.5, confidence: 0.1, indicators: [], reasoning: 'Analysis failed' },
        conscientiousness: { score: 0.5, confidence: 0.1, indicators: [], reasoning: 'Analysis failed' },
        agreeableness: { score: 0.5, confidence: 0.1, indicators: [], reasoning: 'Analysis failed' },
        neuroticism: { score: 0.5, confidence: 0.1, indicators: [], reasoning: 'Analysis failed' },
        attachment_style: { secure: 0.25, anxious: 0.25, avoidant: 0.25, disorganized: 0.25, confidence: 0.1 },
        values: { family: 0.5, career: 0.5, adventure: 0.5, security: 0.5, creativity: 0.5, helping: 0.5, independence: 0.5, spirituality: 0.5 },
        confidence: { score: 0.5, confidence: 0.1, indicators: [], reasoning: 'Analysis failed' }
      },
      photoInsights: [],
      error: 'Photo analysis failed'
    };
  }

  // Get analyzer statistics
  getStats() {
    return {
      initialized: this.initialized,
      cacheSize: this.analysisCache.size,
      analysisDimensions: Object.keys(this.analysisDimensions),
      dimensionWeights: this.analysisDimensions
    };
  }

  // Clear analysis cache
  clearCache() {
    this.analysisCache.clear();
  }
}

export default new PhotoPersonalityAnalyzer();