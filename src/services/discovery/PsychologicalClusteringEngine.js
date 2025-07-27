// SoulAI Psychological Clustering Engine
// "Psyche-ography" - Clustering users by psychological similarity instead of geography

class PsychologicalClusteringEngine {
  constructor() {
    this.clusters = new Map();
    this.userClusterMap = new Map();
    this.clusterCentroids = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Initialize with predefined psychological archetypes
      await this.initializePsychologicalArchetypes();
      this.isInitialized = true;
      console.log('🧠 PsychologicalClusteringEngine initialized with', this.clusters.size, 'clusters');
    } catch (error) {
      console.error('❌ Failed to initialize psychological clustering:', error);
    }
  }

  // Initialize clusters based on HHC personality research
  async initializePsychologicalArchetypes() {
    const archetypes = [
      {
        id: 'creative_diplomat',
        name: 'Creative Diplomat',
        description: 'Artistic, empathetic, seeks harmony and creative expression',
        centroid: this.createCentroid({
          openness: 0.85,
          agreeableness: 0.78,
          conscientiousness: 0.65,
          extraversion: 0.70,
          neuroticism: 0.45,
          // Additional HHC dimensions
          creativity: 0.90,
          empathy: 0.85,
          leadership: 0.60,
          analytical: 0.55
        }),
        compatibleClusters: ['analytical_architect', 'empathetic_advisor', 'harmony_seeker'],
        traits: ['artistic', 'empathetic', 'intuitive', 'diplomatic']
      },
      {
        id: 'analytical_architect',
        name: 'Analytical Architect',
        description: 'Logical, strategic, values competence and systematic thinking',
        centroid: this.createCentroid({
          openness: 0.75,
          agreeableness: 0.55,
          conscientiousness: 0.88,
          extraversion: 0.45,
          neuroticism: 0.35,
          creativity: 0.70,
          empathy: 0.50,
          leadership: 0.75,
          analytical: 0.92
        }),
        compatibleClusters: ['creative_diplomat', 'logical_commander', 'ambitious_leader'],
        traits: ['logical', 'strategic', 'independent', 'competent']
      },
      {
        id: 'empathetic_advisor',
        name: 'Empathetic Advisor',
        description: 'Caring, supportive, values relationships and emotional connection',
        centroid: this.createCentroid({
          openness: 0.65,
          agreeableness: 0.90,
          conscientiousness: 0.75,
          extraversion: 0.60,
          neuroticism: 0.40,
          creativity: 0.60,
          empathy: 0.95,
          leadership: 0.65,
          analytical: 0.55
        }),
        compatibleClusters: ['creative_diplomat', 'harmony_seeker', 'peaceful_mediator'],
        traits: ['caring', 'supportive', 'intuitive', 'relationship-focused']
      },
      {
        id: 'logical_commander',
        name: 'Logical Commander',
        description: 'Direct, efficient, natural leader with strategic thinking',
        centroid: this.createCentroid({
          openness: 0.70,
          agreeableness: 0.45,
          conscientiousness: 0.85,
          extraversion: 0.80,
          neuroticism: 0.25,
          creativity: 0.65,
          empathy: 0.45,
          leadership: 0.90,
          analytical: 0.88
        }),
        compatibleClusters: ['analytical_architect', 'ambitious_leader', 'dynamic_innovator'],
        traits: ['direct', 'efficient', 'leadership', 'strategic']
      },
      {
        id: 'harmony_seeker',
        name: 'Harmony Seeker',
        description: 'Peaceful, adaptable, values cooperation and balance',
        centroid: this.createCentroid({
          openness: 0.60,
          agreeableness: 0.85,
          conscientiousness: 0.70,
          extraversion: 0.50,
          neuroticism: 0.35,
          creativity: 0.65,
          empathy: 0.80,
          leadership: 0.45,
          analytical: 0.50
        }),
        compatibleClusters: ['empathetic_advisor', 'peaceful_mediator', 'creative_diplomat'],
        traits: ['peaceful', 'adaptable', 'cooperative', 'balanced']
      },
      {
        id: 'ambitious_leader',
        name: 'Ambitious Leader',
        description: 'Goal-oriented, confident, drives results and innovation',
        centroid: this.createCentroid({
          openness: 0.75,
          agreeableness: 0.55,
          conscientiousness: 0.80,
          extraversion: 0.85,
          neuroticism: 0.30,
          creativity: 0.75,
          empathy: 0.55,
          leadership: 0.95,
          analytical: 0.75
        }),
        compatibleClusters: ['logical_commander', 'dynamic_innovator', 'analytical_architect'],
        traits: ['ambitious', 'confident', 'goal-oriented', 'innovative']
      },
      {
        id: 'peaceful_mediator',
        name: 'Peaceful Mediator',
        description: 'Gentle, understanding, resolves conflicts with wisdom',
        centroid: this.createCentroid({
          openness: 0.65,
          agreeableness: 0.95,
          conscientiousness: 0.65,
          extraversion: 0.40,
          neuroticism: 0.25,
          creativity: 0.60,
          empathy: 0.90,
          leadership: 0.50,
          analytical: 0.60
        }),
        compatibleClusters: ['harmony_seeker', 'empathetic_advisor', 'gentle_supporter'],
        traits: ['gentle', 'understanding', 'wise', 'conflict-resolver']
      },
      {
        id: 'dynamic_innovator',
        name: 'Dynamic Innovator',
        description: 'Energetic, creative, pushes boundaries and explores new ideas',
        centroid: this.createCentroid({
          openness: 0.92,
          agreeableness: 0.60,
          conscientiousness: 0.65,
          extraversion: 0.85,
          neuroticism: 0.45,
          creativity: 0.95,
          empathy: 0.65,
          leadership: 0.80,
          analytical: 0.70
        }),
        compatibleClusters: ['ambitious_leader', 'creative_diplomat', 'logical_commander'],
        traits: ['energetic', 'creative', 'boundary-pusher', 'explorer']
      }
    ];

    // Initialize clusters
    archetypes.forEach(archetype => {
      this.clusters.set(archetype.id, {
        ...archetype,
        members: new Set(),
        lastUpdated: new Date()
      });
      this.clusterCentroids.set(archetype.id, archetype.centroid);
    });
  }

  // Assign user to psychological cluster based on HHC vector
  assignUserToCluster(userId, hhcVector) {
    if (!this.isInitialized) {
      console.log('🔧 Cluster engine not initialized, using fallback assignment');
      return 'creative_diplomat'; // Default fallback
    }

    let bestCluster = null;
    let highestSimilarity = -1;

    // Find cluster with highest similarity to user's HHC vector
    for (const [clusterId, cluster] of this.clusters) {
      const similarity = this.calculateCosineSimilarity(hhcVector, cluster.centroid);
      
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestCluster = clusterId;
      }
    }

    // Update cluster membership
    if (bestCluster) {
      // Remove user from previous cluster if exists
      const previousCluster = this.userClusterMap.get(userId);
      if (previousCluster && this.clusters.has(previousCluster)) {
        this.clusters.get(previousCluster).members.delete(userId);
      }

      // Add to new cluster
      this.clusters.get(bestCluster).members.add(userId);
      this.userClusterMap.set(userId, bestCluster);

      console.log(`🎯 Assigned user ${userId} to cluster ${bestCluster} (similarity: ${highestSimilarity.toFixed(3)})`);
    }

    return bestCluster;
  }

  // Get compatible clusters for matchmaking
  getCompatibleClusters(clusterId) {
    const cluster = this.clusters.get(clusterId);
    if (!cluster) {
      return ['creative_diplomat']; // Default fallback
    }

    return cluster.compatibleClusters || [clusterId];
  }

  // Get users in specific clusters (for candidate pre-filtering)
  getUsersInClusters(clusterIds) {
    const users = new Set();
    
    clusterIds.forEach(clusterId => {
      const cluster = this.clusters.get(clusterId);
      if (cluster) {
        cluster.members.forEach(userId => users.add(userId));
      }
    });

    return Array.from(users);
  }

  // Update cluster centroid based on members (machine learning aspect)
  async updateClusterCentroid(clusterId) {
    const cluster = this.clusters.get(clusterId);
    if (!cluster || cluster.members.size === 0) return;

    // This would recalculate centroid based on actual member vectors
    // For now, we keep the predefined archetypes stable
    console.log(`📊 Cluster ${clusterId} has ${cluster.members.size} members`);
  }

  // Helper methods
  createCentroid(dimensions) {
    // Convert personality dimensions to 256D HHC vector
    // This is a simplified mapping - in reality you'd have a more sophisticated conversion
    const vector = new Array(256).fill(0);
    
    // Map key dimensions to vector positions
    const dimensionMapping = {
      openness: [0, 32],
      agreeableness: [32, 64],
      conscientiousness: [64, 96],
      extraversion: [96, 128],
      neuroticism: [128, 160],
      creativity: [160, 192],
      empathy: [192, 224],
      leadership: [224, 240],
      analytical: [240, 256]
    };

    Object.entries(dimensions).forEach(([dim, value]) => {
      const [start, end] = dimensionMapping[dim] || [0, 32];
      for (let i = start; i < end; i++) {
        vector[i] = value + (Math.random() - 0.5) * 0.1; // Add small variation
      }
    });

    return vector;
  }

  calculateCosineSimilarity(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Analytics and monitoring
  getClusterStats() {
    const stats = {};
    
    for (const [clusterId, cluster] of this.clusters) {
      stats[clusterId] = {
        name: cluster.name,
        memberCount: cluster.members.size,
        compatibleClusters: cluster.compatibleClusters,
        traits: cluster.traits
      };
    }

    return stats;
  }

  // Get cluster information for a user
  getUserCluster(userId) {
    const clusterId = this.userClusterMap.get(userId);
    if (!clusterId) return null;

    const cluster = this.clusters.get(clusterId);
    return cluster ? {
      id: clusterId,
      name: cluster.name,
      description: cluster.description,
      traits: cluster.traits,
      memberCount: cluster.members.size
    } : null;
  }
}

export default new PsychologicalClusteringEngine();