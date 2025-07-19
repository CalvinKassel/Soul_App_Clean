// SoulAppClean/App.js
// Complete working App.js file based on your project structure

// Import polyfill first to fix React Navigation useLocale issue
import './src/polyfills/navigationPolyfill';

import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView } from 'react-native';

// Import your navigation
import AppNavigator from './src/navigation/AppNavigator';

// Import context providers
import { AIProvider } from './src/context/AIContext';
import { ChatProvider } from './src/context/ChatContext';
import { UserProvider } from './src/context/UserContext';
import { LocalizationProvider } from './src/context/LocalizationContext';

// Import theme provider
import { ThemeProvider } from './src/styles/ThemeProvider';

// Import loading screen
import LoadingScreen from './src/components/LoadingScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingFinish = () => {
    setIsLoading(false);
  };

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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f5ff', // Cotton candy light background
  },
  appContainer: {
    flex: 1,
  },
});