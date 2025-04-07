import React, { useState, useEffect, useRef, useCallback } from "react";
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
  TouchableWithoutFeedback,
  Modal,
  Image,
  ScrollView
} from "react-native";
import CalendarToggle from "../components/CalendarToggle";
import addToCalendar from "../hooks/addToCalendar";
import Storage from '@react-native-async-storage/async-storage';
import deleteFromCalendar from "../hooks/deleteFromCalendar";
import {
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot, 
  doc, 
  deleteDoc 
} from "firebase/firestore";
import Animated, { 
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring, } from "react-native-reanimated";
import { auth, db, analytics } from "../firebase";
import DraggableFlatList from "react-native-draggable-flatlist";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import * as Notifications from "expo-notifications";
// import * as Speech from 'expo-speech-recognition';
import { EXPO_PUBLIC_OPENAI_API_KEY } from "@env";
import styles from "../styles/RoutineBuilderStyles";
import { LinearGradient } from 'expo-linear-gradient';
import {
  trackRoutineSaved,
  trackRoutineGenerated,
  trackRoutineNotSaved,
  trackTaskAdded,
  trackTaskDeleted,
  trackRecurringRoutineToggled,
  trackTimePickerUsed,
} from "../backend/apis/segment";
import { useRoute } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import PlannerOnboarding from '../components/PlannerOnboarding';
import TaskListOnboarding from '../components/TaskListOnboarding';
import AsyncStorage from "@react-native-async-storage/async-storage";
import SaveCoachOnboarding from '../components/SaveCoachOnboarding';

// Days of week (0 = Sunday, 6 = Saturday)
const DAYS_OF_WEEK = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

const REMINDER_OPTIONS = [
  { label: "30m", value: 30 },
  { label: "15m", value: 15 },
  { label: "5m", value: 5 },
  { label: "1m", value: 1 },
];

