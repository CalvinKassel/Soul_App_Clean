const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');

class PsychologyKnowledgeBase {
  constructor() {
    // Simulated psychology knowledge base - in production this would be vectorized textbook content
    this.knowledgeBase = this.initializeKnowledgeBase();
    
    if (process.env.OPENAI_API_KEY) {
      this.llm = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.3,
      });
      this.outputParser = new StringOutputParser();
      this.enabled = true;
    } else {
      this.enabled = false;
    }
  }

  initializeKnowledgeBase() {
    return {
      attachment_theory: {
        secure: {
          description: "Approximately 60% of adults have secure attachment. They are comfortable with intimacy and autonomy.",
          relationship_patterns: "Tend to have longer, more satisfying relationships with effective communication",
          compatibility: "Generally compatible with all attachment styles but especially with other secure individuals"
        },
        anxious: {
          description: "About 20% of adults have anxious attachment. They crave intimacy but fear abandonment.",
          relationship_patterns: "May become clingy or jealous, need frequent reassurance",
          compatibility: "Often attracted to avoidant partners, but thrive with secure partners"
        },
        avoidant: {
          description: "About 15% of adults have avoidant attachment. They value independence and may fear engulfment.",
          relationship_patterns: "May pull away when things get serious, struggle with emotional intimacy",
          compatibility: "Can work well with secure partners who respect boundaries"
        }
      },
      
      love_languages: {
        words_of_affirmation: {
          description: "Feel most loved through verbal expressions of affection",
          examples: "Compliments, encouraging words, verbal recognition",
          compatibility: "Works well with naturally expressive partners"
        },
        quality_time: {
          description: "Feel most loved through undivided attention and shared experiences",
          examples: "One-on-one conversations, shared activities, dedicated time",
          compatibility: "May struggle with always-busy partners"
        },
        physical_touch: {
          description: "Feel most loved through appropriate physical contact",
          examples: "Hugs, hand-holding, cuddling, affectionate touch",
          compatibility: "Need similar comfort levels with physical affection"
        },
        acts_of_service: {
          description: "Feel most loved when others do helpful things",
          examples: "Cooking, helping with chores, solving problems together",
          compatibility: "Appreciate partners who notice and help with daily tasks"
        },
        receiving_gifts: {
          description: "Feel most loved through thoughtful gifts and tokens",
          examples: "Surprise gifts, remembering occasions, thoughtful tokens",
          compatibility: "Need partners who remember dates and show tangible love"
        }
      },

      personality_dynamics: {
        introvert_extrovert: {
          compatibility_research: "Opposite energy types can be highly compatible when each respects the other's needs",
          success_factors: "Introverts provide depth, extroverts provide energy and social connection",
          strategies: "Schedule both social time and quiet time, communicate energy needs clearly"
        },
        thinking_feeling: {
          compatibility_research: "Thinking-Feeling differences can create balance when both types feel valued",
          success_factors: "Thinkers provide logic, Feelers provide empathy and emotional intelligence",
          strategies: "Validate both logical and emotional perspectives"
        }
      }
    };
  }

  async getDialecticalInsight(topic, userContext, confidence = 0.8) {
    const knowledge = this.retrieveRelevantKnowledge(topic, userContext);
    
    if (!this.enabled) {
      return this.getFallbackSocraticQuestion(topic, knowledge);
    }

    const socraticTemplate = PromptTemplate.fromTemplate(`
      You are a wise Socratic mentor with deep knowledge of psychology and relationships. 
      You have retrieved this psychological insight: {psychologyInsight}
      
      User context: {userContext}
      Confidence level: {confidence}
      
      Your task: DO NOT state the insight directly. Instead, craft a gentle, open-ended question 
      that helps the user reflect on this dynamic in their own life and discover the insight themselves.
      
      Guidelines:
      - If confidence is below 0.9, express uncertainty: "I might be sensing..." or "I could be wrong, but..."
      - Use "we" language to create partnership: "we've discovered" or "we're noticing"
      - Make it personal and reflective, not academic
      - Help them connect it to their own experience
      
      Generate a thoughtful, Socratic question that leads to self-discovery.
    `);

    try {
      const chain = socraticTemplate.pipe(this.llm).pipe(this.outputParser);
      
      const result = await chain.invoke({
        psychologyInsight: JSON.stringify(knowledge),
        userContext: userContext,
        confidence: confidence
      });

      return result;
    } catch (error) {
      console.error('Error generating Socratic question:', error);
      return this.getFallbackSocraticQuestion(topic, knowledge);
    }
  }

  retrieveRelevantKnowledge(topic, userContext) {
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes('attachment')) {
      return this.knowledgeBase.attachment_theory;
    }
    if (topicLower.includes('love language')) {
      return this.knowledgeBase.love_languages;
    }
    if (topicLower.includes('personality') || topicLower.includes('mbti')) {
      return this.knowledgeBase.personality_dynamics;
    }
    
    return this.knowledgeBase.attachment_theory;
  }

  getFallbackSocraticQuestion(topic, knowledge) {
    const questions = [
      "In your past relationships, how have you found that dynamic plays out? Does it feel exciting and complementary, or sometimes challenging?",
      "When you think about your ideal partnership, how does that resonate with your own experience of what feels natural to you?",
      "I'm curious - when you imagine being deeply understood by someone, what does that look like for you?",
      "How do you typically feel most appreciated and valued in close relationships?"
    ];
    
    return questions[Math.floor(Math.random() * questions.length)];
  }
}

module.exports = PsychologyKnowledgeBase;