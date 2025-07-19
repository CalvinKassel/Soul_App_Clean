// Human Hex Code Matcher - Advanced Matchmaking Algorithm
// Revolutionary 3D personality mapping and compatibility system

import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatGPTService from './ChatGPTService';

class HumanHexCodeMatcher {
  constructor() {
    this.initialized = false;
    this.storageKey = 'human_hex_codes';
    this.userProfiles = new Map();
    this.compatibilityCache = new Map();
    this.inferenceEngine = new InferenceEngine();
    
    // 3D Human Color Solid dimensions
    this.dimensions = {
      metaphysicalCore: {
        name: 'Metaphysical Core',
        type: 'hue',
        range: [0, 360],
        anchors: {
          0: 'Cognitive/Intellectual',
          45: 'Inventive/Analytical', 
          90: 'Action/Creative',
          135: 'Empathetic/Collaborative',
          180: 'Relational/Emotional',
          225: 'Insightful/Transformative',
          270: 'Purpose/Growth',
          315: 'Contemplative/Visionary'
        }
      },
      manifestedSelf: {
        name: 'Manifested Self',
        type: 'scalar',
        range: [0, 255],
        components: ['socialEngagement', 'emotionalRegulation', 'lifeSatisfaction', 'adaptability', 'proactivity']
      },
      humanSoul: {
        name: 'Human/Soul',
        type: 'scalar', 
        range: [0, 255],
        components: ['existentialAwareness', 'transcendenceCapacity', 'authenticity', 'moralIntegration', 'unconditionalLove']
      }
    };
    
    // Compatibility weights
    this.compatibilityWeights = {
      hue: 0.4,
      manifested: 0.3,
      soul: 0.3
    };
    
    // Total possible hex codes: 256³ = 16,777,216
    this.totalHexCodes = 16777216;
  }

  // Initialize the matcher
  async initialize() {
    if (this.initialized) return;
    
    try {
      await this.loadUserProfiles();
      await this.inferenceEngine.initialize();
      
      this.initialized = true;
      console.log('Human Hex Code Matcher initialized successfully');
    } catch (error) {
      console.error('Error initializing Human Hex Code Matcher:', error);
      this.initialized = true;
    }
  }

  // Generate Human Hex Code from dimensions
  generateHexCode(hue, manifested, soul) {
    // Convert hue (0-360) to 0-255 range
    const h = Math.round((hue / 360) * 255);
    const m = Math.round(Math.max(0, Math.min(255, manifested)));
    const s = Math.round(Math.max(0, Math.min(255, soul)));
    
    // Convert to hex
    const toHex = (value) => value.toString(16).padStart(2, '0');
    return `#${toHex(h)}${toHex(m)}${toHex(s)}`.toUpperCase();
  }

  // Parse hex code back to dimensions
  parseHexCode(hexCode) {
    const hex = hexCode.replace('#', '');
    const h = parseInt(hex.substr(0, 2), 16);
    const m = parseInt(hex.substr(2, 2), 16);
    const s = parseInt(hex.substr(4, 2), 16);
    
    return {
      hue: (h / 255) * 360,
      manifested: m,
      soul: s
    };
  }

