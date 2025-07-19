// RAG (Retrieval-Augmented Generation) Service
// Orchestrates retrieval and generation for enhanced AI responses

import VectorDatabase from './VectorDatabase';
import VectorEmbeddingService from './VectorEmbeddingService';
import TextbookAssetLoader from './TextbookAssetLoader';
import TextbookContentParser from './TextbookContentParser';

class RAGService {
  constructor() {
    this.vectorDB = VectorDatabase;
    this.embeddingService = VectorEmbeddingService;
    this.textbookLoader = TextbookAssetLoader;
    this.textbookParser = TextbookContentParser;
    this.initialized = false;
    this.collectionName = 'soulai_knowledge';
    this.contextWindow = 3;
    this.maxRetrievalResults = 5;
    this.relevanceThreshold = 0.6;
  }

  // Initialize RAG system
  async initialize() {
    if (this.initialized) return;

    try {
      console.log('Initializing RAG system...');
      
      // Initialize vector database
      await this.vectorDB.initialize();
      
      // Initialize textbook loader
      await this.textbookLoader.initialize();
      
      // Check if knowledge collection exists
      const collections = this.vectorDB.listCollections();
      const hasKnowledgeCollection = collections.some(col => col.name === this.collectionName);
      
      if (!hasKnowledgeCollection) {
        console.log('Creating knowledge collection...');
        await this.vectorDB.createCollection(this.collectionName, {
          description: 'SoulAI knowledge base from textbooks',
          type: 'textbook_knowledge',
          version: '1.0'
        });
        
        // Index textbook content
        await this.indexTextbookContent();
      } else {
        console.log('Knowledge collection already exists');
      }
      
      this.initialized = true;
      console.log('RAG system initialized successfully');
      
    } catch (error) {
      console.error('Error initializing RAG system:', error);
      throw error;
    }
  }

