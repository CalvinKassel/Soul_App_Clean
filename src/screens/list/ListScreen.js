import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ListScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');

  // Mock data for matches with conversations
  const [matches] = useState([
    {
      id: 'match1',
      name: 'Emma',
      age: '26',
      lastMessage: 'That sounds amazing! I love hiking too 🏔️',
      timestamp: '2m ago',
      unreadCount: 2,
      photo: 'https://i.pravatar.cc/100?img=1',
      personalityType: 'ENFP-A',
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
    },
    {
      id: 'match2',
      name: 'Sarah',
      age: '24',
      lastMessage: 'Coffee sounds perfect! How about 3pm?',
      timestamp: '1h ago',
      unreadCount: 0,
      photo: 'https://i.pravatar.cc/100?img=2',
      personalityType: 'INFJ-T',
      location: 'Brooklyn, NY',
      interests: ['Reading', 'Photography', 'Music'],
      aboutMe: 'Bookworm and coffee enthusiast. I enjoy meaningful conversations and quiet moments.',
      photos: [
        'https://i.pravatar.cc/400?img=3',
        'https://i.pravatar.cc/400?img=4'
      ],
      virtueProfile: {
        getTopVirtues: () => [
          { virtue: 'AUTHENTICITY', customTerm: null },
          { virtue: 'WISDOM', customTerm: 'insight' }
        ]
      }
    },
    {
      id: 'match3',
      name: 'Jessica',
      age: '28',
      lastMessage: 'Your travel photos are incredible!',
      timestamp: '3h ago',
      unreadCount: 1,
      photo: 'https://i.pravatar.cc/100?img=3',
      personalityType: 'ESFP-A',
      location: 'Manhattan, NY',
      interests: ['Fitness', 'Dance', 'Cooking'],
      aboutMe: 'Yoga instructor who loves to dance and cook healthy meals. Life is about balance and joy!',
      photos: [
        'https://i.pravatar.cc/400?img=5',
        'https://i.pravatar.cc/400?img=6'
      ],
      virtueProfile: {
        getTopVirtues: () => [
          { virtue: 'VITALITY', customTerm: 'energy' },
          { virtue: 'HUMANITY', customTerm: 'kindness' }
        ]
      }
    },
    {
      id: 'match4',
      name: 'Alex',
      age: '27',
      lastMessage: 'Looking forward to our chat!',
      timestamp: '1d ago',
      unreadCount: 0,
      photo: 'https://i.pravatar.cc/100?img=4',
      personalityType: 'INTJ-A',
      location: 'Queens, NY',
      interests: ['Technology', 'Science', 'Gaming'],
      aboutMe: 'Software engineer with a passion for innovation. I enjoy deep conversations about the future.',
      photos: [
        'https://i.pravatar.cc/400?img=7',
        'https://i.pravatar.cc/400?img=8'
      ],
      virtueProfile: {
        getTopVirtues: () => [
          { virtue: 'WISDOM', customTerm: 'logic' },
          { virtue: 'JUSTICE', customTerm: 'fairness' }
        ]
      }
    }
  ]);

  // Filter matches based on search text
  const filteredMatches = matches.filter(match =>
    match.name.toLowerCase().includes(searchText.toLowerCase()) ||
    match.lastMessage.toLowerCase().includes(searchText.toLowerCase())
  );

  // Navigate to match chat with proper error handling
  const navigateToMatchChat = (match) => {
    try {
      navigation.navigate('MatchChat', { match });
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation
      navigation.navigate('MatchChat', { 
        match: {
          id: match.id,
          name: match.name,
          personalityType: match.personalityType,
          age: match.age,
          location: match.location,
          interests: match.interests,
          aboutMe: match.aboutMe,
          photos: match.photos,
          virtueProfile: match.virtueProfile
        }
      });
    }
  };

  const renderMatchItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.matchItem}
        onPress={() => navigateToMatchChat(item)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#ffffff', '#f8f9fa']}
          style={styles.matchContent}
        >
          <Image source={{ uri: item.photo }} style={styles.matchPhoto} />
          <View style={styles.matchInfo}>
            <View style={styles.matchHeader}>
              <Text style={styles.matchName}>{item.name}</Text>
              <Text style={styles.matchAge}>{item.age}</Text>
            </View>
            <View style={styles.matchMessage}>
              <Text 
                style={[
                  styles.lastMessage, 
                  item.unreadCount > 0 && styles.unreadMessage
                ]} 
                numberOfLines={1}>
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
      {/* Header with white background matching SoulChatScreen */}
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
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  soulHeading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0077B6',
    letterSpacing: 1
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FBFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#4A2C6D',
    paddingVertical: 4,
  },
  matchesList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  matchItem: {
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  matchContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  matchPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  matchInfo: {
    flex: 1,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A2C6D',
    marginRight: 8,
  },
  matchAge: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  matchMessage: {
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#4A2C6D',
  },
  matchMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    color: '#113A73',
    fontSize: 12,
    fontWeight: 'bold',
  },
  toolbarContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
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
    overflow: 'hidden',
  },
  activeIcon: {
    backgroundColor: '#5A9BD4',
  },
});