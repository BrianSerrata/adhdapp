import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const LogoutButton = ({ onLogoutSuccess, navigation, buttonStyle, textStyle, iconSize = 20 }) => {
  const [loading, setLoading] = useState(false);

  const confirmLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { 
          text: "Cancel", 
          style: "cancel" 
        },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: handleLogout 
        }
      ]
    );
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      console.log('User signed out successfully');
      if (onLogoutSuccess) {
        onLogoutSuccess();
      }
      // Navigate to Login page
      navigation.replace('Login Page');
    } catch (error) {
      console.error('Logout Error:', error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[{ flexDirection: 'row', alignItems: 'center', padding: 10 }, buttonStyle]}
      onPress={confirmLogout}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#666" />
      ) : (
        <>
          <Feather name="log-out" size={iconSize} color="#666" style={{ marginRight: 8 }} />
        </>
      )}
    </TouchableOpacity>
  );
};

export default LogoutButton;