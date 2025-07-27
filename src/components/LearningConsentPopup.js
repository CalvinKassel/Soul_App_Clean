/**
 * LearningConsentPopup.js
 * 
 * Modal popup for user consent to SoulAI's comprehensive learning system
 * Default approach: SoulAI learns everything unless user opts out
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { learningConsentManager } from '../services/personality/LearningConsentManager';

const { width, height } = Dimensions.get('window');

export function LearningConsentPopup({ userId, visible, onConsentComplete }) {
  const [popupData, setPopupData] = useState(null);
  const [showCustomOptions, setShowCustomOptions] = useState(false);
  const [customPreferences, setCustomPreferences] = useState({});
  const [slideAnim] = useState(new Animated.Value(height));

  useEffect(() => {
    if (visible && userId) {
      const popup = learningConsentManager.generateConsentPopup(userId);
      setPopupData(popup);
      
      if (popup) {
        // Animate popup in
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8
        }).start();
      }
    }
  }, [visible, userId]);

  const handleResponse = (action) => {
    let response = {};

    switch (action) {
      case 'acceptAllLearning':
        response = { acceptAllLearning: true };
        break;
      case 'customizeLearning':
        setShowCustomOptions(true);
        return; // Don't close popup yet
      case 'optOutCompletely':
        response = { optOutCompletely: true };
        break;
      case 'remindLater':
        response = { remindLater: true };
        break;
    }

    // Process the response
    const updatedConfig = learningConsentManager.processConsentResponse(userId, response);
    
    // Animate out and close
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      onConsentComplete(updatedConfig);
    });
  };

  const handleCustomSubmit = () => {
    const response = {
      customizeLearning: true,
      learningPreferences: customPreferences
    };

    const updatedConfig = learningConsentManager.processConsentResponse(userId, response);
    
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      onConsentComplete(updatedConfig);
    });
  };

  const toggleCustomPreference = (key, value) => {
    setCustomPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!visible || !popupData) return null;

  const renderMainPopup = () => (
    <ScrollView style={styles.popupContent} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{popupData.title}</Text>
        <Text style={styles.message}>{popupData.message}</Text>
      </View>

      {/* Benefits */}
      <View style={styles.benefitsSection}>
        <Text style={styles.benefitsTitle}>How SoulAI Learning Helps You:</Text>
        {popupData.benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitItem}>
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>

      {/* Options */}
      <View style={styles.optionsSection}>
        {popupData.options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              option.default && styles.recommendedOption
            ]}
            onPress={() => handleResponse(option.action)}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <View style={styles.optionTextContainer}>
                <Text style={[
                  styles.optionTitle,
                  option.default && styles.recommendedText
                ]}>
                  {option.title}
                </Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              {option.default && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedBadgeText}>RECOMMENDED</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer */}
      <Text style={styles.footerText}>{popupData.footerText}</Text>
    </ScrollView>
  );

  const renderCustomOptions = () => {
    const learningCategories = [
      {
        key: 'personalityLearning',
        title: 'Personality Learning',
        description: 'Learn your personality traits from behavior',
        icon: '🧠'
      },
      {
        key: 'communicationStyleLearning',
        title: 'Communication Style',
        description: 'Learn how you prefer to communicate',
        icon: '💬'
      },
      {
        key: 'relationshipPreferenceLearning',
        title: 'Relationship Preferences',
        description: 'Learn your dating and relationship preferences',
        icon: '💕'
      },
      {
        key: 'emotionalPatternLearning',
        title: 'Emotional Patterns',
        description: 'Learn your emotional responses and triggers',
        icon: '❤️'
      },
      {
        key: 'conversationPatternLearning',
        title: 'Conversation Patterns',
        description: 'Learn your favorite topics and responses',
        icon: '🗣️'
      },
      {
        key: 'matchInteractionLearning',
        title: 'Match Interactions',
        description: 'Learn what makes you engage with matches',
        icon: '✨'
      }
    ];

    return (
      <ScrollView style={styles.popupContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowCustomOptions(false)}
          >
            <Ionicons name="arrow-back" size={24} color="#6B46C1" />
          </TouchableOpacity>
          <Text style={styles.title}>Customize Learning</Text>
          <Text style={styles.message}>
            Choose what SoulAI can learn about you. More learning = better personalization.
          </Text>
        </View>

        <View style={styles.customOptionsSection}>
          {learningCategories.map((category) => (
            <View key={category.key} style={styles.customOption}>
              <View style={styles.customOptionContent}>
                <Text style={styles.customOptionIcon}>{category.icon}</Text>
                <View style={styles.customOptionText}>
                  <Text style={styles.customOptionTitle}>{category.title}</Text>
                  <Text style={styles.customOptionDescription}>{category.description}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggle,
                    customPreferences[category.key] !== false && styles.toggleActive
                  ]}
                  onPress={() => toggleCustomPreference(
                    category.key, 
                    customPreferences[category.key] === false
                  )}
                >
                  <View style={[
                    styles.toggleIndicator,
                    customPreferences[category.key] !== false && styles.toggleIndicatorActive
                  ]} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleCustomSubmit}
        >
          <LinearGradient
            colors={['#6B46C1', '#EC4899']}
            style={styles.submitGradient}
          >
            <Text style={styles.submitText}>Save Preferences</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        
        <Animated.View
          style={[
            styles.popup,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['#FFFFFF', '#F8FAFC']}
            style={styles.popupGradient}
          >
            {showCustomOptions ? renderCustomOptions() : renderMainPopup()}
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  },
  popup: {
    maxHeight: height * 0.85,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden'
  },
  popupGradient: {
    flex: 1
  },
  popupContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40
  },
  header: {
    marginBottom: 24
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center'
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24
  },
  benefitsSection: {
    marginBottom: 32
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16
  },
  benefitItem: {
    marginBottom: 12
  },
  benefitText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 22
  },
  optionsSection: {
    marginBottom: 24
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  recommendedOption: {
    borderColor: '#6B46C1',
    backgroundColor: '#F3F4F6'
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 16
  },
  optionTextContainer: {
    flex: 1
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4
  },
  recommendedText: {
    color: '#6B46C1'
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#6B7280'
  },
  recommendedBadge: {
    backgroundColor: '#6B46C1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  recommendedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold'
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18
  },
  customOptionsSection: {
    marginBottom: 32
  },
  customOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  customOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16
  },
  customOptionIcon: {
    fontSize: 20,
    marginRight: 12
  },
  customOptionText: {
    flex: 1
  },
  customOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2
  },
  customOptionDescription: {
    fontSize: 14,
    color: '#6B7280'
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    paddingHorizontal: 2
  },
  toggleActive: {
    backgroundColor: '#6B46C1'
  },
  toggleIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5
  },
  toggleIndicatorActive: {
    alignSelf: 'flex-end'
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden'
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center'
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default LearningConsentPopup;