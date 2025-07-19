// src/styles/layoutPresets.js
// 🚨 CRITICAL LAYOUT BACKUP - DO NOT MODIFY
// This file contains the PERFECT working layouts from SoulChatScreen
// Use this as a reference if layouts ever break during refactoring

import { StyleSheet } from 'react-native';

// 🎯 PERFECT SOULCHAT LAYOUT BACKUP
export const SOULCHAT_PERFECT_LAYOUT = {
  // Complete JSX structure for SoulChatScreen header
  HEADER_JSX: `
    <View style={styles.headerShadow}>
      <LinearGradient
        colors={['#F8FBFF', '#F8FBFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#0077B6" />
        </TouchableOpacity>
        <Text style={styles.soulHeading}>Soul AI</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#0077B6" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  `,

  // Complete JSX structure for input area
  INPUT_JSX: `
    <View style={styles.inputContainer}>
      <View style={styles.inputPill}>
        <TextInput
          style={[styles.input, styles.inputFont]}
          value={input}
          onChangeText={setInput}
          placeholder="Share what's on your heart..."
          placeholderTextColor="#5A9BD4"
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
          includeFontPadding={false}
          textAlignVertical="center"
          editable={!isAIThinking}
        />
        <TouchableOpacity
          onPress={handleSend}
          style={[
            styles.sendButton, 
            (!input.trim() || isAIThinking) && styles.disabledButton
          ]}
          disabled={!input.trim() || isAIThinking}
        >
          <Ionicons 
            name={isAIThinking ? "hourglass" : "send"} 
            size={22} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </View>
    </View>
  `,

  // Complete JSX structure for toolbar
  TOOLBAR_JSX: `
    <View style={[styles.toolbarContainer, { paddingBottom: insets.bottom }]}>
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarIcon}>
          <View style={[styles.iconContainer, styles.activeIcon]}>
            <Image 
              source={require('../../../assets/icons/soulchat-active.png')}
              style={{ width: 38, height: 38 }}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolbarIcon}
          onPress={() => navigation?.navigate?.('MatchesStack')}
        >
          <View style={styles.iconContainer}>
            <Image 
              source={require('../../../assets/icons/list.png')}
              style={{ width: 38, height: 38 }}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolbarIcon}
          onPress={() => navigation?.navigate?.('ProfileScreen')}
        >
          <View style={styles.iconContainer}>
            <Image 
              source={require('../../../assets/icons/profile.png')}
              style={{ width: 38, height: 38 }}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  `,
};

// 🎨 PERFECT STYLES BACKUP
export const PERFECT_STYLES = StyleSheet.create({
  // Header Styles - CRITICAL MEASUREMENTS
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
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  soulHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0077B6',
    letterSpacing: 1
  },
  menuButton: {
    padding: 4,
  },

  // Input Styles - CRITICAL MEASUREMENTS
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#B8E0D2',
    paddingLeft: 20,
    paddingRight: 4,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    color: '#2C3E50',
    fontSize: 16,
  },
  inputFont: {
    fontWeight: '400',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B9D',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
    shadowOpacity: 0.1,
  },

  // Toolbar Styles - CRITICAL MEASUREMENTS
  toolbarContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 8,
    paddingTop: 8,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  toolbarIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  activeIcon: {
    backgroundColor: '#F0F8FF',
    borderWidth: 2,
    borderColor: '#B8E0D2',
    shadowColor: '#0077B6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});

// 🚨 EMERGENCY LAYOUT RECOVERY GUIDE
export const EMERGENCY_RECOVERY = {
  instructions: `
  IF LAYOUT BREAKS - COPY AND PASTE THESE EXACT VALUES:

  1. Header paddingTop: insets.top + 10
  2. Header gradient: ['#F8FBFF', '#F8FBFF']
  3. Input borderRadius: 25
  4. Send button: 40x40 circular
  5. Toolbar paddingBottom: insets.bottom
  6. Icon containers: 50x50 circular
  7. Active icon background: '#F0F8FF'
  `,
  
  criticalMeasurements: {
    headerPaddingTop: 'insets.top + 10',
    inputBorderRadius: 25,
    sendButtonSize: { width: 40, height: 40 },
    toolbarPaddingBottom: 'insets.bottom',
    iconContainerSize: { width: 50, height: 50 },
    iconSize: { width: 38, height: 38 }
  },
  
  criticalColors: {
    primary: '#0077B6',
    accent: '#FF6B9D',
    background: '#F8FBFF',
    inputBorder: '#B8E0D2',
    activeIcon: '#F0F8FF'
  }
};

// 🔧 LAYOUT CLONING FUNCTION
export const cloneLayoutToMatchChat = (matchData) => {
  return {
    headerJSX: SOULCHAT_PERFECT_LAYOUT.HEADER_JSX.replace(
      'Soul AI', 
      matchData?.name || 'Match'
    ).replace(
      'onPress={() => navigation?.goBack?.()}',
      'onPress={() => navigation?.goBack?.()}'
    ),
    
    inputJSX: SOULCHAT_PERFECT_LAYOUT.INPUT_JSX.replace(
      'Share what\'s on your heart...',
      `Message ${matchData?.name || 'match'}...`
    ),
    
    toolbarJSX: SOULCHAT_PERFECT_LAYOUT.TOOLBAR_JSX.replace(
      'soulchat-active.png',
      'list-active.png'
    )
  };
};

// 📱 COMPLETE REFACTOR PLAN
export const REFACTOR_EXECUTION_PLAN = {
  step1: {
    title: "Create New Folder Structure",
    folders: [
      'src/ai/',
      'src/api/',
      'src/components/common/',
      'src/components/forms/',
      'src/context/',
      'src/navigation/', 
      'src/screens/chat/',
      'src/screens/matches/',
      'src/screens/profile/',
      'src/styles/',
      'src/utils/',
      'assets/icons/',
      'assets/images/'
    ]
  },
  
  step2: {
    title: "Move Files to New Structure",
    migrations: {
      'src/services/SoulAIFrontendService.js': 'src/ai/SoulAIService.js',
      'src/screens/soulchat/SoulChatScreen.js': 'src/screens/chat/SoulChatScreen.js',
      'src/screens/matches/MatchChatScreen.js': 'src/screens/chat/MatchChatScreen.js',
      'src/screens/list/ListScreen.js': 'src/screens/matches/ListScreen.js',
      'src/navigation/TabNavigator.js': 'src/navigation/TabNavigator.js',
      'src/components/PersonalityAssessment.js': 'src/components/forms/PersonalityAssessment.js',
      'assets/': 'assets/'
    }
  },
  
  step3: {
    title: "Update Import Statements",
    updates: {
      'SoulChatScreen.js': [
        "import SoulAIService from '../../ai/SoulAIService';",
        "import { COLORS, SPACING } from '../../styles/globalStyles';"
      ],
      'TabNavigator.js': [
        "import SoulChatScreen from '../screens/chat/SoulChatScreen';",
        "import MatchChatScreen from '../screens/chat/MatchChatScreen';",
        "import ListScreen from '../screens/matches/ListScreen';"
      ]
    }
  }
};

export default {
  SOULCHAT_PERFECT_LAYOUT,
  PERFECT_STYLES,
  EMERGENCY_RECOVERY,
  cloneLayoutToMatchChat,
  REFACTOR_EXECUTION_PLAN
};