// navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from '../screens/HomePage';
import TherapyChat from '../screens/TherapyChat';
import RegisterPage from '../screens/RegisterPage';
import LoginPage from '../screens/LoginPage';
import TherapySessions from '../screens/TherapySessions';
import Session from '../screens/Session';
import JournalEntries from '../screens/JournalEntries';
import SessionSummary from '../components/SessionSummary';
import Reflections from '../screens/Reflections';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login Page">
      <Stack.Screen name="Home Page" component={HomePage} />
      <Stack.Screen name="Register Page" component={RegisterPage} />
      <Stack.Screen name="Login Page" component={LoginPage} />
      <Stack.Screen name="Therapy Chat" component={TherapyChat} />
      <Stack.Screen name="Therapy Sessions" component={TherapySessions} />
      <Stack.Screen name="Session" component={Session} />
      <Stack.Screen name="Journal Entries" component={JournalEntries} />
      <Stack.Screen name="Session Summary" component={SessionSummary} />
      <Stack.Screen name="Reflections" component={Reflections} />
      {/* Add other screens here */}
    </Stack.Navigator>
  );
};

export default AppNavigator;