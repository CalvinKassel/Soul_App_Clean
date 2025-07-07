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

  // Enhanced profile state with AI-learned data
  const [profile, setProfile] = useState({
    name: 'You',
    age: '25',
    height: '5\'8"',
    location: 'New York, NY',
    ethnicity: 'Mixed',
    personalityType: null, // Set by AI after assessment
    interests: ['Travel', 'Photography', 'Cooking', 'Music', 'Fitness', 'Reading'],
    aboutMe: 'Love exploring new places and trying different cuisines. Always up for an adventure and deep conversations.',
    aiLearnings: {
      discoveredTraits: [],
      valueInsights: [],
      conversationStyle: null,
      lastUpdated: null
    },
    socialConnections: {
      instagram: false,
      facebook: false,
      chatgpt: false,
    }
  });

  // Mock virtue profile - in real app this would come from Soul AI
  const [virtueProfile, setVirtueProfile] = useState(new VirtueProfile('user123'));

  useEffect(() => {
    // Load any AI discoveries from Soul AI conversations
    loadAIDiscoveries();
  }, []);

  const loadAIDiscoveries = () => {
    // In a real app, this would load from Soul AI's learning system
    // For demo, we'll simulate some discovered insights
    setProfile(prev => ({
      ...prev,
      aiLearnings: {
        discoveredTraits: [
          'Values authenticity in relationships',
          'Prefers deep conversations over small talk',
          'Seeks intellectual stimulation',
        ],
        valueInsights: [
          'Highly values wisdom and continuous learning',
          'Prioritizes kindness and empathy',
          'Appreciates honesty and direct communication'
        ],
        conversationStyle: 'Thoughtful and reflective',
        lastUpdated: new Date()
      }
    }));

    // Simulate learned virtues
    virtueProfile.updateVirtueScore('WISDOM', 0.9, 'ai_learning', 'Values learning and growth');
    virtueProfile.updateVirtueScore('HUMANITY', 0.8, 'ai_learning', 'Shows empathy and kindness');
    virtueProfile.updateVirtueScore('INTEGRITY', 0.85, 'ai_learning', 'Values honesty and authenticity');
  };

  const saveYouText = () => {
    setProfile({ ...profile, aboutMe: youText });
    setShowYouModal(false);
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

  const navigateToPersonalityTest = () => {
    navigation.navigate('PersonalityAssessment', {
      onComplete: (personalityType, testAnswers) => {
        setProfile(prev => ({
          ...prev,
          personalityType,
          aiLearnings: {
            ...prev.aiLearnings,
            lastUpdated: new Date()
          }
        }));
        Alert.alert(
          'Assessment Complete!', 
          `Your personality type is ${personalityType}. Soul AI will use this to provide better guidance.`
        );
      },
      onCancel: () => {
        // User cancelled, no action needed
      }
    });
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
          <View style={styles.personalityPrompt}>
            <Text style={styles.personalityPromptTitle}>🧠 Discover Your Personality</Text>
            <Text style={styles.personalityPromptText}>
              Take a quick assessment to help Soul AI understand you better and find more compatible matches.
            </Text>
            <TouchableOpacity 
              style={styles.personalityTestButton}
              onPress={navigateToPersonalityTest}
            >
              <Text style={styles.personalityTestButtonText}>Take Personality Assessment</Text>
            </TouchableOpacity>
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
          <TouchableOpacity 
            style={styles.retakeTestButton}
            onPress={navigateToPersonalityTest}
          >
            <Text style={styles.retakeTestText}>Retake Assessment</Text>
          </TouchableOpacity>
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
        
        {/* Core values discovered by AI */}
        {topVirtues.length > 0 && (
          <View style={styles.aiInsightGroup}>
            <Text style={styles.aiInsightGroupTitle}>Your Core Values</Text>
            {topVirtues.map((virtue, index) => {
              const virtueData = VirtueCategories[virtue.virtue];
              const displayName = virtue.customTerm || virtueData?.name || virtue.virtue;
              
              return (
                <View key={index} style={styles.aiInsightItem}>
                  <Text style={styles.aiInsightText}>✨ {displayName}</Text>
                  <View style={styles.confidenceBar}>
                    <View 
                      style={[
                        styles.confidenceFill, 
                        { width: `${virtue.score * 100}%` }
                      ]} 
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Discovered traits */}
        {aiLearnings.discoveredTraits.length > 0 && (
          <View style={styles.aiInsightGroup}>
            <Text style={styles.aiInsightGroupTitle}>Discovered Traits</Text>
            {aiLearnings.discoveredTraits.map((trait, index) => (
              <View key={index} style={styles.aiInsightItem}>
                <Text style={styles.aiInsightText}>• {trait}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Value insights */}
        {aiLearnings.valueInsights.length > 0 && (
          <View style={styles.aiInsightGroup}>
            <Text style={styles.aiInsightGroupTitle}>What You Value</Text>
            {aiLearnings.valueInsights.map((insight, index) => (
              <View key={index} style={styles.aiInsightItem}>
                <Text style={styles.aiInsightText}>💝 {insight}</Text>
              </View>
            ))}
          </View>
        )}

        {aiLearnings.lastUpdated && (
          <Text style={styles.aiInsightsUpdated}>
            Last updated: {aiLearnings.lastUpdated.toLocaleDateString()}
          </Text>
        )}
      </View>
    );
  };

  const getPersonalityDescription = (type) => {
    const descriptions = {
      'ENFP-A': 'The Assertive Campaigner - Enthusiastic, creative, and confident in social situations.',
      'ENFP-T': 'The Turbulent Campaigner - Enthusiastic and creative, with a drive for self-improvement.',
      'INTJ-A': 'The Assertive Architect - Strategic and confident, with a clear vision.',
      'INTJ-T': 'The Turbulent Architect - Strategic and visionary, always seeking to improve.',
      'INFJ-A': 'The Assertive Advocate - Idealistic and confident in their vision.',
      'INFJ-T': 'The Turbulent Advocate - Idealistic with a strong drive for personal growth.',
    };
    
    return descriptions[type] || 'A unique and interesting personality type.';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerShadow}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Text style={styles.soulHeading}>Soul</Text>
        </View>
      </View>

      {/* Content Container */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Picture and Name */}
        <View style={styles.profileHeader}>
          <View style={styles.profilePictureContainer}>
            <View style={styles.profilePicture}>
              <Ionicons name="person" size={60} color="#0077B6" />
            </View>
            <TouchableOpacity style={styles.editPhotoButton}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{profile.name}</Text>
        </View>

        {/* Profile Details */}
        <View style={styles.section}>
          <ProfileDetail label="Age" value={profile.age} />
          <ProfileDetail label="Height" value={profile.height} />
          <ProfileDetail label="Location" value={profile.location} />
          <ProfileDetail label="Ethnicity" value={profile.ethnicity} />
        </View>

        {/* Personality Section */}
        {renderPersonalitySection()}

        {/* AI Insights Section */}
        {renderAIInsights()}

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.interestsContainer}>
            {profile.interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* You Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.youButton}
            onPress={() => {
              setYouText(profile.aboutMe);
              setShowYouModal(true);
            }}
          >
            <Text style={styles.youButtonText}>You</Text>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>
          {profile.aboutMe && (
            <Text style={styles.aboutMePreview} numberOfLines={2}>
              {profile.aboutMe}
            </Text>
          )}
        </View>

        {/* Social Connections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect Your Socials</Text>
          <SocialConnection 
            platform="instagram" 
            connected={profile.socialConnections.instagram}
            onToggle={() => toggleSocialConnection('instagram')}
            icon="logo-instagram"
          />
          <SocialConnection 
            platform="facebook" 
            connected={profile.socialConnections.facebook}
            onToggle={() => toggleSocialConnection('facebook')}
            icon="logo-facebook"
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

      {/* Fixed Bottom Toolbar */}
      <View style={[styles.toolbarContainer, { paddingBottom: insets.bottom }]}>
        <View style={styles.toolbar}>
          <TouchableOpacity
            style={styles.toolbarIcon}
            onPress={() => navigation?.navigate?.('SoulChatScreen')}
          >
            <View style={styles.iconContainer}>
              <Image 
                source={require('../../../assets/icons/soulchat.png')}
                style={{ width: 24, height: 24 }}
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
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarIcon}>
            <View style={[styles.iconContainer, styles.activeIcon]}>
              <Image 
                source={require('../../../assets/icons/profile-active.png')}
                style={{ width: 24, height: 24 }}
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
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0077B6',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#03045E',
    marginTop: 12,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#03045E',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    color: '#03045E',
    fontWeight: '500',
  },
  
  // Personality section styles
  personalityPrompt: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9b59b6',
    borderStyle: 'dashed',
  },
  personalityPromptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  personalityPromptText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 12,
  },
  personalityTestButton: {
    backgroundColor: '#9b59b6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  personalityTestButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
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
    marginBottom: 12,
  },
  retakeTestButton: {
    alignSelf: 'flex-start',
  },
  retakeTestText: {
    color: '#9b59b6',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // AI Insights styles
  aiInsightsEmpty: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  aiInsightsEmptyText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  aiInsightGroup: {
    marginBottom: 16,
  },
  aiInsightGroupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  aiInsightItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  aiInsightText: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 4,
  },
  confidenceBar: {
    height: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  aiInsightsUpdated: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  
  // Interests styles
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: '#CAF0F8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 4,
    borderWidth: 1,
    borderColor: '#0077B6',
  },
  interestText: {
    color: '#03045E',
    fontSize: 14,
  },
  youButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  youButtonText: {
    fontSize: 16,
    color: '#03045E',
    fontWeight: '500',
  },
  aboutMePreview: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  socialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  socialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialText: {
    fontSize: 16,
    color: '#03045E',
    marginLeft: 12,
  },
  bottomPadding: {
    height: 100,
  },
  toolbarContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toolbarIcon: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIcon: {
    backgroundColor: '#0077B6',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalCancel: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#03045E',
  },
  modalSave: {
    fontSize: 16,
    color: '#0077B6',
    fontWeight: 'bold',
  },
  youTextInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#03045E',
  },
});