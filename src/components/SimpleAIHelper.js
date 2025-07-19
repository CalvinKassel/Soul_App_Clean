// Simple AI Helper - Overlay Text Input for Chat
// Replaces the chat input when AI helper is activated

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SparklesIcon } from './icons/SVGIcons';
import { COLORS } from '../styles/globalStyles';
import ChatGPTService from '../services/ChatGPTService';

const SimpleAIHelper = ({ 
  visible, 
  onClose, 
  onSendMessage, 
  matchName = '',
  lastReceivedMessage = '',
  conversationHistory = []
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Animation effects
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Clear state when modal closes
  useEffect(() => {
    if (!visible) {
      setInputText('');
      setResponse('');
    }
  }, [visible]);

  // Handle AI request
  const handleAIRequest = async () => {
    if (!inputText.trim()) {
      Alert.alert('Please enter a question', 'Ask me anything about your conversation or how to respond!');
      return;
    }

    setIsLoading(true);
    try {
      let prompt = `You are SoulAI, a helpful dating assistant. The user is chatting with ${matchName}.`;
      
      if (lastReceivedMessage) {
        prompt += ` The last message they received was: "${lastReceivedMessage}".`;
      }
      
      prompt += ` User asks: "${inputText.trim()}". Provide a helpful, concise response.`;

      const aiResponse = await ChatGPTService.sendMessage(prompt, {
        onStart: () => {},
        onToken: () => {},
        onComplete: (fullResponse) => {},
        onError: (error) => console.error('SoulAI Error:', error)
      });

      setResponse(aiResponse);
    } catch (error) {
      console.error('Error getting AI response:', error);
      Alert.alert('Error', 'Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle using the response as a message
  const handleUseResponse = () => {
    if (response.trim()) {
      onSendMessage(response.trim());
      onClose();
    }
  };

  // Handle sending the user's input as a message
  const handleSendInput = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0],
            }),
          }],
          opacity: slideAnim,
        },
      ]}
    >
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <LinearGradient
          colors={['#f8f9fa', '#e9ecef']}
          style={styles.inputPill}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <SparklesIcon size={20} color={COLORS.primary} />
              <Text style={styles.headerText}>Ask SoulAI</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Input Area */}
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={`Ask me anything about your chat with ${matchName}...`}
            placeholderTextColor="#6c757d"
            multiline
            textAlignVertical="top"
            autoFocus
          />

          {/* Response Area */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>SoulAI is thinking...</Text>
            </View>
          )}

          {response && !isLoading && (
            <View style={styles.responseContainer}>
              <Text style={styles.responseText}>{response}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {response && !isLoading && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.useButton]} 
                onPress={handleUseResponse}
              >
                <Ionicons name="checkmark" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Use This</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.sendInputButton]} 
              onPress={inputText.trim() ? handleSendInput : handleAIRequest}
              disabled={isLoading}
            >
              <Ionicons 
                name={inputText.trim() && !response ? "send" : "sparkles"} 
                size={16} 
                color="#fff" 
              />
              <Text style={styles.actionButtonText}>
                {inputText.trim() && !response ? "Send" : "Ask AI"}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputPill: {
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#e8bef3',
    padding: 16,
    shadowColor: '#cbbaf1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  textInput: {
    minHeight: 80,
    maxHeight: 120,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8bef3',
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 8,
  },
  responseContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d1ecf1',
  },
  responseText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  useButton: {
    backgroundColor: '#28a745',
  },
  sendInputButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
});

export default SimpleAIHelper;