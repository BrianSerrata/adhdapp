// navigation/AnimatedTabNavigator.js
import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

// Import your screens
import RoutineCalendar from '../components/RoutineCalendar';
import Routines from '../screens/RoutinesPage';
import LifeCoach from '../screens/LifeCoach';
import Resources from '../screens/Resources';
import GeneralManager from '../screens/GeneralManager';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const AnimatedTabNavigator = () => {
  const translateX = useSharedValue(0);
  const currentIndex = useRef(0);

  const handleTabPress = (index) => {
    if (currentIndex.current !== index) {
      translateX.value = withTiming(-index * width, { duration: 300 });
      currentIndex.current = index;
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={{ flex: 1 }}>
      {/* Animated Container */}
      <Animated.View style={[styles.animatedContainer, animatedStyle]}>
        <RoutineCalendar />
        <Routines />
        <LifeCoach />
        <Resources />
        <GeneralManager />
      </Animated.View>

      {/* Custom Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { name: 'Home', icon: 'home' },
          { name: 'Routines', icon: 'schedule' },
          { name: 'AI Coach', icon: 'chat' },
          { name: 'Resources', icon: 'favorite' },
        ].map((tab, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleTabPress(index)}
            style={styles.tabButton}
          >
            <MaterialIcons
              name={tab.icon}
              size={24}
              color={currentIndex.current === index ? '#3d5afe' : '#848484'}
            />
            <Text style={{ color: currentIndex.current === index ? '#3d5afe' : '#848484', fontSize: 12 }}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  animatedContainer: {
    flexDirection: 'row',
    width: width * 5, // Number of tabs
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#242424',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width / 5,
  },
});

export default AnimatedTabNavigator;