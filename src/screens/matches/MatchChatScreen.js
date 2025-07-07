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

// ✅ FIXED IMPORTS - Updated to correct paths
import { CompatibilityEngine } from '../../services/CompatibilityEngine';
import { createSoulAIOrchestrator } from '../../services/SoulAIOrchestrator';

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
    { id: '2', from: 'user', text: `Hi ${match.name}! Nice to meet you` },
    { id: '3', from: 'match', text: `Likewise! I saw you're into philosophy - that's so cool. What got you interested in it?` }
  ]);

  const flatListRef = useRef(null);
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 85 : 0;

  // Initialize AI assistance and compatibility analysis
  useEffect(() => {
    initializeAIAssistance();
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const initializeAIAssistance = async () => {
    try {
      // Create mock user data for compatibility analysis
      const currentUser = {
        id: 'user123',
        name: 'You',
        personalityType: 'INFJ-A', // Mock user type
        virtueProfile: {
          getTopVirtues: () => [
            { virtue: 'WISDOM', customTerm: 'depth' },
            { virtue: 'HUMANITY', customTerm: 'authenticity' }
          ]
        }
      };

      // Initialize compatibility engine if available
      try {
        const engine = new CompatibilityEngine({});
        const compatibility = engine.calculateCompatibility(currentUser, match);
        setCompatibilityData(compatibility);
      } catch (error) {
        console.log('Compatibility engine not available');
      }

      // Initialize Soul AI orchestrator for conversation assistance
      try {
        const orchestrator = createSoulAIOrchestrator(currentUser, {});
        
        // Generate initial conversation suggestions
        const suggestions = [
          "What's been the highlight of your week?",
          "I'm curious about your travel experiences - any favorites?",
          "What kind of art speaks to you most?",
          "How do you usually approach deep conversations?"
        ];
        setAiSuggestions(suggestions);
      } catch (error) {
        console.log('Soul AI orchestrator not available');
      }
    } catch (error) {
      console.error('Error initializing AI assistance:', error);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      from: 'user',
      text: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setShowAIAssist(false);

    // Simulate match response (in real app, this would be actual message sending)
    setTimeout(() => {
      const responses = [
        "That's really interesting! Tell me more about that.",
        "I love that perspective! It reminds me of something similar I experienced.",
        "Wow, I hadn't thought about it that way before.",
        "That's exactly what I was hoping to hear about!"
      ];
      
      const response = {
        id: (Date.now() + 1).toString(),
        from: 'match',
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, response]);
    }, 1500);
  };

  const handleSoulAssist = () => {
    setShowAIAssist(!showAIAssist);
    if (!showAIAssist) {
      // Refresh AI suggestions when opening
      const newSuggestions = [
        "What's something you're passionate about lately?",
        "If you could have dinner with anyone, who would it be?",
        "What's a book or movie that changed your perspective?",
        "What does a perfect weekend look like for you?"
      ];
      setAiSuggestions(newSuggestions);
    }
  };

  const handleSuggestionPress = (suggestion) => {
    setInput(suggestion);
    setShowAIAssist(false);
  };

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

  const renderAISuggestions = () => {
    if (!showAIAssist) return null;

    return (
      <View style={styles.aiSuggestionsOverlay}>
        <View style={styles.aiSuggestionsContainer}>
          <View style={styles.aiSuggestionsHeader}>
            <Text style={styles.aiSuggestionsTitle}>Soul AI Suggestions</Text>
            {compatibilityData && (
              <Text style={styles.compatibilityHint}>
                💜 {compatibilityData.rating} compatibility
              </Text>
            )}
          </View>
          
          <View style={styles.suggestionsGrid}>
            {aiSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionButton}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.closeSuggestionsButton}
            onPress={() => setShowAIAssist(false)}
          >
            <Text style={styles.closeSuggestionsText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground 
      source={{ uri: match.photos[0] }} 
      style={styles.container}
      blurRadius={20}
    >
      <LinearGradient
        colors={['rgba(102, 126, 234, 0.9)', 'rgba(118, 75, 162, 0.9)']}
        style={styles.overlay}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.matchInfo}
              onPress={() => navigation.navigate('MatchProfile', { match })}
            >
              <Text style={styles.matchName}>{match.name}</Text>
              <Text style={styles.matchDetails}>{match.age} • {match.location}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="videocam" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={keyboardVerticalOffset}
          >
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item.id}
              contentContainerStyle={{
                flexGrow: 1,
                padding: 16,
                paddingTop: 8,
                paddingBottom: 8,
              }}
              style={{ backgroundColor: 'transparent' }}
              showsVerticalScrollIndicator={false}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
              keyboardShouldPersistTaps="handled"
            />

            {/* AI Suggestions Overlay */}
            {renderAISuggestions()}

            {/* Input container with enhanced Soul AI button */}
            <View style={{
              padding: 12,
              alignItems: 'center',
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 30,
                paddingHorizontal: 4,
                paddingVertical: 4,
                width: '96%',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 5,
              }}>
                <TouchableOpacity
                  onPress={handleSoulAssist}
                  style={{
                    backgroundColor: showAIAssist ? '#9b59b6' : 'rgba(248, 251, 255, 0.9)',
                    borderRadius: 20,
                    padding: 8,
                    marginRight: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons 
                    name="sparkles" 
                    size={22} 
                    color={showAIAssist ? 'white' : '#4A2C6D'} 
                  />
                </TouchableOpacity>
                
                <TextInput
                  style={{
                    flex: 1,
                    minHeight: 40,
                    maxHeight: 120,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    backgroundColor: 'transparent',
                    borderRadius: 0,
                    fontSize: 16,
                    color: '#4A2C6D',
                    borderWidth: 0,
                    marginRight: 8,
                    includeFontPadding: false,
                    textAlignVertical: 'center',
                  }}
                  value={input}
                  onChangeText={setInput}
                  placeholder={`Message ${match.name}...`}
                  placeholderTextColor="#4A2C6D"
                  multiline
                  returnKeyType="send"
                  onSubmitEditing={handleSend}
                  blurOnSubmit={false}
                />
                
                <TouchableOpacity 
                  style={{
                    backgroundColor: !input.trim() ? '#90caf9' : '#5A9BD4',
                    borderRadius: 22,
                    width: 44,
                    height: 44,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 0,
                  }}
                  onPress={handleSend}
                  disabled={!input.trim()}
                >
                  <Ionicons name="send" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButton: {
    padding: 4,
  },
  matchInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  matchDetails: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerButton: {
    padding: 4,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  matchMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#9b59b6',
    borderBottomRightRadius: 6,
  },
  matchBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: 'white',
  },
  matchText: {
    color: '#2c3e50',
  },
  
  // AI Suggestions Overlay
  aiSuggestionsOverlay: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    padding: 16,
  },
  aiSuggestionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  aiSuggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiSuggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9b59b6',
  },
  compatibilityHint: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  suggestionsGrid: {
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#9b59b6',
  },
  suggestionText: {
    fontSize: 14,
    color: '#2c3e50',
    fontStyle: 'italic',
  },
  closeSuggestionsButton: {
    backgroundColor: '#ecf0f1',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  closeSuggestionsText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
});