// Harmony Algorithm Core Computation Module
// The definitive implementation of the 3D Human Color Solid personality mapping system
// Mathematical precision for 16.7 million unique personality combinations

/**
 * Core computation functions for the Harmony Algorithm
 * Converts personality parameters into a unique 3D Signature Code (#HHMMSS)
 */

export interface HarmonyDimensions {
  hue: number;          // 0-359.99 degrees (Metaphysical Core)
  manifested: number;   // 0-255 (Manifested Self)
  soul: number;         // 0-255 (Human/Soul Depth)
}

export interface ParameterWeights {
  [key: string]: number;
}

export interface AnchorPoint {
  angle: number;
  name: string;
  title: string;
  description: string;
}

/**
 * The 8 Primary Archetypes of the Harmony Algorithm
 * Each represents a fundamental approach to existence
 */
export const HARMONY_ARCHETYPES: AnchorPoint[] = [
  {
    angle: 0,
    name: 'Cognitive',
    title: 'The Analyst',
    description: 'Thought, logic, analysis - rational and factual processing'
  },
  {
    angle: 45,
    name: 'Visionary',
    title: 'The Innovator',
    description: 'Creative imagination, openness - inventive and future-focused'
  },
  {
    angle: 90,
    name: 'Relational',
    title: 'The Connector',
    description: 'Emotional attunement, empathy - warm and community-driven'
  },
  {
    angle: 135,
    name: 'Nurturing',
    title: 'The Harmonizer',
    description: 'Care, support, harmony - compassionate and conflict-averse'
  },
  {
    angle: 180,
    name: 'Purposeful',
    title: 'The Seeker',
    description: 'Meaning-seeking, values-driven - cause-oriented and principled'
  },
  {
    angle: 225,
    name: 'Driven',
    title: 'The Achiever',
    description: 'Ambition, will, achievement - assertive and goal-oriented'
  },
  {
    angle: 270,
    name: 'Experiential',
    title: 'The Explorer',
    description: 'Sensing, presence, immersion - adventurous and present-focused'
  },
  {
    angle: 315,
    name: 'Analytical',
    title: 'The Organizer',
    description: 'Systematic, organizing, detail - methodical and structured'
  }
];

/**
 * Converts degrees to radians for trigonometric calculations
 */
function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Converts radians to degrees and normalizes to [0, 360)
 */
function radiansToDegrees(radians: number): number {
  let degrees = radians * (180 / Math.PI);
  while (degrees < 0) degrees += 360;
  while (degrees >= 360) degrees -= 360;
  return degrees;
}

/**
 * Computes the Metaphysical Core (Hue) using circular statistics
 * This is the heart of the Harmony Algorithm's archetype calculation
 * 
 * @param anchorWeights - Weights for each of the 8 archetypes (0-1)
 * @param parameterInfluences - Additional parameter influences on the hue
 * @returns Hue value in degrees (0-359.99)
 */
export function computeMetaphysicalCore(
  anchorWeights: ParameterWeights,
  parameterInfluences: ParameterWeights = {}
): number {
  let sumSin = 0;
  let sumCos = 0;
  let totalWeight = 0;

  // Process archetype anchor points
  for (const archetype of HARMONY_ARCHETYPES) {
    const weight = anchorWeights[archetype.name.toLowerCase()] || 0;
    if (weight > 0) {
      const angleRad = degreesToRadians(archetype.angle);
      sumSin += weight * Math.sin(angleRad);
      sumCos += weight * Math.cos(angleRad);
      totalWeight += weight;
    }
  }

  // Apply parameter influences
  for (const [paramName, influence] of Object.entries(parameterInfluences)) {
    if (influence > 0) {
      // Map parameter influences to circular space
      const paramAngle = hashStringToAngle(paramName);
      const angleRad = degreesToRadians(paramAngle);
      sumSin += influence * Math.sin(angleRad);
      sumCos += influence * Math.cos(angleRad);
      totalWeight += influence;
    }
  }

  // Avoid division by zero
  if (totalWeight === 0) {
    return 0;
  }

  // Normalize by total weight
  sumSin /= totalWeight;
  sumCos /= totalWeight;

  // Compute final hue using atan2 for proper quadrant handling
  const hue = radiansToDegrees(Math.atan2(sumSin, sumCos));
  
  // Ensure precision to 2 decimal places
  return Math.round(hue * 100) / 100;
}