  // Index textbook content into vector database
  async indexTextbookContent() {
    console.log('Indexing textbook content...');
    
    try {
      // Parse all textbooks
      await this.textbookParser.parseAllTextbooks();
      const parsedContent = this.textbookParser.parsedContent;
      
      const documents = [];
      let docId = 0;
      
      // Process each textbook
      for (const [bookKey, book] of Object.entries(parsedContent)) {
        console.log(`Processing textbook: ${bookKey}`);
        
        // Index chapters
        for (const chapter of book.chapters) {
          if (chapter.content && chapter.content.trim().length > 100) {
            // Split chapter into chunks for better retrieval
            const chunks = this.chunkContent(chapter.content, 500, 50);
            
            for (const chunk of chunks) {
              documents.push({
                id: `${bookKey}_chapter_${docId++}`,
                content: chunk.text,
                metadata: {
                  type: 'chapter',
                  chunkIndex: chunk.index,
                  totalChunks: chunks.length
                },
                textbook: bookKey,
                chapter: chapter.title,
                concept: null
              });
            }
          }
        }
        
        // Index concepts
        for (const [conceptKey, concept] of Object.entries(book.concepts)) {
          if (concept.details && concept.details.length > 0) {
            const conceptContent = `${concept.name}: ${concept.details.join(' ')}`;
            
            documents.push({
              id: `${bookKey}_concept_${docId++}`,
              content: conceptContent,
              metadata: {
                type: 'concept',
                conceptKey: conceptKey
              },
              textbook: bookKey,
              chapter: concept.chapter,
              concept: concept.name
            });
          }
        }
        
        // Index practical applications
        if (book.practicalApplications && book.practicalApplications.length > 0) {
          const practicalContent = book.practicalApplications.join(' ');
          
          documents.push({
            id: `${bookKey}_practical_${docId++}`,
            content: practicalContent,
            metadata: {
              type: 'practical_application'
            },
            textbook: bookKey,
            chapter: 'Practical Applications',
            concept: null
          });
        }
      }
      
      console.log(`Prepared ${documents.length} documents for indexing`);
      
      // Add documents to vector database in batches
      const batchSize = 50;
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        await this.vectorDB.addDocuments(this.collectionName, batch);
        console.log(`Indexed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(documents.length / batchSize)}`);
      }
      
      console.log('Textbook content indexing completed');
      
    } catch (error) {
      console.error('Error indexing textbook content:', error);
      throw error;
    }
  }

  // Retrieve relevant content for a query
  async retrieve(query, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    const {
      topK = this.maxRetrievalResults,
      threshold = this.relevanceThreshold,
      includeContext = true,
      searchType = 'hybrid' // 'semantic', 'keyword', 'hybrid'
    } = options;

    try {
      let results;
      
      switch (searchType) {
        case 'semantic':
          results = await this.vectorDB.search(this.collectionName, query, {
            topK,
            threshold,
            includeMetadata: true,
            contextWindow: includeContext ? this.contextWindow : 0
          });
          break;
          
        case 'keyword':
          results = this.vectorDB.keywordSearch(this.collectionName, query, { topK });
          break;
          
        case 'hybrid':
        default:
          results = await this.vectorDB.hybridSearch(this.collectionName, query, {
            topK,
            threshold,
            semanticWeight: 0.7,
            keywordWeight: 0.3
          });
          break;
      }
      
      // Enhance results with additional context
      const enhancedResults = this.enhanceResults(results, query);
      
      return enhancedResults;
      
    } catch (error) {
      console.error('Error retrieving content:', error);
      return [];
    }
  }

  // Enhance retrieval results with additional context
  enhanceResults(results, query) {
    return results.map(result => {
      // Add relevance explanation
      const relevanceExplanation = this.explainRelevance(result, query);
      
      // Add source information
      const sourceInfo = this.getSourceInfo(result);
      
      return {
        ...result,
        relevanceExplanation,
        sourceInfo,
        retrievedAt: new Date().toISOString()
      };
    });
  }

  // Generate relevance explanation
  explainRelevance(result, query) {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const content = result.content.toLowerCase();
    
    const matchingTerms = queryTerms.filter(term => content.includes(term));
    const matchRatio = matchingTerms.length / queryTerms.length;
    
    if (result.similarity) {
      return `Semantic similarity: ${(result.similarity * 100).toFixed(1)}%, keyword match: ${(matchRatio * 100).toFixed(1)}%`;
    } else if (result.keywordScore) {
      return `Keyword relevance: ${(result.keywordScore * 100).toFixed(1)}%`;
    } else {
      return `Combined relevance: ${(result.combinedScore * 100).toFixed(1)}%`;
    }
  }

  // Get source information
  getSourceInfo(result) {
    const info = {
      textbook: result.textbook,
      chapter: result.chapter,
      concept: result.concept,
      type: result.metadata?.type || 'unknown'
    };
    
    // Add textbook title mapping
    const textbookTitles = {
      'mastery_of_love': 'The Mastery of Love',
      'heart_and_soul_of_change': 'The Heart and Soul of Change',
      'attached': 'Attached',
      '5_love_languages': 'The 5 Love Languages',
      'atlas_of_the_heart': 'Atlas of the Heart',
      'the_four_agreements': 'The Four Agreements'
    };
    
    info.textbookTitle = textbookTitles[result.textbook] || result.textbook;
    
    return info;
  }

  // Generate context-aware response using retrieved content
  async generateResponse(query, conversationHistory = [], options = {}) {
    const {
      maxContextLength = 2000,
      includeSourceCitations = true,
      responseStyle = 'conversational'
    } = options;

    try {
      // Retrieve relevant content
      const retrievedContent = await this.retrieve(query, {
        topK: 5,
        threshold: 0.5,
        searchType: 'hybrid'
      });

      if (retrievedContent.length === 0) {
        return null; // No relevant content found
      }

      // Build context from retrieved content
      const context = this.buildContext(retrievedContent, maxContextLength);
      
      // Generate response with context
      const response = this.generateContextualResponse(
        query,
        context,
        conversationHistory,
        responseStyle
      );

      return {
        response,
        retrievedContent,
        context,
        sources: includeSourceCitations ? this.generateSourceCitations(retrievedContent) : null
      };

    } catch (error) {
      console.error('Error generating RAG response:', error);
      return null;
    }
  }

  // Build context from retrieved content
  buildContext(retrievedContent, maxLength) {
    let context = '';
    let currentLength = 0;
    
    for (const result of retrievedContent) {
      const addition = `[${result.sourceInfo.textbookTitle}] ${result.content}\n\n`;
      
      if (currentLength + addition.length > maxLength) {
        break;
      }
      
      context += addition;
      currentLength += addition.length;
    }
    
    return context.trim();
  }

  // Generate contextual response
  generateContextualResponse(query, context, conversationHistory, style) {
    // This is a template that can be fed to the LLM
    const prompt = `Based on the following context from psychology and relationship textbooks, provide a thoughtful response to the user's question.

Context:
${context}

User's question: ${query}

Previous conversation context:
${conversationHistory.slice(-3).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Please respond in a ${style} tone as Soul, the wise relationship friend. Use the context to provide insights but keep it natural and conversational. Don't just quote the books - integrate the wisdom naturally into your response.`;

    return prompt;
  }

  // Generate source citations
  generateSourceCitations(retrievedContent) {
    const sources = new Map();
    
    for (const result of retrievedContent) {
      const key = result.sourceInfo.textbookTitle;
      if (!sources.has(key)) {
        sources.set(key, {
          title: result.sourceInfo.textbookTitle,
          chapters: new Set(),
          concepts: new Set()
        });
      }
      
      const source = sources.get(key);
      if (result.sourceInfo.chapter) {
        source.chapters.add(result.sourceInfo.chapter);
      }
      if (result.sourceInfo.concept) {
        source.concepts.add(result.sourceInfo.concept);
      }
    }
    
    return Array.from(sources.values()).map(source => ({
      title: source.title,
      chapters: Array.from(source.chapters),
      concepts: Array.from(source.concepts)
    }));
  }

  // Chunk content for better retrieval
  chunkContent(content, maxChunkSize = 500, overlap = 50) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks = [];
    let currentChunk = '';
    let chunkIndex = 0;
    
    for (const sentence of sentences) {
      const potentialChunk = currentChunk + sentence + '. ';
      
      if (potentialChunk.length > maxChunkSize && currentChunk.length > 0) {
        chunks.push({
          text: currentChunk.trim(),
          index: chunkIndex++,
          startSentence: Math.max(0, chunkIndex - overlap),
          endSentence: chunkIndex
        });
        
        // Start new chunk with overlap
        const overlapSentences = sentences.slice(Math.max(0, sentences.indexOf(sentence) - overlap));
        currentChunk = overlapSentences.slice(0, overlap).join('. ') + '. ' + sentence + '. ';
      } else {
        currentChunk = potentialChunk;
      }
    }
    
    // Add final chunk
    if (currentChunk.trim().length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        index: chunkIndex,
        startSentence: chunkIndex,
        endSentence: sentences.length
      });
    }
    
    return chunks;
  }

  // Get system statistics
  getStats() {
    return {
      initialized: this.initialized,
      vectorDB: this.vectorDB.getStats(),
      collectionName: this.collectionName,
      settings: {
        contextWindow: this.contextWindow,
        maxRetrievalResults: this.maxRetrievalResults,
        relevanceThreshold: this.relevanceThreshold
      }
    };
  }

  // Reindex content (for updates)
  async reindex() {
    console.log('Reindexing RAG content...');
    
    try {
      // Clear existing collection
      await this.vectorDB.deleteCollection(this.collectionName);
      
      // Recreate collection
      await this.vectorDB.createCollection(this.collectionName, {
        description: 'SoulAI knowledge base from textbooks',
        type: 'textbook_knowledge',
        version: '1.0'
      });
      
      // Reindex content
      await this.indexTextbookContent();
      
      console.log('RAG content reindexed successfully');
    } catch (error) {
      console.error('Error reindexing RAG content:', error);
      throw error;
    }
  }

  // Search for specific concepts
  async searchConcepts(conceptQuery, options = {}) {
    const results = await this.retrieve(conceptQuery, {
      ...options,
      searchType: 'semantic'
    });
    
    return results.filter(result => 
      result.metadata?.type === 'concept' || 
      result.concept
    );
  }

  // Search for practical applications
  async searchPracticalApplications(query, options = {}) {
    const results = await this.retrieve(query, {
      ...options,
      searchType: 'hybrid'
    });
    
    return results.filter(result => 
      result.metadata?.type === 'practical_application' ||
      result.content.toLowerCase().includes('practice') ||
      result.content.toLowerCase().includes('application')
    );
  }
}

export default new RAGService();