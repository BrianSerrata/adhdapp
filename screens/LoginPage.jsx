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
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import styles from '../styles/LoginPageStyles';

const LoginPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }

    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('Logged in with:', userCredential.user.email);
        navigation.replace('MainApp');
      })
      .catch((error) => {
        console.error('Login Error:', error);
        Alert.alert('Login Error', error.message);
      })
      .finally(() => setLoading(false));
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
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.description}>
                Enter your email and password to access your account
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

              <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Log In</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.footerText}>
                Don't have an account?{' '}
                <Text
                  style={styles.linkText}
                  onPress={() => navigation.navigate('Register Page')}
                >
                  Register
                </Text>
              </Text>
              <Text style={styles.linkText} onPress={() => Alert.alert('Forgot Password')}>
                Forgot your password?
              </Text>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default LoginPage;
