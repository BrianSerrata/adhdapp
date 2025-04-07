import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { connectFirestoreEmulator, doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from 'firebase/auth';
// import * as Notifications from 'expo-notifications'; // Make sure this import is added
// import Constants from 'expo-constants'; // You'll need this package too
import styles from '../styles/RegisterPageStyles';

const RegisterPage = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const registerForPushNotificationsAsync = async () => {

    let token;

    if (Platform.OS === 'ios') {
      // iOS-specific settings
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      console.log("final status:",finalStatus)
      
      if (existingStatus !== 'granted') {
        console.log("requesting access")
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: true,
          },
        });
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert(
          'Notifications Disabled',
          'You will not receive task reminders. You can enable notifications in your device settings.',
          [{ text: 'OK', style: 'default' }]
        );
        return null;
      }
    }

    try {
      // Get the Expo push token
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
      
      console.log('Expo Push Token:', token);
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  };
  

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please enter your name, email, and password.');
      return;
    }

    setLoading(true);

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Get user ID
      const userId = userCredential.user.uid;

      // Save user name to Firestore (add the isNewUser flag too)
      await setDoc(doc(db, 'users', userId), { 
        name, 
        email,
        createdAt: new Date().toISOString(),
        isNewUser: true 
      });

      // Initialize user preferences - ADD THIS LINE
      const prefsInitialized = await initializeUserPreferences(userId);
      if (!prefsInitialized) {
        console.warn('User preferences not initialized properly');
      }

    console.log('Registered with:', userCredential.user.email);

      const token = await registerForPushNotificationsAsync();
      if (token) {
        // Save the token to Firestore
        await setDoc(doc(db, 'users', userId), { notificationToken: token }, { merge: true });
        console.log('Notification token saved:', token);
      }

      navigation.replace('MainApp');
    } catch (error) {
      console.error('Registration Error:', error);
      Alert.alert('Registration Error', error.message);
    } finally {
      setLoading(false);
    }
  };


  const initializeUserPreferences = async (userId) => {
    try {
      await Promise.all([
        AsyncStorage.setItem('hasCompletedOnboarding', 'false'),
        AsyncStorage.setItem('hasSeenRoutineBuilder', 'false'),
        AsyncStorage.setItem('hasSeenTaskList','false'),
        AsyncStorage.setItem('hasSeenFirstSave', 'false'),
        AsyncStorage.setItem('hasSeenCalendarInstructions','false'),
        AsyncStorage.setItem('hasSeenCoachOnboarding', 'false'),
        AsyncStorage.setItem('userFirstLogin', 'true'),
        AsyncStorage.setItem('lastLoginDate', new Date().toISOString()),
        AsyncStorage.setItem('userId', userId)
      ]);
      return true;
    } catch (error) {
      console.error('Error initializing user preferences:', error);
      // Don't block registration if preferences fail
      return false;
    }
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kbContainer}
        >
          <Animated.View entering={FadeInDown.duration(500)} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>Create an Account</Text>
              <Text style={styles.description}>
                Enter your email and password to register
              </Text>
            </View>

            <View style={styles.cardContent}>

            <View style={styles.inputContainer}>
                <Feather name="user" size={20} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  placeholderTextColor="#848484"
                  value={name}
                  onChangeText={setName}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Feather name="mail" size={20} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#848484"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Feather name="lock" size={20} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#848484"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Feather 
                    name={showPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color="#848484" 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.button} 
                onPress={handleRegister} 
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Register</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Text
                  style={styles.linkText}
                  onPress={() => navigation.navigate('Login Page')}
                >
                  Log In
                </Text>
              </Text>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default RegisterPage;
