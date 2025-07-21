import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Clipboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useTypingEffect from '../../hooks/useTypingEffect';
import { COLORS } from '../../styles/globalStyles';

const ChatBubble = ({ 
  sender, 
  text, 
  message, 
  showActions = false, // Show copy/edit actions for AI messages in helper
  onEdit,
  onMessageSelect 
}) => {
  const isUser = sender === 'user' || message?.from === 'user';
  const isAI = sender === 'ai' || message?.from === 'ai';
  const messageText = text || message?.text || '';
  const [showActionButtons, setShowActionButtons] = useState(false);
  
  const displayedText = isUser ? messageText : useTypingEffect(messageText, 15);

  const handleCopy = async () => {
    try {
      await Clipboard.setString(messageText);
      Alert.alert('Copied!', 'Message copied to clipboard');
      setShowActionButtons(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy message');
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(messageText);
    }
    setShowActionButtons(false);
  };

  const handleSelect = () => {
    if (onMessageSelect) {
      onMessageSelect(messageText);
    }
    setShowActionButtons(false);
  };

  const handleLongPress = () => {
    if (isAI && showActions) {
      setShowActionButtons(!showActionButtons);
    }
  };

  return (
    <View style={styles.bubbleContainer}>
      <TouchableOpacity
        onLongPress={handleLongPress}
        activeOpacity={0.8}
        style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}
      >
        <Text style={isUser ? styles.userText : styles.aiText}>{displayedText}</Text>
      </TouchableOpacity>
      
      {/* Action Buttons for AI messages */}
      {isAI && showActions && showActionButtons && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleCopy}
          >
            <Ionicons name="copy-outline" size={16} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Copy</Text>
          </TouchableOpacity>
          
          {onEdit && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleEdit}
            >
              <Ionicons name="create-outline" size={16} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
          
          {onMessageSelect && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleSelect}
            >
              <Ionicons name="checkmark-outline" size={16} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Use</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bubbleContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  bubble: {
    padding: 12,
    borderRadius: 15,
  },
  userBubble: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  aiBubble: {
    backgroundColor: '#F0F0F0',
    alignSelf: 'flex-start',
  },
  userText: {
    color: '#000',
    fontSize: 16,
  },
  aiText: {
    color: '#333',
    fontSize: 16,
    lineHeight: 22,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  actionButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default ChatBubble;
