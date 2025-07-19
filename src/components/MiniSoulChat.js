// Mini Soul Chat - Embedded SoulAI Chat for Match Conversations
// Functions exactly like SoulChatScreen but in a compact overlay format

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SparklesIcon } from './icons/SVGIcons';
import { COLORS, GRADIENTS } from '../styles/globalStyles';
import ChatGPTService from '../services/ChatGPTService';

const MiniSoulChat = ({ 
  visible, 
  onClose, 
  matchName = '',
  lastReceivedMessage = '',
  conversationHistory = []
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreamingActive, setIsStreamingActive] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;

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

  // Initialize with welcome message when opened
  useEffect(() => {
    if (visible && messages.length === 0) {
      const welcomeMessage = {
        id: 'mini_welcome_' + Date.now(),
        from: 'ai',
        text: `Hey! I'm here to help with your conversation with ${matchName}. What would you like to talk about?`,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, [visible, matchName]);

  // Clear state when modal closes
  useEffect(() => {
    if (!visible) {
      setInput('');
      setMessages([]);
      setIsAIThinking(false);
      setStreamingMessage('');
      setIsStreamingActive(false);
    }
  }, [visible]);

  // Typing animation for AI thinking
  useEffect(() => {
    if (isAIThinking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingAnimation.setValue(0);
    }
  }, [isAIThinking]);

  // Handle sending message to Soul
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: 'user_' + Date.now(),
      from: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = input.trim();
    setInput('');
    setIsAIThinking(true);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Build context for Soul
      let prompt = `You are Soul, a helpful and insightful dating assistant. The user is chatting with ${matchName}.`;
      
      if (lastReceivedMessage) {
        prompt += ` The last message they received was: "${lastReceivedMessage}".`;
      }

      if (conversationHistory.length > 0) {
        const recentMessages = conversationHistory.slice(-5);
        prompt += ` Recent conversation context: ${recentMessages.map(msg => `${msg.from}: ${msg.text}`).join(' | ')}`;
      }

      prompt += ` User asks: "${messageText}". Provide helpful, empathetic advice.`;

      const response = await ChatGPTService.sendMessage(prompt, {
        onStart: () => {
          setIsStreamingActive(true);
          setStreamingMessage('');
        },
        onToken: (token) => {
          setStreamingMessage(prev => prev + token);
        },
        onComplete: (fullResponse) => {
          setIsAIThinking(false);
          setIsStreamingActive(false);
          
          const aiMessage = {
            id: 'ai_' + Date.now(),
            from: 'ai',
            text: fullResponse,
            timestamp: new Date().toISOString()
          };

          setMessages(prev => [...prev, aiMessage]);
          setStreamingMessage('');

          // Scroll to bottom
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        },
        onError: (error) => {
          console.error('Soul Chat Error:', error);
          setIsAIThinking(false);
          setIsStreamingActive(false);
          
          const errorMessage = {
            id: 'error_' + Date.now(),
            from: 'ai',
            text: "Sorry, I'm having trouble connecting right now. Please try again!",
            timestamp: new Date().toISOString()
          };

          setMessages(prev => [...prev, errorMessage]);
          setStreamingMessage('');
        }
      });
    } catch (error) {
      console.error('Error sending message to Soul:', error);
      setIsAIThinking(false);
      setIsStreamingActive(false);
    }
  };

  // Render individual message
  const renderMessage = ({ item }) => {
    const isUser = item.from === 'user';
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.aiMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.aiText
          ]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  // Render typing indicator
  const renderTypingIndicator = () => {
    if (!isAIThinking && !isStreamingActive) return null;

    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          {isStreamingActive ? (
            <Text style={styles.streamingText}>{streamingMessage}</Text>
          ) : (
            <Animated.View style={styles.typingDots}>
              <Animated.Text style={[styles.typingDot, {
                opacity: typingAnimation.interpolate({
                  inputRange: [0, 0.33, 0.66, 1],
                  outputRange: [0.3, 1, 0.3, 0.3],
                }),
              }]}>●</Animated.Text>
              <Animated.Text style={[styles.typingDot, {
                opacity: typingAnimation.interpolate({
                  inputRange: [0, 0.33, 0.66, 1],
                  outputRange: [0.3, 0.3, 1, 0.3],
                }),
              }]}>●</Animated.Text>
              <Animated.Text style={[styles.typingDot, {
                opacity: typingAnimation.interpolate({
                  inputRange: [0, 0.33, 0.66, 1],
                  outputRange: [0.3, 0.3, 0.3, 1],
                }),
              }]}>●</Animated.Text>
            </Animated.View>
          )}
        </View>
      </View>
    );
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
              outputRange: [400, 0],
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
          colors={['rgba(232, 244, 253, 0.95)', 'rgba(255, 255, 255, 0.85)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.chatContainer}
        >
          {/* Drag Handle */}
          <View style={styles.dragHandle}>
            <View style={styles.dragBar} />
          </View>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <SparklesIcon size={20} color={COLORS.primary} />
              <Text style={styles.headerText}>Soul Chat</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
            ListFooterComponent={renderTypingIndicator}
          />

          {/* Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputPill}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Ask Soul for advice..."
                placeholderTextColor="rgba(75, 45, 109, 0.5)"
                multiline
                returnKeyType="send"
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
                textAlignVertical="center"
              />
              <TouchableOpacity
                onPress={handleSend}
                style={[
                  styles.sendButton, 
                  !input.trim() && styles.disabledButton
                ]}
                disabled={!input.trim() || isAIThinking}
              >
                <Ionicons name="send" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
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
    height: '50%',
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  content: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(75, 45, 109, 0.3)',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
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
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 80,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#4A90E2',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  aiText: {
    color: '#2c3e50',
    fontWeight: '400',
  },
  typingContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  typingBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 60,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingDot: {
    fontSize: 10,
    color: COLORS.primary,
    marginHorizontal: 1,
  },
  streamingText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '400',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e8bef3',
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingRight: 8,
    color: '#2c3e50',
    fontSize: 14,
    maxHeight: 80,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#B8E6FF',
  },
});

export default MiniSoulChat;