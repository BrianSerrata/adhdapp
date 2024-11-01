// navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from '../screens/HomePage';
import TherapyChat from '../screens/TherapyChat';
import RegisterPage from '../screens/RegisterPage';
import LoginPage from '../screens/LoginPage';
import TherapySessions from '../screens/TherapySessions';
import Session from '../screens/Session';
import ImpulseLogger from '../screens/ImpulseLogger';
import SessionSummary from '../components/SessionSummary';

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
      <Stack.Screen name="Impulse Logger" component={ImpulseLogger} />
      <Stack.Screen name="Session Summary" component={SessionSummary} />
      {/* Add other screens here */}
    </Stack.Navigator>
  );
};

export default AppNavigator;