// Soul Components - React Native UI components for the advanced hybrid matchmaking system
// Beautiful, intuitive interface for Soul interactions and match exploration

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  Dimensions,
  Animated,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  SoulUserProfile,
  SoulMatch,
  SoulMatchingResult,
  GuessWhoSession,
  SoulCompatibilityScore,
  ConnectionPotential,
  PersonalityInsights
} from '../types/SoulTypes';
import { GeneratedQuestion } from '../types/HarmonyTypes';
import SoulService from '../services/SoulService';

const { width, height } = Dimensions.get('window');

// Color palette for Soul UI
const SOUL_COLORS = {
  primary: '#8B5CF6',        // Deep purple
  secondary: '#EC4899',      // Vibrant pink
  accent: '#F59E0B',         // Golden amber
  background: '#F8FAFC',     // Light background
  surface: '#FFFFFF',        // White surface
  text: '#1F2937',           // Dark text
  textSecondary: '#6B7280',  // Medium gray
  success: '#10B981',        // Green
  warning: '#F59E0B',        // Amber
  error: '#EF4444',          // Red
  gradient1: '#667EEA',      // Light blue
  gradient2: '#764BA2'       // Deep purple
};

/**
 * Soul Profile Card - Displays comprehensive user profile
 */
export const SoulProfileCard: React.FC<{
  profile: SoulUserProfile;
  onEdit?: () => void;
}> = ({ profile, onEdit }) => {
  const renderPersonalitySection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Personality Soul</Text>
      <View style={styles.personalityContainer}>
        <View style={styles.personalityIndicator}>
          <View style={[
            styles.personalityColor,
            { backgroundColor: profile.hhcProfile.signatureCode }
          ]} />
          <Text style={styles.personalityText}>
            {profile.hhcProfile.dimensions.metaphysicalCore.archetypeTitle}
          </Text>
        </View>
        <Text style={styles.confidenceText}>
          {Math.round(profile.hhcProfile.overallConfidence * 100)}% confidence
        </Text>
      </View>
    </View>
  );

  const renderFactualSection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Life Details</Text>
      <View style={styles.factualGrid}>
        {profile.factualProfile.age && (
          <View style={styles.factualItem}>
            <Text style={styles.factualLabel}>Age</Text>
            <Text style={styles.factualValue}>{profile.factualProfile.age}</Text>
          </View>
        )}
        {profile.factualProfile.relationshipGoal && (
          <View style={styles.factualItem}>
            <Text style={styles.factualLabel}>Looking for</Text>
            <Text style={styles.factualValue}>{profile.factualProfile.relationshipGoal}</Text>
          </View>
        )}
        {profile.factualProfile.interests && (
          <View style={styles.factualItem}>
            <Text style={styles.factualLabel}>Interests</Text>
            <Text style={styles.factualValue}>
              {profile.factualProfile.interests.slice(0, 3).join(', ')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderLearningProgress = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Soul Learning</Text>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[
            styles.progressFill,
            { width: `${profile.learningHistory.totalInteractions * 2}%` }
          ]} />
        </View>
        <Text style={styles.progressText}>
          {profile.learningHistory.totalInteractions} interactions completed
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.profileCard}>
      <LinearGradient
        colors={[SOUL_COLORS.primary, SOUL_COLORS.secondary]}
        style={styles.profileHeader}
      >
        <Text style={styles.profileTitle}>Your Soul Profile</Text>
        <Text style={styles.profileSubtitle}>
          {Math.round(profile.metadata.profileCompleteness * 100)}% Complete
        </Text>
      </LinearGradient>

      <ScrollView style={styles.profileContent}>
        {renderPersonalitySection()}
        {renderFactualSection()}
        {renderLearningProgress()}
        
        {onEdit && (
          <TouchableOpacity style={styles.editButton} onPress={onEdit}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

/**
 * Soul Match Card - Displays a potential match with compatibility insights
 */
export const SoulMatchCard: React.FC<{
  match: SoulMatch;
  onViewDetails: (match: SoulMatch) => void;
  onStartGuessWho: (candidateId: string) => void;
  onLike: (candidateId: string) => void;
  onPass: (candidateId: string) => void;
}> = ({ match, onViewDetails, onStartGuessWho, onLike, onPass }) => {
  const [expanded, setExpanded] = useState(false);

  const renderCompatibilityScore = () => {
    const score = match.compatibility.totalScore;
    const percentage = Math.round(score * 100);
    
    let color = SOUL_COLORS.error;
    if (score >= 0.8) color = SOUL_COLORS.success;
    else if (score >= 0.6) color = SOUL_COLORS.warning;

    return (
      <View style={styles.compatibilityContainer}>
        <View style={[styles.compatibilityCircle, { borderColor: color }]}>
          <Text style={[styles.compatibilityScore, { color }]}>
            {percentage}%
          </Text>
        </View>
        <Text style={styles.compatibilityLabel}>Soul Fit</Text>
      </View>
    );
  };

  const renderConnectionPotential = () => (
    <View style={styles.connectionContainer}>
      <Text style={styles.connectionTitle}>Connection Potential</Text>
      <View style={styles.connectionBars}>
        <View style={styles.connectionBar}>
          <Text style={styles.connectionLabel}>Short-term</Text>
          <View style={styles.connectionBarTrack}>
            <View style={[
              styles.connectionBarFill,
              { width: `${match.connectionPotential.shortTermCompatibility * 100}%` }
            ]} />
          </View>
        </View>
        <View style={styles.connectionBar}>
          <Text style={styles.connectionLabel}>Long-term</Text>
          <View style={styles.connectionBarTrack}>
            <View style={[
              styles.connectionBarFill,
              { width: `${match.connectionPotential.longTermCompatibility * 100}%` }
            ]} />
          </View>
        </View>
      </View>
    </View>
  );

  const renderPersonalityInsights = () => (
    <View style={styles.insightsContainer}>
      <Text style={styles.insightsTitle}>Personality Insights</Text>
      <View style={styles.insightsList}>
        {match.personalityInsights.complementaryTraits.map((trait, index) => (
          <View key={index} style={styles.insightItem}>
            <Text style={styles.insightText}>✨ {trait}</Text>
          </View>
        ))}
        {match.personalityInsights.sharedStrengths.map((strength, index) => (
          <View key={index} style={styles.insightItem}>
            <Text style={styles.insightText}>💪 {strength}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderConversationStarters = () => (
    <View style={styles.startersContainer}>
      <Text style={styles.startersTitle}>Conversation Starters</Text>
      {match.suggestedConversationStarters.map((starter, index) => (
        <TouchableOpacity key={index} style={styles.starterItem}>
          <Text style={styles.starterText}>💬 {starter}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <Image
          source={{ uri: 'https://via.placeholder.com/100' }}
          style={styles.matchImage}
        />
        <View style={styles.matchInfo}>
          <Text style={styles.matchName}>
            {match.candidate.factualProfile.age ? `${match.candidate.factualProfile.age}` : 'Unknown'}
          </Text>
          <Text style={styles.matchLocation}>
            {match.candidate.factualProfile.location?.city || 'Nearby'}
          </Text>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setExpanded(!expanded)}
          >
            <Text style={styles.expandButtonText}>
              {expanded ? 'Show Less' : 'Show More'}
            </Text>
          </TouchableOpacity>
        </View>
        {renderCompatibilityScore()}
      </View>

      {expanded && (
        <View style={styles.matchDetails}>
          {renderConnectionPotential()}
          {renderPersonalityInsights()}
          {renderConversationStarters()}
        </View>
      )}

      <View style={styles.matchActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={() => onPass(match.candidate.userId)}
        >
          <Text style={styles.actionButtonText}>Pass</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.guessWhoButton]}
          onPress={() => onStartGuessWho(match.candidate.userId)}
        >
          <Text style={styles.actionButtonText}>Guess Who</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => onLike(match.candidate.userId)}
        >
          <Text style={styles.actionButtonText}>Like</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * Guess Who Interface - Interactive Q&A for learning preferences
 */
export const GuessWhoInterface: React.FC<{
  session: GuessWhoSession;
  currentQuestion: GeneratedQuestion;
  onAnswer: (response: string, reaction: 'positive' | 'negative' | 'neutral') => void;
  onEndSession: () => void;
}> = ({ session, currentQuestion, onAnswer, onEndSession }) => {
  const [response, setResponse] = useState('');
  const [selectedReaction, setSelectedReaction] = useState<'positive' | 'negative' | 'neutral'>('neutral');

  const handleSubmitAnswer = () => {
    if (response.trim()) {
      onAnswer(response, selectedReaction);
      setResponse('');
      setSelectedReaction('neutral');
    }
  };

  const renderReactionButtons = () => (
    <View style={styles.reactionContainer}>
      <TouchableOpacity
        style={[
          styles.reactionButton,
          styles.negativeReaction,
          selectedReaction === 'negative' && styles.selectedReaction
        ]}
        onPress={() => setSelectedReaction('negative')}
      >
        <Text style={styles.reactionText}>👎</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.reactionButton,
          styles.neutralReaction,
          selectedReaction === 'neutral' && styles.selectedReaction
        ]}
        onPress={() => setSelectedReaction('neutral')}
      >
        <Text style={styles.reactionText}>🤷</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.reactionButton,
          styles.positiveReaction,
          selectedReaction === 'positive' && styles.selectedReaction
        ]}
        onPress={() => setSelectedReaction('positive')}
      >
        <Text style={styles.reactionText}>👍</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.guessWhoContainer}>
      <LinearGradient
        colors={[SOUL_COLORS.gradient1, SOUL_COLORS.gradient2]}
        style={styles.guessWhoHeader}
      >
        <Text style={styles.guessWhoTitle}>Guess Who</Text>
        <Text style={styles.guessWhoSubtitle}>
          Question {session.questions.length + 1}
        </Text>
      </LinearGradient>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        <Text style={styles.questionTarget}>
          Exploring: preferences
        </Text>
      </View>

      <View style={styles.answerContainer}>
        <TextInput
          style={styles.answerInput}
          placeholder="Share your thoughts..."
          multiline
          value={response}
          onChangeText={setResponse}
        />
        
        <Text style={styles.reactionLabel}>How do you feel about this?</Text>
        {renderReactionButtons()}
        
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitAnswer}
          disabled={!response.trim()}
        >
          <Text style={styles.submitButtonText}>Submit Answer</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.endSessionButton}
        onPress={onEndSession}
      >
        <Text style={styles.endSessionText}>End Session</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Soul Matches Screen - Main interface for browsing matches
 */
export const SoulMatchesScreen: React.FC<{
  matches: SoulMatch[];
  isLoading: boolean;
  onRefresh: () => void;
  onMatchAction: (candidateId: string, action: string) => void;
}> = ({ matches, isLoading, onRefresh, onMatchAction }) => {
  const [selectedMatch, setSelectedMatch] = useState<SoulMatch | null>(null);
  const [showGuessWho, setShowGuessWho] = useState(false);

  const handleStartGuessWho = (candidateId: string) => {
    setShowGuessWho(true);
    onMatchAction(candidateId, 'start_guess_who');
  };

  const handleLikeMatch = (candidateId: string) => {
    onMatchAction(candidateId, 'like');
  };

  const handlePassMatch = (candidateId: string) => {
    onMatchAction(candidateId, 'pass');
  };

  const renderMatch = ({ item }: { item: SoulMatch }) => (
    <SoulMatchCard
      match={item}
      onViewDetails={setSelectedMatch}
      onStartGuessWho={handleStartGuessWho}
      onLike={handleLikeMatch}
      onPass={handlePassMatch}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Finding your Soul matches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.matchesContainer}>
      <LinearGradient
        colors={[SOUL_COLORS.primary, SOUL_COLORS.secondary]}
        style={styles.matchesHeader}
      >
        <Text style={styles.matchesTitle}>Soul Matches</Text>
        <Text style={styles.matchesSubtitle}>
          {matches.length} compatible souls found
        </Text>
      </LinearGradient>

      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.candidate.userId}
        contentContainerStyle={styles.matchesList}
        refreshing={isLoading}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

/**
 * Soul Analytics Dashboard - Insights and learning progress
 */
export const SoulAnalyticsDashboard: React.FC<{
  profile: SoulUserProfile;
  systemInsights: any;
}> = ({ profile, systemInsights }) => {
  const renderLearningProgress = () => (
    <View style={styles.analyticsCard}>
      <Text style={styles.analyticsTitle}>Learning Progress</Text>
      <View style={styles.progressGrid}>
        <View style={styles.progressItem}>
          <Text style={styles.progressValue}>
            {profile.learningHistory.totalInteractions}
          </Text>
          <Text style={styles.progressLabel}>Interactions</Text>
        </View>
        <View style={styles.progressItem}>
          <Text style={styles.progressValue}>
            {profile.learningHistory.learningMilestones.length}
          </Text>
          <Text style={styles.progressLabel}>Milestones</Text>
        </View>
        <View style={styles.progressItem}>
          <Text style={styles.progressValue}>
            {Math.round(profile.metadata.profileCompleteness * 100)}%
          </Text>
          <Text style={styles.progressLabel}>Complete</Text>
        </View>
      </View>
    </View>
  );

  const renderPreferenceWeights = () => (
    <View style={styles.analyticsCard}>
      <Text style={styles.analyticsTitle}>Preference Insights</Text>
      <View style={styles.weightsList}>
        {Object.entries(profile.dynamicPreferenceWeights)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([attribute, weight]) => (
            <View key={attribute} style={styles.weightItem}>
              <Text style={styles.weightLabel}>{attribute}</Text>
              <View style={styles.weightBar}>
                <View style={[
                  styles.weightFill,
                  { width: `${weight * 100}%` }
                ]} />
              </View>
              <Text style={styles.weightValue}>
                {Math.round(weight * 100)}%
              </Text>
            </View>
          ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.analyticsContainer}>
      <LinearGradient
        colors={[SOUL_COLORS.primary, SOUL_COLORS.secondary]}
        style={styles.analyticsHeader}
      >
        <Text style={styles.analyticsHeaderTitle}>Soul Analytics</Text>
        <Text style={styles.analyticsHeaderSubtitle}>
          Your matching journey insights
        </Text>
      </LinearGradient>

      {renderLearningProgress()}
      {renderPreferenceWeights()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Profile Card Styles
  profileCard: {
    backgroundColor: SOUL_COLORS.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: SOUL_COLORS.surface,
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 16,
    color: SOUL_COLORS.surface,
    opacity: 0.8,
  },
  profileContent: {
    padding: 20,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SOUL_COLORS.text,
    marginBottom: 12,
  },
  personalityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  personalityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personalityColor: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  personalityText: {
    fontSize: 16,
    fontWeight: '500',
    color: SOUL_COLORS.text,
  },
  confidenceText: {
    fontSize: 14,
    color: SOUL_COLORS.textSecondary,
  },
  factualGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  factualItem: {
    width: '48%',
    marginBottom: 12,
  },
  factualLabel: {
    fontSize: 12,
    color: SOUL_COLORS.textSecondary,
    marginBottom: 4,
  },
  factualValue: {
    fontSize: 16,
    color: SOUL_COLORS.text,
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: SOUL_COLORS.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: SOUL_COLORS.primary,
  },
  progressText: {
    fontSize: 14,
    color: SOUL_COLORS.textSecondary,
    marginTop: 8,
  },
  editButton: {
    backgroundColor: SOUL_COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  editButtonText: {
    color: SOUL_COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },

  // Match Card Styles
  matchCard: {
    backgroundColor: SOUL_COLORS.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  matchHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  matchImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 18,
    fontWeight: '600',
    color: SOUL_COLORS.text,
  },
  matchLocation: {
    fontSize: 14,
    color: SOUL_COLORS.textSecondary,
    marginTop: 4,
  },
  expandButton: {
    marginTop: 8,
  },
  expandButtonText: {
    color: SOUL_COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  compatibilityContainer: {
    alignItems: 'center',
  },
  compatibilityCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compatibilityScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  compatibilityLabel: {
    fontSize: 12,
    color: SOUL_COLORS.textSecondary,
    marginTop: 4,
  },
  matchDetails: {
    padding: 16,
    paddingTop: 0,
  },
  connectionContainer: {
    marginBottom: 16,
  },
  connectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SOUL_COLORS.text,
    marginBottom: 8,
  },
  connectionBars: {
    gap: 8,
  },
  connectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionLabel: {
    fontSize: 12,
    color: SOUL_COLORS.textSecondary,
    width: 80,
  },
  connectionBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: SOUL_COLORS.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  connectionBarFill: {
    height: '100%',
    backgroundColor: SOUL_COLORS.primary,
  },
  insightsContainer: {
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SOUL_COLORS.text,
    marginBottom: 8,
  },
  insightsList: {
    gap: 4,
  },
  insightItem: {
    paddingVertical: 4,
  },
  insightText: {
    fontSize: 14,
    color: SOUL_COLORS.textSecondary,
  },
  startersContainer: {
    marginBottom: 16,
  },
  startersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SOUL_COLORS.text,
    marginBottom: 8,
  },
  starterItem: {
    padding: 12,
    backgroundColor: SOUL_COLORS.background,
    borderRadius: 8,
    marginBottom: 8,
  },
  starterText: {
    fontSize: 14,
    color: SOUL_COLORS.text,
  },
  matchActions: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  passButton: {
    backgroundColor: SOUL_COLORS.error,
  },
  guessWhoButton: {
    backgroundColor: SOUL_COLORS.warning,
  },
  likeButton: {
    backgroundColor: SOUL_COLORS.success,
  },
  actionButtonText: {
    color: SOUL_COLORS.surface,
    fontSize: 14,
    fontWeight: '600',
  },

  // Guess Who Interface Styles
  guessWhoContainer: {
    flex: 1,
    backgroundColor: SOUL_COLORS.background,
  },
  guessWhoHeader: {
    padding: 20,
    paddingTop: 60,
  },
  guessWhoTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: SOUL_COLORS.surface,
    marginBottom: 4,
  },
  guessWhoSubtitle: {
    fontSize: 16,
    color: SOUL_COLORS.surface,
    opacity: 0.8,
  },
  questionContainer: {
    padding: 20,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: SOUL_COLORS.text,
    marginBottom: 8,
  },
  questionTarget: {
    fontSize: 14,
    color: SOUL_COLORS.textSecondary,
  },
  answerContainer: {
    padding: 20,
  },
  answerInput: {
    backgroundColor: SOUL_COLORS.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: SOUL_COLORS.text,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  reactionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: SOUL_COLORS.text,
    marginBottom: 12,
  },
  reactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  reactionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: SOUL_COLORS.textSecondary,
  },
  selectedReaction: {
    borderColor: SOUL_COLORS.primary,
    backgroundColor: SOUL_COLORS.primary,
  },
  negativeReaction: {
    borderColor: SOUL_COLORS.error,
  },
  neutralReaction: {
    borderColor: SOUL_COLORS.textSecondary,
  },
  positiveReaction: {
    borderColor: SOUL_COLORS.success,
  },
  reactionText: {
    fontSize: 24,
  },
  submitButton: {
    backgroundColor: SOUL_COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: SOUL_COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  endSessionButton: {
    margin: 20,
    padding: 16,
    alignItems: 'center',
  },
  endSessionText: {
    color: SOUL_COLORS.textSecondary,
    fontSize: 16,
  },

  // Matches Screen Styles
  matchesContainer: {
    flex: 1,
    backgroundColor: SOUL_COLORS.background,
  },
  matchesHeader: {
    padding: 20,
    paddingTop: 60,
  },
  matchesTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: SOUL_COLORS.surface,
    marginBottom: 4,
  },
  matchesSubtitle: {
    fontSize: 16,
    color: SOUL_COLORS.surface,
    opacity: 0.8,
  },
  matchesList: {
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SOUL_COLORS.background,
  },
  loadingText: {
    fontSize: 18,
    color: SOUL_COLORS.textSecondary,
    marginTop: 16,
  },

  // Analytics Dashboard Styles
  analyticsContainer: {
    flex: 1,
    backgroundColor: SOUL_COLORS.background,
  },
  analyticsHeader: {
    padding: 20,
    paddingTop: 60,
  },
  analyticsHeaderTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: SOUL_COLORS.surface,
    marginBottom: 4,
  },
  analyticsHeaderSubtitle: {
    fontSize: 16,
    color: SOUL_COLORS.surface,
    opacity: 0.8,
  },
  analyticsCard: {
    backgroundColor: SOUL_COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SOUL_COLORS.text,
    marginBottom: 16,
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: SOUL_COLORS.primary,
  },
  progressLabel: {
    fontSize: 12,
    color: SOUL_COLORS.textSecondary,
    marginTop: 4,
  },
  weightsList: {
    gap: 12,
  },
  weightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weightLabel: {
    fontSize: 14,
    color: SOUL_COLORS.text,
    width: 80,
  },
  weightBar: {
    flex: 1,
    height: 6,
    backgroundColor: SOUL_COLORS.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  weightFill: {
    height: '100%',
    backgroundColor: SOUL_COLORS.primary,
  },
  weightValue: {
    fontSize: 12,
    color: SOUL_COLORS.textSecondary,
    width: 40,
    textAlign: 'right',
  },
});

export default {
  SoulProfileCard,
  SoulMatchCard,
  GuessWhoInterface,
  SoulMatchesScreen,
  SoulAnalyticsDashboard
};