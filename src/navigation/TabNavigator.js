import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SoulChatScreen from '../screens/soulchat/SoulChatScreen';
import ListScreen from '../screens/list/ListScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import MatchChatScreen from '../screens/matches/MatchChatScreen';
import MatchProfileScreen from '../screens/matches/MatchProfileScreen';
import PersonalityAssessment from '../components/PersonalityAssessment';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack navigator for the Matches flow (ListScreen + MatchChatScreen + MatchProfileScreen)
function MatchesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ListScreen" component={ListScreen} />
      <Stack.Screen name="MatchChat" component={MatchChatScreen} />
      <Stack.Screen name="MatchProfile" component={MatchProfileScreen} />
    </Stack.Navigator>
  );
}

// Main app stack that includes personality assessment
function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen 
        name="PersonalityAssessment" 
        component={PersonalityAssessment}
        options={{ presentation: 'modal' }}
      />
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
        tabBarStyle: { display: 'none' }, // Hide default tab bar since we're using custom toolbar
      }}
    >
      <Tab.Screen 
        name="SoulChatScreen" 
        component={SoulChatScreen}
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

// Export the main app stack instead of just TabNavigator
export default AppStack;