// src/navigation/TabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens based on your current structure
import SoulChatScreen from '../screens/chat/SoulChatScreen';
import ListScreen from '../screens/matches/ListScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import MatchChatScreen from '../screens/chat/MatchChatScreen';
import MatchProfileScreen from '../screens/matches/MatchProfileScreen';
import DiscoveryScreen from '../screens/discovery/DiscoveryScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack navigator for the Matches flow
function MatchesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ListScreen" component={ListScreen} />
      <Stack.Screen name="MatchChat" component={MatchChatScreen} />
      <Stack.Screen name="MatchProfile" component={MatchProfileScreen} />
    </Stack.Navigator>
  );
}

// Tab navigator for main screens
function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="SoulChatScreen"
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tab.Screen 
        name="SoulChatScreen" 
        component={SoulChatScreen}
      />
      <Tab.Screen 
        name="DiscoveryScreen" 
        component={DiscoveryScreen}
      />
      <Tab.Screen 
        name="MatchesStack" 
        component={MatchesStack}
      />
      <Tab.Screen 
        name="ProfileScreen" 
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}

export default TabNavigator;