  // Create user profile from conversation analysis
  async createUserProfile(userId, conversationHistory) {
    try {
      const inferenceResult = await this.inferenceEngine.analyzeConversation(conversationHistory);
      
      const profile = {
        userId,
        humanHexCode: this.generateHexCode(
          inferenceResult.metaphysicalCore.hueValue,
          inferenceResult.manifestedSelf.value,
          inferenceResult.humanSoul.value
        ),
        lastUpdated: new Date().toISOString(),
        overallConfidence: inferenceResult.overallConfidence,
        dimensions: inferenceResult.dimensions,
        conversationHistory: conversationHistory.slice(-50), // Keep last 50 messages
        inferenceJourney: inferenceResult.inferenceJourney
      };
      
      this.userProfiles.set(userId, profile);
      await this.saveUserProfiles();
      
      return profile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Calculate compatibility between two hex codes
  calculateCompatibility(hexCode1, hexCode2) {
    const dims1 = this.parseHexCode(hexCode1);
    const dims2 = this.parseHexCode(hexCode2);
    
    // Calculate distances
    const hueDistance = this.calculateHueDistance(dims1.hue, dims2.hue);
    const manifestedDistance = Math.abs(dims1.manifested - dims2.manifested);
    const soulDistance = Math.abs(dims1.soul - dims2.soul);
    
    // Normalize distances (0-1)
    const normalizedHue = hueDistance / 180; // Max circular distance is 180°
    const normalizedManifested = manifestedDistance / 255;
    const normalizedSoul = soulDistance / 255;
    
    // Calculate weighted distance
    const totalDistance = Math.sqrt(
      (normalizedHue * this.compatibilityWeights.hue) ** 2 +
      (normalizedManifested * this.compatibilityWeights.manifested) ** 2 +
      (normalizedSoul * this.compatibilityWeights.soul) ** 2
    );
    
    // Convert to compatibility score (0-1)
    const compatibility = Math.max(0, 1 - totalDistance);
    
    return {
      score: compatibility,
      breakdown: {
        hue: 1 - normalizedHue,
        manifested: 1 - normalizedManifested,
        soul: 1 - normalizedSoul
      },
      distances: {
        hue: hueDistance,
        manifested: manifestedDistance,
        soul: soulDistance
      }
    };
  }

  // Calculate circular distance for hue (0-360°)
  calculateHueDistance(hue1, hue2) {
    const diff = Math.abs(hue1 - hue2);
    return Math.min(diff, 360 - diff);
  }

  // Find compatible matches for a user
  async findCompatibleMatches(userId, options = {}) {
    const userProfile = this.userProfiles.get(userId);
    if (!userProfile) {
      throw new Error('User profile not found');
    }
    
    const {
      minCompatibility = 0.6,
      maxResults = 100,
      includeComplementary = true,
      includeOpposites = false
    } = options;
    
    // In a real implementation, this would query a database
    // For now, we'll generate some sample matches
    const matches = [];
    
    // Generate sample compatible hex codes
    for (let i = 0; i < 1000; i++) {
      const sampleHex = this.generateRandomHexCode();
      const compatibility = this.calculateCompatibility(userProfile.humanHexCode, sampleHex);
      
      if (compatibility.score >= minCompatibility) {
        matches.push({
          hexCode: sampleHex,
          compatibility: compatibility.score,
          compatibilityBreakdown: compatibility.breakdown,
          matchType: this.determineMatchType(compatibility.score),
          userId: `sample_${i}` // In real app, this would be actual user ID
        });
      }
    }
    
    // Sort by compatibility score
    matches.sort((a, b) => b.compatibility - a.compatibility);
    
    return matches.slice(0, maxResults);
  }

  // Generate random hex code for testing
  generateRandomHexCode() {
    const h = Math.floor(Math.random() * 256);
    const m = Math.floor(Math.random() * 256);
    const s = Math.floor(Math.random() * 256);
    
    const toHex = (value) => value.toString(16).padStart(2, '0');
    return `#${toHex(h)}${toHex(m)}${toHex(s)}`.toUpperCase();
  }

  // Determine match type based on compatibility score
  determineMatchType(score) {
    if (score >= 0.8) return 'soulmate';
    if (score >= 0.7) return 'high_compatibility';
    if (score >= 0.6) return 'good_match';
    if (score >= 0.4) return 'complementary';
    return 'growth_oriented';
  }

  // Get user's hex code and profile
  getUserProfile(userId) {
    return this.userProfiles.get(userId);
  }

  // Update user profile based on new conversation
  async updateUserProfile(userId, newConversationData) {
    const existingProfile = this.userProfiles.get(userId);
    if (!existingProfile) {
      throw new Error('User profile not found');
    }
    
    // Add new conversation data
    existingProfile.conversationHistory.push(...newConversationData);
    
    // Re-analyze if enough new data
    if (newConversationData.length >= 10) {
      const updatedInference = await this.inferenceEngine.analyzeConversation(
        existingProfile.conversationHistory
      );
      
      // Update dimensions and hex code
      existingProfile.dimensions = updatedInference.dimensions;
      existingProfile.humanHexCode = this.generateHexCode(
        updatedInference.metaphysicalCore.hueValue,
        updatedInference.manifestedSelf.value,
        updatedInference.humanSoul.value
      );
      existingProfile.overallConfidence = updatedInference.overallConfidence;
      existingProfile.lastUpdated = new Date().toISOString();
      
      await this.saveUserProfiles();
    }
    
    return existingProfile;
  }

  // Get hex code statistics
  getHexCodeStats(hexCode) {
    const dims = this.parseHexCode(hexCode);
    const archetype = this.getArchetype(dims.hue);
    
    return {
      hexCode,
      dimensions: dims,
      archetype,
      rarity: this.calculateRarity(dims),
      description: this.generateDescription(dims, archetype)
    };
  }

  // Get archetype from hue value
  getArchetype(hue) {
    const archetypes = Object.entries(this.dimensions.metaphysicalCore.anchors);
    
    // Find closest archetype
    let closestArchetype = archetypes[0];
    let minDistance = this.calculateHueDistance(hue, 0);
    
    for (const [degree, name] of archetypes) {
      const distance = this.calculateHueDistance(hue, parseInt(degree));
      if (distance < minDistance) {
        minDistance = distance;
        closestArchetype = [degree, name];
      }
    }
    
    return {
      primary: closestArchetype[1],
      degree: parseInt(closestArchetype[0]),
      distance: minDistance
    };
  }

  // Calculate rarity of hex code combination
  calculateRarity(dims) {
    // Simplified rarity calculation based on extreme values
    const extremeness = Math.max(
      Math.abs(dims.manifested - 127.5) / 127.5,
      Math.abs(dims.soul - 127.5) / 127.5
    );
    
    return {
      score: extremeness,
      level: extremeness > 0.8 ? 'extremely_rare' : 
             extremeness > 0.6 ? 'rare' : 
             extremeness > 0.4 ? 'uncommon' : 'common'
    };
  }

  // Generate description of hex code
  generateDescription(dims, archetype) {
    const manifestedLevel = dims.manifested > 200 ? 'highly' : 
                           dims.manifested > 150 ? 'moderately' : 
                           dims.manifested > 100 ? 'somewhat' : 'minimally';
    
    const soulDepth = dims.soul > 200 ? 'profound' : 
                     dims.soul > 150 ? 'deep' : 
                     dims.soul > 100 ? 'moderate' : 'surface';
    
    return `A ${manifestedLevel} manifested ${archetype.primary.toLowerCase()} with ${soulDepth} soul depth. This combination suggests someone who expresses their core nature through ${manifestedLevel} engagement with the world while maintaining a ${soulDepth} connection to their inner essence.`;
  }

  // Save user profiles to storage
  async saveUserProfiles() {
    try {
      const profiles = Array.from(this.userProfiles.entries());
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(profiles));
    } catch (error) {
      console.error('Error saving user profiles:', error);
    }
  }

  // Load user profiles from storage
  async loadUserProfiles() {
    try {
      const stored = await AsyncStorage.getItem(this.storageKey);
      if (stored) {
        const profiles = JSON.parse(stored);
        this.userProfiles = new Map(profiles);
      }
    } catch (error) {
      console.error('Error loading user profiles:', error);
    }
  }

  // Clear all data
  async clearAllData() {
    this.userProfiles.clear();
    this.compatibilityCache.clear();
    await AsyncStorage.removeItem(this.storageKey);
  }
}

// Inference Engine for analyzing conversations
class InferenceEngine {
  constructor() {
    this.initialized = false;
    this.questionPhases = {
      surface: { range: [1, 20], focus: 'basic_traits' },
      layerPeeling: { range: [21, 60], focus: 'deeper_motivations' },
      coreExcavation: { range: [61, 100], focus: 'formative_experiences' },
      soulMapping: { range: [101, Infinity], focus: 'existential_essence' }
    };
  }

