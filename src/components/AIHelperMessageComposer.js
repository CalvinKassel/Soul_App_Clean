// AI Helper Message Composer Modal
// Bottom sheet modal for composing and refining messages with SoulAI assistance

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { PencilIcon, RefreshIcon, SparklesIcon, SendIcon, CloseIcon, CopyIcon } from './icons/SVGIcons';
import { COLORS } from '../styles/globalStyles';
import ChatGPTService from '../services/ChatGPTService';

const AIHelperMessageComposer = ({ 
  visible, 
  onClose, 
  onSendMessage, 
  lastReceivedMessage,
  conversationHistory = [] 
}) => {
  const [activeTab, setActiveTab] = useState('compose'); // 'compose' or 'suggest'
  const [inputText, setInputText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refinementComment, setRefinementComment] = useState('');
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

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
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Clear state when modal closes
  useEffect(() => {
    if (!visible) {
      setInputText('');
      setSuggestions([]);
      setRefinementComment('');
      setActiveTab('compose');
    }
  }, [visible]);

  // Handle compose and refine functionality
  const handleComposeRefine = async () => {
    if (!inputText.trim()) {
      Alert.alert('Please enter some text', 'Write your main idea or ask me to help you come up with ideas.');
      return;
    }

    setIsLoading(true);
    try {
      // Get 3 refined versions from SoulAI
      const responses = await generateMessageVariations(inputText, refinementComment);
      setSuggestions(responses);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      Alert.alert('Error', 'Failed to generate suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggest functionality
  const handleSuggest = async () => {
    if (!lastReceivedMessage) {
      Alert.alert('No message to respond to', 'There\'s no recent message from your match to suggest responses for.');
      return;
    }

    setIsLoading(true);
    try {
      const responses = await generateResponseSuggestions(lastReceivedMessage, refinementComment);
      setSuggestions(responses);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      Alert.alert('Error', 'Failed to generate suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate message variations using SoulAI
  const generateMessageVariations = async (message, comment = '') => {
    const prompt = comment 
      ? `Please rewrite this message in 3 different ways with this guidance: "${comment}". Message: "${message}"`
      : `Please rewrite this message in 3 different ways - one casual, one thoughtful, one playful: "${message}"`;

    const response = await ChatGPTService.sendMessage(prompt, {
      onStart: () => {},
      onToken: () => {},
      onComplete: (fullResponse) => {},
      onError: (error) => console.error('SoulAI Error:', error)
    });

    // Parse response into 3 variations
    return parseMessageVariations(response);
  };

  // Generate response suggestions using SoulAI
  const generateResponseSuggestions = async (lastMessage, comment = '') => {
    const contextPrompt = `Based on this conversation context, suggest 3 different responses to: "${lastMessage}"`;
    const finalPrompt = comment 
      ? `${contextPrompt} Please make them: ${comment}`
      : `${contextPrompt} Make them: 1) Engaging and curious, 2) Warm and supportive, 3) Playful and fun`;

    const response = await ChatGPTService.sendMessage(finalPrompt, {
      onStart: () => {},
      onToken: () => {},
      onComplete: (fullResponse) => {},
      onError: (error) => console.error('SoulAI Error:', error)
    });

    return parseMessageVariations(response);
  };

  // Parse AI response into individual messages
  const parseMessageVariations = (response) => {
    // Simple parsing - in production, you'd want more sophisticated parsing
    const lines = response.split('\n').filter(line => line.trim());
    const variations = [];
    
    for (const line of lines) {
      if (line.match(/^\d+[\.\)]/)) {
        // Remove numbering and extract message
        const message = line.replace(/^\d+[\.\)]\s*/, '').trim();
        if (message) {
          variations.push(message);
        }
      }
    }
    
    // Fallback if parsing fails
    if (variations.length === 0) {
      variations.push(response);
    }
    
    // Ensure we have exactly 3 variations
    while (variations.length < 3) {
      variations.push(response);
    }
    
    return variations.slice(0, 3);
  };

  // Handle ready (send to main chat)
  const handleReady = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      onClose();
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setInputText(suggestion);
    // Scroll to top to show the input
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Handle copy suggestion
  const handleCopySuggestion = (suggestion) => {
    setInputText(suggestion);
    Alert.alert('Copied!', 'Message copied to editor');
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
      
      <Animated.View 
        style={[
          styles.modalContainer,
          {
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [500, 0],
              }),
            }],
          },
        ]}
      >
        <LinearGradient
          colors={['#f8f9fa', '#e9ecef', '#dee2e6']}
          style={styles.modalContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <SparklesIcon size={24} color={COLORS.primary} />
            <Text style={styles.headerTitle}>SoulAI Message Helper</Text>
            <TouchableOpacity onPress={onClose}>
              <CloseIcon size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'compose' && styles.activeTab]}
              onPress={() => setActiveTab('compose')}
            >
              <PencilIcon size={18} color={activeTab === 'compose' ? '#fff' : COLORS.primary} />
              <Text style={[styles.tabText, activeTab === 'compose' && styles.activeTabText]}>
                Compose & Refine
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'suggest' && styles.activeTab]}
              onPress={() => setActiveTab('suggest')}
            >
              <SparklesIcon size={18} color={activeTab === 'suggest' ? '#fff' : COLORS.primary} />
              <Text style={[styles.tabText, activeTab === 'suggest' && styles.activeTabText]}>
                Suggest
              </Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            style={styles.contentContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Input Section */}
              <View style={styles.inputSection}>
                <TextInput
                  style={styles.textInput}
                  placeholder={
                    activeTab === 'compose' 
                      ? "Start by writing your main idea for your response, or just ask me to help you come up with some ideas."
                      : "Add a comment or preference (e.g., 'Make it more flirty' or 'Add a joke')"
                  }
                  placeholderTextColor="#6c757d"
                  value={activeTab === 'compose' ? inputText : refinementComment}
                  onChangeText={activeTab === 'compose' ? setInputText : setRefinementComment}
                  multiline
                  textAlignVertical="top"
                />
                
                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  {activeTab === 'compose' ? (
                    <>
                      {suggestions.length > 0 && (
                        <TouchableOpacity style={styles.actionButton} onPress={handleReady}>
                          <SendIcon size={18} color="#fff" />
                          <Text style={styles.actionButtonText}>Ready</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity 
                        style={styles.actionButton} 
                        onPress={handleComposeRefine}
                        disabled={isLoading}
                      >
                        <RefreshIcon size={18} color="#fff" />
                        <Text style={styles.actionButtonText}>
                          {suggestions.length > 0 ? 'Refine' : 'Generate'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity 
                      style={styles.actionButton} 
                      onPress={handleSuggest}
                      disabled={isLoading}
                    >
                      <SparklesIcon size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>Suggest</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Loading Indicator */}
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>SoulAI is thinking...</Text>
                </View>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <Text style={styles.suggestionsTitle}>AI Suggestions:</Text>
                  {suggestions.map((suggestion, index) => (
                    <View key={index} style={styles.suggestionCard}>
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                      <View style={styles.suggestionActions}>
                        <TouchableOpacity 
                          style={styles.suggestionAction}
                          onPress={() => handleSuggestionSelect(suggestion)}
                        >
                          <PencilIcon size={16} color={COLORS.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.suggestionAction}
                          onPress={() => handleCopySuggestion(suggestion)}
                        >
                          <CopyIcon size={16} color={COLORS.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
  },
  modalContent: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  activeTabText: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#e8bef3',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.primary,
  },
  suggestionsContainer: {
    marginTop: 20,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 15,
  },
  suggestionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e8bef3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 10,
  },
  suggestionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  suggestionAction: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
});

export default AIHelperMessageComposer;