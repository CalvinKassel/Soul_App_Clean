import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { sendMessageToAgent } from '../../services/VertexAIAgent';

export default function VertexAITestScreen() {
  const [message, setMessage] = useState('');
  const [agentReply, setAgentReply] = useState('Hi! I\'m SoulAI, your AI dating coach. Ask me to analyze your personality or help you find compatible matches!');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    const userMessage = message.trim();
    setIsLoading(true);
    setAgentReply('SoulAI is thinking...');
    
    // Add user message to history
    const newHistory = [...conversationHistory, { type: 'user', text: userMessage }];
    setConversationHistory(newHistory);
    
    try {
      const response = await sendMessageToAgent(userMessage);
      setAgentReply(response);
      
      // Add agent response to history
      setConversationHistory([...newHistory, { type: 'agent', text: response }]);
    } catch (error) {
      const errorMessage = "Sorry, I'm having trouble connecting right now. Please try again.";
      setAgentReply(errorMessage);
      setConversationHistory([...newHistory, { type: 'agent', text: errorMessage }]);
    }
    
    setIsLoading(false);
    setMessage('');
  };

  const clearConversation = () => {
    setConversationHistory([]);
    setAgentReply('Hi! I\'m SoulAI, your AI dating coach. Ask me to analyze your personality or help you find compatible matches!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🤖 SoulAI Agent Test</Text>
        <TouchableOpacity style={styles.clearButton} onPress={clearConversation}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.chatContainer} showsVerticalScrollIndicator={false}>
        {conversationHistory.map((msg, index) => (
          <View key={index} style={[
            styles.messageContainer,
            msg.type === 'user' ? styles.userMessage : styles.agentMessage
          ]}>
            <Text style={[
              styles.messageText,
              msg.type === 'user' ? styles.userMessageText : styles.agentMessageText
            ]}>
              {msg.text}
            </Text>
          </View>
        ))}
        
        <View style={[styles.messageContainer, styles.agentMessage]}>
          <Text style={styles.agentMessageText}>
            {isLoading && <ActivityIndicator size="small" color="#6B46C1" />}
            {agentReply}
          </Text>
        </View>
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask SoulAI about your personality..."
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, isLoading && styles.disabledButton]} 
          onPress={handleSend} 
          disabled={isLoading || !message.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          🔗 Connected to SoulAI Vertex Agent • Backend: {isLoading ? 'Processing...' : 'Ready'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  clearButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6B46C1',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
  },
  agentMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  agentMessageText: {
    color: '#1F2937',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#F9FAFB',
  },
  sendButton: {
    backgroundColor: '#6B46C1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  statusBar: {
    backgroundColor: '#F3F4F6',
    padding: 8,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
  },
});