// SoulAI Prometheus Monitoring Service
// Tracks key metrics for system health and performance optimization

import { register, Counter, Histogram, Gauge } from 'prom-client';

class PrometheusMetrics {
  constructor() {
    this.isInitialized = false;
    this.metrics = {};
  }

  initialize() {
    try {
      // Clear existing metrics
      register.clear();

      // Discovery Engine Metrics
      this.metrics.harmonyAlgorithmDuration = new Histogram({
        name: 'soulai_harmony_algorithm_duration_seconds',
        help: 'Duration of Harmony Algorithm calculations',
        labelNames: ['user_cluster', 'candidate_cluster'],
        buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0]
      });

      this.metrics.elasticsearchQueryDuration = new Histogram({
        name: 'soulai_elasticsearch_query_duration_seconds',
        help: 'Duration of Elasticsearch queries',
        labelNames: ['query_type'],
        buckets: [0.001, 0.01, 0.05, 0.1, 0.25, 0.5, 1.0]
      });

      this.metrics.discoveryPipelineTotal = new Counter({
        name: 'soulai_discovery_pipeline_total',
        help: 'Total number of discovery pipeline executions',
        labelNames: ['status', 'user_cluster']
      });

      this.metrics.candidatesPreFiltered = new Histogram({
        name: 'soulai_candidates_prefiltered_total',
        help: 'Number of candidates found in pre-filtering stage',
        buckets: [0, 10, 25, 50, 100, 250, 500, 1000]
      });

      this.metrics.finalMatchesReturned = new Histogram({
        name: 'soulai_final_matches_total',
        help: 'Number of final matches returned to users',
        buckets: [0, 1, 3, 5, 10, 15, 20]
      });

      // AI Service Metrics
      this.metrics.openaiApiLatency = new Histogram({
        name: 'soulai_openai_api_latency_ms',
        help: 'Latency of OpenAI API calls',
        labelNames: ['endpoint', 'model'],
        buckets: [100, 250, 500, 1000, 2000, 5000, 10000]
      });

      this.metrics.openaiApiCalls = new Counter({
        name: 'soulai_openai_api_calls_total',
        help: 'Total OpenAI API calls made',
        labelNames: ['endpoint', 'model', 'status']
      });

      this.metrics.ragRetrievalAccuracy = new Gauge({
        name: 'soulai_rag_retrieval_accuracy_percent',
        help: 'RAG system retrieval accuracy percentage',
        labelNames: ['knowledge_base']
      });

      this.metrics.ragQueryDuration = new Histogram({
        name: 'soulai_rag_query_duration_seconds',
        help: 'Duration of RAG knowledge base queries',
        buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1.0]
      });

      // Chat and Messaging Metrics
      this.metrics.messagesProcessed = new Counter({
        name: 'soulai_messages_processed_total',
        help: 'Total messages processed by the system',
        labelNames: ['message_type', 'user_cluster']
      });

      this.metrics.conversationDuration = new Histogram({
        name: 'soulai_conversation_duration_minutes',
        help: 'Duration of user conversations',
        buckets: [1, 5, 10, 15, 30, 60, 120, 240]
      });

      this.metrics.aiResponseTime = new Histogram({
        name: 'soulai_ai_response_time_seconds',
        help: 'Time to generate AI responses',
        labelNames: ['ai_agent', 'complexity'],
        buckets: [0.1, 0.5, 1.0, 2.0, 5.0, 10.0]
      });

      // User Engagement Metrics
      this.metrics.userSessions = new Counter({
        name: 'soulai_user_sessions_total',
        help: 'Total user sessions',
        labelNames: ['user_cluster', 'session_type']
      });

      this.metrics.matchSuccessRate = new Gauge({
        name: 'soulai_match_success_rate_percent',
        help: 'Percentage of successful matches leading to conversations',
        labelNames: ['user_cluster', 'match_cluster']
      });

      this.metrics.userSatisfactionScore = new Gauge({
        name: 'soulai_user_satisfaction_score',
        help: 'User satisfaction scores',
        labelNames: ['feature', 'user_cluster']
      });

      // System Health Metrics
      this.metrics.systemErrors = new Counter({
        name: 'soulai_system_errors_total',
        help: 'Total system errors',
        labelNames: ['service', 'error_type', 'severity']
      });

      this.metrics.activeUsers = new Gauge({
        name: 'soulai_active_users_current',
        help: 'Current number of active users',
        labelNames: ['time_window'] // 1h, 24h, 7d
      });

      this.metrics.psychologicalClusters = new Gauge({
        name: 'soulai_psychological_cluster_size',
        help: 'Number of users in each psychological cluster',
        labelNames: ['cluster_id', 'cluster_name']
      });

      // Performance Metrics
      this.metrics.memoryUsage = new Gauge({
        name: 'soulai_memory_usage_bytes',
        help: 'Memory usage of the application',
        labelNames: ['service']
      });

      this.metrics.cpuUsage = new Gauge({
        name: 'soulai_cpu_usage_percent',
        help: 'CPU usage percentage',
        labelNames: ['service']
      });

      // Register default Node.js metrics
      this.collectDefaultMetrics();

      this.isInitialized = true;
      console.log('📊 Prometheus metrics initialized');

