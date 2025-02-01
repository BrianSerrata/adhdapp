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
  Modal,
  ScrollView
} from "react-native";
import {
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
// import { logEvent } from "firebase/analytics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { auth, db, analytics } from "../firebase";
import DraggableFlatList from "react-native-draggable-flatlist";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";

import * as Notifications from 'expo-notifications';

import { EXPO_PUBLIC_OPENAI_API_KEY } from "@env";
import styles from "../styles/RoutineBuilderStyles";

import {  trackRoutineSaved,
          trackRoutineGenerated,
          trackRoutineNotSaved,
          trackTaskAdded,
          trackTaskDeleted,
          trackRecurringRoutineToggled,
          trackTimePickerUsed,
 } from "../backend/apis/segment";
import { useRoute } from "@react-navigation/native";

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
}) {

  const placeholderPrompts = [
    "I want to organize my closet this weekend.",
    "Help me plan a productive study session.",
    "Suggest a healthy dinner recipe I can cook in 30 minutes.",
    "Give me steps to build a morning routine.",
    "I need a checklist for packing for a weekend trip.",
    "Help me prioritize my tasks for today.",
    "Guide me through a 5-minute mindfulness exercise.",
    "I want to improve my bedtime habits.",

    "Create a workout plan for someone with no equipment.",
    "Break down how I can declutter my workspace.",
    "I want to create a budget for the next month.",
    "Help me brainstorm ideas for my next creative project.",
    "Suggest ways to stay focused while working from home.",
    "I need steps to prepare for a job interview.",
    "I want to create a simple meal plan for the week.",
    "Give me tips to stay consistent with my journaling.",
];


  const [dynamicPlaceholder, setDynamicPlaceholder] = useState(placeholderPrompts[0]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    // Only animate if the user hasn't started typing real text (userInput is empty)
    // and the input is not focused (isInputting === false).
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
          // Once fully typed, pause, then switch to backspacing
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
          // Switch to next prompt
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
    // Otherwise, do nothing: if userInput has content or it's focused, no placeholder animation
  }, [
    dynamicPlaceholder,
    typing,
    currentPromptIndex,
    isInputting,
    userInput,
    placeholderPrompts,
  ]);

  const handleTextChange = useCallback(
    (text) => {
      // Once user types something, we setUserInput in parent
      setUserInput(text);
    },
    [setUserInput]
  );

  return (
    <View style={{ paddingHorizontal: 16 }}>
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
    </View>
  );
});

