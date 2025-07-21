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
  Dimensions,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import the cotton candy gradient color theme
import { COLORS, GRADIENTS } from '../../styles/globalStyles';
import ChatGPTService from '../../services/ChatGPTService';
import SoulMatchmakingService from '../../services/SoulMatchmakingService';
import MatchmakingBackendService from '../../services/MatchmakingBackendService';
import { useScreenMoodGradient } from '../../hooks/useMoodGradient';
import MoodAnalysisService from '../../services/MoodAnalysisService';
import { CompactMoodIndicator } from '../../components/MoodIndicator';
import RecommendationCard from '../../components/chat/RecommendationCard';

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
      console.log('🚀 Initializing matchmaking system...');
      
      // Sample user profile - in real app this would come from user state/context
      const userProfile = {
        id: 'user_001',
        name: 'Alex',
        age: 25,
        location: 'San Francisco, CA',
        mbtiType: 'INTJ',
        interests: ['technology', 'philosophy', 'art', 'travel'],
        values: ['authenticity', 'growth', 'creativity'],
        photos: ['https://i.pravatar.cc/400?img=8'],
        bigFive: {
          openness: 85,
          conscientiousness: 75,
          extraversion: 45,
          agreeableness: 70,
          neuroticism: 30
        }
      };

      // Try new backend service first
      console.log('🌐 Attempting to initialize with backend service...');
      const backendResult = await MatchmakingBackendService.initialize('user_001', userProfile);
      
      if (backendResult.success && backendResult.welcomeMessage) {
        console.log('✅ Backend initialization successful');
        
        const initialMessages = [backendResult.welcomeMessage];
        
        setMessages(initialMessages);
        setMatchmakingInitialized(true);
        
        return; // Success with backend
      }
      
      // Fallback to existing service
      console.log('🔄 Falling back to existing matchmaking service...');
      const initResult = await SoulMatchmakingService.initialize('user_001', userProfile);
      
      if (initResult.success && initResult.welcomeMessage && initResult.welcomeMessage.text && initResult.welcomeMessage.text.trim()) {
        const initialMessages = [initResult.welcomeMessage];
        
        if (initResult.recommendations && initResult.recommendations.length > 0) {
          initialMessages.push(...initResult.recommendations);
        }
        
        setMessages(initialMessages);
        setMatchmakingInitialized(true);
      } else {
        throw new Error('Both backend and fallback initialization failed');
      }
      
    } catch (error) {
      console.error('❌ Error initializing matchmaking:', error);
      
      // Final fallback message
      const fallbackMessage = {
        id: 'fallback_' + Date.now(),
        from: 'ai',
        text: `Hey! I'm here to help you find amazing connections. What kind of person are you hoping to meet?`,
        timestamp: new Date().toISOString(),
        type: 'fallback'
      };
      setMessages([fallbackMessage]);
      setMatchmakingInitialized(true); // Allow basic functionality
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

    smartAutoScroll();

    setIsAIThinking(true);

    try {
      let response;
      
      // Try matchmaking system for specific commands only
      if (matchmakingInitialized && isMatchmakingMode) {
        // Only process matchmaking-specific messages (likes, passes, match requests)
        const lowerInput = currentInput.toLowerCase();
        const isMatchmakingCommand = 
          lowerInput.includes('like') || lowerInput.includes('pass') || 
          lowerInput.includes('yes') || lowerInput.includes('no') ||
          lowerInput.includes('show me') || lowerInput.includes('more matches') ||
          lowerInput.includes('recommendations') || lowerInput.includes('👍') ||
          lowerInput.includes('👎') || lowerInput.includes('💕');
        
        if (isMatchmakingCommand) {
          // Try backend service first
          response = await MatchmakingBackendService.processMatchmakingMessage(currentInput, messages);
          
          if (response.success) {
            console.log('✅ Backend matchmaking response received');
            // Add matchmaking response messages
            setMessages(prev => [...prev, ...response.messages]);
            setIsAIThinking(false);
            
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
            return;
          }
          
          // Fallback to existing service
          console.log('🔄 Falling back to existing matchmaking service for command processing');
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

          // Don't auto-scroll during streaming - let user scroll freely
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
  const handleLikeFromCard = async (recommendation) => {
    try {
      const userName = recommendation.candidateData?.name || recommendation.displayName || recommendation.name || 'this person';
      
      // 1. Create user message showing their action
      const userActionMessage = {
        id: 'user_like_' + Date.now(),
        from: 'user',
        text: `I like ${userName}`,
        timestamp: new Date().toISOString(),
        type: 'user_action'
      };
      
      setMessages(prev => [...prev, userActionMessage]);
      setIsAIThinking(true);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // 2. Process the like action
      const userId = recommendation.userId || recommendation.candidateUserId;
      const result = await MatchmakingBackendService.likeUser(
        userId,
        { source: 'recommendation_card' }
      );
      
      // 3. Generate SoulAI's response
      let aiResponseText;
      if (result && result.success) {
        if (result.isMatch) {
          aiResponseText = `🎉 Amazing! It's a mutual match with ${userName}! You can now start chatting with them. Would you like to see more recommendations?`;
        } else {
          aiResponseText = `Perfect! I've let ${userName}'s AI know you're interested. I'll notify you if they like you back. Ready for the next recommendation?`;
        }
      } else {
        aiResponseText = `I've noted your interest in ${userName}! Let me continue finding great matches for you. Ready for the next one?`;
      }
      
      const aiResponseMessage = {
        id: 'ai_like_response_' + Date.now(),
        from: 'ai',
        text: aiResponseText,
        timestamp: new Date().toISOString(),
        type: 'like_response',
        quickReplies: ['Yes, show me', 'Not yet']
      };
      
      setMessages(prev => [...prev, aiResponseMessage]);
      setIsAIThinking(false);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (error) {
      console.error('Error handling like from card:', error);
      setIsAIThinking(false);
    }
  };

  const handlePassFromCard = async (recommendation) => {
    try {
      const userName = recommendation.candidateData?.name || recommendation.displayName || recommendation.name || 'this person';
      
      // 1. Create user message showing their action
      const userActionMessage = {
        id: 'user_pass_' + Date.now(),
        from: 'user',
        text: `I'll pass on ${userName}`,
        timestamp: new Date().toISOString(),
        type: 'user_action'
      };
      
      setMessages(prev => [...prev, userActionMessage]);
      setIsAIThinking(true);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // 2. Process the pass action
      const userId = recommendation.userId || recommendation.candidateUserId;
      const result = await MatchmakingBackendService.passUser(
        userId,
        { source: 'recommendation_card' }
      );
      
      // 3. Generate SoulAI's response
      const aiResponseText = `No problem at all! Let's find someone who's an even better match for you. Ready for the next recommendation?`;
      
      const aiResponseMessage = {
        id: 'ai_pass_response_' + Date.now(),
        from: 'ai',
        text: aiResponseText,
        timestamp: new Date().toISOString(),
        type: 'pass_response',
        quickReplies: ['Yes, show me', 'Not yet']
      };
      
      setMessages(prev => [...prev, aiResponseMessage]);
      setIsAIThinking(false);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (error) {
      console.error('Error handling pass from card:', error);
      setIsAIThinking(false);
    }
  };

  const handleTellMeMoreFromCard = (recommendation) => {
    // Navigate to full profile screen
    navigation?.navigate?.('UserProfileScreen', { 
      userId: recommendation.userId || recommendation.candidateUserId,
      fromMatch: false 
    });
  };

  const handleViewProfileFromCard = (recommendation) => {
    // Navigate to full profile screen
    navigation?.navigate?.('UserProfileScreen', { 
      userId: recommendation.userId || recommendation.candidateUserId,
      fromMatch: false 
    });
  };

  const renderMessage = ({ item }) => {
    const isUser = item.from === 'user';
    const isWelcome = item.type === 'welcome';
    const isMatchmaking = item.type === 'matchmaking';
    const isRecommendationCard = item.type === 'recommendation_card';
    
    // Handle recommendation cards differently
    if (isRecommendationCard) {
      return (
        <View style={[
          styles.messageContainer,
          styles.aiMessageContainer
        ]}>
          <RecommendationCard
            recommendation={item}
            onLike={handleLikeFromCard}
            onPass={handlePassFromCard}
            onTellMeMore={handleTellMeMoreFromCard}
            onViewProfile={handleViewProfileFromCard}
          />
        </View>
      );
    }
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.aiMessageContainer
      ]}>
        <TouchableOpacity 
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.aiBubble,
            isWelcome && styles.welcomeBubble,
            isMatchmaking && styles.matchmakingBubble
          ]}
          onLongPress={() => handleLongPress(item)}
          delayLongPress={500}
          activeOpacity={0.8}
        >
          {/* Render candidate profile if available */}
          {item.candidateData && (
            <View style={styles.candidateProfile}>
              {/* Photos - Most Important: Display first */}
              {item.candidateData.photos && item.candidateData.photos.length > 0 && (
                <View style={styles.candidatePhotos}>
                  <Image 
                    source={{ uri: item.candidateData.photos[0] }}
                    style={styles.primaryPhoto}
                    resizeMode="cover"
                  />
                  {item.candidateData.photos.length > 1 && (
                    <View style={styles.additionalPhotos}>
                      {item.candidateData.photos.slice(1, 4).map((photo, index) => (
                        <Image 
                          key={index}
                          source={{ uri: photo }}
                          style={styles.additionalPhoto}
                          resizeMode="cover"
                        />
                      ))}
                      {item.candidateData.photos.length > 4 && (
                        <View style={styles.morePhotosIndicator}>
                          <Text style={styles.morePhotosText}>
                            +{item.candidateData.photos.length - 4}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}
              
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
          
          {item.isStreaming && !isUser && (
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
              <Text style={styles.streamingDot}>● ● ●</Text>
            </Animated.View>
          )}
        </TouchableOpacity>
        
        {/* Render quick reply options below chat bubble */}
        {item.quickReplies && item.quickReplies.length > 0 && !isUser && (
          <View style={styles.quickRepliesContainer}>
            {['Yes, show me', 'Tell me more', 'No, not yet'].map((reply, index) => (
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
      </View>
    );
  };

  // Handle quick reply selection with debouncing
  const [quickReplyProcessing, setQuickReplyProcessing] = useState(false);
  const [longPressMenuVisible, setLongPressMenuVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Smart auto-scroll that respects user scrolling behavior
  const smartAutoScroll = (immediate = false) => {
    // Don't auto-scroll if user is actively scrolling up to read old messages
    if (isUserScrolling) return;
    
    const delay = immediate ? 0 : 100;
    setTimeout(() => {
      if (!isUserScrolling) { // Double-check user isn't scrolling
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    }, delay);
  };

  // Handle long press on message bubbles
  const handleLongPress = (message) => {
    setSelectedMessage(message);
    setLongPressMenuVisible(true);
  };

  // Menu action handlers
  const handleCopyMessage = () => {
    // TODO: Implement copy to clipboard
    console.log('Copy message:', selectedMessage.text);
    setLongPressMenuVisible(false);
    setSelectedMessage(null);
  };

  const handleSelectText = () => {
    // TODO: Implement text selection
    console.log('Select text:', selectedMessage.text);
    setLongPressMenuVisible(false);
    setSelectedMessage(null);
  };

  const handleGoodResponse = () => {
    console.log('Good response feedback for:', selectedMessage.text);
    setLongPressMenuVisible(false);
    setSelectedMessage(null);
  };

  const handleBadResponse = () => {
    console.log('Bad response feedback for:', selectedMessage.text);
    setLongPressMenuVisible(false);
    setSelectedMessage(null);
  };

  const handleRegenerateResponse = async () => {
    console.log('Regenerate response for:', selectedMessage.text);
    setLongPressMenuVisible(false);
    setSelectedMessage(null);
    
    // TODO: Implement regeneration logic
    setIsAIThinking(true);
    // Simulate regeneration
    setTimeout(() => {
      setIsAIThinking(false);
    }, 2000);
  };
  
  const handleQuickReply = useCallback(async (reply) => {
    // Prevent double-clicks
    if (quickReplyProcessing || isAIThinking) {
      return;
    }
    
    setQuickReplyProcessing(true);
    
    try {
      const replyText = reply.trim();
      if (!replyText) {
        setQuickReplyProcessing(false);
        return;
      }

      // Create user message for the quick reply
      const userMessage = {
        id: 'user_qr_' + Date.now(),
        from: 'user',
        text: replyText,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMessage]);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      setIsAIThinking(true);

      // Process the reply through matchmaking system
      if (matchmakingInitialized && isMatchmakingMode) {
        const response = await MatchmakingBackendService.processMatchmakingMessage(replyText, messages);
        
        if (response.success) {
          console.log('✅ Backend matchmaking response received');
          setMessages(prev => [...prev, ...response.messages]);
          setIsAIThinking(false);
          
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
          
          setQuickReplyProcessing(false);
          return;
        }
      }
      
      // Fallback to regular ChatGPT response
      const aiMessageId = 'ai_qr_' + Date.now();
      const aiMessagePlaceholder = {
        id: aiMessageId,
        from: 'ai',
        text: '',
        timestamp: new Date().toISOString(),
        isStreaming: true
      };

      setMessages(prev => [...prev, aiMessagePlaceholder]);

      await ChatGPTService.sendMessage(replyText, {
        onToken: (token, fullResponse) => {
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, text: fullResponse, isStreaming: true }
              : msg
          ));
        },
        onComplete: (finalResponse) => {
          setIsAIThinking(false);
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, text: finalResponse, isStreaming: false }
              : msg
          ));
          
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        },
        onError: (error) => {
          setIsAIThinking(false);
          console.error('Error in quick reply ChatGPT response:', error);
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, text: 'Sorry, I encountered an error processing your request. Please try again.', isStreaming: false }
              : msg
          ));
        }
      });
      
    } catch (error) {
      console.error('Error handling quick reply:', error);
      setIsAIThinking(false);
    } finally {
      setQuickReplyProcessing(false);
    }
  }, [quickReplyProcessing, isAIThinking, matchmakingInitialized, isMatchmakingMode, messages]);

  // Render thinking indicator
  const renderThinkingIndicator = () => {
    if (!isAIThinking) return null;

    return (
      <View style={styles.thinkingContainer}>
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
            onScroll={(event) => {
              // Detect if user is manually scrolling
              const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
              const isAtBottom = contentOffset.y >= (contentSize.height - layoutMeasurement.height - 20);
              setIsUserScrolling(!isAtBottom);
            }}
            onScrollBeginDrag={() => setIsUserScrolling(true)}
            onScrollEndDrag={() => {
              // Reset user scrolling after a delay
              setTimeout(() => setIsUserScrolling(false), 2000);
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
                placeholder="Aa ..."
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
                disabled={!input.trim() || isAIThinking || quickReplyProcessing}
                style={[
                  styles.sendButton, 
                  (!input.trim() || isAIThinking || quickReplyProcessing) && styles.disabledButton
                ]}
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
            onPress={() => navigation?.navigate?.('MatchList')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="list" size={24} color="rgba(255, 255, 255, 0.6)" />
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

      {/* Long Press Menu Modal */}
      {longPressMenuVisible && (
        <Modal
          transparent={true}
          visible={longPressMenuVisible}
          animationType="fade"
          onRequestClose={() => setLongPressMenuVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setLongPressMenuVisible(false)}
          >
            <View style={styles.longPressMenu}>
              <TouchableOpacity style={styles.menuItem} onPress={handleCopyMessage}>
                <Ionicons name="copy" size={20} color="#4A90E2" />
                <Text style={styles.menuItemText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={handleSelectText}>
                <Ionicons name="text" size={20} color="#4A90E2" />
                <Text style={styles.menuItemText}>Select text</Text>
              </TouchableOpacity>
              {selectedMessage?.from === 'ai' && (
                <>
                  <TouchableOpacity style={styles.menuItem} onPress={handleGoodResponse}>
                    <Ionicons name="thumbs-up" size={20} color="#4ECDC4" />
                    <Text style={styles.menuItemText}>Good response</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem} onPress={handleBadResponse}>
                    <Ionicons name="thumbs-down" size={20} color="#FF6B6B" />
                    <Text style={styles.menuItemText}>Bad response</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem} onPress={handleRegenerateResponse}>
                    <Ionicons name="refresh" size={20} color="#F59E0B" />
                    <Text style={styles.menuItemText}>Regenerate response</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
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
    flexDirection: 'column',
    marginVertical: 6,
    // alignItems removed for stretch
  },
  userMessageContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
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
  candidatePhotos: {
    marginBottom: 12,
  },
  primaryPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: COLORS.backgroundGray,
  },
  additionalPhotos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  additionalPhoto: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.backgroundGray,
  },
  morePhotosIndicator: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  morePhotosText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
    marginTop: 8,
    flexDirection: 'column',
    width: '100%',
    alignItems: 'flex-start',
    gap: 6,
  },
  quickReplyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
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

  // Quick Reply Styles - Subtle border style without solid background
  quickRepliesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 0,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  quickReplyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  // Long Press Menu Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  longPressMenu: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
});