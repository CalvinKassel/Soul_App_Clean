// src/styles/globalStyles.js
// Updated with deep, saturated gradient colors matching the image

export const COLORS = {
  // Cotton Candy Gradient Colors
  cottonCandy1: '#cbbaf1',   // Light lavender
  cottonCandy2: '#e8bef3',   // Soft pink-purple
  cottonCandy3: '#B8E6FF',   // Sky blue
  cottonCandy4: '#9eb7ec',   // Periwinkle blue
  
  // Primary Colors (cotton candy inspired)
  primary: '#9eb7ec',        // Periwinkle blue
  primaryLight: '#B8E6FF',   // Sky blue
  primaryDark: '#8a9de8',    // Deeper periwinkle
  
  // Secondary Colors (cotton candy inspired)
  secondary: '#e8bef3',      // Soft pink-purple
  secondaryLight: '#f0d0f5', // Lighter pink-purple
  accent: '#cbbaf1',         // Light lavender
  
  // Gradient Colors (cotton candy theme)
  cottonPink: '#e8bef3',     // Soft pink-purple
  cottonLavender: '#cbbaf1', // Light lavender
  cottonBlue: '#B8E6FF',     // Sky blue
  cottonPeriwinkle: '#9eb7ec', // Periwinkle blue
  
  // Background Colors (cotton candy theme)
  backgroundWhite: '#FFFFFF',
  backgroundLight: '#f8f5ff', // Very light cotton candy tint
  backgroundMedium: '#f0ebff', // Light cotton candy
  backgroundDark: '#e8deff',   // Medium cotton candy tint
  
  // Cotton Candy Gradient Combinations
  cottonCandyFull: ['#cbbaf1', '#e8bef3', '#B8E6FF', '#9eb7ec'], // Full cotton candy spectrum
  cottonCandyLight: ['#f0ebff', '#f8f5ff'],                      // Light cotton candy
  cottonCandyMedium: ['#e8bef3', '#B8E6FF'],                     // Medium cotton candy
  cottonCandyBright: ['#cbbaf1', '#9eb7ec'],                     // Bright cotton candy
  
  // Text Colors (cotton candy theme)
  textPrimary: '#4a4a4a',    // Dark gray for text on light backgrounds
  textSecondary: '#6b6b6b',  // Medium gray for secondary text
  textLight: '#8a8a8a',      // Light gray for subtle text
  textWhite: '#FFFFFF',
  textOnDark: '#FFFFFF',     // White text for dark gradient backgrounds
  textPlaceholder: '#9eb7ec', // Periwinkle for placeholders
  
  // Border Colors (rich, visible)
  borderLight: '#d1b3ff',    // Light purple
  borderMedium: '#8a4fbe',   // Bright purple
  borderDark: '#4a1a6b',     // Rich purple
  
  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#6b2d8a',           // Using vibrant purple for info
  
  // Shadow Colors
  shadowLight: '#000000',
  shadowAccent: '#4a1a6b',   // Rich purple shadow
  shadowPrimary: '#1a0b2e',  // Deep purple shadow
  
  // Special UI Colors (rich versions)
  activeBackground: '#e8d5ff', // Light purple (not transparent)
  thinkingBackground: '#f5f0ff', // Very light purple
  offlineIndicator: '#8a4fbe',
  onlineIndicator: '#10B981',
  
  // Chat-specific colors (rich, deep)
  userBubble: '#4a1a6b',     // Rich purple for user messages
  aiBubble: '#FFFFFF',       // White for AI messages
  aiBubbleBorder: '#d1b3ff', // Light purple border
  welcomeBubble: '#f5f0ff',  // Very light purple for welcome
  welcomeBorder: '#8a4fbe',  // Bright purple border
  
  // Button colors (cotton candy theme)
  sendButton: '#9eb7ec',     // Periwinkle blue for send button
  sendButtonShadow: '#8a9de8', // Deeper periwinkle shadow
  disabledButton: '#BDC3C7', // Keep neutral gray for disabled
  
  // Icon and toolbar colors
  iconActive: '#e8d5ff',     // Light purple background for active icons
  iconActiveBorder: '#8a4fbe', // Bright purple border for active icons
  toolbarBorder: '#d1b3ff',   // Light purple for toolbar border
};

// Night Mode (Northern Lights) Colors
export const NIGHT_COLORS = {
  nightBlack: '#0a0a1a',      // Deep night black
  auroraBlue: '#1a2a6c',     // Deep blue (northern sky)
  auroraGreen: '#29e6a7',    // Aurora green
  auroraTeal: '#1fc8db',     // Teal for aurora effect
  nightText: '#e0f7fa',      // Light blue/green for text
  nightAccent: '#29e6a7',    // Aurora green accent
  nightBorder: '#1a2a6c',    // Deep blue border
  nightInactive: '#22334d',  // Inactive/disabled night color
  nightWhite: '#ffffff',     // For contrast
};

