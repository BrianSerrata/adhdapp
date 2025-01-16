import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import GoalManager from './GoalManager'; // Adjust path as needed
import RoutineManager from './RoutineManager'; // Adjust path as needed

const GeneralManager = ({ navigation }) => {
  const [activeButton, setActiveButton] = useState('routines'); // 'goals' or 'routines'

  return (
    <View style={styles.container}>
      {/* Content Area */}
      <View style={styles.contentContainer}>
        {activeButton === 'goals' ? (
          <GoalManager navigation={navigation} /> // Pass navigation prop
        ) : (
          <RoutineManager navigation={navigation} /> // Pass navigation prop
        )}
      </View>

      {/* Custom Tab Bar */}
      <View style={styles.buttonContainer}>
      <TouchableOpacity
          style={[styles.navButton, activeButton === 'routines' && styles.activeButton]}
          onPress={() => setActiveButton('routines')}
        >
          <Text style={[styles.buttonText, activeButton === 'routines' && styles.activeButtonText]}>
            Routines
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, activeButton === 'goals' && styles.activeButton]}
          onPress={() => setActiveButton('goals')}
        >
          <Text style={[styles.buttonText, activeButton === 'goals' && styles.activeButtonText]}>
            Goals
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
    backgroundColor: '#3d5afe',
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

export default GeneralManager;
