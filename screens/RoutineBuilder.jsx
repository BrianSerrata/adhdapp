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
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from "react-native";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase'; // Ensure you have firebase configured properly
import DraggableFlatList from "react-native-draggable-flatlist";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { MaterialIcons } from '@expo/vector-icons';
import axios from "axios";

import { OPENAI_API_KEY } from '@env';
import styles from "../styles/RoutineBuilderStyles";

// Helper to dismiss keyboard
const dismissKeyboard = () => {
  Keyboard.dismiss();
};

// console.log(OPENAI_API_KEY)

// Days of week labels (0=Sunday, 6=Saturday)
const DAYS_OF_WEEK = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export default function RoutineBuilder({ route, navigation }) {
  const routine = route?.params?.routine;
  
  // If a routine is provided (edit mode), load its tasks
  useEffect(() => {
    if (routine) {
      setTasks(routine.tasks);
      // If the routine has daysOfWeek, set that too
      if (routine.daysOfWeek) {
        setSelectedDays(routine.daysOfWeek);
      }
    }
  }, [routine]);

  const [userInput, setUserInput] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Time picker state
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [timeField, setTimeField] = useState("");
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  // **New**: State for days of the week selection
  const [selectedDays, setSelectedDays] = useState([]); 

  // Generate a random ID for tasks
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // --------------- LLM Routine Generation ---------------
  const handleGenerateRoutine = async () => {
    Keyboard.dismiss()
    if (!userInput.trim()) {
      Alert.alert("Error", "Please provide a description of your goals.");
      return;
    }
    setLoading(true);

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini", // Use a model that supports function calling
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant that generates structured, single-day routines based on user goals. 
              The routine must adhere to the following rules:

              1. **Single-Day Schedule**: All tasks in the routine must be designed to be completed within the same day. Tasks cannot span multiple days or assume different days.
              2. **Logical Flow**: Tasks must make sense together in a single day's context. For example:
                - If the goal is fitness-related, the routine should include complementary exercises (e.g., warm-up, workout, cool-down).
                - If the goal involves study or productivity, the routine should include time blocks for focused work, breaks, and review.
              3. **Time Constraints**: Ensure the total duration of all tasks fits reasonably within a single day.
              4. **Valid Time Range**: Task times must use the 24-hour format ("HH:mm"), fit within a single calendar day (e.g., 06:00 to 22:00), and have appropriate durations.
              5. **Concise and Relevant**: Avoid unnecessary tasks or filler. The routine must directly address the user's goal while remaining achievable within one day.
              6. The routine must fit into a single day and include no more than 6-8 hours of activities, spread out across reasonable time blocks. 
              7. Ensure there is enough time for breaks between tasks (at least 15-30 minutes between sessions).
              8. For intense tasks (e.g., studying, exercise), limit duration to 1-2 hours per session, followed by rest or lighter activities.
              9. The routine should be sustainable for a human, balancing productivity, self-care, and rest.
              10. Ensure realistic start and end times (e.g., no activities starting before 5 AM or ending after 10 PM).
              11. Avoid overscheduling. Include buffer times or flexibility in the routine.`

            },
            {
              role: "user",
              content: `Here is my goal: ${userInput}`
            }
          ],
          functions: [
            {
              name: "generate_routine",
              description: "Generate a structured, single-day routine based on the user's goal",
              parameters: {
                type: "object",
                properties: {
                  routine: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        timeRange: {
                          type: "object",
                          properties: {
                            start: { type: "string", pattern: "^([01]\\d|2[0-3]):[0-5]\\d$" },
                            end: { type: "string", pattern: "^([01]\\d|2[0-3]):[0-5]\\d$" }
                          },
                          required: ["start", "end"]
                        },
                        description: { type: "string" },
                        isCompleted: { type: "boolean" }
                      },
                      required: ["title", "timeRange", "description", "isCompleted"]
                    }
                  }
                },
                required: ["routine"]
              }
            }
          ],
          function_call: { name: "generate_routine" },
          temperature: 0.7
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );
      
      // Parse the response
      const functionCall = response.data.choices[0].message.function_call;
      const routineData = JSON.parse(functionCall.arguments);
      const routine = routineData.routine;
      
      // Add IDs to each task
      const parsedTasks = routine.map(task => ({
        id: generateId(),
        ...task
      }));
      setTasks(parsedTasks);

    } catch (error) {
      console.error("Error generating routine:", error);
      Alert.alert("Error", "Failed to generate routine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --------------- Task Functions ---------------
  const toggleTaskCompletion = (taskId) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, isCompleted: !task.isCompleted }
          : task
      )
    );
  };

  const handleDragEnd = ({ data }) => {
    setTasks(data);
  };

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

  const handleRemoveTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // --------------- Time Picker ---------------
  const showTimePicker = (taskId, field) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.timeRange[field]) {
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

  // --------------- Days of the Week Selection ---------------
  const toggleDaySelection = (dayValue) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayValue)) {
        // Remove if already selected
        return prev.filter((val) => val !== dayValue);
      } else {
        // Add if not in the list
        return [...prev, dayValue];
      }
    });
  };

  // --------------- Save Routine ---------------
  const handleSaveRoutine = async () => {
    if (!tasks.length) {
      Alert.alert("Error", "No tasks to save.");
      return;
    }

    if (!selectedDays.length) {
      Alert.alert("Days Not Selected", "Please select at least one day of the week.");
      return;
    }
    
    try {
      const routinesRef = collection(db, 'users', auth.currentUser.uid, 'routines');
      const routineData = {
        name: `Routine - ${new Date().toLocaleDateString()}`, 
        tasks,
        timestamp: serverTimestamp(),
        // Include the days of week
        daysOfWeek: selectedDays,  
      };
  
      await addDoc(routinesRef, routineData);
      Alert.alert("Routine Saved", "Your routine has been saved successfully!");
    } catch (error) {
      console.error('Error saving routine:', error);
      Alert.alert("Error", "Failed to save routine. Please try again.");
    }
  };

  // --------------- Draggable List Render ---------------
  const renderItem = ({ item, drag, isActive }) => {
    const isExpanded = expandedTaskId === item.id;
    return (
      <Animated.View
        style={[
          styles.taskItem,
          isActive && styles.draggingTask
        ]}
      >
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
            <Text 
              style={[
                styles.taskTitle,
                item.isCompleted && styles.completedText
              ]}
            >
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
              onChangeText={(text) =>
                setTasks((prev) =>
                  prev.map((t) =>
                    t.id === item.id ? { ...t, title: text } : t
                  )
                )
              }
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
              onChangeText={(text) =>
                setTasks((prev) =>
                  prev.map((t) =>
                    t.id === item.id ? { ...t, description: text } : t
                  )
                )
              }
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

  // --------------- Main Render ---------------
  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.header}>Routine Builder</Text>
          
          {/* Collect user's routine goals */}
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

          {/* Days of the Week Selection */}
          <Text style={styles.subHeader}>Select Days of the Week</Text>
          <View style={styles.daysContainer}>
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = selectedDays.includes(day.value);
              return (
                <TouchableOpacity
                  key={day.value}
                  style={[
                    styles.dayButton,
                    isSelected && styles.dayButtonSelected
                  ]}
                  onPress={() => toggleDaySelection(day.value)}
                >
                  <Text style={[
                    styles.dayButtonText,
                    isSelected && styles.dayButtonTextSelected
                  ]}>
                    {day.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
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

          {/* Draggable list of tasks */}
          <View style={styles.taskListContainer}>
            <DraggableFlatList
              data={tasks}
              onDragEnd={handleDragEnd}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.taskList}
              scrollEnabled={false} // disable DraggableFlatList scrolling
            />
          </View>

          <View style={styles.bottomSpacing} />

          {/* Time picker modal */}
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

      {/* Save button pinned at bottom */}
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
