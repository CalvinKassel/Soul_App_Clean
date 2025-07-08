import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Import our AI components
import { VirtueProfile, VirtueCategories } from '../models/VirtueProfile';

export default function ProfileScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [showYouModal, setShowYouModal] = useState(false);
  const [youText, setYouText] = useState('');

  // Enhanced profile state with AI-learned data (NO personality assessment)
  const [profile, setProfile] = useState({
    name: 'You',
    age: '25',
    height: '5\'8"',
    location: 'New York, NY',
    ethnicity: 'Mixed',
    personalityType: null, // Determined through AI conversation, not tests
    interests: ['Travel', 'Photography', 'Cooking', 'Music', 'Fitness', 'Reading'],
    aboutMe: 'Love exploring new places and trying different cuisines. Always up for an adventure and deep conversations.',
    photos: [
      'https://i.pravatar.cc/400?img=8',
      'https://i.pravatar.cc/400?img=9'
    ],
    socialConnections: {
      instagram: false,
      spotify: false,
      linkedin: false,
      chatgpt: false,
    },
    aiLearnings: {
      discoveredTraits: ['Creative', 'Adventurous', 'Thoughtful'],
      virtueProfile: new VirtueProfile('user123'),
      conversationPatterns: ['Asks deep questions', 'Values authenticity'],
      lastUpdated: new Date()
    }
  });

  const virtueProfile = profile.aiLearnings.virtueProfile;

  const saveYouText = () => {
    setProfile(prev => ({
      ...prev,
      aboutMe: youText
    }));
    setShowYouModal(false);
    Alert.alert('Saved', 'Your profile has been updated.');
  };

  const toggleSocialConnection = (platform) => {
    setProfile(prev => ({
      ...prev,
      socialConnections: {
        ...prev.socialConnections,
        [platform]: !prev.socialConnections[platform]
      }
    }));
  };

  const getPersonalityDescription = (type) => {
    if (!type) return "Soul AI is learning about your personality through your conversations.";
    
    const descriptions = {
      'INFP': 'The Mediator - Creative and idealistic',
      'ENFP': 'The Campaigner - Enthusiastic and creative',
      'INFJ': 'The Advocate - Insightful and principled',
      'ENFJ': 'The Protagonist - Charismatic and inspiring',
      'ISFP': 'The Adventurer - Artistic and curious',
      'ESFP': 'The Entertainer - Spontaneous and enthusiastic',
      'ISTP': 'The Virtuoso - Bold and practical',
      'ESTP': 'The Entrepreneur - Smart and energetic',
      'ISFJ': 'The Protector - Warm-hearted and dedicated',
      'ESFJ': 'The Consul - Caring and social',
      'ISTJ': 'The Logistician - Practical and fact-minded',
      'ESTJ': 'The Executive - Efficient and hardworking',
      'INTJ': 'The Architect - Imaginative and strategic',
      'ENTJ': 'The Commander - Bold and strong-willed',
      'INTP': 'The Thinker - Innovative and curious',
      'ENTP': 'The Debater - Smart and curious'
    };
    
    return descriptions[type] || 'Unique personality discovered through AI';
  };

  const ProfileDetail = ({ label, value }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  const SocialConnection = ({ platform, connected, onToggle, icon }) => (
    <TouchableOpacity style={styles.socialItem} onPress={onToggle}>
      <View style={styles.socialInfo}>
        <Ionicons name={icon} size={24} color="#0077B6" />
        <Text style={styles.socialText}>
          {platform.charAt(0).toUpperCase() + platform.slice(1)}
        </Text>
      </View>
      <Ionicons 
        name={connected ? 'checkmark-circle' : 'add-circle-outline'} 
        size={24} 
        color={connected ? '#0077B6' : '#999'} 
      />
    </TouchableOpacity>
  );

  const renderPersonalitySection = () => {
    if (!profile.personalityType) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧠 Personality Discovery</Text>
          <View style={styles.personalityContainer}>
            <Text style={styles.personalityDescription}>
              Soul AI is learning about your personality through your conversations. 
              Keep chatting to discover more insights about yourself!
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧠 Personality Type</Text>
        <View style={styles.personalityContainer}>
          <Text style={styles.personalityType}>{profile.personalityType}</Text>
          <Text style={styles.personalityDescription}>
            {getPersonalityDescription(profile.personalityType)}
          </Text>
        </View>
      </View>
    );
  };

  const renderAIInsights = () => {
    const topVirtues = virtueProfile.getTopVirtues(3);
    const { aiLearnings } = profile;

    if (topVirtues.length === 0 && aiLearnings.discoveredTraits.length === 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 Soul AI Insights</Text>
          <View style={styles.aiInsightsEmpty}>
            <Text style={styles.aiInsightsEmptyText}>
              Chat with Soul AI to discover insights about your personality and values!
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🤖 Soul AI Insights</Text>
        
        {/* Discovered Traits */}
        {aiLearnings.discoveredTraits.length > 0 && (
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Discovered Traits</Text>
            <View style={styles.traitsList}>
              {aiLearnings.discoveredTraits.map((trait, index) => (
                <View key={index} style={styles.traitTag}>
                  <Text style={styles.traitText}>{trait}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Top Virtues */}
        {topVirtues.length > 0 && (
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Core Values</Text>
            {topVirtues.map((virtue, index) => (
              <View key={index} style={styles.virtueItem}>
                <Text style={styles.virtueName}>
                  {virtue.customTerm || VirtueCategories[virtue.virtue]?.name || virtue.virtue}
                </Text>
                <Text style={styles.virtueScore}>
                  {Math.round(virtue.score * 100)}% strength
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Conversation Patterns */}
        {aiLearnings.conversationPatterns.length > 0 && (
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Communication Style</Text>
            {aiLearnings.conversationPatterns.map((pattern, index) => (
              <Text key={index} style={styles.patternText}>• {pattern}</Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerShadow}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Text style={styles.soulHeading}>Soul</Text>
        </View>
      </View>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profilePictureContainer}>
            <View style={styles.profilePicture}>
              <Ionicons name="person" size={40} color="#0077B6" />
            </View>
            <TouchableOpacity style={styles.editPhotoButton}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileAge}>{profile.age} years old</Text>
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Basic Info</Text>
          <ProfileDetail label="Height" value={profile.height} />
          <ProfileDetail label="Location" value={profile.location} />
          <ProfileDetail label="Ethnicity" value={profile.ethnicity} />
        </View>

        {/* About Me Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💭 About You</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {
                setYouText(profile.aboutMe);
                setShowYouModal(true);
              }}
            >
              <Ionicons name="create-outline" size={20} color="#0077B6" />
            </TouchableOpacity>
          </View>
          <Text style={styles.aboutText}>{profile.aboutMe}</Text>
        </View>

        {/* Personality Section */}
        {renderPersonalitySection()}

        {/* AI Insights Section */}
        {renderAIInsights()}

        {/* Interests Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Interests</Text>
          <View style={styles.interestsList}>
            {profile.interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Social Connections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔗 Connect Your Accounts</Text>
          <SocialConnection 
            platform="instagram"
            connected={profile.socialConnections.instagram}
            onToggle={() => toggleSocialConnection('instagram')}
            icon="logo-instagram"
          />
          <SocialConnection 
            platform="spotify"
            connected={profile.socialConnections.spotify}
            onToggle={() => toggleSocialConnection('spotify')}
            icon="musical-notes"
          />
          <SocialConnection 
            platform="linkedin"
            connected={profile.socialConnections.linkedin}
            onToggle={() => toggleSocialConnection('linkedin')}
            icon="logo-linkedin"
          />
          <SocialConnection 
            platform="chatgpt"
            connected={profile.socialConnections.chatgpt}
            onToggle={() => toggleSocialConnection('chatgpt')}
            icon="chatbubbles"
          />
        </View>

        {/* Extra padding for bottom toolbar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* You Modal */}
      <Modal
        visible={showYouModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowYouModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>About You</Text>
            <TouchableOpacity onPress={saveYouText}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.youTextInput}
            value={youText}
            onChangeText={setYouText}
            placeholder="Tell Soul about yourself - your life experiences, personal preferences, and anything that makes you unique..."
            placeholderTextColor="#666"
            multiline
            textAlignVertical="top"
          />
        </SafeAreaView>
      </Modal>

      {/* Fixed Bottom Toolbar - CORRECT ICON SIZES */}
      <View style={[styles.toolbarContainer, { paddingBottom: insets.bottom }]}>
        <View style={styles.toolbar}>
          <TouchableOpacity
            style={styles.toolbarIcon}
            onPress={() => navigation?.navigate?.('SoulChatScreen')}
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
            <View style={styles.iconContainer}>
              <Image 
                source={require('../../../assets/icons/list.png')}
                style={{ width: 38, height: 38 }}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarIcon}>
            <View style={[styles.iconContainer, styles.activeIcon]}>
              <Image 
                source={require('../../../assets/icons/profile-active.png')}
                style={{ width: 38, height: 38 }}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  contentContainer: {
    flex: 1,
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
    backgroundColor: '#fff',
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  soulHeading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0077B6',
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
    backgroundColor: '#CAF0F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 16,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0077B6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0077B6',
    marginBottom: 4,
  },
  profileAge: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 24,
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
    color: '#0077B6',
    marginBottom: 12,
  },
  subsection: {
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A2C6D',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    color: '#0077B6',
    fontWeight: '500',
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  editButton: {
    padding: 4,
  },
  personalityContainer: {
    backgroundColor: '#F8FBFF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0077B6',
  },
  personalityType: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0077B6',
    marginBottom: 8,
  },
  personalityDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  aiInsightsEmpty: {
    backgroundColor: '#F8FBFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  aiInsightsEmptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  traitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  traitTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  traitText: {
    fontSize: 14,
    color: '#0077B6',
    fontWeight: '500',
  },
  virtueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  virtueName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  virtueScore: {
    fontSize: 14,
    color: '#0077B6',
    fontWeight: '600',
  },
  patternText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#B8E6FF',
  },
  interestText: {
    fontSize: 14,
    color: '#0077B6',
    fontWeight: '500',
  },
  socialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  socialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalCancel: {
    fontSize: 16,
    color: '#999',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0077B6',
  },
  modalSave: {
    fontSize: 16,
    color: '#0077B6',
    fontWeight: '600',
  },
  youTextInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
  },
  bottomPadding: {
    height: 20,
  },
  toolbarContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  toolbarIcon: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  activeIcon: {
    backgroundColor: '#5A9BD4',
  },
});