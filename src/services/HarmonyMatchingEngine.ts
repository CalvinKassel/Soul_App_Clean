// Harmony Compatibility Matching Engine
// Advanced 3D compatibility matching with probabilistic filtering and "light bulb" universe

import {
  HarmonyUserProfile,
  CompatibilityMatch,
  MatchingOptions,
  MatchingResult,
  MockPartnerProfile,
  MatchType,
  HarmonyZone,
  HarmonyError,
  HarmonyErrorType
} from '../types/HarmonyTypes';
import {
  calculateHarmonyDistance,
  distanceToCompatibilityScore,
  hexCodeToDimensions,
  getArchetypeFromHue,
  HARMONY_ARCHETYPES
} from './HarmonyCore';

/**
 * Spatial indexing structure for efficient matching
 */
interface SpatialIndex {
  add(profile: MockPartnerProfile): void;
  findInRadius(center: MockPartnerProfile, radius: number): MockPartnerProfile[];
  findInRange(
    hueRange: [number, number],
    manifestedRange: [number, number],
    soulRange: [number, number]
  ): MockPartnerProfile[];
  size(): number;
}

/**
 * Simple K-D Tree implementation for 3D harmony space
 */
class HarmonyKDTree implements SpatialIndex {
  private root: KDNode | null = null;
  private profileCount = 0;

  add(profile: MockPartnerProfile): void {
    this.root = this.insertNode(this.root, profile, 0);
    this.profileCount++;
  }

  findInRadius(center: MockPartnerProfile, radius: number): MockPartnerProfile[] {
    const results: MockPartnerProfile[] = [];
    this.searchRadius(this.root, center, radius, results, 0);
    return results;
  }

  findInRange(
    hueRange: [number, number],
    manifestedRange: [number, number],
    soulRange: [number, number]
  ): MockPartnerProfile[] {
    const results: MockPartnerProfile[] = [];
    this.searchRange(this.root, hueRange, manifestedRange, soulRange, results, 0);
    return results;
  }

  size(): number {
    return this.profileCount;
  }

  private insertNode(node: KDNode | null, profile: MockPartnerProfile, depth: number): KDNode {
    if (!node) {
      return new KDNode(profile);
    }

    const dimension = depth % 3;
    const nodeValue = this.getDimensionValue(node.profile, dimension);
    const profileValue = this.getDimensionValue(profile, dimension);

    if (profileValue < nodeValue) {
      node.left = this.insertNode(node.left, profile, depth + 1);
    } else {
      node.right = this.insertNode(node.right, profile, depth + 1);
    }

    return node;
  }

  private searchRadius(
    node: KDNode | null,
    center: MockPartnerProfile,
    radius: number,
    results: MockPartnerProfile[],
    depth: number
  ): void {
    if (!node) return;

    const distance = calculateHarmonyDistance(center.signatureCode, node.profile.signatureCode);
    if (distance <= radius) {
      results.push(node.profile);
    }

    const dimension = depth % 3;
    const centerValue = this.getDimensionValue(center, dimension);
    const nodeValue = this.getDimensionValue(node.profile, dimension);
    const dimensionDistance = Math.abs(centerValue - nodeValue);

    if (centerValue < nodeValue) {
      this.searchRadius(node.left, center, radius, results, depth + 1);
      if (dimensionDistance <= radius) {
        this.searchRadius(node.right, center, radius, results, depth + 1);
      }
    } else {
      this.searchRadius(node.right, center, radius, results, depth + 1);
      if (dimensionDistance <= radius) {
        this.searchRadius(node.left, center, radius, results, depth + 1);
      }
    }
  }

