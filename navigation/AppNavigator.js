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
import ResourcesPage from '../screens/Resources';
import RoutineBuilder from '../screens/RoutineBuilder';
import SavedRoutines from '../screens/SavedRoutines';
import RoutineViewer from '../components/RoutineViewer';
import RoutineCalendar from '../components/RoutineCalendar';

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
      <Stack.Screen name="Routine Builder" component={RoutineBuilder} />
      <Stack.Screen name="Saved Routines" component={SavedRoutines} />
      <Stack.Screen name="View Routines" component={RoutineViewer} />
      <Stack.Screen name="Routine Calendar" component={RoutineCalendar} />
      <Stack.Screen name="Session Summary" component={SessionSummary} />
      <Stack.Screen name="Reflections" component={Reflections} />
      <Stack.Screen name="Resources" component={ResourcesPage} />
      {/* Add other screens here */}
    </Stack.Navigator>
  );
};

export default AppNavigator;