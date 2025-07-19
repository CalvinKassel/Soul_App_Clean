// SoulAppClean/src/styles/ThemeProvider.js
// Safe Theme Provider with your SoulAI colors

import React, { createContext, useContext } from 'react';

const ThemeContext = createContext();

// Cotton Candy color scheme
const theme = {
  colors: {
    primary: '#9eb7ec',      // Periwinkle blue
    secondary: '#e8bef3',    // Soft pink-purple
    accent: '#cbbaf1',       // Light lavender
    background: '#f8f5ff',   // Very light cotton candy
    surface: '#FFFFFF',      // White
    text: '#4a4a4a',         // Dark gray
    textSecondary: '#6b6b6b', // Medium gray
    error: '#EF4444',        // Red
    success: '#10B981',      // Green
    warning: '#F59E0B',      // Amber
    
    // Cotton candy specific colors
    cottonCandy1: '#cbbaf1', // Light lavender
    cottonCandy2: '#e8bef3', // Soft pink-purple
    cottonCandy3: '#B8E6FF', // Sky blue
    cottonCandy4: '#9eb7ec', // Periwinkle blue
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal',
    },
    caption: {
      fontSize: 14,
      fontWeight: 'normal',
    },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
};

export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;