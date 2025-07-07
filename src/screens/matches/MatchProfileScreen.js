import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import compatibility engine for detailed analysis
import { CompatibilityEngine } from '../services/CompatibilityEngine';
import { VirtueCategories } from '../models/VirtueProfile';

const { width } = Dimensions.get('window');

export default function MatchProfileScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const match = route?.params?.match || {
    id: 'match1',
    name: 'Eleanor',
    personalityType: 'ENFP-A',
    age: '26',
    location: 'New York, NY',
    interests: ['Art', 'Travel', 'Philosophy', 'Photography', 'Cooking'],
    aboutMe: 'Creative soul who loves exploring new places and trying different cuisines. Always up for an adventure and deep conversations about life.',
    photos: [
      'https://i.pravatar.cc/400?img=47',
      'https://i.pravatar.cc/400?img=48',
      'https://i.pravatar.cc/400?img=49'
    ],
    virtueProfile: {
      getTopVirtues: () => [
        { virtue: 'WISDOM', customTerm: 'curiosity' },
        { virtue: 'HUMANITY', customTerm: null },
        { virtue: 'COURAGE', customTerm: 'authenticity' }
      ]
    }
  };

  const [compatibilityData, setCompatibilityData] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Mock current user - this would come from your app state
  const currentUser = {
    id: 'user123',
    name: 'You',
    personalityType: 'INFJ-A',
    interests: ['Reading', 'Music', 'Coffee', 'Psychology'],
    virtueProfile: {
      getTopVirtues: () => [
        { virtue: 'WISDOM', customTerm: null },
        { virtue: 'INTEGRITY', customTerm: null },
        { virtue: 'HUMANITY', customTerm: 'empathy' }
      ]
    }
  };

  const compatibilityEngine = new CompatibilityEngine();

  useEffect(() => {
    // Calculate detailed compatibility analysis
    const compatibility = compatibilityEngine.calculateCompatibility(currentUser, match);
    setCompatibilityData(compatibility);
  }, []);

  const navigateToChat = () => {
    navigation.navigate('MatchChat', { match });
  };

  const renderPhotoCarousel = () => (
    <View style={styles.photoContainer}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setActivePhotoIndex(index);
        }}
        scrollEventThrottle={16}
      >
        {match.photos?.map((photo, index) => (
          <Image
            key={index}
            source={{ uri: photo }}
            style={styles.photo}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
      
      {/* Photo indicators */}
      <View style={styles.photoIndicators}>
        {match.photos?.map((_, index) => (
          <View
            key={index}
            style={[
              styles.photoIndicator,
              index === activePhotoIndex && styles.activePhotoIndicator
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderCompatibilitySection = () => {
    if (!compatibilityData) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💫 Compatibility Analysis</Text>
        
        {/* Overall score */}
        <View style={styles.compatibilityScoreContainer}>
          <Text style={styles.compatibilityScore}>
            {compatibilityData.score}% Compatible
          </Text>
          <Text style={styles.compatibilityRating}>
            {compatibilityData.rating}
          </Text>
        </View>

        {/* Key compatibility factors */}
        <View style={styles.compatibilityFactors}>
          {compatibilityData.factors
            .filter(factor => factor.isPositive && factor.weightedScore > 10)
            .slice(0, 3)
            .map((factor, index) => (
              <View key={index} style={styles.compatibilityFactor}>
                <View style={styles.factorHeader}>
                  <Text style={styles.factorTitle}>{factor.factor}</Text>
                  <View style={styles.factorScore}>
                    <Text style={styles.factorScoreText}>
                      {Math.round(factor.weightedScore)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.factorExplanation}>
                  {factor.explanation}
                </Text>
              </View>
            ))}
        </View>

        {/* Insights */}
        {compatibilityData.insights && compatibilityData.insights.length > 0 && (
          <View style={styles.insightsContainer}>
            <Text style={styles.insightsTitle}>Key Insights:</Text>
            {compatibilityData.insights.slice(0, 2).map((insight, index) => (
              <Text key={index} style={styles.insightText}>
                • {insight}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderPersonalitySection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🧠 Personality</Text>
      <View style={styles.personalityContainer}>
        <Text style={styles.personalityType}>{match.personalityType}</Text>
        <Text style={styles.personalityDescription}>
          {getPersonalityDescription(match.personalityType)}
        </Text>
      </View>
    </View>
  );

  const renderVirtuesSection = () => {
    const topVirtues = match.virtueProfile?.getTopVirtues?.(3) || [];
    
    if (topVirtues.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✨ Core Values</Text>
        <View style={styles.virtuesContainer}>
          {topVirtues.map((virtue, index) => {
            const virtueData = VirtueCategories[virtue.virtue];
            const displayName = virtue.customTerm || virtueData?.name || virtue.virtue;
            
            return (
              <View key={index} style={styles.virtueItem}>
                <Text style={styles.virtueName}>{displayName}</Text>
                <Text style={styles.virtueDescription}>
                  {virtueData?.description || 'Important personal value'}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderInterestsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🎯 Interests</Text>
      <View style={styles.interestsContainer}>
        {match.interests?.map((interest, index) => (
          <View key={index} style={styles.interestTag}>
            <Text style={styles.interestText}>{interest}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const getPersonalityDescription = (type) => {
    const descriptions = {
      'ENFP': 'The Campaigner - Enthusiastic, creative and sociable free spirits who see life as full of possibilities.',
      'INTJ': 'The Architect - Imaginative and strategic thinkers, with a plan for everything.',
      'INFJ': 'The Advocate - Quiet and mystical, yet very inspiring and tireless idealists.',
      'ENTP': 'The Debater - Smart and curious thinkers who cannot resist an intellectual challenge.',
      'INFP': 'The Mediator - Poetic, kind and altruistic people, always eager to help a good cause.',
      'ENTJ': 'The Commander - Bold, imaginative and strong-willed leaders, always finding a way.',
      'INTP': 'The Thinker - Innovative inventors with an unquenchable thirst for knowledge.',
      'ENFJ': 'The Protagonist - Charismatic and inspiring leaders, able to mesmerize listeners.'
    };
    
    const baseType = type?.substring(0, 4);
    return descriptions[baseType] || 'A unique and interesting personality type.';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerShadow}>
        <LinearGradient
          colors={['#F8FBFF', '#F8FBFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#4A2C6D" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>{match.name}</Text>
          
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#4A2C6D" />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Photo carousel */}
        {renderPhotoCarousel()}

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
        {match.aboutMe && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Me</Text>
            <Text style={styles.aboutText}>{match.aboutMe}</Text>
          </View>
        )}

        {/* Compatibility analysis */}
        {renderCompatibilitySection()}

        {/* Personality */}
        {renderPersonalitySection()}

        {/* Core values */}
        {renderVirtuesSection()}

        {/* Interests */}
        {renderInterestsSection()}

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Fixed bottom action button */}
      <View style={[styles.actionContainer, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity style={styles.chatButton} onPress={navigateToChat}>
          <LinearGradient
            colors={['#9b59b6', '#8e44ad']}
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
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 44, 109, 0.1)',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A2C6D',
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
  photoIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  photoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activePhotoIndicator: {
    backgroundColor: 'white',
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
  compatibilityScoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  compatibilityScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  compatibilityRating: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 4,
  },
  compatibilityFactors: {
    marginBottom: 16,
  },
  compatibilityFactor: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#9b59b6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  factorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  factorScore: {
    backgroundColor: '#9b59b6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  factorScoreText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  factorExplanation: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  insightsContainer: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    marginBottom: 4,
  },
  personalityContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  personalityType: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9b59b6',
    marginBottom: 8,
  },
  personalityDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  virtuesContainer: {
    gap: 12,
  },
  virtueItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  virtueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  virtueDescription: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3498db',
  },
  interestText: {
    fontSize: 14,
    color: '#3498db',
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