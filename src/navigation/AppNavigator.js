// SoulAI_Frontend/src/navigation/AppNavigator.js
// Main navigation component that handles all app navigation

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-native-gesture-handler';

// Import your existing screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import SoulChatScreen from '../screens/chat/SoulChatScreen';
import MatchChatScreen from '../screens/chat/MatchChatScreen';
import MatchesScreen from '../screens/matches/MatchesScreen';
import ListScreen from '../screens/matches/ListScreen';
import MatchProfileScreen from '../screens/matches/MatchProfileScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import UserProfileScreen from '../screens/profile/UserProfileScreen';

// Import Tab Navigator if you want to use it
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainApp"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#9eb7ec',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* Auth Screens */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Signup" 
          component={SignupScreen}
          options={{ headerShown: false }}
        />
        
        {/* Main App - Using Tab Navigator */}
        <Stack.Screen 
          name="MainApp" 
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        
        {/* Individual Screens */}
        <Stack.Screen 
          name="SoulChat" 
          component={SoulChatScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MatchChat" 
          component={MatchChatScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Matches" 
          component={MatchesScreen}
          options={{ title: 'Your Matches' }}
        />
        <Stack.Screen 
          name="MatchList" 
          component={ListScreen}
          options={{ title: 'All Matches' }}
        />
        <Stack.Screen 
          name="MatchProfile" 
          component={MatchProfileScreen}
          options={{ title: 'Profile' }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ title: 'Your Profile' }}
        />
        <Stack.Screen 
          name="UserProfileScreen" 
          component={UserProfileScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;