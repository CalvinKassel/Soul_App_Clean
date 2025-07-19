const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');

class VirtueElicitationAgent {
  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.llm = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.4,
      });
      this.outputParser = new StringOutputParser();
      this.enabled = true;
    } else {
      this.enabled = false;
    }
    
    console.log('👂 Virtue Elicitation Agent - Story Listener ready');
  }

  async analyzeStoryForVirtues(userStory, emotionalReaction, currentVirtueProfile = {}) {
    if (!this.enabled) {
      return this.getSimpleVirtueAnalysis(userStory, emotionalReaction);
    }

    const virtueTemplate = PromptTemplate.fromTemplate(`
      You are an expert in character analysis using Peterson & Seligman's Character Strengths and Virtues framework.
      
      A user shared this story/experience: "{userStory}"
      Their emotional reaction was: {emotionalReaction}
      
      Your task: Analyze what VIRTUES this story reveals the user values.
      
      Virtue Categories:
      - WISDOM: creativity, curiosity, judgment, love_of_learning, perspective
      - COURAGE: bravery, perseverance, honesty, zest
      - HUMANITY: love, kindness, social_intelligence
      - JUSTICE: teamwork, fairness, leadership
      - TEMPERANCE: forgiveness, humility, prudence, self_regulation
      - TRANSCENDENCE: appreciation_of_beauty, gratitude, hope, humor, spirituality
      
      Return analysis as JSON:
      {{
        "valued_virtues": [
          {{
            "virtue_category": "category_name",
            "specific_strength": "specific_strength",
            "evidence": "what shows they value this",
            "confidence": 0.8
          }}
        ],
        "violated_virtues": [
          {{
            "virtue_category": "category_name", 
            "specific_strength": "specific_strength",
            "evidence": "what shows they were bothered by absence of this",
            "confidence": 0.9
          }}
        ]
      }}
    `);

    try {
      const chain = virtueTemplate.pipe(this.llm).pipe(this.outputParser);
      
      const result = await chain.invoke({
        userStory: userStory,
        emotionalReaction: emotionalReaction
      });

      return JSON.parse(result);
    } catch (error) {
      console.error('Error analyzing story for virtues:', error);
      return this.getSimpleVirtueAnalysis(userStory, emotionalReaction);
    }
  }

  getSimpleVirtueAnalysis(userStory, emotionalReaction) {
    const analysis = {
      valued_virtues: [],
      violated_virtues: []
    };

    const story = userStory.toLowerCase();
    const reaction = emotionalReaction.toLowerCase();

    if (story.includes('honest') || story.includes('truth')) {
      analysis.valued_virtues.push({
        virtue_category: 'courage',
        specific_strength: 'honesty',
        evidence: 'Referenced honesty or truth in story',
        confidence: 0.6
      });
    }

    if (reaction.includes('disrespect') || reaction.includes('unfair')) {
      analysis.violated_virtues.push({
        virtue_category: 'justice',
        specific_strength: 'fairness',
        evidence: 'Negative reaction to perceived unfairness',
        confidence: 0.7
      });
    }

    return analysis;
  }
}

module.exports = VirtueElicitationAgent;