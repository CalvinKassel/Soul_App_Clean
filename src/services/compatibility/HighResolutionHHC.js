// High-Resolution Human Hex Code System
// Scientifically-structured 256-dimensional personality vector based on NEO-PI-R
// Each dimension is precisely defined with psychological meaning

class HighResolutionHHC {
  constructor() {
    this.vectorSize = 256;
    this.dimensionMap = this.initializeDimensionMap();
    this.facetDescriptions = this.initializeFacetDescriptions();
  }

  // Initialize the complete 256-dimension mapping with scientific precision
  initializeDimensionMap() {
    return {
      // PERSONALITY CORE (0-59): Big Five + Meta-Traits
      personalityCore: {
        range: [0, 59],
        categories: {
          openness: {
            range: [0, 9],
            facets: {
              imagination: 0,        // Fantasy, daydreaming, creative visualization
              artisticInterest: 1,   // Appreciation for art, beauty, aesthetics
              emotionality: 2,       // Receptiveness to inner emotional states
              adventurousness: 3,    // Eagerness for new experiences, variety
              intellect: 4,          // Love of learning, philosophical thinking
              liberalism: 5,         // Readiness to challenge authority/tradition
              creativity: 6,         // Original thinking, novel solutions
              curiosity: 7,          // Questioning nature, exploration drive
              abstractThinking: 8,   // Comfort with complex, theoretical concepts
              nonConformity: 9       // Resistance to social pressure
            }
          },
          conscientiousness: {
            range: [10, 19],
            facets: {
              selfEfficacy: 10,      // Confidence in ability to accomplish tasks
              orderliness: 11,       // Organization, neatness, structure preference
              dutifulness: 12,       // Sense of moral obligation, reliability
              achievementStriving: 13, // Drive to excel, ambition
              selfDiscipline: 14,    // Ability to persist despite distractions
              cautiousness: 15,      // Tendency to think through decisions
              persistence: 16,       // Continuation despite obstacles
              punctuality: 17,       // Time management, deadline adherence
              methodicalness: 18,    // Systematic, step-by-step approach
              goalOrientation: 19    // Clear direction, purposefulness
            }
          },
          extraversion: {
            range: [20, 29],
            facets: {
              warmth: 20,           // Friendliness, affectionate nature
              gregariousness: 21,   // Preference for company of others
              assertiveness: 22,    // Forcefulness, social dominance
              activityLevel: 23,    // Pace of life, energy, vigor
              excitementSeeking: 24, // Need for stimulation, thrill-seeking
              positiveEmotions: 25, // Joy, happiness, optimism tendency
              sociability: 26,      // Ease in social situations
              expressiveness: 27,   // Emotional and verbal expressiveness
              enthusiasm: 28,       // Zest, eagerness in activities
              dominance: 29         // Leadership, influence-seeking
            }
          },
          agreeableness: {
            range: [30, 39],
            facets: {
              trust: 30,            // Faith in human nature, honesty
              morality: 31,         // Sincerity, genuineness vs manipulation
              altruism: 32,         // Active concern for others' welfare
              cooperation: 33,      // Dislike of confrontations, compromise
              modesty: 34,          // Humility vs grandiosity
              sympathy: 35,         // Concern for others, soft-heartedness
              forgiveness: 36,      // Willingness to forgive, move past hurt
              empathy: 37,          // Understanding others' perspectives
              kindness: 38,         // Benevolent, caring nature
              politeness: 39        // Respect for social conventions
            }
          },
          neuroticism: {
            range: [40, 49],
            facets: {
              anxiety: 40,          // Worry, fear, tension
              anger: 41,            // Irritability, frustration tendency
              depression: 42,       // Sadness, hopelessness, discouragement
              selfConsciousness: 43, // Shyness, social anxiety
              impulsiveness: 44,    // Inability to resist urges, temptations
              vulnerability: 45,    // General susceptibility to stress
              emotionalVolatility: 46, // Mood swings, emotional instability
              pessimism: 47,        // Negative outlook, expecting worst
              insecurity: 48,       // Self-doubt, need for reassurance
              stressReactivity: 49  // Response intensity to stressful events
            }
          },
          metaTraits: {
            range: [50, 59],
            facets: {
              cognitiveComplexity: 50,  // Ability to see nuance, paradox
              emotionalIntelligence: 51, // Understanding emotional dynamics
              adaptability: 52,         // Flexibility in changing circumstances
              resilience: 53,           // Recovery from setbacks
              selfAwareness: 54,        // Understanding of own patterns
              mindfulness: 55,          // Present-moment awareness
              authenticity: 56,         // Alignment between values and actions
              growthMindset: 57,        // Belief in ability to develop
              maturity: 58,            // Emotional and psychological development
              wisdom: 59               // Deep understanding, good judgment
            }
          }
        }
      },

      // INTIMACY & SOCIAL (60-119): Interaction Styles
      intimacySocial: {
        range: [60, 119],
        categories: {
          attachmentStyle: {
            range: [60, 79],
            facets: {
              // Secure Attachment Indicators
              secureBase: 60,           // Comfort with closeness and independence
              trustInRelationships: 61, // Faith in partner reliability
              emotionalRegulation: 62,  // Stable emotional responses
              
              // Anxious Attachment Indicators
              fearOfAbandonment: 63,    // Worry about relationship loss
              needForReassurance: 64,   // Frequent validation seeking
              preoccupation: 65,        // Overthinking relationship dynamics
              
              // Avoidant Attachment Indicators
              discomfortWithIntimacy: 66, // Uneasiness with closeness
              selfReliance: 67,         // Preference for independence
              emotionalDistancing: 68,  // Difficulty with vulnerability
              
              // Disorganized/Other Patterns
              ambivalence: 69,          // Mixed feelings about closeness
              unpredictability: 70,     // Inconsistent relationship behavior
              
              // Relationship Security Factors
              boundaryManagement: 71,   // Healthy limits and expectations
              conflictComfort: 72,      // Ability to navigate disagreements
              intimacyTolerance: 73,    // Capacity for emotional closeness
              supportSeeking: 74,       // Willingness to ask for help
              supportProviding: 75,     // Ability to offer emotional support
              relationshipOptimism: 76, // Positive expectations for love
              commitmentComfort: 77,    // Ease with long-term planning
              jealousyTendency: 78,     // Possessiveness and insecurity
              relationshipAnxiety: 79   // General worry about romantic bonds
            }
          },
          communicationStyle: {
            range: [80, 99],
            facets: {
              assertiveness: 80,        // Direct expression of needs/wants
              passivity: 81,            // Tendency to avoid confrontation
              activeListening: 82,      // Engaged, empathetic listening
              emotionalExpression: 83,  // Comfort sharing feelings
              verbalFluency: 84,        // Ease with spoken communication
              nonverbalSensitivity: 85, // Awareness of body language/tone
              conflictApproach: 86,     // Style of handling disagreements
              feedbackReceptivity: 87,  // Openness to criticism/suggestions
              expressiveRange: 88,      // Variety in emotional communication
              communicationPatience: 89, // Tolerance for complex conversations
              clarityPreference: 90,    // Need for explicit vs implicit communication
              emotionalVulnerability: 91, // Willingness to share deep feelings
              communicationEnergy: 92,  // Enthusiasm in conversations
              listeningStyle: 93,       // Problem-solving vs empathetic listening
              directness: 94,           // Straightforward vs diplomatic communication
              emotionalSupport: 95,     // Ability to provide comfort through words
              intellectualDiscussion: 96, // Enjoyment of deep, analytical talks
              playfulCommunication: 97, // Use of humor, teasing, lightness
              silenceComfort: 98,       // Ease with quiet moments together
              communicationMaintenance: 99 // Effort put into staying connected
            }
          },
          socialDynamics: {
            range: [100, 119],
            facets: {
              cognitiveEmpathy: 100,    // Understanding others' thoughts
              affectiveEmpathy: 101,    // Feeling others' emotions
              socialEnergy: 102,        // Gain vs drain from social interaction
              groupPreference: 103,     // Large groups vs one-on-one
              socialInitiation: 104,    // Tendency to start social interactions
              socialMaintenance: 105,   // Effort to sustain relationships
              socialBoundaries: 106,    // Comfort setting limits with others
              socialIntuition: 107,     // Reading social situations and cues
              networkSize: 108,         // Preference for many vs few close friends
              socialSupport: 109,       // Providing help and care to others
              socialExpectations: 110,  // Standards for friendship and social bonds
              groupDynamics: 111,       // Comfort and role in group settings
              socialInfluence: 112,     // Impact on others' decisions and mood
              socialAdaptability: 113,  // Adjusting style to different social contexts
              socialRecovery: 114,      // Time needed to recharge after socializing
              intimacyPacing: 115,      // Speed of opening up to new people
              socialRiskTaking: 116,    // Willingness to be vulnerable socially
              culturalSensitivity: 117, // Awareness of social/cultural differences
              socialAnxiety: 118,       // Nervousness in social situations
              charisma: 119            // Natural magnetism and social appeal
            }
          }
        }
      },

      // LIFE & VALUES (120-169): Worldview & Motivation
      lifeValues: {
        range: [120, 169],
        categories: {
          coreValues: {
            range: [120, 139],
            facets: {
              honesty: 120,             // Truthfulness, integrity
              ambition: 121,            // Drive for achievement, success
              loyalty: 122,             // Faithfulness, commitment
              creativity: 123,          // Originality, artistic expression
              security: 124,            // Safety, stability, predictability
              freedom: 125,             // Independence, autonomy
              justice: 126,             // Fairness, equality
              compassion: 127,          // Care for others' suffering
              knowledge: 128,           // Learning, understanding, wisdom
              beauty: 129,              // Aesthetics, harmony
              tradition: 130,           // Respect for customs, heritage
              adventure: 131,           // Excitement, new experiences
              family: 132,              // Kinship bonds, generational connection
              spirituality: 133,        // Connection to something greater
              achievement: 134,         // Personal accomplishment, excellence
              hedonism: 135,            // Pleasure, enjoyment
              power: 136,               // Influence, control, authority
              universalism: 137,        // Understanding, tolerance, protection of all
              conformity: 138,          // Restraint of actions that might harm others
              benevolence: 139          // Preservation and enhancement of close others
            }
          },
          lifePhilosophy: {
            range: [140, 159],
            facets: {
              optimism: 140,            // Positive outlook on life
              pessimism: 141,           // Tendency to expect negative outcomes
              locusOfControl: 142,      // Internal vs external control belief
              spiritualityLevel: 143,   // Degree of spiritual/religious belief
              existentialCuriosity: 144, // Questions about meaning, purpose
              materialismLevel: 145,    // Importance of possessions, wealth
              environmentalConcern: 146, // Care for nature, sustainability
              politicalLiberal: 147,    // Progressive social/political views
              politicalConservative: 148, // Traditional social/political views
              riskTolerance: 149,       // Comfort with uncertainty, gambles
              changeOrientation: 150,   // Preference for stability vs change
              competitiveSpirit: 151,   // Drive to win, outperform others
              cooperativeSpirit: 152,   // Preference for collaboration
              individualismLevel: 153,  // Self-reliance vs community orientation
              authoritarianism: 154,    // Respect for authority, hierarchy
              egalitarianism: 155,      // Belief in equality, democracy
              pragmatismLevel: 156,     // Practical vs idealistic approach
              fatalismLevel: 157,       // Belief in predetermined destiny
              moralAbsolutism: 158,     // Black-and-white vs nuanced ethics
              lifeSatisfaction: 159     // Overall contentment with existence
            }
          },
          financialStyle: {
            range: [160, 169],
            facets: {
              spendingPattern: 160,     // Spender vs saver tendency
              riskTolerance: 161,       // Financial risk appetite
              wealthImportance: 162,    // Value placed on accumulating money
              budgetingStyle: 163,      // Structured vs loose financial planning
              investmentOrientation: 164, // Long-term vs short-term thinking
              materialDesires: 165,     // Want for luxury goods, experiences
              financialSecurity: 166,   // Need for financial safety net
              moneyAnxiety: 167,        // Worry about financial matters
              generosityLevel: 168,     // Willingness to spend on others
              financialOptimism: 169    // Confidence about financial future
            }
          }
        }
      },

      // RELATIONSHIP (170-219): Partnership Dynamics
      relationship: {
        range: [170, 219],
        categories: {
          loveLanguages: {
            range: [170, 189],
            facets: {
              // Primary Love Languages (each with nuanced sub-components)
              wordsOfAffirmation: 170,     // Verbal appreciation, encouragement
              verbalAppreciation: 171,     // Specific praise, recognition
              encouragingWords: 172,       // Support during challenges
              verbalIntimacy: 173,         // Deep, meaningful conversations
              compliments: 174,            // Physical, personality, achievement praise
              
              qualityTime: 175,            // Focused attention, presence
              uninterruptedTime: 176,      // One-on-one focused interaction
              qualityConversation: 177,    // Deep dialogue, active listening
              qualityActivities: 178,      // Shared experiences, adventures
              presence: 179,               // Being fully present, undivided attention
              
              physicalTouch: 180,          // Physical connection, affection
              casualTouch: 181,            // Hand-holding, casual physical contact
              intimateTouch: 182,          // Cuddling, sexual intimacy
              comfortingTouch: 183,        // Physical comfort during distress
              playfulTouch: 184,           // Tickling, playful physical interaction
              
              actsOfService: 185,          // Helpful actions, support
              practicalHelp: 186,          // Assistance with tasks, responsibilities
              thoughtfulGestures: 187,     // Anticipating needs, small kindnesses
              problemSolving: 188,         // Helping resolve challenges
              serviceSacrifice: 189        // Going out of way to help
            }
          },
          conflictResolution: {
            range: [190, 199],
            facets: {
              collaborating: 190,       // Working together to find win-win solutions
              compromising: 191,        // Finding middle ground, mutual concessions
              avoiding: 192,            // Withdrawing from conflict situations
              competing: 193,           // Asserting own position, winning orientation
              accommodating: 194,       // Yielding to partner's wishes
              conflictComfort: 195,     // Ease with disagreement, confrontation
              emotionalRegulation: 196, // Managing emotions during conflict
              perspectiveTaking: 197,   // Understanding partner's viewpoint
              repairAttempts: 198,      // Efforts to restore harmony after conflict
              grudgeHolding: 199        // Tendency to remember past hurts
            }
          },
          relationshipModel: {
            range: [200, 219],
            facets: {
              monogamyOrientation: 200,    // Exclusive vs open relationship preference
              marriageImportance: 201,     // Value placed on formal commitment
              partnershipRoles: 202,       // Traditional vs egalitarian role expectations
              relationshipPacing: 203,     // Fast vs slow relationship progression
              commitmentReadiness: 204,    // Preparedness for serious relationships
              relationshipGoals: 205,      // Casual dating vs life partnership seeking
              pastRelationshipImpact: 206, // Influence of previous relationships
              relationshipOptimism: 207,   // Hope and positive expectations for love
              independenceInRelationship: 208, // Maintaining individual identity
              coupleIdentity: 209,         // Creating shared life and identity
              familyOrientation: 210,      // Desire for children, family creation
              relationshipWork: 211,       // Willingness to invest effort in relationship
              romanticExpression: 212,     // Demonstrating love, romantic gestures
              relationshipSatisfaction: 213, // Standards for relationship happiness
              jealousyManagement: 214,     // Handling possessiveness, insecurity
              trustBuilding: 215,          // Creating and maintaining trust
              intimacyDepth: 216,          // Comfort with emotional/physical closeness
              relationshipGrowth: 217,     // Expecting evolution vs stability
              partnerInfluence: 218,       // Openness to being changed by partner
              relationshipResilience: 219  // Ability to weather challenges together
            }
          }
        }
      },

      // PERSONAL & LEARNED (220-255): Individual Nuances
      personalLearned: {
        range: [220, 255],
        categories: {
          interestsHumor: {
            range: [220, 239],
            facets: {
              artisticInterests: 220,   // Visual arts, music, literature
              technicalInterests: 221,  // Technology, engineering, mechanics
              outdoorInterests: 222,    // Nature, sports, adventure activities
              intellectualInterests: 223, // Philosophy, science, learning
              socialInterests: 224,     // Parties, events, social gatherings
              culturalInterests: 225,   // Museums, theater, cultural events
              fitnessInterests: 226,    // Exercise, health, physical activities
              domesticInterests: 227,   // Cooking, home improvement, gardening
              
              sarcasticHumor: 228,      // Irony, wit, clever wordplay
              slapstickHumor: 229,      // Physical comedy, silly humor
              intellectualHumor: 230,   // Wordplay, sophisticated jokes
              darkHumor: 231,           // Morbid, edgy, controversial humor
              selfDeprecatingHumor: 232, // Making fun of oneself
              observationalHumor: 233,  // Comedy about everyday life
              playfulHumor: 234,        // Light, fun, innocent humor
              absurdHumor: 235,         // Surreal, nonsensical comedy
              impressionHumor: 236,     // Mimicry, character impressions
              situationalHumor: 237,    // Spontaneous, contextual comedy
              storytellingHumor: 238,   // Narrative-based, anecdotal humor
              physicalComedy: 239       // Body language, facial expressions
            }
          },
          learnedNuances: {
            range: [240, 255],
            facets: {
              // Dynamic learning dimensions - updated based on conversation and feedback
              specificPreference1: 240,  // Learned specific likes (e.g., loves morning coffee rituals)
              specificAvoidance1: 241,   // Learned specific dislikes (e.g., hates loud chewing)
              contextualTrait1: 242,     // Situational behavior patterns
              uniqueQuirk1: 243,         // Individual peculiarities, habits
              personalHistory1: 244,     // Significant life experiences impact
              culturalNuance1: 245,      // Cultural background influence
              familyInfluence1: 246,     // Family dynamics impact on preferences
              professionalInfluence1: 247, // Career impact on personality expression
              hobbyPersonality1: 248,    // How hobbies shape identity
              socialGroupInfluence1: 249, // Friend group impact on behavior
              geographicInfluence1: 250, // Location/region impact on preferences
              seasonalPreference1: 251,  // Time-of-year related patterns
              stressResponse1: 252,      // Specific stress coping mechanisms
              celebrationStyle1: 253,    // How they mark achievements, holidays
              learningStyle1: 254,       // How they prefer to acquire new information
              adaptationPattern1: 255    // How they adjust to major life changes
            }
          }
        }
      }
    };
  }