/**
 * Computes the Manifested Self dimension (0-255)
 * Represents how effectively someone expresses their inner nature
 * 
 * @param parameters - Weighted parameters contributing to manifestation
 * @returns Manifested Self value (0-255)
 */
export function computeManifestedSelf(parameters: ParameterWeights): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [paramName, value] of Object.entries(parameters)) {
    if (value >= 0 && value <= 100) {
      const weight = getParameterWeight(paramName, 'manifested');
      weightedSum += value * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) {
    return 128; // Default middle value
  }

  // Convert from 0-100 scale to 0-255 scale
  const manifestedValue = (weightedSum / totalWeight) * 2.55;
  
  // Clamp to valid range
  return Math.round(Math.max(0, Math.min(255, manifestedValue)));
}

/**
 * Computes the Human/Soul dimension (0-255)
 * Represents profound depth and spiritual essence
 * Uses square root scaling to emphasize higher depths
 * 
 * @param parameters - Weighted parameters contributing to soul depth
 * @returns Human/Soul value (0-255)
 */
export function computeHumanSoul(parameters: ParameterWeights): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [paramName, value] of Object.entries(parameters)) {
    if (value >= 0 && value <= 100) {
      const weight = getParameterWeight(paramName, 'soul');
      weightedSum += value * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) {
    return 128; // Default middle value
  }

  // Apply square root scaling to emphasize depth
  const rawValue = weightedSum / totalWeight;
  const soulValue = Math.sqrt(rawValue / 100) * 255;
  
  // Clamp to valid range
  return Math.round(Math.max(0, Math.min(255, soulValue)));
}

/**
 * Generates a complete Harmony Signature Code from all parameters
 * 
 * @param anchorWeights - Archetype weights for hue calculation
 * @param manifestedParams - Parameters for manifested self
 * @param soulParams - Parameters for soul depth
 * @param parameterInfluences - Additional influences on hue
 * @returns Complete Harmony dimensions
 */
export function generateHarmonyDimensions(
  anchorWeights: ParameterWeights,
  manifestedParams: ParameterWeights,
  soulParams: ParameterWeights,
  parameterInfluences: ParameterWeights = {}
): HarmonyDimensions {
  return {
    hue: computeMetaphysicalCore(anchorWeights, parameterInfluences),
    manifested: computeManifestedSelf(manifestedParams),
    soul: computeHumanSoul(soulParams)
  };
}

/**
 * Converts Harmony dimensions to a unique hex signature code
 * Format: #HHMMSS where HH=hue, MM=manifested, SS=soul
 * 
 * @param dimensions - The three dimensional values
 * @returns Hex signature code string
 */
export function dimensionsToHexCode(dimensions: HarmonyDimensions): string {
  // Convert hue (0-359.99) to 0-255 range
  const hueHex = Math.round((dimensions.hue / 360) * 255);
  
  // Convert to 2-digit hex values
  const h = hueHex.toString(16).padStart(2, '0');
  const m = dimensions.manifested.toString(16).padStart(2, '0');
  const s = dimensions.soul.toString(16).padStart(2, '0');
  
  return `#${h}${m}${s}`.toUpperCase();
}

/**
 * Converts a hex signature code back to dimensions
 * 
 * @param hexCode - Hex signature code (e.g., "#A7B3C9")
 * @returns Harmony dimensions
 */
export function hexCodeToDimensions(hexCode: string): HarmonyDimensions {
  const hex = hexCode.replace('#', '');
  
  if (hex.length !== 6) {
    throw new Error('Invalid hex code format. Must be #HHMMSS');
  }
  
  const hueHex = parseInt(hex.substr(0, 2), 16);
  const manifestedHex = parseInt(hex.substr(2, 2), 16);
  const soulHex = parseInt(hex.substr(4, 2), 16);
  
  return {
    hue: (hueHex / 255) * 360,
    manifested: manifestedHex,
    soul: soulHex
  };
}

/**
 * Generates a complete Harmony Signature Code from parameters
 * This is the main entry point for the Harmony Algorithm
 * 
 * @param anchorWeights - Archetype weights
 * @param manifestedParams - Manifested self parameters
 * @param soulParams - Soul depth parameters
 * @param parameterInfluences - Additional hue influences
 * @returns Complete hex signature code
 */
export function generateHarmonySignature(
  anchorWeights: ParameterWeights,
  manifestedParams: ParameterWeights,
  soulParams: ParameterWeights,
  parameterInfluences: ParameterWeights = {}
): string {
  const dimensions = generateHarmonyDimensions(
    anchorWeights,
    manifestedParams,
    soulParams,
    parameterInfluences
  );
  
  return dimensionsToHexCode(dimensions);
}

