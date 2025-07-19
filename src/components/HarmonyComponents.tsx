// Harmony Algorithm React Native Components
// Beautiful, accessible UI components for the Harmony personality system

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Animated,
  PanResponder
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, G, Text as SvgText } from 'react-native-svg';
import {
  HarmonyUserProfile,
  CompatibilityMatch,
  ConversationMessage,
  GeneratedQuestion,
  MatchType,
  HarmonyZone,
  InferencePhase
} from '../types/HarmonyTypes';
import { hexCodeToDimensions, getArchetypeFromHue, HARMONY_ARCHETYPES } from '../services/HarmonyCore';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Enhanced color palette for Harmony
const HarmonyColors = {
  primary: '#6B46C1',
  secondary: '#EC4899',
  accent: '#F59E0B',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  // Archetype colors
  archetypes: {
    cognitive: '#3B82F6',
    visionary: '#8B5CF6',
    relational: '#EC4899',
    nurturing: '#10B981',
    purposeful: '#F59E0B',
    driven: '#EF4444',
    experiential: '#06B6D4',
    analytical: '#6B7280'
  }
};

/**
 * Props for Harmony Chat Interface
 */
interface HarmonyChatProps {
  messages: ConversationMessage[];
  userProfile: HarmonyUserProfile;
  onSendMessage: (message: string) => void;
  onQuestionGenerated: (question: GeneratedQuestion) => void;
  isLoading?: boolean;
}

/**
 * Conversational Interface Component
 * Handles the AI-guided personality inference conversation
 */
export const HarmonyChatInterface: React.FC<HarmonyChatProps> = ({
  messages,
  userProfile,
  onSendMessage,
  onQuestionGenerated,
  isLoading = false
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate new messages
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
      setIsTyping(true);
      
      // Simulate AI thinking time
      setTimeout(() => {
        setIsTyping(false);
      }, 1500);
    }
  };

  const renderMessage = (message: ConversationMessage, index: number) => {
    const isUser = message.sender === 'user';
    const isQuestion = message.messageType === 'question';
    
    return (
      <Animated.View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.aiMessage,
          { opacity: fadeAnim }
        ]}
      >
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
          isQuestion && styles.questionBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.aiMessageText
          ]}>
            {message.content}
          </Text>
          
          {message.inferenceData && (
            <View style={styles.inferenceIndicator}>
              <Text style={styles.inferenceText}>
                Analyzing: {message.inferenceData.triggeredParameters.join(', ')}
              </Text>
            </View>
          )}
        </View>
        
        <Text style={styles.messageTime}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.chatContainer}>
      {/* Header with progress indicator */}
      <View style={styles.chatHeader}>
        <Text style={styles.chatTitle}>Harmony Discovery</Text>
        <HarmonyProgressIndicator
          progress={userProfile.inferenceJourney.overallProgress}
          phase={userProfile.inferenceJourney.currentPhase}
          confidence={userProfile.overallConfidence}
        />
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}
        
        {isTyping && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <HarmonyTypingIndicator />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Share your thoughts..."
          placeholderTextColor={HarmonyColors.textSecondary}
          multiline
          maxLength={500}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendButton, inputText.trim() ? styles.sendButtonActive : null]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={HarmonyColors.surface} />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * Progress Indicator Component
 */
interface ProgressProps {
  progress: number;
  phase: InferencePhase;
  confidence: number;
}

