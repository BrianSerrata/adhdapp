import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const HomePage = ({ navigation }) => {
  const handleAIChat = () => {
    navigation.navigate('Therapy Chat');
  };

  const handleImpulseLog = () => {
    navigation.navigate('Impulse Logger');
  };

  const handleTherapySessions = () => {
    navigation.navigate('Therapy Sessions');
  };

  return (
    <LinearGradient
      colors={['#e9d5ff', '#dbeafe']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.title}>Hey there! 👋</Text>
          <Text style={styles.subtitle}>What would you like to do today?</Text>
        </View>

        {/* Main Action Buttons */}
        <View style={styles.buttonContainer}>
          {/* AI Chat Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleAIChat}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <View style={[styles.iconContainer, { backgroundColor: '#dbeafe' }]}>
              <Feather name="message-square" size={24} color="#2563eb" />
              </View>
              <View style={styles.buttonText}>
                <Text style={styles.buttonTitle}>Chat with AI Therapist</Text>
                <Text style={styles.buttonSubtitle}>
                  Have a friendly conversation about what's on your mind
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Impulse Logger Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleImpulseLog}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <View style={[styles.iconContainer, { backgroundColor: '#f3e8ff' }]}>
              <Feather name="zap-off" size={24} color="#9333ea" />
              </View>
              <View style={styles.buttonText}>
                <Text style={styles.buttonTitle}>Log an Impulse</Text>
                <Text style={styles.buttonSubtitle}>
                  Quick record of what you're feeling right now
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleTherapySessions}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <View style={[styles.iconContainer, { backgroundColor: '#f3e8ff' }]}>
              <Feather name="book" size={24} color="#9333ea" />
              </View>
              <View style={styles.buttonText}>
                <Text style={styles.buttonTitle}>Review Past Sessions</Text>
                <Text style={styles.buttonSubtitle}>
                  Look at past sessions and key-takeaways
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Encouraging Message */}
        <Text style={styles.encouragingText}>
          "Small steps lead to big changes! 🌟"
        </Text>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6b21a8',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7e22ce',
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    padding: 12,
    borderRadius: 12,
  },
  buttonText: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: '#3b82f6',
  },
  encouragingText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#7e22ce',
    fontStyle: 'italic',
    marginTop: 32,
  },
});

export default HomePage;