/**
 * Calculates the circular distance between two hue values
 * Accounts for the circular nature of the hue dimension
 * 
 * @param hue1 - First hue value (0-359.99)
 * @param hue2 - Second hue value (0-359.99)
 * @returns Circular distance (0-180)
 */
export function calculateHueDistance(hue1: number, hue2: number): number {
  const diff = Math.abs(hue1 - hue2);
  return Math.min(diff, 360 - diff);
}

/**
 * Calculates the 3D distance between two harmony signatures
 * Uses weighted Euclidean distance in the harmony space
 * 
 * @param sig1 - First signature code
 * @param sig2 - Second signature code
 * @param weights - Dimensional weights [hue, manifested, soul]
 * @returns Weighted distance value
 */
export function calculateHarmonyDistance(
  sig1: string,
  sig2: string,
  weights: [number, number, number] = [2, 1, 1.5]
): number {
  const dims1 = hexCodeToDimensions(sig1);
  const dims2 = hexCodeToDimensions(sig2);
  
  // Calculate individual distances
  const hueDistance = calculateHueDistance(dims1.hue, dims2.hue);
  const manifestedDistance = Math.abs(dims1.manifested - dims2.manifested);
  const soulDistance = Math.abs(dims1.soul - dims2.soul);
  
  // Apply weights and calculate Euclidean distance
  const weightedDistance = Math.sqrt(
    (hueDistance * weights[0]) ** 2 +
    (manifestedDistance * weights[1]) ** 2 +
    (soulDistance * weights[2]) ** 2
  );
  
  return weightedDistance;
}

/**
 * Converts distance to compatibility score (0-100%)
 * 
 * @param distance - Weighted distance value
 * @param maxDistance - Maximum possible distance
 * @returns Compatibility score (0-100)
 */
export function distanceToCompatibilityScore(
  distance: number,
  maxDistance: number = 500 // Empirically determined max distance
): number {
  const score = 100 * (1 - distance / maxDistance);
  return Math.max(0, Math.min(100, score));
}

/**
 * Determines the primary archetype from a hue value
 * 
 * @param hue - Hue value (0-359.99)
 * @returns Primary archetype information
 */
export function getArchetypeFromHue(hue: number): AnchorPoint & { distance: number } {
  let closestArchetype = HARMONY_ARCHETYPES[0];
  let minDistance = calculateHueDistance(hue, 0);
  
  for (const archetype of HARMONY_ARCHETYPES) {
    const distance = calculateHueDistance(hue, archetype.angle);
    if (distance < minDistance) {
      minDistance = distance;
      closestArchetype = archetype;
    }
  }
  
  return {
    ...closestArchetype,
    distance: minDistance
  };
}

/**
 * Validates that all dimension values are within valid ranges
 * 
 * @param dimensions - Harmony dimensions to validate
 * @returns True if valid, false otherwise
 */
export function validateDimensions(dimensions: HarmonyDimensions): boolean {
  return (
    dimensions.hue >= 0 && dimensions.hue < 360 &&
    dimensions.manifested >= 0 && dimensions.manifested <= 255 &&
    dimensions.soul >= 0 && dimensions.soul <= 255
  );
}

/**
 * Validates hex code format
 * 
 * @param hexCode - Hex code to validate
 * @returns True if valid format, false otherwise
 */
export function validateHexCode(hexCode: string): boolean {
  const hexPattern = /^#[0-9A-F]{6}$/i;
  return hexPattern.test(hexCode);
}

/**
 * Utility function to hash a string to an angle (for parameter influences)
 * 
 * @param str - String to hash
 * @returns Angle in degrees (0-359)
 */
function hashStringToAngle(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 360;
}

/**
 * Gets the weight for a parameter based on its name and dimension
 * This would be expanded with the full parameter mapping
 * 
 * @param paramName - Parameter name
 * @param dimension - Dimension type ('manifested' or 'soul')
 * @returns Weight value
 */
