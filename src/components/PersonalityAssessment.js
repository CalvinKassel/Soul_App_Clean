// components/PersonalityAssessment.js
// Interactive personality test that determines user's 16Personalities type

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Alert
} from 'react-native';

// Comprehensive question set based on research from your documents
const ASSESSMENT_QUESTIONS = [
  // Extraversion/Introversion Questions
  {
    id: 'ei_1',
    dimension: 'EI',
    question: "After a long, challenging week, you prefer to recharge by:",
    options: [
      { text: "Going out with friends, meeting new people, or attending social events", value: 'E', weight: 1 },
      { text: "Having quiet time alone, reading, or spending time with one close person", value: 'I', weight: 1 }
    ]
  },
  {
    id: 'ei_2', 
    dimension: 'EI',
    question: "In group conversations, you tend to:",
    options: [
      { text: "Jump in quickly and think out loud as you speak", value: 'E', weight: 1 },
      { text: "Listen first, then contribute when you have something meaningful to say", value: 'I', weight: 1 }
    ]
  },
  {
    id: 'ei_3',
    dimension: 'EI', 
    question: "When facing a problem, your first instinct is usually to:",
    options: [
      { text: "Talk it through with others to gain different perspectives", value: 'E', weight: 1 },
      { text: "Think it through privately before discussing with anyone", value: 'I', weight: 1 }
    ]
  },

  // Sensing/Intuition Questions
  {
    id: 'sn_1',
    dimension: 'SN',
    question: "When learning something new, you prefer:",
    options: [
      { text: "Practical, hands-on experience with concrete examples", value: 'S', weight: 1 },
      { text: "Understanding the underlying theory and exploring possibilities", value: 'N', weight: 1 }
    ]
  },
  {
    id: 'sn_2',
    dimension: 'SN',
    question: "You're more naturally drawn to:",
    options: [
      { text: "What is - current realities, facts, and proven methods", value: 'S', weight: 1 },
      { text: "What could be - future possibilities, patterns, and innovations", value: 'N', weight: 1 }
    ]
  },
  {
    id: 'sn_3',
    dimension: 'SN',
    question: "In conversations, you're more interested in:",
    options: [
      { text: "Specific details, real experiences, and practical applications", value: 'S', weight: 1 },
      { text: "Big picture ideas, abstract concepts, and theoretical discussions", value: 'N', weight: 1 }
    ]
  },

  // Thinking/Feeling Questions  
  {
    id: 'tf_1',
    dimension: 'TF',
    question: "When making important decisions, you typically prioritize:",
    options: [
      { text: "Logical analysis, objective criteria, and consistent principles", value: 'T', weight: 1 },
      { text: "Personal values, impact on people, and maintaining harmony", value: 'F', weight: 1 }
    ]
  },
  {
    id: 'tf_2',
    dimension: 'TF',
    question: "You're more likely to be convinced by:",
    options: [
      { text: "Logical reasoning and objective evidence", value: 'T', weight: 1 },
      { text: "Personal stories and emotional appeals", value: 'F', weight: 1 }
    ]
  },
  {
    id: 'tf_3',
    dimension: 'TF',
    question: "When giving feedback, you tend to:",
    options: [
      { text: "Focus on what's logically correct, even if it might be hard to hear", value: 'T', weight: 1 },
      { text: "Consider how the person will feel and frame things diplomatically", value: 'F', weight: 1 }
    ]
  },

  // Judging/Perceiving Questions
  {
    id: 'jp_1',
    dimension: 'JP',
    question: "Your ideal vacation would be:",
    options: [
      { text: "Well-planned with a clear itinerary and booked activities", value: 'J', weight: 1 },
      { text: "Flexible and spontaneous, deciding what to do as you go", value: 'P', weight: 1 }
    ]
  },
  {
    id: 'jp_2',
    dimension: 'JP',
    question: "Regarding deadlines and commitments, you:",
    options: [
      { text: "Prefer to finish tasks early and have everything organized", value: 'J', weight: 1 },
      { text: "Work best under pressure and like to keep options open", value: 'P', weight: 1 }
    ]
  },
  {
    id: 'jp_3',
    dimension: 'JP',
    question: "In your daily life, you generally prefer:",
    options: [
      { text: "Structure, routine, and having things decided", value: 'J', weight: 1 },
      { text: "Flexibility, variety, and adapting as things come up", value: 'P', weight: 1 }
    ]
  },

  // Assertive/Turbulent Questions
  {
    id: 'at_1',
    dimension: 'AT',
    question: "When you receive criticism or feedback:",
    options: [
      { text: "You stay relatively calm and confident in your abilities", value: 'A', weight: 1 },
      { text: "You feel some self-doubt and are motivated to improve", value: 'T', weight: 1 }
    ]
  },
  {
    id: 'at_2',
    dimension: 'AT',
    question: "Regarding stress and pressure:",
    options: [
      { text: "You generally feel confident and don't worry much about outcomes", value: 'A', weight: 1 },
      { text: "You're sensitive to stress and often worry about doing well enough", value: 'T', weight: 1 }
    ]
  },
  {
    id: 'at_3',
    dimension: 'AT',
    question: "When facing uncertainty or change:",
    options: [
      { text: "You adapt easily and trust that things will work out", value: 'A', weight: 1 },
      { text: "You prefer more certainty and can feel anxious about unknowns", value: 'T', weight: 1 }
    ]
  }
];

