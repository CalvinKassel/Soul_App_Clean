// SoulAI Knowledge Base Service - Integration with psychology textbooks
// Provides evidence-based insights for personality analysis and relationship guidance

class KnowledgeBaseService {
  constructor() {
    this.textbooks = {};
    this.loadedBooks = new Set();
    this.conceptIndex = {};
    this.textbookHierarchy = {
      // Academic/Research-based psychology
      'psychology_research': {
        books: ['heart_and_soul_of_change'],
        focus: 'Evidence-based therapeutic relationships and change processes',
        authority: 'academic',
        use_cases: ['therapeutic alliance', 'relationship effectiveness', 'change processes']
      },
      // Spiritual/Practical relationship wisdom
      'relationship_wisdom': {
        books: ['mastery_of_love'],
        focus: 'Spiritual and practical guidance for personal relationships',
        authority: 'experiential',
        use_cases: ['self-love', 'emotional healing', 'unconditional love', 'relationship patterns']
      }
    };
  }

  // Extract key concepts from The Mastery of Love
  extractMasteryOfLoveConcepts() {
    return {
      // Core relationship concepts from Don Miguel Ruiz
      "unconditional_love": {
        definition: "Love without expectations, conditions, or requirements - love for the sake of love itself",
        importance: "The foundation of healthy relationships and personal happiness",
        practice: "Loving others as they are, not as you want them to be",
        evidence: "When we love unconditionally, we eliminate the source of most relationship conflicts"
      },
      
      "emotional_wounds": {
        definition: "Past hurts and traumas that create fear, jealousy, and defensive patterns in relationships",
        importance: "Understanding these wounds helps us heal and avoid repeating painful patterns",
        healing: "Awareness, self-compassion, and choosing love over fear",
        impact: "Unhealed wounds create the emotional poison that destroys relationships"
      },
      
      "self_love": {
        definition: "Accepting and loving yourself completely, including your flaws and imperfections",
        importance: "You cannot truly love others until you love yourself",
        practice: "Treating yourself with the same kindness you would show a beloved friend",
        result: "When you love yourself, you don't need others to love you to feel complete"
      },
      
      "emotional_poison": {
        definition: "Negative emotions like jealousy, anger, fear, and hatred that contaminate relationships",
        source: "Usually stems from unhealed emotional wounds and unmet expectations",
        antidote: "Unconditional love, forgiveness, and emotional healing",
        prevention: "Healing your own wounds prevents you from poisoning others"
      },
      
      "relationship_agreements": {
        definition: "The spoken and unspoken rules and expectations that govern relationships",
        importance: "Many relationship problems come from conflicting or unrealistic agreements",
        solution: "Clear communication about needs, boundaries, and expectations",
        wisdom: "The only agreement that matters is to love and respect each other"
      },
      
      "fear_based_love": {
        definition: "Love that comes with conditions, expectations, and attempts to control",
        problems: "Creates suffering, conflict, and ultimately destroys relationships",
        examples: "Jealousy, possessiveness, trying to change your partner",
        transformation: "Recognizing fear-based patterns and choosing love instead"
      }
    };
  }

