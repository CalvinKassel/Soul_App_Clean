// Textbook Content Parser
// Reads and parses .md files to extract knowledge for AI agents
// Structures content for intelligent retrieval and deep conversations

import * as FileSystem from 'expo-file-system';
import TextbookAssetLoader from './TextbookAssetLoader';

class TextbookContentParser {
  constructor() {
    this.parsedContent = {};
    this.contentIndex = {};
    this.textbookPath = FileSystem.documentDirectory + 'assets/textbooks/';
  }

  // Parse all available textbooks
  async parseAllTextbooks() {
    // Initialize the TextbookAssetLoader
    await TextbookAssetLoader.initialize();
    
    const textbooks = TextbookAssetLoader.getAvailableTextbooks();
    
    console.log(`Starting to parse ${textbooks.length} textbooks...`);
    
    for (const textbook of textbooks) {
      await this.parseTextbook(textbook + '.md');
    }
    
    console.log(`All ${textbooks.length} textbooks parsed successfully`);
    return this.parsedContent;
  }

  // Parse a specific textbook
  async parseTextbook(filename) {
    try {
      const bookKey = filename.replace('.md', '');
      
      // In React Native, we need to handle assets differently
      // For now, let's create a method to load the content
      const content = await this.loadTextbookContent(bookKey);
      
      if (content) {
        this.parsedContent[bookKey] = await this.parseMarkdownContent(content, bookKey);
        this.buildContentIndex(bookKey);
        console.log(`Parsed ${bookKey} successfully`);
      }
    } catch (error) {
      console.error(`Error parsing ${filename}:`, error);
    }
  }

  // Load textbook content using TextbookAssetLoader
  async loadTextbookContent(bookKey) {
    try {
      const content = await TextbookAssetLoader.loadTextbook(bookKey);
      return content;
    } catch (error) {
      console.error(`Error loading textbook ${bookKey}:`, error);
      return null;
    }
  }
  