  async initialize() {
    this.initialized = true;
  }

  // Analyze conversation to infer human hex code
  async analyzeConversation(conversationHistory) {
    // This would use advanced NLP and AI analysis
    // For now, we'll use a simplified approach
    
    const analysis = {
      metaphysicalCore: await this.analyzeMetaphysicalCore(conversationHistory),
      manifestedSelf: await this.analyzeManifested(conversationHistory),
      humanSoul: await this.analyzeHumanSoul(conversationHistory),
      overallConfidence: 0.7,
      inferenceJourney: {
        currentPhase: 'layer_peeling',
        questionsAsked: conversationHistory.length,
        deepestLayerReached: 'motivational_patterns',
        nextInferenceTargets: ['existential_awareness', 'authenticity']
      }
    };
    
    return {
      dimensions: analysis,
      metaphysicalCore: analysis.metaphysicalCore,
      manifestedSelf: analysis.manifestedSelf,
      humanSoul: analysis.humanSoul,
      overallConfidence: analysis.overallConfidence,
      inferenceJourney: analysis.inferenceJourney
    };
  }

  // Analyze metaphysical core (hue)
  async analyzeMetaphysicalCore(conversationHistory) {
    // Simplified analysis - in reality would use advanced NLP
    const text = conversationHistory.join(' ').toLowerCase();
    
    let hueValue = 0;
    let confidence = 0.5;
    
    // Simple keyword matching for demo
    if (text.includes('think') || text.includes('analyze') || text.includes('understand')) {
      hueValue = 0; // Cognitive
      confidence = 0.7;
    } else if (text.includes('create') || text.includes('build') || text.includes('make')) {
      hueValue = 90; // Action/Creative
      confidence = 0.8;
    } else if (text.includes('feel') || text.includes('connect') || text.includes('relationship')) {
      hueValue = 180; // Relational/Emotional
      confidence = 0.75;
    } else if (text.includes('purpose') || text.includes('meaning') || text.includes('grow')) {
      hueValue = 270; // Purpose/Growth
      confidence = 0.8;
    }
    
    return {
      hueValue,
      hueDegrees: hueValue,
      confidence,
      dominantArchetype: this.getArchetypeName(hueValue),
      parameters: {
        coreMotivationalLanguage: { value: 'growth_oriented', confidence: 0.6 },
        problemSolvingApproach: { value: 'analytical', confidence: 0.7 }
      }
    };
  }

