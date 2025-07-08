import React, { useState, useRef, useEffect } from 'react';
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
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

// Import our enhanced Soul AI system components
import { createSoulAIOrchestrator, AIResponseType } from '../services/SoulAIOrchestrator';
import { VirtueProfile } from '../models/VirtueProfile';
import { CompatibilityEngine } from '../services/CompatibilityEngine';

// Import the knowledge base (you'll need to create this from your 16personalities data)
import personalityKnowledgeBase from '../data/16personalities_knowledge_base.json';

export default function SoulChatScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [soulAI, setSoulAI] = useState(null);
  
  // Enhanced user state with virtue profile
  const [currentUser, setCurrentUser] = useState({
    id: 'user123',
    name: 'You',
    age: '25',
    location: 'New York, NY',
    personalityType: null, // Will be determined through conversation
    virtueProfile: new VirtueProfile('user123'),
    interests: [],
    photos: [],
    aboutMe: ''
  });

  const flatListRef = useRef(null);

  // Initialize Soul AI on component mount
  useEffect(() => {
    initializeSoulAI();
  }, []);

  const initializeSoulAI = async () => {
    try {
      const orchestrator = createSoulAIOrchestrator(currentUser, personalityKnowledgeBase);
      setSoulAI(orchestrator);

      // Welcome message - AI will learn personality through conversation
      const welcomeMessage = {
        id: Date.now().toString(),
        from: 'ai',
        text: `Hi ${currentUser.name}! I'm Soul AI, your attuned companion on this journey of meaningful connection. I'm here to help you discover compatible matches by understanding who you truly are. What brings you joy in life?`,
        type: AIResponseType.TEXT,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error initializing Soul AI:', error);
    }
  };

  // Handle sending messages
  const handleSend = async () => {
    if (!input.trim() || isAIThinking) return;

    const userMessage = {
      id: Date.now().toString(),
      from: 'user',
      text: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsAIThinking(true);

    try {
      if (soulAI) {
        // Process message through Soul AI
        const response = await soulAI.processUserMessage(userMessage.text);
        
        setTimeout(() => {
          setIsAIThinking(false);
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            from: 'ai',
            text: response.message,
            type: response.type,
            timestamp: new Date(),
            metadata: response.metadata
          }]);
          
          // Update user profile with any learned insights
          setCurrentUser(prev => ({
            ...prev,
            virtueProfile: soulAI.virtueProfile,
            personalityType: soulAI.personalityDetector?.getMostLikelyType()
          }));
        }, 1500);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      setIsAIThinking(false);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        from: 'ai',
        text: "I'm having a moment of reflection. Could you share that again?",
        type: AIResponseType.TEXT,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Handle swipe gestures
  const onSwipeGesture = (event) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      
      if (translationX > 50) {
        // Swipe right to ProfileScreen
        navigation?.navigate?.('ProfileScreen');
      } else if (translationX < -50) {
        // Swipe left to MatchesStack
        navigation?.navigate?.('MatchesStack');
      }
    }
  };

  // Render different message types
  const renderMessage = ({ item: message }) => {
    if (message.from === 'user') {
      return (
        <View style={styles.messageContainer}>
          <View style={[styles.bubble, styles.userBubble]}>
            <Text style={[styles.bubbleText, styles.userText]}>{message.text}</Text>
          </View>
        </View>
      );
    }

    // AI messages with different types
    switch (message.type) {
      case AIResponseType.AUTHENTICITY_FEEDBACK:
        return (
          <AuthenticityFeedbackCard 
            message={message}
            onFeedback={handleFeedback}
          />
        );
      
      case AIResponseType.MATCH_SUGGESTION:
        return (
          <MatchSuggestionCard 
            message={message}
            navigation={navigation}
          />
        );
      
      case AIResponseType.SELF_DISCOVERY:
        return (
          <SelfDiscoveryCard message={message} />
        );
      
      case AIResponseType.CONVERSATION_COACH:
        return (
          <ConversationCoachCard message={message} />
        );
      
      default:
        return (
          <AITextMessage message={message} />
        );
    }
  };

  // Render typing indicator
  const renderTypingIndicator = () => (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <Text style={styles.typingText}>Soul AI is reflecting</Text>
        <View style={styles.typingDots}>
          {[0, 1, 2].map((index) => (
            <View key={index} style={styles.typingDot} />
          ))}
        </View>
      </View>
    </View>
  );

  // Handle feedback for virtue detection
  const handleFeedback = (isCorrect, detectedVirtue) => {
    if (soulAI && detectedVirtue) {
      const adjustment = isCorrect ? 0.2 : -0.1;
      soulAI.virtueProfile.updateVirtueScore(
        detectedVirtue,
        adjustment,
        'user_feedback',
        isCorrect ? 'User confirmed virtue detection' : 'User corrected virtue detection'
      );

      const followUpText = isCorrect 
        ? "Perfect! Thanks for confirming. This helps me understand you better."
        : "Thanks for the correction! Could you help me understand what feels more accurate to you?";
      
      const followUpMessage = {
        id: Date.now().toString(),
        from: 'ai',
        text: followUpText,
        type: AIResponseType.TEXT,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, followUpMessage]);
      
      setCurrentUser(prev => ({
        ...prev,
        virtueProfile: soulAI.virtueProfile
      }));
    }
  };

  const keyboardVerticalOffset = Platform.select({
    ios: insets.top,
    android: 0
  });

  return (
    <PanGestureHandler 
      onGestureEvent={onSwipeGesture}
      activeOffsetX={[-30, 30]}
      failOffsetY={[-50, 50]}
    >
      <SafeAreaView style={styles.container}>
        {/* Header - WHITE BACKGROUND */}
        <View style={styles.headerShadow}>
          <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <Text style={styles.soulHeading}>Soul</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          {/* Main content area with ORIGINAL cotton candy gradient background */}
          <LinearGradient
            colors={['#cbbaf1', '#cbbaf1', '#e8bef3', '#B8E6FF', '#9eb7ec']}
            locations={[0, 0.25, 0.5, 0.75, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.contentContainer}
          >
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.messageList}
              showsVerticalScrollIndicator={false}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
              keyboardShouldPersistTaps="handled"
              scrollEnabled={true}
              ListFooterComponent={isAIThinking ? renderTypingIndicator : null}
            />

            {/* Input container */}
            <View style={styles.inputContainer}>
              <View style={styles.inputPill}>
                <TextInput
                  style={[styles.input, styles.inputFont]}
                  value={input}
                  onChangeText={setInput}
                  placeholder="Tell me what's on your mind..."
                  placeholderTextColor="#5A9BD4"
                  multiline
                  returnKeyType="send"
                  onSubmitEditing={handleSend}
                  blurOnSubmit={false}
                  includeFontPadding={false}
                  textAlignVertical="center"
                />
                <TouchableOpacity
                  onPress={handleSend}
                  style={[styles.sendButton, !input.trim() && styles.disabledButton]}
                  disabled={!input.trim() || isAIThinking}
                >
                  <Ionicons name="send" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </KeyboardAvoidingView>

        {/* Bottom toolbar - CORRECT ACTIVE STATE */}
        <View style={[styles.toolbarContainer, { paddingBottom: insets.bottom }]}>
          <View style={styles.toolbar}>
            <TouchableOpacity style={styles.toolbarIcon}>
              <View style={[styles.iconContainer, styles.activeIcon]}>
                <Image 
                  source={require('../../../assets/icons/soulchat-active.png')}
                  style={{ width: 38, height: 38 }}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toolbarIcon}
              onPress={() => navigation?.navigate?.('MatchesStack')}
            >
              <View style={styles.iconContainer}>
                <Image 
                  source={require('../../../assets/icons/list.png')}
                  style={{ width: 38, height: 38 }}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toolbarIcon}
              onPress={() => navigation?.navigate?.('ProfileScreen')}
            >
              <View style={styles.iconContainer}>
                <Image 
                  source={require('../../../assets/icons/profile.png')}
                  style={{ width: 38, height: 38 }}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </PanGestureHandler>
  );
}

