// SoulAppClean/App.js
// Complete working App.js file based on your project structure

import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView, Text } from 'react-native';

// Import your navigation
import AppNavigator from './src/navigation/AppNavigator';

// Import context providers - let's add them one by one to isolate issues
import { LocalizationProvider } from './src/context/LocalizationContext';
import { ThemeProvider } from './src/styles/ThemeProvider';
import { UserProvider } from './src/context/UserContext';
import { AIProvider } from './src/context/AIContext';
import { ChatProvider } from './src/context/ChatContext';

// Import loading screen
import LoadingScreen from './src/components/LoadingScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true); // Re-enabled with shorter timer
  const [error, setError] = useState(null);

  const handleLoadingFinish = () => {
    setIsLoading(false);
  };

  // If there's an error, show it
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error.message}</Text>
          <Text style={styles.errorDetail}>{error.stack}</Text>
        </View>
      </SafeAreaView>
    );
  }

  try {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <LocalizationProvider>
          <ThemeProvider>
            <UserProvider>
              <AIProvider>
                <ChatProvider>
                  <View style={styles.appContainer}>
                    <AppNavigator />
                    {isLoading && <LoadingScreen onFinish={handleLoadingFinish} />}
                  </View>
                </ChatProvider>
              </AIProvider>
            </UserProvider>
          </ThemeProvider>
        </LocalizationProvider>
      </SafeAreaView>
    );
  } catch (error) {
    console.error('App render error:', error);
    setError(error);
    return null;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f5ff', // Cotton candy light background
  },
  appContainer: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorDetail: {
    fontSize: 12,
    color: '#6b6b6b',
    textAlign: 'left',
  },
});