export default function RoutineBuilder({
  aiInput,
  fromLifeCoach,
}) {

  const route = useRoute()

  const routineGenerated = route?.params?.routineGenerated;

  useEffect(() => {
    // Only generate routine if it hasn't been generated yet
    if (aiInput && !routineGenerated) {
      handleGenerateRoutine(aiInput);

      // Update the route params to mark the routine as generated
      route.params.routineGenerated = true;
    }
  }, [aiInput, routineGenerated]);

  const routine = route?.params?.routine;

  // ---------------- State ----------------
  const [userInput, setUserInput] = useState("");
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
  const [isSelectingStartTime, setIsSelectingStartTime] = useState(true);
  const [reminderTaskId, setReminderTaskId] = useState(null);


  // Recurring routine state
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  // Feedback state
  const [showFeedbackIcon, setShowFeedbackIcon] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedback, setFeedback] = useState({
    relevance: "1",
    timeline: "1",
    taskCompleteness: "1",
    clarity: "1",
    suggestion: '',
  });

  const isFirstRender = useRef(true);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  const hasAtLeastOneTask = tasks.length > 0;

  // ---------------- Load Routine if Editing ----------------
  useEffect(() => {
    if (routine) {
      setTasks(routine.tasks);
      setSelectedDays(routine.daysOfWeek || []);
      setIsRecurring(routine.isRecurring || false);
    }
  }, [routine]);

  useEffect(() => {
    // After tasks are set, show feedback icon
    if (tasks.length > 0) {
      setShowFeedbackIcon(true);
    }
  }, [tasks]);  // Only runs when tasks change

  // Generate a random ID for tasks
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleSubmitFeedback = async () => {
    // Handle feedback submission logic (e.g., saving to Firestore)

    const numericFeedback = {
      relevance: Number(feedback.relevance),
      timeline: Number(feedback.timeline),
      taskCompleteness: Number(feedback.taskCompleteness),
      clarity: Number(feedback.clarity),
      suggestion: feedback.suggestion,
    };

    const feedbackRef = collection(
    db,
    'users',
    auth.currentUser.uid,
    'feedback' // Name of the feedback collection
  );

    // Save to Firestore
    await addDoc(feedbackRef, numericFeedback);

    console.log('Feedback successfully submitted to Firestore:', numericFeedback);

    setFeedbackVisible(false); // Close the feedback form after submission
  };

  // --------------- LLM Routine Generation ---------------
  const handleGenerateRoutine = async (aiInput) => {

    console.log("user input:",userInput)

    if (aiInput) {
      setUserInput("")
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

              1. **Task Specificity**: Each task must be a concrete, actionable mini-action that can be completed without further breakdown. For example:
            - Instead of "Morning workout", specify "20 pushups, 30 squats, 15 burpees"
            - Instead of "Study math", specify "Complete 10 algebra problems from Chapter 3"
            - Instead of "Meal prep", specify "Cut vegetables for 3 days of lunches: carrots, celery, peppers"

              2. **Measurable Outcomes**: Each task must have a clear completion criterion. For example:
                - Instead of "Practice piano", specify "Practice Moonlight Sonata bars 1-20 three times"
                - Instead of "Work on project", specify "Write introduction section (500 words) for research paper"
                - Instead of "Clean house", specify "Vacuum living room and wipe kitchen counters"

              3. **Single-Day Schedule**: All tasks in the routine must be designed to be completed within the same day. Tasks cannot span multiple days or assume different days.
              4. **Logical Flow**: Tasks must make sense together in a single day's context. For example:
                - If the goal is fitness-related, the routine should include complementary exercises (e.g., warm-up, workout, cool-down).
                - If the goal involves study or productivity, the routine should include time blocks for focused work, breaks, and review.
              5. **Time Constraints**: Ensure the total duration of all tasks fits reasonably within a single day.
              6. **Valid Time Range**: 
                - Task times must use the 24-hour format ("HH:mm").
                - If applicable, task times **must fall entirely** within the specified time bounds (${startTime} to ${endTime}) and have appropriate durations.
                - Any task violating this range will be considered invalid and omitted.
                - If no task times are specified, task times must fit within a single calendar day (e.g., 06:00 to 22:00), and have appropriate durations.
              7. **Concise and Relevant**: Avoid unnecessary tasks or filler. The routine must directly address the user's goal while remaining achievable within one day.
              8. The routine must fit into a single day and include no more than 6-8 hours of activities, spread out across reasonable time blocks. 
              9. Ensure there is enough time for breaks between tasks (at least 15-30 minutes between sessions).
              10. For intense tasks (e.g., studying, exercise), limit duration to 1-2 hours per session, followed by rest or lighter activities.
              11. The routine should be sustainable for a human, balancing productivity, self-care, and rest.
              12. Ensure realistic start and end times (e.g., no activities starting before 5 AM or ending after 10 PM).
              13. Avoid overscheduling. Include buffer times or flexibility in the routine.
              12. **No Vague Descriptions**: Tasks cannot use broad terms like:
                  - "Work on..."
                  - "Focus on..."
                  - "Practice..."
                  - "Review..."
                  Without specifying exactly what actions to take.

              13. **Quantifiable Elements**: Where applicable, tasks should include specific:
                  - Numbers (repetitions, duration, word count)
                  - Materials needed
                  - Specific sections or components to complete
                  - Clear start and end points

              14. **Self-Contained Actions**: Each task should be completable without requiring additional planning or decision-making during execution.
              `
            },
            {
              role: "user",
              content: `Here is my goal: ${userInput || aiInput}. Please ensure all tasks are scheduled between ${startTime} and ${endTime}.`
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

      // event logging for analytics insights

      // logEvent(analytics, "routine_generated", {
      //   user_input: userInput,
      //   start_time: startTime?.toISOString() || "not_set",
      //   end_time: endTime?.toISOString() || "not_set",
      // });

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

    trackTaskAdded({
      userId: auth.currentUser.uid,
      routineId: routine?.id || 'not_set', // Adjust based on your data structure
      taskId: newTask.id,
      taskTitle: newTask.title,
      taskDescription: newTask.description,
      timestamp: new Date().toISOString(),
      routineDetails: tasks || 'not_set', // You can customize what details to send
    });

  };

  const handleRemoveTask = (taskId) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    setTasks(tasks.filter((task) => task.id !== taskId));

    trackTaskDeleted({
      userId: auth.currentUser.uid,
      routineId: routine?.id || 'not_set',
      taskId: taskToDelete.id,
      taskTitle: taskToDelete.title,
      taskDescription: taskToDelete.description,
      taskStart: taskToDelete.timeRange["start"] || "not_set",
      taskEnd: taskToDelete.timeRange["end"] || "not_set",
      routineDetails: tasks,
      timestamp: new Date().toISOString(),
    });


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
    console.log("Time selected (local):", timeString);

    const taskDetails = selectedTaskId
    ? tasks.find((t) => t.id === selectedTaskId)
    : null;

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

    if (timeField === "start") setStartTime(time);
    if (timeField === "end") setEndTime(time);

    trackTimePickerUsed({
      userId: auth.currentUser.uid,
      routineId: routine?.id || "not_set",
      taskId: selectedTaskId || "header_time",
      taskTitle: taskDetails?.title || "Header Time",
      taskDescription: taskDetails?.description || "N/A",
      field: timeField, // 'start' or 'end'
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

  const toggleReminderOffset = (taskId, offset) => {
    setTasks((prevTasks) => 
      prevTasks.map((task) => {
        if (task.id !== taskId) return task;
  
        const currentReminders = task.reminders || [];
        const hasOffset = currentReminders.includes(offset);
  
        // If offset is already in reminders, remove it; otherwise, add it
        const updatedReminders = hasOffset
          ? currentReminders.filter((r) => r !== offset)
          : [...currentReminders, offset];
  
        return {
          ...task,
          reminders: updatedReminders,
        };
      })
    );
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

      docRef = await addDoc(routinesRef, routineData);

      trackRoutineSaved({
        userId: auth.currentUser.uid,
        routineId: docRef.id, // Assuming you have the document reference
        routineName: routineData.name,
        numberOfTasks: tasks.length,
        routineDetails: tasks, // You can customize what details to send
        isRecurring: isRecurring,
        selectedDays: isRecurring ? selectedDays : [],
        selectedDate: isRecurring ? null : formattedSelectedDate,
        timestamp: new Date().toISOString(),
      });

      Alert.alert("Routine Saved", "Your routine has been saved successfully! It will now display in your calendar 🗓️");
      
      if (!isRecurring) {
        tasks.forEach((task) => scheduleRemindersForOneOffRoutine(task, selectedDate));
      }
      else {
        tasks.forEach((task) => scheduleRemindersForRecurringRoutine(task, selectedDays));
      }

    } catch (error) {
      console.error("Error saving routine:", error);
      Alert.alert("Error", "Failed to save routine. Please try again.");
    }
  };

// Scheduling service for one-off tasks
const scheduleRemindersForOneOffRoutine = async (task, selectedDate) => {
  console.log("selectedDate", selectedDate)
  // Combine the selectedDate with the task's start time to create a Date object
  const startDate = getLocalDateWithDate(task.timeRange.start, selectedDate);

  // For each reminder offset, schedule a local notification
  task.reminders.forEach(async (offset) => {
    const reminderDate = new Date(startDate.getTime() - offset * 60000); // Subtract offset in minutes

    // Ensure the reminder is scheduled only if it’s in the future
    if (reminderDate > new Date()) {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Task Reminder',
            body: task.title,
            sound: true,
          },
          trigger: reminderDate
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

// Helper function to combine date and time
const getLocalDateWithDate = (timeString, date) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const localDate = new Date(date); // Use the selected date as the base
  localDate.setHours(hours);
  localDate.setMinutes(minutes);
  localDate.setSeconds(0);
  localDate.setMilliseconds(0);
  return localDate;
};

// Scheduling service for recurring tasks
const scheduleRemindersForRecurringRoutine = async (task, selectedDays) => {
  // if (!task.recurringDays || task.recurringDays.length === 0) {
  //   console.error("No recurring days specified for the task.");
  //   return;
  // }

  selectedDays.forEach(async (day) => {
    const occurrences = getNextOccurrences(day, 5); // Get the next 5 occurrences

    occurrences.forEach((occurrence) => {
      // Combine occurrence date with the task's start time
      const [hours, minutes] = task.timeRange.start.split(":").map(Number);
      occurrence.setHours(hours, minutes, 0, 0);
      console.log("occurences:",occurrences)

      // Schedule reminders for each offset
      task.reminders.forEach(async (offset) => {
        console.log("offset:",offset)
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
  const todayIndex = today.getDay();
  const dayIndex = DAYS_OF_WEEK[dayOfWeek].value;

  const occurrences = [];
  let currentDate = new Date(today);
  // console.log("currentDate",currentDate)

  while (occurrences.length < numberOfOccurrences) {
    const daysUntilNext = (dayIndex - currentDate.getDay() + 7) % 7;
    // console.log("daysUntilNext:",daysUntilNext)

    // If today matches the recurrence day and we haven't scheduled it, include today
    if (daysUntilNext === 0 && occurrences.length === 0) {
      occurrences.push(new Date(currentDate)); // Add today
      // console.log("if today",occurrences)
    } else {
      currentDate.setDate(currentDate.getDate() + daysUntilNext); // Move to the next occurrence
      occurrences.push(new Date(currentDate));
    }

    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day for further calculations
  }
  // console.log("occurences in function:",occurrences)
  return occurrences;
};


  // ---------------------------------------------
  //         RENDER FUNCTIONS FOR THE LIST
  // ---------------------------------------------
  const renderHeader = () => {
    return (
      <>
        {/* User Goals */}
        {/* <Animated.View entering={
          isFirstRender.current
            ? FadeInDown.duration(1000).delay(200)
            : undefined
        }> */}
        <View style={styles.inputContainer}>
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
                  <Text style={styles.generateButtonText}>Create</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        {/* </Animated.View> */}

        {/* Toggle Recurring Routine */}
        {/* <Animated.View entering={
          isFirstRender.current
            ? FadeInDown.duration(1000).delay(200)
            : undefined
        }> */}
        <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 16 }}>
            <Switch
              trackColor={{ false: "#767577", true: "#3d5afe" }}
              thumbColor={isRecurring ? "#f4f3f4" : "#f4f3f4"}
              onValueChange={(value) => {
                setIsRecurring(value);

                // Track "Recurring Routine Toggled" event
                trackRecurringRoutineToggled({
                  userId: auth.currentUser.uid,
                  isRecurring: value,
                  routineDetails: tasks || 'not_set',
                  selectedDays: value ? selectedDays : [],
                  timestamp: new Date().toISOString(),
                });
              }}
              value={isRecurring}
            />
            <Text style={{ marginLeft: 8, color: "#fff", fontSize: 16 }}>
              Recurring Routine
            </Text>
          </View>
        {/* </Animated.View> */}

        {/* <Animated.View entering={
          isFirstRender.current
            ? FadeInDown.duration(1000).delay(200)
            : undefined
        }> */}
        <View style={styles.timeInputsContainer}>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => {
              setSelectedTaskId(null); // Indicate that we're setting header time
              setTimeField("start");    // Set the timeField to 'start'
              setTimePickerVisible(true);
            }}
          >
            <MaterialIcons name="access-time" size={24} color="#3d5afe" />
            <Text style={styles.timeButtonText}>
              {startTime
                ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : "Start Time"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => {
              setSelectedTaskId(null); // Indicate that we're setting header time
              setTimeField("end");      // Set the timeField to 'end'
              setTimePickerVisible(true);
            }}
          >
            <MaterialIcons name="access-time" size={24} color="#3d5afe" />
            <Text style={styles.timeButtonText}>
              {endTime
                ? endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : "End Time"}
            </Text>
          </TouchableOpacity>
        </View>
        {/* </Animated.View> */}



        {/* If recurring: show day-of-week; otherwise show date */}
        
        {isRecurring ? (
    // <Animated.View entering={
    //   isFirstRender.current
    //     ? FadeInDown.duration(1000).delay(200)
    //     : undefined
    // }>
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
                      isSelected && styles.dayButtonSelected
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
      // </Animated.View>
        ) : (
          // <Animated.View entering={
          //   isFirstRender.current
          //     ? FadeInDown.duration(1000).delay(200)
          //     : undefined
          // }>
          <View>
            <Text style={styles.subHeader}>Select Date for Routine</Text>
            <TouchableOpacity
              style={[
                styles.dateButton,
              ]}
              onPress={showDatePicker}
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
          </View>
          // </Animated.View>
        )}

        {/* Tasks Section Header */}
        {/* <Animated.View entering={
          isFirstRender.current
            ? FadeInDown.duration(1000).delay(200)
            : undefined
        }> */}
        <View style={styles.taskListHeader}>
            <Text style={styles.taskListTitle}>Tasks</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
              <MaterialIcons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        {/* </Animated.View> */}
      </>
    );
  };

  const renderFooter = () => {
    return (
      // <Animated.View entering={
      //   isFirstRender.current
      //     ? FadeInDown.duration(1000).delay(200)
      //     : undefined
      // }>
        <View style={{ marginBottom: 40 }}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              { marginTop: 16 },
            ]}
            onPress={handleSaveRoutine}
          >
            <MaterialIcons name="save" size={24} color="#fff" />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      // </Animated.View>
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
        entering={FadeInDown.duration(1000).delay(200)
        }>
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

            <View style={styles.reminderOptionsContainer}>
            <Text style={styles.reminderLabel}>Set Reminders:</Text>
                  {REMINDER_OPTIONS.map((option) => {
                    const isSelected = item.reminders && item.reminders.includes(option.value);
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.reminderOptionButton,
                          isSelected && styles.reminderOptionButtonSelected
                        ]}
                        onPress={() => toggleReminderOffset(item.id, option.value)}
                      >
                        <Text
                          style={[
                            styles.reminderOptionText,
                            isSelected && styles.reminderOptionTextSelected
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

  // --------------- Main Render ---------------
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* <Animated.View entering={
          isFirstRender.current
            ? FadeInDown.duration(1000).delay(200)
            : undefined
        }> */}
      <RoutineBuilderInput
        userInput={userInput}
        setUserInput={setUserInput}
        isInputting={isInputting}
        setIsInputting={setIsInputting}
      />
      {/* </Animated.View> */}
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
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
        />
      </KeyboardAvoidingView>

      {/* Feedback Icon */}
      {/* {showFeedbackIcon && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            backgroundColor: '#3d5afe',
            padding: 12,
            borderRadius: 50,
          }}
          onPress={() => setFeedbackVisible(true)}
        >
          <MaterialIcons name="help-outline" size={30} color="white" />
        </TouchableOpacity>
      )} */}

  

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