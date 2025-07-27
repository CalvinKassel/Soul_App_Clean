// Socratic Personality Analyzer
// Uses intelligent follow-up questioning to extract high-resolution personality data
// Turns the "dials" with surgical precision based on conversation analysis

import HighResolutionHHC from './HighResolutionHHC.js';

class SocraticPersonalityAnalyzer {
  constructor() {
    this.hhcSchema = HighResolutionHHC;
    this.questioningStrategies = this.initializeQuestioningStrategies();
    this.traitInferenceRules = this.initializeTraitInferenceRules();
    this.conversationState = new Map(); // Track questioning state per user
  }

  // Initialize Socratic questioning strategies for each personality facet
  initializeQuestioningStrategies() {
    return {
      // PERSONALITY CORE QUESTIONING
      imagination: {
        initial: "What role does imagination play in your daily life?",
        followups: [
          "When you have free time, where does your mind tend to wander?",
          "Do you enjoy daydreaming or do you prefer focusing on concrete reality?",
          "How do you typically approach creative problem-solving?"
        ],
        deepQuestions: [
          "Describe a time when your imagination helped you in an unexpected way.",
          "Do you create stories or scenarios in your mind? What are they like?",
          "When making decisions, do you visualize different outcomes?"
        ]
      },

      adventurousness: {
        initial: "How do you feel about trying new experiences?",
        followups: [
          "What's your ideal balance between routine and spontaneity?",
          "Tell me about the last time you did something completely new.",
          "Do you prefer planned adventures or spur-of-the-moment excitement?"
        ],
        deepQuestions: [
          "What stops you from trying new things, if anything?",
          "How do you define 'adventure' for yourself?",
          "What new experience would excite you most right now?"
        ]
      },

      activityLevel: {
        initial: "Describe your natural energy patterns throughout the day.",
        followups: [
          "Are you someone who's always on the go, or do you prefer a slower pace?",
          "How do you prefer to spend your weekends?",
          "What activities energize you vs. drain you?"
        ],
        deepQuestions: [
          "How has your energy level affected your relationships?",
          "Do others ever comment on your pace of life?",
          "What's your ideal activity level in a partner?"
        ]
      },

      // INTIMACY & SOCIAL QUESTIONING
      attachmentStyle: {
        initial: "How do you typically feel in close relationships?",
        followups: [
          "What makes you feel secure with someone you care about?",
          "How do you handle it when someone you love seems distant?",
          "Do you tend to worry about relationships or feel confident in them?"
        ],
        deepQuestions: [
          "Describe how you act when you're falling for someone.",
          "What are your biggest fears in relationships?",
          "How do you prefer partners to show they care about you?"
        ]
      },

      communicationStyle: {
        initial: "How do you prefer to handle difficult conversations?",
        followups: [
          "Are you more direct or diplomatic when expressing disagreement?",
          "Do you prefer to talk through emotions or think about them first?",
          "How comfortable are you with confrontation?"
        ],
        deepQuestions: [
          "Describe a recent conversation that went really well. What made it work?",
          "How do you know when someone is really listening to you?",
          "What communication style brings out your best?"
        ]
      },

      // LIFE & VALUES QUESTIONING
      coreValues: {
        initial: "What principles guide your important decisions?",
        followups: [
          "When you're proudest of yourself, what have you usually done?",
          "What kind of behavior in others really bothers you?",
          "How do you define a life well-lived?"
        ],
        deepQuestions: [
          "Tell me about a time you had to choose between competing values.",
          "What values do you hope to share with a long-term partner?",
          "How have your values changed as you've gotten older?"
        ]
      },

      // RELATIONSHIP QUESTIONING
      loveLanguages: {
        initial: "How do you best feel loved and appreciated?",
        followups: [
          "What's more meaningful to you: words of appreciation or thoughtful actions?",
          "Do you prefer quality time together or physical affection?",
          "How do you typically show love to people you care about?"
        ],
        deepQuestions: [
          "Describe a moment when you felt truly cherished by someone.",
          "What's something small that makes you feel deeply loved?",
          "How do you prefer to resolve things after an argument?"
        ]
      },

      conflictResolution: {
        initial: "How do you handle disagreements with people you care about?",
        followups: [
          "Do you prefer to address issues immediately or take time to think?",
          "Are you more focused on being right or finding a solution?",
          "How do you feel during and after conflicts?"
        ],
        deepQuestions: [
          "Describe your most successful resolution of a relationship conflict.",
          "What conflict style brings out your worst vs. your best?",
          "How do you rebuild closeness after a disagreement?"
        ]
      }
    };
  }