  // Get hardcoded content for key textbooks (fallback)
  getHardcodedContent(bookKey) {
    if (bookKey === 'mastery_of_love') {
      return `
# THE MASTERY OF LOVE
## A Practical Guide to the Art of Relationship
### Don Miguel Ruiz

## Chapter 1: The Wounded Mind

The biggest demon we have is our self-rejection. We are trained to reject ourselves, to be against ourselves. This is the beginning of our personal hell.

### Key Concepts:

**Emotional Wounds**
- Every human has emotional wounds from childhood
- These wounds create fear, jealousy, and defensive patterns
- Wounds make us believe we're not good enough for love
- The poison of these wounds affects all our relationships

**Self-Rejection**
- We reject ourselves before others can reject us
- This creates a wall that prevents real love from entering
- Self-rejection is the biggest obstacle to love
- It makes us seek love from others to fill the void

**The Emotional Poison**
- Negative emotions like jealousy, anger, fear contaminate relationships
- This poison comes from our unhealed wounds
- We spread this poison to others through our reactions
- Healing requires recognizing and neutralizing this poison

## Chapter 2: The Loss of Innocence

We are born with the capacity to love without conditions. But we learn to love with conditions, expectations, and requirements.

### Key Concepts:

**Unconditional Love**
- Love without expectations or requirements
- Love for the sake of love itself
- The natural state of children before conditioning
- The goal of spiritual and emotional healing

**Conditional Love**
- Love that comes with strings attached
- "I love you if..." or "I love you because..."
- Creates suffering and disappointment
- Destroys the purity of real love

**The Dream of Love**
- Society teaches us a false dream of romantic love
- This dream is based on need, not genuine love
- It creates unrealistic expectations
- The real dream is to love and be loved unconditionally

## Chapter 3: The Man Who Didn't Believe in Love

Story of a man who closes his heart to love because of past wounds. Illustrates how emotional wounds prevent us from experiencing true love.

### Key Concepts:

**Closing the Heart**
- Emotional wounds cause us to protect ourselves by closing our hearts
- This protection prevents both pain and love from entering
- A closed heart cannot give or receive love fully
- Healing requires the courage to open again

**Fear of Love**
- We fear love because it makes us vulnerable
- Past hurts create fear of being hurt again
- This fear is often stronger than the desire for love
- Overcoming fear is essential for experiencing love

**The Healing Process**
- Healing requires acknowledging our wounds
- We must learn to love ourselves first
- Forgiveness is essential for healing
- Opening our hearts again is an act of courage

## Chapter 4: The Track of Love

There are different tracks or paths of love - the track of fear and the track of love. We must choose which track to follow.

### Key Concepts:

**The Track of Fear**
- Based on possessiveness, jealousy, and control
- Creates suffering and conflict
- Driven by our emotional wounds
- Leads to the destruction of relationships

**The Track of Love**
- Based on respect, freedom, and genuine care
- Creates joy and connection
- Driven by our healed heart
- Leads to fulfilling relationships

**Choice in Love**
- Every moment we choose between fear and love
- We can change tracks at any time
- Our choice determines our experience
- Love is always available if we choose it

## Chapter 5: The Perfect Relationship

The perfect relationship is one where both people love without conditions and support each other's growth.

### Key Concepts:

**Perfect Relationship Defined**
- Both people are whole and complete individually
- Neither person needs the other to be happy
- Both choose to be together out of love, not need
- They support each other's dreams and growth

**Individual Wholeness**
- Each person must be complete within themselves
- You cannot love another until you love yourself
- Wholeness means not needing someone else to complete you
- This prevents codependency and neediness

**Supporting Growth**
- True love supports the other person's evolution
- This means accepting them as they are
- And supporting who they're becoming
- Not trying to change them to fit your needs

## Chapter 6: The Magical Kitchen

A metaphor about a person who has a magical kitchen that produces the most delicious food. Shows how someone who loves themselves doesn't need love from others.

### Key Concepts:

**The Magical Kitchen Metaphor**
- Represents being full of love for yourself
- When you're full of love, you don't need it from others
- Others may offer love, but you're not desperate for it
- You can choose relationships freely, not from need

**Self-Love as Foundation**
- Self-love is the foundation of all healthy relationships
- When you love yourself, you attract healthier partners
- You don't accept poor treatment because you know your worth
- Self-love prevents neediness and desperation

**Freedom in Relationships**
- When you don't need love, you're free to give it
- You can choose partners based on joy, not need
- You won't tolerate disrespect or abuse
- Your relationships become expressions of love, not survival

## Chapter 7: The Dream of the Second Attention

About the spiritual practice of lucid dreaming applied to relationships - becoming conscious of our patterns and choosing love.

### Key Concepts:

**Conscious Relationships**
- Becoming aware of our unconscious patterns
- Choosing our responses rather than reacting automatically
- Seeing our relationships clearly without illusion
- Taking responsibility for our part in relationship dynamics

**Breaking Unconscious Patterns**
- We often repeat the same relationship mistakes
- These patterns come from our wounds and conditioning
- Awareness is the first step to breaking patterns
- We can choose new responses and create new patterns

**The Power of Choice**
- Every interaction is a choice between love and fear
- We can choose to respond with love even when hurt
- Our choices create our relationship reality
- Love is always available as a choice

## Chapter 8: The Mastery of Love

The final chapter about achieving mastery in love - the ability to love unconditionally and create heaven in our relationships.

### Key Concepts:

**Mastery of Love Defined**
- The ability to love without conditions
- Not being affected by others' emotional poison
- Creating love wherever you go
- Being immune to rejection and criticism

**Creating Heaven in Relationships**
- Heaven is a state of love and peace
- We can create this in our relationships
- It starts with healing our own wounds
- And choosing love in every interaction

**The Reward of Mastery**
- Freedom from fear in relationships
- The ability to love fully and openly
- Attracting healthy, loving partners
- Creating relationships based on joy, not need

## Practical Applications:

**Daily Practices for Love Mastery:**
1. Practice self-love and self-acceptance daily
2. Recognize when you're operating from fear vs. love
3. Choose love in your responses to others
4. Work on healing your emotional wounds
5. Don't take others' actions personally
6. Express love freely without expecting anything in return
7. Create boundaries that protect your peace
8. Forgive yourself and others regularly

**Red Flags to Avoid:**
- Relationships based on need rather than love
- Trying to change or fix someone
- Accepting disrespect or abuse
- Losing yourself in a relationship
- Conditional love ("I love you if...")
- Emotional manipulation or control
- Relationships that drain your energy

**Signs of Healthy Love:**
- You feel more like yourself in the relationship
- Your partner supports your growth and dreams
- There's mutual respect and freedom
- You choose each other daily, not from need
- Communication is open and honest
- You both take responsibility for your emotions
- The relationship adds joy to your life
`;
    }
    
    if (bookKey === 'heart_and_soul_of_change') {
      return `
# THE HEART AND SOUL OF CHANGE
## Delivering What Works in Therapy
### Barry L. Duncan, Scott D. Miller, Bruce E. Wampold, Mark A. Hubble

## Introduction: The Common Factors Revolution

Decades of research have revealed that the specific techniques used in therapy are far less important than the common factors present in all effective therapeutic relationships.

### Key Research Findings:

**The Dodo Bird Verdict**
- All therapies are roughly equal in effectiveness
- Named after the Dodo bird in Alice in Wonderland: "Everyone has won and all must have prizes"
- Specific techniques account for only 15% of therapeutic outcome
- The therapeutic relationship accounts for 30% of change

**Common Factors Framework**
- Client/extratherapeutic factors: 40% of change
- Therapeutic relationship: 30% of change
- Hope and expectancy: 15% of change
- Techniques/models: 15% of change

## Chapter 1: The Therapeutic Alliance

The therapeutic alliance is the most robust predictor of treatment outcome. It's more important than any specific technique or approach.

### Key Concepts:

**Components of Therapeutic Alliance**
- Agreement on goals: Both parties agree on what they're working toward
- Agreement on tasks: Both agree on how they'll work together
- Emotional bond: A sense of connection and trust

**Building Strong Alliance**
- Listen actively and empathetically
- Validate the client's experience
- Collaborate on treatment goals
- Be genuine and authentic
- Adapt your approach to the client's needs
- Regularly check in about the relationship

**Alliance Ruptures and Repairs**
- Ruptures in the alliance are normal and can be beneficial
- Addressing ruptures directly strengthens the relationship
- Repair involves acknowledging the issue and working through it
- Successful repair builds trust and safety

## Chapter 2: The Heroic Client

Clients are the heroes of their own change process. They bring the motivation, resources, and capacity for change.

### Key Concepts:

**Client as Hero**
- Clients do the work of change
- They have innate healing capacity
- Success depends more on client factors than therapist techniques
- Therapists facilitate, but clients create change

**Client Strengths and Resources**
- Every client has inherent strengths
- These strengths are often overlooked in problem-focused approaches
- Identifying and utilizing strengths accelerates change
- Resilience is more common than pathology

**Motivation and Readiness**
- Client motivation is crucial for change
- Motivation can be enhanced through the therapeutic relationship
- Readiness for change varies and can be influenced
- Meeting clients where they are increases engagement

## Chapter 3: The Therapist as Person

The therapist's personal qualities matter more than their technical skills or theoretical orientation.

### Key Concepts:

**Therapist Effects**
- Some therapists consistently achieve better outcomes
- The difference is 8-9 times larger than treatment type differences
- Effective therapists have certain personal qualities
- These qualities can be developed with awareness and practice

**Qualities of Effective Therapists**
- Empathy and emotional intelligence
- Flexibility and adaptability
- Genuineness and authenticity
- Positive regard for clients
- Cultural sensitivity
- Ability to form strong relationships

**The Wounded Healer**
- Therapists' own healing experiences inform their work
- Personal struggles can create empathy and connection
- Self-awareness prevents projection and countertransference
- Ongoing personal work is essential

## Chapter 4: Evidence-Based Practice

True evidence-based practice integrates research evidence with clinical expertise and client preferences.

### Key Concepts:

**Three Pillars of Evidence-Based Practice**
1. Research evidence: What studies show works
2. Clinical expertise: Therapist's knowledge and skills
3. Client characteristics: Culture, preferences, values

**Beyond Technique-Focused Research**
- Most research focuses on techniques, not relationships
- Relationship factors are harder to study but more important
- Context and individual differences matter greatly
- One-size-fits-all approaches are ineffective

**Practice-Based Evidence**
- Systematically monitoring client progress
- Using feedback to improve outcomes
- Adapting treatment based on what's working
- Continuous improvement rather than rigid adherence

## Chapter 5: The Heart of Healing

Healing happens in the context of relationship. The therapeutic relationship provides the safety and support necessary for change.

### Key Concepts:

**Relationship as Healing Context**
- Safety enables vulnerability and risk-taking
- Trust allows for honest exploration
- Acceptance creates space for growth
- Connection provides corrective emotional experience

**Corrective Emotional Experience**
- Experiencing a different kind of relationship
- Healing old wounds through new interactions
- Updating internal models of relationships
- Building capacity for healthy connection

**The Role of Love in Healing**
- Therapeutic love is professional but genuine
- It involves caring without attachment
- Unconditional positive regard facilitates growth
- Love doesn't mean having no boundaries

## Chapter 6: Cultural Considerations

Effective therapy must account for cultural differences and adapt to diverse client populations.

### Key Concepts:

**Cultural Competence**
- Understanding your own cultural background
- Learning about clients' cultural contexts
- Adapting approaches to fit cultural values
- Addressing systemic and social issues

**Avoiding Cultural Imposition**
- Not assuming your values are universal
- Being curious about different perspectives
- Respecting different ways of understanding problems
- Collaborating across cultural differences

**Social Justice in Therapy**
- Recognizing impact of oppression and discrimination
- Addressing systemic issues, not just individual problems
- Advocating for clients when appropriate
- Creating inclusive and affirming environments

## Chapter 7: The Feedback Revolution

Systematically collecting and using client feedback dramatically improves therapeutic outcomes.

### Key Concepts:

**Client Feedback Systems**
- Regular measurement of therapeutic progress
- Immediate feedback about the relationship
- Early identification of treatment failure
- Adjustment of approach based on feedback

**Benefits of Feedback**
- Reduces dropout rates by 50%
- Improves outcomes for difficult cases
- Prevents therapist drift and complacency
- Empowers clients in their treatment

**Implementing Feedback**
- Use brief, valid outcome measures
- Collect feedback regularly (every session)
- Discuss results openly with clients
- Adjust treatment based on feedback

## Chapter 8: Training and Supervision

Training effective therapists requires focus on relationship skills, not just techniques.

### Key Concepts:

**Relationship-Focused Training**
- Emphasize alliance building skills
- Practice empathy and emotional attunement
- Develop self-awareness and reflection
- Learn to manage countertransference

**Supervision for Growth**
- Focus on therapist development, not just case management
- Use supervision to explore relationship dynamics
- Provide feedback about therapist strengths and growth areas
- Create safe space for vulnerability and learning

**Continuous Learning**
- Therapy is a lifelong learning process
- Stay curious and open to new approaches
- Regularly seek feedback and consultation
- Engage in ongoing personal development

## Practical Applications:

**Building Therapeutic Alliance:**
1. Start with genuine curiosity about the client's experience
2. Validate their feelings and perspective
3. Collaborate on setting goals that matter to them
4. Regularly check in about the relationship
5. Be willing to adapt your approach
6. Address any tensions or misunderstandings directly
7. Show genuine care and investment in their wellbeing

**Monitoring Progress:**
1. Use brief outcome measures at each session
2. Ask directly about what's helping and what isn't
3. Notice non-verbal cues and changes in engagement
4. Track progress toward agreed-upon goals
5. Adjust approach when progress stalls
6. Celebrate successes and progress made

**Developing as a Therapist:**
1. Engage in ongoing personal therapy or development
2. Seek regular supervision and consultation
3. Study your own patterns and triggers
4. Practice mindfulness and self-awareness
5. Learn from both successes and failures
6. Stay humble and curious about your work
7. Remember that relationship skills matter most

**Key Principles for Effective Practice:**
- The relationship is the intervention
- Clients are the agents of their own change
- Feedback is essential for improvement
- Flexibility matters more than technique
- Personal qualities outweigh technical skills
- Cultural sensitivity is crucial
- Hope and expectancy facilitate change
- Common factors are more important than specific approaches
`;
    }
    
    return null;
  }

