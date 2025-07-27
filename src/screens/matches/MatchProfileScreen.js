import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS } from '../../styles/globalStyles';

export default function MatchProfileScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  
  // Sample match data - this would come from route params
  const match = route?.params?.match || {
    id: 'match1',
    name: 'Emma',
    age: 24,
    location: 'New York, NY',
    personalityType: 'ENFP-A',
    aboutMe: 'Love exploring new places and trying different cuisines. Always up for an adventure and deep conversations about life, art, and everything in between.',
    interests: ['Art', 'Travel', 'Philosophy', 'Photography', 'Music'],
    photos: ['https://i.pravatar.cc/400?img=44'],
    virtueProfile: {
      getTopVirtues: () => [
        { virtue: 'CREATIVITY', score: 0.88, customTerm: 'artistic expression' },
        { virtue: 'CURIOSITY', score: 0.82, customTerm: 'love of learning' },
        { virtue: 'KINDNESS', score: 0.79, customTerm: 'compassion' }
      ]
    }
  };

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
        </View>
        <View style={styles.personalityContainer}>
          <Text style={styles.personalityType}>{match.personalityType}</Text>
          <Text style={styles.personalityDescription}>
            {getPersonalityDescription(match.personalityType)}
          </Text>
        </View>
      </View>
    );
  };

  const renderVirtueProfileSection = () => {
    const virtues = match.virtueProfile?.getTopVirtues() || [];
    
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
          <View style={styles.emptySection}>
            <Text style={styles.emptyText}>Core values will appear here as we learn more about {match.name}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderInterestsSection = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interests</Text>
        <View style={styles.interestsContainer}>
          {(match.interests || []).map((interest, index) => (
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
        <Text style={styles.sectionTitle}>Basic Info</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Age:</Text>
          <Text style={styles.infoValue}>{match.age}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Location:</Text>
          <Text style={styles.infoValue}>{match.location}</Text>
        </View>
      </View>
    );
  };

  const renderAboutSection = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About {match.name}</Text>
        <Text style={styles.aboutText}>{match.aboutMe}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with cotton candy gradient - exactly like ProfileScreen */}
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
            <Ionicons name="chevron-back" size={28} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.soulHeading}>{match.name}</Text>
        </LinearGradient>
      </View>

      {/* Content with cotton candy gradient background - exactly like ProfileScreen */}
      <LinearGradient
        colors={GRADIENTS.cottonCandyMain}
        locations={[0, 0.33, 0.66, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.contentContainer}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Header - exactly like ProfileScreen */}
          <View style={styles.profileHeader}>
            <View style={styles.profilePictureContainer}>
              <View style={styles.profilePicture}>
                {match.photos && match.photos[0] ? (
                  <Image 
                    source={{ uri: match.photos[0] }} 
                    style={{ width: 120, height: 120, borderRadius: 60 }}
                  />
                ) : (
                  <Ionicons name="person" size={60} color="rgba(255, 255, 255, 0.7)" />
                )}
              </View>
            </View>
            <Text style={styles.profileName}>{match.name}</Text>
            <Text style={styles.profileAge}>{match.age}</Text>
          </View>

          {/* About Me */}
          {renderAboutSection()}

          {/* Basic Info */}
          {renderBasicInfoSection()}

          {/* Core Values */}
          {renderVirtueProfileSection()}

          {/* Personality Type */}
          {renderPersonalitySection()}

          {/* Interests */}
          {renderInterestsSection()}

          <View style={{ height: 100 }} />
        </ScrollView>
      </LinearGradient>

      {/* Bottom Toolbar - exactly like ProfileScreen */}
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

// Styles copied and adapted from ProfileScreen
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
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  soulHeading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A90E2',
    letterSpacing: 1
  },

  // Profile header styles
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  profilePictureContainer: {
    marginBottom: 16,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  profileName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  profileAge: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },

  // Section styles
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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

  // About section
  aboutText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
  },

  // Basic info section
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  // Virtue profile styles
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
    color: '#FFFFFF',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  virtueScore: {
    fontSize: 16,
    color: COLORS.secondary,
    fontWeight: 'bold',
  },

  // Personality section
  personalityContainer: {
    alignItems: 'center',
  },
  personalityType: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  personalityDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Interests section
  interestsContainer: {
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

  // Empty states
  emptySection: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Toolbar styles
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
});