  // Initialize rules for inferring personality traits from conversation
  initializeTraitInferenceRules() {
    return {
      // OPENNESS facets inference
      imagination: {
        indicators: {
          high: [
            'daydream', 'visualize', 'imagine', 'fantasy', 'creative visualization',
            'scenarios in my mind', 'story in my head', 'what if', 'possibility'
          ],
          low: [
            'practical', 'realistic', 'concrete', 'focus on facts', 'stick to reality',
            'don\'t daydream', 'waste of time to imagine'
          ]
        },
        contextClues: {
          planningStyle: {
            'visualize outcomes': 0.7,
            'make lists and follow them': 0.3,
            'wing it': 0.5
          }
        }
      },

      adventurousness: {
        indicators: {
          high: [
            'spontaneous', 'last minute', 'try new things', 'love variety',
            'seek excitement', 'explore', 'adventure', 'novel experiences'
          ],
          low: [
            'routine', 'familiar', 'stick to what I know', 'comfort zone',
            'predictable', 'structured', 'planned'
          ]
        },
        behaviorPatterns: {
          travelStyle: {
            'book last-minute flights': 0.9,
            'detailed itinerary': 0.2,
            'same vacation spot': 0.1
          },
          weekendPreference: {
            'something different every time': 0.8,
            'favorite regular spots': 0.3
          }
        }
      },

      // EXTRAVERSION facets inference
      activityLevel: {
        indicators: {
          high: [
            'always busy', 'high energy', 'fast-paced', 'go go go',
            'lots of activities', 'energetic', 'vigorous', 'active lifestyle'
          ],
          low: [
            'slower pace', 'take my time', 'relaxed', 'calm approach',
            'prefer fewer activities', 'peaceful', 'unhurried'
          ]
        },
        lifestyleClues: {
          weekendDescription: {
            'packed with activities': 0.9,
            'one or two things': 0.5,
            'relaxing at home': 0.2
          },
          energyManagement: {
            'need downtime to recharge': 0.3,
            'energized by doing things': 0.8
          }
        }
      },

      warmth: {
        indicators: {
          high: [
            'warm', 'affectionate', 'caring', 'loving', 'tender',
            'compassionate', 'nurturing', 'supportive'
          ],
          low: [
            'reserved', 'distant', 'formal', 'professional boundaries',
            'keep emotions private', 'not touchy-feely'
          ]
        }
      },

      // ATTACHMENT STYLE inference
      secureAttachment: {
        indicators: {
          high: [
            'comfortable with closeness', 'trust easily', 'stable relationships',
            'secure in love', 'confident in relationships', 'emotionally stable'
          ],
          low: [
            'worry about abandonment', 'need reassurance', 'relationship anxiety',
            'fear of intimacy', 'unstable relationships'
          ]
        },
        relationshipPatterns: {
          conflictResponse: {
            'talk it through calmly': 0.8,
            'worry they\'ll leave': 0.2,
            'withdraw and shut down': 0.3
          }
        }
      },

      // COMMUNICATION STYLE inference
      directness: {
        indicators: {
          high: [
            'tell it like it is', 'direct communication', 'straightforward',
            'honest feedback', 'say what I mean', 'no beating around bush'
          ],
          low: [
            'diplomatic', 'gentle approach', 'soften the message',
            'read between lines', 'subtle', 'indirect'
          ]
        }
      },

      // VALUES inference
      honesty: {
        indicators: {
          high: [
            'truthfulness', 'integrity', 'authentic', 'genuine',
            'hate lying', 'value honesty', 'transparent'
          ],
          low: [
            'white lies are okay', 'sometimes need to bend truth',
            'protect feelings over honesty'
          ]
        }
      }
    };
  }