  // Analyze manifested self
  async analyzeManifested(conversationHistory) {
    // Simplified analysis
    const text = conversationHistory.join(' ').toLowerCase();
    
    let value = 128; // Default middle value
    let confidence = 0.6;
    
    // Adjust based on conversation cues
    if (text.includes('energy') || text.includes('excited') || text.includes('active')) {
      value += 50;
      confidence = 0.8;
    }
    if (text.includes('tired') || text.includes('overwhelmed') || text.includes('stressed')) {
      value -= 30;
      confidence = 0.7;
    }
    
    value = Math.max(0, Math.min(255, value));
    
    return {
      value,
      confidence,
      parameters: {
        socialEnergyPattern: { value: 0.5, confidence: 0.6 },
        emotionalResilience: { value: 0.7, confidence: 0.7 }
      }
    };
  }

  // Analyze human soul depth
  async analyzeHumanSoul(conversationHistory) {
    // Simplified analysis
    const text = conversationHistory.join(' ').toLowerCase();
    
    let value = 128; // Default middle value
    let confidence = 0.5;
    
    // Look for deeper themes
    if (text.includes('soul') || text.includes('spiritual') || text.includes('transcend')) {
      value += 60;
      confidence = 0.8;
    }
    if (text.includes('meaning') || text.includes('purpose') || text.includes('existence')) {
      value += 40;
      confidence = 0.7;
    }
    if (text.includes('authentic') || text.includes('true self') || text.includes('genuine')) {
      value += 30;
      confidence = 0.75;
    }
    
    value = Math.max(0, Math.min(255, value));
    
    return {
      value,
      confidence,
      parameters: {
        existentialAwareness: { value: 0.6, confidence: 0.6 },
        transcendenceCapacity: { value: 0.5, confidence: 0.5 }
      }
    };
  }

  // Get archetype name from hue value
  getArchetypeName(hue) {
    const archetypes = {
      0: 'Cognitive/Intellectual',
      45: 'Inventive/Analytical',
      90: 'Action/Creative',
      135: 'Empathetic/Collaborative',
      180: 'Relational/Emotional',
      225: 'Insightful/Transformative',
      270: 'Purpose/Growth',
      315: 'Contemplative/Visionary'
    };
    
    // Find closest archetype
    let closest = 0;
    let minDistance = Math.abs(hue - 0);
    
    for (const [degree, name] of Object.entries(archetypes)) {
      const distance = Math.abs(hue - parseInt(degree));
      if (distance < minDistance) {
        minDistance = distance;
        closest = parseInt(degree);
      }
    }
    
    return archetypes[closest];
  }
}

export default new HumanHexCodeMatcher();