import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { AppState, Platform } from 'react-native'; // Import AppState
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './navigation/AppNavigator';

import { trackAppOpened } from './backend/apis/segment';

export default function App() {
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        // App has become active (opened or foregrounded)
        trackAppOpened({
          timestamp: new Date().toISOString(),
          platform: Platform.OS,
        });
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

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