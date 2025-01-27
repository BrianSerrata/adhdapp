import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform
} from "react-native";
import { Calendar } from "react-native-calendars";
import Animated, { FadeInDown } from "react-native-reanimated";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { MaterialIcons } from "@expo/vector-icons";
import ConfettiCannon from "react-native-confetti-cannon";
import FeedbackModal from "./FeedbackModal";

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
  const [quote, setQuote] = useState('');

  // For toggling expanded tasks
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  // For time picker
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [timeField, setTimeField] = useState("");
  const [selectedDateObj, setSelectedDateObj] = useState(new Date());

  // Logic / states for feedback form
  
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedback, setFeedback] = useState({
    usability: "1",
    motivation: "1",
    engagement: "1",
    suggestion: '',
  });

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

  const navigation = useNavigation();

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

  const normalizeDate = (date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };
  

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
    setSelectedDate(day.dateString);
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
    if (!selectedDate) return false;
  
    const [year, month, day] = selectedDate.split("-").map(Number);
    const date = new Date(year, month - 1, day);
  
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

  // -------------------------
  // Task Row with SMART Builder UI
  // -------------------------
  const TaskRow = ({ routine, task }) => {
    // Completion logic
    const isCompleted = routine.completedDates?.[selectedDate]?.[task.id] === true;

    const toggleTaskCompletion = async () => {
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
      <Animated.View style={styles.taskItem}>
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

            <Text style={styles.description}>{task.description}</Text>
          </View>
        )}
      </Animated.View>
    );
  };

  // -------------------------
  // Routines for Selected Date
  // -------------------------
  const RoutinesList = () => {

    return routinesForSelectedDate.map((routine) => (
      <View key={routine.id} style={styles.routineContainer}>
        <Text style={styles.routineName}>{routine.name}</Text>

        {routine.tasks.map((task) => (
          <TaskRow key={task.id} routine={routine} task={task} />
        ))}
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {/* Greeting */}
        <Animated.View
          entering={FadeInDown.duration(1000).delay(200)}
          style={styles.greetingContainer}
        >
          <Text style={styles.greeting}>{`${greeting}, ${name || "User"}`}</Text>
        </Animated.View>

        <Animated.View
        entering={FadeInDown.duration(1000).delay(600)}
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
          {/* <Animated.View
            entering={FadeInDown.duration(1000).delay(600)}
            style={styles.calendarContainer}
          > */}
            {/* <Calendar
              onDayPress={handleDayPress}
              markedDates={{
                ...markedDates,
                [selectedDate]: {
                  ...markedDates[selectedDate],
                  selected: true,
                },
              }}
              markingType="dot"
              theme={{
                backgroundColor: "#1C1F26", // Match safeContainer
                calendarBackground: "#1C1F26", // Match background
                textSectionTitleColor: "#848484", // Muted slate for headers
                selectedDayBackgroundColor: "#2f4156", // Blue accent for selection
                selectedDayTextColor: "#ffffff", // White text for selected day
                todayTextColor: "#D0CDC9", // Bright blue for today
                dayTextColor: "#D1D5DB", // Slate white for regular days
                textDisabledColor: "#4d4d4d", // Darker slate for disabled days
                dotColor: "#60A5FA", // Bright blue dots
                selectedDotColor: "#ffffff", // White dot for selected day
                arrowColor: "#60A5FA", // Blue accent for arrows
                monthTextColor: "#D1D5DB", // Slate white for month name
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
                textDayFontFamily: "System", // Use system font
                textMonthFontFamily: "System",
                textDayHeaderFontFamily: "System",
              }}
            /> */}

          {/* </Animated.View> */}

          <FeedbackModal
            visible={feedbackVisible}
            setVisible={setFeedbackVisible}
            questions={questions}
            feedback={feedback}
            setFeedback={setFeedback}
            handleSubmit={handleSubmitFeedback}
            showFeedbackIcon={true}
          />

          {/* Routines for This Date */}
          {selectedDate && (
            <Animated.View
              entering={FadeInDown.duration(1000).delay(800)}
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
                entering={FadeInDown.duration(1000).delay(300)}
                style={styles.emptyStateBubble}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('Routines')}
                  // style={styles.emptyStateTouchable}
                >
                    <Text style={styles.emptyStateText}>Got plans to tackle?</Text>
                  <View style={styles.actionButtonContainer}>
                    <Text style={styles.actionButtonText}>Plan Your Day with AI 🤖</Text>
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

          <Animated.View
            entering={FadeInDown.duration(1000).delay(600)}
            style={styles.calendarContainer}
          >
            <Calendar
              onDayPress={handleDayPress}
              markedDates={{
                ...markedDates,
                [selectedDate]: {
                  ...markedDates[selectedDate],
                  selected: true,
                },
              }}
              markingType="dot"
              theme={{
                backgroundColor: "#1C1F26", // Match safeContainer
                calendarBackground: "#1C1F26", // Match background
                textSectionTitleColor: "#848484", // Muted slate for headers
                selectedDayBackgroundColor: "#2f4156", // Blue accent for selection
                selectedDayTextColor: "#ffffff", // White text for selected day
                todayTextColor: "#D0CDC9", // Bright blue for today
                dayTextColor: "#D1D5DB", // Slate white for regular days
                textDisabledColor: "#4d4d4d", // Darker slate for disabled days
                dotColor: "#60A5FA", // Bright blue dots
                selectedDotColor: "#ffffff", // White dot for selected day
                arrowColor: "#60A5FA", // Blue accent for arrows
                monthTextColor: "#D1D5DB", // Slate white for month name
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
                textDayFontFamily: "System", // Use system font
                textMonthFontFamily: "System",
                textDayHeaderFontFamily: "System",
              }}
            />
          </Animated.View>

        </ScrollView>

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
      </View>
    </SafeAreaView>
  );
}