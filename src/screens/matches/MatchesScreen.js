import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MatchesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');

  // Sample matches data
  const matches = [
    {
      id: '1',
      name: 'Emma',
      age: '24',
      photo: 'https://i.pravatar.cc/400?img=1',
      lastMessage: 'That sounds like such an amazing adventure! I\'d love to hear more about it.',
      timestamp: '2m ago',
      unreadCount: 2,
    },
    {
      id: '2',
      name: 'Sophia',
      age: '26',
      photo: 'https://i.pravatar.cc/400?img=2',
      lastMessage: 'I completely agree! Philosophy and art go hand in hand.',
      timestamp: '1h ago',
      unreadCount: 0,
    },
    {
      id: '3',
      name: 'Isabella',
      age: '23',
      photo: 'https://i.pravatar.cc/400?img=3',
      lastMessage: 'Your book recommendations were perfect, thank you!',
      timestamp: '3h ago',
      unreadCount: 1,
    },
    {
      id: '4',
      name: 'Ava',
      age: '25',
      photo: 'https://i.pravatar.cc/400?img=4',
      lastMessage: 'Looking forward to our coffee date tomorrow!',
      timestamp: '5h ago',
      unreadCount: 0,
    },
    {
      id: '5',
      name: 'Mia',
      age: '27',
      photo: 'https://i.pravatar.cc/400?img=5',
      lastMessage: 'Your travel photos are absolutely stunning! 📸',
      timestamp: '1d ago',
      unreadCount: 3,
    }
  ];

  const filteredMatches = matches.filter(match =>
    match.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const navigateToChat = (match) => {
    navigation?.navigate?.('MatchChat', { match });
  };

  const renderMatchItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.matchItem}
        onPress={() => navigateToChat(item)}
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
      {/* Header with dark blue gradient background */}
      <View style={styles.headerShadow}>
        <LinearGradient
          colors={['#4A2C6D', '#6B4C8B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <Text style={styles.soulHeading}>Soul</Text>
        </LinearGradient>
      </View>

      {/* Content Container with dark blue gradient background */}
      <LinearGradient
        colors={['#4A2C6D', '#6B4C8B', '#8B6BB1', '#9B7BB1']}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.contentContainer}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#FFFFFF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search chats"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
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
      </LinearGradient>

      {/* Fixed Bottom Toolbar - Dark gradient with Custom Icons */}
      <View style={[styles.toolbarContainer, { paddingBottom: insets.bottom }]}>
        <LinearGradient
          colors={['#4A2C6D', '#6B4C8B']}
          style={styles.toolbar}
        >
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
          <TouchableOpacity
            style={styles.toolbarIcon}
            onPress={() => navigation?.navigate?.('MatchesStack')}
          >
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
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A2C6D',
  },
  contentContainer: {
    flex: 1,
  },
  headerShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  soulHeading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: '#4A2C6D',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  toolbarContainer: {
    borderTopWidth: 0,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toolbarIcon: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  activeIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});