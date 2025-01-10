// App.js
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: '#3d5afe',
            background: '#121212',
            card: '#1a1a1a',
            text: '#ffffff',
            border: '#242424',
            notification: '#3d5afe',
          },
        }}
      >
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}