import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Get device width for responsive design
const { width } = Dimensions.get('window');

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
      colors={['#1e3c72', '#2a5298']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.title}>Hey there! 👋</Text>
          <Text style={styles.subtitle}>What would you like to do today?</Text>
        </View>

        {/* Main Content Placeholder */}
        <View style={styles.mainContent}>
          {/* You can add more content here if needed */}
        </View>

        {/* Encouraging Message */}
        <Text style={styles.encouragingText}>
          "Small steps lead to big changes! 🌟"
        </Text>

        {/* Bottom Tab Bar */}
        <View style={styles.tabBar}>
          {/* AI Chat Tab */}
          <TouchableOpacity
            style={styles.tabButton}
            onPress={handleAIChat}
            activeOpacity={0.7}
          >
            <Feather name="message-square" size={24} color="#4f46e5" />
            <Text style={styles.tabText}>Chat</Text>
          </TouchableOpacity>

          {/* Impulse Logger Tab */}
          <TouchableOpacity
            style={styles.tabButton}
            onPress={handleImpulseLog}
            activeOpacity={0.7}
          >
            <Feather name="zap-off" size={24} color="#4f46e5" />
            <Text style={styles.tabText}>Impulse</Text>
          </TouchableOpacity>

          {/* Therapy Sessions Tab */}
          <TouchableOpacity
            style={styles.tabButton}
            onPress={handleTherapySessions}
            activeOpacity={0.7}
          >
            <Feather name="book" size={24} color="#4f46e5" />
            <Text style={styles.tabText}>Sessions</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white', // Delve-like Purple
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white', // Complementary Purple
  },
  mainContent: {
    flex: 1,
    // Add any additional styling or content here
  },
  encouragingText: {
    textAlign: 'center',
    fontSize: 14,
    color: 'white',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // iOS shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  tabButton: {
    alignItems: 'center',
    width: width / 3 - 32, // Adjust width based on number of tabs
  },
  tabText: {
    marginTop: 4,
    fontSize: 12,
    color: 'black',
    fontWeight: '600',
  },
});

export default HomePage;