  // Extract key concepts from Heart and Soul of Change
  extractConcepts() {
    return {
      // Core therapeutic concepts
      "common_factors": {
        definition: "Ingredients or elements that exist in all forms of psychotherapy that drive therapeutic change",
        importance: "Research shows common factors are responsible for therapeutic outcomes more than specific techniques",
        components: ["therapeutic alliance", "therapist factors", "client factors", "hope/expectancy"],
        evidence: "Effect size of about 0.8 standard deviations - average treated person better than 80% of untreated"
      },
      
      "therapeutic_alliance": {
        definition: "A partnership between client and therapist to achieve the client's goals",
        importance: "One of the largest contributors to treatment outcome",
        research: "More than 1,000 research findings support its power",
        impact: "5-7 times greater effect on change than specific models or techniques",
        key_factors: ["agreement on goals", "agreement on tasks", "emotional bond"]
      },
      
      "therapist_factors": {
        definition: "Characteristics and actions of the therapist that influence outcomes",
        importance: "Most robust predictor of outcome of any factor studied",
        variance: "8-9% of outcome variance due to therapist vs 0-1% due to treatment type",
        effectiveness: "Best therapists achieve 50% less dropout and 50% more improvement"
      },
      
      "evidence_based_practice": {
        definition: "Integration of best research evidence with clinical expertise in context of patient characteristics",
        components: ["research evidence", "clinical expertise", "patient characteristics/culture/preferences"],
        emphasis: "Not just about techniques but about what works for specific clients"
      },
      
      "practice_based_evidence": {
        definition: "Gathering data on how treatment is working for particular client-therapist pairing",
        method: "Monitoring progress and providing feedback to therapist about client improvement",
        results: "Consistently yields clinically significant change, cuts deterioration in half"
      }
    };
  }

  // Load textbook content 
  async loadTextbook(bookKey) {
    if (bookKey === 'heart_and_soul_of_change') {
      this.textbooks[bookKey] = {
        title: "The Heart and Soul of Change: Delivering What Works in Therapy",
        authors: ["Barry L. Duncan", "Scott D. Miller", "Bruce E. Wampold", "Mark A. Hubble"],
        year: 2009,
        publisher: "American Psychological Association",
        concepts: this.extractConcepts()
      };
      
      this.loadedBooks.add(bookKey);
      this.buildConceptIndex(bookKey);
      return true;
    } else if (bookKey === 'mastery_of_love') {
      this.textbooks[bookKey] = {
        title: "The Mastery of Love: A Practical Guide to the Art of Relationship",
        authors: ["Don Miguel Ruiz"],
        year: 1999,
        publisher: "Amber-Allen Publishing",
        concepts: this.extractMasteryOfLoveConcepts()
      };
      
      this.loadedBooks.add(bookKey);
      this.buildConceptIndex(bookKey);
      return true;
    }
    return false;
  }

  // Build searchable concept index
  buildConceptIndex(bookKey) {
    const book = this.textbooks[bookKey];
    if (!book) return;

    Object.entries(book.concepts).forEach(([conceptKey, concept]) => {
      this.conceptIndex[conceptKey] = {
        book: bookKey,
        concept: concept,
        searchTerms: [conceptKey, ...(concept.components || [])]
      };
    });
  }

  // Get definition from specific textbook
  getDefinition(concept, bookKey = 'heart_and_soul_of_change') {
    if (this.textbooks[bookKey]?.concepts[concept]) {
      const conceptData = this.textbooks[bookKey].concepts[concept];
      return {
        definition: conceptData.definition,
        source: this.textbooks[bookKey].title,
        authors: this.textbooks[bookKey].authors,
        year: this.textbooks[bookKey].year,
        additional_info: {
          importance: conceptData.importance,
          evidence: conceptData.evidence || conceptData.research,
          components: conceptData.components
        }
      };
    }
    return null;
  }

  // Initialize knowledge base
  async initialize() {
    await this.loadTextbook('heart_and_soul_of_change');
    await this.loadTextbook('mastery_of_love');
    console.log('Knowledge base initialized with:', [...this.loadedBooks]);
    console.log('Available concepts:', this.getAvailableConcepts().length);
  }

  // Streamlined method to add new textbooks
  async addTextbook(bookKey, textbookData, conceptsExtractor) {
    this.textbooks[bookKey] = {
      ...textbookData,
      concepts: conceptsExtractor()
    };
    
    this.loadedBooks.add(bookKey);
    this.buildConceptIndex(bookKey);
    
    console.log(`Added textbook: ${textbookData.title}`);
    return true;
  }

  // Get smart recommendations based on user query
  getSmartRecommendations(userQuery) {
    const relevantBook = this.getRelevantTextbook(userQuery);
    const wisdom = this.getContextualWisdom(userQuery);
    
    return {
      primary_textbook: relevantBook,
      wisdom: wisdom,
      quick_concepts: this.getQuickConcepts(userQuery),
      suggested_questions: this.getSuggestedQuestions(userQuery)
    };
  }