  // Generate follow-up questions based on user's response
  async generateFollowUpQuestions(userId, topic, userResponse, conversationHistory) {
    try {
      const state = this.getConversationState(userId);
      const strategy = this.questioningStrategies[topic];
      
      if (!strategy) {
        return this.generateGenericFollowUp(userResponse);
      }

      // Analyze the response to determine which follow-up to use
      const responseAnalysis = this.analyzeResponse(userResponse, topic);
      
      // Select appropriate follow-up based on analysis
      let followUps = [];

      if (state.questionsAsked[topic] < 2) {
        // Use standard follow-ups first
        followUps = strategy.followups.filter(q => 
          !state.usedQuestions.has(q)
        );
      } else {
        // Move to deeper questions
        followUps = strategy.deepQuestions.filter(q => 
          !state.usedQuestions.has(q)
        );
      }

      // Select the most relevant follow-up
      const selectedQuestion = this.selectBestFollowUp(followUps, responseAnalysis, userResponse);
      
      // Track the question
      state.questionsAsked[topic] = (state.questionsAsked[topic] || 0) + 1;
      state.usedQuestions.add(selectedQuestion);

      return {
        question: selectedQuestion,
        reasoning: `Following up on ${topic} to understand "${responseAnalysis.keyThemes.join(', ')}"`,
        expectedInsights: this.getExpectedInsights(topic, responseAnalysis)
      };

    } catch (error) {
      console.error('Error generating follow-up question:', error);
      return this.generateGenericFollowUp(userResponse);
    }
  }

  // Analyze user response to extract personality insights
  async analyzeResponseForTraits(userId, topic, userResponse) {
    try {
      const insights = {};
      const rules = this.traitInferenceRules[topic];
      
      if (!rules) {
        return this.performGenericAnalysis(userResponse);
      }

      const responseText = userResponse.toLowerCase();
      
      // Check for direct indicators
      if (rules.indicators) {
        let highScore = 0;
        let lowScore = 0;
        
        rules.indicators.high?.forEach(indicator => {
          if (responseText.includes(indicator.toLowerCase())) {
            highScore += 1;
          }
        });
        
        rules.indicators.low?.forEach(indicator => {
          if (responseText.includes(indicator.toLowerCase())) {
            lowScore += 1;
          }
        });
        
        // Calculate trait score
        if (highScore > 0 || lowScore > 0) {
          const total = highScore + lowScore;
          const traitScore = highScore / total;
          
          insights[topic] = {
            score: traitScore,
            confidence: Math.min(0.9, (highScore + lowScore) * 0.2),
            evidence: {
              highIndicators: highScore,
              lowIndicators: lowScore,
              keyPhrases: this.extractKeyPhrases(responseText, rules.indicators)
            }
          };
        }
      }
      
      // Check behavioral patterns
      if (rules.behaviorPatterns) {
        for (const [pattern, options] of Object.entries(rules.behaviorPatterns)) {
          for (const [behavior, score] of Object.entries(options)) {
            if (responseText.includes(behavior.toLowerCase())) {
              insights[`${topic}_${pattern}`] = {
                score: score,
                confidence: 0.7,
                evidence: { behaviorMatch: behavior }
              };
            }
          }
        }
      }

      return insights;

    } catch (error) {
      console.error('Error analyzing response for traits:', error);
      return {};
    }
  }

