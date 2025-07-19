// src/components/common/ThemeSwitcher.js
// Easy way to switch between themes

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, getThemedStyles, getThemedGradients } from '../../styles/ThemeProvider';

const ThemeSwitcher = ({ visible, onClose }) => {
  const { theme, currentTheme, switchTheme, availableThemes } = useTheme();
  const themedStyles = getThemedStyles(theme);
  const themedGradients = getThemedGradients(theme);

  const themeDescriptions = {
    deepGradient: {
      name: 'Deep Gradient',
      description: 'Rich purple cosmic theme',
      preview: ['#1a0b2e', '#2d1b4e', '#4a1a6b'],
    },
    light: {
      name: 'Light Theme',
      description: 'Clean blue and pink',
      preview: ['#0077B6', '#5A9BD4', '#FF6B9D'],
    },
    dark: {
      name: 'Dark Theme',
      description: 'Modern dark with purple',
      preview: ['#121212', '#BB86FC', '#03DAC6'],
    },
  };

  const handleThemeSelect = (themeName) => {
    switchTheme(themeName);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={[styles.content, { backgroundColor: theme.colors.backgroundPrimary }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.borderLight }]}>
              <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                Choose Theme
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Theme Options */}
            <View style={styles.themeList}>
              {availableThemes.map((themeName) => {
                const themeInfo = themeDescriptions[themeName];
                const isSelected = currentTheme === themeName;

                return (
                  <TouchableOpacity
                    key={themeName}
                    style={[
                      styles.themeOption,
                      { borderColor: theme.colors.borderLight },
                      isSelected && { 
                        borderColor: theme.colors.borderMedium,
                        backgroundColor: theme.colors.backgroundSecondary,
                      },
                    ]}
                    onPress={() => handleThemeSelect(themeName)}
                  >
                    {/* Theme Preview */}
                    <View style={styles.themePreview}>
                      <LinearGradient
                        colors={themeInfo.preview}
                        style={styles.previewGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      />
                    </View>

                    {/* Theme Info */}
                    <View style={styles.themeInfo}>
                      <Text style={[styles.themeName, { color: theme.colors.textPrimary }]}>
                        {themeInfo.name}
                      </Text>
                      <Text style={[styles.themeDescription, { color: theme.colors.textSecondary }]}>
                        {themeInfo.description}
                      </Text>
                    </View>

                    {/* Selected Indicator */}
                    {isSelected && (
                      <View style={[styles.selectedIndicator, { backgroundColor: theme.colors.accent }]}>
                        <Ionicons name="checkmark" size={16} color={theme.colors.textOnDark} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Current Theme Info */}
            <View style={[styles.currentThemeInfo, { backgroundColor: theme.colors.backgroundSecondary }]}>
              <Text style={[styles.currentThemeLabel, { color: theme.colors.textSecondary }]}>
                Current Theme
              </Text>
              <Text style={[styles.currentThemeName, { color: theme.colors.textPrimary }]}>
                {themeDescriptions[currentTheme]?.name}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

// You can add this to any screen to show theme options
export const ThemeButton = () => {
  const { theme } = useTheme();
  const [showSwitcher, setShowSwitcher] = React.useState(false);

  return (
    <>
      <TouchableOpacity 
        style={[styles.themeButton, { backgroundColor: theme.colors.backgroundSecondary }]}
        onPress={() => setShowSwitcher(true)}
      >
        <Ionicons name="color-palette" size={20} color={theme.colors.textPrimary} />
      </TouchableOpacity>
      
      <ThemeSwitcher 
        visible={showSwitcher} 
        onClose={() => setShowSwitcher(false)} 
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  themeList: {
    padding: 20,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  themePreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 16,
  },
  previewGradient: {
    flex: 1,
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentThemeInfo: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  currentThemeLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  currentThemeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  themeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default ThemeSwitcher;