      return { success: true };
    } catch (error) {
      console.error('❌ Failed to initialize Prometheus metrics:', error);
      return { success: false, error: error.message };
    }
  }

  collectDefaultMetrics() {
    // Enable collection of default Node.js metrics
    const collectDefaultMetrics = require('prom-client').collectDefaultMetrics;
    collectDefaultMetrics({
      timeout: 5000,
      gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
      prefix: 'soulai_'
    });
  }

  // Discovery Engine Metrics
  recordHarmonyCalculation(duration, userCluster, candidateCluster) {
    if (this.metrics.harmonyAlgorithmDuration) {
      this.metrics.harmonyAlgorithmDuration
        .labels(userCluster || 'unknown', candidateCluster || 'unknown')
        .observe(duration / 1000); // Convert to seconds
    }
  }

  recordElasticsearchQuery(duration, queryType) {
    if (this.metrics.elasticsearchQueryDuration) {
      this.metrics.elasticsearchQueryDuration
        .labels(queryType || 'search')
        .observe(duration / 1000);
    }
  }

  recordDiscoveryPipeline(status, userCluster, candidatesFound, finalMatches) {
    if (this.metrics.discoveryPipelineTotal) {
      this.metrics.discoveryPipelineTotal
        .labels(status, userCluster || 'unknown')
        .inc();
    }

    if (this.metrics.candidatesPreFiltered) {
      this.metrics.candidatesPreFiltered.observe(candidatesFound);
    }

    if (this.metrics.finalMatchesReturned) {
      this.metrics.finalMatchesReturned.observe(finalMatches);
    }
  }

  // AI Service Metrics
  recordOpenAICall(endpoint, model, duration, status) {
    if (this.metrics.openaiApiCalls) {
      this.metrics.openaiApiCalls
        .labels(endpoint, model, status)
        .inc();
    }

    if (this.metrics.openaiApiLatency && duration) {
      this.metrics.openaiApiLatency
        .labels(endpoint, model)
        .observe(duration);
    }
  }

  recordRAGQuery(duration, accuracy, knowledgeBase) {
    if (this.metrics.ragQueryDuration) {
      this.metrics.ragQueryDuration.observe(duration / 1000);
    }

    if (this.metrics.ragRetrievalAccuracy && accuracy !== undefined) {
      this.metrics.ragRetrievalAccuracy
        .labels(knowledgeBase || 'default')
        .set(accuracy * 100); // Convert to percentage
    }
  }

  // Chat and Messaging Metrics
  recordMessage(messageType, userCluster) {
    if (this.metrics.messagesProcessed) {
      this.metrics.messagesProcessed
        .labels(messageType, userCluster || 'unknown')
        .inc();
    }
  }

  recordAIResponse(aiAgent, duration, complexity = 'medium') {
    if (this.metrics.aiResponseTime) {
      this.metrics.aiResponseTime
        .labels(aiAgent, complexity)
        .observe(duration / 1000);
    }
  }

  recordConversation(durationMinutes) {
    if (this.metrics.conversationDuration) {
      this.metrics.conversationDuration.observe(durationMinutes);
    }
  }

  // User Engagement Metrics
  recordUserSession(userCluster, sessionType) {
    if (this.metrics.userSessions) {
      this.metrics.userSessions
        .labels(userCluster || 'unknown', sessionType)
        .inc();
    }
  }

  updateMatchSuccessRate(userCluster, matchCluster, successRate) {
    if (this.metrics.matchSuccessRate) {
      this.metrics.matchSuccessRate
        .labels(userCluster || 'unknown', matchCluster || 'unknown')
        .set(successRate * 100);
    }
  }

  updateUserSatisfaction(feature, userCluster, score) {
    if (this.metrics.userSatisfactionScore) {
      this.metrics.userSatisfactionScore
        .labels(feature, userCluster || 'unknown')
        .set(score);
    }
  }

  // System Health Metrics
  recordError(service, errorType, severity = 'medium') {
    if (this.metrics.systemErrors) {
      this.metrics.systemErrors
        .labels(service, errorType, severity)
        .inc();
    }
  }

  updateActiveUsers(count, timeWindow) {
    if (this.metrics.activeUsers) {
      this.metrics.activeUsers
        .labels(timeWindow)
        .set(count);
    }
  }

  updateClusterSize(clusterId, clusterName, size) {
    if (this.metrics.psychologicalClusters) {
      this.metrics.psychologicalClusters
        .labels(clusterId, clusterName)
        .set(size);
    }
  }

  // Performance monitoring
  updateResourceUsage() {
    if (!this.isInitialized) return;

    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      if (this.metrics.memoryUsage) {
        this.metrics.memoryUsage.labels('heap_used').set(memUsage.heapUsed);
        this.metrics.memoryUsage.labels('heap_total').set(memUsage.heapTotal);
        this.metrics.memoryUsage.labels('rss').set(memUsage.rss);
      }

      // CPU usage calculation (simplified)
      const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds
      if (this.metrics.cpuUsage) {
        this.metrics.cpuUsage.labels('total').set(cpuPercent);
      }
    } catch (error) {
      console.error('❌ Error updating resource usage metrics:', error);
    }
  }

  // Export metrics for Prometheus scraping
  getMetrics() {
    return register.metrics();
  }

  // Health check endpoint
  getHealthMetrics() {
    return {
      metricsInitialized: this.isInitialized,
      totalMetrics: register.getMetricsAsJSON().length,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }

  // Start background resource monitoring
  startResourceMonitoring(intervalMs = 10000) {
    if (this.resourceMonitorInterval) {
      clearInterval(this.resourceMonitorInterval);
    }

    this.resourceMonitorInterval = setInterval(() => {
      this.updateResourceUsage();
    }, intervalMs);

    console.log(`📊 Started resource monitoring (${intervalMs}ms interval)`);
  }

  // Stop background monitoring
  stopResourceMonitoring() {
    if (this.resourceMonitorInterval) {
      clearInterval(this.resourceMonitorInterval);
      this.resourceMonitorInterval = null;
      console.log('📊 Stopped resource monitoring');
    }
  }

  // Utility method for timing operations
  startTimer() {
    return Date.now();
  }

  endTimer(startTime) {
    return Date.now() - startTime;
  }
}

export default new PrometheusMetrics();