// Human Hex Code Display Component
// Visual representation of user's unique Human Hex Code and compatibility matching

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/globalStyles';
import HumanHexCodeMatcher from '../services/HumanHexCodeMatcher';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HumanHexCodeDisplay = ({ userId, conversationHistory = [] }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [compatibleMatches, setCompatibleMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    initializeProfile();
  }, [userId, conversationHistory]);

  const initializeProfile = async () => {
    try {
      await HumanHexCodeMatcher.initialize();
      
      let profile = HumanHexCodeMatcher.getUserProfile(userId);
      
      if (!profile && conversationHistory.length > 0) {
        profile = await HumanHexCodeMatcher.createUserProfile(userId, conversationHistory);
      }
      
      if (profile) {
        setUserProfile(profile);
        
        // Find compatible matches
        const matches = await HumanHexCodeMatcher.findCompatibleMatches(userId, {
          minCompatibility: 0.6,
          maxResults: 20
        });
        setCompatibleMatches(matches);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error initializing profile:', error);
      setLoading(false);
    }
  };

  const animateHexCode = () => {
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showHexCodeDetails = () => {
    if (!userProfile) return;
    
    const stats = HumanHexCodeMatcher.getHexCodeStats(userProfile.humanHexCode);
    
    Alert.alert(
      'Your Human Hex Code',
      `Code: ${stats.hexCode}\n\nArchetype: ${stats.archetype.primary}\n\nRarity: ${stats.rarity.level}\n\nDescription: ${stats.description}`,
      [
        { text: 'View Dimensions', onPress: () => setShowDetails(true) },
        { text: 'OK' }
      ]
    );
  };

  const renderHexCodeVisualization = () => {
    if (!userProfile) return null;
    
    const scale = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.1],
    });
    
    return (
      <View style={styles.hexCodeContainer}>
        <TouchableOpacity onPress={showHexCodeDetails} onLongPress={animateHexCode}>
          <Animated.View style={[styles.hexCodeDisplay, { transform: [{ scale }] }]}>
            <LinearGradient
              colors={[userProfile.humanHexCode, '#FFFFFF']}
              style={styles.hexCodeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.hexCodeText}>{userProfile.humanHexCode}</Text>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
        
        <View style={styles.hexCodeInfo}>
          <Text style={styles.hexCodeTitle}>Your Human Hex Code</Text>
          <Text style={styles.hexCodeSubtitle}>
            Confidence: {Math.round(userProfile.overallConfidence * 100)}%
          </Text>
        </View>
      </View>
    );
  };

  const renderDimensionBars = () => {
    if (!userProfile) return null;
    
    const dimensions = HumanHexCodeMatcher.parseHexCode(userProfile.humanHexCode);
    
    return (
      <View style={styles.dimensionsContainer}>
        <Text style={styles.dimensionsTitle}>Personality Dimensions</Text>
        
        <View style={styles.dimensionBar}>
          <Text style={styles.dimensionLabel}>Metaphysical Core (Hue)</Text>
          <View style={styles.dimensionTrack}>
            <View 
              style={[
                styles.dimensionFill, 
                { 
                  width: `${(dimensions.hue / 360) * 100}%`,
                  backgroundColor: `hsl(${dimensions.hue}, 70%, 50%)`
                }
              ]} 
            />
          </View>
          <Text style={styles.dimensionValue}>{Math.round(dimensions.hue)}°</Text>
        </View>
        
        <View style={styles.dimensionBar}>
          <Text style={styles.dimensionLabel}>Manifested Self</Text>
          <View style={styles.dimensionTrack}>
            <View 
              style={[
                styles.dimensionFill, 
                { 
                  width: `${(dimensions.manifested / 255) * 100}%`,
                  backgroundColor: COLORS.primary
                }
              ]} 
            />
          </View>
          <Text style={styles.dimensionValue}>{dimensions.manifested}/255</Text>
        </View>
        
        <View style={styles.dimensionBar}>
          <Text style={styles.dimensionLabel}>Human/Soul Depth</Text>
          <View style={styles.dimensionTrack}>
            <View 
              style={[
                styles.dimensionFill, 
                { 
                  width: `${(dimensions.soul / 255) * 100}%`,
                  backgroundColor: COLORS.secondary
                }
              ]} 
            />
          </View>
          <Text style={styles.dimensionValue}>{dimensions.soul}/255</Text>
        </View>
      </View>
    );
  };

  const renderCompatibleMatches = () => {
    if (compatibleMatches.length === 0) return null;
    
    return (
      <View style={styles.matchesContainer}>
        <Text style={styles.matchesTitle}>Compatible Matches ({compatibleMatches.length})</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {compatibleMatches.map((match, index) => (
            <TouchableOpacity
              key={index}
              style={styles.matchCard}
              onPress={() => showMatchDetails(match)}
            >
              <View style={[styles.matchColor, { backgroundColor: match.hexCode }]} />
              <Text style={styles.matchHex}>{match.hexCode}</Text>
              <Text style={styles.matchCompatibility}>
                {Math.round(match.compatibility * 100)}%
              </Text>
              <Text style={styles.matchType}>{match.matchType.replace('_', ' ')}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const showMatchDetails = (match) => {
    const stats = HumanHexCodeMatcher.getHexCodeStats(match.hexCode);
    
    Alert.alert(
      'Match Details',
      `Hex Code: ${match.hexCode}\n\nCompatibility: ${Math.round(match.compatibility * 100)}%\n\nMatch Type: ${match.matchType.replace('_', ' ')}\n\nArchetype: ${stats.archetype.primary}\n\nRarity: ${stats.rarity.level}`,
      [{ text: 'OK' }]
    );
  };

  const renderInferenceJourney = () => {
    if (!userProfile?.inferenceJourney) return null;
    
    const journey = userProfile.inferenceJourney;
    
    return (
      <View style={styles.journeyContainer}>
        <Text style={styles.journeyTitle}>Inference Journey</Text>
        <View style={styles.journeyStats}>
          <View style={styles.journeyStat}>
            <Text style={styles.journeyLabel}>Phase</Text>
            <Text style={styles.journeyValue}>{journey.currentPhase.replace('_', ' ')}</Text>
          </View>
          <View style={styles.journeyStat}>
            <Text style={styles.journeyLabel}>Questions</Text>
            <Text style={styles.journeyValue}>{journey.questionsAsked}</Text>
          </View>
          <View style={styles.journeyStat}>
            <Text style={styles.journeyLabel}>Depth</Text>
            <Text style={styles.journeyValue}>{journey.deepestLayerReached.replace('_', ' ')}</Text>
          </View>
        </View>
        
        {journey.nextInferenceTargets && (
          <View style={styles.nextTargets}>
            <Text style={styles.nextTargetsTitle}>Next Inference Targets:</Text>
            {journey.nextInferenceTargets.map((target, index) => (
              <Text key={index} style={styles.nextTarget}>
                • {target.replace('_', ' ')}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Analyzing your soul essence...</Text>
        <Text style={styles.loadingSubtext}>Mapping your unique Human Hex Code</Text>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="person-outline" size={64} color={COLORS.textSecondary} />
        <Text style={styles.emptyTitle}>No Profile Data</Text>
        <Text style={styles.emptySubtext}>
          Start a conversation to generate your Human Hex Code
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderHexCodeVisualization()}
      {renderDimensionBars()}
      {renderInferenceJourney()}
      {renderCompatibleMatches()}
      
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={() => setLoading(true) && initializeProfile()}
      >
        <Ionicons name="refresh" size={20} color={COLORS.surface} />
        <Text style={styles.refreshText}>Refresh Analysis</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  
  loadingSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  
  // Hex Code Display
  hexCodeContainer: {
    alignItems: 'center',
    padding: 20,
    marginVertical: 20,
  },
  
  hexCodeDisplay: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  hexCodeGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  hexCodeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textShadowColor: '#fff',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  hexCodeInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  
  hexCodeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  
  hexCodeSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  
  // Dimensions
  dimensionsContainer: {
    margin: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
  },
  
  dimensionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  
  dimensionBar: {
    marginBottom: 16,
  },
  
  dimensionLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
  },
  
  dimensionTrack: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  
  dimensionFill: {
    height: '100%',
    borderRadius: 4,
  },
  
  dimensionValue: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  
  // Inference Journey
  journeyContainer: {
    margin: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
  },
  
  journeyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  
  journeyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  
  journeyStat: {
    alignItems: 'center',
  },
  
  journeyLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  
  journeyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  
  nextTargets: {
    marginTop: 12,
  },
  
  nextTargetsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  
  nextTarget: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  
  // Compatible Matches
  matchesContainer: {
    margin: 20,
  },
  
  matchesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  
  matchCard: {
    width: 120,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  matchColor: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  
  matchHex: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  
  matchCompatibility: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  
  matchType: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  
  // Refresh Button
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    margin: 20,
  },
  
  refreshText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default HumanHexCodeDisplay;