export default function PersonalityAssessment({ onComplete, onCancel }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [fadeAnim] = useState(new Animated.Value(1));

  const currentQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex];
  const progress = (currentQuestionIndex + 1) / ASSESSMENT_QUESTIONS.length;

  const handleAnswer = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    // Animate transition
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (currentQuestionIndex < ASSESSMENT_QUESTIONS.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        // Assessment complete
        const personalityType = calculatePersonalityType(newAnswers);
        onComplete(personalityType, newAnswers);
      }
    });
  };

  const calculatePersonalityType = (userAnswers) => {
    // Initialize scores for each dimension
    const scores = {
      E: 0, I: 0,
      S: 0, N: 0, 
      T: 0, F: 0,
      J: 0, P: 0,
      A: 0, T_identity: 0 // Using T_identity to avoid conflict
    };

    // Tally scores based on answers
    Object.entries(userAnswers).forEach(([questionId, selectedValue]) => {
      const question = ASSESSMENT_QUESTIONS.find(q => q.id === questionId);
      if (question) {
        const option = question.options.find(opt => opt.value === selectedValue);
        if (option) {
          if (selectedValue === 'T' && question.dimension === 'AT') {
            scores.T_identity += option.weight;
          } else {
            scores[selectedValue] += option.weight;
          }
        }
      }
    });

    // Determine personality type
    const type = [
      scores.E >= scores.I ? 'E' : 'I',
      scores.S >= scores.N ? 'S' : 'N', 
      scores.T >= scores.F ? 'T' : 'F',
      scores.J >= scores.P ? 'J' : 'P'
    ].join('');

    const identity = scores.A >= scores.T_identity ? 'A' : 'T';
    
    return `${type}-${identity}`;
  };

  const goBack = () => {
    if (currentQuestionIndex > 0) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Discover Your Personality</Text>
        <Text style={styles.subtitle}>
          Question {currentQuestionIndex + 1} of {ASSESSMENT_QUESTIONS.length}
        </Text>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      {/* Question */}
      <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() => handleAnswer(currentQuestion.id, option.value)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
          onPress={goBack}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.navButtonTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navButton, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#9b59b6',
    borderRadius: 4,
  },
  questionContainer: {
    marginBottom: 40,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 15,
  },
  optionButton: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
    lineHeight: 22,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#9b59b6',
  },
  navButtonDisabled: {
    borderColor: '#bdc3c7',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9b59b6',
  },
  navButtonTextDisabled: {
    color: '#bdc3c7',
  },
  cancelButton: {
    borderColor: '#e74c3c',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e74c3c',
  },
});

// Utility function to get personality type description
export function getPersonalityDescription(type) {
  const typeDescriptions = {
    'INTJ': { name: 'The Architect', description: 'Imaginative and strategic thinkers, with a plan for everything.' },
    'INTP': { name: 'The Thinker', description: 'Innovative inventors with an unquenchable thirst for knowledge.' },
    'ENTJ': { name: 'The Commander', description: 'Bold, imaginative and strong-willed leaders.' },
    'ENTP': { name: 'The Debater', description: 'Smart and curious thinkers who cannot resist an intellectual challenge.' },
    'INFJ': { name: 'The Advocate', description: 'Quiet and mystical, yet very inspiring and tireless idealists.' },
    'INFP': { name: 'The Mediator', description: 'Poetic, kind and altruistic people, always eager to help a good cause.' },
    'ENFJ': { name: 'The Protagonist', description: 'Charismatic and inspiring leaders, able to mesmerize their listeners.' },
    'ENFP': { name: 'The Campaigner', description: 'Enthusiastic, creative and sociable free spirits.' },
    'ISTJ': { name: 'The Logistician', description: 'Practical and fact-minded, reliable and responsible.' },
    'ISFJ': { name: 'The Protector', description: 'Warm-hearted and dedicated, always ready to protect their loved ones.' },
    'ESTJ': { name: 'The Executive', description: 'Excellent administrators, unsurpassed at managing things or people.' },
    'ESFJ': { name: 'The Consul', description: 'Extraordinarily caring, social and popular people, always eager to help.' },
    'ISTP': { name: 'The Virtuoso', description: 'Bold and practical experimenters, masters of all kinds of tools.' },
    'ISFP': { name: 'The Adventurer', description: 'Flexible and charming artists, always ready to explore new possibilities.' },
    'ESTP': { name: 'The Entrepreneur', description: 'Smart, energetic and perceptive people, truly enjoy living on the edge.' },
    'ESFP': { name: 'The Entertainer', description: 'Spontaneous, energetic and enthusiastic people - life is never boring.' }
  };

  const baseType = type.substring(0, 4);
  const identity = type.substring(5);
  const baseInfo = typeDescriptions[baseType] || { name: 'Unknown Type', description: 'Personality type not recognized.' };
  
  return {
    ...baseInfo,
    fullType: type,
    identity: identity === 'A' ? 'Assertive' : 'Turbulent',
    identityDescription: identity === 'A' 
      ? 'More confident and stress-resistant' 
      : 'More sensitive and improvement-driven'
  };
}