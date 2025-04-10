import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TouchableWithoutFeedback,
  Alert,
  Platform,
  ScrollView,
  TextInput
} from "react-native";

import moment from 'moment'
import Animated, { FadeInDown } from "react-native-reanimated";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { MaterialIcons } from "@expo/vector-icons";
import ConfettiCannon from "react-native-confetti-cannon";
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import ProgressBar from "./ProgressBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LogoutButton from "./LogoutButton";
import TaskAddButton from './TaskAddButton';
import CollapsibleRoutine from "./CollapsibleRoutine";
import OnboardingOverlay from './OnboardingOverlay';

import { useNavigation } from "@react-navigation/native";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  addDoc
} from "firebase/firestore";

import { auth, db } from "../firebase";
import styles from "../styles/RoutineCalendarStyles";
import BadgesView from "./Badges";
import WeeklyCalendar from "./WeeklyCalendar";
import { trackTaskCompletionToggled,
         trackRoutineCompleted,
 } from "../backend/apis/segment";

/* -------------------- Status Colors -------------------- */
const STATUS_COLORS = {
  COMPLETED: "#4CAF50",
  IN_PROGRESS: "#3d5afe",
  FAILED: "#1C1F26",
};

/* -------------------- Greeting -------------------- */
const getGreeting = () => {
  const hours = new Date().getHours();
  if (hours < 12) return "Good Morning";
  if (hours < 18) return "Good Afternoon";

  return "Good Evening";
};

export default function RoutineCalendar() {

  // -------------------------
  // Local State
  // -------------------------
  const [routines, setRoutines] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [name, setName] = useState("");
  const [quote, setQuote] = useState("");
  const [numPendingTasks, setNumPendingTasks] = useState(0);
  const [streak, setStreak] = useState(0)
  const [rememberWhy, setRememberWhy] = useState("");

  // For toggling expanded tasks
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [collapsedRoutines, setCollapsedRoutines] = useState([]);

  const handleToggleCollapse = useCallback((routineId) => {
    setCollapsedRoutines(prev => 
      prev.includes(routineId)
        ? prev.filter(id => id !== routineId)
        : [...prev, routineId]
    );
  }, []);

  // For time picker
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [timeField, setTimeField] = useState("");
  const [selectedDateObj, setSelectedDateObj] = useState(new Date());
  // At the top of your RoutineCalendar function component:

const [selectedView, setSelectedView] = useState('calendar'); // 'calendar' or 'badges'
const [allTasksCompleted, setAllTasksCompleted] = useState(false)

  // Logic / states for feedback form  
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedback, setFeedback] = useState({
    usability: "1",
    motivation: "1",
    engagement: "1",
    suggestion: '',
  });


  const startOfWeek = moment().startOf('isoWeek').format('YYYY-MM-DD');
  const endOfWeek = moment().endOf('isoWeek').format('YYYY-MM-DD');
  const [calendarMinimized, setCalendarMinimized] = useState(false);


  const questions = [
    {
      key: 'usability',
      text: 'How easy is it to navigate and manage your tasks on this page?',
      labels: ['Unclear', 'Very easy'],
    },
    {
      key: 'motivation',
      text: 'How motivating do you find this setup to complete your tasks?',
      labels:['Not motivating', 'Very motivating'],
    },
    {
      key: 'engagement',
      text: 'How likely are you to check this page daily to stay on track?',
      labels: ['Very unlikely', 'Very likely'],
    },
    {
      key: 'suggestion',
      text: 'What could be improved to make this page more helpful for you?'
    }
  ]

  const soundFiles = [
    require('../assets/pop.mp3'),
  ];

const navigation = useNavigation();

// Calculate pending tasks on first render and whenever routines change
const [routinesForDate, setRoutinesForSelectedDate] = useState([]);

// Add this state
const [completedTasks, setCompletedTasks] = useState(0);
const [numTasks, setNumTasks] = useState(0)

// Add this effect to track completed tasks
useEffect(() => {
  const completed = routinesForSelectedDate.reduce((total, routine) => {
    return total + routine.tasks.filter(task => 
      routine.completedDates?.[selectedDate]?.[task.id]
    ).length;
  }, 0);
  setCompletedTasks(completed);

  if (completed==numTasks) {
    setAllTasksCompleted(true)
  }
  else {
    setAllTasksCompleted(false)
  }
}, [routinesForDate, selectedDate]);

