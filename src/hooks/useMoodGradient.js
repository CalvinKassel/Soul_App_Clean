// useMoodGradient React Hook
// Manages mood-based gradient transitions with smooth animations

import { useState, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { getMoodGradient, getMoodTransitionWeight, MOOD_CONFIDENCE_THRESHOLDS } from '../services/MoodToGradientMap';

export const useMoodGradient = (initialMood = 'default') => {
  const [currentMood, setCurrentMood] = useState(initialMood);
  const [currentGradient, setCurrentGradient] = useState(getMoodGradient(initialMood));
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [moodHistory, setMoodHistory] = useState([]);
  const [moodConfidence, setMoodConfidence] = useState(1.0);
  
  // Animation values for smooth transitions
  const transitionOpacity = useRef(new Animated.Value(1)).current;
  const transitionScale = useRef(new Animated.Value(1)).current;
  
  // Mood stability tracking
  const moodStabilityRef = useRef({
    lastMood: initialMood,
    consistentCount: 0,
    lastChangeTime: Date.now()
  });

  // Update mood with confidence scoring
  const updateMood = (newMood, confidence = 1.0) => {
    if (!newMood || newMood === currentMood) return;
    
    const normalizedMood = newMood.toLowerCase();
    const stability = moodStabilityRef.current;
    const now = Date.now();
    
    // Update mood history
    setMoodHistory(prev => [
      ...prev.slice(-4), // Keep last 5 moods
      { mood: normalizedMood, confidence, timestamp: now }
    ]);
    
    // Check mood stability
    if (stability.lastMood === normalizedMood) {
      stability.consistentCount += 1;
    } else {
      stability.consistentCount = 1;
      stability.lastMood = normalizedMood;
    }
    
    stability.lastChangeTime = now;
    
    // Apply mood based on confidence and stability
    const shouldApplyMood = shouldApplyMoodChange(normalizedMood, confidence, stability);
    
    if (shouldApplyMood) {
      applyMoodChange(normalizedMood, confidence);
    }
  };

  // Determine if mood change should be applied
  const shouldApplyMoodChange = (mood, confidence, stability) => {
    // High confidence - apply immediately
    if (confidence >= MOOD_CONFIDENCE_THRESHOLDS.HIGH) {
      return true;
    }
    
    // Medium confidence - apply if consistent
    if (confidence >= MOOD_CONFIDENCE_THRESHOLDS.MEDIUM) {
      return stability.consistentCount >= 2;
    }
    
    // Low confidence - apply only if very consistent
    if (confidence >= MOOD_CONFIDENCE_THRESHOLDS.LOW) {
      return stability.consistentCount >= 3;
    }
    
    return false;
  };

  // Apply mood change with animation
  const applyMoodChange = (newMood, confidence) => {
    const newGradient = getMoodGradient(newMood);
    const transitionWeight = getMoodTransitionWeight(currentMood, newMood);
    
    setMoodConfidence(confidence);
    setIsTransitioning(true);
    
    // Animate gradient transition
    const animationDuration = 1000 * transitionWeight;
    
    Animated.sequence([
      // Subtle scale effect
      Animated.timing(transitionScale, {
        toValue: 1.02,
        duration: animationDuration / 4,
        useNativeDriver: true,
      }),
      
      // Fade transition
      Animated.timing(transitionOpacity, {
        toValue: 0.8,
        duration: animationDuration / 4,
        useNativeDriver: true,
      }),
      
      // Apply new gradient (happens during opacity transition)
      Animated.timing(transitionOpacity, {
        toValue: 1.0,
        duration: animationDuration / 2,
        useNativeDriver: true,
      }),
      
      // Return to normal scale
      Animated.timing(transitionScale, {
        toValue: 1.0,
        duration: animationDuration / 4,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsTransitioning(false);
    });
    
    // Update mood and gradient
    setCurrentMood(newMood);
    setCurrentGradient(newGradient);
  };

  // Get gradient with animation styles
  const getAnimatedGradientStyle = () => {
    return {
      opacity: transitionOpacity,
      transform: [{ scale: transitionScale }],
    };
  };

  // Get mood analytics
  const getMoodAnalytics = () => {
    const recentMoods = moodHistory.slice(-10);
    const moodCounts = recentMoods.reduce((acc, { mood }) => {
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});
    
    const dominantMood = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || currentMood;
    
    const averageConfidence = recentMoods.reduce((sum, { confidence }) => sum + confidence, 0) / recentMoods.length || 0;
    
    return {
      currentMood,
      dominantMood,
      moodConfidence,
      averageConfidence,
      recentMoods: recentMoods.slice(-5),
      moodCounts,
      isTransitioning
    };
  };

  // Reset mood to default
  const resetMood = () => {
    updateMood('default', 1.0);
    setMoodHistory([]);
    moodStabilityRef.current = {
      lastMood: 'default',
      consistentCount: 0,
      lastChangeTime: Date.now()
    };
  };

  // Force mood change (bypass confidence checks)
  const forceMoodChange = (newMood) => {
    applyMoodChange(newMood, 1.0);
  };

  // Get mood suggestions based on history
  const getMoodSuggestions = () => {
    const analytics = getMoodAnalytics();
    const suggestions = [];
    
    // Suggest balancing moods
    if (analytics.dominantMood === 'anxious') {
      suggestions.push('calm', 'hopeful');
    } else if (analytics.dominantMood === 'sad') {
      suggestions.push('content', 'grateful');
    } else if (analytics.dominantMood === 'excited') {
      suggestions.push('calm', 'thoughtful');
    }
    
    return suggestions;
  };

  return {
    // Current state
    currentMood,
    currentGradient,
    moodConfidence,
    isTransitioning,
    
    // Actions
    updateMood,
    resetMood,
    forceMoodChange,
    
    // Animation
    getAnimatedGradientStyle,
    
    // Analytics
    getMoodAnalytics,
    getMoodSuggestions,
    
    // History
    moodHistory: moodHistory.slice(-5), // Only return recent history
  };
};

// Hook for specific screen contexts
export const useScreenMoodGradient = (screenType = 'chat') => {
  const moodGradient = useMoodGradient();
  
  // Screen-specific mood handling
  const handleScreenMoodUpdate = (message, senderType = 'user') => {
    // Only update mood for user messages in chat screens
    if (screenType === 'chat' && senderType === 'user') {
      // This would integrate with your mood analysis service
      // For now, we'll use a simple keyword-based approach
      const detectedMood = detectMoodFromMessage(message);
      if (detectedMood) {
        moodGradient.updateMood(detectedMood.mood, detectedMood.confidence);
      }
    }
  };
  
  return {
    ...moodGradient,
    handleScreenMoodUpdate
  };
};

// Simple mood detection from message (placeholder for your AI service)
const detectMoodFromMessage = (message) => {
  if (!message) return null;
  
  const text = message.toLowerCase();
  
  // Simple keyword matching (replace with your AI service)
  const moodKeywords = {
    joyful: ['happy', 'joy', 'excited', 'amazing', 'wonderful', 'fantastic', 'great'],
    sad: ['sad', 'down', 'depressed', 'upset', 'disappointed', 'hurt'],
    anxious: ['worried', 'nervous', 'anxious', 'stressed', 'concerned', 'afraid'],
    loving: ['love', 'adore', 'cherish', 'care', 'affection', 'heart'],
    calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil'],
    frustrated: ['frustrated', 'angry', 'annoyed', 'irritated', 'mad'],
    hopeful: ['hope', 'optimistic', 'looking forward', 'excited about', 'can\'t wait'],
    grateful: ['thank', 'grateful', 'appreciate', 'blessed', 'lucky'],
    flirty: ['cute', 'beautiful', 'handsome', 'sexy', 'attractive', 'charming'],
    playful: ['fun', 'funny', 'silly', 'playful', 'joke', 'laugh']
  };
  
  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return {
          mood,
          confidence: 0.7 // Medium confidence for keyword matching
        };
      }
    }
  }
  
  return null;
};

export default useMoodGradient;