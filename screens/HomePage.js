import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
  Dimensions,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import styles from '../styles/HomePageStyles';

const { width } = Dimensions.get('window');

const HomePage = ({ navigation }) => {
  const [greeting, setGreeting] = useState('');
  const [quote, setQuote] = useState('');
  const [reflectionModalVisible, setReflectionModalVisible] = useState(false);
  const [reflection, setReflection] = useState('');
  const [question, setQuestion] = useState('');

  useEffect(() => {
    setGreeting(getGreeting());
    setQuote(getRandomQuote());
    setQuestion(getRandomQuestion());
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRandomQuote = () => {
    const quotes = [
      "Small steps lead to big changes! 🌟",
      "You've got this! One task at a time. 💪",
      "Focus on progress, not perfection. 🎯",
      "Your effort today is shaping your future. 🌈",
      "Embrace the journey, celebrate small wins! 🎉",
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const getRandomQuestion = () => {
    const questions = [
      "What was the highlight of your day?",
      "What’s one thing you learned today?",
      "What are you most grateful for today?",
      "What challenged you today, and how did you overcome it?",
      "How did you take care of yourself today?",
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  };

  const handleReflectionSubmit = () => {
    if (reflection.trim()) {
      Alert.alert("Reflection Submitted", "Thank you for reflecting today!");
      setReflection('');
      setReflectionModalVisible(false);
    } else {
      Alert.alert("Empty Reflection", "Please enter your reflection before submitting.");
    }
  };

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
  };

  const renderFeatureCard = (title, icon, screen) => (
    <TouchableOpacity
      style={styles.featureCard}
      onPress={() => handleNavigation(screen)}
      activeOpacity={0.7}
    >
      <Feather name={icon} size={32} color="#4f46e5" />
      <Text style={styles.featureTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header Section */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{greeting}</Text>
            </View>
          </View>

          {/* Quote Card */}
          <View style={styles.quoteContainer}>
            <Text style={styles.quote}>{quote}</Text>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresGrid}>
            {renderFeatureCard("AI Chat", "message-square", "Therapy Chat")}
            {renderFeatureCard("Impulse Log", "zap-off", "Impulse Logger")}
            {renderFeatureCard("Sessions", "book", "Therapy Sessions")}
          </View>

          {/* Daily Reflection */}
          <Text style={styles.sectionTitle}>Daily Reflection</Text>
          <View style={styles.reflectionCard}>
            <Text style={styles.reflectionTitle}>Reflect on the question of the day</Text>
            <Text style={styles.reflectionDescription}>
              Take a moment to answer today’s question and reflect on your journey.
            </Text>
            <TouchableOpacity
              style={styles.reflectionButton}
              onPress={() => setReflectionModalVisible(true)}
            >
              <Text style={styles.reflectionButtonText}>Take a moment to reflect</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Reflection Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={reflectionModalVisible}
          onRequestClose={() => setReflectionModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalQuestion}>{question}</Text>
              <TextInput
                style={styles.reflectionInput}
                placeholder="Type your reflection here..."
                placeholderTextColor="#6B7280"
                value={reflection}
                onChangeText={setReflection}
                multiline
              />
              <TouchableOpacity style={styles.submitButton} onPress={handleReflectionSubmit}>
                <Text style={styles.submitButtonText}>Submit Reflection</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default HomePage;