// Discovery Screen - Soul's Active Matchmaking
// Where Soul proactively finds and presents potential matches

import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanGestureHandler,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS } from '../../styles/globalStyles';
import SoulService from '../../services/SoulService';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;

export default function DiscoveryScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soulInsight, setSoulInsight] = useState('');
  
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Initialize with demo matches
  useEffect(() => {
    loadPotentialMatches();
  }, []);

  const loadPotentialMatches = async () => {
    try {
      setLoading(true);
      
      // In a real app, this would come from Soul's recommendation engine
      const demoMatches = [
        {
          id: 'discovery_1',
          name: 'Emma',
          age: 24,
          photo: 'https://i.pravatar.cc/400?img=44',
          bio: 'Artist who loves deep conversations about life and philosophy',
          distance: '2 miles away',
          soulCompatibility: 0.89,
          sharedInterests: ['Art', 'Philosophy', 'Travel'],
          personalityMatch: 'Creative Dreamer',
          reason: 'Your love for meaningful conversations and artistic expression align perfectly'
        },
        {
          id: 'discovery_2',
          name: 'Sophia',
          age: 26,
          photo: 'https://i.pravatar.cc/400?img=47',
          bio: 'Psychology student and weekend adventurer',
          distance: '1.5 miles away',
          soulCompatibility: 0.82,
          sharedInterests: ['Psychology', 'Hiking', 'Books'],
          personalityMatch: 'Thoughtful Explorer',
          reason: 'You both value personal growth and authentic connections'
        },
        {
          id: 'discovery_3',
          name: 'Isabella',
          age: 23,
          photo: 'https://i.pravatar.cc/400?img=48',
          bio: 'Writer with a passion for storytelling and coffee',
          distance: '3 miles away',
          soulCompatibility: 0.91,
          sharedInterests: ['Writing', 'Literature', 'Coffee'],
          personalityMatch: 'Intuitive Storyteller',
          reason: 'Your creative minds and appreciation for depth would create amazing conversations'
        }
      ];

      setPotentialMatches(demoMatches);
      
      // Generate Soul's insight about the current batch
      setSoulInsight("I've found some amazing people who align with your values and personality. These aren't random matches - I've analyzed compatibility on multiple dimensions.");
      
    } catch (error) {
      console.error('Error loading matches:', error);
      Alert.alert('Error', 'Unable to load new matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = (direction) => {
    if (currentCardIndex >= potentialMatches.length) return;

    const currentMatch = potentialMatches[currentCardIndex];
    
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: direction === 'right' ? width : -width,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (direction === 'right') {
        // Liked the match
        handleLike(currentMatch);
      } else {
        // Passed on the match
        handlePass(currentMatch);
      }
      
      // Reset animations and move to next card
      translateX.setValue(0);
      opacity.setValue(1);
      setCurrentCardIndex(prev => prev + 1);
      
      // Load more matches when running low
      if (currentCardIndex >= potentialMatches.length - 1) {
        loadPotentialMatches();
        setCurrentCardIndex(0);
      }
    });
  };

  const handleLike = async (match) => {
    try {
      console.log('Liked:', match.name);
      
      // In a real app, this would:
      // 1. Send like to backend
      // 2. Check for mutual match
      // 3. Create conversation if matched
      
      // Simulate match creation
      Alert.alert(
        '🎉 It\'s a Match!',
        `You and ${match.name} have liked each other! Start a conversation?`,
        [
          { text: 'Maybe Later', style: 'cancel' },
          { 
            text: 'Start Chatting', 
            onPress: () => navigation.navigate('MatchChat', { 
              match: {
                ...match,
                lastMessage: 'You matched! Say hello 👋',
                timestamp: 'Now'
              }
            })
          }
        ]
      );
      
    } catch (error) {
      console.error('Error processing like:', error);
    }
  };

  const handlePass = (match) => {
    console.log('Passed on:', match.name);
    // In a real app, this would update the recommendation algorithm
  };

  const renderCard = (match, index) => {
    if (index !== currentCardIndex) return null;

    const rotateInterpolate = rotate.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: ['-30deg', '0deg', '30deg'],
    });

    return (
      <Animated.View
        key={match.id}
        style={[
          styles.card,
          {
            transform: [
              { translateX },
              { rotate: rotateInterpolate },
            ],
            opacity,
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
          style={styles.cardGradient}
        >
          <Image source={{ uri: match.photo }} style={styles.cardImage} />
          
          <View style={styles.cardContent}>
            {/* Match Info */}
            <View style={styles.matchInfo}>
              <Text style={styles.matchName}>{match.name}, {match.age}</Text>
              <Text style={styles.matchDistance}>{match.distance}</Text>
              <Text style={styles.matchBio}>{match.bio}</Text>
            </View>

            {/* Soul's Analysis */}
            <View style={styles.soulAnalysis}>
              <View style={styles.compatibilityBadge}>
                <Ionicons name="heart" size={16} color="#FF6B6B" />
                <Text style={styles.compatibilityText}>
                  {Math.round(match.soulCompatibility * 100)}% Soul Match
                </Text>
              </View>
              
              <Text style={styles.personalityMatch}>{match.personalityMatch}</Text>
              <Text style={styles.soulReason}>"{match.reason}"</Text>
              
              {match.sharedInterests.length > 0 && (
                <View style={styles.interestsContainer}>
                  <Text style={styles.interestsLabel}>Shared interests:</Text>
                  <View style={styles.interestTags}>
                    {match.sharedInterests.slice(0, 3).map((interest, i) => (
                      <View key={i} style={styles.interestTag}>
                        <Text style={styles.interestText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const currentMatch = potentialMatches[currentCardIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerShadow}>
        <LinearGradient
          colors={GRADIENTS.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <View style={styles.headerLeft}>
            <Ionicons name="sparkles" size={24} color={COLORS.primary} />
            <Text style={styles.headerTitle}>Soul Discovery</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('MatchesStack')}>
            <Ionicons name="chatbubble-ellipses" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Soul's Insight */}
      <View style={styles.insightContainer}>
        <Text style={styles.insightText}>{soulInsight}</Text>
      </View>

      {/* Cards Container */}
      <View style={styles.cardsContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="heart" size={50} color={COLORS.primary} />
            <Text style={styles.loadingText}>Soul is finding your perfect matches...</Text>
          </View>
        ) : (
          <>
            {potentialMatches.map((match, index) => renderCard(match, index))}
            
            {currentCardIndex >= potentialMatches.length && (
              <View style={styles.noMoreCards}>
                <Ionicons name="refresh" size={50} color={COLORS.primary} />
                <Text style={styles.noMoreText}>That's everyone for now!</Text>
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={() => {
                    setCurrentCardIndex(0);
                    loadPotentialMatches();
                  }}
                >
                  <Text style={styles.refreshButtonText}>Find More Matches</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>

      {/* Action Buttons */}
      {currentMatch && !loading && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.passButton]}
            onPress={() => handleSwipe('left')}
          >
            <Ionicons name="close" size={30} color="#FF6B6B" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.likeButton]}
            onPress={() => handleSwipe('right')}
          >
            <Ionicons name="heart" size={30} color="#4ECDC4" />
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Toolbar */}
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
          <TouchableOpacity style={styles.toolbarIcon}>
            <View style={[styles.iconContainer, styles.activeIcon]}>
              <Ionicons name="heart" size={24} color="#4A2C6D" />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: COLORS.backgroundWhite,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 8,
  },
  insightContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
  },
  insightText: {
    fontSize: 14,
    color: COLORS.primary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: width - 40,
    height: height * 0.7,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardContent: {
    padding: 20,
  },
  matchInfo: {
    marginBottom: 15,
  },
  matchName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  matchDistance: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  matchBio: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    marginTop: 8,
    lineHeight: 22,
  },
  soulAnalysis: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 15,
  },
  compatibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  compatibilityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
    marginLeft: 5,
  },
  personalityMatch: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  soulReason: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  interestsContainer: {
    marginTop: 10,
  },
  interestsLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  interestTag: {
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interestText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 40,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  passButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  likeButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.primary,
    marginTop: 15,
    textAlign: 'center',
  },
  noMoreCards: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMoreText: {
    fontSize: 18,
    color: COLORS.primary,
    marginTop: 15,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    justifyContent: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
});