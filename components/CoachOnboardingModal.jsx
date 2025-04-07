import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Dimensions,
  ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const CoachOnboardingModal = ({ isVisible, onClose }) => {
  const features = [
    {
      icon: 'psychology',
      title: 'Your AI Life Coach',
      description: 'Get personalized guidance for task management, challenges, or anything else on your mind'
    },
    {
      icon: 'push-pin',
      title: 'Task Support',
      description: 'Discuss tasks from your routines and get help completing them'
    },
    {
      icon: 'construction',
      title: 'Routine Creation',
      description: 'Create a custom routine with coach and tap the hammer icon to save it!'
    }
  ];

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
            name="face" 
            size={40} 
            color="#3d5afe"
            style={styles.headerIcon}
          />
          
          <Text style={styles.title}>Meet Your Coach!</Text>
          
          <Text style={styles.description}>
            I'm here to support your journey with understanding and practical strategies.
          </Text>

          <ScrollView style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <MaterialIcons name={feature.icon} size={24} color="#3d5afe" />
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity onPress={onClose}>
            <LinearGradient
              colors={["#3d5afe", "#5ce1e6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Start Chatting</Text>
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
    maxHeight: '80%',
  },
  headerIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  featureTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#848484',
    lineHeight: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CoachOnboardingModal;