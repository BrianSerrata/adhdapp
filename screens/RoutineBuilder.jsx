import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Animated,
  Platform
} from "react-native";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase'; // Ensure you have firebase configured properly
import DraggableFlatList from "react-native-draggable-flatlist";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from "../styles/RoutineBuilderStyles";
import { OPENAI_API_KEY } from '@env';
import axios from "axios";

const dismissKeyboard = () => {
  Keyboard.dismiss();
};

export default function RoutineBuilder({ route }) {
    const { routine } = route.params || {};
  
    useEffect(() => {
      if (routine) {
        setTasks(routine.tasks);
      }
    }, [routine]);

  const [userInput, setUserInput] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [timeField, setTimeField] = useState("");
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [selectedTime, setSelectedTime] = useState(new Date());

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Fetch tasks from LLM backend
  const handleGenerateRoutine = async () => {
    if (!userInput.trim()) {
      Alert.alert("Error", "Please provide a description of your goals.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant that generates structured routines based on user goals. 
                        Always respond with a JSON array of tasks following this format:
                        [
                          {
                            "title": "string",
                            "timeRange": { "start": "string", "end": "string" },
                            "description": "string",
                            "isCompleted": false
                          }
                        ].
                        Do not include any additional text, characters, or formatting such as \`\`\`json. 
                        Return only the raw JSON array.`
            },
            {
              role: "user",
              content: `Here is my goal: ${userInput}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
          n: 1,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      const rawContent = response.data.choices[0].message.content;
      console.log("raw:",rawContent)
      const parsedTasks = JSON.parse(rawContent).map(task => ({
        id: generateId(),
        ...task,
      }));

      setTasks(parsedTasks);
    } catch (error) {
      console.error("Error generating routine:", error);
      Alert.alert("Error", "Failed to generate routine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = (taskId) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, isCompleted: !task.isCompleted }
          : task
      )
    );
  };

  // Handle drag-and-drop reordering
  const handleDragEnd = ({ data }) => {
    setTasks(data);
  };

  // Add a new task
  const handleAddTask = () => {
    const newTask = {
      id: generateId(),
      title: "New Task",
      timeRange: { start: "", end: "" },
      description: "Description of the task.",
      isCompleted: false,
    };
    setTasks([...tasks, newTask]);
  };

  // Remove a task
  const handleRemoveTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // Show time picker
  const showTimePicker = (taskId, field) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.timeRange[field]) {
      // Parse the existing time string to Date
      const [hours, minutes] = task.timeRange[field].split(':').map(Number);
      const time = new Date();
      time.setHours(hours);
      time.setMinutes(minutes);
      setSelectedTime(time);
    } else {
      setSelectedTime(new Date());
    }
    setSelectedTaskId(taskId);
    setTimeField(field);
    setTimePickerVisible(true);
  };

  const hideTimePicker = () => {
        setTimePickerVisible(false);
        setSelectedTaskId(null);
        setTimeField("");
  };

  const handleSaveRoutine = async () => {
    if (!tasks.length) {
      Alert.alert("Error", "No tasks to save.");
      return;
    }
  
    try {
      const routinesRef = collection(db, 'users', auth.currentUser.uid, 'routines');
      const routineData = {
        name: `Routine - ${new Date().toLocaleDateString()}`, // You can allow users to name routines
        tasks,
        timestamp: serverTimestamp(),
      };
  
      await addDoc(routinesRef, routineData);
  
      Alert.alert("Routine Saved", "Your routine has been saved successfully!");
    } catch (error) {
      console.error('Error saving routine:', error);
      Alert.alert("Error", "Failed to save routine. Please try again.");
    }
  };

  // Update handleConfirm to use 24-hour format for storage
  const handleConfirm = (time) => {
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    setTasks(prev =>
      prev.map(task =>
        task.id === selectedTaskId
          ? { ...task, timeRange: { ...task.timeRange, [timeField]: timeString } }
          : task
      )
    );
    hideTimePicker();
  };

  // Add a function to format time for display
  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    
    return date.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Update the renderItem to use the new time formatting
  const renderItem = ({ item, drag, isActive }) => {
    const isExpanded = expandedTaskId === item.id;
    
    return (
      <Animated.View style={[
        styles.taskItem,
        isActive && styles.draggingTask
      ]}>
        <TouchableOpacity 
          style={styles.taskHeader}
          onPress={() => setExpandedTaskId(isExpanded ? null : item.id)}
          onLongPress={drag}
        >
          <TouchableOpacity
            style={[styles.checkbox, item.isCompleted && styles.checkboxCompleted]}
            onPress={() => toggleTaskCompletion(item.id)}
          >
            {item.isCompleted && <MaterialIcons name="check" size={16} color="#fff" />}
          </TouchableOpacity>
          
          <View style={styles.taskTitleContainer}>
            <Text style={[
              styles.taskTitle,
              item.isCompleted && styles.completedText
            ]}>
              {item.title}
            </Text>
            <Text style={styles.taskTime}>
              {formatTimeForDisplay(item.timeRange.start)} - {formatTimeForDisplay(item.timeRange.end)}
            </Text>
          </View>
          
          <MaterialIcons 
            name={isExpanded ? "expand-less" : "expand-more"} 
            size={24} 
            color="#666"
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <TextInput
              style={styles.titleInput}
              value={item.title}
              placeholder="Task title"
              onChangeText={(text) => setTasks(tasks.map(task => 
                task.id === item.id ? { ...task, title: text } : task
              ))}
            />
            
            <View style={styles.timeInputsContainer}>
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => showTimePicker(item.id, "start")}
              >
                <MaterialIcons name="access-time" size={20} color="#007AFF" />
                <Text style={styles.timeButtonText}>
                  {formatTimeForDisplay(item.timeRange.start) || "Start Time"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => showTimePicker(item.id, "end")}
              >
                <MaterialIcons name="access-time" size={20} color="#007AFF" />
                <Text style={styles.timeButtonText}>
                  {formatTimeForDisplay(item.timeRange.end) || "End Time"}
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.descriptionInput}
              value={item.description}
              placeholder="Task description"
              multiline
              numberOfLines={3}
              onChangeText={(text) => setTasks(tasks.map(task =>
                task.id === item.id ? { ...task, description: text } : task
              ))}
            />

            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => handleRemoveTask(item.id)}
            >
              <MaterialIcons name="delete-outline" size={20} color="#FF3B30" />
              <Text style={styles.removeButtonText}>Remove Task</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    );
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.header}>Routine Builder</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.goalInput}
              placeholder="What are your goals for this routine?"
              value={userInput}
              onChangeText={setUserInput}
              multiline
              numberOfLines={3}
            />
            
            <TouchableOpacity 
              style={[styles.generateButton, loading && styles.generateButtonDisabled]}
              onPress={handleGenerateRoutine} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="auto-awesome" size={24} color="#fff" />
                  <Text style={styles.generateButtonText}>Generate Routine</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.taskListHeader}>
            <Text style={styles.taskListTitle}>Tasks</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddTask}
            >
              <MaterialIcons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.taskListContainer}>
            <DraggableFlatList
              data={tasks}
              onDragEnd={handleDragEnd}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.taskList}
              scrollEnabled={false} // Disable scrolling of DraggableFlatList
            />
          </View>

          <View style={styles.bottomSpacing} />

          <DateTimePickerModal
            isVisible={isTimePickerVisible}
            mode="time"
            onConfirm={handleConfirm}
            onCancel={hideTimePicker}
            date={selectedTime}
            isDarkModeEnabled={false}
            textColor={Platform.OS === 'ios' ? undefined : '#000'}
            themeVariant="light"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          />
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Save button outside ScrollView to keep it fixed */}
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveRoutine}
        >
          <MaterialIcons name="save" size={24} color="#fff" />
          <Text style={styles.saveButtonText}>Save Routine</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}