  private searchRange(
    node: KDNode | null,
    hueRange: [number, number],
    manifestedRange: [number, number],
    soulRange: [number, number],
    results: MockPartnerProfile[],
    depth: number
  ): void {
    if (!node) return;

    const { hue, manifested, soul } = node.profile.dimensions;
    
    if (
      this.isInRange(hue, hueRange) &&
      this.isInRange(manifested, manifestedRange) &&
      this.isInRange(soul, soulRange)
    ) {
      results.push(node.profile);
    }

    const dimension = depth % 3;
    const ranges = [hueRange, manifestedRange, soulRange];
    const currentRange = ranges[dimension];
    const nodeValue = this.getDimensionValue(node.profile, dimension);

    if (currentRange[0] <= nodeValue) {
      this.searchRange(node.left, hueRange, manifestedRange, soulRange, results, depth + 1);
    }
    if (currentRange[1] >= nodeValue) {
      this.searchRange(node.right, hueRange, manifestedRange, soulRange, results, depth + 1);
    }
  }

  private getDimensionValue(profile: MockPartnerProfile, dimension: number): number {
    switch (dimension) {
      case 0: return profile.dimensions.hue;
      case 1: return profile.dimensions.manifested;
      case 2: return profile.dimensions.soul;
      default: return 0;
    }
  }

  private isInRange(value: number, range: [number, number]): boolean {
    return value >= range[0] && value <= range[1];
  }
}

/**
 * K-D Tree node
 */
class KDNode {
  constructor(
    public profile: MockPartnerProfile,
    public left: KDNode | null = null,
    public right: KDNode | null = null
  ) {}
}

/**
 * Harmony Matching Engine - The heart of compatibility computation
 */
export class HarmonyMatchingEngine {
  private spatialIndex: SpatialIndex;
  private profileCache: Map<string, MockPartnerProfile> = new Map();
  private compatibilityCache: Map<string, CompatibilityMatch> = new Map();
  private initialized = false;

  constructor() {
    this.spatialIndex = new HarmonyKDTree();
  }

  /**
   * Initialize the matching engine
   */
  async initialize(): Promise<void> {
    try {
      // Load initial mock profiles for development
      await this.loadMockProfiles();
      this.initialized = true;
    } catch (error) {
      throw new HarmonyError(
        HarmonyErrorType.COMPATIBILITY_ERROR,
        'Failed to initialize matching engine',
        error
      );
    }
  }

  /**
   * Find compatible matches for a user using the "light bulb" filtering system
   */
  async findCompatibleMatches(
    userProfile: HarmonyUserProfile,
    options: MatchingOptions
  ): Promise<MatchingResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    const totalCandidates = this.spatialIndex.size();
    
