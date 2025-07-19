import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SoulService from '../../services/SoulService';

const { width } = Dimensions.get('window');

export default function MatchProfileScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [compatibilityData, setCompatibilityData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const match = route?.params?.match || {
    id: 'match1',
    name: 'Emma',
    age: '24',
    location: 'New York, NY',
    aboutMe: 'Love exploring new places and trying different cuisines. Always up for an adventure and deep conversations about life, art, and everything in between.',
    photo: 'https://i.pravatar.cc/400?img=1',
    interests: ['Art', 'Travel', 'Philosophy', 'Photography', 'Music']
  };

  // Load compatibility analysis when component mounts
  useEffect(() => {
    loadCompatibilityAnalysis();
  }, [match.id]);

  const loadCompatibilityAnalysis = async () => {
    try {
      setLoading(true);
      
      // For demo purposes, we'll use current user ID as 'user1'
      const currentUserId = 'user1';
      
      // Create Soul profiles if they don't exist
      await createDemoSoulProfiles(currentUserId, match.id);
      
      // Get compatibility analysis
      const matches = await SoulService.findSoulMatches(currentUserId, {
        maxResults: 1,
        minCompatibility: 0
      });
      
      if (matches.matches.length > 0) {
        setCompatibilityData(matches.matches[0]);
      } else {
        // Fallback compatibility data
        setCompatibilityData({
          compatibility: {
            totalScore: 0.87,
            hhcScore: 0.85,
            factualScore: 0.89,
            breakdown: {
              personalityAlignment: 0.82,
              valuesAlignment: 0.91,
              lifestyleCompatibility: 0.86,
              communicationStyle: 0.88
            }
          },
          personalityInsights: {
            complementaryTraits: ['Analytical thinking complements creative intuition'],
            sharedStrengths: ['Empathy', 'Communication'],
            potentialChallenges: ['Different decision-making styles'],
            communicationStyle: 'Direct and empathetic'
          },
          connectionPotential: {
            shortTermCompatibility: 0.85,
            longTermCompatibility: 0.89,
            growthPotential: 0.92
          }
        });
      }
    } catch (error) {
      console.error('Error loading compatibility analysis:', error);
      // Use fallback data
      setCompatibilityData({
        compatibility: {
          totalScore: 0.87,
          breakdown: {
            personalityAlignment: 0.82,
            valuesAlignment: 0.91
          }
        },
        personalityInsights: {
          complementaryTraits: ['Great conversation potential'],
          sharedStrengths: ['Similar interests in art and philosophy']
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const createDemoSoulProfiles = async (userId, matchId) => {
    try {
      // Create demo factual profiles
      const userFactualProfile = {
        age: 26,
        location: { city: 'New York', state: 'NY' },
        education: 'Bachelor\'s',
        occupation: 'Designer',
        interests: ['Art', 'Philosophy', 'Travel'],
        values: ['creativity', 'growth', 'adventure'],
        lifestyle: {
          socialLevel: 0.7,
          activityLevel: 0.8,
          introversion: 0.4
        }
      };

      const matchFactualProfile = {
        age: parseInt(match.age) || 24,
        location: { city: 'New York', state: 'NY' },
        education: 'Bachelor\'s',
        occupation: 'Artist',
        interests: match.interests || ['Art', 'Travel'],
        values: ['creativity', 'freedom', 'expression'],
        lifestyle: {
          socialLevel: 0.6,
          activityLevel: 0.9,
          introversion: 0.3
        }
      };

      const userPreferences = {
        ageRange: { min: 22, max: 30 },
        maxDistance: 50,
        educationLevel: ['bachelor', 'master'],
        dealBreakers: [],
        preferences: {
          creativity: 0.9,
          adventure: 0.8,
          stability: 0.6
        }
      };

      // Create Soul profiles (this will handle HHC profile creation internally)
      await SoulService.createSoulProfile(userId, userFactualProfile, userPreferences, []);
      await SoulService.createSoulProfile(matchId, matchFactualProfile, userPreferences, []);
      
    } catch (error) {
      console.error('Error creating demo Soul profiles:', error);
    }
  };

  const navigateToChat = () => {
    navigation?.navigate?.('MatchChat', { match });
  };

  const getCompatibilityLabel = (score) => {
    if (score >= 0.9) return 'Exceptional Match!';
    if (score >= 0.8) return 'Great Match!';
    if (score >= 0.7) return 'Good Match';
    if (score >= 0.6) return 'Potential Match';
    return 'Limited Compatibility';
  };

  const getCompatibilityDescription = (data) => {
    if (!data?.personalityInsights) {
      return 'You both value deep conversations and share similar interests in art and philosophy.';
    }

    const insights = data.personalityInsights;
    const sharedStrengths = insights.sharedStrengths || [];
    const complementary = insights.complementaryTraits || [];
    
    if (sharedStrengths.length > 0 && complementary.length > 0) {
      return `You share ${sharedStrengths.slice(0, 2).join(' and ')} as strengths. ${complementary[0]}.`;
    } else if (sharedStrengths.length > 0) {
      return `You both excel in ${sharedStrengths.slice(0, 2).join(' and ')}.`;
    } else if (complementary.length > 0) {
      return complementary[0];
    }
    
    return 'You have meaningful compatibility potential based on personality analysis.';
  };

  const formatBreakdownLabel = (key) => {
    const labels = {
      personalityAlignment: 'Personality',
      valuesAlignment: 'Values',
      lifestyleCompatibility: 'Lifestyle',
      communicationStyle: 'Communication',
      emotionalIntelligence: 'Emotional IQ',
      conflictResolution: 'Conflict Style'
    };
    return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with blue gradient */}
      <View style={styles.headerShadow}>
        <LinearGradient
          colors={['#1e3c72', '#2a5298']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>{match.name}</Text>
          
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Photo */}
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: match.photo }}
            style={styles.photo}
            resizeMode="cover"
          />
        </View>

        {/* Basic info */}
        <View style={styles.basicInfoContainer}>
          <View style={styles.nameAgeContainer}>
            <Text style={styles.profileName}>{match.name}</Text>
            <Text style={styles.profileAge}>{match.age}</Text>
          </View>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#7f8c8d" />
            <Text style={styles.locationText}>{match.location}</Text>
          </View>
        </View>

        {/* About me */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.aboutText}>{match.aboutMe}</Text>
        </View>

        {/* Compatibility analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soul Compatibility</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6B46C1" />
              <Text style={styles.loadingText}>Analyzing compatibility...</Text>
            </View>
          ) : (
            <View style={styles.compatibilityContainer}>
              <Text style={styles.compatibilityScore}>
                {Math.round((compatibilityData?.compatibility?.totalScore || 0.87) * 100)}%
              </Text>
              <Text style={styles.compatibilityText}>
                {getCompatibilityLabel(compatibilityData?.compatibility?.totalScore || 0.87)}
              </Text>
              <Text style={styles.compatibilityDescription}>
                {getCompatibilityDescription(compatibilityData)}
              </Text>
              
              {/* Compatibility breakdown */}
              {compatibilityData?.compatibility?.breakdown && (
                <View style={styles.breakdownContainer}>
                  <Text style={styles.breakdownTitle}>Breakdown:</Text>
                  {Object.entries(compatibilityData.compatibility.breakdown).map(([key, value]) => (
                    <View key={key} style={styles.breakdownItem}>
                      <Text style={styles.breakdownLabel}>
                        {formatBreakdownLabel(key)}
                      </Text>
                      <Text style={styles.breakdownValue}>
                        {Math.round(value * 100)}%
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.interestsContainer}>
            {match.interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Fixed bottom action button */}
      <View style={[styles.actionContainer, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity style={styles.chatButton} onPress={navigateToChat}>
          <LinearGradient
            colors={['#2a5298', '#3b82f6']}
            style={styles.chatButtonGradient}
          >
            <Ionicons name="chatbubble" size={20} color="white" />
            <Text style={styles.chatButtonText}>Start Conversation</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  moreButton: {
    padding: 4,
  },
  contentContainer: {
    flex: 1,
  },
  photoContainer: {
    height: 400,
    position: 'relative',
  },
  photo: {
    width: width,
    height: 400,
  },
  basicInfoContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  nameAgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginRight: 12,
  },
  profileAge: {
    fontSize: 24,
    color: '#7f8c8d',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginLeft: 4,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#34495e',
  },
  compatibilityContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  compatibilityScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  compatibilityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 4,
  },
  compatibilityDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B46C1',
    marginTop: 10,
  },
  breakdownContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  breakdownLabel: {
    fontSize: 13,
    color: '#5a6c7d',
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#27ae60',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(30, 60, 114, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e3c72',
  },
  interestText: {
    fontSize: 14,
    color: '#1e3c72',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 100,
  },
  actionContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  chatButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  chatButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  chatButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});