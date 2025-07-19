// AI Helper Bar Popup Component
// Modal chat interface that replicates SoulChatScreen functionality for contextual assistance

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { COLORS, GRADIENTS } from '../styles/globalStyles';
import ChatBubble from './common/ChatBubble';
import ChatGPTService from '../services/ChatGPTService';
import AIHelperContextService from '../services/AIHelperContextService';
import useTypingEffect from '../hooks/useTypingEffect';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const POPUP_HEIGHT = SCREEN_HEIGHT * 0.7;

const AIHelperBarPopup = ({
  visible,
  onClose,
  screenContext = 'general',
  contextData = {},
  onMessageSelect, // Callback for when user selects a message for insertion
  mode = 'assist' // 'assist' for general help, 'compose' for message composition
}) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [quickActions, setQuickActions] = useState([]);
  
  const slideAnim = useRef(new Animated.Value(POPUP_HEIGHT)).current;
  const scrollViewRef = useRef(null);
  const typingText = useTypingEffect(currentStreamingMessage, 30);

  // Initialize with context-specific welcome message
  useEffect(() => {
    if (visible) {
      initializeChat();
      animateIn();
    } else {
      animateOut();
    }
  }, [visible]);

  const initializeChat = async () => {
    await AIHelperContextService.initialize();
    
    const welcomeMessage = getContextualWelcomeMessage();
    const actions = AIHelperContextService.getContextQuickActions(screenContext);
    
    setMessages([{
      id: 'welcome',
      from: 'ai',
      text: welcomeMessage,
      timestamp: new Date().toISOString(),
      type: 'welcome'
    }]);
    
    setQuickActions(actions);
    setInputText('');
    setIsAIThinking(false);
    setCurrentStreamingMessage('');
    setIsStreaming(false);
  };

  const getContextualWelcomeMessage = () => {
    switch (screenContext) {
      case 'matchChat':
        return `Hi! I'm here to help you craft the perfect message${contextData.matchName ? ` for ${contextData.matchName}` : ''}. What would you like to say?`;
      case 'profile':
        return "I'm here to help you optimize your profile and make great first impressions. What would you like to work on?";
      case 'matches':
        return "I can help you navigate your matches, suggest conversation starters, or give relationship advice. What's on your mind?";
      default:
        return "Hi! I'm Soul, your AI relationship assistant. How can I help you today?";
    }
  };

  // This function is now replaced by AIHelperContextService.getContextQuickActions
  // but keeping for backward compatibility if needed

  const animateIn = () => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const animateOut = () => {
    Animated.spring(slideAnim, {
      toValue: POPUP_HEIGHT,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      from: 'user',
      text: inputText,
      timestamp: new Date().toISOString(),
      type: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsAIThinking(true);

    try {
      const aiMessageId = `ai-${Date.now()}`;
      
      await AIHelperContextService.sendContextualMessage(inputText, screenContext, contextData, {
        onStart: () => {
          setIsStreaming(true);
          setCurrentStreamingMessage('');
        },
        onToken: (token, fullResponse) => {
          setCurrentStreamingMessage(fullResponse);
        },
        onComplete: (finalResponse) => {
          setMessages(prev => [...prev, {
            id: aiMessageId,
            from: 'ai',
            text: finalResponse,
            timestamp: new Date().toISOString(),
            type: 'ai'
          }]);
          setIsStreaming(false);
          setCurrentStreamingMessage('');
          setIsAIThinking(false);
        },
        onError: (error) => {
          console.error('AI Helper error:', error);
          setMessages(prev => [...prev, {
            id: aiMessageId,
            from: 'ai',
            text: "I'm having trouble right now. Please try again in a moment.",
            timestamp: new Date().toISOString(),
            type: 'error'
          }]);
          setIsStreaming(false);
          setCurrentStreamingMessage('');
          setIsAIThinking(false);
        }
      });
    } catch (error) {
      console.error('Send message error:', error);
      setIsAIThinking(false);
    }
  };

  // This function is now replaced by AIHelperContextService.buildContextualPrompt
  // but keeping for backward compatibility if needed

  const handleQuickAction = async (action) => {
    try {
      const quickMessage = await AIHelperContextService.handleQuickAction(action, screenContext, contextData);
      setInputText(quickMessage);
    } catch (error) {
      console.error('Error handling quick action:', error);
      setInputText('Help me with this.');
    }
  };

  const handleMessageSelect = (messageText) => {
    if (onMessageSelect) {
      onMessageSelect(messageText);
      onClose();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingMessage]);

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        >
          <BlurView style={styles.blur} intensity={20} />
        </TouchableOpacity>
        
        <Animated.View 
          style={[
            styles.popupContainer,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Soul Assistant</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            {quickActions.length > 0 && (
              <View style={styles.quickActionsContainer}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.quickActionsScroll}
                >
                  {quickActions.map((action, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.quickActionButton}
                      onPress={() => handleQuickAction(action.action)}
                    >
                      <Text style={styles.quickActionText}>{action.text}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Messages */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((message) => (
                <ChatBubble
                  key={message.id}
                  message={message}
                  onMessageSelect={screenContext === 'matchChat' ? handleMessageSelect : null}
                />
              ))}
              
              {isStreaming && (
                <ChatBubble
                  message={{
                    id: 'streaming',
                    from: 'ai',
                    text: typingText,
                    timestamp: new Date().toISOString(),
                    type: 'ai',
                    isStreaming: true
                  }}
                />
              )}
              
              {isAIThinking && !isStreaming && (
                <View style={styles.thinkingContainer}>
                  <Text style={styles.thinkingText}>Soul is thinking...</Text>
                </View>
              )}
            </ScrollView>

            {/* Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputPill}>
                <TextInput
                  style={styles.input}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Ask Soul for help..."
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                  textAlignVertical="center"
                  onSubmitEditing={handleSendMessage}
                />
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSendMessage}
                  disabled={!inputText.trim()}
                >
                  <Ionicons
                    name="send"
                    size={18}
                    color={inputText.trim() ? COLORS.primary : COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  blur: {
    flex: 1,
  },
  
  popupContainer: {
    height: POPUP_HEIGHT,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  
  keyboardAvoidingView: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  
  closeButton: {
    padding: 4,
  },
  
  quickActionsContainer: {
    paddingVertical: 12,
  },
  
  quickActionsScroll: {
    paddingHorizontal: 16,
  },
  
  quickActionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  
  quickActionText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '500',
  },
  
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  thinkingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  
  thinkingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
  
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  
  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    maxHeight: 100,
  },
  
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default AIHelperBarPopup;