    try {
      // Phase 1: Dimensional filtering (turn off incompatible light bulbs)
      const dimensionalCandidates = this.performDimensionalFiltering(userProfile, options);
      
      // Phase 2: Probabilistic filtering (apply user's probability ranges)
      const probabilisticCandidates = this.performProbabilisticFiltering(
        userProfile,
        dimensionalCandidates,
        options
      );
      
      // Phase 3: Compatibility scoring and ranking
      const scoredMatches = await this.scoreAndRankCandidates(
        userProfile,
        probabilisticCandidates,
        options
      );
      
      // Phase 4: Apply harmony zones and final filtering
      const finalMatches = this.applyHarmonyZones(scoredMatches, options);
      
      // Phase 5: Detect and boost complementary anomalies
      const enhancedMatches = this.detectComplementaryAnomalies(
        userProfile,
        finalMatches,
        options
      );
      
      const searchTime = Date.now() - startTime;
      
      return {
        matches: enhancedMatches.slice(0, options.maxResults),
        totalCandidates,
        filteredCandidates: probabilisticCandidates.length,
        searchMetrics: {
          searchTime,
          filtersApplied: this.getAppliedFilters(options),
          averageCompatibility: this.calculateAverageCompatibility(enhancedMatches),
          topMatchScore: enhancedMatches.length > 0 ? enhancedMatches[0].compatibilityScore : 0
        }
      };
    } catch (error) {
      throw new HarmonyError(
        HarmonyErrorType.COMPATIBILITY_ERROR,
        'Failed to find compatible matches',
        error
      );
    }
  }

  /**
   * Phase 1: Dimensional filtering using spatial indexing
   */
  private performDimensionalFiltering(
    userProfile: HarmonyUserProfile,
    options: MatchingOptions
  ): MockPartnerProfile[] {
    const userDimensions = hexCodeToDimensions(userProfile.signatureCode);
    
    // Calculate search ranges based on user preferences and probability ranges
    const hueRange = this.calculateHueRange(userProfile, options);
    const manifestedRange = this.calculateManifestRange(userProfile, options);
    const soulRange = this.calculateSoulRange(userProfile, options);
    
    // Use spatial index for efficient range query
    return this.spatialIndex.findInRange(hueRange, manifestedRange, soulRange);
  }

  /**
   * Phase 2: Probabilistic filtering using user's parameter uncertainty
   */
  private performProbabilisticFiltering(
    userProfile: HarmonyUserProfile,
    candidates: MockPartnerProfile[],
    options: MatchingOptions
  ): MockPartnerProfile[] {
    return candidates.filter(candidate => {
      // Check archetype compatibility
      if (options.preferredArchetypes.length > 0) {
        const candidateArchetype = getArchetypeFromHue(candidate.dimensions.hue);
        if (!options.preferredArchetypes.includes(candidateArchetype.name)) {
          return false;
        }
      }
      
      // Check excluded archetypes
      if (options.excludedArchetypes.length > 0) {
        const candidateArchetype = getArchetypeFromHue(candidate.dimensions.hue);
        if (options.excludedArchetypes.includes(candidateArchetype.name)) {
          return false;
        }
      }
      
      // Check manifested self range
      if (candidate.dimensions.manifested < options.manifestedRange[0] ||
          candidate.dimensions.manifested > options.manifestedRange[1]) {
        return false;
      }
      
      // Check soul depth range
      if (candidate.dimensions.soul < options.soulDepthRange[0] ||
          candidate.dimensions.soul > options.soulDepthRange[1]) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Phase 3: Score and rank candidates
   */
  private async scoreAndRankCandidates(
    userProfile: HarmonyUserProfile,
    candidates: MockPartnerProfile[],
    options: MatchingOptions
  ): Promise<CompatibilityMatch[]> {
    const scoredMatches: CompatibilityMatch[] = [];
    
    for (const candidate of candidates) {
      const cacheKey = `${userProfile.signatureCode}-${candidate.signatureCode}`;
      
      let match = this.compatibilityCache.get(cacheKey);
      if (!match) {
        match = await this.calculateCompatibilityMatch(userProfile, candidate);
        this.compatibilityCache.set(cacheKey, match);
      }
      
      // Apply minimum compatibility filter
      if (match.compatibilityScore >= options.minCompatibility) {
        scoredMatches.push(match);
      }
    }
    
    // Sort by compatibility score (descending)
    scoredMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    
    return scoredMatches;
  }

  /**
   * Phase 4: Apply harmony zones
   */
  private applyHarmonyZones(
    matches: CompatibilityMatch[],
    options: MatchingOptions
  ): CompatibilityMatch[] {
    return matches.filter(match => {
      return options.harmonyZones.includes(match.harmonyZone);
    });
  }

  /**
   * Phase 5: Detect and boost complementary anomalies
   */
  private detectComplementaryAnomalies(
    userProfile: HarmonyUserProfile,
    matches: CompatibilityMatch[],
    options: MatchingOptions
  ): CompatibilityMatch[] {
    if (!options.includeComplementary) {
      return matches;
    }
    
    const userDimensions = hexCodeToDimensions(userProfile.signatureCode);
    const userArchetype = getArchetypeFromHue(userDimensions.hue);
    
    return matches.map(match => {
      const candidateDimensions = hexCodeToDimensions(match.signatureCode);
      const candidateArchetype = getArchetypeFromHue(candidateDimensions.hue);
      
      // Check for complementary archetype pairs
      if (this.isComplementaryArchetype(userArchetype.name, candidateArchetype.name)) {
        // Check if other dimensions are compatible
        const manifestedDiff = Math.abs(userDimensions.manifested - candidateDimensions.manifested);
        const soulDiff = Math.abs(userDimensions.soul - candidateDimensions.soul);
        
        if (manifestedDiff < 100 && soulDiff < 100) {
          // Boost compatibility score for complementary match
          match.compatibilityScore = Math.min(100, match.compatibilityScore * 1.2);
          match.compatibilityBreakdown.complementarity = 1.2;
          match.isComplementaryMatch = true;
          match.matchReason = `Complementary archetype pairing: ${userArchetype.name} + ${candidateArchetype.name}`;
        }
      }
      
      return match;
    });
  }

  /**
   * Calculate detailed compatibility between two users
   */
  private async calculateCompatibilityMatch(
    userProfile: HarmonyUserProfile,
    candidate: MockPartnerProfile
  ): Promise<CompatibilityMatch> {
    const userDimensions = hexCodeToDimensions(userProfile.signatureCode);
    const candidateDimensions = candidate.dimensions;
    
    // Calculate individual dimensional distances
    const hueDistance = this.calculateCircularDistance(userDimensions.hue, candidateDimensions.hue, 360);
    const manifestedDistance = Math.abs(userDimensions.manifested - candidateDimensions.manifested);
    const soulDistance = Math.abs(userDimensions.soul - candidateDimensions.soul);
    
    // Calculate weighted overall distance
    const weightedDistance = calculateHarmonyDistance(
      userProfile.signatureCode,
      candidate.signatureCode
    );
    
    // Convert to compatibility score
    const compatibilityScore = distanceToCompatibilityScore(weightedDistance);
    
    // Calculate dimensional compatibility scores
    const hueAlignment = 1 - (hueDistance / 180);
    const manifestedAlignment = 1 - (manifestedDistance / 255);
    const soulAlignment = 1 - (soulDistance / 255);
    
    // Calculate parameter-level compatibility if available
    const parameterLevelCompatibility = this.calculateParameterLevelCompatibility(
      userProfile,
      candidate
    );
    
    // Determine match type and harmony zone
    const matchType = this.determineMatchType(compatibilityScore);
    const harmonyZone = this.determineHarmonyZone(compatibilityScore);
    
    return {
      targetUserId: candidate.userId,
      signatureCode: candidate.signatureCode,
      compatibilityScore,
      compatibilityBreakdown: {
        dimensional: compatibilityScore,
        parameterLevel: parameterLevelCompatibility,
        complementarity: 1.0,
        hueAlignment,
        manifestedAlignment,
        soulAlignment
      },
      distance: {
        hue: hueDistance,
        manifested: manifestedDistance,
        soul: soulDistance,
        weighted: weightedDistance
      },
      matchType,
      isComplementaryMatch: false,
      matchReason: this.generateMatchReason(userProfile, candidate, compatibilityScore),
      harmonyZone
    };
  }

  /**
   * Calculate parameter-level compatibility
   */
  private calculateParameterLevelCompatibility(
    userProfile: HarmonyUserProfile,
    candidate: MockPartnerProfile
  ): number {
    // This would use detailed parameter comparison
    // For now, return a basic compatibility score
    return 0.75;
  }

  /**
   * Utility methods
   */
  private calculateHueRange(
    userProfile: HarmonyUserProfile,
    options: MatchingOptions
  ): [number, number] {
    const userDimensions = hexCodeToDimensions(userProfile.signatureCode);
    const baseHue = userDimensions.hue;
    
    // Use probability range from metaphysical core if available
    const probRange = userProfile.dimensions.metaphysicalCore.probRange;
    const rangePadding = options.includeComplementary ? 60 : 30;
    
    return [
      Math.max(0, baseHue - rangePadding),
      Math.min(360, baseHue + rangePadding)
    ];
  }

  private calculateManifestRange(
    userProfile: HarmonyUserProfile,
    options: MatchingOptions
  ): [number, number] {
    return options.manifestedRange;
  }

  private calculateSoulRange(
    userProfile: HarmonyUserProfile,
    options: MatchingOptions
  ): [number, number] {
    return options.soulDepthRange;
  }

  private calculateCircularDistance(value1: number, value2: number, max: number): number {
    const diff = Math.abs(value1 - value2);
    return Math.min(diff, max - diff);
  }

  private determineMatchType(compatibilityScore: number): MatchType {
    if (compatibilityScore >= 90) return MatchType.SOULMATE;
    if (compatibilityScore >= 80) return MatchType.HIGH_COMPATIBILITY;
    if (compatibilityScore >= 70) return MatchType.GOOD_MATCH;
    if (compatibilityScore >= 60) return MatchType.COMPLEMENTARY;
    if (compatibilityScore >= 50) return MatchType.GROWTH_ORIENTED;
    if (compatibilityScore >= 40) return MatchType.EXPLORATORY;
    return MatchType.INCOMPATIBLE;
  }

  private determineHarmonyZone(compatibilityScore: number): HarmonyZone {
    if (compatibilityScore >= 80) return HarmonyZone.INNER;
    if (compatibilityScore >= 60) return HarmonyZone.MIDDLE;
    if (compatibilityScore >= 40) return HarmonyZone.OUTER;
    return HarmonyZone.EXCLUDED;
  }

  private isComplementaryArchetype(archetype1: string, archetype2: string): boolean {
    const complementaryPairs: { [key: string]: string } = {
      'Cognitive': 'Relational',
      'Relational': 'Cognitive',
      'Visionary': 'Analytical',
      'Analytical': 'Visionary',
      'Nurturing': 'Driven',
      'Driven': 'Nurturing',
      'Purposeful': 'Experiential',
      'Experiential': 'Purposeful'
    };
    
    return complementaryPairs[archetype1] === archetype2;
  }

  private generateMatchReason(
    userProfile: HarmonyUserProfile,
    candidate: MockPartnerProfile,
    compatibilityScore: number
  ): string {
    const userArchetype = getArchetypeFromHue(hexCodeToDimensions(userProfile.signatureCode).hue);
    const candidateArchetype = getArchetypeFromHue(candidate.dimensions.hue);
    
    if (compatibilityScore >= 90) {
      return `Exceptional harmony with ${candidateArchetype.name} archetype`;
    } else if (compatibilityScore >= 80) {
      return `Strong compatibility across all dimensions`;
    } else if (compatibilityScore >= 70) {
      return `Good alignment with complementary strengths`;
    } else if (compatibilityScore >= 60) {
      return `Balanced partnership potential`;
    } else {
      return `Growth-oriented connection`;
    }
  }

  private getAppliedFilters(options: MatchingOptions): string[] {
    const filters: string[] = [];
    
    if (options.minCompatibility > 0) {
      filters.push(`minCompatibility: ${options.minCompatibility}%`);
    }
    
    if (options.preferredArchetypes.length > 0) {
      filters.push(`preferredArchetypes: ${options.preferredArchetypes.join(', ')}`);
    }
    
    if (options.excludedArchetypes.length > 0) {
      filters.push(`excludedArchetypes: ${options.excludedArchetypes.join(', ')}`);
    }
    
    if (options.soulDepthRange[0] > 0 || options.soulDepthRange[1] < 255) {
      filters.push(`soulDepthRange: ${options.soulDepthRange[0]}-${options.soulDepthRange[1]}`);
    }
    
    if (options.manifestedRange[0] > 0 || options.manifestedRange[1] < 255) {
      filters.push(`manifestedRange: ${options.manifestedRange[0]}-${options.manifestedRange[1]}`);
    }
    
    return filters;
  }

  private calculateAverageCompatibility(matches: CompatibilityMatch[]): number {
    if (matches.length === 0) return 0;
    
    const total = matches.reduce((sum, match) => sum + match.compatibilityScore, 0);
    return total / matches.length;
  }

  /**
   * Load mock profiles for development and testing
   */
  private async loadMockProfiles(): Promise<void> {
    // Generate diverse mock profiles across the harmony space
    const mockProfiles: MockPartnerProfile[] = [];
    
    for (let i = 0; i < 10000; i++) {
      const profile = this.generateRandomMockProfile(`mock_${i}`);
      mockProfiles.push(profile);
      this.spatialIndex.add(profile);
      this.profileCache.set(profile.userId, profile);
    }
  }

  /**
   * Generate a random mock profile for testing
   */
  private generateRandomMockProfile(userId: string): MockPartnerProfile {
    const hue = Math.random() * 360;
    const manifested = Math.floor(Math.random() * 256);
    const soul = Math.floor(Math.random() * 256);
    
    const dimensions = { hue, manifested, soul };
    const archetype = getArchetypeFromHue(hue);
    
    // Convert to hex code
    const hueHex = Math.round((hue / 360) * 255);
    const h = hueHex.toString(16).padStart(2, '0');
    const m = manifested.toString(16).padStart(2, '0');
    const s = soul.toString(16).padStart(2, '0');
    const signatureCode = `#${h}${m}${s}`.toUpperCase();
    
    return {
      userId,
      signatureCode,
      dimensions,
      archetype: archetype.name,
      manifestedLevel: manifested > 170 ? 'high' : manifested > 85 ? 'medium' : 'low',
      soulDepth: soul > 200 ? 'profound' : soul > 150 ? 'deep' : soul > 100 ? 'moderate' : 'surface',
      tags: [archetype.name.toLowerCase(), `manifested_${manifested > 128 ? 'high' : 'low'}`]
    };
  }

  /**
   * Add a real user profile to the matching pool
   */
  async addUserToPool(userProfile: HarmonyUserProfile): Promise<void> {
    const mockProfile: MockPartnerProfile = {
      userId: userProfile.userId,
      signatureCode: userProfile.signatureCode,
      dimensions: hexCodeToDimensions(userProfile.signatureCode),
      archetype: getArchetypeFromHue(hexCodeToDimensions(userProfile.signatureCode).hue).name,
      manifestedLevel: this.categorizeManifestedLevel(hexCodeToDimensions(userProfile.signatureCode).manifested),
      soulDepth: this.categorizeSoulDepth(hexCodeToDimensions(userProfile.signatureCode).soul),
      tags: []
    };
    
    this.spatialIndex.add(mockProfile);
    this.profileCache.set(userProfile.userId, mockProfile);
  }

  /**
   * Remove a user from the matching pool
   */
  async removeUserFromPool(userId: string): Promise<void> {
    this.profileCache.delete(userId);
    // Note: K-D tree doesn't support efficient deletion
    // In a production system, this would be rebuilt periodically
  }

  /**
   * Get matching statistics
   */
  getMatchingStats(): {
    totalProfiles: number;
    cacheSize: number;
    averageSearchTime: number;
  } {
    return {
      totalProfiles: this.spatialIndex.size(),
      cacheSize: this.compatibilityCache.size,
      averageSearchTime: 0 // Would be calculated from historical data
    };
  }

  private categorizeManifestedLevel(manifested: number): 'low' | 'medium' | 'high' {
    if (manifested > 170) return 'high';
    if (manifested > 85) return 'medium';
    return 'low';
  }

  private categorizeSoulDepth(soul: number): 'surface' | 'moderate' | 'deep' | 'profound' {
    if (soul > 200) return 'profound';
    if (soul > 150) return 'deep';
    if (soul > 100) return 'moderate';
    return 'surface';
  }
}

export default HarmonyMatchingEngine;