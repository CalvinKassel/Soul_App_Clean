// AI Helper Button Component
// Reusable button component for AI assistance across different screens

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '../styles/globalStyles';

const AIHelperButton = ({ 
  variant = 'icon', // 'icon' for MatchChatScreen, 'searchBar' for ListScreen/ProfileScreen
  onPress,
  placeholder = "Ask Soul for help...",
  screenContext = 'general',
  disabled = false,
  style = {}
}) => {
  
  // Icon variant for MatchChatScreen (inside input container)
  if (variant === 'icon') {
    return (
      <TouchableOpacity
        style={[styles.iconButton, disabled && styles.disabled, style]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="sparkles" 
          size={18} 
          color={disabled ? COLORS.textSecondary : COLORS.primary} 
        />
      </TouchableOpacity>
    );
  }

  // Search bar variant for ListScreen/ProfileScreen
  if (variant === 'searchBar') {
    return (
      <TouchableOpacity
        style={[styles.searchBarContainer, disabled && styles.disabled, style]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.9}
      >
        <View style={styles.searchBarContent}>
          <Ionicons 
            name="sparkles" 
            size={16} 
            color={COLORS.textSecondary} 
            style={styles.searchIcon}
          />
          <Text style={styles.searchPlaceholder}>
            {placeholder}
          </Text>
        </View>
        <View style={styles.searchBarIndicator}>
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={COLORS.textSecondary} 
          />
        </View>
      </TouchableOpacity>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  // Icon button styles (for MatchChatScreen)
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Search bar styles (for ListScreen/ProfileScreen)
  searchBarContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  searchBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchPlaceholder: {
    fontSize: 16,
    color: COLORS.textSecondary,
    flex: 1,
  },

  searchBarIndicator: {
    marginLeft: 8,
  },

  // Disabled state
  disabled: {
    opacity: 0.6,
  },
});

export default AIHelperButton;