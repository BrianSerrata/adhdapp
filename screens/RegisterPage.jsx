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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from 'firebase/auth';
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

      // Save user name to Firestore
      await setDoc(doc(db, 'users', userId), { name, email });

      console.log('Registered with:', userCredential.user.email);
      navigation.replace('MainApp');
    } catch (error) {
      console.error('Registration Error:', error);
      Alert.alert('Registration Error', error.message);
    } finally {
      setLoading(false);
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
