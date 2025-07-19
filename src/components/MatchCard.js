// components/MatchCard.js - Fixed Animated Match Card Component
// Save in: frontend/src/components/MatchCard.js

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  PanResponder
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.9;
const CARD_HEIGHT = screenHeight * 0.7;

const MatchCard = ({ 
  user, 
  onSwipeLeft, 
  onSwipeRight, 
  onSuperLike,
  style,
  index = 0 
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const photos = user?.photos || [];
  const currentPhoto = photos[currentPhotoIndex] || { url: 'https://via.placeholder.com/400x600' };

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        translateX.setOffset(translateX._value);
        translateY.setOffset(translateY._value);
      },
      onPanResponderMove: (evt, gestureState) => {
        translateX.setValue(gestureState.dx);
        translateY.setValue(gestureState.dy);
        
        // Update rotation based on translation
        const rotateValue = gestureState.dx / screenWidth * 30;
        rotate.setValue(rotateValue);
      },
      onPanResponderRelease: (evt, gestureState) => {
        translateX.flattenOffset();
        translateY.flattenOffset();
        
        const { dx, dy, vx } = gestureState;
        
        // Super like (swipe up)
        if (dy < -120) {
          animateOffScreen('up', onSuperLike);
          return;
        }
        
        // Like/Pass thresholds
        const threshold = screenWidth * 0.3;
        const shouldSwipeRight = dx > threshold || vx > 1;
        const shouldSwipeLeft = dx < -threshold || vx < -1;

        if (shouldSwipeRight) {
          animateOffScreen('right', onSwipeRight);
        } else if (shouldSwipeLeft) {
          animateOffScreen('left', onSwipeLeft);
        } else {
          // Snap back to center
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
            Animated.spring(translateY, {
              toValue: 0,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
            Animated.spring(rotate, {
              toValue: 0,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const animateOffScreen = (direction, callback) => {
    const toValue = direction === 'left' ? -screenWidth * 1.5 : 
                   direction === 'right' ? screenWidth * 1.5 : 0;
    const toValueY = direction === 'up' ? -screenHeight : 0;

    Animated.parallel([
      Animated.timing(translateX, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: toValueY,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (callback && user) callback(user);
    });
  };

  const nextPhoto = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const previousPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '?';
    
    try {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      return '?';
    }
  };

  const rotateValue = rotate.interpolate({
    inputRange: [-30, 0, 30],
    outputRange: ['-30deg', '0deg', '30deg'],
    extrapolate: 'clamp',
  });

  if (!user) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.card,
        style,
        {
          transform: [
            { translateX },
            { translateY },
            { rotate: rotateValue },
            { scale }
          ],
          opacity,
          zIndex: 1000 - index,
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Photo Area */}
      <View style={styles.photoContainer}>
        <Image 
          source={{ uri: currentPhoto.url }} 
          style={styles.photo}
          onError={(error) => console.log('Image load error:', error)}
        />
        
        {/* Photo Navigation */}
        {photos.length > 1 && (
          <>
            <TouchableOpacity
              style={[styles.photoNav, styles.photoNavLeft]}
              onPress={previousPhoto}
              activeOpacity={0.7}
            >
              <View style={styles.photoNavHitbox} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.photoNav, styles.photoNavRight]}
              onPress={nextPhoto}
              activeOpacity={0.7}
            >
              <View style={styles.photoNavHitbox} />
            </TouchableOpacity>
          </>
        )}

        {/* Photo Indicators */}
        {photos.length > 1 && (
          <View style={styles.photoIndicators}>
            {photos.map((_, photoIndex) => (
              <View
                key={photoIndex}
                style={[
                  styles.photoIndicator,
                  photoIndex === currentPhotoIndex && styles.activeIndicator
                ]}
              />
            ))}
          </View>
        )}

        {/* Online Status */}
        {user.isOnline && (
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        )}

        {/* Swipe Indicators */}
        <Animated.View
          style={[
            styles.swipeIndicator,
            styles.likeIndicator,
            {
              opacity: translateX.interpolate({
                inputRange: [0, screenWidth * 0.3],
                outputRange: [0, 1],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          <Text style={styles.swipeText}>LIKE</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.swipeIndicator,
            styles.passIndicator,
            {
              opacity: translateX.interpolate({
                inputRange: [-screenWidth * 0.3, 0],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          <Text style={styles.swipeText}>PASS</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.swipeIndicator,
            styles.superLikeIndicator,
            {
              opacity: translateY.interpolate({
                inputRange: [-120, 0],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              }),
            },
          ]}
        >
          <Text style={[styles.swipeText, styles.superLikeText]}>SUPER LIKE</Text>
        </Animated.View>
      </View>

      {/* User Info */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.infoGradient}
      >
        <View style={styles.userInfo}>
          <View style={styles.basicInfo}>
            <Text style={styles.userName}>
              {user.name || 'Unknown'}, {calculateAge(user.birthDate || user.age)}
            </Text>
            
            {user.location && (
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={16} color="white" />
                <Text style={styles.location}>
                  {user.location.city || ''}{user.location.city && user.location.state ? ', ' : ''}{user.location.state || ''}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setShowDetails(!showDetails)}
          >
            <Ionicons 
              name={showDetails ? "chevron-down" : "information-circle-outline"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>

        {/* Expandable Details */}
        {showDetails && (
          <View style={styles.detailsContainer}>
            {user.occupation && (
              <View style={styles.detailItem}>
                <Ionicons name="briefcase-outline" size={16} color="white" />
                <Text style={styles.detailText}>{user.occupation}</Text>
              </View>
            )}
            
            {user.education && (
              <View style={styles.detailItem}>
                <Ionicons name="school-outline" size={16} color="white" />
                <Text style={styles.detailText}>{user.education}</Text>
              </View>
            )}
            
            {user.interests && user.interests.length > 0 && (
              <View style={styles.interestsContainer}>
                {user.interests.slice(0, 3).map((interest, idx) => (
                  <View key={idx} style={styles.interestTag}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
                {user.interests.length > 3 && (
                  <View style={styles.interestTag}>
                    <Text style={styles.interestText}>+{user.interests.length - 3}</Text>
                  </View>
                )}
              </View>
            )}

            {user.aboutMe && (
              <Text style={styles.aboutText} numberOfLines={3}>
                {user.aboutMe}
              </Text>
            )}
          </View>
        )}
      </LinearGradient>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={() => animateOffScreen('left', onSwipeLeft)}
        >
          <Ionicons name="close" size={24} color="#FF6B6B" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={() => animateOffScreen('up', onSuperLike)}
        >
          <Ionicons name="star" size={20} color="#4ECDC4" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => animateOffScreen('right', onSwipeRight)}
        >
          <Ionicons name="heart" size={24} color="#4ECDC4" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    position: 'absolute',
  },
  photoContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoNav: {
    position: 'absolute',
    top: 0,
    bottom: 100,
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoNavLeft: {
    left: 0,
  },
  photoNavRight: {
    right: 0,
  },
  photoNavHitbox: {
    width: '100%',
    height: '100%',
  },
  photoIndicators: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  photoIndicator: {
    width: 30,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  activeIndicator: {
    backgroundColor: 'white',
  },
  onlineIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlineDot: {
    width: 8,
    height: 8,
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
    marginRight: 4,
  },
  onlineText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  swipeIndicator: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    transform: [{ translateY: -25 }],
  },
  likeIndicator: {
    transform: [{ translateY: -25 }, { rotate: '20deg' }],
  },
  passIndicator: {
    transform: [{ translateY: -25 }, { rotate: '-20deg' }],
  },
  superLikeIndicator: {
    top: '30%',
  },
  swipeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    borderWidth: 3,
    borderColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  superLikeText: {
    color: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  infoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  basicInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 16,
    color: 'white',
    marginLeft: 4,
    opacity: 0.9,
  },
  infoButton: {
    padding: 8,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
    opacity: 0.9,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  interestText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  aboutText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
    marginTop: 8,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  passButton: {
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  superLikeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  likeButton: {
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
});

export default MatchCard;