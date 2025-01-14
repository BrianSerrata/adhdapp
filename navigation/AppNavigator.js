// navigation/AppNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';

// Import your screens
import LoginPage from '../screens/LoginPage';
import RegisterPage from '../screens/RegisterPage';
import RoutineCalendar from '../components/RoutineCalendar';
import Routines from '../screens/RoutinesPage';
import LifeCoach from '../screens/LifeCoach';
import Resources from '../screens/Resources';
import RoutineManager from '../screens/RoutineManager';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Create TabNavigator separately
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopWidth: 1,
          borderTopColor: '#242424',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          marginBottom: 7, // Adjust this value to raise the tab bar
        },
        tabBarActiveTintColor: '#3d5afe',
        tabBarInactiveTintColor: '#848484',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={RoutineCalendar}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Routines"
        component={Routines}
        options={{
          tabBarLabel: 'Routines',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="schedule" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ADHD Life Coach"
        component={LifeCoach}
        options={{
          tabBarLabel: 'AI Coach',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="chat" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Resources"
        component={Resources}
        options={{
          tabBarLabel: 'Resources',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="library-books" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Routine Manager"
        component={RoutineManager}
        options={{
          tabBarLabel: 'Routine Manager',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="library-books" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Root Navigator
const AppNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Login Page"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login Page" component={LoginPage} />
      <Stack.Screen name="Register Page" component={RegisterPage} />
      <Stack.Screen name="MainApp" component={TabNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;