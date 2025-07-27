import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS } from '../../styles/globalStyles';
import DropdownSection from '../../components/DropdownSection';
import MatchOptionsMenu from '../../components/MatchOptionsMenu';
import MatchmakingBackendService from '../../services/MatchmakingBackendService';

export default function ListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selectedMenuMatch, setSelectedMenuMatch] = useState(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [matchesData, setMatchesData] = useState([]);
  const [waitingCount, setWaitingCount] = useState(0);
  const [servedRecommendations, setServedRecommendations] = useState([]);
  const [userMatches, setUserMatches] = useState([]);

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
  
  // No search filtering needed - show all matches
  const filteredActiveMatches = activeMatches;
  const filteredPendingMatches = pendingMatches;
  const filteredArchivedChats = archivedChats;
  const filteredServedRecommendations = servedRecommendations;

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
      // Navigate to chat for active matches - force to MatchChat
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
            <Text style={styles.matchName}>{item.name}</Text>
          </View>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
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
            style={[styles.likeButton, { backgroundColor: COLORS.primary }]}
            onPress={() => handleLikePotential(item)}
          >
            <Text style={{ color: COLORS.textWhite, fontWeight: 'bold' }}>Like</Text>
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
      {/* Header with gradient background - match SoulChatScreen exactly */}
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
      {/* Content Container with gradient background */}
      <LinearGradient
        colors={GRADIENTS.cottonCandyMain}
        locations={[0, 0.33, 0.66, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.contentContainer}
      >


        {/* Matches List with Dropdown Sections */}
        <ScrollView
          style={styles.matchesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.matchesListContent}
        >
          {/* 1. Active Matches Section */}
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

          {/* 2. Archived Chats Section */}
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

          {/* 3. Waiting for You Section - Shows recommendations to like/pass */}
          <DropdownSection 
            title="Waiting for You" 
            count={filteredServedRecommendations.length || waitingCount} 
            defaultExpanded={true}
          >
            {filteredServedRecommendations.length > 0 ? (
              filteredServedRecommendations.map(recommendation => (
                <View key={recommendation.userId}>
                  {renderRecommendationItem({ item: recommendation })}
                </View>
              ))
            ) : (
              <View style={styles.emptyWaitingSection}>
                <Text style={styles.emptyWaitingText}>
                  {waitingCount > 0 
                    ? `${waitingCount} new recommendations are being prepared for you`
                    : 'No new recommendations at the moment'
                  }
                </Text>
                {waitingCount > 0 && (
                  <TouchableOpacity 
                    style={styles.refreshButton}
                    onPress={() => {
                      loadServedRecommendations();
                      loadWaitingCount();
                    }}
                  >
                    <Text style={styles.refreshButtonText}>Refresh</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </DropdownSection>

          {/* 4. Waiting for Them Section */}
          <DropdownSection 
            title="Waiting for Them" 
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
            onPress={() => navigation?.navigate?.('SoulChatScreen')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="chatbubbles" size={24} color="rgba(255, 255, 255, 0.6)" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolbarIcon}
            onPress={() => navigation?.navigate?.('ListScreen')}
          >
            <View style={[styles.iconContainer, styles.activeIcon]}>
              <Ionicons name="list" size={24} color="#4A2C6D" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolbarIcon}
            onPress={() => navigation?.navigate?.('ProfileScreen')}
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    justifyContent: 'space-between',
    minHeight: 76,
  },
  matchPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  matchInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  unreadBadge: {
    backgroundColor: '#4A2C6D',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginLeft: 12,
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
  
  // Empty waiting section styles
  emptyWaitingSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    margin: 8,
  },
  emptyWaitingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  refreshButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
  },
  refreshButtonText: {
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