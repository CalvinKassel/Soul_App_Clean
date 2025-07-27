// src/screens/matches/MatchChatScreen.js
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
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import the cotton candy gradient color theme
import { COLORS, GRADIENTS } from '../../styles/globalStyles';
import MiniSoulChat from '../../components/MiniSoulChat';
import { SparklesIcon } from '../../components/icons/SVGIcons';
import { useScreenMoodGradient } from '../../hooks/useMoodGradient';
import MoodAnalysisService from '../../services/MoodAnalysisService';
import { CompactMoodIndicator } from '../../components/MoodIndicator';

export default function MatchChatScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const moodGradient = useScreenMoodGradient('chat');
  const match = route?.params?.match || { 
    id: 'match1',
    name: 'Emma',
    personalityType: 'ENFP-A',
    age: '24',
    location: 'New York, NY',
    photo: 'https://i.pravatar.cc/400?img=44',
    interests: ['Art', 'Travel', 'Philosophy'],
    aboutMe: 'Love exploring new places and trying different cuisines. Always up for an adventure and deep conversations.'
  };
  
  const [input, setInput] = useState('');
  const [isAIHelperVisible, setIsAIHelperVisible] = useState(false);

  // Initialize mood analysis service
  useEffect(() => {
    MoodAnalysisService.initialize();
  }, []);
  const [messages, setMessages] = useState([
    { 
      id: '1', 
      from: 'match', 
      text: `Hey! Really excited to chat with you 😊`,
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    { 
      id: '2', 
      from: 'user', 
      text: `Hi ${match.name}! Great to meet you!`,
      timestamp: new Date(Date.now() - 3000000).toISOString()
    },
    {
      id: '3',
      from: 'match',
      text: `I saw we both love travel! What's the most amazing place you've been to recently?`,
      timestamp: new Date(Date.now() - 2400000).toISOString()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  const flatListRef = useRef(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;

  // Simulate match typing and responses
  useEffect(() => {
    if (isTyping) {
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
  }, [isTyping]);

  // Send message function - no automatic responses
  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: 'user_' + Date.now(),
      from: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    const messageText = input.trim();
    setInput('');

    // Analyze mood and update gradient
    try {
      const moodAnalysis = await MoodAnalysisService.analyzeMood(messageText, {
        matchName: match.name,
        isFirstMessage: messages.length === 0,
        conversationLength: messages.length
      });
      
      if (moodAnalysis.primaryMood && moodAnalysis.primaryMood.confidence > 0.5) {
        moodGradient.updateMood(moodAnalysis.primaryMood.mood, moodAnalysis.primaryMood.confidence);
      }
    } catch (error) {
      console.error('Error analyzing mood:', error);
    }

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // No automatic responses - this is a one-way chat for now
  }, [input, match.name, messages.length, moodGradient]);

  // Handle AI Helper message send
  const handleAIHelperSend = useCallback((message) => {
    const userMessage = {
      id: 'user_' + Date.now(),
      from: 'user',
      text: message,
      timestamp: new Date().toISOString()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);


  // Get the last received message for AI Helper context
  const getLastReceivedMessage = useCallback(() => {
    const lastMatchMessage = messages.filter(msg => msg.from === 'match').pop();
    return lastMatchMessage?.text || '';
  }, [messages]);

  // Render individual message - NO AVATARS like SoulChatScreen
  const renderMessage = ({ item }) => {
    const isUser = item.from === 'user';
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.matchMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.matchBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.matchText
          ]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  // Render typing indicator - IDENTICAL to SoulChatScreen thinking indicator
  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={styles.typingContainer}>
        <Image 
          source={{ uri: match.photo }} 
          style={styles.matchAvatar}
        />
        <View style={styles.typingBubble}>
          <Animated.View style={styles.typingDots}>
            <Animated.Text
              style={[
                styles.typingDot,
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
                styles.typingDot,
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
                styles.typingDot,
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
          <Text style={styles.typingText}>{match.name} is typing...</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with cotton candy gradient like SoulChatScreen */}
      <View style={styles.headerShadow}>
        <LinearGradient
          colors={GRADIENTS.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={28} color={COLORS.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => navigation?.navigate?.('MatchProfile', { match })}
              style={styles.headerTouchable}
            >
              <Text style={styles.soulHeading}>{match.name}</Text>
            </TouchableOpacity>
          </View>
          
        </LinearGradient>
      </View>

      {/* Chat Container - Improved layout */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <Animated.View style={[styles.messagesContainer, moodGradient.getAnimatedGradientStyle()]}>
          <LinearGradient
            colors={moodGradient.currentGradient.colors}
            style={styles.gradientBackground}
            start={moodGradient.currentGradient.start}
            end={moodGradient.currentGradient.end}
            locations={moodGradient.currentGradient.locations}
          />
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
        </Animated.View>

        {/* Input container - Fixed positioning */}
        <View style={styles.inputContainer}>
          <View style={styles.inputPill}>
            <TouchableOpacity 
              onPress={() => setIsAIHelperVisible(true)}
              style={styles.aiHelperButton}
            >
              <SparklesIcon size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TextInput
              style={[styles.input, styles.inputFont]}
              value={input}
              onChangeText={setInput}
              placeholder={`Message ${match.name}...`}
              placeholderTextColor={COLORS.textPlaceholder}
              multiline
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
              includeFontPadding={false}
              textAlignVertical="center"
            />
            <TouchableOpacity
              onPress={handleSend}
              style={[
                styles.sendButton, 
                !input.trim() && styles.disabledButton
              ]}
              disabled={!input.trim()}
            >
              <Ionicons name="send" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Mini Soul Chat Overlay */}
        <MiniSoulChat
          visible={isAIHelperVisible}
          onClose={() => setIsAIHelperVisible(false)}
          matchName={match.name}
          lastReceivedMessage={getLastReceivedMessage()}
          conversationHistory={messages}
        />

      </KeyboardAvoidingView>

      {/* Bottom toolbar - Full width gradient */}
      <LinearGradient
        colors={GRADIENTS.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.toolbarContainer, { paddingBottom: insets.bottom }]}
      >
        <View style={styles.toolbar}>
          <TouchableOpacity 
            style={styles.toolbarIcon}
            onPress={() => navigation?.navigate?.('SoulChatScreen')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="chatbubbles" size={24} color="rgba(255, 255, 255, 0.6)" />
            </View>
          </TouchableOpacity>
          {/* Discovery heart tab removed - matches will be sent as chat messages instead
          <TouchableOpacity 
            style={styles.toolbarIcon}
            onPress={() => navigation?.navigate?.('DiscoveryScreen')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="heart" size={24} color="rgba(255, 255, 255, 0.6)" />
            </View>
          </TouchableOpacity>
          */}
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

// Enhanced styles matching SoulChatScreen with cotton candy gradient
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
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTouchable: {
    padding: 4,
  },
  soulHeading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A90E2',
    letterSpacing: 1
  },

  // Chat Container
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
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
  matchMessageContainer: {
    justifyContent: 'flex-start',
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
  matchBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Slight transparency for depth
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: COLORS.textWhite,
    fontWeight: '500',
  },
  matchText: {
    color: COLORS.textPrimary,
    fontWeight: '400',
  },

  // Input Styles - Fixed layout
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#e8bef3',
    paddingLeft: 8,
    paddingRight: 4,
    paddingVertical: 4,
    shadowColor: '#cbbaf1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  aiHelperButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 8,
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
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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

  // Typing Indicator Styles
  typingContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  matchAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  typingBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  typingDot: {
    fontSize: 12,
    color: COLORS.primary,
    marginHorizontal: 1,
  },
  typingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },

});