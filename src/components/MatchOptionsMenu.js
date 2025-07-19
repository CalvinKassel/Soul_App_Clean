// Match Options Menu Component
// Hamburger menu for match actions (archive, delete, unmatch)

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Alert,
  Dimensions
} from 'react-native';
import { HamburgerIcon, ArchiveIcon, TrashIcon, CloseIcon } from './icons/SVGIcons';
import { COLORS } from '../styles/globalStyles';

const { width: screenWidth } = Dimensions.get('window');

const MatchOptionsMenu = ({ 
  visible, 
  onClose, 
  onArchive, 
  onDelete, 
  onUnmatch,
  matchName = "this match"
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleArchive = () => {
    Alert.alert(
      'Archive Chat',
      `Are you sure you want to archive this chat with ${matchName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Archive', 
          onPress: () => {
            onArchive();
            onClose();
          }
        }
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Chat',
      `Are you sure you want to delete this chat with ${matchName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            onDelete();
            onClose();
          }
        }
      ]
    );
  };

  const handleUnmatch = () => {
    Alert.alert(
      'Unmatch',
      `Are you sure you want to unmatch with ${matchName}? This will delete the chat and remove them from your matches.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Unmatch', 
          style: 'destructive',
          onPress: () => {
            onUnmatch();
            onClose();
          }
        }
      ]
    );
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.menuContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.menu}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleArchive}
            >
              <ArchiveIcon size={20} color={COLORS.primary} />
              <Text style={styles.menuItemText}>Archive Chat</Text>
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleDelete}
            >
              <TrashIcon size={20} color="#dc3545" />
              <Text style={[styles.menuItemText, { color: '#dc3545' }]}>Delete Chat</Text>
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleUnmatch}
            >
              <CloseIcon size={20} color="#dc3545" />
              <Text style={[styles.menuItemText, { color: '#dc3545' }]}>Unmatch</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

// Hamburger Menu Button Component
export const HamburgerMenuButton = ({ onPress }) => (
  <TouchableOpacity 
    style={styles.hamburgerButton}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <HamburgerIcon size={20} color={COLORS.primary} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  menu: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    color: COLORS.primary,
  },
  separator: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginHorizontal: 16,
  },
  hamburgerButton: {
    padding: 8,
    borderRadius: 8,
  },
});

export default MatchOptionsMenu;