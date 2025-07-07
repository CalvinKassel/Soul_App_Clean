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

// ✅ FIXED IMPORTS - Updated to correct paths
import { createSoulAIOrchestrator, AIResponseType } from '../../services/SoulAIOrchestrator';
import { VirtueProfile } from '../../models/VirtueProfile';
import { CompatibilityEngine } from '../../services/CompatibilityEngine';

// Import the knowledge base (you'll need to create this from your 16personalities data)
// import personalityKnowledgeBase from '../../data/16personalities_knowledge_base.json';

export default function SoulChatScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [soulAI, setSoulAI] = useState(null);
  
  // Enhanced user state with virtue profile and personality assessment
  const [currentUser, setCurrentUser] = useState({
    id: 'user123',
    name: 'You',
    age: '25',
    location: 'New York, NY',
    personalityType: null, // Will be set after personality test
    virtueProfile: null, // Will be created automatically
    interests: [],
    photos: [],
    aboutMe: '',
    hasCompletedPersonalityTest: false
  });

  const flatListRef = useRef(null);

  // Initialize Soul AI on component mount
  useEffect(() => {
    initializeSoulAI();
  }, []);

  const initializeSoulAI = async () => {
    try {
      // Create a mock knowledge base if the import fails
      const knowledgeBase = {};
      const orchestrator = createSoulAIOrchestrator(currentUser, knowledgeBase);
      setSoulAI(orchestrator);

      // Check if user has completed personality assessment
      if (!currentUser.personalityType || !currentUser.hasCompletedPersonalityTest) {
        // Welcome message with personality test invitation
        const welcomeMessage = {
          id: Date.now().toString(),
          from: 'ai',
          text: `Hi ${currentUser.name}! I'm Soul AI, your attuned companion on this journey of meaningful connection. To help you find the most compatible matches, I'd love to understand your personality better. Would you like to take a quick personality assessment? It only takes a few minutes and will help me give you much better guidance.`,
          type: AIResponseType.TEXT,
          timestamp: new Date(),
          metadata: {
            suggestPersonalityTest: true
          }
        };
        setMessages([welcomeMessage]);
      } else {
        // Regular greeting for returning users
        const greeting = {
          id: Date.now().toString(),
          from: 'ai',
          text: `Welcome back! I'm here to help you navigate meaningful connections. What's on your mind today?`,
          type: AIResponseType.TEXT,
          timestamp: new Date()
        };
        setMessages([greeting]);
      }
    } catch (error) {
      console.error('Error initializing Soul AI:', error);
      // Fallback message if initialization fails
      const fallbackMessage = {
        id: Date.now().toString(),
        from: 'ai',
        text: `Hi! I'm Soul AI. I'm here to help you on your journey of meaningful connection. What would you like to talk about?`,
        type: AIResponseType.TEXT,
        timestamp: new Date()
      };
      setMessages([fallbackMessage]);
    }
  };

  // Handle sending messages
  const handleSend = async () => {
    if (!input.trim() || !soulAI) return;

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
      // Process message through Soul AI
      const response = await soulAI.processMessage(input.trim());
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        from: 'ai',
        text: response.text,
        type: response.type,
        timestamp: new Date(),
        metadata: response.metadata
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        from: 'ai',
        text: "I'm having trouble processing that right now. Could you try rephrasing what you're thinking about?",
        type: AIResponseType.TEXT,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAIThinking(false);
    }
  };

  // Handle personality test navigation
  const handlePersonalityTest = () => {
    navigation.navigate('PersonalityAssessment', {
      onComplete: (personalityResult) => {
        setCurrentUser(prev => ({
          ...prev,
          personalityType: personalityResult.type,
          hasCompletedPersonalityTest: true
        }));
        
        // Add a message about completed assessment
        const completionMessage = {
          id: Date.now().toString(),
          from: 'ai',
          text: `Wonderful! I now understand that you're a ${personalityResult.type}. This helps me provide much better guidance. What would you like to explore about relationships and connections?`,
          type: AIResponseType.SELF_DISCOVERY,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, completionMessage]);
      }
    });
  };

  // Handle feedback on AI responses
  const handleFeedback = (messageId, feedback) => {
    // You can implement feedback tracking here
    console.log('Feedback received:', messageId, feedback);
  };

  // Navigate to matches
  const handleViewMatches = () => {
    navigation.navigate('MatchesStack');
  };

  // Navigate to profile
  const handleViewProfile = () => {
    navigation.navigate('ProfileScreen');
  };

  // Render message bubbles
  const renderMessage = ({ item }) => {
    const isUser = item.from === 'user';
    const isSpecialCard = item.type && item.type !== AIResponseType.TEXT;

    if (isSpecialCard) {
      return renderSpecialCard(item);
    }

    return (
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {isUser ? (
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.userBubble}
          >
            <Text style={[styles.bubbleText, styles.userText]}>{item.text}</Text>
          </LinearGradient>
        ) : (
          <Text style={[styles.bubbleText, styles.aiText]}>{item.text}</Text>
        )}
        
        {item.metadata?.suggestPersonalityTest && (
          <TouchableOpacity 
            style={styles.personalityTestButton}
            onPress={handlePersonalityTest}
          >
            <Text style={styles.personalityTestButtonText}>Take Personality Assessment</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render special AI response cards
  const renderSpecialCard = (item) => {
    let cardStyle = styles.specialCardContainer;
    let cardHeader = '';

    switch (item.type) {
      case AIResponseType.ETHICAL_INTERVENTION:
        cardStyle = [styles.specialCardContainer, styles.ethicalCard];
        cardHeader = 'Gentle Reminder';
        break;
      case AIResponseType.MATCH_SUGGESTION:
        cardStyle = [styles.specialCardContainer, styles.matchCard];
        cardHeader = 'Match Suggestion';
        break;
      case AIResponseType.SELF_DISCOVERY:
        cardStyle = [styles.specialCardContainer, styles.discoveryCard];
        cardHeader = 'Self Discovery';
        break;
      case AIResponseType.CONVERSATION_COACH:
        cardStyle = [styles.specialCardContainer, styles.coachCard];
        cardHeader = 'Conversation Coach';
        break;
      default:
        cardHeader = 'Insight';
    }

    return (
      <View style={cardStyle}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{cardHeader}</Text>
        </View>
        <Text style={styles.cardMessage}>{item.text}</Text>
        
        {item.type === AIResponseType.AUTHENTICITY_FEEDBACK && (
          <View style={styles.feedbackButtons}>
            <TouchableOpacity 
              style={[styles.feedbackButton, styles.confirmButton]}
              onPress={() => handleFeedback(item.id, 'confirm')}
            >
              <Text style={styles.confirmButtonText}>That's right!</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.feedbackButton, styles.clarifyButton]}
              onPress={() => handleFeedback(item.id, 'clarify')}
            >
              <Text style={styles.clarifyButtonText}>Let me clarify</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.metadata?.conversationStarters && (
          <View style={styles.startersContainer}>
            <Text style={styles.startersTitle}>Conversation Starters:</Text>
            {item.metadata.conversationStarters.slice(0, 3).map((starter, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.starterButton}
                onPress={() => setInput(starter)}
              >
                <Text style={styles.starterText}>"{starter}"</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Render typing indicator
  const renderTypingIndicator = () => {
    if (!isAIThinking) return null;

    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <Text style={styles.typingText}>Soul AI is thinking</Text>
          <View style={styles.typingDots}>
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Text style={styles.soulHeading}>Soul</Text>
        </View>

        {/* Messages */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messageList}
            style={{ backgroundColor: 'transparent' }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListFooterComponent={renderTypingIndicator}
          />

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <View style={styles.inputPill}>
              <TextInput
                style={[styles.input, styles.inputFont]}
                value={input}
                onChangeText={setInput}
                placeholder="Share what you're thinking..."
                placeholderTextColor="#9b59b6"
                multiline
                returnKeyType="send"
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
              />
              <TouchableOpacity 
                style={[styles.sendButton, !input.trim() && styles.disabledButton]}
                onPress={handleSend}
                disabled={!input.trim()}
              >
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Bottom Toolbar */}
        <View style={styles.toolbarContainer}>
          <View style={[styles.toolbar, { paddingBottom: insets.bottom }]}>
            <TouchableOpacity style={styles.toolbarIcon} onPress={handleViewMatches}>
              <View style={[styles.iconContainer]}>
                <Ionicons name="people" size={24} color="#4A2C6D" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.toolbarIcon}>
              <View style={[styles.iconContainer, styles.activeIcon]}>
                <Ionicons name="chatbubbles" size={24} color="white" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.toolbarIcon} onPress={handleViewProfile}>
              <View style={[styles.iconContainer]}>
                <Ionicons name="person" size={24} color="#4A2C6D" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 44, 109, 0.1)',
  },
  soulHeading: {
    fontSize: 31,
    fontWeight: 'bold',
    color: '#4A2C6D',
    letterSpacing: 1,
  },
  messageList: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    marginRight: 40,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: undefined,
    marginRight: 0,
    borderBottomRightRadius: 4,
  },
  
  // Personality test button
  personalityTestButton: {
    backgroundColor: '#9b59b6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  personalityTestButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Specialized card styles
  specialCardContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    maxWidth: '90%',
    alignSelf: 'flex-start',
    marginBottom: 12,
    marginRight: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#9b59b6',
  },
  ethicalCard: {
    borderLeftColor: '#f39c12',
    backgroundColor: '#fef9e7',
  },
  matchCard: {
    borderLeftColor: '#e74c3c',
  },
  discoveryCard: {
    borderLeftColor: '#3498db',
  },
  coachCard: {
    borderLeftColor: '#27ae60',
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  cardMessage: {
    fontSize: 16,
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
    backgroundColor: '#9b59b6',
    marginHorizontal: 1,
  },
  
  // Input area
  inputContainer: {
    padding: 12,
    alignItems: 'center',
  },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 30,
    paddingHorizontal: 4,
    paddingVertical: 4,
    width: '96%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 0,
    marginRight: 8,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  sendButton: {
    backgroundColor: '#5A9BD4',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 0,
  },
  disabledButton: {
    backgroundColor: '#90caf9',
  },
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
  bubbleText: {
    fontSize: 16,
  },
  aiText: {
    color: '#03045E',
  },
  userText: {
    color: 'white',
  },
  inputFont: {
    fontSize: 16,
    color: '#03045E',
  },
});