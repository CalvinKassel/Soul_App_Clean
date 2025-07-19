// RAG System Test Suite
// Comprehensive testing of the RAG implementation

import RAGService from './RAGService';
import VectorDatabase from './VectorDatabase';
import VectorEmbeddingService from './VectorEmbeddingService';
import ChatGPTService from './ChatGPTService';

class RAGTest {
  constructor() {
    this.testResults = [];
  }

  async runAllTests() {
    console.log('=== Starting RAG System Tests ===\n');
    
    try {
      // Test 1: Vector Embedding Service
      await this.testVectorEmbeddings();
      
      // Test 2: Vector Database
      await this.testVectorDatabase();
      
      // Test 3: RAG Service Initialization
      await this.testRAGInitialization();
      
      // Test 4: Content Retrieval
      await this.testContentRetrieval();
      
      // Test 5: Semantic Search
      await this.testSemanticSearch();
      
      // Test 6: Hybrid Search
      await this.testHybridSearch();
      
      // Test 7: ChatGPT Integration
      await this.testChatGPTIntegration();
      
      // Test 8: Performance Tests
      await this.testPerformance();
      
      // Summary
      this.printTestSummary();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  async testVectorEmbeddings() {
    console.log('1. Testing Vector Embedding Service...');
    
    try {
      // Test single embedding
      const text = "I'm feeling anxious about my relationship";
      const embedding = await VectorEmbeddingService.getEmbedding(text);
      
      this.assert(Array.isArray(embedding), 'Embedding should be an array');
      this.assert(embedding.length === 1536, 'Embedding should have 1536 dimensions');
      this.assert(embedding.every(val => typeof val === 'number'), 'All embedding values should be numbers');
      
      // Test batch embeddings
      const texts = [
        "Love is about connection",
        "Fear creates emotional walls",
        "Attachment styles affect relationships"
      ];
      
      const batchEmbeddings = await VectorEmbeddingService.getBatchEmbeddings(texts);
      this.assert(batchEmbeddings.length === 3, 'Batch embeddings should return 3 results');
      
      // Test similarity calculation
      const similarity = VectorEmbeddingService.calculateCosineSimilarity(embedding, embedding);
      this.assert(Math.abs(similarity - 1.0) < 0.001, 'Self-similarity should be 1.0');
      
      console.log('✅ Vector Embedding Service tests passed');
      this.testResults.push({ name: 'Vector Embeddings', status: 'PASSED' });
      
    } catch (error) {
      console.error('❌ Vector Embedding Service test failed:', error);
      this.testResults.push({ name: 'Vector Embeddings', status: 'FAILED', error: error.message });
    }
  }

  async testVectorDatabase() {
    console.log('2. Testing Vector Database...');
    
    try {
      // Initialize database
      await VectorDatabase.initialize();
      
      // Create test collection
      const testCollection = 'test_collection';
      await VectorDatabase.createCollection(testCollection, { test: true });
      
      // Add test documents
      const testDocs = [
        {
          id: 'doc1',
          content: 'Emotional wounds from childhood affect adult relationships',
          metadata: { type: 'concept' }
        },
        {
          id: 'doc2', 
          content: 'Love languages help couples communicate better',
          metadata: { type: 'practical' }
        },
        {
          id: 'doc3',
          content: 'Attachment styles: secure, anxious, avoidant, disorganized',
          metadata: { type: 'concept' }
        }
      ];
      
      await VectorDatabase.addDocuments(testCollection, testDocs);
      
      // Test search
      const searchResults = await VectorDatabase.search(testCollection, 'emotional healing relationship');
      this.assert(searchResults.length > 0, 'Search should return results');
      this.assert(searchResults[0].similarity > 0.5, 'Top result should have good similarity');
      
      // Test hybrid search
      const hybridResults = await VectorDatabase.hybridSearch(testCollection, 'attachment styles');
      this.assert(hybridResults.length > 0, 'Hybrid search should return results');
      
      // Clean up
      await VectorDatabase.deleteCollection(testCollection);
      
      console.log('✅ Vector Database tests passed');
      this.testResults.push({ name: 'Vector Database', status: 'PASSED' });
      
    } catch (error) {
      console.error('❌ Vector Database test failed:', error);
      this.testResults.push({ name: 'Vector Database', status: 'FAILED', error: error.message });
    }
  }

  async testRAGInitialization() {
    console.log('3. Testing RAG Service Initialization...');
    
    try {
      // Initialize RAG service
      await RAGService.initialize();
      
      // Check if initialized
      const stats = RAGService.getStats();
      this.assert(stats.initialized, 'RAG service should be initialized');
      this.assert(stats.vectorDB.collectionCount > 0, 'Should have at least one collection');
      
      console.log('✅ RAG Service initialization tests passed');
      this.testResults.push({ name: 'RAG Initialization', status: 'PASSED' });
      
    } catch (error) {
      console.error('❌ RAG Service initialization test failed:', error);
      this.testResults.push({ name: 'RAG Initialization', status: 'FAILED', error: error.message });
    }
  }

  async testContentRetrieval() {
    console.log('4. Testing Content Retrieval...');
    
    try {
      // Test various queries
      const testQueries = [
        'What does Don Miguel Ruiz say about love?',
        'How do emotional wounds affect relationships?',
        'What are the different attachment styles?',
        'How can I communicate better with my partner?',
        'What is unconditional love?'
      ];
      
      for (const query of testQueries) {
        const results = await RAGService.retrieve(query);
        this.assert(Array.isArray(results), 'Results should be an array');
        
        if (results.length > 0) {
          this.assert(results[0].content, 'Results should have content');
          this.assert(results[0].similarity || results[0].combinedScore, 'Results should have similarity score');
          this.assert(results[0].sourceInfo, 'Results should have source information');
        }
      }
      
      console.log('✅ Content Retrieval tests passed');
      this.testResults.push({ name: 'Content Retrieval', status: 'PASSED' });
      
    } catch (error) {
      console.error('❌ Content Retrieval test failed:', error);
      this.testResults.push({ name: 'Content Retrieval', status: 'FAILED', error: error.message });
    }
  }

  async testSemanticSearch() {
    console.log('5. Testing Semantic Search...');
    
    try {
      // Test semantic understanding
      const semanticQueries = [
        'I feel scared of getting hurt again',
        'My partner and I don\'t understand each other',
        'How do I know if someone really loves me?',
        'I have trust issues in relationships'
      ];
      
      for (const query of semanticQueries) {
        const results = await RAGService.retrieve(query, { searchType: 'semantic' });
        
        if (results.length > 0) {
          this.assert(results[0].similarity > 0.4, 'Semantic search should find relevant content');
          
          // Check if results are contextually relevant
          const content = results[0].content.toLowerCase();
          const queryWords = query.toLowerCase().split(' ');
          const hasRelevantContent = queryWords.some(word => 
            content.includes(word) || 
            this.isSemanticallySimilar(word, content)
          );
          
          this.assert(hasRelevantContent, 'Results should be semantically relevant');
        }
      }
      
      console.log('✅ Semantic Search tests passed');
      this.testResults.push({ name: 'Semantic Search', status: 'PASSED' });
      
    } catch (error) {
      console.error('❌ Semantic Search test failed:', error);
      this.testResults.push({ name: 'Semantic Search', status: 'FAILED', error: error.message });
    }
  }

  async testHybridSearch() {
    console.log('6. Testing Hybrid Search...');
    
    try {
      // Test hybrid search combining semantic and keyword
      const hybridQueries = [
        'attachment theory relationships',
        'love languages communication',
        'emotional wounds healing',
        'fear vulnerability connection'
      ];
      
      for (const query of hybridQueries) {
        const semanticResults = await RAGService.retrieve(query, { searchType: 'semantic' });
        const keywordResults = await RAGService.retrieve(query, { searchType: 'keyword' });
        const hybridResults = await RAGService.retrieve(query, { searchType: 'hybrid' });
        
        // Hybrid should ideally combine best of both
        this.assert(hybridResults.length > 0, 'Hybrid search should return results');
        
        if (hybridResults.length > 0) {
          this.assert(hybridResults[0].combinedScore, 'Hybrid results should have combined score');
        }
      }
      
      console.log('✅ Hybrid Search tests passed');
      this.testResults.push({ name: 'Hybrid Search', status: 'PASSED' });
      
    } catch (error) {
      console.error('❌ Hybrid Search test failed:', error);
      this.testResults.push({ name: 'Hybrid Search', status: 'FAILED', error: error.message });
    }
  }

  async testChatGPTIntegration() {
    console.log('7. Testing ChatGPT Integration...');
    
    try {
      // Test RAG-enhanced responses
      const testMessage = "I'm afraid of getting hurt in relationships";
      
      // Get RAG response
      const ragResponse = await RAGService.generateResponse(testMessage, []);
      
      if (ragResponse) {
        this.assert(ragResponse.response, 'RAG response should have response text');
        this.assert(ragResponse.context, 'RAG response should have context');
        this.assert(ragResponse.retrievedContent, 'RAG response should have retrieved content');
      }
      
      // Test fallback response with RAG
      const fallbackResponse = await ChatGPTService.generateSoulAIFallback(testMessage);
      this.assert(typeof fallbackResponse === 'string', 'Fallback response should be a string');
      this.assert(fallbackResponse.length > 0, 'Fallback response should not be empty');
      
      console.log('✅ ChatGPT Integration tests passed');
      this.testResults.push({ name: 'ChatGPT Integration', status: 'PASSED' });
      
    } catch (error) {
      console.error('❌ ChatGPT Integration test failed:', error);
      this.testResults.push({ name: 'ChatGPT Integration', status: 'FAILED', error: error.message });
    }
  }

  async testPerformance() {
    console.log('8. Testing Performance...');
    
    try {
      // Test retrieval speed
      const startTime = Date.now();
      const results = await RAGService.retrieve('love and relationships', { topK: 5 });
      const retrievalTime = Date.now() - startTime;
      
      this.assert(retrievalTime < 5000, 'Retrieval should complete within 5 seconds');
      console.log(`   Retrieval time: ${retrievalTime}ms`);
      
      // Test batch performance
      const batchQueries = [
        'emotional healing',
        'communication skills',
        'trust building',
        'attachment styles',
        'relationship advice'
      ];
      
      const batchStart = Date.now();
      const batchResults = await Promise.all(
        batchQueries.map(query => RAGService.retrieve(query, { topK: 3 }))
      );
      const batchTime = Date.now() - batchStart;
      
      this.assert(batchTime < 10000, 'Batch retrieval should complete within 10 seconds');
      console.log(`   Batch retrieval time: ${batchTime}ms`);
      
      // Test database stats
      const stats = RAGService.getStats();
      console.log(`   Database stats:`, stats.vectorDB);
      
      console.log('✅ Performance tests passed');
      this.testResults.push({ name: 'Performance', status: 'PASSED' });
      
    } catch (error) {
      console.error('❌ Performance test failed:', error);
      this.testResults.push({ name: 'Performance', status: 'FAILED', error: error.message });
    }
  }

  // Helper methods
  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  isSemanticallySimilar(word, content) {
    const semanticGroups = [
      ['fear', 'scared', 'afraid', 'anxiety', 'worry'],
      ['love', 'affection', 'care', 'connection', 'bond'],
      ['relationship', 'partnership', 'connection', 'bond'],
      ['communication', 'talk', 'express', 'share', 'convey'],
      ['trust', 'confidence', 'faith', 'belief', 'reliance'],
      ['attachment', 'bond', 'connection', 'tie', 'link']
    ];
    
    for (const group of semanticGroups) {
      if (group.includes(word)) {
        return group.some(synonym => content.includes(synonym));
      }
    }
    
    return false;
  }

  printTestSummary() {
    console.log('\n=== RAG System Test Summary ===');
    
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${this.testResults.length}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => r.status === 'FAILED')
        .forEach(r => console.log(`   - ${r.name}: ${r.error}`));
    }
    
    console.log('\n🎉 RAG System Testing Complete!');
  }
}

export default new RAGTest();