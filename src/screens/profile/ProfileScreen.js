import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS } from '../../styles/globalStyles';

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  
  // Sample user data - this would come from your user state/context
  const [userData] = useState({
    name: 'Alex',
    age: 25,
    location: 'New York, NY',
    personalityType: 'INTJ-A',
    aboutMe: 'Passionate about technology, philosophy, and meaningful connections. Always looking to learn and grow.',
    interests: ['Technology', 'Philosophy', 'Reading', 'Hiking', 'Photography'],
    photos: ['https://i.pravatar.cc/400?img=8'],
    virtueProfile: {
      getTopVirtues: () => [
        { virtue: 'WISDOM', score: 0.85, customTerm: 'intellectual curiosity' },
        { virtue: 'JUSTICE', score: 0.78, customTerm: 'fairness' },
        { virtue: 'TEMPERANCE', score: 0.72, customTerm: 'balance' }
      ]
    },
    // HHC Data
    hhcData: {
      vector: Array(256).fill(0).map(() => Math.random()), // Sample HHC vector
      code: 'HHC:7A4B-E9C2',
      confidence: 0.87,
      generated_at: new Date().toISOString(),
      version: '2.0'
    }
  });

  const renderPersonalitySection = () => {
    const getPersonalityDescription = (type) => {
      const descriptions = {
        'INTJ': 'The Architect - Imaginative and strategic thinkers, with a plan for everything.',
        'ENFP': 'The Campaigner - Enthusiastic, creative and sociable free spirit.',
        'INFP': 'The Mediator - Poetic, kind and altruistic people, always eager to help.',
        'ENTJ': 'The Commander - Bold, imaginative and strong-willed leaders.',
        'INTP': 'The Thinker - Innovative inventors with an unquenchable thirst for knowledge.'
      };
      
      const baseType = type?.substring(0, 4);
      return descriptions[baseType] || 'A unique and interesting personality type.';
    };

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personality Type</Text>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.personalityContainer}>
          <Text style={styles.personalityType}>{userData.personalityType}</Text>
          <Text style={styles.personalityDescription}>
            {getPersonalityDescription(userData.personalityType)}
          </Text>
        </View>
      </View>
    );
  };

  const renderVirtueProfileSection = () => {
    const virtues = userData.virtueProfile?.getTopVirtues() || [];
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Core Values</Text>
        </View>
        {virtues.length > 0 ? (
          virtues.map((virtue, index) => (
            <View key={index} style={styles.virtueItem}>
              <Text style={styles.virtueName}>
                {virtue.customTerm || virtue.virtue.toLowerCase()}
              </Text>
              <Text style={styles.virtueScore}>
                {Math.round(virtue.score * 100)}%
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.aiInsightsEmpty}>
            <Text style={styles.aiInsightsEmptyText}>
              Continue chatting with Soul AI to discover your core values and personality insights.
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderInterestsSection = () => {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Interests & Personality</Text>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.interestsList}>
          {/* Personality Type as first tag */}
          <View style={[styles.interestTag, styles.personalityTag]}>
            <Text style={styles.interestText}>{userData.personalityType}</Text>
          </View>
          {/* Regular interests */}
          {userData.interests.map((interest, index) => (
            <View key={index} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderBasicInfoSection = () => {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Basic Info</Text>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Age</Text>
          <Text style={styles.detailValue}>{userData.age}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Location</Text>
          <Text style={styles.detailValue}>{userData.location}</Text>
        </View>
      </View>
    );
  };

  const renderAboutSection = () => {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.aboutText}>{userData.aboutMe}</Text>
      </View>
    );
  };

  const renderYouSection = () => {
    const [experienceText, setExperienceText] = useState('');
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>You</Text>
        <View style={styles.youContainer}>
          <TextInput
            style={styles.experienceInput}
            placeholder="Share some life experiences or preferences to help soulai provide better recommendations"
            placeholderTextColor={COLORS.textPlaceholder}
            value={experienceText}
            onChangeText={setExperienceText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </View>
    );
  };

  // HHC Stamp Component
  const renderHHCStamp = () => {
    if (!userData.hhcData) return null;

    return (
      <View style={styles.hhcStampContainer}>
        <Text style={styles.hhcStampText}>{userData.hhcData.code}</Text>
        <Text style={styles.hhcStampVersion}>v{userData.hhcData.version}</Text>
      </View>
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      {/* Header with cotton candy gradient */}
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

      {/* Content with cotton candy gradient background */}
      <LinearGradient
        colors={GRADIENTS.cottonCandyMain}
        locations={[0, 0.33, 0.66, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.contentContainer}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.profilePictureContainer}>
              <View style={styles.profilePicture}>
                {userData.photos && userData.photos[0] ? (
                  <Image 
                    source={{ uri: userData.photos[0] }} 
                    style={{ width: 120, height: 120, borderRadius: 60 }}
                  />
                ) : (
                  <Ionicons name="person" size={60} color="rgba(255, 255, 255, 0.7)" />
                )}
              </View>
              <TouchableOpacity style={styles.editPhotoButton}>
                <Ionicons name="camera" size={18} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={styles.profileName}>{userData.name}</Text>
            <Text style={styles.profileAge}>{userData.age}</Text>
          </View>

          {/* You Section */}
          {renderYouSection()}

          {/* About Me */}
          {renderAboutSection()}

          {/* Basic Info */}
          {renderBasicInfoSection()}

          {/* Core Values */}
          {renderVirtueProfileSection()}

          {/* Interests & Personality */}
          {renderInterestsSection()}

          <View style={{ height: 100 }} />
        </ScrollView>
      </LinearGradient>

      {/* Bottom Toolbar - Full width gradient */}
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
            onPress={() => navigation?.navigate?.('MatchesStack')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="list" size={24} color="rgba(255, 255, 255, 0.6)" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarIcon}>
            <View style={[styles.iconContainer, styles.activeIcon]}>
              <Ionicons name="person" size={24} color="#4A2C6D" />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* HHC Stamp - positioned in bottom-right corner */}
      {renderHHCStamp()}


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A2C6D'
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
    color: COLORS.primary,
    letterSpacing: 1
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  profilePictureContainer: {
    position: 'relative',
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 16,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileAge: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subsection: {
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  detailValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  editButton: {
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  personalityContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
  },
  personalityType: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  personalityDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
  },
  aiInsightsEmpty: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  aiInsightsEmptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  traitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  traitTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  traitText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  virtueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  virtueName: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  virtueScore: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  patternText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    lineHeight: 20,
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  interestText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
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
  // New You section styles
  youContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  experienceInput: {
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 24,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  // Personality tag style
  personalityTag: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  
  // HHC Stamp Styles
  hhcStampContainer: {
    position: 'absolute',
    bottom: 110, // Above the toolbar
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
  
  // Modal Styles
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
});