import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const PlannerOnboarding = ({ isVisible, onClose }) => {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <MaterialIcons 
            name="auto-awesome" 
            size={40} 
            color="#3d5afe" 
            style={styles.icon}
          />
          
          <Text style={styles.title}>Welcome to Planner!</Text>
          
          <Text style={styles.description}>
            Create your perfect routine in three easy steps:
          </Text>

          <View style={styles.stepContainer}>
            <Text style={styles.step}>
              1️⃣ Describe your goals or tasks
            </Text>
            <Text style={styles.step}>
              2️⃣ Let AI generate a structured routine
            </Text>
            <Text style={styles.step}>
              3️⃣ Customize and save your routine
            </Text>
          </View>

          <TouchableOpacity onPress={onClose}>
            <LinearGradient
              colors={["#3d5afe", "#5ce1e6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 16,
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
  },
  stepContainer: {
    width: '100%',
    marginBottom: 24,
  },
  step: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
    paddingLeft: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 150,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default PlannerOnboarding;