import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Dimensions 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const TaskListOnboarding = ({ isVisible, onClose }) => {
  const tutorialSteps = [
    {
      icon: 'drag-handle',
      title: 'Reorder Tasks',
      description: 'Press and hold to drag tasks into your preferred order'
    },
    {
      icon: 'edit',
      title: 'Edit Details',
      description: 'Tap any task to expand and edit its title, time, or description'
    },
    {
      icon: 'notifications',
      title: 'Set Reminders',
      description: 'Add reminders for each task when expanded'
    },
    {
      icon: 'calendar-today',
      title: 'Make it Recurring',
      description: 'Choose to make this a recurring routine at the bottom'
    },
    {
        icon: 'save',
        title: 'Save to Calendar',
        description: 'Save your new plan to the homepage and external calendars'
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
            name="tips-and-updates" 
            size={40} 
            color="#3d5afe"
            style={styles.headerIcon}
          />
          
          <Text style={styles.title}>Great! Now You Can:</Text>
          
          <View style={styles.stepsContainer}>
            {tutorialSteps.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <MaterialIcons name={step.icon} size={24} color="#3d5afe" />
                <View style={styles.stepTextContainer}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={onClose}>
            <LinearGradient
              colors={["#3d5afe", "#5ce1e6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Got It!</Text>
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
  headerIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  stepsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  stepTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  stepDescription: {
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

export default TaskListOnboarding;