const HarmonyProgressIndicator: React.FC<ProgressProps> = ({ progress, phase, confidence }) => {
  const getPhaseColor = (phase: InferencePhase): string => {
    switch (phase) {
      case InferencePhase.SURFACE: return HarmonyColors.archetypes.cognitive;
      case InferencePhase.LAYER_PEELING: return HarmonyColors.archetypes.visionary;
      case InferencePhase.CORE_EXCAVATION: return HarmonyColors.archetypes.relational;
      case InferencePhase.SOUL_MAPPING: return HarmonyColors.archetypes.purposeful;
      default: return HarmonyColors.primary;
    }
  };

  const getPhaseDescription = (phase: InferencePhase): string => {
    switch (phase) {
      case InferencePhase.SURFACE: return 'Surface Exploration';
      case InferencePhase.LAYER_PEELING: return 'Layer Peeling';
      case InferencePhase.CORE_EXCAVATION: return 'Core Excavation';
      case InferencePhase.SOUL_MAPPING: return 'Soul Mapping';
      default: return 'Analyzing';
    }
  };

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.phaseText}>{getPhaseDescription(phase)}</Text>
        <Text style={styles.confidenceText}>{Math.round(confidence * 100)}% confident</Text>
      </View>
      
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress * 100}%`,
              backgroundColor: getPhaseColor(phase)
            }
          ]}
        />
      </View>
    </View>
  );
};

/**
 * Typing Indicator Component
 */
const HarmonyTypingIndicator: React.FC = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDots = () => {
      const createAnimation = (dot: Animated.Value, delay: number) => {
        return Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true
          })
        ]);
      };

      Animated.loop(
        Animated.parallel([
          createAnimation(dot1, 0),
          createAnimation(dot2, 200),
          createAnimation(dot3, 400)
        ])
      ).start();
    };

    animateDots();
  }, []);

  return (
    <View style={styles.typingContainer}>
      <Text style={styles.typingText}>AI is thinking</Text>
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, { opacity: dot1 }]} />
        <Animated.View style={[styles.dot, { opacity: dot2 }]} />
        <Animated.View style={[styles.dot, { opacity: dot3 }]} />
      </View>
    </View>
  );
};

/**
 * Props for Harmony Profile Display
 */
interface HarmonyProfileProps {
  userProfile: HarmonyUserProfile;
  onSignatureCodePress?: () => void;
  showDetailedBreakdown?: boolean;
}

/**
 * Profile Display Component
 * Shows the user's computed Harmony Signature Code and breakdown
 */
export const HarmonyProfileDisplay: React.FC<HarmonyProfileProps> = ({
  userProfile,
  onSignatureCodePress,
  showDetailedBreakdown = false
}) => {
  const dimensions = hexCodeToDimensions(userProfile.signatureCode);
  const archetype = getArchetypeFromHue(dimensions.hue);
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);

  const renderSignatureCode = () => (
    <TouchableOpacity
      style={styles.signatureCodeContainer}
      onPress={onSignatureCodePress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[HarmonyColors.primary, HarmonyColors.secondary]}
        style={styles.signatureCodeGradient}
      >
        <Text style={styles.signatureCodeText}>{userProfile.signatureCode}</Text>
        <Text style={styles.signatureCodeLabel}>Your Harmony Signature</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderArchetypeWheel = () => (
    <View style={styles.archetypeWheelContainer}>
      <HarmonyArchetypeWheel
        currentHue={dimensions.hue}
        primaryArchetype={archetype.name}
        size={200}
        onArchetypePress={(archetype) => {
          // Handle archetype press
        }}
      />
    </View>
  );

  const renderDimensionSlider = (
    label: string,
    value: number,
    maxValue: number,
    color: string,
    onPress: () => void
  ) => (
    <TouchableOpacity style={styles.dimensionSlider} onPress={onPress}>
      <View style={styles.dimensionHeader}>
        <Text style={styles.dimensionLabel}>{label}</Text>
        <Text style={styles.dimensionValue}>{Math.round(value)}</Text>
      </View>
      
      <View style={styles.sliderTrack}>
        <View
          style={[
            styles.sliderFill,
            {
              width: `${(value / maxValue) * 100}%`,
              backgroundColor: color
            }
          ]}
        />
      </View>
      
      <Text style={styles.dimensionDescription}>
        {getDimensionDescription(label, value, maxValue)}
      </Text>
    </TouchableOpacity>
  );

  const getDimensionDescription = (label: string, value: number, maxValue: number): string => {
    const percentage = (value / maxValue) * 100;
    
    switch (label) {
      case 'Manifested Self':
        return percentage > 70 ? 'Highly expressive' : 
               percentage > 40 ? 'Moderately expressive' : 'Reserved';
      case 'Soul Depth':
        return percentage > 70 ? 'Profound depth' : 
               percentage > 40 ? 'Moderate depth' : 'Surface level';
      default:
        return '';
    }
  };

  return (
    <ScrollView style={styles.profileContainer} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.profileHeader}>
        <Text style={styles.profileTitle}>Your Harmony Profile</Text>
        <Text style={styles.profileSubtitle}>
          {Math.round(userProfile.overallConfidence * 100)}% confidence
        </Text>
      </View>

      {/* Signature Code */}
      {renderSignatureCode()}

      {/* Archetype Information */}
      <View style={styles.archetypeSection}>
        <Text style={styles.sectionTitle}>Primary Archetype</Text>
        <View style={styles.archetypeCard}>
          <View style={styles.archetypeHeader}>
            <Text style={styles.archetypeName}>{archetype.name}</Text>
            <Text style={styles.archetypeTitle}>{archetype.title}</Text>
          </View>
          <Text style={styles.archetypeDescription}>{archetype.description}</Text>
        </View>
      </View>

      {/* Archetype Wheel */}
      {renderArchetypeWheel()}

      {/* Dimensional Breakdown */}
      <View style={styles.dimensionsSection}>
        <Text style={styles.sectionTitle}>Dimensional Breakdown</Text>
        
        {renderDimensionSlider(
          'Manifested Self',
          dimensions.manifested,
          255,
          HarmonyColors.archetypes.relational,
          () => setSelectedDimension('manifested')
        )}
        
        {renderDimensionSlider(
          'Soul Depth',
          dimensions.soul,
          255,
          HarmonyColors.archetypes.purposeful,
          () => setSelectedDimension('soul')
        )}
      </View>

      {/* Detailed Breakdown */}
      {showDetailedBreakdown && (
        <View style={styles.detailedSection}>
          <Text style={styles.sectionTitle}>Parameter Analysis</Text>
          {/* This would show detailed parameter breakdown */}
        </View>
      )}
    </ScrollView>
  );
};

/**
 * Archetype Wheel Component
 */
interface ArchetypeWheelProps {
  currentHue: number;
  primaryArchetype: string;
  size: number;
  onArchetypePress: (archetype: string) => void;
}

const HarmonyArchetypeWheel: React.FC<ArchetypeWheelProps> = ({
  currentHue,
  primaryArchetype,
  size,
  onArchetypePress
}) => {
  const center = size / 2;
  const radius = size / 2 - 20;
  const innerRadius = radius - 30;

  const getArchetypeColor = (archetypeName: string): string => {
    const colorMap: { [key: string]: string } = {
      'Cognitive': HarmonyColors.archetypes.cognitive,
      'Visionary': HarmonyColors.archetypes.visionary,
      'Relational': HarmonyColors.archetypes.relational,
      'Nurturing': HarmonyColors.archetypes.nurturing,
      'Purposeful': HarmonyColors.archetypes.purposeful,
      'Driven': HarmonyColors.archetypes.driven,
      'Experiential': HarmonyColors.archetypes.experiential,
      'Analytical': HarmonyColors.archetypes.analytical
    };
    return colorMap[archetypeName] || HarmonyColors.primary;
  };

  const createArcPath = (startAngle: number, endAngle: number, outerRadius: number, innerRadius: number): string => {
    const startAngleRad = (startAngle - 90) * Math.PI / 180;
    const endAngleRad = (endAngle - 90) * Math.PI / 180;
    
    const x1 = center + outerRadius * Math.cos(startAngleRad);
    const y1 = center + outerRadius * Math.sin(startAngleRad);
    const x2 = center + outerRadius * Math.cos(endAngleRad);
    const y2 = center + outerRadius * Math.sin(endAngleRad);
    
    const x3 = center + innerRadius * Math.cos(endAngleRad);
    const y3 = center + innerRadius * Math.sin(endAngleRad);
    const x4 = center + innerRadius * Math.cos(startAngleRad);
    const y4 = center + innerRadius * Math.sin(startAngleRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  return (
    <View style={[styles.archetypeWheel, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill={HarmonyColors.background}
          stroke={HarmonyColors.textSecondary}
          strokeWidth={2}
        />
        
        {/* Archetype segments */}
        {HARMONY_ARCHETYPES.map((archetype, index) => {
          const startAngle = archetype.angle - 22.5;
          const endAngle = archetype.angle + 22.5;
          const isActive = archetype.name === primaryArchetype;
          
          return (
            <G key={archetype.name}>
              <Path
                d={createArcPath(startAngle, endAngle, radius, innerRadius)}
                fill={getArchetypeColor(archetype.name)}
                opacity={isActive ? 1 : 0.3}
                onPress={() => onArchetypePress(archetype.name)}
              />
              
              {/* Archetype labels */}
              <SvgText
                x={center + (radius - 15) * Math.cos((archetype.angle - 90) * Math.PI / 180)}
                y={center + (radius - 15) * Math.sin((archetype.angle - 90) * Math.PI / 180)}
                textAnchor="middle"
                fontSize={10}
                fill={HarmonyColors.text}
                fontWeight={isActive ? 'bold' : 'normal'}
              >
                {archetype.name}
              </SvgText>
            </G>
          );
        })}
        
        {/* Current hue indicator */}
        <Circle
          cx={center + (radius - 10) * Math.cos((currentHue - 90) * Math.PI / 180)}
          cy={center + (radius - 10) * Math.sin((currentHue - 90) * Math.PI / 180)}
          r={6}
          fill={HarmonyColors.accent}
          stroke={HarmonyColors.surface}
          strokeWidth={2}
        />
        
        {/* Center circle */}
        <Circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill={HarmonyColors.surface}
          stroke={HarmonyColors.textSecondary}
          strokeWidth={1}
        />
        
        {/* Center text */}
        <SvgText
          x={center}
          y={center - 5}
          textAnchor="middle"
          fontSize={12}
          fill={HarmonyColors.text}
          fontWeight="bold"
        >
          {primaryArchetype}
        </SvgText>
        
        <SvgText
          x={center}
          y={center + 15}
          textAnchor="middle"
          fontSize={10}
          fill={HarmonyColors.textSecondary}
        >
          {Math.round(currentHue)}°
        </SvgText>
      </Svg>
    </View>
  );
};

/**
 * Props for Match Results Display
 */
interface MatchResultsProps {
  matches: CompatibilityMatch[];
  onMatchPress: (match: CompatibilityMatch) => void;
  onFilterChange: (filters: any) => void;
  sortBy: 'compatibility' | 'distance' | 'type';
  filterBy: MatchType | 'all';
}

/**
 * Match Results Display Component
 */
export const HarmonyMatchResults: React.FC<MatchResultsProps> = ({
  matches,
  onMatchPress,
  onFilterChange,
  sortBy,
  filterBy
}) => {
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  const getMatchTypeColor = (matchType: MatchType): string => {
    switch (matchType) {
      case MatchType.SOULMATE: return HarmonyColors.success;
      case MatchType.HIGH_COMPATIBILITY: return HarmonyColors.primary;
      case MatchType.GOOD_MATCH: return HarmonyColors.secondary;
      case MatchType.COMPLEMENTARY: return HarmonyColors.accent;
      case MatchType.GROWTH_ORIENTED: return HarmonyColors.warning;
      default: return HarmonyColors.textSecondary;
    }
  };

  const getMatchTypeLabel = (matchType: MatchType): string => {
    switch (matchType) {
      case MatchType.SOULMATE: return 'Soulmate';
      case MatchType.HIGH_COMPATIBILITY: return 'High Compatibility';
      case MatchType.GOOD_MATCH: return 'Good Match';
      case MatchType.COMPLEMENTARY: return 'Complementary';
      case MatchType.GROWTH_ORIENTED: return 'Growth Oriented';
      case MatchType.EXPLORATORY: return 'Exploratory';
      default: return 'Match';
    }
  };

  const renderMatchCard = (match: CompatibilityMatch) => {
    const isExpanded = expandedMatch === match.targetUserId;
    const dimensions = hexCodeToDimensions(match.signatureCode);
    const archetype = getArchetypeFromHue(dimensions.hue);

    return (
      <TouchableOpacity
        key={match.targetUserId}
        style={[
          styles.matchCard,
          match.isComplementaryMatch && styles.complementaryMatch,
          isExpanded && styles.expandedMatch
        ]}
        onPress={() => {
          setExpandedMatch(isExpanded ? null : match.targetUserId);
          onMatchPress(match);
        }}
      >
        {/* Header */}
        <View style={styles.matchHeader}>
          <View style={styles.matchSignature}>
            <Text style={styles.matchSignatureText}>{match.signatureCode}</Text>
            <Text style={styles.matchArchetype}>{archetype.name}</Text>
          </View>
          
          <View style={styles.matchScore}>
            <Text style={[
              styles.matchScoreText,
              { color: getMatchTypeColor(match.matchType) }
            ]}>
              {Math.round(match.compatibilityScore)}%
            </Text>
            <Text style={styles.matchType}>
              {getMatchTypeLabel(match.matchType)}
            </Text>
          </View>
        </View>

        {/* Compatibility Breakdown */}
        <View style={styles.compatibilityBreakdown}>
          <HarmonyCompatibilityBar
            label="Hue"
            value={match.compatibilityBreakdown.hueAlignment}
            color={HarmonyColors.archetypes.cognitive}
          />
          <HarmonyCompatibilityBar
            label="Manifested"
            value={match.compatibilityBreakdown.manifestedAlignment}
            color={HarmonyColors.archetypes.relational}
          />
          <HarmonyCompatibilityBar
            label="Soul"
            value={match.compatibilityBreakdown.soulAlignment}
            color={HarmonyColors.archetypes.purposeful}
          />
        </View>

        {/* Match Reason */}
        <Text style={styles.matchReason}>{match.matchReason}</Text>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.matchDetails}>
            <Text style={styles.detailsTitle}>Compatibility Details</Text>
            
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Hue Distance</Text>
                <Text style={styles.detailValue}>{Math.round(match.distance.hue)}°</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Manifested Distance</Text>
                <Text style={styles.detailValue}>{Math.round(match.distance.manifested)}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Soul Distance</Text>
                <Text style={styles.detailValue}>{Math.round(match.distance.soul)}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Harmony Zone</Text>
                <Text style={styles.detailValue}>{match.harmonyZone}</Text>
              </View>
            </View>

            {match.isComplementaryMatch && (
              <View style={styles.complementaryBadge}>
                <Text style={styles.complementaryText}>✨ Complementary Match</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.matchResultsContainer}>
      {/* Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>
          {matches.length} Compatible Matches
        </Text>
        
        {/* Filter Controls */}
        <View style={styles.filterControls}>
          {/* Sort and filter controls would go here */}
        </View>
      </View>

      {/* Matches List */}
      <ScrollView
        style={styles.matchesList}
        showsVerticalScrollIndicator={false}
      >
        {matches.map(renderMatchCard)}
      </ScrollView>
    </View>
  );
};

/**
 * Compatibility Bar Component
 */
interface CompatibilityBarProps {
  label: string;
  value: number;
  color: string;
}

const HarmonyCompatibilityBar: React.FC<CompatibilityBarProps> = ({ label, value, color }) => (
  <View style={styles.compatibilityBar}>
    <Text style={styles.compatibilityLabel}>{label}</Text>
    <View style={styles.compatibilityTrack}>
      <View
        style={[
          styles.compatibilityFill,
          {
            width: `${value * 100}%`,
            backgroundColor: color
          }
        ]}
      />
    </View>
    <Text style={styles.compatibilityValue}>{Math.round(value * 100)}%</Text>
  </View>
);

/**
 * Styles
 */
const styles = StyleSheet.create({
  // Chat Interface Styles
  chatContainer: {
    flex: 1,
    backgroundColor: HarmonyColors.background,
  },
  chatHeader: {
    padding: 16,
    backgroundColor: HarmonyColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: HarmonyColors.textSecondary + '20',
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: HarmonyColors.text,
    marginBottom: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseText: {
    fontSize: 14,
    color: HarmonyColors.text,
    fontWeight: '500',
  },
  confidenceText: {
    fontSize: 12,
    color: HarmonyColors.textSecondary,
  },
  progressBar: {
    height: 4,
    backgroundColor: HarmonyColors.textSecondary + '20',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  userBubble: {
    backgroundColor: HarmonyColors.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: HarmonyColors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: HarmonyColors.textSecondary + '20',
  },
  questionBubble: {
    borderLeftWidth: 4,
    borderLeftColor: HarmonyColors.accent,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: HarmonyColors.surface,
  },
  aiMessageText: {
    color: HarmonyColors.text,
  },
  messageTime: {
    fontSize: 12,
    color: HarmonyColors.textSecondary,
  },
  inferenceIndicator: {
    marginTop: 8,
    padding: 6,
    backgroundColor: HarmonyColors.accent + '20',
    borderRadius: 8,
  },
  inferenceText: {
    fontSize: 12,
    color: HarmonyColors.text,
    fontStyle: 'italic',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  typingText: {
    fontSize: 14,
    color: HarmonyColors.textSecondary,
    marginRight: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: HarmonyColors.textSecondary,
    marginHorizontal: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: HarmonyColors.surface,
    borderTopWidth: 1,
    borderTopColor: HarmonyColors.textSecondary + '20',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: HarmonyColors.textSecondary + '40',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: HarmonyColors.textSecondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: HarmonyColors.primary,
  },
  sendButtonText: {
    color: HarmonyColors.surface,
    fontSize: 16,
    fontWeight: '600',
  },

  // Profile Display Styles
  profileContainer: {
    flex: 1,
    backgroundColor: HarmonyColors.background,
  },
  profileHeader: {
    padding: 20,
    backgroundColor: HarmonyColors.surface,
    alignItems: 'center',
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: HarmonyColors.text,
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 16,
    color: HarmonyColors.textSecondary,
  },
  signatureCodeContainer: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: HarmonyColors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  signatureCodeGradient: {
    padding: 24,
    alignItems: 'center',
  },
  signatureCodeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: HarmonyColors.surface,
    fontFamily: 'monospace',
    letterSpacing: 4,
  },
  signatureCodeLabel: {
    fontSize: 14,
    color: HarmonyColors.surface,
    marginTop: 8,
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: HarmonyColors.text,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  archetypeSection: {
    marginBottom: 20,
  },
  archetypeCard: {
    backgroundColor: HarmonyColors.surface,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: HarmonyColors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  archetypeHeader: {
    marginBottom: 12,
  },
  archetypeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: HarmonyColors.text,
  },
  archetypeTitle: {
    fontSize: 16,
    color: HarmonyColors.primary,
    fontWeight: '600',
  },
  archetypeDescription: {
    fontSize: 14,
    color: HarmonyColors.textSecondary,
    lineHeight: 20,
  },
  archetypeWheelContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  archetypeWheel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimensionsSection: {
    marginBottom: 20,
  },
  dimensionSlider: {
    backgroundColor: HarmonyColors.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: HarmonyColors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dimensionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dimensionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: HarmonyColors.text,
  },
  dimensionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: HarmonyColors.primary,
  },
  sliderTrack: {
    height: 8,
    backgroundColor: HarmonyColors.textSecondary + '20',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  sliderFill: {
    height: '100%',
    borderRadius: 4,
  },
  dimensionDescription: {
    fontSize: 14,
    color: HarmonyColors.textSecondary,
  },
  detailedSection: {
    marginBottom: 20,
  },

  // Match Results Styles
  matchResultsContainer: {
    flex: 1,
    backgroundColor: HarmonyColors.background,
  },
  resultsHeader: {
    padding: 20,
    backgroundColor: HarmonyColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: HarmonyColors.textSecondary + '20',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: HarmonyColors.text,
    marginBottom: 12,
  },
  filterControls: {
    // Filter controls styles would go here
  },
  matchesList: {
    flex: 1,
    padding: 16,
  },
  matchCard: {
    backgroundColor: HarmonyColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: HarmonyColors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  complementaryMatch: {
    borderLeftWidth: 4,
    borderLeftColor: HarmonyColors.accent,
  },
  expandedMatch: {
    elevation: 4,
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchSignature: {
    flex: 1,
  },
  matchSignatureText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: HarmonyColors.text,
    fontFamily: 'monospace',
  },
  matchArchetype: {
    fontSize: 14,
    color: HarmonyColors.textSecondary,
  },
  matchScore: {
    alignItems: 'flex-end',
  },
  matchScoreText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  matchType: {
    fontSize: 12,
    color: HarmonyColors.textSecondary,
  },
  compatibilityBreakdown: {
    marginBottom: 12,
  },
  compatibilityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  compatibilityLabel: {
    fontSize: 12,
    color: HarmonyColors.textSecondary,
    width: 80,
  },
  compatibilityTrack: {
    flex: 1,
    height: 6,
    backgroundColor: HarmonyColors.textSecondary + '20',
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  compatibilityFill: {
    height: '100%',
    borderRadius: 3,
  },
  compatibilityValue: {
    fontSize: 12,
    color: HarmonyColors.text,
    width: 40,
    textAlign: 'right',
  },
  matchReason: {
    fontSize: 14,
    color: HarmonyColors.textSecondary,
    fontStyle: 'italic',
  },
  matchDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: HarmonyColors.textSecondary + '20',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: HarmonyColors.text,
    marginBottom: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  detailItem: {
    width: '50%',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: HarmonyColors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    color: HarmonyColors.text,
    fontWeight: '600',
  },
  complementaryBadge: {
    backgroundColor: HarmonyColors.accent + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  complementaryText: {
    fontSize: 12,
    color: HarmonyColors.accent,
    fontWeight: '600',
  },
});

// Export all components
export default {
  HarmonyChatInterface,
  HarmonyProfileDisplay,
  HarmonyMatchResults,
  HarmonyArchetypeWheel,
  HarmonyProgressIndicator,
  HarmonyCompatibilityBar
};