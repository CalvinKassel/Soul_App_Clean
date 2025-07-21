import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS, NIGHT_COLORS } from '../../styles/globalStyles';
import DropdownSection from '../../components/DropdownSection';
import MatchOptionsMenu, { HamburgerMenuButton } from '../../components/MatchOptionsMenu';
import MatchmakingBackendService from '../../services/MatchmakingBackendService';

export default function ListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const [selectedMenuMatch, setSelectedMenuMatch] = useState(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [matchesData, setMatchesData] = useState([]);
  const [waitingCount, setWaitingCount] = useState(0);
  const [servedRecommendations, setServedRecommendations] = useState([]);
  const [userMatches, setUserMatches] = useState([]);
  const [nightMode, setNightMode] = useState(false);

  // Load waiting recommendations count, served recommendations, and user matches
  useEffect(() => {
    loadWaitingCount();
    loadServedRecommendations();
    loadUserMatches();
  }, []);

  const loadWaitingCount = async () => {
    try {
      const count = await MatchmakingBackendService.getRecommendationCount('user_001');
      setWaitingCount(count);
    } catch (error) {
      console.error('Error loading waiting count:', error);
      setWaitingCount(3); // Fallback
    }
  };

  const loadServedRecommendations = async () => {
    try {
      const recommendations = await MatchmakingBackendService.getServedRecommendations('user_001');
      setServedRecommendations(recommendations);
      console.log(`📋 Loaded ${recommendations.length} served recommendations`);
    } catch (error) {
      console.error('Error loading served recommendations:', error);
      setServedRecommendations([]);
    }
  };

  const loadUserMatches = async () => {
    try {
      const matches = await MatchmakingBackendService.getUserMatches('user_001');
      setUserMatches(matches);
      console.log(`💕 Loaded ${matches.length} user matches`);
    } catch (error) {
      console.error('Error loading user matches:', error);
      setUserMatches([]);
    }
  };

  // Combine static demo matches with dynamic SoulAI matches
  React.useEffect(() => {
    const staticMatches = [
      // Active chats/matches (demo data)
      {
        id: '1',
        name: 'Emma',
        age: '24',
        photo: 'https://i.pravatar.cc/400?img=44',
        lastMessage: 'That sounds like such an amazing adventure! I\'d love to hear more about it.',
        timestamp: '2m ago',
        unreadCount: 2,
        category: 'matches'
      },
      {
        id: '2',
        name: 'Sophia',
        age: '26',
        photo: 'https://i.pravatar.cc/400?img=47',
        lastMessage: 'I completely agree! Philosophy and art go hand in hand.',
        timestamp: '1h ago',
        unreadCount: 0,
        category: 'matches'
      },
      {
        id: '3',
        name: 'Isabella',
        age: '23',
        photo: 'https://i.pravatar.cc/400?img=48',
        lastMessage: 'Your book recommendations were perfect, thank you!',
        timestamp: '3h ago',
        unreadCount: 1,
        category: 'matches'
      },
      // Pending matches - users you liked but no mutual match yet
      {
        id: '4',
        name: 'Mia',
        age: '27',
        photo: 'https://i.pravatar.cc/400?img=32',
        lastMessage: 'You liked this person',
        timestamp: '1d ago',
        unreadCount: 0,
        category: 'pending'
      },
      {
        id: '5',
        name: 'Charlotte',
        age: '25',
        photo: 'https://i.pravatar.cc/400?img=35',
        lastMessage: 'You liked this person',
        timestamp: '2d ago',
        unreadCount: 0,
        category: 'pending'
      },
      // Archived chats
      {
        id: '6',
        name: 'Ava',
        age: '25',
        photo: 'https://i.pravatar.cc/400?img=49',
        lastMessage: 'Looking forward to our coffee date tomorrow!',
        timestamp: '1w ago',
        unreadCount: 0,
        category: 'archived'
      }
    ];
    setMatchesData(staticMatches);
  }, []);

  // Filter matches by category
  const activeMatches = matchesData.filter(match => match.category === 'matches');
  const pendingMatches = matchesData.filter(match => match.category === 'pending');
  const archivedChats = matchesData.filter(match => match.category === 'archived');
  
  // Filter by search text
  const filteredActiveMatches = activeMatches.filter(match =>
    match.name.toLowerCase().includes(searchText.toLowerCase())
  );
  const filteredPendingMatches = pendingMatches.filter(match =>
    match.name.toLowerCase().includes(searchText.toLowerCase())
  );
  const filteredArchivedChats = archivedChats.filter(match =>
    match.name.toLowerCase().includes(searchText.toLowerCase())
  );
  
  // Filter served recommendations by search text
  const filteredServedRecommendations = servedRecommendations.filter(rec =>
    (rec.name || rec.displayName || '').toLowerCase().includes(searchText.toLowerCase())
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
    handleMenuClose();
  };

  const handleDeleteMatch = () => {
    if (selectedMenuMatch) {
      setMatchesData(prev => 
        prev.filter(match => match.id !== selectedMenuMatch.id)
      );
      Alert.alert('Chat Deleted', `Chat with ${selectedMenuMatch.name} has been deleted.`);
    }
    handleMenuClose();
  };

  const handleUnmatch = () => {
    if (selectedMenuMatch) {
      setMatchesData(prev => 
        prev.filter(match => match.id !== selectedMenuMatch.id)
      );
      Alert.alert('Unmatched', `You have unmatched with ${selectedMenuMatch.name}.`);
    }
    handleMenuClose();
  };

  // Like handler for Potentials
  const handleLikePotential = async (potentialUser) => {
    const result = await MatchmakingBackendService.handleLike(potentialUser.userId, {});
    if (result.success) {
      // Remove from potentials
      setServedRecommendations(prev => prev.filter(u => u.userId !== potentialUser.userId));
      // Add to matchesData (pending or matches)
      setMatchesData(prev => [
        ...prev,
        {
          id: potentialUser.userId,
          name: potentialUser.name || potentialUser.displayName,
          age: potentialUser.age,
          photo: potentialUser.photos && potentialUser.photos[0],
          lastMessage: 'You liked this person',
          timestamp: new Date().toISOString(),
          unreadCount: 0,
          category: result.isMatch ? 'matches' : 'pending'
        }
      ]);
    }
  };

  const navigateToChat = (match) => {
    if (match.category === 'pending') {
      // Navigate to profile view for pending matches
      navigation?.navigate?.('UserProfileScreen', { 
        userId: match.id,
        fromMatch: true 
      });
    } else {
      // Navigate to chat for active matches
      navigation?.navigate?.('MatchChat', { match });
    }
  };

  const navigateToRecommendationProfile = (recommendation) => {
    // Navigate to profile view for served recommendations
    navigation?.navigate?.('UserProfileScreen', { 
      userId: recommendation.userId,
      fromMatch: false // This is a recommendation, not a match
    });
  };

  // Waiting for you header component
  const renderWaitingForYouHeader = () => {
    if (waitingCount === 0) return null;
    
    return (
      <View style={styles.waitingHeader}>
        <Text style={styles.waitingHeaderText}>Waiting for you</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{waitingCount}</Text>
        </View>
      </View>
    );
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
          {item.category !== 'pending' && (
            <TouchableOpacity 
              onPress={() => handleMenuOpen(item)}
              style={styles.menuButtonContainer}
            >
              <HamburgerMenuButton />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderRecommendationItem = ({ item }) => {
    const displayName = item.name || item.displayName;
    const interactionText = item.interaction 
      ? `${item.interaction.action === 'like' ? 'Liked' : 'Passed'} • ${formatTimestamp(item.interaction.timestamp)}`
      : `Recommended • ${formatTimestamp(item.servedAt)}`;
    
    return (
      <TouchableOpacity
        style={styles.matchItem}
        onPress={() => navigateToRecommendationProfile(item)}
        activeOpacity={0.7}
      >
        <View style={styles.matchContent}>
          <Image 
            source={{ uri: item.photos && item.photos[0] ? item.photos[0] : 'https://i.pravatar.cc/400?img=1' }} 
            style={styles.matchPhoto} 
          />
          <View style={styles.matchInfo}>
            <View style={styles.matchHeader}>
              <Text style={styles.matchName}>{displayName}</Text>
              <Text style={styles.matchAge}>{item.age}</Text>
            </View>
            <View style={styles.matchMessage}>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.bio || 'Profile information available'}
              </Text>
            </View>
            <View style={styles.matchMeta}>
              <Text style={styles.timestamp}>{interactionText}</Text>
              {item.interaction && item.interaction.action === 'like' && (
                <View style={[styles.unreadBadge, { backgroundColor: '#10B981' }]}>
                  <Text style={styles.unreadText}>♡</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.potentialsBadgeContainer}>
            <View style={styles.potentialsBadge}>
              <Text style={styles.potentialsBadgeText}>SoulAI</Text>
            </View>
          </View>
          {/* Like button for Potentials */}
          <TouchableOpacity
            style={[styles.likeButton, nightMode ? { backgroundColor: NIGHT_COLORS.auroraGreen } : { backgroundColor: COLORS.primary }]}
            onPress={() => handleLikePotential(item)}
          >
            <Text style={{ color: nightMode ? NIGHT_COLORS.nightBlack : COLORS.textWhite, fontWeight: 'bold' }}>Like</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 72) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with gradient background and night mode toggle */}
      <View style={styles.headerShadow}>
        <LinearGradient
          colors={nightMode ? GRADIENTS.northernLights : GRADIENTS.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <Text style={styles.soulHeading}>Soul</Text>
          <TouchableOpacity
            style={{ marginLeft: 'auto', padding: 8 }}
            onPress={() => setNightMode(n => !n)}
          >
            <Ionicons name={nightMode ? 'moon' : 'sunny'} size={24} color={nightMode ? NIGHT_COLORS.auroraGreen : COLORS.primary} />
          </TouchableOpacity>
        </LinearGradient>
      </View>
      {/* Content Container with gradient background */}
      <LinearGradient
        colors={nightMode ? GRADIENTS.northernLights : GRADIENTS.cottonCandyMain}
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

        {/* Waiting for You Header */}
        {renderWaitingForYouHeader()}

        {/* Matches List with Dropdown Sections */}
        <ScrollView
          style={styles.matchesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.matchesListContent}
        >
          {/* Active Matches Section */}
          <DropdownSection 
            title="Matches" 
            count={filteredActiveMatches.length} 
            defaultExpanded={true}
          >
            {filteredActiveMatches.map(match => (
              <View key={match.id}>
                {renderMatchItem({ item: match })}
              </View>
            ))}
          </DropdownSection>

          {/* Potentials Section - SoulAI Served Recommendations */}
          <DropdownSection 
            title="Potentials" 
            count={filteredServedRecommendations.length} 
            defaultExpanded={false}
          >
            {filteredServedRecommendations.map(recommendation => (
              <View key={recommendation.userId}>
                {renderRecommendationItem({ item: recommendation })}
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
        </ScrollView>
      </LinearGradient>

      {/* Fixed Bottom Toolbar - Full width gradient */}
      <LinearGradient
        colors={nightMode ? GRADIENTS.northernLights : GRADIENTS.header}
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
    paddingTop: 8,
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  // Waiting for you header styles
  waitingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  waitingHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  countBadge: {
    backgroundColor: '#4A2C6D',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Potentials section styles
  potentialsBadgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  potentialsBadge: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 45,
    alignItems: 'center',
  },
  potentialsBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  likeButton: {
    marginLeft: 12,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
});