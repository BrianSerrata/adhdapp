// screens/Routines.jsx
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import RoutineBuilder from './RoutineBuilder';
import SMARTBuilder from './SMARTBuilder';
import { trackPlannerTabOpened } from '../backend/apis/segment';
import { auth } from '../firebase';

const Routines = () => {
  const [activeBuilder, setActiveBuilder] = useState('routine'); // 'routine' or 'goal'

  // useEffect(() => {
  //   // Track "Resources Tab Opened" when the component mounts
  //   trackPlannerTabOpened({
  //     userId: auth.currentUser.uid,
  //     timestamp: new Date().toISOString(),
  //   });
  // }, []);

  return (
    <View style={styles.container}>
      {/* Content Area */}
      <View style={styles.contentContainer}>
        {activeBuilder === 'routine' ? <RoutineBuilder /> : <SMARTBuilder />}
      </View>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            activeBuilder === 'routine' && styles.activeButton
          ]}
          onPress={() => setActiveBuilder('routine')}
        >
          <Text style={[
            styles.buttonText,
            activeBuilder === 'routine' && styles.activeButtonText
          ]}>
            Routine Builder
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            activeBuilder === 'smart' && styles.activeButton
          ]}
          onPress={() => setActiveBuilder('smart')}
        >
          <Text style={[
            styles.buttonText,
            activeBuilder === 'smart' && styles.activeButtonText
          ]}>
            Goal Builder
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentContainer: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#242424',
  },
  navButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#242424',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#2f4156',
  },
  buttonText: {
    color: '#848484',
    fontSize: 14,
    fontWeight: '600',
  },
  activeButtonText: {
    color: '#ffffff',
  },
};

export default Routines;