  // Update HHC vector based on conversation insights
  async updateHHCFromInsights(userId, insights, currentHHC) {
    try {
      const updatedVector = [...currentHHC.vector];
      const updates = [];

      for (const [traitName, insight] of Object.entries(insights)) {
        // Find the dimension index for this trait
        const dimensionInfo = this.findDimensionForTrait(traitName);
        
        if (dimensionInfo) {
          const currentValue = updatedVector[dimensionInfo.index];
          const newValue = this.calculateNewValue(currentValue, insight.score, insight.confidence);
          
          updatedVector[dimensionInfo.index] = newValue;
          
          // Update metadata
          currentHHC.metadata.confidenceScores[dimensionInfo.index] = Math.max(
            currentHHC.metadata.confidenceScores[dimensionInfo.index],
            insight.confidence
          );
          
          currentHHC.metadata.dataSources[dimensionInfo.index] = 'conversation';
          
          updates.push({
            dimension: dimensionInfo.index,
            trait: traitName,
            oldValue: currentValue,
            newValue: newValue,
            confidence: insight.confidence,
            evidence: insight.evidence
          });
        }
      }

      // Update learning history
      currentHHC.metadata.learningHistory.push({
        timestamp: new Date(),
        updates: updates,
        source: 'socratic_analysis'
      });

      currentHHC.vector = updatedVector;
      currentHHC.metadata.lastUpdated = new Date();

      console.log(`🧠 Updated ${updates.length} HHC dimensions for user ${userId}`);
      return { success: true, updates, updatedHHC: currentHHC };

    } catch (error) {
      console.error('Error updating HHC from insights:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper methods

  getConversationState(userId) {
    if (!this.conversationState.has(userId)) {
      this.conversationState.set(userId, {
        questionsAsked: {},
        usedQuestions: new Set(),
        topicsExplored: new Set(),
        insights: {}
      });
    }
    return this.conversationState.get(userId);
  }

  analyzeResponse(response, topic) {
    const words = response.toLowerCase().split(/\s+/);
    const keyThemes = [];
    
    // Extract emotional words
    const emotionalWords = words.filter(word => 
      ['love', 'hate', 'enjoy', 'dislike', 'fear', 'excited', 'worried', 'happy', 'sad'].includes(word)
    );
    
    if (emotionalWords.length > 0) {
      keyThemes.push('emotional_content');
    }
    
    // Extract behavioral indicators
    const behaviorWords = words.filter(word =>
      ['always', 'never', 'usually', 'sometimes', 'prefer', 'tend to'].includes(word)
    );
    
    if (behaviorWords.length > 0) {
      keyThemes.push('behavioral_patterns');
    }
    
    return {
      keyThemes,
      emotionalWords,
      behaviorWords,
      length: words.length,
      specificity: this.calculateSpecificity(response)
    };
  }

  selectBestFollowUp(followUps, analysis, originalResponse) {
    if (followUps.length === 0) {
      return "That's interesting. Can you tell me more about how that affects your relationships?";
    }
    
    // Simple selection for now - could be more sophisticated
    if (analysis.keyThemes.includes('emotional_content')) {
      return followUps.find(q => q.includes('feel')) || followUps[0];
    }
    
    if (analysis.specificity < 0.5) {
      return followUps.find(q => q.includes('specific') || q.includes('example')) || followUps[0];
    }
    
    return followUps[Math.floor(Math.random() * followUps.length)];
  }

  getExpectedInsights(topic, analysis) {
    const baseInsights = [topic];
    
    if (analysis.keyThemes.includes('emotional_content')) {
      baseInsights.push('emotional_expression', 'emotional_regulation');
    }
    
    if (analysis.keyThemes.includes('behavioral_patterns')) {
      baseInsights.push('behavioral_consistency', 'habit_patterns');
    }
    
    return baseInsights;
  }

  extractKeyPhrases(text, indicators) {
    const phrases = [];
    const allIndicators = [...(indicators.high || []), ...(indicators.low || [])];
    
    allIndicators.forEach(indicator => {
      if (text.includes(indicator.toLowerCase())) {
        phrases.push(indicator);
      }
    });
    
    return phrases;
  }

  findDimensionForTrait(traitName) {
    // Map trait names to HHC dimensions
    const traitMappings = {
      imagination: 0,
      adventurousness: 3,
      activityLevel: 23,
      warmth: 20,
      secureAttachment: 60,
      directness: 94,
      honesty: 120
      // ... would continue for all traits
    };
    
    const index = traitMappings[traitName];
    if (index !== undefined) {
      return this.hhcSchema.getDimensionInfo(index);
    }
    
    return null;
  }

  calculateNewValue(currentValue, insightScore, confidence) {
    // Weighted average between current value and new insight
    const weight = confidence;
    return currentValue * (1 - weight) + insightScore * weight;
  }

  calculateSpecificity(response) {
    // Simple specificity measure - could be more sophisticated
    const specificWords = ['when', 'where', 'how', 'because', 'since', 'example', 'instance'];
    const words = response.toLowerCase().split(/\s+/);
    const specificCount = words.filter(word => specificWords.includes(word)).length;
    
    return Math.min(1, specificCount / 3); // Max specificity at 3+ specific words
  }

  performGenericAnalysis(response) {
    // Fallback analysis for unknown topics
    const sentiment = this.analyzeSentiment(response);
    return {
      generic_positivity: {
        score: sentiment > 0 ? 0.7 : 0.3,
        confidence: 0.4,
        evidence: { sentiment }
      }
    };
  }

  analyzeSentiment(text) {
    const positiveWords = ['love', 'enjoy', 'great', 'amazing', 'wonderful', 'excited', 'happy'];
    const negativeWords = ['hate', 'dislike', 'terrible', 'awful', 'worried', 'sad', 'frustrated'];
    
    let score = 0;
    const words = text.toLowerCase().split(/\s+/);
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });
    
    return score;
  }

  generateGenericFollowUp(response) {
    return {
      question: "That gives me insight into who you are. What else about yourself do you think is important for meaningful connections?",
      reasoning: "Generic follow-up for continued exploration",
      expectedInsights: ['general_personality']
    };
  }
}

export default new SocraticPersonalityAnalyzer();