  // Parse markdown content into structured data
  async parseMarkdownContent(content, bookKey) {
    const lines = content.split('\n');
    const parsedData = {
      title: '',
      authors: [],
      chapters: [],
      concepts: {},
      keyQuotes: [],
      practicalApplications: [],
      searchableContent: content.toLowerCase()
    };

    let currentChapter = null;
    let currentSection = null;
    let currentConcept = null;
    let isInKeyQuotes = false;
    let isInPracticalApps = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Extract title
      if (line.startsWith('# ') && !parsedData.title) {
        parsedData.title = line.substring(2).trim();
      }
      
      // Extract authors
      if (line.startsWith('### ') && line.includes('Author') || 
          (line.includes('Duncan') || line.includes('Ruiz'))) {
        const authorMatch = line.match(/### (.+)/);
        if (authorMatch) {
          parsedData.authors.push(authorMatch[1].trim());
        }
      }
      
      // Extract chapters
      if (line.startsWith('## ') && !line.includes('Key Concepts') && 
          !line.includes('Practical Applications')) {
        currentChapter = {
          title: line.substring(3).trim(),
          content: '',
          concepts: {},
          keyPoints: []
        };
        parsedData.chapters.push(currentChapter);
      }
      
      // Extract key concepts
      if (line.startsWith('**') && line.endsWith('**')) {
        const conceptName = line.substring(2, line.length - 2).trim();
        currentConcept = {
          name: conceptName,
          definition: '',
          details: [],
          chapter: currentChapter?.title || 'General'
        };
        parsedData.concepts[conceptName.toLowerCase().replace(/\s+/g, '_')] = currentConcept;
      }
      
      // Extract concept details
      if (line.startsWith('- ') && currentConcept) {
        currentConcept.details.push(line.substring(2).trim());
      }
      
      // Extract practical applications
      if (line.includes('Practical Applications') || isInPracticalApps) {
        isInPracticalApps = true;
        if (line.startsWith('1. ') || line.startsWith('2. ') || line.match(/^\d+\./)) {
          parsedData.practicalApplications.push(line.trim());
        }
      }
      
      // Add content to current chapter
      if (currentChapter && line) {
        currentChapter.content += line + '\n';
      }
    }

    return parsedData;
  }

