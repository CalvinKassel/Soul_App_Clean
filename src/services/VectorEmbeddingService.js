// Vector Embedding Service for RAG System
// Handles text-to-vector conversion using OpenAI embeddings API

class VectorEmbeddingService {
  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || null;
    this.embeddingModel = 'text-embedding-3-small'; // More cost-effective than ada-002
    this.embeddingCache = new Map();
    this.maxCacheSize = 1000;
    this.embeddingDimension = 1536; // Dimension for text-embedding-3-small
  }

  // Get embedding for a text string
  async getEmbedding(text, useCache = true) {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    // Check cache first
    const cacheKey = this.getCacheKey(text);
    if (useCache && this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey);
    }

    try {
      const embedding = await this.generateEmbedding(text);
      
      // Cache the result
      if (useCache) {
        this.cacheEmbedding(cacheKey, embedding);
      }

      return embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  // Generate embedding using OpenAI API
  async generateEmbedding(text) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.embeddingModel,
        input: text.substring(0, 8000), // Limit to 8k chars to avoid token limits
        encoding_format: 'float'
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  // Generate embeddings for multiple texts in batch
  async getBatchEmbeddings(texts, useCache = true) {
    const results = [];
    const uncachedTexts = [];
    const uncachedIndices = [];

    // Check cache for each text
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      const cacheKey = this.getCacheKey(text);
      
      if (useCache && this.embeddingCache.has(cacheKey)) {
        results[i] = this.embeddingCache.get(cacheKey);
      } else {
        uncachedTexts.push(text);
        uncachedIndices.push(i);
      }
    }

    // Generate embeddings for uncached texts
    if (uncachedTexts.length > 0) {
      try {
        const batchEmbeddings = await this.generateBatchEmbeddings(uncachedTexts);
        
        // Store results and cache them
        for (let i = 0; i < uncachedTexts.length; i++) {
          const embedding = batchEmbeddings[i];
          const originalIndex = uncachedIndices[i];
          const text = uncachedTexts[i];
          
          results[originalIndex] = embedding;
          
          if (useCache) {
            const cacheKey = this.getCacheKey(text);
            this.cacheEmbedding(cacheKey, embedding);
          }
        }
      } catch (error) {
        console.error('Error generating batch embeddings:', error);
        throw error;
      }
    }

    return results;
  }

  // Generate batch embeddings using OpenAI API
  async generateBatchEmbeddings(texts) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Process texts in chunks to avoid API limits
    const chunkSize = 100; // OpenAI allows up to 2048 inputs per request
    const allEmbeddings = [];

    for (let i = 0; i < texts.length; i += chunkSize) {
      const chunk = texts.slice(i, i + chunkSize);
      const processedChunk = chunk.map(text => text.substring(0, 8000)); // Limit token size

      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.embeddingModel,
          input: processedChunk,
          encoding_format: 'float'
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const embeddings = data.data.map(item => item.embedding);
      allEmbeddings.push(...embeddings);
    }

    return allEmbeddings;
  }

  // Calculate cosine similarity between two embeddings
  calculateCosineSimilarity(embedding1, embedding2) {
    if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
      throw new Error('Invalid embeddings for similarity calculation');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  // Find most similar embeddings from a collection
  findMostSimilar(queryEmbedding, embeddingCollection, topK = 5) {
    const similarities = embeddingCollection.map((item, index) => ({
      index,
      similarity: this.calculateCosineSimilarity(queryEmbedding, item.embedding),
      item: item
    }));

    // Sort by similarity (descending) and return top K
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  // Cache management
  getCacheKey(text) {
    // Create a hash-like key from text
    return text.length + '_' + text.substring(0, 50).replace(/\s+/g, '_');
  }

  cacheEmbedding(key, embedding) {
    // Implement LRU cache behavior
    if (this.embeddingCache.size >= this.maxCacheSize) {
      const firstKey = this.embeddingCache.keys().next().value;
      this.embeddingCache.delete(firstKey);
    }
    
    this.embeddingCache.set(key, embedding);
  }

  // Clear cache
  clearCache() {
    this.embeddingCache.clear();
  }

  // Get cache statistics
  getCacheStats() {
    return {
      size: this.embeddingCache.size,
      maxSize: this.maxCacheSize,
      hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0
    };
  }

  // Utility method to chunk text for processing
  chunkText(text, maxChunkSize = 500, overlap = 50) {
    const chunks = [];
    const words = text.split(' ');
    
    for (let i = 0; i < words.length; i += maxChunkSize - overlap) {
      const chunk = words.slice(i, i + maxChunkSize).join(' ');
      if (chunk.trim().length > 0) {
        chunks.push({
          text: chunk,
          startIndex: i,
          endIndex: Math.min(i + maxChunkSize, words.length)
        });
      }
    }
    
    return chunks;
  }

  // Preprocess text for better embedding quality
  preprocessText(text) {
    return text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s\-.,!?;:()]/g, '') // Remove special chars but keep punctuation
      .trim();
  }
}

export default new VectorEmbeddingService();