export const GRADIENTS = {
  // Cotton Candy Gradient Combinations
  cottonCandyMain: ['#cbbaf1', '#e8bef3', '#B8E6FF', '#9eb7ec'],    // Main cotton candy gradient
  cottonCandyReverse: ['#9eb7ec', '#B8E6FF', '#e8bef3', '#cbbaf1'], // Reverse cotton candy
  
  // Screen backgrounds
  background: ['#cbbaf1', '#e8bef3', '#B8E6FF', '#9eb7ec'],         // Main background
  backgroundLight: ['#f8f5ff', '#f0ebff'],                          // Light background
  backgroundMedium: ['#e8bef3', '#B8E6FF'],                         // Medium background
  
  // Component gradients
  card: ['#FFFFFF', '#f8f5ff'],                                      // White to light cotton candy
  header: ['#f0ebff', '#e8deff'],                                    // Light header gradient
  
  // Button gradients (cotton candy theme)
  primaryButton: ['#9eb7ec', '#B8E6FF'],                             // Periwinkle to sky blue
  secondaryButton: ['#e8bef3', '#cbbaf1'],                           // Pink-purple to lavender
  accentButton: ['#cbbaf1', '#9eb7ec'],                              // Lavender to periwinkle
  
  // Special cotton candy gradients
  cottonCandyFlow: ['#cbbaf1', '#e8bef3', '#B8E6FF', '#9eb7ec'],     // Flowing cotton candy
  cottonCandyDream: ['#f0ebff', '#e8bef3', '#B8E6FF', '#e8deff'],    // Dreamy cotton candy
  cottonCandyBurst: ['#9eb7ec', '#B8E6FF', '#e8bef3', '#cbbaf1'],    // Bursting cotton candy
  
  // Night Mode (Northern Lights) Gradient
  northernLights: ['#0a0a1a', '#1a2a6c', '#29e6a7'], // Black, blue, aurora green
};

export const SPACING = {
  // Basic spacing units (multiples of 4)
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  
  // Screen margins
  screenHorizontal: 16,
  screenVertical: 20,
  
  // Component spacing
  cardPadding: 16,
  buttonPadding: 12,
  inputPadding: 12,
  
  // Message spacing
  messageVertical: 6,
  messageHorizontal: 16,
  bubblePadding: { horizontal: 16, vertical: 12 },
  
  // Avatar and icon spacing
  avatarMargin: 8,
  iconMargin: 2,
  toolbarPadding: { horizontal: 20, vertical: 8 },
};

export const TYPOGRAPHY = {
  // Font sizes
  heading1: 32,
  heading2: 28,
  heading3: 24,
  heading4: 20,
  heading5: 18,
  heading6: 16,
  
  body: 16,
  bodySmall: 14,
  caption: 12,
  
  // Font weights
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  
  // Line heights
  lineHeightTight: 1.2,
  lineHeightNormal: 1.4,
  lineHeightRelaxed: 1.6,
  
  // Letter spacing
  letterSpacingTight: -0.5,
  letterSpacingNormal: 0,
  letterSpacingWide: 1,
};

export const BORDER_RADIUS = {
  // Standard radius values
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  
  // Component specific
  button: 8,
  input: 25,        // Pill-shaped input
  card: 12,
  avatar: 16,       // Half of avatar size (32/2)
  bubble: 20,       // Message bubbles
  icon: 25,         // Icon containers (50/2)
  
  // Special cases
  circle: 9999,     // For perfect circles
};

export const SHADOWS = {
  // Standard shadow presets with deep colors
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  small: {
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  
  medium: {
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  
  large: {
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  
  // Component specific shadows with deep purple colors
  header: {
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  
  toolbar: {
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 8,
  },
  
  input: {
    shadowColor: COLORS.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  sendButton: {
    shadowColor: COLORS.sendButtonShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  
  activeIcon: {
    shadowColor: COLORS.shadowPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
};

export const COMPONENT_SIZES = {
  // Avatar sizes
  avatarSmall: 24,
  avatarMedium: 32,
  avatarLarge: 48,
  avatarHeader: 36,
  
  // Button sizes
  buttonSmall: { height: 32, paddingHorizontal: 16 },
  buttonMedium: { height: 40, paddingHorizontal: 20 },
  buttonLarge: { height: 48, paddingHorizontal: 24 },
  
  // Icon sizes
  iconSmall: 16,
  iconMedium: 24,
  iconLarge: 32,
  iconToolbar: 38,
  
  // Input sizes
  inputHeight: 40,
  sendButtonSize: { width: 40, height: 40 },
  
  // Container sizes
  iconContainer: { width: 50, height: 50 },
  toolbarIcon: { width: 60, height: 60 },
  
  // Message constraints
  messageBubbleMaxWidth: '75%',
  welcomeBubbleMaxWidth: '85%',
};

// Common style combinations with deep colors
export const COMMON_STYLES = {
  // Flex layouts
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  flexRow: {
    flexDirection: 'row',
  },
  
  flexRowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  flexRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  // Common text styles with deep colors
  headingText: {
    fontSize: TYPOGRAPHY.heading3,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
    letterSpacing: TYPOGRAPHY.letterSpacingWide,
  },
  
  bodyText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.regular,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  
  placeholderText: {
    color: COLORS.textPlaceholder,
  },
  
  // Common button styles with deep colors
  primaryButton: {
    backgroundColor: COLORS.sendButton,
    borderRadius: BORDER_RADIUS.button,
    ...SHADOWS.medium,
  },
  
  secondaryButton: {
    backgroundColor: COLORS.backgroundWhite,
    borderWidth: 1,
    borderColor: COLORS.borderMedium,
    borderRadius: BORDER_RADIUS.button,
  },
  
  // Common container styles
  screen: {
    flex: 1,
    backgroundColor: COLORS.backgroundWhite,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundWhite,
  },
  
  card: {
    backgroundColor: COLORS.backgroundWhite,
    borderRadius: BORDER_RADIUS.card,
    padding: SPACING.cardPadding,
    ...SHADOWS.small,
  },
  
  // Deep gradient background (like in the image)
  deepGradientBackground: {
    flex: 1,
  },
};

// Animation durations (unchanged)
export const ANIMATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  typing: 600,
  streaming: 50,
};

// Export everything as default
export default {
  COLORS,
  NIGHT_COLORS,
  GRADIENTS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
  COMPONENT_SIZES,
  COMMON_STYLES,
  ANIMATIONS,
};