  // Initialize detailed facet descriptions for AI understanding
  initializeFacetDescriptions() {
    return {
      // Personality Core Descriptions
      imagination: {
        low: "Prefers concrete, practical thinking over abstract concepts",
        mid: "Balances imaginative thinking with practical considerations", 
        high: "Rich inner fantasy life, enjoys daydreaming and creative visualization"
      },
      artisticInterest: {
        low: "Little interest in art, music, or aesthetic experiences",
        mid: "Moderate appreciation for artistic and aesthetic experiences",
        high: "Deep appreciation for art, beauty, and aesthetic experiences"
      },
      emotionality: {
        low: "Less aware of or concerned with inner emotional states",
        mid: "Moderate awareness and receptiveness to emotions",
        high: "Highly attuned to and receptive to inner emotional experiences"
      },
      adventurousness: {
        low: "Prefers familiar experiences and routine over novelty",
        mid: "Enjoys some new experiences while maintaining comfort zones",
        high: "Actively seeks new experiences, variety, and novel situations"
      },
      // ... (would continue for all 256 dimensions)
    };
  }

  // Create empty HHC vector with proper structure
  createEmptyVector() {
    const vector = new Array(256).fill(0);
    return {
      vector,
      metadata: {
        createdAt: new Date(),
        lastUpdated: new Date(),
        confidenceScores: new Array(256).fill(0), // How confident we are in each dimension
        dataSources: new Array(256).fill('unknown'), // How we learned each dimension value
        learningHistory: [] // Track how values change over time
      }
    };
  }

