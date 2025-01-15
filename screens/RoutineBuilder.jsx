import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Keyboard,
  Switch,
  KeyboardAvoidingView,
} from "react-native";
import {
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import Animated, { FadeInDown } from "react-native-reanimated";
import { auth, db } from "../firebase";
import DraggableFlatList from "react-native-draggable-flatlist";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";

import { EXPO_PUBLIC_OPENAI_API_KEY } from "@env";
import styles from "../styles/RoutineBuilderStyles";

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

  // ---------------- State ----------------
  const [userInput, setUserInput] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Time picker state
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [timeField, setTimeField] = useState("");
  const [selectedTime, setSelectedTime] = useState(new Date());

  // Recurring routine state
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [isInputting, setIsInputting] = useState(false);

  const hasAtLeastOneTask = tasks.length > 0;

  // ---------------- Load Routine if Editing ----------------
  useEffect(() => {
    if (routine) {
      setTasks(routine.tasks);
      setSelectedDays(routine.daysOfWeek || []);
      setIsRecurring(routine.isRecurring || false);
    }
  }, [routine]);

  // Generate a random ID for tasks
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // --------------- LLM Routine Generation ---------------
  const handleGenerateRoutine = async () => {
    Keyboard.dismiss();
    if (!userInput.trim()) {
      Alert.alert("Error", "Please provide a description of your goals.");
      return;
    }
    setLoading(true);

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini", // Example: a model that supports function calling
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant that generates structured, single-day routines based on user goals. 
              The routine must adhere to the following rules:

              1. **Single-Day Schedule**: All tasks in the routine must be designed to be completed within the same day. Tasks cannot span multiple days or assume different days.
              2. **Logical Flow**: Tasks must make sense together in a single day's context.
              3. **Time Constraints**: Ensure the total duration of all tasks fits reasonably within a single day.
              4. **Valid Time Range**: Task times must use the 24-hour format ("HH:mm"), fit within a single day, and have appropriate durations.
              5. **Concise and Relevant**: Avoid unnecessary tasks or filler; the routine must directly address the user's goal.
              6. **Include breaks** and ensure tasks are balanced (1-2 hours max for intense tasks).
              7. **No earlier than 5 AM or later than 10 PM** for start/end times.
              8. Ensure the routine is achievable in one day.
              `
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
                            start: {
                              type: "string",
                              pattern: "^([01]\\d|2[0-3]):[0-5]\\d$",
                            },
                            end: {
                              type: "string",
                              pattern: "^([01]\\d|2[0-3]):[0-5]\\d$",
                            },
                          },
                          required: ["start", "end"],
                        },
                        description: { type: "string" },
                        isCompleted: { type: "boolean" },
                      },
                      required: ["title", "timeRange", "description", "isCompleted"],
                    },
                  },
                },
                required: ["routine"],
              },
            },
          ],
          function_call: { name: "generate_routine" },
          temperature: 0.7,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${EXPO_PUBLIC_OPENAI_API_KEY}`,
          },
        }
      );

      // Parse the response
      const functionCall = response.data.choices[0].message.function_call;
      const routineData = JSON.parse(functionCall.arguments);
      const routine = routineData.routine;

      // Add IDs to each task
      const parsedTasks = routine.map((task) => ({
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

  // --------------- Task Functions ---------------
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
    setTasks([newTask, ...tasks]);
  };

  const handleRemoveTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  // --------------- Time Picker ---------------
  const showTimePicker = (taskId, field) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.timeRange[field]) {
      const [hours, minutes] = task.timeRange[field].split(":").map(Number);
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

  // Show Date Picker
  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  // Hide Date Picker
  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  // Handle Date Confirmation
  const handleConfirmDate = (date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const handleConfirmTime = (time) => {
    const hours = String(time.getHours()).padStart(2, "0");
    const minutes = String(time.getMinutes()).padStart(2, "0");
    const timeString = `${hours}:${minutes}`;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === selectedTaskId
          ? {
              ...task,
              timeRange: {
                ...task.timeRange,
                [timeField]: timeString,
              },
            }
          : task
      )
    );
    hideTimePicker();
  };

  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return "";

    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
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

    if (isRecurring && !selectedDays.length) {
      Alert.alert("Days Not Selected", "Please select at least one day of the week.");
      return;
    }

    try {
      const routinesRef = collection(
        db,
        "users",
        auth.currentUser.uid,
        "routines"
      );

      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const dd = String(selectedDate.getDate()).padStart(2, "0");
      const formattedSelectedDate = `${yyyy}-${mm}-${dd}`;

      const routineData = {
        name: isRecurring
          ? `Routine - Recurring`
          : `Routine - ${selectedDate.toLocaleDateString()}`,
        tasks,
        timestamp: serverTimestamp(),
        daysOfWeek: isRecurring ? selectedDays : [],
        isRecurring,
        createdDate: isRecurring ? null : formattedSelectedDate,
      };

      await addDoc(routinesRef, routineData);
      Alert.alert("Routine Saved", "Your routine has been saved successfully!");
      // navigation.goBack(); // Optionally navigate back after saving
    } catch (error) {
      console.error("Error saving routine:", error);
      Alert.alert("Error", "Failed to save routine. Please try again.");
    }
  };

  // ---------------------------------------------
  //         RENDER FUNCTIONS FOR THE LIST
  // ---------------------------------------------
  const renderHeader = () => {
    return (
      <>
        {/* User Goals */}
        <View style={styles.inputContainer}>
          {/* {/* <TextInput
            style={styles.goalInput}
            placeholder="What are your goals for this routine?"
            value={userInput}
            onChangeText={setUserInput}
            multiline
            numberOfLines={3}
            onFocus={() => setIsInputting(true)}
            onEndEditing={() => setIsInputting(false)}
            /> */}

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

        {/* Toggle Recurring Routine */}
        <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 16 }}>
          <Switch
            trackColor={{ false: "#767577", true: "#3d5afe" }}
            thumbColor={isRecurring ? "#f4f3f4" : "#f4f3f4"}
            onValueChange={(value) => setIsRecurring(value)}
            value={isRecurring}
          />
          <Text style={{ marginLeft: 8, color: "#fff", fontSize: 16 }}>
            Recurring Routine
          </Text>
        </View>

        {/* If recurring: show day-of-week; otherwise show date */}
        {isRecurring ? (
          <>
            <Text style={styles.subHeader}>Select Days of the Week</Text>
            <View style={styles.daysContainer}>
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = selectedDays.includes(day.value);
                return (
                  <TouchableOpacity
                    key={day.value}
                    style={[
                      styles.dayButton,
                      isSelected && styles.dayButtonSelected,
                      !hasAtLeastOneTask && { opacity: 0.5 }, // grey out if no tasks
                    ]}
                    onPress={() => hasAtLeastOneTask && toggleDaySelection(day.value)}
                    disabled={!hasAtLeastOneTask}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        isSelected && styles.dayButtonTextSelected,
                      ]}
                    >
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.subHeader}>Select Date for Routine</Text>
            <TouchableOpacity
              style={[
                styles.dateButton,
                !hasAtLeastOneTask && { opacity: 0.5 }, // grey out
              ]}
              onPress={hasAtLeastOneTask ? showDatePicker : null}
              disabled={!hasAtLeastOneTask}
            >
              <MaterialIcons name="calendar-today" size={24} color="#fff" />
              <Text style={styles.dateButtonText}>
                {selectedDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Tasks Section Header */}
        <View style={styles.taskListHeader}>
          <Text style={styles.taskListTitle}>Tasks</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
            <MaterialIcons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const renderFooter = () => {
    return (
      <View style={{ marginBottom: 40 }}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            { marginTop: 16 },
            !hasAtLeastOneTask && { opacity: 0.5 },
          ]}
          onPress={hasAtLeastOneTask ? handleSaveRoutine : null}
          disabled={!hasAtLeastOneTask}
        >
          <MaterialIcons name="save" size={24} color="#fff" />
          <Text style={styles.saveButtonText}>Save Routine</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item, drag, isActive }) => {
    const isExpanded = expandedTaskId === item.id;

    return (
      <Animated.View
        style={[
          styles.taskItem,
          isActive && styles.draggingTask,
        ]}
        entering={FadeInDown.duration(1000).delay(200)}
      >
        {/* Task Header (Tap to Expand) */}
        <TouchableOpacity
          style={styles.taskHeader}
          onPress={() => setExpandedTaskId(isExpanded ? null : item.id)}
          activeOpacity={0.8}
        >
          {/* Burger Icon for Drag */}
          <TouchableOpacity onLongPress={drag} style={{ marginRight: 8 }}>
            <MaterialIcons name="drag-handle" size={24} color="#666" />
          </TouchableOpacity>

          {/* Title & Times */}
          <View style={styles.taskTitleContainer}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.taskTime}>
              {formatTimeForDisplay(item.timeRange.start)} -{" "}
              {formatTimeForDisplay(item.timeRange.end)}
            </Text>
          </View>

          {/* Expand/Collapse Icon */}
          <MaterialIcons
            name={isExpanded ? "expand-less" : "expand-more"}
            size={24}
            color="#666"
          />
        </TouchableOpacity>

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <TextInput
              style={styles.titleInput}
              value={item.title}
              placeholder="Task title"
              onChangeText={(text) =>
                setTasks((prev) =>
                  prev.map((t) => (t.id === item.id ? { ...t, title: text } : t))
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
                  prev.map((t) => (t.id === item.id ? { ...t, description: text } : t))
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
      
      <TextInput
            style={styles.goalInput}
            placeholder="What are your goals for this routine?"
            value={userInput}
            onChangeText={setUserInput}
            multiline
            numberOfLines={3}
            onFocus={() => setIsInputting(true)}
            onEndEditing={() => setIsInputting(false)}
            />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >

        
        <DraggableFlatList
          data={tasks}
          onDragEnd={handleDragEnd}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          // Make sure taps inside TextInputs don’t dismiss the keyboard:
          keyboardShouldPersistTaps="handled"
          // Prevent the list from dismissing the keyboard on scroll/drag:
          keyboardDismissMode="none"
        />
      </KeyboardAvoidingView>

      <DateTimePickerModal
        isVisible={isTimePickerVisible || isDatePickerVisible}
        mode={isTimePickerVisible ? "time" : "date"}
        onConfirm={isTimePickerVisible ? handleConfirmTime : handleConfirmDate}
        onCancel={isTimePickerVisible ? hideTimePicker : hideDatePicker}
        date={isTimePickerVisible ? selectedTime : selectedDate}
        isDarkModeEnabled={true}
        textColor={Platform.OS === "ios" ? "white" : "black"}
        themeVariant="light"
        display={Platform.OS === "ios" ? "spinner" : "default"}
      />
    </SafeAreaView>
  );
}
