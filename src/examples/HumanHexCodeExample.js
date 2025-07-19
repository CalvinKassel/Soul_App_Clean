// Human Hex Code Example Screen
// Demonstrates the advanced matchmaking algorithm with full testing interface

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/globalStyles';
import HumanHexCodeMatcher from '../services/HumanHexCodeMatcher';
import HumanHexCodeDisplay from '../components/HumanHexCodeDisplay';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HumanHexCodeExample = () => {
  const [currentUserId] = useState('demo_user_001');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedDemo, setSelectedDemo] = useState('surface');
  const [hexCodeStats, setHexCodeStats] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Demo conversation examples for different inference phases
  const demoConversations = {
    surface: [
      "I love reading books in my free time",
      "I'm more of an introvert, prefer small groups",
      "I enjoy solving puzzles and brain teasers",
      "Coffee shops are my favorite places to think",
      "I'm studying computer science"
    ],
    layerPeeling: [
      "I love reading books in my free time",
      "I'm more of an introvert, prefer small groups", 
      "I enjoy solving puzzles and brain teasers",
      "Coffee shops are my favorite places to think",
      "I'm studying computer science",
      "I guess I read because it helps me understand different perspectives",
      "Small groups feel safer, less overwhelming than big crowds",
      "Puzzles give me a sense of accomplishment when I solve them",
      "The ambient noise in coffee shops actually helps me concentrate better",
      "I chose CS because I want to build things that help people"
    ],
    coreExcavation: [
      "I love reading books in my free time",
      "I'm more of an introvert, prefer small groups",
      "I enjoy solving puzzles and brain teasers", 
      "Coffee shops are my favorite places to think",
      "I'm studying computer science",
      "I guess I read because it helps me understand different perspectives",
      "Small groups feel safer, less overwhelming than big crowds",
      "Puzzles give me a sense of accomplishment when I solve them",
      "The ambient noise in coffee shops actually helps me concentrate better",
      "I chose CS because I want to build things that help people",
      "I've always been the 'smart kid' but sometimes I feel like I don't connect with people emotionally",
      "My parents pushed me to be successful, but I'm not sure what success means to me anymore",
      "I had a really hard time in middle school, got bullied for being different",
      "I think I use my intelligence as a shield sometimes, to avoid being vulnerable",
      "Deep down, I just want to understand why people behave the way they do"
    ],
    soulMapping: [
      "I love reading books in my free time",
      "I'm more of an introvert, prefer small groups",
      "I enjoy solving puzzles and brain teasers",
      "Coffee shops are my favorite places to think", 
      "I'm studying computer science",
      "I guess I read because it helps me understand different perspectives",
      "Small groups feel safer, less overwhelming than big crowds",
      "Puzzles give me a sense of accomplishment when I solve them",
      "The ambient noise in coffee shops actually helps me concentrate better",
      "I chose CS because I want to build things that help people",
      "I've always been the 'smart kid' but sometimes I feel like I don't connect with people emotionally",
      "My parents pushed me to be successful, but I'm not sure what success means to me anymore",
      "I had a really hard time in middle school, got bullied for being different",
      "I think I use my intelligence as a shield sometimes, to avoid being vulnerable",
      "Deep down, I just want to understand why people behave the way they do",
      "Sometimes I wonder if there's more to existence than just our physical reality",
      "I've always felt like I'm searching for something, but I can't name what it is",
      "When I look at the stars, I feel both infinitely small and deeply connected to everything",
      "I believe that every person has a unique purpose, even if we never discover it",
      "Love, to me, is about truly seeing someone for who they are, not who you want them to be",
      "Death doesn't scare me as much as the idea of living without meaning",
      "I think wisdom comes from embracing both our light and our shadows",
      "My soul feels most alive when I'm helping someone understand something about themselves"
    ]
  };

  useEffect(() => {
    HumanHexCodeMatcher.initialize();
    loadDemoConversation();
  }, []);

  const loadDemoConversation = () => {
    const demo = demoConversations[selectedDemo];
    setConversationHistory(demo);
    
    // Show what phase this represents
    const phaseInfo = {
      surface: "Surface Mapping (1-20 questions)",
      layerPeeling: "Layer Peeling (21-60 questions)", 
      coreExcavation: "Core Excavation (61-100 questions)",
      soulMapping: "Soul Mapping (101+ questions)"
    };
    
    setTimeout(() => {
      Alert.alert(
        'Demo Loaded',
        `Loaded ${phaseInfo[selectedDemo]} conversation example.\n\nThis demonstrates how the "Infinite Why" methodology progressively reveals deeper layers of personality.`,
        [{ text: 'Begin Analysis', onPress: analyzeConversation }]
      );
    }, 500);
  };

  const analyzeConversation = async () => {
    if (conversationHistory.length === 0) {
      Alert.alert('Error', 'No conversation history to analyze');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const profile = await HumanHexCodeMatcher.createUserProfile(currentUserId, conversationHistory);
      const stats = HumanHexCodeMatcher.getHexCodeStats(profile.humanHexCode);
      setHexCodeStats(stats);
      
      Alert.alert(
        'Analysis Complete',
        `Your Human Hex Code has been generated!\n\nCode: ${profile.humanHexCode}\nArchetype: ${stats.archetype.primary}\nConfidence: ${Math.round(profile.overallConfidence * 100)}%`,
        [{ text: 'View Details' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze conversation');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addMessageToHistory = () => {
    if (newMessage.trim()) {
      setConversationHistory(prev => [...prev, newMessage.trim()]);
      setNewMessage('');
    }
  };

  const clearConversation = () => {
    Alert.alert(
      'Clear Conversation',
      'Are you sure you want to clear the conversation history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: () => setConversationHistory([]) }
      ]
    );
  };

  const renderDemoSelector = () => (
    <View style={styles.demoSelector}>
      <Text style={styles.demoTitle}>Inference Phase Demos</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {Object.entries(demoConversations).map(([key, messages]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.demoButton,
              selectedDemo === key && styles.demoButtonActive
            ]}
            onPress={() => setSelectedDemo(key)}
          >
            <Text style={[
              styles.demoButtonText,
              selectedDemo === key && styles.demoButtonTextActive
            ]}>
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </Text>
            <Text style={styles.demoButtonCount}>({messages.length} messages)</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.loadDemoButton}
        onPress={loadDemoConversation}
      >
        <Ionicons name="refresh" size={20} color={COLORS.surface} />
        <Text style={styles.loadDemoText}>Load Demo</Text>
      </TouchableOpacity>
    </View>
  );

  const renderConversationHistory = () => (
    <View style={styles.conversationContainer}>
      <View style={styles.conversationHeader}>
        <Text style={styles.conversationTitle}>
          Conversation History ({conversationHistory.length} messages)
        </Text>
        <TouchableOpacity onPress={clearConversation}>
          <Ionicons name="trash-outline" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.conversationScroll} nestedScrollEnabled>
        {conversationHistory.map((message, index) => (
          <View key={index} style={styles.messageContainer}>
            <Text style={styles.messageIndex}>#{index + 1}</Text>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.messageInputContainer}>
        <TextInput
          style={styles.messageInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Add a message to the conversation..."
          multiline
        />
        <TouchableOpacity 
          style={styles.addMessageButton}
          onPress={addMessageToHistory}
        >
          <Ionicons name="add" size={20} color={COLORS.surface} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAnalysisButton = () => (
    <TouchableOpacity 
      style={[styles.analysisButton, isAnalyzing && styles.analysisButtonDisabled]}
      onPress={analyzeConversation}
      disabled={isAnalyzing}
    >
      <Ionicons 
        name={isAnalyzing ? "hourglass" : "analytics"} 
        size={20} 
        color={COLORS.surface} 
      />
      <Text style={styles.analysisButtonText}>
        {isAnalyzing ? 'Analyzing Soul...' : 'Generate Human Hex Code'}
      </Text>
    </TouchableOpacity>
  );

  const renderInferenceExplanation = () => (
    <View style={styles.explanationContainer}>
      <Text style={styles.explanationTitle}>The "Infinite Why" Methodology</Text>
      <Text style={styles.explanationText}>
        This system progressively reveals deeper layers of personality through four phases:
      </Text>
      
      <View style={styles.phaseContainer}>
        <View style={styles.phase}>
          <Text style={styles.phaseTitle}>1. Surface Mapping</Text>
          <Text style={styles.phaseDescription}>
            Basic personality indicators, interests, and preferences
          </Text>
        </View>
        
        <View style={styles.phase}>
          <Text style={styles.phaseTitle}>2. Layer Peeling</Text>
          <Text style={styles.phaseDescription}>
            Asking "why" to understand motivations behind surface traits
          </Text>
        </View>
        
        <View style={styles.phase}>
          <Text style={styles.phaseTitle}>3. Core Excavation</Text>
          <Text style={styles.phaseDescription}>
            Formative experiences and deeper psychological patterns
          </Text>
        </View>
        
        <View style={styles.phase}>
          <Text style={styles.phaseTitle}>4. Soul Mapping</Text>
          <Text style={styles.phaseDescription}>
            Existential awareness, meaning-making, and spiritual essence
          </Text>
        </View>
      </View>
    </View>
  );

  const renderHexCodeStats = () => {
    if (!hexCodeStats) return null;
    
    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Hex Code Analysis</Text>
        <View style={[styles.hexCodePreview, { backgroundColor: hexCodeStats.hexCode }]}>
          <Text style={styles.hexCodeText}>{hexCodeStats.hexCode}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Archetype:</Text>
          <Text style={styles.statValue}>{hexCodeStats.archetype.primary}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Rarity:</Text>
          <Text style={styles.statValue}>{hexCodeStats.rarity.level.replace('_', ' ')}</Text>
        </View>
        
        <Text style={styles.descriptionText}>{hexCodeStats.description}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Human Hex Code Demo</Text>
          <Text style={styles.subtitle}>Advanced Matchmaking Algorithm</Text>
        </View>
        
        {renderDemoSelector()}
        {renderConversationHistory()}
        {renderAnalysisButton()}
        {renderHexCodeStats()}
        
        {conversationHistory.length > 0 && (
          <HumanHexCodeDisplay 
            userId={currentUserId}
            conversationHistory={conversationHistory}
          />
        )}
        
        {renderInferenceExplanation()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  scrollView: {
    flex: 1,
  },
  
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.surface,
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  
  // Demo Selector
  demoSelector: {
    margin: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
  },
  
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  
  demoButton: {
    backgroundColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  
  demoButtonActive: {
    backgroundColor: COLORS.primary,
  },
  
  demoButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  
  demoButtonTextActive: {
    color: COLORS.surface,
  },
  
  demoButtonCount: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  
  loadDemoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  
  loadDemoText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Conversation
  conversationContainer: {
    margin: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    maxHeight: 300,
  },
  
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  
  conversationScroll: {
    maxHeight: 200,
    marginBottom: 12,
  },
  
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    padding: 8,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  
  messageIndex: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: 8,
    minWidth: 20,
  },
  
  messageText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  messageInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: COLORS.text,
    maxHeight: 80,
  },
  
  addMessageButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
  },
  
  // Analysis
  analysisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 16,
    margin: 20,
  },
  
  analysisButtonDisabled: {
    opacity: 0.6,
  },
  
  analysisButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Stats
  statsContainer: {
    margin: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
  },
  
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  
  hexCodePreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  
  hexCodeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    textShadowColor: '#fff',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  
  descriptionText: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 12,
    lineHeight: 20,
  },
  
  // Explanation
  explanationContainer: {
    margin: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
  },
  
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  
  explanationText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  
  phaseContainer: {
    marginTop: 8,
  },
  
  phase: {
    marginBottom: 12,
  },
  
  phaseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  
  phaseDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
});

export default HumanHexCodeExample;