  // Get dimension information by index
  getDimensionInfo(index) {
    if (index < 0 || index >= 256) {
      throw new Error(`Invalid dimension index: ${index}. Must be 0-255.`);
    }

    // Find which category and facet this dimension belongs to
    for (const [categoryName, categoryData] of Object.entries(this.dimensionMap)) {
      const [start, end] = categoryData.range;
      if (index >= start && index <= end) {
        // Look through subcategories to find specific facet
        for (const [subCategoryName, subCategoryData] of Object.entries(categoryData.categories)) {
          const [subStart, subEnd] = subCategoryData.range;
          if (index >= subStart && index <= subEnd) {
            // Find the specific facet
            for (const [facetName, facetIndex] of Object.entries(subCategoryData.facets)) {
              if (facetIndex === index) {
                return {
                  index,
                  category: categoryName,
                  subCategory: subCategoryName,
                  facet: facetName,
                  description: this.facetDescriptions[facetName] || { 
                    low: "Low expression of this trait",
                    mid: "Moderate expression of this trait", 
                    high: "High expression of this trait"
                  }
                };
              }
            }
          }
        }
      }
    }

    return {
      index,
      category: 'unknown',
      subCategory: 'unknown',
      facet: 'unknown',
      description: { low: 'Unknown trait', mid: 'Unknown trait', high: 'Unknown trait' }
    };
  }

