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
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import styles from '../styles/HomePageStyles';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

const { width } = Dimensions.get('window');

const HomePage = ({ navigation }) => {
  const [greeting, setGreeting] = useState('');
  const [quote, setQuote] = useState('');
  const [reflectionModalVisible, setReflectionModalVisible] = useState(false);
  const [reflection, setReflection] = useState('');
  const [question, setQuestion] = useState('');
  
  const closeModal = () => {
    setReflectionModalVisible(false);
    setReflection('');
  };

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

  const handleReflectionSubmit = async () => {
    if (reflection.trim()) {
      try {
        // Construct reflection data
        const reflectionData = {
          question: question,
          answer: reflection.trim(),
          date: new Date(),
          createdAt: Timestamp.now(),
          userId: auth.currentUser.uid, // Optional, for user-specific data
        };
  
        // Reference the Firestore collection for the current user
        const reflectionsRef = collection(db, 'users', auth.currentUser.uid, 'reflections');
  
        // Add the reflection to Firestore
        await addDoc(reflectionsRef, reflectionData);
  
        Alert.alert("Reflection Submitted", "Thank you for reflecting today!");
        setReflection('');
        setReflectionModalVisible(false);
  
        // Optional: Refresh data or trigger state update if needed
      } catch (error) {
        console.error('Error submitting reflection:', error);
        Alert.alert('Error', 'Failed to submit your reflection. Please try again later.');
      }
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
            {renderFeatureCard("Journal", "edit", "Journal Entries")}
            {renderFeatureCard("Past Sessions", "book", "Therapy Sessions")}
            {renderFeatureCard("Past Reflections", "edit-3", "Reflections")}
          </View>

          {/* Daily Reflection */}
          <View style={styles.reflectionCard}>
            <Text style={styles.reflectionTitle}>Reflect on the question of the day</Text>
            <Text style={styles.reflectionDescription}>
              Take a moment to answer today’s question and focus on the present.
            </Text>
            <TouchableOpacity
              style={styles.reflectionButton}
              onPress={() => setReflectionModalVisible(true)}
            >
              <Text style={styles.reflectionButtonText}>Take a moment to reflect</Text>
            </TouchableOpacity>
          </View>

        <View style={styles.resourcesContainer}>
            <TouchableOpacity
              style={styles.resourceButton}
              onPress={() => navigation.navigate('Resources')}
            >
              <Feather name="book-open" size={20} color="#FFFFFF" />
              <Text style={styles.resourceButtonText}>
                ADHD Resources
              </Text>
              <Feather name="chevron-right" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Reflection Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={reflectionModalVisible}
          onRequestClose={closeModal}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalOverlay}
            >
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={closeModal}
                    >
                      <Feather name="x" size={24} color="white" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.modalQuestion}>{question}</Text>
                  
                  <TextInput
                    style={styles.reflectionInput}
                    placeholder="Type your reflection here..."
                    placeholderTextColor="#6B7280"
                    value={reflection}
                    onChangeText={setReflection}
                    multiline
                    textAlignVertical="top"
                  />

                  <TouchableOpacity 
                    style={[
                      styles.submitButton,
                      !reflection.trim() && styles.submitButtonDisabled
                    ]} 
                    onPress={handleReflectionSubmit}
                    disabled={!reflection.trim()}
                  >
                    <Text style={styles.submitButtonText}>Submit Reflection</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </Modal>

      </SafeAreaView>
    </LinearGradient>
  );
};

export default HomePage;