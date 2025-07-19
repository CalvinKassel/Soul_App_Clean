// Vector Database Service for RAG System
// In-memory vector database with persistence support

import AsyncStorage from '@react-native-async-storage/async-storage';
import VectorEmbeddingService from './VectorEmbeddingService';

class VectorDatabase {
  constructor() {
    this.collections = new Map();
    this.initialized = false;
    this.storageKey = 'soulai_vector_db';
    this.maxCollectionSize = 5000; // Limit to prevent memory issues
  }

  // Initialize the vector database
  async initialize() {
    if (this.initialized) return;

    try {
      await this.loadFromStorage();
      this.initialized = true;
      console.log('Vector database initialized successfully');
    } catch (error) {
      console.error('Error initializing vector database:', error);
      this.initialized = true; // Continue with empty database
    }
  }

  // Create a new collection
  async createCollection(name, metadata = {}) {
    if (this.collections.has(name)) {
      throw new Error(`Collection '${name}' already exists`);
    }

    const collection = {
      name,
      metadata,
      documents: [],
      embeddings: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.collections.set(name, collection);
    await this.saveToStorage();
    
    console.log(`Created collection: ${name}`);
    return collection;
  }

  // Add documents to a collection
  async addDocuments(collectionName, documents) {
    const collection = this.collections.get(collectionName);
    if (!collection) {
      throw new Error(`Collection '${collectionName}' not found`);
    }

    // Prepare documents for embedding
    const textsToEmbed = documents.map(doc => 
      VectorEmbeddingService.preprocessText(doc.content)
    );

    try {
      // Generate embeddings for all documents
      console.log(`Generating embeddings for ${documents.length} documents...`);
      const embeddings = await VectorEmbeddingService.getBatchEmbeddings(textsToEmbed);

      // Add documents and embeddings to collection
      for (let i = 0; i < documents.length; i++) {
        const document = {
          id: documents[i].id || `doc_${Date.now()}_${i}`,
          content: documents[i].content,
          metadata: documents[i].metadata || {},
          textbook: documents[i].textbook || null,
          chapter: documents[i].chapter || null,
          concept: documents[i].concept || null,
          addedAt: new Date().toISOString()
        };

        collection.documents.push(document);
        collection.embeddings.push({
          id: document.id,
          embedding: embeddings[i],
          document: document
        });
      }

      // Limit collection size
      if (collection.documents.length > this.maxCollectionSize) {
        const excess = collection.documents.length - this.maxCollectionSize;
        collection.documents.splice(0, excess);
        collection.embeddings.splice(0, excess);
      }

      collection.updatedAt = new Date().toISOString();
      await this.saveToStorage();

      console.log(`Added ${documents.length} documents to collection ${collectionName}`);
      return collection.documents.length;
    } catch (error) {
      console.error('Error adding documents to collection:', error);
      throw error;
    }
  }

  // Search for similar documents
  async search(collectionName, query, options = {}) {
    const {
      topK = 5,
      threshold = 0.5,
      includeMetadata = true,
      contextWindow = 2
    } = options;

    const collection = this.collections.get(collectionName);
    if (!collection) {
      throw new Error(`Collection '${collectionName}' not found`);
    }

    if (collection.embeddings.length === 0) {
      return [];
    }

    try {
      // Generate embedding for the query
      const queryText = VectorEmbeddingService.preprocessText(query);
      const queryEmbedding = await VectorEmbeddingService.getEmbedding(queryText);

      // Find most similar documents
      const similarities = VectorEmbeddingService.findMostSimilar(
        queryEmbedding,
        collection.embeddings,
        topK
      );

      // Filter by threshold and format results
      const results = similarities
        .filter(result => result.similarity >= threshold)
        .map(result => ({
          id: result.item.id,
          content: result.item.document.content,
          similarity: result.similarity,
          metadata: includeMetadata ? result.item.document.metadata : undefined,
          textbook: result.item.document.textbook,
          chapter: result.item.document.chapter,
          concept: result.item.document.concept
        }));

      // Add context if requested
      if (contextWindow > 0) {
        for (const result of results) {
          result.context = this.getDocumentContext(collection, result.id, contextWindow);
        }
      }

      return results;
    } catch (error) {
      console.error('Error searching collection:', error);
      throw error;
    }
  }

  // Get document context (surrounding documents)
  getDocumentContext(collection, documentId, windowSize) {
    const docIndex = collection.documents.findIndex(doc => doc.id === documentId);
    if (docIndex === -1) return null;

    const start = Math.max(0, docIndex - windowSize);
    const end = Math.min(collection.documents.length, docIndex + windowSize + 1);

    return collection.documents.slice(start, end).map(doc => ({
      id: doc.id,
      content: doc.content,
      metadata: doc.metadata
    }));
  }

  // Hybrid search (combining semantic and keyword search)
  async hybridSearch(collectionName, query, options = {}) {
    const {
      topK = 5,
      semanticWeight = 0.7,
      keywordWeight = 0.3,
      threshold = 0.3
    } = options;

    // Get semantic search results
    const semanticResults = await this.search(collectionName, query, { 
      topK: topK * 2, 
      threshold: 0.1 
    });

    // Get keyword search results
    const keywordResults = this.keywordSearch(collectionName, query, { topK: topK * 2 });

    // Combine and score results
    const combinedResults = this.combineSearchResults(
      semanticResults,
      keywordResults,
      semanticWeight,
      keywordWeight
    );

    // Filter and sort by combined score
    return combinedResults
      .filter(result => result.combinedScore >= threshold)
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, topK);
  }