function getParameterWeight(paramName: string, dimension: 'manifested' | 'soul'): number {
  // This would be expanded with the full parameter mapping from your 50-parameter system
  const defaultWeights = {
    manifested: {
      social_energy: 0.12,
      emotional_regulation: 0.10,
      life_satisfaction: 0.09,
      adaptive_flexibility: 0.08,
      proactive_initiative: 0.08,
      authentic_expression: 0.07,
      interpersonal_effectiveness: 0.07,
      creative_manifestation: 0.06,
      confidence_resonance: 0.06,
      boundary_definition: 0.05,
      vulnerability_integration: 0.05,
      goal_achievement: 0.04,
      presence_quality: 0.04,
      communication_clarity: 0.04,
      emotional_intelligence: 0.03,
      integrated_wholeness: 0.02
    },
    soul: {
      existential_awareness: 0.10,
      transcendence_capacity: 0.09,
      authentic_core_access: 0.09,
      moral_integration: 0.08,
      unconditional_love: 0.08,
      wisdom_integration: 0.07,
      spiritual_consciousness: 0.07,
      compassionate_depth: 0.06,
      inner_peace: 0.06,
      truth_embodiment: 0.05,
      sacred_recognition: 0.05,
      forgiveness_mastery: 0.04,
      presence_depth: 0.04,
      intuitive_knowing: 0.04,
      unity_consciousness: 0.04,
      divine_essence: 0.04
    }
  };

  return defaultWeights[dimension][paramName] || 0.05; // Default weight
}

/**
 * Calculates the rarity score for a harmony signature
 * 
 * @param dimensions - Harmony dimensions
 * @returns Rarity score (0-1, where 1 is most rare)
 */
export function calculateRarityScore(dimensions: HarmonyDimensions): number {
  const archetype = getArchetypeFromHue(dimensions.hue);
  
  // Archetype rarity (some are rarer than others)
  const archetypeRarity = getArchetypeRarity(archetype.name);
  
  // Extremeness in manifested and soul dimensions
  const manifestedExtremeness = Math.abs(dimensions.manifested - 127.5) / 127.5;
  const soulExtremeness = Math.abs(dimensions.soul - 127.5) / 127.5;
  
  // Combined rarity score
  const combinedRarity = (archetypeRarity + manifestedExtremeness + soulExtremeness) / 3;
  
  return Math.min(1, combinedRarity);
}

/**
 * Gets the rarity score for a specific archetype
 * 
 * @param archetypeName - Name of the archetype
 * @returns Rarity score (0-1)
 */
function getArchetypeRarity(archetypeName: string): number {
  const rarityMap: { [key: string]: number } = {
    'Cognitive': 0.7,      // Moderately rare
    'Visionary': 0.95,     // Extremely rare
    'Relational': 0.4,     // Most common
    'Nurturing': 0.5,      // Common
    'Purposeful': 0.7,     // Moderately rare
    'Driven': 0.6,         // Moderately common
    'Experiential': 0.6,   // Moderately common
    'Analytical': 0.8      // Rare
  };
  
  return rarityMap[archetypeName] || 0.5;
}

/**
 * Generates a human-readable description of a harmony signature
 * 
 * @param hexCode - Harmony signature code
 * @returns Descriptive analysis
 */
export function generateSignatureDescription(hexCode: string): {
  archetype: string;
  manifestation: string;
  soulDepth: string;
  rarity: string;
  fullDescription: string;
} {
  const dimensions = hexCodeToDimensions(hexCode);
  const archetype = getArchetypeFromHue(dimensions.hue);
  const rarity = calculateRarityScore(dimensions);
  
  const manifestationLevel = dimensions.manifested > 200 ? 'highly' : 
                            dimensions.manifested > 150 ? 'moderately' : 
                            dimensions.manifested > 100 ? 'somewhat' : 'minimally';
  
  const soulDepthLevel = dimensions.soul > 200 ? 'profound' : 
                        dimensions.soul > 150 ? 'deep' : 
                        dimensions.soul > 100 ? 'moderate' : 'surface';
  
  const rarityLevel = rarity > 0.8 ? 'legendary' : 
                     rarity > 0.6 ? 'rare' : 
                     rarity > 0.4 ? 'uncommon' : 'common';
  
  return {
    archetype: `${archetype.title} - ${archetype.name}`,
    manifestation: `${manifestationLevel} manifested`,
    soulDepth: `${soulDepthLevel} soul depth`,
    rarity: `${rarityLevel} combination`,
    fullDescription: `A ${manifestationLevel} manifested ${archetype.name.toLowerCase()} with ${soulDepthLevel} soul depth. This ${rarityLevel} combination represents someone who ${archetype.description.toLowerCase()} while expressing their nature with ${manifestationLevel} intensity and maintaining a ${soulDepthLevel} connection to their essential self.`
  };
}