import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  View, 
  Text, 
  TextInput,
  Alert,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { collection, doc, setDoc, serverTimestamp, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { LinearGradient } from 'expo-linear-gradient';

const TaskAddButton = ({ selectedDate, style }) => {
  // State for modal
  const [modalVisible, setModalVisible] = useState(false);
  
  // State for task data
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  // Open modal
  const handleOpenModal = () => {
    setModalVisible(true);
  };
  
  // Close modal and reset form
  const handleCloseModal = () => {
    setModalVisible(false);
    resetForm();
  };
  
  // Reset form fields
  const resetForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setStartTime('');
    setEndTime('');
  };
  
  // Format time input as user types
  const formatTimeInput = (text) => {
    // Remove any non-digit characters
    const digits = text.replace(/\D/g, '');
    
    // Format with colon
    if (digits.length <= 2) {
      return digits;
    } else {
      return `${digits.substring(0, 2)}:${digits.substring(2, 4)}`;
    }
  };
  
  // Handle time input change
  const handleStartTimeChange = (text) => {
    const formattedTime = formatTimeInput(text);
    setStartTime(formattedTime);
  };
  
  const handleEndTimeChange = (text) => {
    const formattedTime = formatTimeInput(text);
    setEndTime(formattedTime);
  };
  
  // Validate time format
  const isValidTime = (time) => {
    if (!time) return true; // Empty is allowed
    
    const timePattern = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    return timePattern.test(time);
  };
  
  // Save task to Firebase within a routine for the selected date
  const handleSaveTask = async () => {
    if (!taskTitle.trim()) {
      Alert.alert("Required Field", "Please enter a task title");
      return;
    }
    
    if (!selectedDate) {
      Alert.alert("Error", "Please select a date");
      return;
    }
    
    // Validate times if provided
    if (startTime && !isValidTime(startTime)) {
      Alert.alert("Invalid Time Format", "Start time should be in HH:MM format (e.g., 09:30)");
      return;
    }
    
    if (endTime && !isValidTime(endTime)) {
      Alert.alert("Invalid Time Format", "End time should be in HH:MM format (e.g., 14:45)");
      return;
    }
    
    try {
      const userId = auth.currentUser.uid;
      
      // Create task object with a unique ID
      const newTaskId = Math.random().toString(36).substr(2, 9);
      const newTask = {
        id: newTaskId,
        title: taskTitle,
        description: taskDescription,
        timeRange: {
          start: startTime || null,
          end: endTime || null
        },
        isCompleted: false,
      };
      
      // Create or update routine for the selected date
      const routineDocId = `routine_${selectedDate}`;
      const routineRef = doc(db, "users", userId, "routines", routineDocId);
      
      // First, try to get the existing routine
      const routineDoc = await getDoc(routineRef);
      
      if (routineDoc.exists()) {
        // If routine exists, update it by appending the new task
        const existingData = routineDoc.data();
        const updatedTasks = [...(existingData.tasks || []), newTask];
        
        await updateDoc(routineRef, {
          tasks: updatedTasks
        });
      } else {
        // If routine doesn't exist, create a new one
        await setDoc(routineRef, {
          id: routineDocId,
          name: `Today's Tasks`,
          tasks: [newTask],
          timestamp: serverTimestamp(),
          createdDate: selectedDate,
          isRecurring: false
        });
      }
      
      // Close modal and reset form
      handleCloseModal();
      console.log("Task added successfully");
      
    } catch (error) {
      console.error("Error adding task:", error);
      Alert.alert("Error", "Failed to add task. Please try again.");
    }
  };
  
  return (
    <>
      <TouchableOpacity 
        style={[styles.addButton, style]} 
        onPress={handleOpenModal}
        activeOpacity={0.7}
      >
        <AntDesign name="plus" size={24} color="#fff" />
      </TouchableOpacity>
      
      {/* Task Creation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <TouchableWithoutFeedback onPress={handleCloseModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add New Task</Text>
                
                <TextInput
                  style={styles.titleInput}
                  placeholder="Task title"
                  placeholderTextColor="#848484"
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                />

                {/* <View style={styles.timeInputsContainer}>
                  <View style={styles.timeInputWrapper}>
                    <Text style={styles.timeLabel}>Start Time</Text>
                    <TextInput
                      style={styles.timeInput}
                      placeholder="HH:MM"
                      placeholderTextColor="#636363"
                      value={startTime}
                      onChangeText={handleStartTimeChange}
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                  </View>
                  
                  <View style={styles.timeInputWrapper}>
                    <Text style={styles.timeLabel}>End Time</Text>
                    <TextInput
                      style={styles.timeInput}
                      placeholder="HH:MM"
                      placeholderTextColor="#636363"
                      value={endTime}
                      onChangeText={handleEndTimeChange}
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                  </View>
                </View> */}
                
                <TextInput
                  style={styles.descriptionInput}
                  placeholder="Task description"
                  placeholderTextColor="#848484"
                  multiline
                  numberOfLines={3}
                  value={taskDescription}
                  onChangeText={setTaskDescription}
                />
                
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCloseModal}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={handleSaveTask}>
                    <LinearGradient
                      colors={["#3d5afe", "#5ce1e6"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.saveButton}
                    >
                      <Text style={styles.saveButtonText}>Add Task</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3d5afe',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  titleInput: {
    width: '100%',
    fontSize: 16,
    padding: 12,
    backgroundColor: '#242424',
    borderRadius: 8,
    marginBottom: 12,
    color: '#FFFFFF',
  },
  timeInputsContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  timeInputWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  timeLabel: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 4,
  },
  timeInput: {
    fontSize: 16,
    padding: 12,
    backgroundColor: '#242424',
    borderRadius: 8,
    color: '#60A5FA',
    textAlign: 'center',
  },
  descriptionInput: {
    width: '100%',
    fontSize: 16,
    padding: 12,
    backgroundColor: '#242424',
    borderRadius: 8,
    marginBottom: 16,
    minHeight: 80,
    color: '#D1D5DB',
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#3A1A1A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TaskAddButton;