  // Keyword search within collection
  keywordSearch(collectionName, query, options = {}) {
    const { topK = 5, caseSensitive = false } = options;
    const collection = this.collections.get(collectionName);
    
    if (!collection) {
      throw new Error(`Collection '${collectionName}' not found`);
    }

    const searchTerms = query.toLowerCase().split(/\s+/);
    const results = [];

    for (const doc of collection.documents) {
      const content = caseSensitive ? doc.content : doc.content.toLowerCase();
      let score = 0;

      for (const term of searchTerms) {
        const matches = (content.match(new RegExp(term, 'g')) || []).length;
        score += matches;
      }

      if (score > 0) {
        results.push({
          id: doc.id,
          content: doc.content,
          keywordScore: score / searchTerms.length,
          metadata: doc.metadata,
          textbook: doc.textbook,
          chapter: doc.chapter,
          concept: doc.concept
        });
      }
    }

    return results
      .sort((a, b) => b.keywordScore - a.keywordScore)
      .slice(0, topK);
  }

  // Combine semantic and keyword search results
  combineSearchResults(semanticResults, keywordResults, semanticWeight, keywordWeight) {
    const resultMap = new Map();

    // Add semantic results
    for (const result of semanticResults) {
      resultMap.set(result.id, {
        ...result,
        semanticScore: result.similarity || 0,
        keywordScore: 0
      });
    }

    // Add keyword results
    for (const result of keywordResults) {
      if (resultMap.has(result.id)) {
        resultMap.get(result.id).keywordScore = result.keywordScore;
      } else {
        resultMap.set(result.id, {
          ...result,
          semanticScore: 0,
          keywordScore: result.keywordScore
        });
      }
    }

    // Calculate combined scores
    const combinedResults = Array.from(resultMap.values()).map(result => ({
      ...result,
      combinedScore: (result.semanticScore * semanticWeight) + (result.keywordScore * keywordWeight)
    }));

    return combinedResults;
  }

  // Get collection statistics
  getCollectionStats(collectionName) {
    const collection = this.collections.get(collectionName);
    if (!collection) {
      throw new Error(`Collection '${collectionName}' not found`);
    }

    return {
      name: collectionName,
      documentCount: collection.documents.length,
      embeddingCount: collection.embeddings.length,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      metadata: collection.metadata
    };
  }

  // List all collections
  listCollections() {
    return Array.from(this.collections.keys()).map(name => ({
      name,
      ...this.getCollectionStats(name)
    }));
  }

  // Delete a collection
  async deleteCollection(collectionName) {
    if (!this.collections.has(collectionName)) {
      throw new Error(`Collection '${collectionName}' not found`);
    }

    this.collections.delete(collectionName);
    await this.saveToStorage();
    console.log(`Deleted collection: ${collectionName}`);
  }

  // Clear all data
  async clearAll() {
    this.collections.clear();
    await this.saveToStorage();
    console.log('Cleared all vector database data');
  }

  // Save database to AsyncStorage
  async saveToStorage() {
    try {
      const data = {
        collections: Array.from(this.collections.entries()),
        savedAt: new Date().toISOString()
      };

      await AsyncStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving vector database to storage:', error);
    }
  }

  // Load database from AsyncStorage
  async loadFromStorage() {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.collections = new Map(parsed.collections);
        console.log('Loaded vector database from storage');
      }
    } catch (error) {
      console.error('Error loading vector database from storage:', error);
    }
  }

  // Get database statistics
  getStats() {
    const collections = this.listCollections();
    const totalDocuments = collections.reduce((sum, col) => sum + col.documentCount, 0);
    const totalEmbeddings = collections.reduce((sum, col) => sum + col.embeddingCount, 0);

    return {
      initialized: this.initialized,
      collectionCount: collections.length,
      totalDocuments,
      totalEmbeddings,
      collections: collections.map(col => ({
        name: col.name,
        documentCount: col.documentCount
      }))
    };
  }
}

export default new VectorDatabase();