const RoutineBuilderInput = React.memo(function RoutineBuilderInput({
  userInput,
  setUserInput,
  isInputting,
  setIsInputting,
  taskCount = 0, // Add taskCount prop to check if tasks exist
}) {
  const placeholderPrompts = [
    "I want to clean my apartment for a kickback.",
    "Help me plan a productive study session.",
    "Give me a quick and healthy dinner recipe.",
    "Give me steps to build a morning routine.",
    "I need a checklist for packing for my trip.",
    "I want a brief mindfulness exercise.",
    "I want to improve my bedtime routine.",
    "Create a quick ab workout.",
    "How can I declutter my workspace.",
    "I want to create a budget for the next month.",
    "Help me brainstorm ideas for my project.",
    "Ways to stay focused working from home.",
    "I need steps to prepare for a job interview.",
    "I want a simple meal plan for the week.",
  ];

  const [dynamicPlaceholder, setDynamicPlaceholder] = useState(placeholderPrompts[0]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [typing, setTyping] = useState(true);
  
  // Create a shared value for the bottom offset
  const keyboardHeight = useSharedValue(0);
  const shouldAnimatePosition = taskCount === 0; // Only animate if no tasks exist

  // Pre-create the keyboard show/hide callbacks using useCallback
  const onKeyboardShow = useCallback(() => {
    if (shouldAnimatePosition) {
      keyboardHeight.value = withSpring(150, {
        mass: 1,
        damping: 15,
        stiffness: 120,
        overshootClamping: false,
        restSpeedThreshold: 0.001,
        restDisplacementThreshold: 0.001,
      });
    }
  }, [keyboardHeight, shouldAnimatePosition]);

  const onKeyboardHide = useCallback(() => {
    if (shouldAnimatePosition) {
      keyboardHeight.value = withSpring(0, {
        mass: 1,
        damping: 15,
        stiffness: 120,
        overshootClamping: false,
        restSpeedThreshold: 0.001,
        restDisplacementThreshold: 0.001,
      });
    }
  }, [keyboardHeight, shouldAnimatePosition]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardWillShow", onKeyboardShow);
    const hideSubscription = Keyboard.addListener("keyboardWillHide", onKeyboardHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [onKeyboardShow, onKeyboardHide]);

  const animatedStyle = useAnimatedStyle(() => ({
    bottom: shouldAnimatePosition ? keyboardHeight.value : 0,
  }));

  useEffect(() => {
    if (userInput.length === 0 && !isInputting) {
      let typingTimer;
      let backspacingTimer;

      const typeText = () => {
        const currentPrompt = placeholderPrompts[currentPromptIndex];
        if (dynamicPlaceholder.length < currentPrompt.length && typing) {
          typingTimer = setTimeout(() => {
            setDynamicPlaceholder((prev) => prev + currentPrompt[prev.length]);
          }, 25);
        } else if (typing) {
          typingTimer = setTimeout(() => {
            setTyping(false);
          }, 650);
        }
      };

      const backspaceText = () => {
        if (dynamicPlaceholder.length > 0 && !typing) {
          backspacingTimer = setTimeout(() => {
            setDynamicPlaceholder((prev) => prev.slice(0, -1));
          }, 50);
        } else if (!typing) {
          setTyping(true);
          setCurrentPromptIndex((prev) => (prev + 1) % placeholderPrompts.length);
          setDynamicPlaceholder("");
        }
      };

      if (typing) typeText();
      else backspaceText();

      return () => {
        clearTimeout(typingTimer);
        clearTimeout(backspacingTimer);
      };
    }
  }, [
    dynamicPlaceholder,
    typing,
    currentPromptIndex,
    isInputting,
    userInput,
    placeholderPrompts,
  ]);

  const handleTextChange = useCallback(
    (text) => setUserInput(text),
    [setUserInput]
  );

  const [isListening, setIsListening] = useState(false);

  const startSpeechToText = async () => {
    try {
      // Check if speech recognition is available
      const isAvailable = await Speech.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Error", "Speech recognition is not available on this device");
        return;
      }
      
      // Request permissions if needed
      const { granted } = await Speech.requestPermissionsAsync();
      if (!granted) {
        Alert.alert("Permission", "Microphone permission is required for speech recognition");
        return;
      }
      
      setIsListening(true);
      
      // Start listening
      await Speech.startListeningAsync({
        onSpeechStart: () => {
          console.log("Speech started");
        },
        onSpeechEnd: () => {
          console.log("Speech ended");
          setIsListening(false);
        },
        onSpeechResults: (event) => {
          if (event.results && event.results.length > 0) {
            const recognizedText = event.results[0];
            setUserInput((prev) => prev + recognizedText);
          }
        },
        onSpeechError: (error) => {
          console.error("Speech recognition error:", error);
          setIsListening(false);
          Alert.alert("Error", "Failed to recognize speech. Please try again.");
        }
      });
    } catch (error) {
      console.error("Speech recognition error:", error);
      setIsListening(false);
      Alert.alert("Error", "Failed to start speech recognition");
    }
  };
  
  const stopSpeechToText = async () => {
    try {
      await Speech.stopListeningAsync();
      setIsListening(false);
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
    }
  };

  return (
    <Animated.View style={[{ paddingHorizontal: 16 }, animatedStyle]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.goalInput}
          placeholder={dynamicPlaceholder}
          placeholderTextColor="#848484"
          value={userInput}
          onChangeText={handleTextChange}
          multiline
          numberOfLines={3}
          onFocus={() => setIsInputting(true)}
          onBlur={() => setIsInputting(false)}
        />
        {/* <TouchableOpacity 
          style={styles.micButton}
          onPress={isListening ? stopSpeechToText : startSpeechToText}
          activeOpacity={0.7}
        >
          <MaterialIcons 
            name={isListening ? "mic" : "mic-none"} 
            size={24} 
            color={isListening ? "#3d5afe" : "#848484"} 
          />
        </TouchableOpacity> */}
      </View>
    </Animated.View>
  );
});

const RoutineNameModal = ({ isVisible, onClose, onConfirm, routineName, setRoutineName }) => (
  <Modal visible={isVisible} animationType="slide" transparent={true}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Enter Routine Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Routine name"
          value={routineName}
          onChangeText={setRoutineName}
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default function RoutineBuilder({ aiInput, fromLifeCoach }) {
  const route = useRoute();
  const navigation = useNavigation();
  const { addRoutineToCalendar, isAdding, error: calendarError } = addToCalendar();
  const { deleteCalendarEvents, isDeleting, error: deleteError } = deleteFromCalendar();
  const routineGenerated = route?.params?.routineGenerated;
  const [routineGeneratedState, setRoutineGeneratedState] = useState(false);
  const [showRoutineList, setShowRoutineList] = useState(false);
  const [fetchedRoutines, setFetchedRoutines] = useState([]);
  const [routineId, setRoutineId] = useState(null);
  const [useCalendar, setUseCalendar] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);

  useEffect(() => {
    if (aiInput && !routineGenerated) {
      handleGenerateRoutine(aiInput);
      route.params.routineGenerated = true;
    }
  }, [aiInput, routineGenerated]);

  useEffect(() => {
    const routinesRef = collection(db, "users", auth.currentUser.uid, "routines");
    const unsubscribe = onSnapshot(routinesRef, (snapshot) => {
      const routinesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFetchedRoutines(routinesData);
    });
    return () => unsubscribe();
  }, []);

  const handleEditRoutine = (routine) => {
    setRoutineId(routine.id);
    setTasks(routine.tasks);
    setIsRecurring(routine.isRecurring || false);
    setSelectedDays(routine.daysOfWeek || []);
    setSelectedDate(routine.createdDate ? new Date(routine.createdDate) : new Date());
    setShowRoutineList(false);
  };

  const handleDeleteRoutine = async (routineId) => {
    try {
      Alert.alert("Delete Routine", "Are you sure you want to delete this routine?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "users", auth.currentUser.uid, "routines", routineId));
            } catch (error) {
              console.error("Error deleting routine:", error);
              Alert.alert("Error", "Failed to delete routine.");
            }
          },
        },
      ]);
    } catch (error) {
      console.error("Error deleting routine:", error);
      Alert.alert("Error", "Could not delete routine.");
    }
  };

  const routine = route?.params?.routine;
  const [userInput, setUserInput] = useState("");
  const [routineName, setRoutineName] = useState("");
  const [isRoutineNameModalVisible, setRoutineNameModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInputting, setIsInputting] = useState(false);

  // Time picker state
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [timeField, setTimeField] = useState("");
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  // Recurring routine state
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  // Feedback state (if needed)
  const [showFeedbackIcon, setShowFeedbackIcon] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedback, setFeedback] = useState({
    relevance: "1",
    timeline: "1",
    taskCompleteness: "1",
    clarity: "1",
    suggestion: "",
  });
  const isFirstRender = useRef(true);
  useEffect(() => { isFirstRender.current = false; }, []);

  useEffect(() => {
    if (routine) {
      setTasks(routine.tasks);
      setSelectedDays(routine.daysOfWeek || []);
      setIsRecurring(routine.isRecurring || false);
    }
  }, [routine]);

  useEffect(() => {
    if (tasks.length > 0) {
      setShowFeedbackIcon(true);
    }
  }, [tasks]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleSubmitFeedback = async () => {
    const numericFeedback = {
      relevance: Number(feedback.relevance),
      timeline: Number(feedback.timeline),
      taskCompleteness: Number(feedback.taskCompleteness),
      clarity: Number(feedback.clarity),
      suggestion: feedback.suggestion,
    };
    const feedbackRef = collection(db, "users", auth.currentUser.uid, "feedback");
    await addDoc(feedbackRef, numericFeedback);
    console.log("Feedback submitted:", numericFeedback);
    setFeedbackVisible(false);
  };


  const handleGenerateRoutine = async (aiInput) => {
    


    // if (!startTime || !endTime) {
    //   Alert.alert(
    //     "Times Not Set",
    //     "Would you like to set time bounds for your task?",
    //     [
    //       {
    //         text: "Set Times",
    //         onPress: () => {
    //           // Show time picker for start time
    //           setSelectedTaskId(null);
    //           setTimeField("start");
    //           setTimePickerVisible(true);
    //         }
    //       },
    //       {
    //         text: "Continue Without Times",
    //         onPress: () => {
    //         }
    //       },
    //       {
    //         text: "Cancel",
    //         style: "cancel"
    //       }
    //     ]
    //   );
    //   return;
    // }

    if (aiInput) {
      setUserInput("");
    }
    Keyboard.dismiss();
    if (!userInput.trim() && !aiInput.trim()) {
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

              1. **Task Specificity**: If applicable, e=ach task must be a concrete, actionable mini-action that can be completed without further breakdown.
              2. **Single-Day Schedule**: All tasks in the routine must be designed to be completed within the same day. Tasks cannot span multiple days or assume different days.
              3. **Time Constraints**: Ensure the total duration of all tasks fits reasonably within a single day.
              4. **Valid Time Range**: 
                - Task times must use the 24-hour format ("HH:mm").
                - If applicable, task times **must fall entirely** within the specified time bounds (${startTime} to ${endTime}) and have appropriate durations.
                - Any task violating this range will be considered invalid and omitted.
                - If no task times are specified, task times must fit within a single calendar day and have appropriate durations.
              5. **Concise and Relevant**: Avoid unnecessary tasks or filler. The routine must directly address the user's goal while remaining achievable within one day.
              6. The routine must fit into a single day and include no more than 6-8 hours of activities, spread out across reasonable time blocks. 
              7. Ensure there is enough time for breaks between tasks (at least 15-30 minutes between sessions).
              8. For intense tasks (e.g., studying, exercise), limit duration to 1-2 hours per session, followed by rest or lighter activities.
              9. The routine should be sustainable for a human, balancing productivity, self-care, and rest.
              10. Ensure realistic start and end times (e.g., no activities starting before 5 AM or ending after 10 PM).
              11. Avoid overscheduling. Include buffer times or flexibility in the routine.
              12. **Self-Contained Actions**: Each task should be completable without requiring additional planning or decision-making during execution.
              
              ${useCalendar && calendarEvents.length > 0 ? 
              `13. **Calendar Integration**: The user has provided their calendar events for today. You MUST work around these events and avoid scheduling tasks that conflict with them. Here are the events to consider:
              ${calendarEvents.map(event => {
                const start = new Date(event.startDate);
                const end = new Date(event.endDate);
                return `- "${event.title}" from ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
              }).join('\n')}` : ''}
              `
            },
            {
              role: "user",
              content: `Here is my goal: ${userInput || aiInput}. Please ensure all tasks are scheduled between ${startTime} and ${endTime}.
                        If ${startTime} and/or ${endTime} are undefined, you MUST create your own reasonable times.
                        ${useCalendar && calendarEvents.length > 0 ? 'Please work around my existing calendar events for today.' : ''}`
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
                              pattern: `^(${startTime}|(([0-1]\\d|2[0-3]):[0-5]\\d))$`, // Ensure time falls within bounds
                            },
                            end: {
                              type: "string",
                              pattern: `^(${endTime}|(([0-1]\\d|2[0-3]):[0-5]\\d))$`, // Ensure time falls within bounds
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

      console.log("routine data time range:",routine.timeRange)

      // Add IDs to each task
      const parsedTasks = routine.map((task) => ({
        id: generateId(),
        ...task,
      }));
      setTasks(parsedTasks);

      trackRoutineGenerated({
        userId: auth.currentUser.uid,
        userInput: userInput,
        startTime: startTime?.toISOString() || "Not set",
        endTime: endTime?.toISOString() || "Not set",
        numberOfTasks: parsedTasks.length,
        routineDetails: parsedTasks, // You can customize what details to send
      });

      setRoutineGeneratedState(true);

    } catch (error) {
      console.error("Error generating routine:", error);
      Alert.alert("Error", "Failed to generate routine. Please try again.");
    } finally {
      setLoading(false);
    }
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
    setTasks([newTask, ...tasks]);
    trackTaskAdded({
      userId: auth.currentUser.uid,
      routineId: routine?.id || "not_set",
      taskId: newTask.id,
      taskTitle: newTask.title,
      taskDescription: newTask.description,
      timestamp: new Date().toISOString(),
      routineDetails: tasks || "not_set",
    });
  };

  const handleRemoveTask = (taskId) => {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    setTasks(tasks.filter((task) => task.id !== taskId));
    trackTaskDeleted({
      userId: auth.currentUser.uid,
      routineId: routine?.id || "not_set",
      taskId: taskToDelete.id,
      taskTitle: taskToDelete.title,
      taskDescription: taskToDelete.description,
      taskStart: taskToDelete.timeRange.start || "not_set",
      taskEnd: taskToDelete.timeRange.end || "not_set",
      routineDetails: tasks,
      timestamp: new Date().toISOString(),
    });
  };

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

  const showDatePicker = () => setDatePickerVisible(true);
  const hideDatePicker = () => setDatePickerVisible(false);

  const handleConfirmDate = (date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const handleConfirmTime = (time) => {
    const hours = String(time.getHours()).padStart(2, "0");
    const minutes = String(time.getMinutes()).padStart(2, "0");
    const timeString = `${hours}:${minutes}`;
    const taskDetails = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) : null;
    setTasks((prev) =>
      prev.map((task) =>
        task.id === selectedTaskId
          ? { ...task, timeRange: { ...task.timeRange, [timeField]: timeString } }
          : task
      )
    );
    if (timeField === "start") setStartTime(time);
    if (timeField === "end") setEndTime(time);
    trackTimePickerUsed({
      userId: auth.currentUser.uid,
      routineId: routine?.id || "not_set",
      taskId: selectedTaskId || "header_time",
      taskTitle: taskDetails?.title || "Header Time",
      taskDescription: taskDetails?.description || "N/A",
      field: timeField,
      selectedTime: timeString,
      timestamp: new Date().toISOString(),
    });
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

  const toggleDaySelection = (dayValue) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayValue)) {
        return prev.filter((val) => val !== dayValue);
      } else {
        return [...prev, dayValue];
      }
    });
  };

  const toggleReminderOffset = (taskId, offset) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id !== taskId) return task;
        const currentReminders = task.reminders || [];
        const hasOffset = currentReminders.includes(offset);
        const updatedReminders = hasOffset
          ? currentReminders.filter((r) => r !== offset)
          : [...currentReminders, offset];
        return { ...task, reminders: updatedReminders };
      })
    );
  };

  const handleSaveRoutine = async () => {
    if (!tasks.length) {
      Alert.alert("Error", "No tasks to save.");
      return;
    }
    // if (isRecurring && !selectedDays.length) {
    //   Alert.alert("Days Not Selected", "Please select at least one day of the week.");
    //   return;
    // }
    setRoutineNameModalVisible(true);
  };

  const confirmSaveRoutine = async () => {
    if (!routineName.trim()) {
      Alert.alert("Error", "Routine name cannot be empty.");
      return;
    }
    try {
      const routinesRef = collection(db, "users", auth.currentUser.uid, "routines");
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const dd = String(selectedDate.getDate()).padStart(2, "0");
      const formattedSelectedDate = `${yyyy}-${mm}-${dd}`;
      const routineData = {
        name: routineName,
        tasks,
        timestamp: serverTimestamp(),
        daysOfWeek: isRecurring ? selectedDays : [],
        isRecurring,
        createdDate: formattedSelectedDate,
      };
      let updatedRoutineId = routineId;
      if (routineId) {
        const routineDocRef = doc(db, "users", auth.currentUser.uid, "routines", routineId);
        await updateDoc(routineDocRef, routineData);
        Alert.alert("Routine Updated", "Your routine has been successfully updated! ✅");
      } else {
        const newRoutineRef = await addDoc(routinesRef, routineData);
        updatedRoutineId = newRoutineRef.id;
        setRoutineId(newRoutineRef.id);
        Alert.alert("Routine Saved", "Your routine has been saved successfully! 🗓️");
      }
      trackRoutineSaved({
        userId: auth.currentUser.uid,
        routineId: updatedRoutineId,
        routineName: routineData.name,
        numberOfTasks: tasks.length,
        routineDetails: tasks,
        isRecurring,
        selectedDays: isRecurring ? selectedDays : [],
        selectedDate: isRecurring ? null : formattedSelectedDate,
        timestamp: new Date().toISOString(),
      });
      if (!isRecurring) {
        tasks.forEach((task) => scheduleRemindersForOneOffRoutine(task, selectedDate));
      } else {
        tasks.forEach((task) => scheduleRemindersForRecurringRoutine(task, selectedDays));
      }
      
// Modify your existing code to include first-time check
if (!isRecurring){
  Alert.alert(
    "Add to Calendar",
    "Would you like to add these tasks to your calendar?",
    [
      { 
        text: "No", 
        style: "cancel"
      },
      {
        text: "Yes",
        onPress: async () => {
          try {
            // Check if first-time user
            const hasSeenCalendarInstructions = await AsyncStorage.getItem('hasSeenCalendarInstructions');

            if (hasSeenCalendarInstructions == 'false') {
              // Show detailed instructions first time
              Alert.alert(
                "Calendar Account Management",
                "Tasks will be saved to your device's default calendar.\n\n" +
                "To add or manage calendar accounts:\n" +
                "1. Open Device Settings\n" +
                "2. Scroll down and tap 'Apps'\n" +
                "3. Tap 'Calendar'\n" +
                "4. Tap 'Calendar Accounts' to view calendars\n" +
                "5. Tap 'Add Account' to add new calendar\n\n" +
                "Supported calendars include:\n" +
                "• iCloud\n" +
                "• Google\n" +
                "• Microsoft Exchange\n" +
                "• Other account types",
                [
                  { 
                    text: "Got It", 
                    onPress: async () => {
                      // Mark as seen
                      await AsyncStorage.setItem('hasSeenCalendarInstructions', 'true');
                      
                      // Proceed with adding to calendar
                      const result = await addRoutineToCalendar(
                        tasks, 
                        formattedSelectedDate, 
                        isRecurring, 
                        isRecurring ? selectedDays : []
                      );
                      
                      if (result.success) {
                        // Optional: Add success handling
                      } else {
                        Alert.alert("Calendar Error", result.message || "Failed to add to calendar");
                      }
                    }
                  },
                  { 
                    text: "Cancel", 
                    style: "cancel" 
                  }
                ]
              );
            } else {
              // Directly add to calendar if instructions were seen before
              const result = await addRoutineToCalendar(
                tasks, 
                formattedSelectedDate, 
                isRecurring, 
                isRecurring ? selectedDays : []
              );
              
              if (result.success) {
                // Optional: Add success handling
              } else {
                Alert.alert("Calendar Error", result.message || "Failed to add to calendar");
              }
            }
          } catch (error) {
            console.error("Error adding to calendar:", error);
            Alert.alert("Error", "Failed to add tasks to calendar.");
          }
        }
      }
    ]
  );
}
    // After successful save, check if it's the first time
    const hasSeenFirstSave = await AsyncStorage.getItem('hasSeenFirstSave');
    if (hasSeenFirstSave == 'false') {
      await AsyncStorage.setItem('hasSeenFirstSave', 'true');
      setShowFirstSaveModal(true);
    }
    } catch (error) {
      console.error("Error saving routine:", error);
      Alert.alert("Error", "Failed to save routine. Please try again.");
    }
    setRoutineNameModalVisible(false);
  };

  const scheduleRemindersForOneOffRoutine = async (task, selectedDate) => {
    const startDate = getLocalDateWithDate(task.timeRange.start, selectedDate);
    task.reminders.forEach(async (offset) => {
      const reminderDate = new Date(startDate.getTime() - offset * 60000);
      if (reminderDate > new Date()) {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Task Reminder",
              body: task.title,
              sound: true,
            },
            trigger: reminderDate,
          });
          console.log("Reminder scheduled for:", reminderDate);
        } catch (error) {
          console.error("Error scheduling notification:", error);
        }
      } else {
        console.log("Reminder time is in the past; not scheduling.");
      }
    });
  };

  const getLocalDateWithDate = (timeString, date) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const localDate = new Date(date);
    localDate.setHours(hours);
    localDate.setMinutes(minutes);
    localDate.setSeconds(0);
    localDate.setMilliseconds(0);
    return localDate;
  };

  const scheduleRemindersForRecurringRoutine = async (task, selectedDays) => {
    selectedDays.forEach(async (day) => {
      const occurrences = getNextOccurrences(day, 5);
      occurrences.forEach((occurrence) => {
        const [hours, minutes] = task.timeRange.start.split(":").map(Number);
        occurrence.setHours(hours, minutes, 0, 0);
        task.reminders.forEach(async (offset) => {
          const reminderDate = new Date(occurrence.getTime() - offset * 60000);
          if (reminderDate > new Date()) {
            try {
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: "Task Reminder",
                  body: task.title,
                  sound: true,
                },
                trigger: reminderDate,
              });
              console.log(`Reminder scheduled for: ${reminderDate}`);
            } catch (error) {
              console.error("Error scheduling notification:", error);
            }
          } else {
            console.log(`Reminder time (${reminderDate}) is in the past; skipping.`);
          }
        });
      });
    });
  };

  const getNextOccurrences = (dayOfWeek, numberOfOccurrences) => {
    const today = new Date();
    const dayIndex = DAYS_OF_WEEK[dayOfWeek].value;
    const occurrences = [];
    let currentDate = new Date(today);
    while (occurrences.length < numberOfOccurrences) {
      const daysUntilNext = (dayIndex - currentDate.getDay() + 7) % 7;
      if (daysUntilNext === 0 && occurrences.length === 0) {
        occurrences.push(new Date(currentDate));
      } else {
        currentDate.setDate(currentDate.getDate() + daysUntilNext);
        occurrences.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return occurrences;
  };

  // *** Render Header ***
  // Always render the input, create button, and start/end time toggles.
  // When tasks exist, fade in additional options.
  const renderHeader = () => {
    return (
      <>
        <View style={styles.timeInputsContainer}>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => {
              setSelectedTaskId(null);
              setTimeField("start");
              setTimePickerVisible(true);
            }}
          >
            <MaterialIcons name="access-time" size={24} color="#3d5afe" />
            <Text style={styles.timeButtonText}>
              {startTime
                ? startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "Start Time"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => {
              setSelectedTaskId(null);
              setTimeField("end");
              setTimePickerVisible(true);
            }}
          >
            <MaterialIcons name="access-time" size={24} color="#3d5afe" />
            <Text style={styles.timeButtonText}>
              {endTime
                ? endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "End Time"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.buttonContainer, loading && styles.generateButtonDisabled]}
          onPress={handleGenerateRoutine}
          disabled={loading}
        >
          <LinearGradient
            colors={["#8c52ff", "#5ce1e6"]} // Bright green to light blue
            start={{ x: 0, y: 1 }}  // Adjusted for 135-degree angle
            end={{ x: 1, y: 0 }}  // Adjusted for 135-degree angle
            style={styles.generateButton}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="auto-awesome" size={24} color="#fff" />
                <Text style={styles.generateButtonText}>Create</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {tasks.length > 0 && (
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 16 }}>
              {/* <Switch
                trackColor={{ false: "#767577", true: "#3d5afe" }}
                thumbColor={isRecurring ? "#f4f3f4" : "#f4f3f4"}
                onValueChange={(value) => {
                  setIsRecurring(value);
                  trackRecurringRoutineToggled({
                    userId: auth.currentUser.uid,
                    isRecurring: value,
                    routineDetails: tasks || "not_set",
                    selectedDays: value ? selectedDays : [],
                    timestamp: new Date().toISOString(),
                  });
                }}
                value={isRecurring}
              /> */}
              {/* <Text style={{ marginLeft: 8, color: "#fff", fontSize: 16 }}>
                Recurring Routine
              </Text> */}
            </View>
            {/* {isRecurring ? (
              <View>
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
                        ]}
                        onPress={() => toggleDaySelection(day.value)}
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
              </View>
            ) : (
              <View>
                <Text style={styles.subHeader}>Select Date for Routine</Text>
                <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
                  <MaterialIcons name="calendar-today" size={24} color="#fff" />
                  <Text style={styles.dateButtonText}>
                    {selectedDate.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
            )} */}
            <View style={styles.taskListHeader}>
              <Text style={styles.taskListTitle}>Tasks</Text>
              <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
                <MaterialIcons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </>
    );
  };

  // *** Render Footer ***
  // Only show the "Save" button once tasks exist.
  const renderFooter = () => {
    if (tasks.length === 0) return null;
    return (
      <View style={{ marginBottom: 40 }}>
        {/* Recurring Routine Toggle */}
        <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 16 }}>
          <Switch
            trackColor={{ false: "#767577", true: "#3d5afe" }}
            thumbColor={isRecurring ? "#f4f3f4" : "#f4f3f4"}
            onValueChange={(value) => {
              setIsRecurring(value);
              trackRecurringRoutineToggled({
                userId: auth.currentUser.uid,
                isRecurring: value,
                routineDetails: tasks || "not_set",
                selectedDays: value ? selectedDays : [],
                timestamp: new Date().toISOString(),
              });
            }}
            value={isRecurring}
          />
          <Text style={{ marginLeft: 8, color: "#fff", fontSize: 16 }}>Recurring Routine</Text>
        </View>
  
        {/* Conditional Rendering for Recurring vs One-Time Routine */}
        {isRecurring ? (
          <View>
            <Text style={styles.subHeader}>Select Days of the Week</Text>
            <View style={styles.daysContainer}>
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = selectedDays.includes(day.value);
                return (
                  <TouchableOpacity
                    key={day.value}
                    style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                    onPress={() => toggleDaySelection(day.value)}
                  >
                    <Text style={[styles.dayButtonText, isSelected && styles.dayButtonTextSelected]}>
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.subHeader}>Select Date for Routine</Text>
            <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
              <MaterialIcons name="calendar-today" size={24} color="#fff" />
              <Text style={styles.dateButtonText}>
                {selectedDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </TouchableOpacity>
          </View>
        )}
  
        {/* Save Button */}
        <TouchableOpacity onPress={handleSaveRoutine}>
          <LinearGradient
            colors={["#4c2985", "rgba(168, 18, 127, 0)"]} // Purple fading into transparency
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.saveButton, { marginTop: 16 }]}
          >
            <MaterialIcons name="save" size={24} color="#fff" />
            <Text style={styles.saveButtonText}>Save</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };
  

  // *** Render each Task Item ***
  const renderItem = ({ item, drag, isActive }) => {
    const isExpanded = expandedTaskId === item.id;
    return (
      <Animated.View
        style={[styles.taskItem, isActive && styles.draggingTask]}
        entering={FadeInDown.duration(1000)}
      >
        <TouchableOpacity
          style={styles.taskHeader}
          onPress={() => setExpandedTaskId(isExpanded ? null : item.id)}
          activeOpacity={0.8}
        >
          <TouchableOpacity onLongPress={drag} style={{ marginRight: 8 }}>
            <MaterialIcons name="drag-handle" size={24} color="#666" />
          </TouchableOpacity>
          <View style={styles.taskTitleContainer}>
            <Text style={styles.taskTitle}>{item.title}</Text>
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
            <View style={styles.reminderOptionsContainer}>
              <Text style={styles.reminderLabel}>Set Reminders:</Text>
              {REMINDER_OPTIONS.map((option) => {
                const isSelected = item.reminders && item.reminders.includes(option.value);
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.reminderOptionButton,
                      isSelected && styles.reminderOptionButtonSelected,
                    ]}
                    onPress={() => toggleReminderOffset(item.id, option.value)}
                  >
                    <Text
                      style={[
                        styles.reminderOptionText,
                        isSelected && styles.reminderOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
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

  // Add this state near your other state declarations
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);

  // Add this useEffect after your other useEffects
  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        const hasSeenBuilder = await AsyncStorage.getItem('hasSeenRoutineBuilder');
        if (hasSeenBuilder == 'false') {
          setShowFirstTimeModal(true);
        }
      } catch (error) {
        console.error('Error checking first time status:', error);
      }
    };

    checkFirstTime();
  }, []);

  // Add handler for closing the modal
  const handleCloseFirstTimeModal = async () => {
    try {
      await AsyncStorage.setItem('hasSeenRoutineBuilder', 'true');
      setShowFirstTimeModal(false);
    } catch (error) {
      console.error('Error saving first time status:', error);
    }
  };

  // Add state
  const [showPostCreationTutorial, setShowPostCreationTutorial] = useState(false);
  // Add this useEffect to show tutorial when tasks are first added
  useEffect(() => {
    const checkShowTutorial = async () => {
      try {
        if (tasks.length > 0) {
          const hasSeenTaskList = await AsyncStorage.getItem('hasSeenTaskList');
          if (hasSeenTaskList=='false') {
            setShowPostCreationTutorial(true);
          }
        }
      } catch (error) {
        console.error('Error checking tutorial status:', error);
      }
    };

    checkShowTutorial();
  }, [tasks.length]);

  // Add handler
  const handleClosePostCreationTutorial = async () => {
    try {
      await AsyncStorage.setItem('hasSeenTaskList', 'true');
      setShowPostCreationTutorial(false);
    } catch (error) {
      console.error('Error saving tutorial status:', error);
    }
  };

  // Add state for the first save modal
  const [showFirstSaveModal, setShowFirstSaveModal] = useState(false);

  // Add handler for navigation
  const handleNavigateToCoach = () => {
    setShowFirstSaveModal(false);
    navigation.navigate('Life Coach'); // Make sure this route exists
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1 }}>
          {/* Menu Icon */}
          <TouchableOpacity
            style={styles.menuIcon}
            onPress={() => setShowRoutineList(true)}
          >
            <MaterialIcons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
  
          {/* Empty State */}
          {tasks.length === 0 && (
            <>
              <View style={styles.emptyBackgroundContainer}>
                <Text style={styles.emptyHeaderText}>
                  YOUR ROUTINE SHAPES YOUR RESULTS.
                </Text>
                <Text style={styles.emptySubText}>
                  Start by entering today's tasks!
                </Text>
              </View>
              <View style={styles.emptyIconContainer}>
                <Image
                  source={require('../assets/target.png')}
                  style={styles.targetIcon}
                />
              </View>
            </>
          )}
  
          {/* Input & Routine Name Modal */}
          <RoutineBuilderInput
            userInput={userInput}
            setUserInput={setUserInput}
            isInputting={isInputting}
            setIsInputting={setIsInputting}
            taskCount = {tasks.length}
          />

          {/* <CalendarToggle 
              isEnabled={useCalendar} 
              onToggle={setUseCalendar}
              onEventsLoaded={setCalendarEvents}
          /> */}

          <RoutineNameModal
            isVisible={isRoutineNameModalVisible}
            onClose={() => setRoutineNameModalVisible(false)}
            onConfirm={confirmSaveRoutine}
            routineName={routineName}
            setRoutineName={setRoutineName}
          />
  
          {/* Main Content */}
          <View style={{ flex: 1 }}>
            <DraggableFlatList
              data={tasks}
              onDragEnd={handleDragEnd}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              ListHeaderComponent={renderHeader}
              ListFooterComponent={renderFooter}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            />
          </View>

          <PlannerOnboarding 
            isVisible={showFirstTimeModal}
            onClose={handleCloseFirstTimeModal}
          />
          
          <TaskListOnboarding 
            isVisible={showPostCreationTutorial}
            onClose={handleClosePostCreationTutorial}
          />
  
          {/* Time/Date Picker Modal - Moved outside KeyboardAvoidingView */}
          {(isTimePickerVisible || isDatePickerVisible) && (
            <DateTimePickerModal
              isVisible={true}
              mode={isTimePickerVisible ? "time" : "date"}
              onConfirm={isTimePickerVisible ? handleConfirmTime : handleConfirmDate}
              onCancel={isTimePickerVisible ? hideTimePicker : hideDatePicker}
              date={isTimePickerVisible ? selectedTime : selectedDate}
              isDarkModeEnabled={true}
              textColor={Platform.OS === "ios" ? "white" : "black"}
              themeVariant="light"
              display={Platform.OS === "ios" ? "spinner" : "default"}
            />
          )}
  
          {/* Routines List Modal */}
          <Modal 
            visible={showRoutineList} 
            animationType="slide" 
            transparent={true}
            statusBarTranslucent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Your Routines</Text>
                {fetchedRoutines.map((routine) => (
                  <View key={routine.id} style={styles.routineItem}>
                    <Text style={styles.routineName}>{routine.name}</Text>
                    <View style={styles.routineActions}>
                      <TouchableOpacity onPress={() => handleEditRoutine(routine)}>
                        <MaterialIcons name="edit" size={20} color="blue" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteRoutine(routine.id)}>
                        <MaterialIcons name="delete" size={20} color="red" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowRoutineList(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <SaveCoachOnboarding 
            isVisible={showFirstSaveModal}
            onClose={() => setShowFirstSaveModal(false)}
            onNavigateToCoach={handleNavigateToCoach}
          />
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
