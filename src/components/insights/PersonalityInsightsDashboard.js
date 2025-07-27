// PersonalityInsightsDashboard.js - Visual personality insights with charts
// Transforms raw memory data into beautiful, interactive visualizations

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal
} from 'react-native';
import { LineChart, BarChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../../styles/globalStyles';

const screenWidth = Dimensions.get('window').width;

// Default personality data structure
const DEFAULT_PERSONALITY = {
  bigFive: {
    openness: 70,
    conscientiousness: 65,
    extraversion: 45,
    agreeableness: 80,
    neuroticism: 35
  },
  mbti: {
    type: 'INFJ',
    dimensions: {
      introversion: 65,
      intuition: 85,
      feeling: 75,
      judging: 70
    }
  },
  sentimentHistory: [
    { date: '2024-01-01', sentiment: 0.6, conversations: 3 },
    { date: '2024-01-02', sentiment: 0.8, conversations: 5 },
    { date: '2024-01-03', sentiment: 0.4, conversations: 2 },
    { date: '2024-01-04', sentiment: 0.9, conversations: 4 },
    { date: '2024-01-05', sentiment: 0.7, conversations: 6 },
    { date: '2024-01-06', sentiment: 0.8, conversations: 3 },
    { date: '2024-01-07', sentiment: 0.9, conversations: 7 }
  ]
};

export default function PersonalityInsightsDashboard({ 
  memoryInsights, 
  visible, 
  onClose 
}) {
  const [activeTab, setActiveTab] = useState('personality');
  const [selectedConcept, setSelectedConcept] = useState(null);
  
  // Process personality data from memory insights
  const processPersonalityData = () => {
    if (!memoryInsights?.personalityProfile) {
      return DEFAULT_PERSONALITY;
    }
    
    // Extract and process personality data
    const profile = memoryInsights.personalityProfile;
    return {
      bigFive: profile.bigFive || DEFAULT_PERSONALITY.bigFive,
      mbti: profile.mbti || DEFAULT_PERSONALITY.mbti,
      sentimentHistory: profile.sentimentHistory || DEFAULT_PERSONALITY.sentimentHistory
    };
  };

  const personalityData = processPersonalityData();
  
  // Chart configurations
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#f8f9fa',
    color: (opacity = 1) => `rgba(107, 70, 193, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 1,
  };

  // Big Five radar chart data
  const bigFiveData = {
    labels: ['Openness', 'Conscientious', 'Extraversion', 'Agreeableness', 'Neuroticism'],
    datasets: [{
      data: [
        personalityData.bigFive.openness,
        personalityData.bigFive.conscientiousness,
        personalityData.bigFive.extraversion,
        personalityData.bigFive.agreeableness,
        personalityData.bigFive.neuroticism
      ]
    }]
  };

  // Sentiment trend line chart data
  const sentimentTrendData = {
    labels: personalityData.sentimentHistory.map((_, index) => `Day ${index + 1}`),
    datasets: [{
      data: personalityData.sentimentHistory.map(item => item.sentiment * 100),
      color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`,
      strokeWidth: 3
    }]
  };

  // MBTI dimensions progress chart
  const mbtiProgressData = {
    labels: ['I/E', 'S/N', 'T/F', 'J/P'],
    data: [
      personalityData.mbti.dimensions.introversion / 100,
      personalityData.mbti.dimensions.intuition / 100,
      personalityData.mbti.dimensions.feeling / 100,
      personalityData.mbti.dimensions.judging / 100
    ]
  };

  const renderPersonalityTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Big Five Personality Traits */}
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Big Five Personality Traits</Text>
        <Text style={styles.chartSubtitle}>Your psychological profile based on conversation analysis</Text>
        
        <View style={styles.chartContainer}>
          <BarChart
            data={bigFiveData}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars={true}
          />
        </View>
        
        {/* Big Five explanations */}
        <View style={styles.traitExplanations}>
          {Object.entries(personalityData.bigFive).map(([trait, score]) => (
            <View key={trait} style={styles.traitItem}>
              <View style={styles.traitHeader}>
                <Text style={styles.traitName}>{trait.charAt(0).toUpperCase() + trait.slice(1)}</Text>
                <Text style={styles.traitScore}>{score}%</Text>
              </View>
              <View style={styles.traitBar}>
                <View style={[styles.traitProgress, { width: `${score}%` }]} />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* MBTI Type */}
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>MBTI Personality Type</Text>
        <Text style={styles.chartSubtitle}>Myers-Briggs Type Indicator: {personalityData.mbti.type}</Text>
        
        <View style={styles.chartContainer}>
          <ProgressChart
            data={mbtiProgressData}
            width={screenWidth - 60}
            height={220}
            strokeWidth={12}
            radius={32}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`
            }}
            hideLegend={false}
            style={styles.chart}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderSentimentTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Conversation Sentiment Trends</Text>
        <Text style={styles.chartSubtitle}>Your emotional journey over time</Text>
        
        <View style={styles.chartContainer}>
          <LineChart
            data={sentimentTrendData}
            width={screenWidth - 60}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`
            }}
            style={styles.chart}
            bezier
          />
        </View>
        
        {/* Sentiment insights */}
        <View style={styles.sentimentInsights}>
          <Text style={styles.insightTitle}>Key Insights</Text>
          {personalityData.sentimentHistory.slice(-3).map((item, index) => (
            <View key={index} style={styles.insightItem}>
              <View style={[
                styles.sentimentIndicator, 
                { backgroundColor: item.sentiment > 0.7 ? '#10B981' : item.sentiment > 0.4 ? '#F59E0B' : '#EF4444' }
              ]} />
              <Text style={styles.insightText}>
                {item.sentiment > 0.7 ? 'Positive' : item.sentiment > 0.4 ? 'Neutral' : 'Challenging'} day with {item.conversations} conversations
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderMemoryTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Core Memory Section */}
      {memoryInsights?.coreMemory && Object.keys(memoryInsights.coreMemory).length > 0 && (
        <View style={styles.memorySection}>
          <Text style={styles.memorySectionTitle}>Core Memory</Text>
          <View style={styles.memoryItems}>
            {Object.entries(memoryInsights.coreMemory).slice(0, 8).map(([key, value]) => (
              <View key={key} style={styles.memoryItem}>
                <Text style={styles.memoryItemKey}>{key.replace(/_/g, ' ').toUpperCase()}</Text>
                <Text style={styles.memoryItemValue}>{String(value).substring(0, 100)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {/* Semantic Concepts - Interactive */}
      {memoryInsights?.semanticConcepts && memoryInsights.semanticConcepts.length > 0 && (
        <View style={styles.memorySection}>
          <Text style={styles.memorySectionTitle}>Learned Concepts</Text>
          <Text style={styles.memorySubtitle}>Tap any concept to explore related memories</Text>
          <View style={styles.conceptTags}>
            {memoryInsights.semanticConcepts.slice(0, 15).map((concept, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.conceptTag,
                  selectedConcept === concept && styles.conceptTagSelected
                ]}
                onPress={() => setSelectedConcept(selectedConcept === concept ? null : concept)}
              >
                <Text style={[
                  styles.conceptText,
                  selectedConcept === concept && styles.conceptTextSelected
                ]}>
                  {concept.concept || concept.name || concept}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {selectedConcept && (
            <View style={styles.conceptDetails}>
              <Text style={styles.conceptDetailTitle}>Related Memories</Text>
              <Text style={styles.conceptDetailText}>
                Memories and conversations related to "{selectedConcept.concept || selectedConcept.name || selectedConcept}" would appear here.
              </Text>
            </View>
          )}
        </View>
      )}
      
      {memoryInsights?.lastUpdated && (
        <Text style={styles.memoryTimestamp}>
          Last updated: {new Date(memoryInsights.lastUpdated).toLocaleString()}
        </Text>
      )}
    </ScrollView>
  );

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Personality Insights</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {/* Tab Navigation */}
          <View style={styles.tabNavigation}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'personality' && styles.activeTab]}
              onPress={() => setActiveTab('personality')}
            >
              <Ionicons name="person" size={20} color={activeTab === 'personality' ? COLORS.primary : '#666'} />
              <Text style={[styles.tabText, activeTab === 'personality' && styles.activeTabText]}>
                Personality
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'sentiment' && styles.activeTab]}
              onPress={() => setActiveTab('sentiment')}
            >
              <Ionicons name="trending-up" size={20} color={activeTab === 'sentiment' ? COLORS.primary : '#666'} />
              <Text style={[styles.tabText, activeTab === 'sentiment' && styles.activeTabText]}>
                Sentiment
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'memory' && styles.activeTab]}
              onPress={() => setActiveTab('memory')}
            >
              <Ionicons name="brain" size={20} color={activeTab === 'memory' ? COLORS.primary : '#666'} />
              <Text style={[styles.tabText, activeTab === 'memory' && styles.activeTabText]}>
                Memory
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Tab Content */}
          {activeTab === 'personality' && renderPersonalityTab()}
          {activeTab === 'sentiment' && renderSentimentTab()}
          {activeTab === 'memory' && renderMemoryTab()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  closeButton: {
    padding: 4,
  },
  tabNavigation: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  chartSection: {
    marginBottom: 30,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    padding: 15,
  },
  chart: {
    borderRadius: 8,
  },
  traitExplanations: {
    gap: 12,
  },
  traitItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  traitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  traitName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  traitScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  traitBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  traitProgress: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  sentimentInsights: {
    marginTop: 20,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  sentimentIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  insightText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    flex: 1,
  },
  // Memory section styles
  memorySection: {
    marginBottom: 25,
  },
  memorySectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  memorySubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  memoryItems: {
    gap: 10,
  },
  memoryItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  memoryItemKey: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  memoryItemValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  conceptTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conceptTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  conceptTagSelected: {
    backgroundColor: COLORS.secondary,
  },
  conceptText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  conceptTextSelected: {
    fontWeight: '600',
  },
  conceptDetails: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  conceptDetailTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  conceptDetailText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  memoryTimestamp: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});