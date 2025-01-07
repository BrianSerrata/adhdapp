import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import styles from '../styles/RegisterPageStyles';

const RegisterPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }

    setLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('Registered with:', userCredential.user.email);
        navigation.navigate('Home Page');
      })
      .catch((error) => {
        console.error('Registration Error:', error);
        Alert.alert('Registration Error', error.message);
      })
      .finally(() => setLoading(false));
  };

  return (
    <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
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
              <Feather name="mail" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color="#666" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#666"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
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
    </LinearGradient>
  );
};

export default RegisterPage;
