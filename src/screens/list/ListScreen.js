import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');

  // 20 matches with cycling gradient: purple to blue (1-10), blue to purple (11-20)
  const [matches] = useState([
    { id: '1', name: 'Alex', lastMessage: 'Hey! How are you doing today?', timestamp: '2m ago', unreadCount: 2 },
    { id: '2', name: 'Blake', lastMessage: 'Had a great time yesterday!', timestamp: '1h ago', unreadCount: 0 },
    { id: '3', name: 'Casey', lastMessage: 'Did you see that new movie?', timestamp: '3h ago', unreadCount: 1 },
    { id: '4', name: 'Drew', lastMessage: 'Sounds good! See you then.', timestamp: '1d ago', unreadCount: 0 },
    { id: '5', name: 'Emery', lastMessage: 'That sounds like so much fun! 😊', timestamp: '2d ago', unreadCount: 3 },
    { id: '6', name: 'Finley', lastMessage: 'Let me know when you\'re free!', timestamp: '3d ago', unreadCount: 1 },
    { id: '7', name: 'Gray', lastMessage: 'I loved that restaurant!', timestamp: '4d ago', unreadCount: 0 },
    { id: '8', name: 'Harper', lastMessage: 'Can\'t wait for the weekend', timestamp: '5d ago', unreadCount: 2 },
    { id: '9', name: 'Indigo', lastMessage: 'Thanks for the recommendation', timestamp: '6d ago', unreadCount: 0 },
    { id: '10', name: 'Jordan', lastMessage: 'Hope you have a great day!', timestamp: '1w ago', unreadCount: 1 },
    { id: '11', name: 'Kai', lastMessage: 'That concert was amazing!', timestamp: '1w ago', unreadCount: 0 },
    { id: '12', name: 'Lane', lastMessage: 'See you at the coffee shop', timestamp: '1w ago', unreadCount: 2 },
    { id: '13', name: 'Morgan', lastMessage: 'I\'m so excited for this!', timestamp: '1w ago', unreadCount: 0 },
    { id: '14', name: 'Nico', lastMessage: 'Let\'s plan something fun', timestamp: '2w ago', unreadCount: 1 },
    { id: '15', name: 'Olive', lastMessage: 'Perfect timing! 🎉', timestamp: '2w ago', unreadCount: 0 },
    { id: '16', name: 'Parker', lastMessage: 'I agree completely', timestamp: '2w ago', unreadCount: 3 },
    { id: '17', name: 'Quinn', lastMessage: 'That\'s such good news!', timestamp: '2w ago', unreadCount: 0 },
    { id: '18', name: 'River', lastMessage: 'Looking forward to it', timestamp: '3w ago', unreadCount: 1 },
    { id: '19', name: 'Sage', lastMessage: 'You made my day better', timestamp: '3w ago', unreadCount: 0 },
    { id: '20', name: 'Taylor', lastMessage: 'This is going to be great', timestamp: '3w ago', unreadCount: 2 },
  ]);

  // Filter matches based on search text
  const filteredMatches = matches.filter(match =>
    match.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderMatchItem = ({ item, index }) => {
    // Calculate the position within the image for this match box
    // We'll use the index to determine which part of the image to show
    const totalMatches = 20; // Total number of matches
    const imagePosition = index / (totalMatches - 1); // 0 to 1 progression
    
    // Convert to percentage for ImageBackground positioning
    const backgroundPositionY = `${imagePosition * 100}%`;
    
    // Text color gradient - with specific color matching (keeping existing logic)
    const getTextColorForPosition = (position) => {
      // Special cases for Lane and Morgan
      if (index === 11 || index === 12) {
        // Lane and Morgan: Both get dark purple
        return '#4A2C6D';
      }
      
      // Special cases for Nico and Olive to match Parker
      if (index === 13 || index === 14) {
        // Nico and Olive: Match Parker's color (dark blue-purple)
        return '#4F5A9A';
      }
      
      // Map index to gradient progression for all others
      if (index <= 10) {
        // Alex to Jordan: Dark purple text
        return '#4A2C6D';
      } else if (index >= 15 && index <= 16) {
        // Parker to Quinn: Dark blue progression
        const stepProgress = (index - 15) / 1;
        return interpolateColor('#4F5A9A', '#4A5D8C', stepProgress);
      } else if (index >= 17 && index <= 19) {
        // River to Taylor: Continue toward midnight blue
        const stepProgress = (index - 17) / 2;
        return interpolateColor('#4A5D8C', '#2C4B73', stepProgress);
      } else {
        // Fallback
        return '#2C4B73';
      }
    };

    // Secondary text color - black throughout for message text
    const getSecondaryTextColorForPosition = (position) => {
      return '#000000'; // Black for all message text
    };
    
    // Color interpolation function
    const interpolateColor = (color1, color2, factor) => {
      const hex1 = color1.replace('#', '');
      const hex2 = color2.replace('#', '');
      
      const r1 = parseInt(hex1.substr(0, 2), 16);
      const g1 = parseInt(hex1.substr(2, 2), 16);
      const b1 = parseInt(hex1.substr(4, 2), 16);
      
      const r2 = parseInt(hex2.substr(0, 2), 16);
      const g2 = parseInt(hex2.substr(2, 2), 16);
      const b2 = parseInt(hex2.substr(4, 2), 16);
      
      const r = Math.round(r1 + (r2 - r1) * factor);
      const g = Math.round(g1 + (g2 - g1) * factor);
      const b = Math.round(b1 + (b2 - b1) * factor);
      
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };
    
    // Avatar icon color - matching text colors
    const getAvatarIconColor = () => {
      // Special cases for Lane and Morgan
      if (index === 11 || index === 12) {
        // Lane and Morgan: Both get dark purple
        return '#4A2C6D';
      }
      
      // Special cases for Nico and Olive to match Parker
      if (index === 13 || index === 14) {
        // Nico and Olive: Match Parker's color (dark blue-purple)
        return '#4F5A9A';
      }
      
      // Map index to gradient progression for all others
      if (index <= 10) {
        // Alex to Jordan: Dark purple icons
        return '#4A2C6D';
      } else if (index >= 15 && index <= 16) {
        // Parker to Quinn: Dark blue progression
        const stepProgress = (index - 15) / 1;
        return interpolateColor('#4F5A9A', '#4A5D8C', stepProgress);
      } else if (index >= 17 && index <= 19) {
        // River to Taylor: Continue toward midnight blue
        const stepProgress = (index - 17) / 2;
        return interpolateColor('#4A5D8C', '#2C4B73', stepProgress);
      } else {
        // Fallback
        return '#2C4B73';
      }
    };
    
    // Recreate the purple-to-blue gradient from the image
    const getGradientColors = () => {
      // Map each box position (0-19) to a position in the gradient (0-1)
      const progress = index / 19; // 0 to 1 across all boxes
      
      // Define the gradient colors from the image
      const startColor = { r: 173, g: 156, b: 255 }; // Purple on the left
      const endColor = { r: 156, g: 207, b: 255 };   // Light blue on the right
      
      // Interpolate between start and end colors
      const r = Math.round(startColor.r + (endColor.r - startColor.r) * progress);
      const g = Math.round(startColor.g + (endColor.g - startColor.g) * progress);
      const b = Math.round(startColor.b + (endColor.b - startColor.b) * progress);
      
      const primaryColor = `rgb(${r}, ${g}, ${b})`;
      
      // Create a slightly lighter version for the gradient effect within each box
      const lighterR = Math.min(255, r + 15);
      const lighterG = Math.min(255, g + 15);
      const lighterB = Math.min(255, b + 10);
      const secondaryColor = `rgb(${lighterR}, ${lighterG}, ${lighterB})`;
      
      return [primaryColor, secondaryColor];
    };

    const gradientColors = getGradientColors();

    return (
      <TouchableOpacity
        style={styles.matchBubble}
        onPress={() => navigation.navigate('MatchChat', { match: item })}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.matchBubbleGradient}
        >
          <View style={styles.matchBubbleContent}>
            <View style={styles.matchAvatar}>
              <Ionicons name="person" size={24} color={getAvatarIconColor()} />
            </View>
            <View style={styles.matchContent}>
              <Text style={[styles.matchName, { color: getTextColorForPosition(imagePosition) }]}>{item.name}</Text>
              <Text style={[styles.matchLastMessage, { color: getSecondaryTextColorForPosition(imagePosition) }]} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
            <View style={styles.matchMeta}>
              <Text style={styles.timestamp}>{item.timestamp}</Text>
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with very white blue background */}
      <View style={styles.headerShadow}>
        <LinearGradient
          colors={['#F8FBFF', '#F8FBFF']} // Same as SoulChatScreen
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <Text style={styles.soulHeading}>Soul</Text>
        </LinearGradient>
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#4A2C6D" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search chats"
            placeholderTextColor="#4A2C6D"
          />
        </View>

        {/* Matches List */}
        <FlatList
          data={filteredMatches}
          renderItem={renderMatchItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.matchesList}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
        />
      </View>

      {/* Fixed Bottom Toolbar - White with Custom Icons */}
      <View style={[styles.toolbarContainer, { paddingBottom: insets.bottom }]}>
        <View style={styles.toolbar}>
          <TouchableOpacity
            style={styles.toolbarIcon}
            onPress={() => navigation?.getParent()?.navigate?.('SoulChatScreen')}
          >
            <View style={styles.iconContainer}>
              <Image 
                source={require('../../../assets/icons/soulchat.png')}
                style={{ width: 38, height: 38 }}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarIcon}>
            {/* Active tab - Matches */}
            <View style={[styles.iconContainer, styles.activeIcon]}>
              <Image 
                source={require('../../../assets/icons/list-active.png')}
                style={{ width: 38, height: 38 }}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolbarIcon}
            onPress={() => navigation?.getParent()?.navigate?.('ProfileScreen')}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFF'
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background instead of gradient
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
    paddingBottom: 8, // Reduced from 12 to 8 (about 0.15cm reduction)
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 44, 109, 0.1)',
  },
  soulHeading: {
    fontSize: 31,
    fontWeight: 'bold',
    color: '#4A2C6D',
    letterSpacing: 1
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#4A2C6D',
  },
  matchesList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  matchBubble: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  matchBubbleGradient: {
    borderRadius: 12,
    flex: 1,
  },
  matchBubbleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  matchAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.25)', // Semi-transparent white for contrast
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  matchContent: {
    flex: 1,
    justifyContent: 'center',
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A2C6D',
    marginBottom: 4,
  },
  matchLastMessage: {
    fontSize: 14,
    color: '#000',
  },
  matchMeta: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(100, 100, 100, 0.9)',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: 'rgba(232, 244, 253, 0.95)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  unreadText: {
    color: '#113A73', // Deep blue text for readability
    fontSize: 12,
    fontWeight: 'bold',
  },
  toolbarContainer: {
    backgroundColor: '#FFFFFF', // Explicitly white background for Android
    borderTopWidth: 0,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF', // Explicitly white background
  },
  toolbarIcon: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Crop icons to circle boundary
    // Removed all shadow properties for clean look
  },
  activeIcon: {
    backgroundColor: '#5A9BD4', // Match SoulChatScreen active icon color
  },
});