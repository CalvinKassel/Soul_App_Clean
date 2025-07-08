import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  Keyboard,
  LayoutAnimation,
  ImageBackground,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import our AI system for conversation assistance
import { CompatibilityEngine } from '../../lib/services/CompatibilityEngine';
import { createSoulAIOrchestrator } from '../../lib/services/SoulAIOrchestrator';

export default function MatchChatScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const match = route?.params?.match || { 
    id: 'match1',
    name: 'Match',
    personalityType: 'ENFP-A',
    age: '26',
    location: 'New York, NY',
    interests: ['Art', 'Travel', 'Philosophy'],
    aboutMe: 'Love exploring new places and trying different cuisines. Always up for an adventure and deep conversations.',
    photos: [
      'https://i.pravatar.cc/400?img=1',
      'https://i.pravatar.cc/400?img=2'
    ],
    virtueProfile: {
      getTopVirtues: () => [
        { virtue: 'WISDOM', customTerm: 'curiosity' },
        { virtue: 'HUMANITY', customTerm: null }
      ]
    }
  };
  
  const [input, setInput] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [compatibilityData, setCompatibilityData] = useState(null);
  const [messages, setMessages] = useState([
    { id: '1', from: 'match', text: `Hey! Excited to chat with you 😊` },
    { id: '2', from: 'user', text: `Hi ${match.name}! Likewise!` },
    { id: '3', from: 'match', text: `How has your day been?` },
  ]);
  const flatListRef = useRef(null);

  // Mock current user for compatibility analysis
  const currentUser = {
    id: 'user123',
    name: 'You',
    personalityType: 'INFJ-A',
    interests: ['Reading', 'Music', 'Coffee'],
    virtueProfile: {
      getTopVirtues: () => [
        { virtue: 'WISDOM', customTerm: null },
        { virtue: 'AUTHENTICITY', customTerm: null }
      ]
    }
  };

  // Initialize compatibility engine and AI orchestrator
  const compatibilityEngine = new CompatibilityEngine();
  const [soulAI, setSoulAI] = useState(null);

  useEffect(() => {
    // Initialize Soul AI for conversation assistance
    const orchestrator = createSoulAIOrchestrator(currentUser, {});
    setSoulAI(orchestrator);

    // Calculate compatibility with this match
    const compatibility = compatibilityEngine.calculateCompatibility(currentUser, match);
    setCompatibilityData(compatibility);
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Navigate to match profile when name is tapped
  const navigateToMatchProfile = () => {
    navigation.navigate('MatchProfile', { match });
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      from: 'user',
      text: input,
    };
    
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages([...messages, newMessage]);
    setInput('');
    setShowAIAssist(false); // Hide AI assist after sending
    
    Keyboard.dismiss();
    setKeyboardVisible(false);
    
    setTimeout(() => {
      const responses = [
        "That's awesome! 😊",
        "I totally agree!",
        "Tell me more about that!",
        "Sounds great! ✨",
        "I'd love to hear more!",
        "That's so interesting!",
        "I can relate to that!",
        "What a great perspective!"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const matchResponse = {
        id: (Date.now() + 1).toString(),
        from: 'match',
        text: randomResponse,
      };
      setMessages(prev => [...prev, matchResponse]);
    }, 2000);
  };

  const handleSoulAssist = async () => {
    try {
      setShowAIAssist(true);
      
      // Generate conversation suggestions based on compatibility and conversation context
      const contextualSuggestions = await generateAIAssistance();
      setAiSuggestions(contextualSuggestions);

      // If input is empty, suggest a conversation starter
      if (!input.trim()) {
        const suggestion = contextualSuggestions[0] || `Hey ${match.name}, what's been the highlight of your week?`;
        setInput(suggestion);
      } else {
        // Enhance existing message
        const enhancedMessage = await enhanceMessageWithAI(input);
        setInput(enhancedMessage);
      }
    } catch (error) {
      console.error('AI assist error:', error);
      Alert.alert('AI Assist', 'Having trouble generating suggestions. Try again!');
    }
  };

  const generateAIAssistance = async () => {
    const suggestions = [];

    // Add compatibility-based suggestions
    if (compatibilityData) {
      const strongFactors = compatibilityData.factors.filter(f => f.isPositive && f.weightedScore > 15);
      
      if (strongFactors.length > 0) {
        const topFactor = strongFactors[0];
        if (topFactor.factor.includes('Worldview')) {
          suggestions.push(`Since you both ${topFactor.user1Trait === topFactor.user2Trait ? 'see the world similarly' : 'have different perspectives'}, you could ask about their thoughts on ${match.interests[0]?.toLowerCase()}.`);
        }
        if (topFactor.factor.includes('Values')) {
          suggestions.push("Your shared values suggest they'd appreciate a meaningful question about what drives them.");
        }
      }
    }

    // Add personality-specific starters
    const personalityStarters = getPersonalitySpecificStarters(match.personalityType);
    suggestions.push(...personalityStarters.slice(0, 2));

    // Add interest-based suggestions
    if (match.interests && match.interests.length > 0) {
      suggestions.push(`Ask about their passion for ${match.interests[0]} - it seems really important to them.`);
    }

    // Add conversation flow suggestions based on recent messages
    const recentMessages = messages.slice(-3);
    if (recentMessages.some(m => m.text.includes('day'))) {
      suggestions.push("They asked about your day - maybe share something interesting that happened or ask about theirs!");
    }

    return suggestions.slice(0, 4); // Return top 4 suggestions
  };

  const getPersonalitySpecificStarters = (personalityType) => {
    const starters = {
      'ENFP': ["What's something that's been inspiring you lately?", "If you could learn any skill instantly, what would it be?"],
      'INFJ': ["What's a book or idea that changed how you see the world?", "What do you think makes a conversation truly meaningful?"],
      'ESFP': ["What's the most fun thing you've done recently?", "What always makes you smile no matter what?"],
      'INTJ': ["What's a project you're really excited about?", "What's something you've been thinking about a lot lately?"],
      'ISFP': ["What's something beautiful you've noticed recently?", "What's a place that makes you feel most yourself?"],
      'ENTP': ["What's an idea you can't stop thinking about?", "What's the most interesting debate you've had recently?"],
      'ISFJ': ["What's something that's been bringing you joy lately?", "How do you like to spend your ideal weekend?"],
      'ESTJ': ["What's a goal you're working towards?", "What's something you're really proud of accomplishing?"],
    };
    
    return starters[personalityType?.split('-')[0]] || [
      "What's been the best part of your week?",
      "What's something you're passionate about?"
    ];
  };

  const enhanceMessageWithAI = async (message) => {
    // Simple message enhancement - in real app this would use actual AI
    if (message.length < 20) {
      return message + " What are your thoughts on that?";
    }
    return message;
  };

  const renderMessage = ({ item }) => {
    const isUser = item.from === 'user';
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.matchMessageContainer]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.matchBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.matchText]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerShadow}>
        <LinearGradient
          colors={['#F8FBFF', '#F8FBFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={{ padding: 4 }}
          >
            <Ionicons name="chevron-back" size={28} color="#4A2C6D" />
          </TouchableOpacity>
          
          {/* Clickable match name to view profile */}
          <TouchableOpacity 
            onPress={navigateToMatchProfile}
            style={{ flex: 1, marginHorizontal: 16 }}
          >
            <Text style={{
              fontSize: 31,
              fontWeight: 'bold',
              color: '#4A2C6D',
              letterSpacing: 1,
              textAlign: 'center',
            }}>{match.name}</Text>
            <Text style={{
              fontSize: 12,
              color: '#7f8c8d',
              textAlign: 'center',
              marginTop: 2
            }}>Tap to view profile</Text>
            {/* Show compatibility score in header */}
            {compatibilityData && (
              <Text style={{
                fontSize: 11,
                color: '#27ae60',
                textAlign: 'center',
                fontWeight: '600',
                marginTop: 1
              }}>{compatibilityData.score}% Compatible</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{ padding: 4 }}
            onPress={() => setShowAIAssist(!showAIAssist)}
          >
            <Ionicons 
              name={showAIAssist ? "sparkles" : "ellipsis-vertical"} 
              size={24} 
              color={showAIAssist ? "#9b59b6" : "#4A2C6D"} 
            />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* AI Assistance Panel */}
        {showAIAssist && (
          <View style={styles.aiAssistPanel}>
            <Text style={styles.aiAssistTitle}>💫 Soul AI Suggestions</Text>
            {aiSuggestions.map((suggestion, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.suggestionItem}
                onPress={() => {
                  setInput(suggestion);
                  setShowAIAssist(false);
                }}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.generateMoreButton}
              onPress={handleSoulAssist}
            >
              <Text style={styles.generateMoreText}>Generate More Ideas</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input Area */}
        <View style={[styles.inputContainer, keyboardVisible && styles.inputContainerKeyboard]}>
          <View style={styles.inputRow}>
            <TouchableOpacity 
              style={styles.aiButton}
              onPress={handleSoulAssist}
            >
              <Ionicons name="sparkles" size={20} color="#9b59b6" />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder={`Message ${match.name}...`}
              placeholderTextColor="#999"
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!input.trim()}
            >
              <Ionicons name="send" size={20} color={input.trim() ? "#FFFFFF" : "#ccc"} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: '#fff',
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  matchMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
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
  matchBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: 'white',
  },
  matchText: {
    color: '#2c3e50',
  },
  aiAssistPanel: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
    padding: 16,
    maxHeight: 200,
  },
  aiAssistTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9b59b6',
    marginBottom: 12,
  },
  suggestionItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#9b59b6',
  },
  suggestionText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  generateMoreButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  generateMoreText: {
    fontSize: 14,
    color: '#9b59b6',
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputContainerKeyboard: {
    paddingBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  aiButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 100,
    minHeight: 36,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0077B6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#e1e8ed',
  },
});