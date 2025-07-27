// SoulAI Elasticsearch Discovery Engine
// Inspired by Tinder's architecture for efficient candidate pre-filtering

import { Client } from '@elastic/elasticsearch';

class ElasticsearchDiscoveryEngine {
  constructor() {
    this.client = null;
    this.indexName = 'soulai_users';
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Initialize Elasticsearch client
      this.client = new Client({
        node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
        auth: process.env.ELASTICSEARCH_AUTH ? {
          username: process.env.ELASTICSEARCH_USERNAME,
          password: process.env.ELASTICSEARCH_PASSWORD
        } : undefined
      });

      // Create index if it doesn't exist
      await this.createUserIndex();
      this.isInitialized = true;
      console.log('🔍 ElasticsearchDiscoveryEngine initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Elasticsearch:', error);
      // Fallback to mock implementation for development
      this.initializeMockMode();
    }
  }

  async createUserIndex() {
    const exists = await this.client.indices.exists({ index: this.indexName });
    
    if (!exists) {
      await this.client.indices.create({
        index: this.indexName,
        body: {
          mappings: {
            properties: {
              userId: { type: 'keyword' },
              age: { type: 'integer' },
              location: {
                type: 'geo_point'
              },
              interests: { type: 'keyword' },
              occupation: { type: 'keyword' },
              personalityType: { type: 'keyword' },
              relationshipGoals: { type: 'keyword' },
              hhcCluster: { type: 'keyword' }, // Psychological cluster ID
              lastActive: { type: 'date' },
              isActive: { type: 'boolean' },
              // Searchable profile fields
              bio: { type: 'text' },
              searchableTraits: { type: 'keyword' }
            }
          },
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0
          }
        }
      });
      console.log('✅ Created SoulAI user index');
    }
  }

  // The "Super-Filter" - Pre-filter candidates before Harmony Algorithm
  async findCandidates(searcherProfile, filters = {}) {
    if (!this.isInitialized) {
      return this.mockFindCandidates(searcherProfile, filters);
    }

    const query = {
      bool: {
        must: [
          { term: { isActive: true } }
        ],
        filter: [],
        must_not: [
          { term: { userId: searcherProfile.userId } } // Exclude self
        ]
      }
    };

    // Apply basic filters
    if (filters.ageMin || filters.ageMax) {
      const ageRange = {};
      if (filters.ageMin) ageRange.gte = filters.ageMin;
      if (filters.ageMax) ageRange.lte = filters.ageMax;
      query.bool.filter.push({ range: { age: ageRange } });
    }

    if (filters.maxDistance && searcherProfile.location) {
      query.bool.filter.push({
        geo_distance: {
          distance: `${filters.maxDistance}km`,
          location: searcherProfile.location
        }
      });
    }

    if (filters.interests && filters.interests.length > 0) {
      query.bool.filter.push({
        terms: { interests: filters.interests }
      });
    }

    if (filters.occupation) {
      query.bool.must.push({
        term: { occupation: filters.occupation }
      });
    }

    if (filters.relationshipGoals) {
      query.bool.filter.push({
        terms: { relationshipGoals: filters.relationshipGoals }
      });
    }

    // Psychological compatibility pre-filter
    if (searcherProfile.hhcCluster) {
      const compatibleClusters = this.getCompatibleClusters(searcherProfile.hhcCluster);
      query.bool.filter.push({
        terms: { hhcCluster: compatibleClusters }
      });
    }

    try {
      const response = await this.client.search({
        index: this.indexName,
        body: {
          query,
          size: 100, // Limit initial candidates
          sort: [
            { lastActive: { order: 'desc' } },
            '_score'
          ]
        }
      });

      const candidates = response.body.hits.hits.map(hit => ({
        userId: hit._source.userId,
        score: hit._score,
        ...hit._source
      }));

      console.log(`🎯 Elasticsearch found ${candidates.length} pre-filtered candidates`);
      return candidates;

    } catch (error) {
      console.error('❌ Elasticsearch search error:', error);
      return this.mockFindCandidates(searcherProfile, filters);
    }
  }

  // Update user profile in Elasticsearch (called when profile changes)
  async indexUser(userProfile) {
    if (!this.isInitialized) {
      console.log('📝 Mock: Would index user', userProfile.userId);
      return;
    }

    try {
      const doc = {
        userId: userProfile.userId,
        age: userProfile.age,
        location: userProfile.location ? {
          lat: userProfile.location.latitude,
          lon: userProfile.location.longitude
        } : null,
        interests: userProfile.interests || [],
        occupation: userProfile.occupation,
        personalityType: userProfile.personalityType,
        relationshipGoals: userProfile.relationshipGoals || [],
        hhcCluster: userProfile.hhcCluster,
        lastActive: new Date(),
        isActive: true,
        bio: userProfile.bio,
        searchableTraits: this.extractSearchableTraits(userProfile)
      };

      await this.client.index({
        index: this.indexName,
        id: userProfile.userId,
        body: doc
      });

      console.log(`✅ Indexed user ${userProfile.userId} in Elasticsearch`);
    } catch (error) {
      console.error('❌ Failed to index user:', error);
    }
  }

  // Psychological clustering compatibility
  getCompatibleClusters(userCluster) {
    // This would be based on your HHC personality research
    const clusterCompatibility = {
      'creative_diplomat': ['analytical_architect', 'empathetic_advisor', 'creative_diplomat'],
      'analytical_architect': ['creative_diplomat', 'logical_commander', 'analytical_architect'],
      'empathetic_advisor': ['creative_diplomat', 'harmony_seeker', 'empathetic_advisor'],
      'logical_commander': ['analytical_architect', 'ambitious_leader', 'logical_commander'],
      'harmony_seeker': ['empathetic_advisor', 'peaceful_mediator', 'harmony_seeker'],
      'ambitious_leader': ['logical_commander', 'dynamic_innovator', 'ambitious_leader'],
      'peaceful_mediator': ['harmony_seeker', 'gentle_supporter', 'peaceful_mediator'],
      'dynamic_innovator': ['ambitious_leader', 'creative_diplomat', 'dynamic_innovator']
    };

    return clusterCompatibility[userCluster] || [userCluster];
  }

  extractSearchableTraits(userProfile) {
    const traits = [];
    
    if (userProfile.personalityType) traits.push(userProfile.personalityType.toLowerCase());
    if (userProfile.interests) traits.push(...userProfile.interests.map(i => i.toLowerCase()));
    if (userProfile.occupation) traits.push(userProfile.occupation.toLowerCase());
    if (userProfile.relationshipGoals) traits.push(...userProfile.relationshipGoals.map(g => g.toLowerCase()));
    
    return traits;
  }

  // Mock implementation for development without Elasticsearch
  initializeMockMode() {
    console.log('🔧 Using mock Elasticsearch for development');
    this.isInitialized = true;
  }

  mockFindCandidates(searcherProfile, filters) {
    // Return mock candidates for development
    const mockCandidates = [
      {
        userId: 'mock_001',
        age: 26,
        interests: ['art', 'travel'],
        occupation: 'designer',
        personalityType: 'ENFP',
        hhcCluster: 'creative_diplomat',
        score: 0.95
      },
      {
        userId: 'mock_002',
        age: 24,
        interests: ['technology', 'philosophy'],
        occupation: 'engineer',
        personalityType: 'INTJ',
        hhcCluster: 'analytical_architect',
        score: 0.87
      }
    ];

    // Apply basic filtering to mock data
    let filtered = mockCandidates.filter(candidate => {
      if (filters.ageMin && candidate.age < filters.ageMin) return false;
      if (filters.ageMax && candidate.age > filters.ageMax) return false;
      if (filters.interests && !filters.interests.some(interest => 
        candidate.interests.includes(interest.toLowerCase()))) return false;
      return true;
    });

    console.log(`🎯 Mock Elasticsearch found ${filtered.length} pre-filtered candidates`);
    return filtered;
  }

  // Health check for monitoring
  async getHealth() {
    if (!this.isInitialized) {
      return { status: 'mock', message: 'Running in mock mode' };
    }

    try {
      const health = await this.client.cluster.health();
      return { status: health.body.status, cluster: health.body.cluster_name };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }
}

export default new ElasticsearchDiscoveryEngine();