useEffect(() => {
  const tasks = routinesForSelectedDate.reduce((total, routine) => {
    return total + routine.tasks.length;
  }, 0);
  setNumTasks(tasks);
}, [routinesForDate]);


  const handleSubmitFeedback = async () => {
    // Handle feedback submission logic (e.g., saving to Firestore)

    const feedbackRef = collection(
      db,
      'users',
      auth.currentUser.uid,
      'feedback',
    );

    // Transform feedback data
    const numericFeedback = {
      usability: Number(feedback.usability),
      motivation: Number(feedback.motivation),
      engagement: Number(feedback.engagement),
      suggestion: feedback.suggestion,
      timestamp: new Date().toISOString(), // Optional: Add a timestamp
    };

    // Save to Firestore
    await addDoc(feedbackRef, numericFeedback);

    console.log('Feedback successfully submitted to Firestore:', numericFeedback);

    setFeedbackVisible(false); // Close the feedback form after submission
  };

  // -------------------------
  // Pull in user's name
  // -------------------------
  const fetchUserName = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setName(userDoc.data().name || "User");
      } else {
        console.log("No user document found.");
        setName("User");
      }
    } catch (error) {
      console.error("Error fetching user name:", error);
      setName("User");
    }
  };

  const calculateStreak = (routines, completedDates) => {


    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const today = new Date();
    const todayDate = formatDate(today); // Remove time for date-only comparison
  
    const getRoutinesForDate = (date) => {
      const currentDate = new Date(date);
      return routines.filter((routine) => {
        // Non-recurring routines
        if (!routine.isRecurring && routine.createdDate === date) {
          return true;
        }
  
        // Recurring routines
        if (routine.isRecurring) {
          const dayOfWeek = currentDate.getDay();
          if (routine.daysOfWeek?.includes(dayOfWeek)) {
            if (routine.dateRange) {
              const startDate = new Date(routine.dateRange.start);
              const endDate = new Date(routine.dateRange.end);
              return currentDate >= startDate && currentDate <= endDate;
            }
            return true;
          }
        }
        return false;
      });
    };
  
    const dates = Object.keys(completedDates).sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
  
    for (const date of dates) {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);
      const currentDate = new Date(date);
      const routinesForDate = getRoutinesForDate(date);
  
      const allTasksCompleted = routinesForDate.every((routine) =>
        routine.tasks.every((task) => completedDates[date]?.[task.id] === true)
      );
  
      if (allTasksCompleted) {
        // Increment streak if all tasks are complete
        streak++;
      } else if (date==todayDate) {
        // If today is incomplete, don't break the streak
        continue;
      } else {
        // Break the streak for past dates with incomplete tasks
        break;
      }
    }
    return streak;
  };  
  

  useEffect(() => {
    if (routines.length > 0) {
      const globalCompletedDates = routines.reduce((acc, routine) => {
        return { ...acc, ...routine.completedDates };
      }, {});
  
      setStreak(calculateStreak(routines, globalCompletedDates));
    }
  }, [routines]);
  

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  useEffect(() => {
    fetchUserName();
  }, []);

  // -------------------------
  // Selected Date
  // -------------------------
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  

  // -------------------------
  // Fetch Routines
  // -------------------------
  useEffect(() => {

    if (!auth.currentUser) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    setQuote(getRandomQuote());

    // Firestore reference to the user's routines collection
    const routinesRef = collection(db, 'users', auth.currentUser.uid, 'routines');
    
    // onSnapshot for real-time updates
    const unsubscribe = onSnapshot(
      routinesRef,
      (snapshot) => {
        const fetchedRoutines = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRoutines(fetchedRoutines);
      },
      (error) => {
        console.error('Error fetching routines:', error);
        Alert.alert('Error', 'Failed to fetch routines. Please try again.');
      }
    );

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // if (!selectedDate) return;
  
    const filteredRoutines = routines.filter((routine) => {
      const [year, month, day] = selectedDate.split("-").map(Number);
      const date = new Date(year, month - 1, day);

      // Always check if the selected date is before the creation date
      if (routine.createdDate) {
        const createdDate = new Date(`${routine.createdDate}T00:00:00`);
        console.log("created data:",createdDate)
        console.log("eval is",date<createdDate)
        if (date < createdDate) {
          return false; // Don't show routines before their creation date
        }
      }
  
      // Handle non-recurring routines
      if (!routine.isRecurring && routine.createdDate === selectedDate) {
        return true;
      }
  
      // Handle recurring routines
      if (routine.isRecurring) {
        const dayOfWeek = date.getDay();
        if (routine.daysOfWeek?.includes(dayOfWeek)) {
          if (routine.dateRange) {
            const startDate = new Date(routine.dateRange.start);
            const endDate = new Date(routine.dateRange.end);
  
            return date >= startDate && date <= endDate;
          }
          return true;
        }
      }
      return false;
    });
  
    setRoutinesForSelectedDate(filteredRoutines);
  }, [selectedDate, routines]);
  
  useEffect(() => {
    const totalIncompleteTasks = routinesForSelectedDate.reduce((total, routine) => {
      return (
        total +
        routine.tasks.filter(
          (task) => !routine.completedDates?.[selectedDate]?.[task.id]
        ).length
      );
    }, 0);
  
    setNumPendingTasks(totalIncompleteTasks);
  }, [routinesForDate]);
  

  // -------------------------
  // Marked Dates
  // -------------------------
  useEffect(() => {
    const newMarkedDates = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
    routines.forEach((routine) => {
      // For recurring routines
      if (routine.isRecurring) {
        for (let i = -30; i <= 30; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() + i);
  
          if (routine.dateRange) {
            const startDate = new Date(routine.dateRange.start);
            const endDate = new Date(routine.dateRange.end);
            if (date < startDate || date > endDate) {
              continue;
            }
          }
  
          if (routine.createdDate) {
            const createdDate = new Date(`${routine.createdDate}T00:00:00`);
            if (date < createdDate) {
              continue;
            }
          }
  
          const dayOfWeek = date.getDay();
          if (routine.daysOfWeek?.includes(dayOfWeek)) {
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const dd = String(date.getDate()).padStart(2, "0");
            const dateStr = `${yyyy}-${mm}-${dd}`;
  
            const status = getRoutineStatus(routine, dateStr, date);
            if (status) {
              newMarkedDates[dateStr] = {
                ...newMarkedDates[dateStr],
                marked: true,
                dotColor: STATUS_COLORS[status],
              };
            }
          }
        }
      }
  
      // For one-off routines
      else if (routine.createdDate) {
        const createdDate = new Date(`${routine.createdDate}T00:00:00`);
        const yyyy = createdDate.getFullYear();
        const mm = String(createdDate.getMonth() + 1).padStart(2, "0");
        const dd = String(createdDate.getDate()).padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;
  
        const status = getRoutineStatus(routine, dateStr, createdDate);
        if (status) {
          newMarkedDates[dateStr] = {
            ...newMarkedDates[dateStr],
            marked: true,
            dotColor: STATUS_COLORS[status],
          };
        }
      }
    });
  
    setMarkedDates(newMarkedDates);
  }, [routines]);   

  const getRoutineStatus = (routine, dateStr, date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date > today) return null;

    const isFullyCompleted = isRoutineFullyCompleted(routine, dateStr);
    const hasAnyCompletion =
      routine.completedDates?.[dateStr] &&
      Object.values(routine.completedDates[dateStr]).some((v) => v === true);

    if (date < today) {
      return isFullyCompleted ? "COMPLETED" : "FAILED";
    }
    // Today
    return isFullyCompleted ? "COMPLETED" : hasAnyCompletion ? "IN_PROGRESS" : null;
  };

  const isRoutineFullyCompleted = (routine, dateStr) => {
    const { tasks = [], completedDates = {} } = routine;
    if (!completedDates[dateStr]) return false;
    return tasks.every((task) => completedDates[dateStr][task.id] === true);
  };

  const handleDayPress = useCallback((day) => {
    // If 'day' is already a string, use it directly; otherwise, try to access day.dateString
    const dateString = typeof day === "string" ? day : day.dateString;
    setSelectedDate(dateString);
  }, []);
  

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3450);
  };

  const getRandomQuote = () => {
    const quotes = [
      "Small steps lead to big changes! 🌟",
      "You've got this! One task at a time. 💪",
      "Focus on progress, not perfection. 🎯",
      "Your effort today is shaping your future. 🚀",
      "Embrace the journey, celebrate small wins! 🎉",
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  // -------------------------
  // Filter Routines for Selected Date
  // -------------------------
  const routinesForSelectedDate = routines.filter((routine) => {
    console.log("selected date:",selectedDate)
    if (!selectedDate) return false;
    const [year, month, day] = selectedDate.split("-").map(Number);
    const date = new Date(year, month - 1, day);
  
    if (routine.createdDate) {
      const createdDate = new Date(`${routine.createdDate}T00:00:00`);
      if (date < createdDate) {
        return false; // Don't show routines before their creation date
      }
    }

    // Handle non-recurring routines
    if (!routine.isRecurring && routine.createdDate === selectedDate) {
      return true;
    }
  
    // Handle recurring routines
    if (routine.isRecurring) {
      const dayOfWeek = date.getDay();
      if (routine.daysOfWeek?.includes(dayOfWeek)) {
        if (routine.dateRange) {
          const startDate = new Date(routine.dateRange.start);
          const startDateOnly = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate()
          );
  
          const endDate = new Date(routine.dateRange.end);
          const endDateOnly = new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate()
          );
  
          if (date >= startDateOnly && date <= endDateOnly) {
            return true;
          }
          return false;
        }
        return true;
      }
    }
  
    return false;
  });


  // -------------------------
  // Time Picker Logic
  // -------------------------
  const showTimePicker = (routine, taskId, field) => {
    // Find the specific task
    const task = routine.tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Set up the pre-selected time
    if (task.timeRange[field]) {
      const [hours, minutes] = task.timeRange[field].split(":").map(Number);
      const dt = new Date();
      dt.setHours(hours);
      dt.setMinutes(minutes);
      setSelectedDateObj(dt);
    } else {
      setSelectedDateObj(new Date());
    }

    // Store references
    setSelectedTask({ routine, taskId, field });
    setTimePickerVisible(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisible(false);
    setSelectedTask(null);
    setTimeField("");
  };

  const handleConfirmTime = (date) => {
    if (!selectedTask) return;
    const { routine, taskId, field } = selectedTask;

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const timeString = `${hours}:${minutes}`;

    const updatedTasks = routine.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            timeRange: { ...task.timeRange, [field]: timeString },
          }
        : task
    );

    // Update tasks in Firestore
    const routineRef = doc(db, "users", auth.currentUser.uid, "routines", routine.id);
    updateDoc(routineRef, { tasks: updatedTasks })
      .then(() => {
        setTimePickerVisible(false);
        setSelectedTask(null);
      })
      .catch((error) => {
        console.error("Error updating time:", error);
        Alert.alert("Error", "Failed to update task time.");
      });
  };

  const handleRemoveTask = async (routineId, taskId) => {
    try {
      // Key format: hiddenTasks_YYYY-MM-DD
      const storageKey = `hiddenTasks_${selectedDate}`;
      
      // Get existing hidden tasks for this date
      const existingHidden = await AsyncStorage.getItem(storageKey);
      const hiddenTasks = existingHidden ? JSON.parse(existingHidden) : {};
      
      // Add this task to hidden tasks
      if (!hiddenTasks[routineId]) {
        hiddenTasks[routineId] = [];
      }
      hiddenTasks[routineId].push(taskId);
      
      // Save updated hidden tasks
      await AsyncStorage.setItem(storageKey, JSON.stringify(hiddenTasks));
      
      // Force a re-render
      setRoutines([...routines]);
      
      // // Show confirmation
      // Alert.alert(
      //   "Task Hidden",
      //   "This task has been hidden for today only.",
      //   [{ text: "OK" }]
      // );
    } catch (error) {
      console.error('Error hiding task:', error);
      Alert.alert('Error', 'Could not hide task. Please try again.');
    }
  };

  // -------------------------
  // Helper
  // -------------------------
  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const TaskRow = ({ routine, task }) => {

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [localTitle, setLocalTitle] = useState(task.title);
    const [localDescription, setLocalDescription] = useState(task.description);

    const [isHidden, setIsHidden] = useState(false);

  // Check if task is hidden for this date
  useEffect(() => {
    const checkHiddenStatus = async () => {
      try {
        const storageKey = `hiddenTasks_${selectedDate}`;
        const hiddenTasks = await AsyncStorage.getItem(storageKey);
        if (hiddenTasks) {
          const hidden = JSON.parse(hiddenTasks);
          setIsHidden(hidden[routine.id]?.includes(task.id));
        }
      } catch (error) {
        console.error('Error checking hidden status:', error);
      }
    };

    checkHiddenStatus();
  }, [selectedDate, routine.id, task.id]);

  // Don't render if task is hidden
  if (isHidden) return null;

    // Add this function to handle final submission
    const handleSubmitEdit = async (field) => {
      const updatedTasks = routine.tasks.map((t) =>
        t.id === task.id
          ? {
              ...t,
              [field]: field === 'title' ? localTitle : localDescription,
            }
          : t
      );

      const routineRef = doc(db, "users", auth.currentUser.uid, "routines", routine.id);
      try {
        await updateDoc(routineRef, { tasks: updatedTasks });
        if (field === 'title') {
          setIsEditingTitle(false);
        } else {
          setIsEditingDescription(false);
        }
      } catch (err) {
        console.error(`Error updating ${field}:`, err);
        Alert.alert("Error", `Could not update ${field}.`);
      }
    };
    
    // Completion logic
    const isCompleted = routine.completedDates?.[selectedDate]?.[task.id] === true;

    const handleDescriptionChange = async (text) => {
      const updatedTasks = routine.tasks.map((t) =>
        t.id === task.id ? { ...t, description: text } : t
      );
      const routineRef = doc(db, "users", auth.currentUser.uid, "routines", routine.id);
      try {
        await updateDoc(routineRef, { tasks: updatedTasks });
      } catch (err) {
        console.error("Error updating description:", err);
        Alert.alert("Error", "Could not update description.");
      }
    };

    const toggleTaskCompletion = async () => {

      const playRandomSound = async () => {
        // Select a random sound file
        const selectedSound = soundFiles[0];
      
        // Play the selected sound
        const { sound } = await Audio.Sound.createAsync(selectedSound);
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      };
      

      const routineRef = doc(db, "users", auth.currentUser.uid, "routines", routine.id);

      // Identify task that has been toggled
      const taskIndex = routine.tasks.findIndex((t) => t.id === task.id);
      if (taskIndex === -1) {
        console.error("Task not found in routine");
        return;
      }

      const newValue = !isCompleted;

      const updatedTasks = [...routine.tasks];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        isCompleted: newValue,
      };

      const updatedCompletedDates = {
        ...routine.completedDates,
        [selectedDate]: {
          ...(routine.completedDates?.[selectedDate] || {}),
          [task.id]: newValue,
        },
      };

      try {

        // Trigger haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await playRandomSound();

        trackTaskCompletionToggled({
          userId: auth.currentUser.uid,
          routineId: routine.id,
          taskId: task.id,
          taskTitle: task.title,
          completed: newValue,
          timestamp: new Date().toISOString(),
          date: selectedDate,
        });

        await updateDoc(routineRef, { 
          tasks: updatedTasks, 
          completedDates: updatedCompletedDates 
        });
        // Check if all tasks are now complete
        const allTasksCompleted = routine.tasks.every(
          (t) => updatedCompletedDates[selectedDate]?.[t.id] === true
        );

        if (newValue && allTasksCompleted) {

          trackRoutineCompleted({
            userId: auth.currentUser.uid,
            routineId: routine.id,
            routineName: routine.name,
            routineDetails: routine,
            numTasks: routine.tasks.length,
            timestamp: new Date().toISOString(),
            date: selectedDate,
            totalTasks: routine.tasks.length,
          });

          triggerConfetti();
        }
      } catch (err) {
        console.error("Error updating completion:", err);
        Alert.alert("Error", "Could not update completion.");
      }
    };

    // Expanded logic
    const isExpanded = expandedTaskId === task.id;
    const toggleExpanded = () => {
      setExpandedTaskId(isExpanded ? null : task.id);
    };

    const handleTitleChange = async (text) => {
      const updatedTasks = routine.tasks.map((t) =>
        t.id === task.id ? { ...t, title: text } : t
      );
      const routineRef = doc(db, "users", auth.currentUser.uid, "routines", routine.id);
      try {
        await updateDoc(routineRef, { tasks: updatedTasks });
      } catch (err) {
        console.error("Error updating title:", err);
        Alert.alert("Error", "Could not update title.");
      }
    };

    return (
      <View style={styles.taskItem}>
        {/* Header */}
        <TouchableOpacity
          style={styles.taskHeader}
          onPress={toggleExpanded}
          activeOpacity={0.7}
        >
          <TouchableOpacity
            style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}
            onPress={(e) => {
              e.stopPropagation();
              toggleTaskCompletion();
            }}
          >
            {isCompleted && <MaterialIcons name="check" size={16} color="#fff" />}
          </TouchableOpacity>

          <View style={styles.taskTitleContainer}>
            <Text
              style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
            <Text style={styles.taskTime}>
              {formatTimeForDisplay(task.timeRange.start)} - {formatTimeForDisplay(task.timeRange.end)}
            </Text>
          </View>

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
            value={localTitle}
            placeholder="Task title"
            onChangeText={setLocalTitle}
            onBlur={() => handleSubmitEdit('title')}
            onFocus={() => setIsEditingTitle(true)}
            onSubmitEditing={() => handleSubmitEdit('title')}
          />

            {/* Time Inputs */}
            <View style={styles.timeInputsContainer}>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => showTimePicker(routine, task.id, "start")}
              >
                <MaterialIcons name="access-time" size={20} color="#007AFF" />
                <Text style={styles.timeButtonText}>
                  {formatTimeForDisplay(task.timeRange.start) || "Start Time"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => showTimePicker(routine, task.id, "end")}
              >
                <MaterialIcons name="access-time" size={20} color="#007AFF" />
                <Text style={styles.timeButtonText}>
                  {formatTimeForDisplay(task.timeRange.end) || "End Time"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Editable Description */}
            <TextInput
            style={styles.descriptionInput}
            value={localDescription}
            placeholder="Task description"
            placeholderTextColor="#848484"
            multiline
            numberOfLines={3}
            onChangeText={setLocalDescription}
            onBlur={() => handleSubmitEdit('description')}
            onFocus={() => setIsEditingDescription(true)}
            onSubmitEditing={() => handleSubmitEdit('description')}
          />

            {/* Remove Task Button */}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveTask(routine.id, task.id)}
            >
              <MaterialIcons name="delete-outline" size={20} color="#FF3B30" />
              <Text style={styles.removeButtonText}>Remove Task</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // -------------------------
  // Routines for Selected Date
  // -------------------------
  const RoutinesList = () => {
    return routinesForSelectedDate.map((routine) => (
      <CollapsibleRoutine 
        key={routine.id} 
        routine={routine}
        selectedDate={selectedDate}
        formatTimeForDisplay={formatTimeForDisplay}
        collapsedRoutines={collapsedRoutines}
        onToggleCollapse={handleToggleCollapse}
      >
        {routine.tasks.map((task) => (
          <TaskRow key={task.id} 
           routine={routine} 
           task={task} 
           selectedDate={selectedDate}
           expandedTaskId={expandedTaskId}
           setExpandedTaskId={setExpandedTaskId}
           formatTimeForDisplay={formatTimeForDisplay}
           setTimePickerVisible={setTimePickerVisible}
           triggerConfetti={triggerConfetti}
           />
        ))}
      </CollapsibleRoutine>
    ));
  }; 

  // Add new state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);

  // Add useEffect to check if user needs onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
        console.log("hasCompletedOnboarding",hasCompletedOnboarding)
        if (hasCompletedOnboarding == 'false') {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    checkOnboarding();
  }, []);

  // Add handlers for onboarding
  const handleNextStep = () => {
    setOnboardingStep(2);
  };

  const handleFinishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      setShowOnboarding(false);
      navigation.navigate('Routines'); // Navigate to routine creation
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }} 
          showsVerticalScrollIndicator={false}
        >
        {/* Greeting */}
        <Animated.View
          entering={FadeInDown.duration(1000).delay(200)}
          style={styles.greetingContainer}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Text style={styles.greeting}>{`${greeting}, ${name || "User"} 👋`}</Text>
            <LogoutButton
              navigation={navigation}
              onLogoutSuccess={() => console.log('Logged out!')}
              buttonStyle={{ borderRadius: 8 }}
              textStyle={{ fontSize: 16 }}
            />
          </View>
          <Text style={styles.subtext}>
            {`${numPendingTasks} tasks pending`}
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(1000).delay(200)}
          style={styles.quoteBubbleContainer}
        >
          <Text style={styles.quoteText}>
            {quote}
          </Text>
        </Animated.View>

        {/* Calendar + Scroll */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >          

          {!calendarMinimized && (
            <Animated.View
              entering={FadeInDown.duration(1000).delay(200)}
              style={styles.calendarContainer}
            >
              {selectedView === 'calendar' ? (
                <WeeklyCalendar
                  onDayPress={handleDayPress}
                  markedDates={markedDates}
                />
              ) : (
                <BadgesView 
                allTasksCompleted={allTasksCompleted}
                tasksCompleted={completedTasks}/>
              )}
            </Animated.View>
          )}


          {/* Add the progress bar */}
          <Animated.View
            entering={FadeInDown.duration(1000).delay(200)}
          >
            <ProgressBar 
              totalTasks={numTasks}
              completedTasks={completedTasks}
              streak={streak}
            />
          </Animated.View>

          {/* Routines for This Date */}
          {selectedDate && (
            <Animated.View
              entering={FadeInDown.duration(1000).delay(200)}
              style={styles.routinesSection}
            >
              {/* <Text style={styles.dateHeader}>
                {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </Text> */}
              {routinesForSelectedDate.length === 0 ? (
              <Animated.View
                entering={FadeInDown.duration(1000).delay(200)}
                style={styles.emptyStateBubble}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('Routines')}
                  // style={styles.emptyStateTouchable}
                >
                    <Text style={styles.emptyStateText}>Got plans to tackle?</Text>
                  <View style={styles.actionButtonContainer}>
                    <Text style={styles.actionButtonText}>Plan Your Day with AI</Text>
                  </View>
                </TouchableOpacity>
                </Animated.View>

              ) : (
                <View style={styles.routinesList}>
                  <RoutinesList />
                </View>
              )}
            </Animated.View>
          )}

        </ScrollView>

        {/* <TaskAddButton selectedDate={selectedDate}/> */}

        {/* Confetti */}
        {showConfetti && (
          <ConfettiCannon
            count={100}
            origin={{ x: 0.5, y: 0 }} // Start from the top center of the screen
            autoStart={true}
            fadeOut={false} // Disable fadeOut to make confetti last longer
            explosionSpeed={300} // Adjusted speed for slower falling confetti
            gravity={0.3} // Slower fall, adjust for longer animation
            angle={90} // Angle set to 90 degrees to fall vertically
            duration={5000} // Increase the duration for longer confetti animation
            colors={["#3d5afe", "#FF4081", "#FFC107", "#00E676", "#FF9800"]}
          />
)}



        {/* Time Picker Modal */}
        <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode={"time"}
        onCancel={hideTimePicker}
        onConfirm={handleConfirmTime}
        date={selectedDateObj}
        isDarkModeEnabled={true}
        textColor={Platform.OS === "ios" ? "white" : "black"}
        themeVariant="light"
        display={Platform.OS === "ios" ? "spinner" : "default"}
      />
        </ScrollView>
        <TaskAddButton selectedDate={selectedDate}/>
        {showOnboarding && (
        <OnboardingOverlay
          step={onboardingStep}
          onNext={handleNextStep}
          onFinish={handleFinishOnboarding}
        />
      )}
    </SafeAreaView>
  );
}