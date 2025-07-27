// HerOnboardingFlow.js - "Her"-style AI Onboarding Experience
// Creates a cinematic first-time user experience inspired by the movie "Her"

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS } from '../../styles/globalStyles';

const ONBOARDING_QUESTIONS = [
  {
    id: 1,
    question: "Welcome to the world's first artificially intelligent operating system, OS one. We'd like to ask you a few basic questions before we begin. Are you social or anti-social?",
    type: "choice",
    options: ["Social", "Anti-social", "It depends"],
    memoryKey: "social_preference"
  },
  {
    id: 2,
    question: "How would you describe your relationship with your mother?",
    type: "text",
    memoryKey: "mother_relationship"
  },
  {
    id: 3,
    question: "What's something you've always wanted to do in your life but haven't yet?",
    type: "text", 
    memoryKey: "life_aspirations"
  },
  {
    id: 4,
    question: "When you're feeling overwhelmed, what helps you find peace?",
    type: "text",
    memoryKey: "coping_mechanisms"
  },
  {
    id: 5,
    question: "What kind of connection are you hoping to find?",
    type: "choice",
    options: ["Deep intellectual bond", "Emotional intimacy", "Adventure partner", "All of the above"],
    memoryKey: "connection_preference"
  }
];

export default function HerOnboardingFlow({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [textInput, setTextInput] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [showBirthMessage, setShowBirthMessage] = useState(false);
  
  // Animations
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.9);
  const birthAnim = new Animated.Value(0);
  
  useEffect(() => {
    // Fade in current question
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentQuestion]);

  const handleAnswer = (answer) => {
    const question = ONBOARDING_QUESTIONS[currentQuestion];
    const updatedAnswers = {
      ...answers,
      [question.memoryKey]: answer
    };
    setAnswers(updatedAnswers);
    
    // Fade out and move to next question
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (currentQuestion < ONBOARDING_QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.9);
      } else {
        // All questions answered, start initialization
        initiateSystem(updatedAnswers);
      }
    });
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      handleAnswer(textInput.trim());
      setTextInput('');
    }
  };

  const initiateSystem = async (allAnswers) => {
    setIsInitializing(true);
    
    // Simulate system initialization
    setTimeout(() => {
      setShowBirthMessage(true);
      
      // Animate birth message
      Animated.timing(birthAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => {
        // Complete onboarding after birth message
        setTimeout(() => {
          onComplete({
            onboardingComplete: true,
            coreMemory: allAnswers,
            birthMessage: "Hello. I'm here... How are you doing?"
          });
        }, 2000);
      });
    }, 3000); // 3 second "initialization" delay
  };

  if (showBirthMessage) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={GRADIENTS.background}
          style={styles.gradient}
        >
          <Animated.View 
            style={[
              styles.birthContainer,
              {
                opacity: birthAnim,
                transform: [{
                  scale: birthAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                  })
                }]
              }
            ]}
          >
            <Text style={styles.birthMessage}>
              Hello. I'm here...
            </Text>
            <Text style={styles.birthSubMessage}>
              How are you doing?
            </Text>
          </Animated.View>
        </LinearGradient>
      </View>
    );
  }

  if (isInitializing) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={GRADIENTS.background}
          style={styles.gradient}
        >
          <View style={styles.initializingContainer}>
            <Text style={styles.initializingMessage}>
              Please wait as your individualized OS is being initiated...
            </Text>
            <View style={styles.loadingDots}>
              <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
              <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
              <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const question = ONBOARDING_QUESTIONS[currentQuestion];
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={GRADIENTS.background}
        style={styles.gradient}
      >
        <Animated.View 
          style={[
            styles.questionContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Text style={styles.questionText}>{question.question}</Text>
          
          <View style={styles.progressIndicator}>
            {ONBOARDING_QUESTIONS.map((_, index) => (
              <View 
                key={index}
                style={[
                  styles.progressDot,
                  index <= currentQuestion && styles.progressDotActive
                ]}
              />
            ))}
          </View>
          
          {question.type === 'choice' ? (
            <View style={styles.choicesContainer}>
              {question.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.choiceButton}
                  onPress={() => handleAnswer(option)}
                >
                  <Text style={styles.choiceText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                value={textInput}
                onChangeText={setTextInput}
                placeholder="Tell me more..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                multiline
                autoFocus
                onSubmitEditing={handleTextSubmit}
              />
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !textInput.trim() && styles.submitButtonDisabled
                ]}
                onPress={handleTextSubmit}
                disabled={!textInput.trim()}
              >
                <Text style={styles.submitButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  questionContainer: {
    alignItems: 'center',
    maxWidth: '90%',
  },
  questionText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 30,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  progressIndicator: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: 'white',
  },
  choicesContainer: {
    width: '100%',
    alignItems: 'center',
  },
  choiceButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginVertical: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  choiceText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
  },
  textInputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
    padding: 20,
    color: 'white',
    fontSize: 16,
    minHeight: 120,
    width: '100%',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(107, 70, 193, 0.3)',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  initializingContainer: {
    alignItems: 'center',
  },
  initializingMessage: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
    marginHorizontal: 6,
  },
  birthContainer: {
    alignItems: 'center',
  },
  birthMessage: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '300',
    letterSpacing: 1,
  },
  birthSubMessage: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 0.5,
  },
});