  // Get all dimensions in a category
  getCategoryDimensions(categoryName) {
    const category = this.dimensionMap[categoryName];
    if (!category) {
      throw new Error(`Unknown category: ${categoryName}`);
    }

    const dimensions = [];
    for (const [subCategoryName, subCategoryData] of Object.entries(category.categories)) {
      for (const [facetName, facetIndex] of Object.entries(subCategoryData.facets)) {
        dimensions.push({
          index: facetIndex,
          category: categoryName,
          subCategory: subCategoryName,
          facet: facetName
        });
      }
    }

    return dimensions.sort((a, b) => a.index - b.index);
  }

  // Interpret a vector value in human terms
  interpretDimensionValue(index, value) {
    const info = this.getDimensionInfo(index);
    const description = info.description;
    
    if (value < 0.33) {
      return {
        level: 'low',
        description: description.low,
        numericValue: value,
        percentage: Math.round(value * 100)
      };
    } else if (value < 0.67) {
      return {
        level: 'moderate',
        description: description.mid,
        numericValue: value,
        percentage: Math.round(value * 100)
      };
    } else {
      return {
        level: 'high',
        description: description.high,
        numericValue: value,
        percentage: Math.round(value * 100)
      };
    }
  }

  // Generate a human-readable summary of an HHC vector
  generateVectorSummary(hhcData) {
    const vector = hhcData.vector;
    const summary = {
      personalityCore: {},
      intimacySocial: {},
      lifeValues: {},
      relationship: {},
      personalLearned: {}
    };

    // Analyze each major category
    for (const [categoryName, categoryData] of Object.entries(this.dimensionMap)) {
      const categoryDimensions = this.getCategoryDimensions(categoryName);
      const categorySummary = [];

      // Find the highest-scoring facets in this category
      const topFacets = categoryDimensions
        .map(dim => ({
          ...dim,
          value: vector[dim.index],
          interpretation: this.interpretDimensionValue(dim.index, vector[dim.index])
        }))
        .filter(dim => dim.value > 0.6) // Only include significant traits
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5 traits per category

      summary[categoryName] = {
        topTraits: topFacets,
        averageScore: categoryDimensions.reduce((sum, dim) => sum + vector[dim.index], 0) / categoryDimensions.length
      };
    }

    return summary;
  }

  // Validate HHC vector structure and values
  validateVector(hhcData) {
    const errors = [];

    if (!hhcData || !hhcData.vector) {
      errors.push('Missing vector data');
      return { valid: false, errors };
    }

    const vector = hhcData.vector;

    if (!Array.isArray(vector) || vector.length !== 256) {
      errors.push(`Vector must be array of length 256, got ${vector.length}`);
    }

    for (let i = 0; i < vector.length; i++) {
      const value = vector[i];
      if (typeof value !== 'number' || value < 0 || value > 1) {
        errors.push(`Dimension ${i} must be number between 0 and 1, got ${value}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default new HighResolutionHHC();