// src/screens/chat/SoulChatScreen.js
// Updated with cotton candy gradient background

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  FlatList,
  LayoutAnimation,
  Image,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import the cotton candy gradient color theme
import { COLORS, GRADIENTS } from '../../styles/globalStyles';
import ChatGPTService from '../../services/ChatGPTService';
import SoulMatchmakingService from '../../services/SoulMatchmakingService';
import { useScreenMoodGradient } from '../../hooks/useMoodGradient';
import MoodAnalysisService from '../../services/MoodAnalysisService';
import { CompactMoodIndicator } from '../../components/MoodIndicator';

export default function SoulChatScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const moodGradient = useScreenMoodGradient('soul_chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreamingActive, setIsStreamingActive] = useState(false);
  const [isMatchmakingMode, setIsMatchmakingMode] = useState(true);
  const [matchmakingInitialized, setMatchmakingInitialized] = useState(false);
  
  const flatListRef = useRef(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;

  // Initialize matchmaking system
  useEffect(() => {
    initializeMatchmaking();
  }, []);

  const initializeMatchmaking = async () => {
    try {
      // Sample user profile - in real app this would come from user state/context
      const userProfile = {
        id: 'user_001',
        name: 'Alex',
        age: 25,
        mbtiType: 'INTJ',
        interests: ['technology', 'philosophy', 'art', 'travel'],
        values: ['authenticity', 'growth', 'creativity'],
        bigFive: {
          openness: 85,
          conscientiousness: 75,
          extraversion: 45,
          agreeableness: 70,
          neuroticism: 30
        }
      };

      const initResult = await SoulMatchmakingService.initialize('user_001', userProfile);
      
      if (initResult.success) {
        const initialMessages = [initResult.welcomeMessage];
        
        if (initResult.recommendations && initResult.recommendations.length > 0) {
          initialMessages.push(...initResult.recommendations);
        }
        
        setMessages(initialMessages);
        setMatchmakingInitialized(true);
      } else {
        // Fallback to basic welcome
        const fallbackMessage = {
          id: 'welcome_' + Date.now(),
          from: 'ai',
          text: `Hey! I'm Soul, your personal matchmaker. I'm excited to help you find meaningful connections. Tell me what you're looking for in a partner!`,
          timestamp: new Date().toISOString(),
          type: 'welcome'
        };
        setMessages([fallbackMessage]);
      }
    } catch (error) {
      console.error('Error initializing matchmaking:', error);
      // Fallback message
      const errorMessage = {
        id: 'error_' + Date.now(),
        from: 'ai',
        text: `Hey! I'm Soul, and I'm here to help you find amazing connections. What kind of person are you hoping to meet?`,
        timestamp: new Date().toISOString(),
        type: 'fallback'
      };
      setMessages([errorMessage]);
    }
  };

  // Animated thinking indicator
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

  // Send message function with matchmaking integration
  const handleSend = useCallback(async () => {
    if (!input.trim() || isAIThinking) return;

    const userMessage = {
      id: 'user_' + Date.now(),
      from: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    setIsAIThinking(true);

    try {
      let response;
      
      // Use matchmaking system if initialized and in matchmaking mode
      if (matchmakingInitialized && isMatchmakingMode) {
        response = await SoulMatchmakingService.processMatchmakingMessage(currentInput);
        
        if (response.success) {
          // Add matchmaking response messages
          setMessages(prev => [...prev, ...response.messages]);
          setIsAIThinking(false);
          
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
          return;
        }
      }
      
      // Fallback to regular ChatGPT service
      const aiMessageId = 'ai_' + Date.now();
      const aiMessagePlaceholder = {
        id: aiMessageId,
        from: 'ai',
        text: '',
        timestamp: new Date().toISOString(),
        isStreaming: true
      };

      setMessages(prev => [...prev, aiMessagePlaceholder]);

      await ChatGPTService.sendMessage(currentInput, {
        onStart: () => {
          // Already set thinking to true
        },
        
        onToken: (token, fullResponse) => {
          setIsStreamingActive(true);
          setStreamingMessage(fullResponse);
          
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, text: fullResponse, isStreaming: true }
              : msg
          ));

          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 50);
        },
        
        onComplete: (finalResponse) => {
          setIsAIThinking(false);
          setIsStreamingActive(false);
          setStreamingMessage('');
          
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { 
                  ...msg, 
                  text: finalResponse, 
                  isStreaming: false,
                  type: 'ai'
                }
              : msg
          ));

          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        },
        
        onError: (error) => {
          setIsAIThinking(false);
          setIsStreamingActive(false);
          setStreamingMessage('');
          console.error('Chat error:', error);
          
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { 
                  ...msg, 
                  text: "I'm having trouble connecting right now, but I'm still here with you. What would you like to explore together?",
                  isStreaming: false,
                  type: 'error'
                }
              : msg
          ));
        }
      });
      
    } catch (error) {
      console.error('Send message error:', error);
      setIsAIThinking(false);
      setIsStreamingActive(false);
      
      const errorMessage = {
        id: 'error_' + Date.now(),
        from: 'ai',
        text: "I understand you're sharing something meaningful with me. Let me take a moment to process that thoughtfully...",
        timestamp: new Date().toISOString(),
        type: 'fallback'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [input, isAIThinking, matchmakingInitialized, isMatchmakingMode]);

  // Render individual message with matchmaking enhancements
  const renderMessage = ({ item }) => {
    const isUser = item.from === 'user';
    const isWelcome = item.type === 'welcome';
    const isMatchmaking = item.type === 'matchmaking';
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.aiMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
          isWelcome && styles.welcomeBubble,
          isMatchmaking && styles.matchmakingBubble
        ]}>
          {/* Render candidate profile if available */}
          {item.candidateData && (
            <View style={styles.candidateProfile}>
              <View style={styles.candidateHeader}>
                <Text style={styles.candidateName}>
                  {item.candidateData.name}, {item.candidateData.age}
                </Text>
                {item.compatibility && (
                  <View style={styles.compatibilityBadge}>
                    <Text style={styles.compatibilityText}>
                      {Math.round(item.compatibility.score * 100)}% match
                    </Text>
                  </View>
                )}
              </View>
              
              {item.candidateData.bio && (
                <Text style={styles.candidateBio}>{item.candidateData.bio}</Text>
              )}
              
              {item.candidateData.interests && item.candidateData.interests.length > 0 && (
                <View style={styles.interestsContainer}>
                  <Text style={styles.interestsLabel}>Interests:</Text>
                  <View style={styles.interestTags}>
                    {item.candidateData.interests.slice(0, 4).map((interest, index) => (
                      <View key={index} style={styles.interestTag}>
                        <Text style={styles.interestText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
          
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.aiText,
            isWelcome && styles.welcomeText,
            isMatchmaking && styles.matchmakingText
          ]}>
            {item.text}
          </Text>
          
          {/* Render quick reply options */}
          {item.quickReplies && item.quickReplies.length > 0 && (
            <View style={styles.quickRepliesContainer}>
              {item.quickReplies.map((reply, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickReplyButton}
                  onPress={() => handleQuickReply(reply)}
                >
                  <Text style={styles.quickReplyText}>{reply}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {item.isStreaming && (
            <Animated.View
              style={[
                styles.streamingIndicator,
                {
                  opacity: typingAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                },
              ]}
            >
              <Text style={styles.streamingDot}>●</Text>
            </Animated.View>
          )}
        </View>
      </View>
    );
  };

  // Handle quick reply selection
  const handleQuickReply = (reply) => {
    setInput(reply);
    // Automatically send the quick reply
    setTimeout(() => {
      if (reply.trim()) {
        setInput('');
        handleSend();
      }
    }, 100);
  };

  // Render thinking indicator
  const renderThinkingIndicator = () => {
    if (!isAIThinking) return null;

    return (
      <View style={styles.thinkingContainer}>
        <View style={styles.thinkingBubble}>
          <Animated.View style={styles.thinkingDots}>
            <Animated.Text
              style={[
                styles.thinkingDot,
                {
                  opacity: typingAnimation.interpolate({
                    inputRange: [0, 0.33, 0.66, 1],
                    outputRange: [0.3, 1, 0.3, 0.3],
                  }),
                },
              ]}
            >
              ●
            </Animated.Text>
            <Animated.Text
              style={[
                styles.thinkingDot,
                {
                  opacity: typingAnimation.interpolate({
                    inputRange: [0, 0.33, 0.66, 1],
                    outputRange: [0.3, 0.3, 1, 0.3],
                  }),
                },
              ]}
            >
              ●
            </Animated.Text>
            <Animated.Text
              style={[
                styles.thinkingDot,
                {
                  opacity: typingAnimation.interpolate({
                    inputRange: [0, 0.33, 0.66, 1],
                    outputRange: [0.3, 0.3, 0.3, 1],
                  }),
                },
              ]}
            >
              ●
            </Animated.Text>
          </Animated.View>
          <Text style={styles.thinkingText}>Soul is thinking...</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with cotton candy gradient */}
      <View style={styles.headerShadow}>
        <LinearGradient
          colors={GRADIENTS.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <View style={styles.headerLeft}>
            <Ionicons name="chatbubbles" size={24} color={COLORS.primary} style={styles.soulIcon} />
            <Text style={styles.soulHeading}>Soul</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Chat Container with COTTON CANDY GRADIENT BACKGROUND */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <LinearGradient
          colors={['#cbbaf1', '#cbbaf1', '#e8bef3', '#B8E6FF', '#9eb7ec']}  // Exact cotton candy gradient from working backup
          style={styles.messagesContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0, 0.25, 0.5, 0.75, 1]}  // Exact distribution from working backup
        >
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
            ListFooterComponent={renderThinkingIndicator}
          />

          {/* Input container with enhanced styling for dark background */}
          <View style={styles.inputContainer}>
            <View style={styles.inputPill}>
              <TextInput
                style={[styles.input, styles.inputFont]}
                value={input}
                onChangeText={setInput}
                placeholder="Share what's on your heart..."
                placeholderTextColor={COLORS.textPlaceholder}
                multiline
                returnKeyType="send"
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
                includeFontPadding={false}
                textAlignVertical="center"
                editable={!isAIThinking}
              />
              <TouchableOpacity
                onPress={handleSend}
                style={[
                  styles.sendButton, 
                  (!input.trim() || isAIThinking) && styles.disabledButton
                ]}
                disabled={!input.trim() || isAIThinking}
              >
                <Ionicons 
                  name={isAIThinking ? "hourglass" : "send"} 
                  size={22} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>

      {/* Bottom toolbar - Full width gradient */}
      <LinearGradient
        colors={GRADIENTS.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.toolbarContainer, { paddingBottom: insets.bottom }]}
      >
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolbarIcon}>
            <View style={[styles.iconContainer, styles.activeIcon]}>
              <Ionicons name="chatbubbles" size={24} color="#4A2C6D" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolbarIcon}
            onPress={() => navigation?.navigate?.('DiscoveryScreen')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="heart" size={24} color="rgba(255, 255, 255, 0.6)" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolbarIcon}
            onPress={() => navigation?.navigate?.('ProfileScreen')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={24} color="rgba(255, 255, 255, 0.6)" />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

// Enhanced styles with deep gradient colors
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundWhite
  },
  
  // Header Styles
  headerShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: COLORS.backgroundWhite,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  soulIcon: {
    marginRight: 12,
  },
  soulHeading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4A90E2',
    letterSpacing: 1
  },
  menuButton: {
    padding: 4,
  },

  // Chat Container
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 80, // Add space for floating input
  },

  // Message Styles - Enhanced for dark gradient background
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accentPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 2,
    shadowColor: COLORS.shadowAccent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.vibrantPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginBottom: 2,
    shadowColor: COLORS.shadowAccent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  messageBubble: {
    maxWidth: '75%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  userBubble: {
    backgroundColor: '#4A90E2',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Slight transparency for depth
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  welcomeBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: COLORS.accentPurple,
    maxWidth: '85%',
  },
  matchmakingBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 2,
    borderColor: COLORS.secondary,
    maxWidth: '90%',
  },

  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: COLORS.textWhite,
    fontWeight: '500',
  },
  aiText: {
    color: COLORS.textPrimary,
    fontWeight: '400',
  },
  welcomeText: {
    color: COLORS.textPrimary,
    fontWeight: '400',
    lineHeight: 24,
  },
  matchmakingText: {
    color: COLORS.textPrimary,
    fontWeight: '400',
    lineHeight: 22,
    marginTop: 8,
  },

  // Candidate Profile Styles
  candidateProfile: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(107, 70, 193, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(107, 70, 193, 0.2)',
  },
  candidateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  candidateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    flex: 1,
  },
  compatibilityBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  compatibilityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  candidateBio: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: 8,
  },
  interestsContainer: {
    marginTop: 8,
  },
  interestsLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  interestTag: {
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  interestText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '500',
  },

  // Quick Replies Styles
  quickRepliesContainer: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  quickReplyButton: {
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  quickReplyText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },

  // Streaming Indicator
  streamingIndicator: {
    marginTop: 4,
  },
  streamingDot: {
    color: COLORS.textPlaceholder,
    fontSize: 12,
  },

  // Thinking Indicator - Enhanced for dark background
  thinkingContainer: {
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'flex-end',
    paddingHorizontal: 16,
  },
  thinkingBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  thinkingDots: {
    flexDirection: 'row',
    marginRight: 8,
  },
  thinkingDot: {
    color: COLORS.textWhite,
    fontSize: 14,
    marginHorizontal: 1,
  },
  thinkingText: {
    color: COLORS.textWhite,
    fontSize: 14,
    fontStyle: 'italic',
  },

  // Input Styles - Floating with transparent background
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#e8bef3',
    paddingLeft: 20,
    paddingRight: 4,
    paddingVertical: 4,
    shadowColor: '#cbbaf1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  inputFont: {
    fontWeight: '400',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#cbbaf1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#B8E6FF',
    shadowOpacity: 0.1,
  },

  // Toolbar Styles - Enhanced
  toolbarContainer: {
    backgroundColor: COLORS.backgroundWhite,
    borderTopWidth: 1,
    borderTopColor: COLORS.toolbarBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 8,
    paddingTop: 8,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  toolbarIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  activeIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 2,
    borderColor: '#4A2C6D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});