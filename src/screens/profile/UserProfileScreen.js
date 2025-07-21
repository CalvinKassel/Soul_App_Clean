import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS } from '../../styles/globalStyles';
import { getRandomProfileEmojis } from '../../utils/emojiUtils';

const { width } = Dimensions.get('window');

export default function UserProfileScreen({ route, navigation }) {
  const { userId, fromMatch = false } = route.params;
  const insets = useSafeAreaInsets();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hhcModalVisible, setHhcModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [profileEmojis] = useState(() => getRandomProfileEmojis());
  const [isMatched, setIsMatched] = useState(fromMatch); // Track match status

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  // Set up header with action buttons
  useEffect(() => {
    if (!isMatched && !loading && profileData) {
      navigation.setOptions({
        headerShown: true,
        headerRight: () => renderHeaderActionButtons(),
        headerStyle: {
          backgroundColor: '#9eb7ec',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        }
      });
    } else {
      navigation.setOptions({
        headerShown: true,
        headerRight: null, // Remove buttons for matched users
      });
    }
  }, [isMatched, loading, profileData, profileEmojis]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/users/profile/${userId}/public`);
      // const data = await response.json();
      
      // Mock profile data - differentiate by userId
      const mockProfiles = {
        'demo_user_1': {
          displayName: 'Jordan',
          age: 26,
          location: 'Brooklyn, NY',
          photos: ['https://i.pravatar.cc/400?img=32', 'https://i.pravatar.cc/400?img=33'],
          interests: ['Art', 'Coffee', 'Photography', 'Literature']
        },
        'demo_user_2': {
          displayName: 'Alex',
          age: 28,
          location: 'San Francisco, CA',
          photos: ['https://i.pravatar.cc/400?img=45', 'https://i.pravatar.cc/400?img=46'],
          interests: ['Technology', 'Hiking', 'Photography', 'Startups']
        },
        'demo_user_3': {
          displayName: 'Casey',
          age: 24,
          location: 'Austin, TX',
          photos: ['https://i.pravatar.cc/400?img=38', 'https://i.pravatar.cc/400?img=39'],
          interests: ['Writing', 'Travel', 'Music', 'Food']
        }
      };
      
      const baseProfile = mockProfiles[userId] || mockProfiles['demo_user_1'];
      const mockProfile = {
        userId: userId,
        displayName: baseProfile.displayName,
        age: baseProfile.age,
        location: baseProfile.location,
        photos: baseProfile.photos,
        aiGeneratedContent: {
          bio: 'A creative soul with a passion for art, good coffee, and meaningful conversations. Always up for an adventure.',
          personalitySummary: 'Warm, empathetic, and intellectually curious. Values authenticity and deep connections over surface-level interactions.',
          valuesStatement: 'Believes in the power of kindness, continuous learning, and making a positive impact on the world.',
          relationshipPhilosophy: 'Seeks a genuine partnership built on mutual respect, shared growth, and emotional intimacy.',
          communicationStyle: 'Direct yet compassionate communicator who values active listening and thoughtful dialogue.',
          lifestyleNarrative: 'Enjoys a balanced lifestyle mixing creative pursuits, outdoor activities, and quality time with loved ones.',
          partnerCriteria: 'Looking for someone emotionally intelligent, adventurous, and committed to personal growth.'
        },
        interests: baseProfile.interests,
        values: ['Authenticity', 'Creativity', 'Growth', 'Compassion'],
        personalityType: 'INFP-T',
        youSection: 'I grew up in a family of artists and learned early that creativity is about more than just making things—it\'s about connecting with others and expressing your authentic self. My travels through Southeast Asia last year taught me the value of embracing uncertainty and finding beauty in unexpected places.',
        matchingPreferences: {
          ageRange: { min: 24, max: 32 },
          maxDistance: 25,
          relationshipGoals: 'long_term_partnership'
        },
        hhcStamp: 'HHC:A7D2-F8E1',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        profileVersion: '2.1',
        profileCompleteness: 92
      };
      
      setProfileData(mockProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
      // TODO: Show error message to user
    } finally {
      setLoading(false);
    }
  };

  const handleImagePress = (index) => {
    setSelectedImageIndex(index);
    setImageModalVisible(true);
  };

  const handleLike = async () => {
    try {
      // TODO: Implement actual like functionality
      console.log('Like sent to user:', userId);
      
      // Simulate match result - in real app, this would come from API
      const isMatch = Math.random() > 0.5; // 50% chance of match
      
      if (isMatch) {
        setIsMatched(true); // This will hide the buttons
        // Show match notification or navigate to match screen
        console.log('🎉 It\'s a match!');
      }
      
      // Don't go back immediately if it's a match - let user see the profile
      if (!isMatch) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error sending like:', error);
    }
  };

  const handlePass = async () => {
    try {
      console.log('Passed on user:', userId);
      navigation.goBack();
    } catch (error) {
      console.error('Error passing user:', error);
    }
  };

  // Render small header action buttons
  const renderHeaderActionButtons = () => {
    return (
      <View style={styles.headerActionButtons}>
        <TouchableOpacity 
          style={[styles.headerActionButton, styles.headerLikeButton]}
          onPress={handleLike}
          activeOpacity={0.7}
        >
          <Text style={styles.headerActionEmoji}>{profileEmojis.like}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.headerActionButton, styles.headerPassButton]}
          onPress={handlePass}
          activeOpacity={0.7}
        >
          <Text style={styles.headerActionEmoji}>{profileEmojis.pass}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPhotoSection = () => {
    if (!profileData?.photos || profileData.photos.length === 0) return null;

    return (
      <View style={styles.photoSection}>
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          style={styles.photoCarousel}
        >
          {profileData.photos.map((photo, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleImagePress(index)}
              style={styles.photoContainer}
            >
              <Image source={{ uri: photo }} style={styles.photo} />
              {profileData.photos.length > 1 && (
                <View style={styles.photoIndicator}>
                  <Text style={styles.photoIndicatorText}>
                    {index + 1}/{profileData.photos.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderBasicInfo = () => {
    return (
      <View style={styles.section}>
        <View style={styles.nameSection}>
          <Text style={styles.name}>{profileData.displayName}</Text>
          <Text style={styles.age}>{profileData.age}</Text>
        </View>
        <View style={styles.locationSection}>
          <Ionicons name="location-outline" size={16} color="rgba(255, 255, 255, 0.8)" />
          <Text style={styles.location}>{profileData.location}</Text>
        </View>
        {profileData.lastActive && (
          <Text style={styles.lastActive}>
            Active {getTimeAgo(profileData.lastActive)}
          </Text>
        )}
      </View>
    );
  };

  const renderAIContent = () => {
    const { aiGeneratedContent } = profileData;
    if (!aiGeneratedContent) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bioText}>{aiGeneratedContent.bio}</Text>
        
        <View style={styles.aiInsightSection}>
          <Text style={styles.aiInsightTitle}>Personality Insights</Text>
          <Text style={styles.aiInsightText}>{aiGeneratedContent.personalitySummary}</Text>
        </View>

        <View style={styles.aiInsightSection}>
          <Text style={styles.aiInsightTitle}>Values & Philosophy</Text>
          <Text style={styles.aiInsightText}>{aiGeneratedContent.valuesStatement}</Text>
        </View>

        <View style={styles.aiInsightSection}>
          <Text style={styles.aiInsightTitle}>Relationship Approach</Text>
          <Text style={styles.aiInsightText}>{aiGeneratedContent.relationshipPhilosophy}</Text>
        </View>
      </View>
    );
  };

  const renderYouSection = () => {
    if (!profileData?.youSection) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Their Story</Text>
        <Text style={styles.youSectionText}>{profileData.youSection}</Text>
      </View>
    );
  };

  const renderInterestsAndValues = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interests & Values</Text>
        
        {/* Personality Type */}
        {profileData.personalityType && (
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Personality</Text>
            <View style={[styles.tag, styles.personalityTag]}>
              <Text style={styles.tagText}>{profileData.personalityType}</Text>
            </View>
          </View>
        )}

        {/* Interests */}
        {profileData.interests && profileData.interests.length > 0 && (
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Interests</Text>
            <View style={styles.tagContainer}>
              {profileData.interests.map((interest, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Values */}
        {profileData.values && profileData.values.length > 0 && (
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Core Values</Text>
            <View style={styles.tagContainer}>
              {profileData.values.map((value, index) => (
                <View key={index} style={[styles.tag, styles.valueTag]}>
                  <Text style={styles.tagText}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderHHCStamp = () => {
    if (!profileData?.hhcStamp) return null;

    return (
      <View style={styles.hhcStampContainer}>
        <Text style={styles.hhcStampText}>{profileData.hhcStamp}</Text>
        <Text style={styles.hhcStampVersion}>v{profileData.profileVersion}</Text>
      </View>
    );
  };

  const renderHHCModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={hhcModalVisible}
        onRequestClose={() => setHhcModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Human Hex Code (HHC)</Text>
              <TouchableOpacity 
                onPress={() => setHhcModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalText}>
                The <Text style={styles.modalBoldText}>Human Hex Code (HHC)</Text> is a unique personality signature that captures the essence of this person's character, preferences, and behavioral patterns.
              </Text>
              
              <Text style={styles.modalSubheading}>What it represents:</Text>
              <Text style={styles.modalBullet}>• Personality traits and communication style</Text>
              <Text style={styles.modalBullet}>• Core values and relationship preferences</Text>
              <Text style={styles.modalBullet}>• Lifestyle patterns and interests</Text>
              <Text style={styles.modalBullet}>• Compatibility factors for matching</Text>
              
              <Text style={styles.modalSubheading}>Your AI's Analysis:</Text>
              <Text style={styles.modalText}>
                Based on this HHC, your AI has analyzed compatibility factors and can provide insights about potential connection strengths and areas of mutual interest.
              </Text>
              
              <View style={styles.modalStatsContainer}>
                <View style={styles.modalStat}>
                  <Text style={styles.modalStatLabel}>Profile Completeness</Text>
                  <Text style={styles.modalStatValue}>{profileData?.profileCompleteness}%</Text>
                </View>
                <View style={styles.modalStat}>
                  <Text style={styles.modalStatLabel}>HHC Version</Text>
                  <Text style={styles.modalStatValue}>{profileData?.profileVersion}</Text>
                </View>
              </View>
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setHhcModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderImageModal = () => {
    if (!profileData?.photos) return null;

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={imageModalVisible}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity 
            style={styles.imageModalCloseArea}
            onPress={() => setImageModalVisible(false)}
            activeOpacity={1}
          >
            <View style={styles.imageModalContainer}>
              <Image 
                source={{ uri: profileData.photos[selectedImageIndex] }} 
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.imageModalCloseButton}
            onPress={() => setImageModalVisible(false)}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };


  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#cbbaf1', '#cbbaf1', '#e8bef3', '#B8E6FF', '#9eb7ec']}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!profileData) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#cbbaf1', '#cbbaf1', '#e8bef3', '#B8E6FF', '#9eb7ec']}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.loadingContainer}
        >
          <Text style={styles.errorText}>Unable to load profile</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    );
  }

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
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#4A90E2" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{profileData.displayName}</Text>
        </LinearGradient>
      </View>

      {/* Content */}
      <LinearGradient
        colors={['#cbbaf1', '#cbbaf1', '#e8bef3', '#B8E6FF', '#9eb7ec']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.contentContainer}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderPhotoSection()}
          {renderBasicInfo()}
          {renderAIContent()}
          {renderYouSection()}
          {renderInterestsAndValues()}
          <View style={{ height: 120 }} />
        </ScrollView>
      </LinearGradient>

      {/* Action buttons now in header */}

      {/* HHC Stamp */}
      {renderHHCStamp()}

      {/* Modals */}
      {renderHHCModal()}
      {renderImageModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A2C6D'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)'
  },
  errorText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 16
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
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
  backButton: {
    marginRight: 12
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4A90E2',
    letterSpacing: 1
  },
  contentContainer: {
    flex: 1,
  },
  photoSection: {
    height: 400,
  },
  photoCarousel: {
    flex: 1,
  },
  photoContainer: {
    width: width,
    height: 400,
    position: 'relative'
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  photoIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  photoIndicatorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)'
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 12
  },
  age: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500'
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  location: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4
  },
  lastActive: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16
  },
  aiInsightSection: {
    marginBottom: 16
  },
  aiInsightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6
  },
  aiInsightText: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.8)'
  },
  youSectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic'
  },
  subsection: {
    marginBottom: 16
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  personalityTag: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
    alignSelf: 'flex-start'
  },
  valueTag: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent
  },
  tagText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500'
  },
  // Header action buttons (smaller, in top-right corner)
  headerActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 4,
  },
  headerActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLikeButton: {
    // Default styling
  },
  headerPassButton: {
    // Default styling  
  },
  headerActionEmoji: {
    fontSize: 16, // Smaller than original 24
    color: '#FFFFFF',
  },
  hhcStampContainer: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    backgroundColor: 'transparent',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  hhcStampText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  hhcStampVersion: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.3)',
    textAlign: 'center',
    marginTop: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 0,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  modalCloseButton: {
    padding: 5,
  },
  modalContent: {
    padding: 20,
    maxHeight: 400,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  modalBoldText: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  modalSubheading: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  modalBullet: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
    marginLeft: 8,
    marginBottom: 4,
  },
  modalStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  modalStat: {
    alignItems: 'center',
  },
  modalStatLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  modalStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    margin: 20,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageModalCloseArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageModalContainer: {
    width: '90%',
    height: '80%'
  },
  fullscreenImage: {
    width: '100%',
    height: '100%'
  },
  imageModalCloseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8
  }
});