  // Build searchable content index
  buildContentIndex(bookKey) {
    const book = this.parsedContent[bookKey];
    if (!book) return;

    this.contentIndex[bookKey] = {
      concepts: Object.keys(book.concepts),
      chapters: book.chapters.map(c => c.title),
      searchTerms: this.extractSearchTerms(book),
      keyPhrases: this.extractKeyPhrases(book)
    };
  }

  // Extract search terms from content
  extractSearchTerms(book) {
    const terms = new Set();
    
    // Add concept names
    Object.keys(book.concepts).forEach(concept => {
      terms.add(concept);
      terms.add(concept.replace(/_/g, ' '));
    });
    
    // Add chapter titles
    book.chapters.forEach(chapter => {
      const words = chapter.title.toLowerCase().split(' ');
      words.forEach(word => terms.add(word));
    });
    
    return Array.from(terms);
  }

  // Extract key phrases for better matching
  extractKeyPhrases(book) {
    const phrases = [];
    
    // Extract from concept definitions
    Object.values(book.concepts).forEach(concept => {
      if (concept.details && concept.details.length > 0) {
        concept.details.forEach(detail => {
          phrases.push(detail.toLowerCase());
        });
      }
    });
    
    return phrases;
  }

  // Search for content based on query
  searchContent(query, bookKey = null) {
    const queryLower = query.toLowerCase();
    const results = [];
    
    const booksToSearch = bookKey ? [bookKey] : Object.keys(this.parsedContent);
    
    for (const book of booksToSearch) {
      const bookData = this.parsedContent[book];
      if (!bookData) continue;
      
      // Search concepts
      for (const [conceptKey, concept] of Object.entries(bookData.concepts)) {
        if (conceptKey.includes(queryLower) || 
            concept.name.toLowerCase().includes(queryLower) ||
            concept.details.some(detail => detail.toLowerCase().includes(queryLower))) {
          results.push({
            type: 'concept',
            book: book,
            concept: concept,
            relevance: this.calculateRelevance(queryLower, concept)
          });
        }
      }
      
      // Search chapters
      for (const chapter of bookData.chapters) {
        if (chapter.title.toLowerCase().includes(queryLower) ||
            chapter.content.toLowerCase().includes(queryLower)) {
          results.push({
            type: 'chapter',
            book: book,
            chapter: chapter,
            relevance: this.calculateRelevance(queryLower, chapter)
          });
        }
      }
    }
    
    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  // Calculate relevance score for search results
  calculateRelevance(query, item) {
    let score = 0;
    const text = (item.name || item.title || '').toLowerCase() + ' ' + 
                 (item.details?.join(' ') || item.content || '').toLowerCase();
    
    // Exact match in title/name
    if ((item.name || item.title || '').toLowerCase().includes(query)) {
      score += 10;
    }
    
    // Frequency of query terms
    const queryTerms = query.split(' ');
    queryTerms.forEach(term => {
      const matches = (text.match(new RegExp(term, 'g')) || []).length;
      score += matches * 2;
    });
    
    return score;
  }

  // Get deep knowledge about a specific topic
  getDeepKnowledge(topic, bookKey = null) {
    const searchResults = this.searchContent(topic, bookKey);
    const deepKnowledge = {
      topic: topic,
      comprehensive_overview: '',
      key_concepts: [],
      practical_applications: [],
      related_topics: [],
      quotes_and_insights: []
    };
    
    // Compile comprehensive overview
    searchResults.slice(0, 5).forEach(result => {
      if (result.type === 'concept') {
        deepKnowledge.key_concepts.push({
          name: result.concept.name,
          definition: result.concept.details.join(' '),
          source: result.book,
          chapter: result.concept.chapter
        });
      } else if (result.type === 'chapter') {
        deepKnowledge.comprehensive_overview += result.chapter.content.substring(0, 500) + '...\n\n';
      }
    });
    
    return deepKnowledge;
  }

  // Get content for specific agent expertise
  getContentForExpertise(expertise, bookKey = null) {
    const relevantContent = [];
    
    expertise.forEach(expertiseArea => {
      const searchResults = this.searchContent(expertiseArea, bookKey);
      relevantContent.push(...searchResults.slice(0, 3));
    });
    
    return relevantContent;
  }
}

export default new TextbookContentParser();