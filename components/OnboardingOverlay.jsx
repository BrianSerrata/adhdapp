import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const OnboardingOverlay = ({ step, onNext, onFinish }) => {
  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.spotlightContainer}>
            <Text style={styles.title}>Welcome to Your Home Page!</Text>
            <Text style={styles.description}>
              Here you'll see your tasks for the day and track your progress ✅
            </Text>
            <TouchableOpacity onPress={onNext} style={styles.nextButton}>
              <LinearGradient
                colors={["#3d5afe", "#5ce1e6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
              >
                <Text style={styles.buttonText}>Got it!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        );
      case 2:
        return (
          <View style={styles.spotlightContainer}>
            <Text style={styles.title}>Let's Get Started!</Text>
            <Text style={styles.description}>
              Let's get you started by creating your first set of tasks.
              Our AI will help you organize your day effectively.
            </Text>
            <TouchableOpacity onPress={onFinish} style={styles.nextButton}>
              <LinearGradient
                colors={["#3d5afe", "#5ce1e6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
              >
                <Text style={styles.buttonText}>Start Planning</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Animated.View 
      style={styles.overlay}
      entering={FadeIn.duration(500)}
    >
      {renderContent()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Reduced opacity from 0.85 to 0.5
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  spotlightContainer: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(26, 26, 26, 0.9)', // Semi-transparent background
    width: width * 0.85,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  nextButton: {
    width: '100%',
    marginTop: 16,
  },
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingOverlay;