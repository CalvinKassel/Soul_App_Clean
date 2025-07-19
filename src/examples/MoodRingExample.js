// Mood Ring Feature Example Usage
// Demonstrates how to integrate the Mood Ring feature across different screens

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Import Mood Ring components
import { useMoodGradient } from '../hooks/useMoodGradient';
import MoodAnalysisService from '../services/MoodAnalysisService';
import MoodIndicator, { CompactMoodIndicator, DetailedMoodIndicator } from '../components/MoodIndicator';
import { MOOD_GRADIENTS, getMoodGradient } from '../services/MoodToGradientMap';
import { COLORS } from '../styles/globalStyles';

const MoodRingExample = () => {
  const moodGradient = useMoodGradient();
  const [testMessage, setTestMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  // Initialize mood analysis service
  useEffect(() => {
    MoodAnalysisService.initialize();
  }, []);

  // Test mood analysis
  const testMoodAnalysis = async () => {
    if (!testMessage.trim()) {
      Alert.alert('Error', 'Please enter a message to analyze');
      return;
    }

    try {
      const result = await MoodAnalysisService.analyzeMood(testMessage);
      setAnalysisResult(result);
      
      if (result.primaryMood) {
        moodGradient.updateMood(result.primaryMood.mood, result.primaryMood.confidence);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze mood');
    }
  };

  // Quick mood presets
  const quickMoods = [
    { mood: 'joyful', message: 'I\'m so happy and excited! 😊✨' },
    { mood: 'loving', message: 'I love spending time with you ❤️' },
    { mood: 'anxious', message: 'I\'m feeling really worried about this 😰' },
    { mood: 'flirty', message: 'You look absolutely stunning today 😘' },
    { mood: 'calm', message: 'Feeling peaceful and relaxed 😌' },
    { mood: 'frustrated', message: 'This is really annoying me 😤' },
  ];

  const analytics = moodGradient.getMoodAnalytics();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with mood indicator */}
      <View style={styles.header}>
        <Text style={styles.title}>Mood Ring Demo</Text>
        <CompactMoodIndicator
          mood={moodGradient.currentMood}
          gradient={moodGradient.currentGradient}
          confidence={moodGradient.moodConfidence}
          onPress={() => {
            Alert.alert(
              'Mood Analytics',
              `Current: ${analytics.currentMood}\nConfidence: ${Math.round(analytics.moodConfidence * 100)}%\nRecent: ${analytics.recentMoods.map(m => m.mood).join(', ')}`,
              [
                { text: 'Reset', onPress: () => moodGradient.resetMood() },
                { text: 'OK' }
              ]
            );
          }}
        />
      </View>

      {/* Background with mood gradient */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={moodGradient.currentGradient.colors}
          style={styles.gradientBackground}
          start={moodGradient.currentGradient.start}
          end={moodGradient.currentGradient.end}
          locations={moodGradient.currentGradient.locations}
        />
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Test Message Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Test Mood Analysis</Text>
            <TextInput
              style={styles.textInput}
              value={testMessage}
              onChangeText={setTestMessage}
              placeholder="Enter a message to analyze mood..."
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity 
              style={styles.button}
              onPress={testMoodAnalysis}
            >
              <Text style={styles.buttonText}>Analyze Mood</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Mood Presets */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Mood Tests</Text>
            <View style={styles.quickMoodsGrid}>
              {quickMoods.map((preset, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickMoodButton}
                  onPress={() => {
                    setTestMessage(preset.message);
                    moodGradient.forceMoodChange(preset.mood);
                  }}
                >
                  <Text style={styles.quickMoodText}>{preset.mood}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Analysis Results */}
          {analysisResult && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Analysis Results</Text>
              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>Primary Mood</Text>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Mood:</Text>
                  <Text style={styles.resultValue}>{analysisResult.primaryMood.mood}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Confidence:</Text>
                  <Text style={styles.resultValue}>
                    {Math.round(analysisResult.primaryMood.confidence * 100)}%
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Methods:</Text>
                  <Text style={styles.resultValue}>
                    {analysisResult.primaryMood.methods.join(', ')}
                  </Text>
                </View>
                
                {analysisResult.allMoods.length > 1 && (
                  <View style={styles.alternativeMoods}>
                    <Text style={styles.resultTitle}>Alternative Moods</Text>
                    {analysisResult.allMoods.slice(1).map((mood, index) => (
                      <Text key={index} style={styles.alternativeMood}>
                        {mood.mood} ({Math.round(mood.confidence * 100)}%)
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Detailed Mood Indicator */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detailed Mood Display</Text>
            <DetailedMoodIndicator
              mood={moodGradient.currentMood}
              gradient={moodGradient.currentGradient}
              confidence={moodGradient.moodConfidence}
              analytics={analytics}
              onPress={() => {
                const suggestions = moodGradient.getMoodSuggestions();
                if (suggestions.length > 0) {
                  Alert.alert(
                    'Mood Suggestions',
                    `Try focusing on: ${suggestions.join(', ')}`,
                    [{ text: 'OK' }]
                  );
                }
              }}
            />
          </View>

          {/* Available Moods Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Moods</Text>
            <View style={styles.moodsGrid}>
              {Object.entries(MOOD_GRADIENTS).map(([mood, gradient]) => (
                <TouchableOpacity
                  key={mood}
                  style={styles.moodPreview}
                  onPress={() => moodGradient.forceMoodChange(mood)}
                >
                  <LinearGradient
                    colors={gradient.colors}
                    style={styles.moodPreviewGradient}
                    start={gradient.start}
                    end={gradient.end}
                    locations={gradient.locations}
                  />
                  <Text style={styles.moodPreviewText}>{mood}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Usage Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Integration Instructions</Text>
            <View style={styles.instructionCard}>
              <Text style={styles.instructionTitle}>1. Import Components</Text>
              <Text style={styles.instructionText}>
                {`import { useMoodGradient } from '../hooks/useMoodGradient';
import MoodAnalysisService from '../services/MoodAnalysisService';
import MoodIndicator from '../components/MoodIndicator';`}
              </Text>
              
              <Text style={styles.instructionTitle}>2. Initialize Hook</Text>
              <Text style={styles.instructionText}>
                {`const moodGradient = useMoodGradient();`}
              </Text>
              
              <Text style={styles.instructionTitle}>3. Analyze Messages</Text>
              <Text style={styles.instructionText}>
                {`const result = await MoodAnalysisService.analyzeMood(message);
moodGradient.updateMood(result.primaryMood.mood, result.primaryMood.confidence);`}
              </Text>
              
              <Text style={styles.instructionTitle}>4. Apply Gradient</Text>
              <Text style={styles.instructionText}>
                {`<LinearGradient
  colors={moodGradient.currentGradient.colors}
  style={styles.background}
  start={moodGradient.currentGradient.start}
  end={moodGradient.currentGradient.end}
  locations={moodGradient.currentGradient.locations}
/>`}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  
  backgroundContainer: {
    flex: 1,
    position: 'relative',
  },
  
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  
  content: {
    flex: 1,
    padding: 16,
  },
  
  section: {
    marginBottom: 24,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.surface,
    marginBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 8,
    borderRadius: 8,
  },
  
  textInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  
  buttonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  
  quickMoodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  quickMoodButton: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    margin: 4,
  },
  
  quickMoodText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  
  resultCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 16,
  },
  
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  
  resultLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  
  resultValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  
  alternativeMoods: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  
  alternativeMood: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  
  moodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  moodPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  
  moodPreviewGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  
  moodPreviewText: {
    fontSize: 10,
    color: COLORS.surface,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  
  instructionCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 16,
  },
  
  instructionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    marginTop: 8,
  },
  
  instructionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    backgroundColor: COLORS.background,
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
});

export default MoodRingExample;