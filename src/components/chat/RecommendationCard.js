import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../styles/globalStyles';
import { getRandomActionEmojis } from '../../utils/emojiUtils';

const { width } = Dimensions.get('window');

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function RecommendationCard({ 
  recommendation, 
  onLike, 
  onPass, 
  onTellMeMore,
  onViewProfile 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [actionEmojis] = useState(() => getRandomActionEmojis());
  const rotationAnim = useRef(new Animated.Value(0)).current;

  const toggleExpanded = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleXY,
      },
    });

    setIsExpanded(!isExpanded);

    // Animate chevron rotation
    Animated.timing(rotationAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const chevronRotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const handleLike = () => {
    onLike && onLike(recommendation);
  };

  const handlePass = () => {
    onPass && onPass(recommendation);
  };

  const handleTellMeMore = () => {
    onTellMeMore && onTellMeMore(recommendation);
  };

  const handleViewProfile = () => {
    onViewProfile && onViewProfile(recommendation);
  };

  const getName = () => {
    return recommendation.fullProfile?.name || 
           recommendation.displayName || 
           recommendation.candidateData?.name || 
           recommendation.name ||
           'Jordan';
  };

  const getAge = () => {
    return recommendation.fullProfile?.age || 
           recommendation.age || 
           recommendation.candidateData?.age || 
           '';
  };

  const getPhotos = () => {
    return recommendation.fullProfile?.photos || 
           recommendation.candidateData?.photos || 
           recommendation.photos || 
           [];
  };

  const getBio = () => {
    return recommendation.fullProfile?.aiGeneratedContent?.bio ||
           recommendation.candidateData?.bio ||
           recommendation.bio ||
           'Getting to know this person...';
  };

  const name = getName();
  const age = getAge();
  const photos = getPhotos();
  const bio = getBio();

  return (
    <View style={styles.cardContainer}>
      {/* Collapsible Header */}
      <TouchableOpacity 
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerName}>
            {name}{age ? `, ${age}` : ''}
          </Text>
          <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
            <Ionicons name="chevron-down" size={20} color="rgba(255, 255, 255, 0.8)" />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {/* Expandable Body */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Single Photo Layout */}
          {photos.length > 0 && (
            <View style={styles.photoLayout}>
              <TouchableOpacity
                onPress={handleViewProfile}
                style={styles.singlePhotoContainer}
              >
                <Image 
                  source={{ uri: photos[0] }} 
                  style={styles.singlePhoto}
                  resizeMode="cover"
                />
                {photos.length > 1 && (
                  <View style={styles.photoCountIndicator}>
                    <Text style={styles.photoCountText}>1/{photos.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Bio Preview */}
          <View style={styles.bioSection}>
            <Text style={styles.bioText} numberOfLines={2}>
              {bio}
            </Text>
          </View>

          {/* Individual Action Button Boxes with Dynamic Emojis */}
          <View style={styles.actionBar}>
            <TouchableOpacity 
              style={[styles.actionButtonBox, styles.likeButtonBox]}
              onPress={handleLike}
              activeOpacity={0.7}
            >
              <Text style={styles.actionEmoji}>{actionEmojis.like}</Text>
              <Text style={styles.actionButtonLabel}>Like</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButtonBox, styles.tellMeMoreButtonBox]}
              onPress={handleTellMeMore}
              activeOpacity={0.7}
            >
              <Text style={styles.actionEmoji}>💭</Text>
              <Text style={styles.actionButtonLabel}>Tell me more</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButtonBox, styles.passButtonBox]}
              onPress={handlePass}
              activeOpacity={0.7}
            >
              <Text style={styles.actionEmoji}>{actionEmojis.pass}</Text>
              <Text style={styles.actionButtonLabel}>Pass</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    marginVertical: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  expandedContent: {
    padding: 16,
  },
  photoLayout: {
    marginBottom: 16,
  },
  singlePhotoContainer: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  singlePhoto: {
    width: '100%',
    height: '100%',
  },
  photoCountIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  bioSection: {
    marginBottom: 16,
  },
  bioText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButtonBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  passButtonBox: {
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  tellMeMoreButtonBox: {
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  likeButtonBox: {
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionButtonLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});