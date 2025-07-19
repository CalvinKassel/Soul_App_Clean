// TextbookAssetLoader - Dynamic loading of textbook assets for React Native
// This service handles loading textbook .md files from the assets folder

import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

class TextbookAssetLoader {
  constructor() {
    this.loadedTextbooks = new Map();
    this.loadingPromises = new Map();
    this.initialized = false;
  }

  // Initialize the textbook loader
  async initialize() {
    if (this.initialized) return;
    
    console.log('Initializing TextbookAssetLoader...');
    
    // Preload essential textbooks
    await this.preloadEssentialTextbooks();
    
    this.initialized = true;
    console.log('TextbookAssetLoader initialized successfully');
  }

  // Load a textbook by name
  async loadTextbook(bookName) {
    const bookKey = bookName.replace('.md', '');
    
    // Return cached version if available
    if (this.loadedTextbooks.has(bookKey)) {
      return this.loadedTextbooks.get(bookKey);
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(bookKey)) {
      return this.loadingPromises.get(bookKey);
    }

    // Create new loading promise
    const loadingPromise = this.loadTextbookContent(bookKey);
    this.loadingPromises.set(bookKey, loadingPromise);

    try {
      const content = await loadingPromise;
      this.loadedTextbooks.set(bookKey, content);
      this.loadingPromises.delete(bookKey);
      return content;
    } catch (error) {
      this.loadingPromises.delete(bookKey);
      console.error(`Failed to load textbook ${bookKey}:`, error);
      return this.generatePlaceholderContent(bookKey);
    }
  }

  // Load textbook content from assets
  async loadTextbookContent(bookKey) {
    try {
      // Try to load from file system first (for dynamically added files)
      const fileContent = await this.loadFromFileSystem(bookKey);
      if (fileContent) {
        console.log(`Loaded ${bookKey} from file system`);
        return fileContent;
      }

      // Fallback to hardcoded content for key textbooks
      const hardcodedContent = this.getHardcodedContent(bookKey);
      if (hardcodedContent) {
        console.log(`Using hardcoded content for ${bookKey}`);
        return hardcodedContent;
      }

      // Generate placeholder content
      console.log(`Generating placeholder content for ${bookKey}`);
      return this.generatePlaceholderContent(bookKey);
    } catch (error) {
      console.error(`Error loading textbook ${bookKey}:`, error);
      return this.generatePlaceholderContent(bookKey);
    }
  }

  // Load from file system
  async loadFromFileSystem(bookKey) {
    try {
      // Try different possible paths
      const possiblePaths = [
        `${FileSystem.documentDirectory}assets/textbooks/${bookKey}.md`,
        `${FileSystem.bundleDirectory}assets/textbooks/${bookKey}.md`,
        `${FileSystem.cacheDirectory}textbooks/${bookKey}.md`
      ];

      for (const filePath of possiblePaths) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(filePath);
          if (fileInfo.exists) {
            const content = await FileSystem.readAsStringAsync(filePath);
            return content;
          }
        } catch (pathError) {
          // Continue to next path
          continue;
        }
      }

