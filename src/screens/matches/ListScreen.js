import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS } from '../../styles/globalStyles';
import DropdownSection from '../../components/DropdownSection';
import MatchOptionsMenu, { HamburgerMenuButton } from '../../components/MatchOptionsMenu';

export default function ListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const [selectedMenuMatch, setSelectedMenuMatch] = useState(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [matchesData, setMatchesData] = useState([]);

  // Initialize matches with categories
  React.useEffect(() => {
    setMatchesData([
      // Active chats
      {
        id: '1',
        name: 'Emma',
        age: '24',
        photo: 'https://i.pravatar.cc/400?img=44',
        lastMessage: 'That sounds like such an amazing adventure! I\'d love to hear more about it.',
        timestamp: '2m ago',
        unreadCount: 2,
        category: 'active'
      },
      {
        id: '2',
        name: 'Sophia',
        age: '26',
        photo: 'https://i.pravatar.cc/400?img=47',
        lastMessage: 'I completely agree! Philosophy and art go hand in hand.',
        timestamp: '1h ago',
        unreadCount: 0,
        category: 'active'
      },
      {
        id: '3',
        name: 'Isabella',
        age: '23',
        photo: 'https://i.pravatar.cc/400?img=48',
        lastMessage: 'Your book recommendations were perfect, thank you!',
        timestamp: '3h ago',
        unreadCount: 1,
        category: 'active'
      },
      // Archived chats
      {
        id: '4',
        name: 'Ava',
        age: '25',
        photo: 'https://i.pravatar.cc/400?img=49',
        lastMessage: 'Looking forward to our coffee date tomorrow!',
        timestamp: '5h ago',
        unreadCount: 0,
        category: 'archived'
      },
      // Pending matches
      {
        id: '5',
        name: 'Mia',
        age: '27',
        photo: 'https://i.pravatar.cc/400?img=32',
        lastMessage: 'New match! Send the first message',
        timestamp: '1d ago',
        unreadCount: 0,
        category: 'pending'
      }
    ]);
  }, []);

  // Filter matches by category
  const activeChats = matchesData.filter(match => match.category === 'active');
  const archivedChats = matchesData.filter(match => match.category === 'archived');
  const pendingMatches = matchesData.filter(match => match.category === 'pending');
  
  // Filter by search text
  const filteredActiveChats = activeChats.filter(match =>
    match.name.toLowerCase().includes(searchText.toLowerCase())
  );
  const filteredArchivedChats = archivedChats.filter(match =>
    match.name.toLowerCase().includes(searchText.toLowerCase())
  );
  const filteredPendingMatches = pendingMatches.filter(match =>
    match.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Menu handlers
  const handleMenuOpen = (match) => {
    setSelectedMenuMatch(match);
    setIsMenuVisible(true);
  };

  const handleMenuClose = () => {
    setIsMenuVisible(false);
    setSelectedMenuMatch(null);
  };

  const handleArchiveMatch = () => {
    if (selectedMenuMatch) {
      setMatchesData(prev => 
        prev.map(match => 
          match.id === selectedMenuMatch.id 
            ? { ...match, category: 'archived' }
            : match
        )
      );
      Alert.alert('Chat Archived', `Chat with ${selectedMenuMatch.name} has been archived.`);
    }
  };

  const handleDeleteMatch = () => {
    if (selectedMenuMatch) {
      setMatchesData(prev => 
        prev.filter(match => match.id !== selectedMenuMatch.id)
      );
      Alert.alert('Chat Deleted', `Chat with ${selectedMenuMatch.name} has been deleted.`);
    }
  };

  const handleUnmatch = () => {
    if (selectedMenuMatch) {
      setMatchesData(prev => 
        prev.filter(match => match.id !== selectedMenuMatch.id)
      );
      Alert.alert('Unmatched', `You have unmatched with ${selectedMenuMatch.name}.`);
    }
  };

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
        <View style={styles.matchContent}>
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
          <TouchableOpacity 
            onPress={() => handleMenuOpen(item)}
            style={styles.menuButtonContainer}
          >
            <HamburgerMenuButton />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with cotton candy gradient background */}
      <View style={styles.headerShadow}>
        <LinearGradient
          colors={GRADIENTS.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <Text style={styles.soulHeading}>Soul</Text>
        </LinearGradient>
      </View>

      {/* Content Container with cotton candy gradient background */}
      <LinearGradient
        colors={GRADIENTS.cottonCandyMain}
        locations={[0, 0.33, 0.66, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.contentContainer}
      >

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.7)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search matches..."
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Matches List with Dropdown Sections */}
        <ScrollView
          style={styles.matchesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.matchesListContent}
        >
          {/* Active Chats Section */}
          <DropdownSection 
            title="Chats" 
            count={filteredActiveChats.length} 
            defaultExpanded={true}
          >
            {filteredActiveChats.map(match => (
              <View key={match.id}>
                {renderMatchItem({ item: match })}
              </View>
            ))}
          </DropdownSection>

          {/* Archived Chats Section */}
          <DropdownSection 
            title="Archived" 
            count={filteredArchivedChats.length} 
            defaultExpanded={false}
          >
            {filteredArchivedChats.map(match => (
              <View key={match.id}>
                {renderMatchItem({ item: match })}
              </View>
            ))}
          </DropdownSection>

          {/* Pending Matches Section */}
          <DropdownSection 
            title="Pending Matches" 
            count={filteredPendingMatches.length} 
            defaultExpanded={false}
          >
            {filteredPendingMatches.map(match => (
              <View key={match.id}>
                {renderMatchItem({ item: match })}
              </View>
            ))}
          </DropdownSection>
        </ScrollView>
      </LinearGradient>

      {/* Fixed Bottom Toolbar - Full width gradient */}
      <LinearGradient
        colors={GRADIENTS.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.toolbarContainer, { paddingBottom: insets.bottom }]}
      >
        <View style={styles.toolbar}>
          <TouchableOpacity
            style={styles.toolbarIcon}
            onPress={() => navigation?.getParent()?.navigate?.('SoulChatScreen')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="chatbubbles" size={24} color="rgba(255, 255, 255, 0.6)" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolbarIcon}
            onPress={() => navigation?.navigate?.('MatchesStack')}
          >
            <View style={[styles.iconContainer, styles.activeIcon]}>
              <Ionicons name="list" size={24} color="#4A2C6D" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolbarIcon}
            onPress={() => navigation?.getParent()?.navigate?.('ProfileScreen')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={24} color="rgba(255, 255, 255, 0.6)" />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Match Options Menu */}
      <MatchOptionsMenu
        visible={isMenuVisible}
        onClose={handleMenuClose}
        onArchive={handleArchiveMatch}
        onDelete={handleDeleteMatch}
        onUnmatch={handleUnmatch}
        matchName={selectedMenuMatch?.name || ''}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
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
    color: '#4A90E2',
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
    paddingHorizontal: 0,
    paddingBottom: 20,
  },
  matchesListContent: {
    paddingTop: 20,
  },
  matchItem: {
    marginBottom: 8,
    marginHorizontal: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  matchContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
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
    color: '#FFFFFF',
    marginRight: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    flex: 1,
  },
  matchAge: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  matchMessage: {
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#FFFFFF',
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
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
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
    paddingVertical: 4,
  },
  toolbarIcon: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 2,
    borderColor: '#4A2C6D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButtonContainer: {
    paddingLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});