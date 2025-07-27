// Step-by-step test version of SoulChatScreen
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Test the first potentially problematic import
import { COLORS, GRADIENTS } from '../../styles/globalStyles';

// Test Step 2: Add service imports (most likely culprits)
import ChatGPTService from '../../services/ChatGPTService';
import SoulMatchmakingService from '../../services/SoulMatchmakingService';

// Test Step 3: Add hooks (very likely culprits for blank screens)
import { useScreenMoodGradient } from '../../hooks/useMoodGradient';
import MoodAnalysisService from '../../services/MoodAnalysisService';

// Test Step 4: Add the more complex services from original SoulChatScreen
import MatchmakingBackendService from '../../services/MatchmakingBackendService';
import { CompactMoodIndicator } from '../../components/MoodIndicator';
import RecommendationCard from '../../components/chat/RecommendationCard';

// Test Step 5: The final suspects - high-resolution services
import HighResolutionHHCService from '../../services/compatibility/HighResolutionHHCService';
import SocraticPersonalityAnalyzer from '../../services/compatibility/SocraticPersonalityAnalyzer';

export default function SoulChatScreenSimple({ navigation, route }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [testStatus, setTestStatus] = useState('Testing imports...');
  
  // Test the mood gradient hook - this might be the culprit!
  const moodGradient = useScreenMoodGradient('soul_chat');
  
  // Test Step 6: Add the complex state from original SoulChatScreen
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreamingActive, setIsStreamingActive] = useState(false);
  const [isMatchmakingMode, setIsMatchmakingMode] = useState(true);
  const [matchmakingInitialized, setMatchmakingInitialized] = useState(false);
  
  const flatListRef = useRef(null);

  useEffect(() => {
    // Test if imports work
    try {
      const testColor = COLORS.primary;
      const testGradient = GRADIENTS.background;
      
      // Test service imports
      const chatService = ChatGPTService;
      const matchingService = SoulMatchmakingService;
      
      // Test mood services
      const moodService = MoodAnalysisService;
      
      // Test hook
      const hookTest = moodGradient.currentMood;
      
      // Test complex services and components
      const backendService = MatchmakingBackendService;
      const moodIndicator = CompactMoodIndicator;
      const recCard = RecommendationCard;
      
      // Test high-resolution services
      const hhcService = HighResolutionHHCService;
      const socraticAnalyzer = SocraticPersonalityAnalyzer;
      
      setTestStatus('✅ ALL imports + complex state working!');
    } catch (error) {
      setTestStatus(`❌ Import error: ${error.message}`);
    }
  }, []);

  // Test Step 7: Add the actual problematic initialization from original
  useEffect(() => {
    initializeMatchmaking();
  }, []);

  const initializeMatchmaking = async () => {
    try {
      console.log('🚀 Testing actual initialization pattern...');
      setTestStatus('🔄 Testing backend initialization...');
      
      const userProfile = {
        id: 'user_001',
        name: 'Alex',
        age: 25,
        location: 'San Francisco, CA'
      };

      // This is what might be causing the blank screen!
      console.log('🌐 Attempting backend service call...');
      const backendResult = await MatchmakingBackendService.initialize('user_001', userProfile);
      
      if (backendResult.success) {
        setTestStatus('✅ Backend initialization worked!');
        setMatchmakingInitialized(true);
      } else {
        setTestStatus('⚠️ Backend failed, trying fallback...');
        // Fallback
        const fallbackResult = await SoulMatchmakingService.initialize('user_001', userProfile);
        setTestStatus('✅ Fallback initialization worked!');
      }
      
    } catch (error) {
      console.error('Initialization error:', error);
      setTestStatus(`❌ Initialization failed: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f8f5ff', '#e8bef3']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>SoulAI Chat - Step 7</Text>
          <Text style={styles.subtitle}>+ Backend Service Calls</Text>
          <Text style={styles.debug}>
            Navigation: {navigation ? '✅' : '❌'}
          </Text>
          <Text style={styles.debug}>
            Route: {route ? '✅' : '❌'}
          </Text>
          <Text style={styles.debug}>
            {testStatus}
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Test input..."
              value={input}
              onChangeText={setInput}
            />
            <TouchableOpacity style={styles.sendButton}>
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f5ff',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#9eb7ec',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b6b6b',
    marginBottom: 24,
  },
  debug: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    marginRight: 10,
    color: '#333', // Add text color so you can see what you type
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#9eb7ec',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});