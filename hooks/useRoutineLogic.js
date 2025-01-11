// hooks/useRoutineLogic.js

import { useState, useEffect } from 'react';
import { Alert, Keyboard } from 'react-native';
import axios from 'axios';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { OPENAI_API_KEY } from '@env';

const DAYS_OF_WEEK = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

// Helper to dismiss keyboard
const dismissKeyboard = () => Keyboard.dismiss();

// Generate a random ID for tasks
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function useRoutineLogic(initialRoutine = null) {
  const [userInput, setUserInput] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Days of the week selection
  const [selectedDays, setSelectedDays] = useState([]);

  // Time picker states
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [timeField, setTimeField] = useState("");
  const [selectedTime, setSelectedTime] = useState(new Date());

  // For expanded tasks
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  // If an existing routine is provided (edit mode), load it
  useEffect(() => {
    if (initialRoutine) {
      setTasks(initialRoutine.tasks || []);
      if (initialRoutine.daysOfWeek) {
        setSelectedDays(initialRoutine.daysOfWeek);
      }
    }
  }, [initialRoutine]);

  // ----- OpenAI Generation -----
  const handleGenerateRoutine = async () => {
    dismissKeyboard();
    if (!userInput.trim()) {
      Alert.alert("Error", "Please provide a description of your goals.");
      return;
    }
    setLoading(true);

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini", // or whichever model you prefer
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
              11. Avoid overscheduling. Include buffer times or flexibility in the routine.`,
            },
            {
              role: "user",
              content: `Here is my goal: ${userInput}`,
            },
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
                            start: { type: "string" },
                            end: { type: "string" },
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
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );
      
      // Parse the JSON from the function call
      const functionCall = response.data.choices[0].message.function_call;
      const routineData = JSON.parse(functionCall.arguments);
      const routine = routineData.routine || [];
      
      // Add IDs
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

  // ----- Task Functions -----
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
      description: "",
      isCompleted: false,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleRemoveTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // ----- Time Picker -----
  const showTimePicker = (taskId, field) => {
    const task = tasks.find((t) => t.id === taskId);
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

  const handleConfirmTime = (time) => {
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
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

  // ----- Days of the Week -----
  const toggleDaySelection = (dayValue) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayValue)) {
        return prev.filter((val) => val !== dayValue);
      } else {
        return [...prev, dayValue];
      }
    });
  };

  // ----- Save Routine to Firebase -----
  const handleSaveRoutine = async () => {
    if (!tasks.length) {
      Alert.alert("Error", "No tasks to save.");
      return;
    }
    if (!selectedDays.length) {
      Alert.alert("Days Not Selected", "Please select at least one day.");
      return;
    }
    
    try {
      const routinesRef = collection(db, 'users', auth.currentUser.uid, 'routines');
      const routineData = {
        name: `Routine - ${new Date().toLocaleDateString()}`,
        tasks,
        daysOfWeek: selectedDays,
        timestamp: serverTimestamp(),
      };
      await addDoc(routinesRef, routineData);
      Alert.alert("Routine Saved", "Your routine has been saved successfully!");
    } catch (error) {
      console.error('Error saving routine:', error);
      Alert.alert("Error", "Failed to save routine. Please try again.");
    }
  };

  // ----- Expand/Collapse Task -----
  const toggleExpandTask = (taskId) => {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
  };

  const isTaskExpanded = (taskId) => expandedTaskId === taskId;

  return {
    // state
    userInput,
    tasks,
    loading,
    isTimePickerVisible,
    selectedTime,
    selectedDays,
    expandedTaskId,
    
    // getters
    isTaskExpanded,
    DAYS_OF_WEEK,
    
    // setters/handlers
    setUserInput,
    setTimePickerVisible,
    handleGenerateRoutine,
    handleDragEnd,
    handleAddTask,
    handleRemoveTask,
    toggleTaskCompletion,
    showTimePicker,
    hideTimePicker,
    handleConfirmTime,
    formatTimeForDisplay,
    toggleDaySelection,
    handleSaveRoutine,
    toggleExpandTask,
  };
}