// Enhanced specialized message cards

const AITextMessage = ({ message }) => (
  <View style={[styles.bubble, styles.aiBubble]}>
    <Text style={[styles.bubbleText, styles.aiText]}>{message.text}</Text>
  </View>
);

const AuthenticityFeedbackCard = ({ message, onFeedback }) => (
  <View style={styles.specialCardContainer}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>✨ Value Check</Text>
    </View>
    <Text style={styles.cardMessage}>{message.text}</Text>
    <View style={styles.feedbackButtons}>
      <TouchableOpacity 
        style={[styles.feedbackButton, styles.confirmButton]}
        onPress={() => onFeedback(true, message.metadata?.detectedVirtue)}
      >
        <Text style={styles.confirmButtonText}>Spot on! ✓</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.feedbackButton, styles.clarifyButton]}
        onPress={() => onFeedback(false, message.metadata?.detectedVirtue)}
      >
        <Text style={styles.clarifyButtonText}>Let me clarify</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const EthicalInterventionCard = ({ message }) => (
  <View style={[styles.specialCardContainer, styles.ethicalCard]}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>💚 Gentle Reminder</Text>
    </View>
    <Text style={styles.cardMessage}>{message.text}</Text>
  </View>
);

const MatchSuggestionCard = ({ message, navigation }) => {
  const { suggestedMatch, compatibilityData } = message.metadata || {};
  
  return (
    <View style={[styles.specialCardContainer, styles.matchCard]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>🎯 Match Insight</Text>
      </View>
      <Text style={styles.cardMessage}>{message.text}</Text>
      
      {suggestedMatch && (
        <View style={styles.matchDetails}>
          <Text style={styles.matchName}>{suggestedMatch.name}</Text>
          <Text style={styles.matchType}>{suggestedMatch.personalityType}</Text>
          {compatibilityData && (
            <Text style={styles.compatibilityScore}>
              {compatibilityData.score}% Compatibility ({compatibilityData.rating})
            </Text>
          )}
        </View>
      )}
      
      <View style={styles.matchActions}>
        <TouchableOpacity 
          style={styles.matchActionButton}
          onPress={() => navigation?.navigate?.('MatchesStack', {
            screen: 'MatchChat',
            params: { match: suggestedMatch }
          })}
        >
          <Text style={styles.matchActionText}>Start chatting</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.matchActionButton}
          onPress={() => navigation?.navigate?.('MatchesStack', {
            screen: 'MatchProfile', 
            params: { match: suggestedMatch }
          })}
        >
          <Text style={styles.matchActionText}>View profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SelfDiscoveryCard = ({ message }) => (
  <View style={[styles.specialCardContainer, styles.discoveryCard]}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>🌟 Self-Discovery</Text>
    </View>
    <Text style={styles.cardMessage}>{message.text}</Text>
  </View>
);

const ConversationCoachCard = ({ message }) => {
  const { conversationStarters } = message.metadata || {};
  
  return (
    <View style={[styles.specialCardContainer, styles.coachCard]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>💬 Conversation Coach</Text>
      </View>
      <Text style={styles.cardMessage}>{message.text}</Text>
      
      {conversationStarters && conversationStarters.length > 0 && (
        <View style={styles.startersContainer}>
          <Text style={styles.startersTitle}>Here are some ideas:</Text>
          {conversationStarters.slice(0, 2).map((starter, index) => (
            <TouchableOpacity key={index} style={styles.starterButton}>
              <Text style={styles.starterText}>"{starter}"</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// Styles - RESTORED ORIGINAL STYLING
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFF',
  },
  contentContainer: {
    flex: 1,
  },
  headerShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: '#FFFFFF', // WHITE background
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // WHITE background
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  soulHeading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0077B6',
    letterSpacing: 1
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#0077B6',
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
    marginBottom: 12,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: 'white',
  },
  aiText: {
    color: '#2c3e50',
  },
  
  // Input styles
  inputContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    color: '#2c3e50',
    fontSize: 16,
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
  },
  inputFont: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0077B6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  
  // Toolbar styles
  toolbarContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  toolbarIcon: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  activeIcon: {
    backgroundColor: '#5A9BD4',
  },
  
  // Special card styles
  specialCardContainer: {
    backgroundColor: 'white',
    marginBottom: 16,
    marginHorizontal: 4,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: 'flex-start',
    maxWidth: '90%',
  },
  discoveryCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  matchCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  coachCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  ethicalCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  cardMessage: {
    fontSize: 15,
    lineHeight: 22,
    color: '#2c3e50',
    marginBottom: 16,
  },
  
  // Feedback buttons
  feedbackButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  feedbackButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#27ae60',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  clarifyButton: {
    backgroundColor: '#ecf0f1',
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  clarifyButtonText: {
    color: '#2c3e50',
    fontWeight: '600',
  },
  
  // Match suggestion styles
  matchDetails: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  matchType: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  compatibilityScore: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '600',
    marginTop: 4,
  },
  matchActions: {
    flexDirection: 'row',
    gap: 12,
  },
  matchActionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9b59b6',
    alignItems: 'center',
  },
  matchActionText: {
    color: '#9b59b6',
    fontWeight: '600',
  },
  
  // Conversation starters
  startersContainer: {
    marginTop: 8,
  },
  startersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  starterButton: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#27ae60',
  },
  starterText: {
    fontSize: 14,
    color: '#2c3e50',
    fontStyle: 'italic',
  },
  
  // Typing indicator
  typingContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  typingBubble: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typingText: {
    color: '#7f8c8d',
    fontSize: 14,
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#bdc3c7',
    marginHorizontal: 1,
  },
});