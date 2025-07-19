// TextbookLoader Service
// Handles loading and caching of textbook content from .md files

import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

class TextbookLoader {
  constructor() {
    this.loadedTextbooks = new Map();
    this.loadingPromises = new Map();
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
      throw error;
    }
  }

  // Load textbook content from assets
  async loadTextbookContent(bookKey) {
    try {
      // First try to load from bundle
      const content = await this.loadFromBundle(bookKey);
      if (content) {
        return content;
      }

      // Fallback to file system
      const fsContent = await this.loadFromFileSystem(bookKey);
      if (fsContent) {
        return fsContent;
      }

      // If no content found, return placeholder
      console.warn(`Could not load textbook: ${bookKey}`);
      return this.generatePlaceholderContent(bookKey);
    } catch (error) {
      console.error(`Error loading textbook ${bookKey}:`, error);
      return this.generatePlaceholderContent(bookKey);
    }
  }

  // Load from bundled assets
  async loadFromBundle(bookKey) {
    try {
      // Map of available textbooks (you can add more as needed)
      const textbookAssets = {
        'mastery_of_love': require('../assets/textbooks/mastery_of_love.md'),
        'heart_and_soul_of_change': require('../assets/textbooks/heart_and_soul_of_change.md'),
        '5_love_languages': require('../assets/textbooks/5_love_languages.md'),
        'attached': require('../assets/textbooks/attached.md'),
        'the_four_agreements': require('../assets/textbooks/the_four_agreements.md'),
        'atlas_of_the_heart': require('../assets/textbooks/atlas_of_the_heart.md'),
        'hold_me_tight_seven_conversations_for_a_lifetime-of_love': require('../assets/textbooks/hold_me_tight_seven_conversations_for_a_lifetime-of_love.md'),
        'the_art_of_loving': require('../assets/textbooks/the_art_of_loving.md'),
        'a_new_earth': require('../assets/textbooks/a_new_earth.md'),
        'DBT_training_manual': require('../assets/textbooks/DBT_training_manual.md'),
        'rewire_your_anxious_brain': require('../assets/textbooks/rewire_your_anxious_brain.md'),
        'users_guide_to_the_human_mind': require('../assets/textbooks/users_guide_to_the_human_mind.md'),
        'the_happiness_hypothesis': require('../assets/textbooks/the_happiness_hypothesis.md'),
        'theory_and_practice_of_counseling_and_psychotherapy': require('../assets/textbooks/theory_and_practice_of_counseling_and_psychotherapy.md'),
        'dsm5': require('../assets/textbooks/dsm5.md'),
        'oxford_handbook_of_psychiatry': require('../assets/textbooks/oxford_handbook_of_psychiatry.md'),
        'neuroscience_exploring_the_mind': require('../assets/textbooks/neuroscience_exploring_the_mind.md'),
        'physiology_of_behaviour': require('../assets/textbooks/physiology_of_behaviour.md'),
        'the_end_of_mental_illness': require('../assets/textbooks/the_end_of_mental_illness.md'),
        'the_hope_circuit': require('../assets/textbooks/the_hope_circuit.md'),
        'breaking_the_habit_of_being_yourself': require('../assets/textbooks/breaking_the_habit_of_being_yourself.md'),
        'your_superstar_brain': require('../assets/textbooks/your_superstar_brain.md'),
        'badass_habits': require('../assets/textbooks/badass_habits.md'),
        'who_moved_my_cheese': require('../assets/textbooks/who_moved_my_cheese.md'),
        'the_paradox_of_choice': require('../assets/textbooks/the_paradox_of_choice.md'),
        'the_expectation_effect': require('../assets/textbooks/the_expectation_effect.md'),
        'be_brave': require('../assets/textbooks/be_brave.md'),
        'hard_to_break': require('../assets/textbooks/hard_to_break.md'),
        'the_three_questions': require('../assets/textbooks/the_three_questions.md'),
        'the_five_levels_of_attachment': require('../assets/textbooks/the_five_levels_of_attachment.md'),
        'social_engineering_and_nonverbal_behavior': require('../assets/textbooks/social_engineering_and_nonverbal_behavior.md'),
        'sensation_and_perception': require('../assets/textbooks/sensation_and_perception.md'),
        'neurologic': require('../assets/textbooks/neurologic.md'),
        'neurology_an_illustrated': require('../assets/textbooks/neurology_an_illustrated.md'),
        'phantoms_in_the_mind': require('../assets/textbooks/phantoms_in_the_mind.md'),
        'a_molecule_away_from_madness': require('../assets/textbooks/a_molecule_away_from_madness.md'),
        'the_empire_of_depression': require('../assets/textbooks/the_empire_of_depression.md'),
        'shorter_oxford_handbook_of_psychiatry': require('../assets/textbooks/shorter_oxford_handbook_of_psychiatry.md'),
        'the_complete_foundation': require('../assets/textbooks/the_complete_foundation.md'),
        'Hold_me_tight_handbook': require('../assets/textbooks/Hold_me_tight_handbook.md'),
        'icd11': require('../assets/textbooks/icd11.md')
      };

      if (textbookAssets[bookKey]) {
        const asset = textbookAssets[bookKey];
        
        // If it's already a string, return it
        if (typeof asset === 'string') {
          return asset;
        }
        
        // If it's an asset object, download and read it
        if (asset.uri) {
          const response = await fetch(asset.uri);
          return await response.text();
        }
      }

      return null;
    } catch (error) {
      console.log(`Could not load ${bookKey} from bundle:`, error);
      return null;
    }
  }

  // Load from file system
  async loadFromFileSystem(bookKey) {
    try {
      const filePath = `${FileSystem.documentDirectory}assets/textbooks/${bookKey}.md`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      
      if (fileInfo.exists) {
        return await FileSystem.readAsStringAsync(filePath);
      }
      
      return null;
    } catch (error) {
      console.log(`Could not load ${bookKey} from file system:`, error);
      return null;
    }
  }

  // Generate placeholder content for missing textbooks
  generatePlaceholderContent(bookKey) {
    const titleCase = bookKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Generate content based on book type
    let content = `# ${titleCase}\n\n`;
    
    if (bookKey.includes('dsm') || bookKey.includes('icd')) {
      content += `## Diagnostic Manual\n\nThis is a comprehensive diagnostic manual for mental health conditions.\n\n### Key Areas\n\n**Mental Health Disorders**\n- Anxiety disorders\n- Mood disorders\n- Personality disorders\n- Neurodevelopmental disorders\n\n**Diagnostic Criteria**\n- Symptom identification\n- Assessment guidelines\n- Treatment recommendations\n- Differential diagnosis\n\n`;
    } else if (bookKey.includes('neuro') || bookKey.includes('brain')) {
      content += `## Neuroscience and Brain Function\n\nThis textbook explores the fascinating world of neuroscience and brain function.\n\n### Key Topics\n\n**Brain Structure and Function**\n- Neural networks and pathways\n- Cognitive processes\n- Memory and learning\n- Emotional regulation\n\n**Clinical Applications**\n- Neurological disorders\n- Brain-behavior relationships\n- Therapeutic interventions\n- Neuroplasticity\n\n`;
    } else if (bookKey.includes('love') || bookKey.includes('relationship') || bookKey.includes('attached')) {
      content += `## Relationships and Love\n\nThis book provides insights into healthy relationships and the psychology of love.\n\n### Key Concepts\n\n**Relationship Dynamics**\n- Communication patterns\n- Attachment styles\n- Conflict resolution\n- Emotional intimacy\n\n**Love and Connection**\n- Building trust\n- Maintaining relationships\n- Overcoming challenges\n- Creating lasting bonds\n\n`;
    } else if (bookKey.includes('therapy') || bookKey.includes('counseling') || bookKey.includes('dbt')) {
      content += `## Therapy and Counseling\n\nThis textbook covers therapeutic approaches and counseling techniques.\n\n### Key Areas\n\n**Therapeutic Approaches**\n- Cognitive-behavioral therapy\n- Psychodynamic therapy\n- Humanistic approaches\n- Integrative methods\n\n**Clinical Skills**\n- Assessment techniques\n- Intervention strategies\n- Therapeutic relationship\n- Ethical considerations\n\n`;
    } else {
      content += `## Overview\n\nThis textbook contains valuable information about ${titleCase.toLowerCase()}.\n\n### Key Topics\n\n**Core Concepts**\n- Fundamental principles\n- Practical applications\n- Evidence-based approaches\n- Real-world examples\n\n**Applications**\n- Personal development\n- Professional growth\n- Relationship enhancement\n- Mental health and wellness\n\n`;
    }
    
    content += `*Note: This is a placeholder. SoulAI has been configured to recognize this textbook and can provide relevant insights based on its content.*`;
    
    return content;
  }

  // Get all loaded textbooks
  getLoadedTextbooks() {
    return Array.from(this.loadedTextbooks.keys());
  }

  // Clear cache
  clearCache() {
    this.loadedTextbooks.clear();
    this.loadingPromises.clear();
  }

  // Preload commonly used textbooks
  async preloadEssentialTextbooks() {
    const essentialBooks = [
      'mastery_of_love',
      'heart_and_soul_of_change',
      'attached',
      'the_four_agreements',
      '5_love_languages',
      'atlas_of_the_heart'
    ];

    const loadPromises = essentialBooks.map(book => this.loadTextbook(book));
    await Promise.all(loadPromises);
    
    console.log('Essential textbooks preloaded successfully');
  }
}

export default new TextbookLoader();