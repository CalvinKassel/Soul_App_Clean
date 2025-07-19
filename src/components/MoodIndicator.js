// Mood Indicator Component
// Visual indicator showing current mood state with ring animation

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/globalStyles';

const MoodIndicator = ({ 
  mood = 'neutral', 
  gradient, 
  confidence = 0.5, 
  onPress,
  size = 'medium', // 'small', 'medium', 'large'
  showLabel = true,
  showConfidence = false,
  animated = true
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  
  // Size configurations
  const sizeConfig = {
    small: { size: 40, fontSize: 12, iconSize: 16 },
    medium: { size: 60, fontSize: 14, iconSize: 20 },
    large: { size: 80, fontSize: 16, iconSize: 24 }
  };
  
  const config = sizeConfig[size];
  
  // Animate mood changes
  useEffect(() => {
    if (animated) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [mood, animated]);
  
  // Pulse animation for low confidence
  useEffect(() => {
    if (confidence < 0.6) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      
      return () => pulseAnimation.stop();
    }
  }, [confidence]);
  
  // Get mood emoji
  const getMoodEmoji = (moodType) => {
    const emojiMap = {
      joyful: '😊',
      happy: '😄',
      excited: '🤩',
      loving: '😍',
      flirty: '😘',
      hopeful: '🌟',
      playful: '😋',
      grateful: '🙏',
      confident: '😎',
      calm: '😌',
      neutral: '😐',
      content: '😊',
      thoughtful: '🤔',
      curious: '🧐',
      anxious: '😰',
      sad: '😢',
      frustrated: '😤',
      lonely: '😔',
      nervous: '😬',
      overwhelmed: '😵',
      romantic: '💕',
      vulnerable: '🥺',
      passionate: '🔥',
      default: '😐'
    };
    
    return emojiMap[moodType] || emojiMap.default;
  };
  
  // Get mood icon
  const getMoodIcon = (moodType) => {
    const iconMap = {
      joyful: 'happy',
      happy: 'happy',
      excited: 'flash',
      loving: 'heart',
      flirty: 'heart-outline',
      hopeful: 'star',
      playful: 'game-controller',
      grateful: 'thumbs-up',
      confident: 'trending-up',
      calm: 'leaf',
      neutral: 'remove',
      content: 'checkmark-circle',
      thoughtful: 'bulb',
      curious: 'search',
      anxious: 'alert-circle',
      sad: 'sad',
      frustrated: 'warning',
      lonely: 'person',
      nervous: 'pulse',
      overwhelmed: 'cloud',
      romantic: 'rose',
      vulnerable: 'shield',
      passionate: 'flame',
      default: 'ellipse'
    };
    
    return iconMap[moodType] || iconMap.default;
  };
  
  // Get confidence color
  const getConfidenceColor = (conf) => {
    if (conf >= 0.8) return '#10B981'; // Green
    if (conf >= 0.6) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };
  
  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });
  
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.container, { opacity: confidence }]}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.indicatorContainer,
          {
            width: config.size,
            height: config.size,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        {/* Pulse ring for low confidence */}
        {confidence < 0.6 && (
          <Animated.View
            style={[
              styles.pulseRing,
              {
                width: config.size + 10,
                height: config.size + 10,
                opacity: pulseOpacity,
                borderRadius: (config.size + 10) / 2,
              }
            ]}
          />
        )}
        
        {/* Main mood ring */}
        <LinearGradient
          colors={gradient?.colors || [COLORS.primary, COLORS.secondary]}
          start={gradient?.start || { x: 0, y: 0 }}
          end={gradient?.end || { x: 1, y: 1 }}
          locations={gradient?.locations}
          style={[
            styles.moodRing,
            {
              width: config.size,
              height: config.size,
              borderRadius: config.size / 2,
            }
          ]}
        >
          {/* Inner content */}
          <View style={styles.innerContent}>
            {/* Mood emoji/icon */}
            <Text style={[styles.moodEmoji, { fontSize: config.iconSize }]}>
              {getMoodEmoji(mood)}
            </Text>
            
            {/* Confidence indicator */}
            {showConfidence && (
              <View 
                style={[
                  styles.confidenceIndicator,
                  { backgroundColor: getConfidenceColor(confidence) }
                ]}
              />
            )}
          </View>
        </LinearGradient>
      </Animated.View>
      
      {/* Mood label */}
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.moodLabel, { fontSize: config.fontSize }]}>
            {mood.charAt(0).toUpperCase() + mood.slice(1)}
          </Text>
          {showConfidence && (
            <Text style={[styles.confidenceLabel, { fontSize: config.fontSize - 2 }]}>
              {Math.round(confidence * 100)}%
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

// Compact mood indicator for header/toolbar
export const CompactMoodIndicator = ({ mood, gradient, confidence, onPress }) => {
  return (
    <MoodIndicator
      mood={mood}
      gradient={gradient}
      confidence={confidence}
      onPress={onPress}
      size="small"
      showLabel={false}
      showConfidence={false}
      animated={true}
    />
  );
};

// Detailed mood indicator with analytics
export const DetailedMoodIndicator = ({ mood, gradient, confidence, analytics, onPress }) => {
  return (
    <View style={styles.detailedContainer}>
      <MoodIndicator
        mood={mood}
        gradient={gradient}
        confidence={confidence}
        onPress={onPress}
        size="large"
        showLabel={true}
        showConfidence={true}
        animated={true}
      />
      
      {analytics && (
        <View style={styles.analyticsContainer}>
          <Text style={styles.analyticsTitle}>Mood Trends</Text>
          <Text style={styles.analyticsText}>
            Recent: {analytics.recentMoods?.slice(-3).map(m => m.mood).join(', ')}
          </Text>
          <Text style={styles.analyticsText}>
            Dominant: {analytics.dominantMood}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  indicatorContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  pulseRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  
  moodRing: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  
  innerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  
  moodEmoji: {
    textAlign: 'center',
  },
  
  confidenceIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  
  labelContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  
  moodLabel: {
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  
  confidenceLabel: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  
  // Detailed indicator styles
  detailedContainer: {
    alignItems: 'center',
    padding: 16,
  },
  
  analyticsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    minWidth: 200,
  },
  
  analyticsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  
  analyticsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default MoodIndicator;