  // Get quick concepts for immediate use
  getQuickConcepts(query) {
    const queryLower = query.toLowerCase();
    const allConcepts = this.getAvailableConcepts();
    
    return allConcepts.filter(concept => {
      const conceptWords = concept.replace(/_/g, ' ').split(' ');
      return conceptWords.some(word => queryLower.includes(word));
    }).slice(0, 3);
  }

  // Get suggested follow-up questions
  getSuggestedQuestions(query) {
    const relevantBook = this.getRelevantTextbook(query);
    const category = this.getBookCategory(relevantBook);
    
    if (category === 'psychology_research') {
      return [
        "What does research say about building stronger connections?",
        "How do therapeutic principles apply to dating?",
        "What makes relationships actually work long-term?"
      ];
    } else if (category === 'relationship_wisdom') {
      return [
        "How can I practice unconditional love in relationships?",
        "What are my emotional wounds telling me?",
        "How do I develop stronger self-love?"
      ];
    }
    
    return [
      "What should I know about healthy relationships?",
      "How can I be a better partner?",
      "What are the keys to lasting love?"
    ];
  }

  // Get all available concepts
  getAvailableConcepts() {
    return Object.keys(this.conceptIndex);
  }

  // Get the most relevant textbook for a query
  getRelevantTextbook(query) {
    const queryLower = query.toLowerCase();
    
    // Check for specific textbook mentions
    if (queryLower.includes('heart and soul') || queryLower.includes('therapeutic') || queryLower.includes('research')) {
      return 'heart_and_soul_of_change';
    }
    
    if (queryLower.includes('mastery of love') || queryLower.includes('miguel ruiz') || queryLower.includes('unconditional')) {
      return 'mastery_of_love';
    }
    
    // Check hierarchy use cases
    for (const [category, info] of Object.entries(this.textbookHierarchy)) {
      for (const useCase of info.use_cases) {
        if (queryLower.includes(useCase)) {
          return info.books[0]; // Return first book in category
        }
      }
    }
    
    // Default to relationship wisdom for most personal queries
    return 'mastery_of_love';
  }

  // Get comprehensive knowledge about a concept from relevant textbooks
  getComprehensiveKnowledge(concept) {
    const results = [];
    
    // Check all textbooks for the concept
    for (const bookKey of this.loadedBooks) {
      const definition = this.getDefinition(concept, bookKey);
      if (definition) {
        results.push({
          ...definition,
          book_key: bookKey,
          category: this.getBookCategory(bookKey)
        });
      }
    }
    
    return results;
  }

  // Get the category of a textbook
  getBookCategory(bookKey) {
    for (const [category, info] of Object.entries(this.textbookHierarchy)) {
      if (info.books.includes(bookKey)) {
        return category;
      }
    }
    return 'general';
  }

  // Get contextual wisdom for SoulAI responses
  getContextualWisdom(topic) {
    const relevantBook = this.getRelevantTextbook(topic);
    const bookInfo = this.textbooks[relevantBook];
    const category = this.getBookCategory(relevantBook);
    
    return {
      book: bookInfo,
      category: this.textbookHierarchy[category],
      suggested_concepts: this.getSuggestedConcepts(topic, relevantBook)
    };
  }

  // Get suggested concepts based on topic and textbook
  getSuggestedConcepts(topic, bookKey) {
    const book = this.textbooks[bookKey];
    if (!book) return [];
    
    const concepts = Object.keys(book.concepts);
    const topicLower = topic.toLowerCase();
    
    // Return concepts that relate to the topic
    return concepts.filter(concept => 
      concept.includes(topicLower) || 
      topicLower.includes(concept.replace(/_/g, ' '))
    ).slice(0, 3);
  }
}

// Export singleton instance
export default new KnowledgeBaseService();