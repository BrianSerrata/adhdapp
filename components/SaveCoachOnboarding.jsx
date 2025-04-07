import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Dimensions,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const SaveCoachOnboarding = ({ isVisible, onClose, onNavigateToCoach }) => {
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
            name="psychology" 
            size={40} 
            color="#3d5afe"
            style={styles.headerIcon}
          />
          
          <Text style={styles.title}>Meet Your AI Life Coach!</Text>
          
          <Text style={styles.description}>
            Great job creating your first routine! 
            Now, let us introduce you to your personal AI Life Coach.
          </Text>

          <View style={styles.featureContainer}>
            <FeatureItem 
              icon="chat"
              title="24/7 Suport and Guidance"
              description="Chat with your coach anytime for personalized advice, tips, and motivation"
            />
            <FeatureItem 
              icon="update"
              title="Routine Creation"
              description="Looking for a more customized routine? Chat with your coach to create one together!"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.skipButton} 
              onPress={onClose}
            >
              <Text style={styles.skipButtonText}>Maybe Later</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onNavigateToCoach}>
              <LinearGradient
                colors={["#3d5afe", "#5ce1e6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.meetButton}
              >
                <Text style={styles.meetButtonText}>Meet My Coach</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const FeatureItem = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <MaterialIcons name={icon} size={24} color="#3d5afe" />
    <View style={styles.featureTextContainer}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

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
  featureContainer: {
    width: '100%',
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  skipButton: {
    padding: 12,
    marginRight: 12,
    justifyContent: 'center',
  },
  skipButtonText: {
    color: '#848484',
    fontSize: 16,
  },
  meetButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  meetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SaveCoachOnboarding;