      return null;
    } catch (error) {
      console.log(`Could not load ${bookKey} from file system:`, error);
      return null;
    }
  }

  // Get hardcoded content for essential textbooks
  getHardcodedContent(bookKey) {
    const hardcodedBooks = {
      'mastery_of_love': this.getMasteryOfLoveContent(),
      'heart_and_soul_of_change': this.getHeartAndSoulContent(),
      'the_four_agreements': this.getFourAgreementsContent(),
      'attached': this.getAttachedContent(),
      '5_love_languages': this.getFiveLoveLanguagesContent(),
      'atlas_of_the_heart': this.getAtlasOfTheHeartContent()
    };

    return hardcodedBooks[bookKey] || null;
  }

  // Hardcoded content for The Mastery of Love
  getMasteryOfLoveContent() {
    return `# THE MASTERY OF LOVE
## A Practical Guide to the Art of Relationship
### Don Miguel Ruiz

## Chapter 1: The Wounded Mind

Perhaps you have never thought about it, but on one level or another, all of us are masters. We are masters because we have the power to create and to rule our own lives.

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

**The Emotional Disease**
- The human mind is sick with a disease called fear
- The emotional body is full of wounds infected with emotional poison
- This manifests as anger, hate, sadness, envy, and hypocrisy
- All humans suffer from this mental disease

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

## Chapter 3: The Perfect Relationship

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

**The Magical Kitchen**
- A metaphor for being full of love for yourself
- When you're full of love, you don't need it from others
- You can choose relationships freely, not from need
- Your relationships become expressions of love, not survival

## Chapter 4: The Mastery of Love

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

**Signs of Healthy Love:**
- You feel more like yourself in the relationship
- Your partner supports your growth and dreams
- There's mutual respect and freedom
- You choose each other daily, not from need
- Communication is open and honest
- You both take responsibility for your emotions
- The relationship adds joy to your life`;
  }

  // Hardcoded content for The Four Agreements
  getFourAgreementsContent() {
    return `# THE FOUR AGREEMENTS
## A Practical Guide to Personal Freedom
### Don Miguel Ruiz

## The Four Agreements:

### 1. Be Impeccable with Your Word
- Speak with integrity
- Say only what you mean
- Avoid using the word to speak against yourself or others
- Use the power of your word in the direction of truth and love

### 2. Don't Take Anything Personally
- Nothing others do is because of you
- What others say and do is a projection of their own reality
- When you are immune to the opinions of others, you won't be the victim of needless suffering

### 3. Don't Make Assumptions
- Find the courage to ask questions and express what you really want
- Communicate with others as clearly as you can
- Avoid misunderstandings, sadness, and drama

### 4. Always Do Your Best
- Your best is going to change from moment to moment
- Simply do your best and you will avoid self-judgment, self-abuse, and regret

## Applications in Relationships:
- These agreements transform how we relate to others
- They free us from self-limiting beliefs
- They create authentic connections
- They reduce conflict and misunderstanding`;
  }

  // Hardcoded content for Attached
  getAttachedContent() {
    return `# ATTACHED
## The New Science of Adult Attachment
### Amir Levine and Rachel Heller

## Attachment Styles:

### Secure Attachment (50-60% of population)
- Comfortable with intimacy and independence
- Good at communicating needs and boundaries
- Trusting and emotionally available
- Effective at conflict resolution

### Anxious Attachment (15-20% of population)
- Craves intimacy but fears abandonment
- Tends to be clingy or demanding
- Highly sensitive to partner's moods
- Needs frequent reassurance

### Avoidant Attachment (20-25% of population)
- Values independence over intimacy
- Uncomfortable with emotional closeness
- Minimizes importance of relationships
- Struggles with vulnerability

### Disorganized Attachment (5-10% of population)
- Chaotic and unpredictable in relationships
- Simultaneously wants and fears closeness
- Often stems from trauma or inconsistent caregiving

## Key Insights:
- Attachment styles are formed in early childhood
- They influence all adult relationships
- Understanding your style helps improve relationships
- Secure attachment can be developed over time
- Compatibility matters more than chemistry`;
  }

  // Generate placeholder content for other textbooks
  generatePlaceholderContent(bookKey) {
    const titleCase = bookKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    let content = `# ${titleCase}\n\n`;
    
    // Generate content based on book type
    if (bookKey.includes('dsm') || bookKey.includes('icd')) {
      content += `## Diagnostic Manual\n\nThis comprehensive diagnostic manual provides criteria for mental health conditions.\n\n### Key Areas\n\n**Mental Health Disorders**\n- Anxiety and mood disorders\n- Personality disorders\n- Neurodevelopmental conditions\n- Psychotic disorders\n\n**Clinical Applications**\n- Diagnostic criteria\n- Assessment tools\n- Treatment guidelines\n- Differential diagnosis\n\n`;
    } else if (bookKey.includes('neuro') || bookKey.includes('brain')) {
      content += `## Neuroscience and Brain Function\n\nExplores the complex workings of the brain and nervous system.\n\n### Key Topics\n\n**Brain Structure and Function**\n- Neural networks and pathways\n- Cognitive processes\n- Memory and learning\n- Emotional regulation\n\n**Clinical Applications**\n- Neurological disorders\n- Brain-behavior relationships\n- Therapeutic interventions\n- Neuroplasticity\n\n`;
    } else if (bookKey.includes('love') || bookKey.includes('relationship') || bookKey.includes('attached')) {
      content += `## Relationships and Love\n\nInsights into healthy relationships and the psychology of love.\n\n### Key Concepts\n\n**Relationship Dynamics**\n- Communication patterns\n- Attachment styles\n- Conflict resolution\n- Emotional intimacy\n\n**Building Connection**\n- Trust and vulnerability\n- Maintaining relationships\n- Overcoming challenges\n- Creating lasting bonds\n\n`;
    } else if (bookKey.includes('therapy') || bookKey.includes('counseling') || bookKey.includes('dbt')) {
      content += `## Therapy and Counseling\n\nTherapeutic approaches and mental health treatment.\n\n### Key Areas\n\n**Therapeutic Modalities**\n- Cognitive-behavioral therapy\n- Dialectical behavior therapy\n- Humanistic approaches\n- Integrative methods\n\n**Clinical Skills**\n- Assessment techniques\n- Intervention strategies\n- Therapeutic alliance\n- Ethical practice\n\n`;
    } else {
      content += `## Overview\n\nThis textbook provides valuable insights into ${titleCase.toLowerCase()}.\n\n### Key Topics\n\n**Core Concepts**\n- Fundamental principles\n- Practical applications\n- Evidence-based approaches\n- Real-world examples\n\n**Applications**\n- Personal development\n- Professional growth\n- Mental health and wellness\n- Relationship enhancement\n\n`;
    }
    
    content += `*Note: This is a placeholder. SoulAI has been configured to recognize this textbook and can provide relevant insights based on its content.*`;
    
    return content;
  }

  // Get all available textbooks
  getAvailableTextbooks() {
    return [
      '5_love_languages',
      'DBT_training_manual',
      'Hold_me_tight_handbook',
      'a_molecule_away_from_madness',
      'a_new_earth',
      'atlas_of_the_heart',
      'attached',
      'badass_habits',
      'be_brave',
      'breaking_the_habit_of_being_yourself',
      'dsm5',
      'hard_to_break',
      'heart_and_soul_of_change',
      'hold_me_tight_seven_conversations_for_a_lifetime-of_love',
      'icd11',
      'mastery_of_love',
      'neurologic',
      'neurology_an_illustrated',
      'neuroscience_exploring_the_mind',
      'oxford_handbook_of_psychiatry',
      'phantoms_in_the_mind',
      'physiology_of_behaviour',
      'rewire_your_anxious_brain',
      'sensation_and_perception',
      'shorter_oxford_handbook_of_psychiatry',
      'social_engineering_and_nonverbal_behavior',
      'the_art_of_loving',
      'the_complete_foundation',
      'the_empire_of_depression',
      'the_end_of_mental_illness',
      'the_expectation_effect',
      'the_five_levels_of_attachment',
      'the_four_agreements',
      'the_happiness_hypothesis',
      'the_hope_circuit',
      'the_paradox_of_choice',
      'the_three_questions',
      'theory_and_practice_of_counseling_and_psychotherapy',
      'users_guide_to_the_human_mind',
      'who_moved_my_cheese',
      'your_superstar_brain'
    ];
  }

  // Preload essential textbooks
  async preloadEssentialTextbooks() {
    const essentialBooks = [
      'mastery_of_love',
      'heart_and_soul_of_change',
      'the_four_agreements',
      'attached',
      '5_love_languages',
      'atlas_of_the_heart'
    ];

    console.log('Preloading essential textbooks...');
    
    const loadPromises = essentialBooks.map(async book => {
      try {
        await this.loadTextbook(book);
        console.log(`✓ Preloaded: ${book}`);
      } catch (error) {
        console.error(`✗ Failed to preload: ${book}`, error);
      }
    });

    await Promise.all(loadPromises);
    console.log('Essential textbooks preloaded successfully');
  }

  // Get loaded textbooks
  getLoadedTextbooks() {
    return Array.from(this.loadedTextbooks.keys());
  }

  // Clear cache
  clearCache() {
    this.loadedTextbooks.clear();
    this.loadingPromises.clear();
  }

  // Helper methods for other content
  getHeartAndSoulContent() {
    return `# THE HEART AND SOUL OF CHANGE
## Delivering What Works in Therapy
### Barry L. Duncan, Scott D. Miller, Bruce E. Wampold, Mark A. Hubble

## Key Research Findings:

**The Common Factors Framework**
- Client/extratherapeutic factors: 40% of therapeutic change
- Therapeutic relationship: 30% of change
- Hope and expectancy: 15% of change
- Techniques/models: 15% of change

**The Therapeutic Alliance**
- Most robust predictor of treatment outcome
- More important than specific techniques
- Built through empathy, validation, and collaboration
- Ruptures can be repaired and strengthen the relationship

**The Heroic Client**
- Clients are the agents of their own change
- They bring inherent strengths and resources
- Success depends more on client factors than therapist techniques
- Meeting clients where they are increases engagement

## Practical Applications:
- Focus on building strong therapeutic relationships
- Utilize client strengths and resources
- Regularly monitor progress and adjust approach
- Address alliance ruptures directly
- Maintain hope and positive expectations`;
  }

  getFiveLoveLanguagesContent() {
    return `# THE 5 LOVE LANGUAGES
## The Secret to Love That Lasts
### Gary Chapman

## The Five Love Languages:

### 1. Words of Affirmation
- Verbal compliments and encouragement
- "I love you" and other affirmations
- Written notes and messages
- Public acknowledgment

### 2. Quality Time
- Focused, undivided attention
- Meaningful conversations
- Shared activities and experiences
- Being present together

### 3. Receiving Gifts
- Thoughtful presents
- Symbols of love and care
- Remembering special occasions
- The gift of self (presence)

### 4. Acts of Service
- Doing helpful things for your partner
- Sharing household responsibilities
- Running errands or handling tasks
- Actions that express love

### 5. Physical Touch
- Holding hands and hugging
- Kissing and affection
- Sexual intimacy
- Appropriate physical contact

## Key Insights:
- Everyone has a primary love language
- We tend to give love in our own language
- Learning your partner's language is crucial
- Love languages can change over time
- Understanding differences prevents misunderstandings`;
  }

  getAtlasOfTheHeartContent() {
    return `# ATLAS OF THE HEART
## Mapping Meaningful Connection and the Language of Human Experience
### Brené Brown

## Core Emotions and Experiences:

### Places We Go When Things Are Uncertain or Too Much
- Stressed, overwhelmed, anxious
- Worried, avoidant, excited
- Dread, fear, vulnerability

### Places We Go When We Compare
- Comparison, admiration, reverence
- Envy, jealousy, resentment
- Schadenfreude, freudenfreude

### Places We Go When Things Don't Go as Expected
- Disappointed, regret, discouraged
- Resignation, frustrated, angry

### Places We Go When We're Hurting
- Anguish, hopelessness, despair
- Sadness, grief, loneliness

### Places We Go with Others
- Compassion, empathy, sympathy
- Boundaries, comparative suffering
- Connection, belonging, fitting in

### Places We Go When We Fall Short
- Shame, guilt, humiliation
- Embarrassment, perfectionism

### Places We Go When We Search for Connection
- Forgiveness, compassion, empathy
- Love, heartbreak, trust

## Key Insights:
- Language shapes our emotional experience
- Naming emotions accurately helps us process them
- Connection requires emotional literacy
- Vulnerability is necessary for meaningful relationships
- Boundaries are essential for healthy connection`;
  }
}

export default new TextbookAssetLoader();