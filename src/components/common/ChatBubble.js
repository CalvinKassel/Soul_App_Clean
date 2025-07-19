import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useTypingEffect from '../../hooks/useTypingEffect';

const ChatBubble = ({ sender, text }) => {
  const isUser = sender === 'user';
  const displayedText = isUser ? text : useTypingEffect(text, 15);

  return (
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
      <Text style={isUser ? styles.userText : styles.aiText}>{displayedText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    marginVertical: 4,
    padding: 10,
    borderRadius: 15,
    maxWidth: '80%',
    alignSelf: 'flex-start',
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
  },
  aiText: {
    color: '#333',
  },
});

export default ChatBubble;
