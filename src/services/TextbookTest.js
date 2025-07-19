// Test file to verify textbook integration
import TextbookAssetLoader from './TextbookAssetLoader';
import TextbookContentParser from './TextbookContentParser';
import ChatGPTService from './ChatGPTService';

class TextbookTest {
  async runTests() {
    console.log('=== Starting Textbook Integration Tests ===');
    
    try {
      // Test 1: Load a textbook
      console.log('\n1. Testing textbook loading...');
      const masteryContent = await TextbookAssetLoader.loadTextbook('mastery_of_love');
      console.log('✓ Loaded mastery_of_love:', masteryContent.substring(0, 100) + '...');
      
      // Test 2: Parse textbook content
      console.log('\n2. Testing textbook parsing...');
      await TextbookContentParser.parseAllTextbooks();
      console.log('✓ Parsed all textbooks successfully');
      
      // Test 3: Search for specific concepts
      console.log('\n3. Testing concept search...');
      const searchResults = TextbookContentParser.searchContent('unconditional love');
      console.log('✓ Found', searchResults.length, 'results for "unconditional love"');
      
      // Test 4: Get deep knowledge
      console.log('\n4. Testing deep knowledge extraction...');
      const deepKnowledge = TextbookContentParser.getDeepKnowledge('emotional wounds');
      console.log('✓ Extracted deep knowledge about emotional wounds');
      
      // Test 5: Test ChatGPT service knowledge integration
      console.log('\n5. Testing ChatGPT service knowledge...');
      const knowledgeResponse = ChatGPTService.checkForKnowledgeQuery('What does Don Miguel Ruiz say about love?');
      if (knowledgeResponse) {
        console.log('✓ ChatGPT service can access textbook knowledge');
      } else {
        console.log('⚠ ChatGPT service knowledge integration needs work');
      }
      
      console.log('\n=== All Tests Completed ===');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }
}

export default new TextbookTest();