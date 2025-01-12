import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert,  
  ScrollView,
  SafeAreaView
} from "react-native";
import { Calendar } from "react-native-calendars";
import Animated, { FadeInDown } from 'react-native-reanimated';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  getDoc 
} from "firebase/firestore";
import { auth, db } from "../firebase";
import ConfettiCannon from 'react-native-confetti-cannon';
import styles from "../styles/RoutineCalendarStyles";

/* -------------------- Days-of-Week Mapping -------------------- */
const DAY_OF_WEEK_MAP = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6
};

/* -------------------- Status Colors -------------------- */
const STATUS_COLORS = {
  COMPLETED: '#4CAF50',   // Green
  IN_PROGRESS: '#3d5afe', // Blue
  FAILED: '#FF5252',      // Red
};

/* -------------------- Greeting -------------------- */
const getGreeting = () => {
  const hours = new Date().getHours();
  if (hours < 12) return 'Good Morning';
  if (hours < 18) return 'Good Afternoon';
  return 'Good Evening';
};

export default function RoutineCalendar() {
  const [routines, setRoutines] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [name, setName] = useState('');

  // Function to fetch the user's name
  const fetchUserName = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setName(userDoc.data().name || 'User');
      } else {
        console.log('No user document found.');
        setName('User');
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
      setName('User');
    }
  };

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await fetchUserName(); // Await the name fetch
    };
    fetchData();
  }, []);
  
  // Initialize selectedDate with today's date
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  /* 
   * ----------------------------------------------------------------
   * 1) Fetch Routines from Firestore (Existing Code)
   * ----------------------------------------------------------------
   */
  useEffect(() => {
    if (!auth.currentUser) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    const routinesRef = collection(db, "users", auth.currentUser.uid, "routines");
    const q = query(routinesRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRoutines = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRoutines(fetchedRoutines);
    });

    return () => unsubscribe();
  }, []);

  /* 
   * ----------------------------------------------------------------
   * 2) Fetch Goals from Firestore -> Transform Phases into "Routines"
   * ----------------------------------------------------------------
   */
  useEffect(() => {
    if (!auth.currentUser) return;

    const goalsRef = collection(db, "users", auth.currentUser.uid, "dynamicGoals");
    const q = query(goalsRef);

    const unsubscribeGoals = onSnapshot(q, (snapshot) => {
      const fetchedGoals = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Transform each goal's phases into routine-like objects
      const goalRoutines = [];
      fetchedGoals.forEach((goal) => {
        if (goal.phases && Array.isArray(goal.phases)) {
          goal.phases.forEach((phase, index) => {
            // Convert string days (["Mon", "Wed"]) -> numeric ([1, 3])
            const numericDays = phase.routine.daysOfWeek

            // Build routine-like object
            goalRoutines.push({
              id: `${goal.id}_${phase.id}`, // Add `phase.name` or another unique field
              name: phase.name,            // e.g., "Phase A"
              tasks: phase.routine.tasks,  // array of tasks
              daysOfWeek: numericDays,
              dateRange: phase.dateRange,  // from the phase
              completedDates: {},          // or fetch from sub-collection if needed
            });
          });
        }
      });

      // Merge these new "goal routines" into existing routines
      setRoutines((prevRoutines) => {
        const routineMap = new Map();
      
        // Add existing routines to the map
        prevRoutines.forEach((routine) => {
          routineMap.set(routine.id, routine);
        });
      
        // Add new routines, overwriting duplicates based on `id`
        goalRoutines.forEach((routine) => {
          routineMap.set(routine.id, routine);
        });
      
        // Convert map back to array
        return Array.from(routineMap.values());
      });
      
    });

    return () => unsubscribeGoals();
  }, []);

  /*
   * ----------------------------------------------------------------
   * 3) Build markedDates for the Calendar with Date Range Filtering
   * ----------------------------------------------------------------
   */
  useEffect(() => {
    const newMarkedDates = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    routines.forEach((routine) => {
      // We mark +/- 30 days from "today" for demonstration
      for (let i = -30; i <= 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        // 3.1) If the routine has a dateRange, only mark dates within that range
        if (routine.dateRange) {
          const startDate = new Date(routine.dateRange.start);
          const endDate = new Date(routine.dateRange.end);
          
          // Skip if date is outside the phase date range
          if (date < startDate || date > endDate) {
            continue;
          }
        }

        // 3.2) Check if date matches the routine's daysOfWeek
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
    });

    setMarkedDates(newMarkedDates);
  }, [routines]);

  // Routine Status
  const getRoutineStatus = (routine, dateStr, date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // For future dates, skip marking them
    if (date > today) {
      return null;
    }

    const isFullyCompleted = isRoutineFullyCompleted(routine, dateStr);
    const hasAnyCompletion =
      routine.completedDates?.[dateStr] &&
      Object.values(routine.completedDates[dateStr]).some(v => v === true);

    // Past dates
    if (date < today) {
      return isFullyCompleted ? 'COMPLETED' : 'FAILED';
    }

    // Today
    return isFullyCompleted ? 'COMPLETED' : (hasAnyCompletion ? 'IN_PROGRESS' : null);
  };

  // Check if all tasks are completed for a given date
  const isRoutineFullyCompleted = (routine, dateStr) => {
    const { tasks = [], completedDates = {} } = routine;
    if (!completedDates[dateStr]) return false;
    return tasks.every((task) => completedDates[dateStr][task.id] === true);
  };

  // When user presses a day on the calendar
  const handleDayPress = useCallback((day) => {
    setSelectedDate(day.dateString);
  }, []);

  // Trigger confetti animation
  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  /* 
   * ----------------------------------------------------------------
   * 4) Filter Routines for the Selected Date
   * ----------------------------------------------------------------
   */
  const routinesForSelectedDate = routines.filter((routine) => {
    if (!selectedDate) return false;

    // If routine has a dateRange, skip if outside that date
    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12);

    // Check date range if present
    if (routine.dateRange) {
      const startDate = new Date(routine.dateRange.start);
      const endDate = new Date(routine.dateRange.end);
      if (date < startDate || date > endDate) {
        return false;
      }
    }

    const dayOfWeek = date.getDay();
    return routine.daysOfWeek.includes(dayOfWeek);
  });

  /* 
   * ----------------------------------------------------------------
   * 5) Render Task Rows
   * ----------------------------------------------------------------
   */
  const TaskList = ({ routine }) => {
    return routine.tasks.map((task, idx) => (
      <TaskRow
        key={`${routine.id}_${idx}`} // Or task.id if tasks have unique IDs
        routine={routine}
        task={task}
        dateStr={selectedDate}
      />
    ));
  };

  /* 
   * ----------------------------------------------------------------
   * 6) Render Routines for Selected Date
   * ----------------------------------------------------------------
   */
  const RoutinesList = () => {
    return routinesForSelectedDate.map(routine => (
      <View key={routine.id} style={styles.routineContainer}>
        <Text style={styles.routineName}>{routine.name}</Text>
        <TaskList routine={routine} />
      </View>
    ));
  };

  /* 
   * ----------------------------------------------------------------
   * 7) Task Row + Completion Logic
   * ----------------------------------------------------------------
   */
  function TaskRow({ routine, task, dateStr }) {
    const { id: routineId, completedDates = {} } = routine;
    // If tasks have IDs, use them; otherwise use index
    const isCompleted = completedDates[dateStr]?.[task.id] === true;
    
    const toggleTaskCompletion = async () => {
      const newValue = !isCompleted;
      const routineRef = doc(db, "users", auth.currentUser.uid, "routines", routineId);

      try {
        await updateDoc(routineRef, {
          [`completedDates.${dateStr}.${task.id}`]: newValue
        });
        
        // Check if this completion means the entire routine is complete
        const updatedCompletedDates = {
          ...completedDates,
          [dateStr]: { ...(completedDates[dateStr] || {}), [task.id]: newValue }
        };
        
        const allTasksCompleted = routine.tasks.every(
          t => updatedCompletedDates[dateStr]?.[t.id] === true
        );
        
        if (newValue && allTasksCompleted) {
          triggerConfetti();
        }
      } catch (error) {
        console.error("Error updating task completion:", error);
        Alert.alert("Error", "Could not update completion status.");
      }
    };

    return (
      <TouchableOpacity 
        style={styles.taskRow}
        onPress={toggleTaskCompletion}
        activeOpacity={0.7}
      >
        <View style={styles.taskContent}>
          <View 
            style={[
              styles.checkbox, 
              isCompleted && styles.checkboxCompleted
            ]}
          >
            {isCompleted && <View style={styles.checkmark} />}
          </View>
          <Text style={[
            styles.taskTitle,
            isCompleted && styles.taskTitleCompleted
          ]}>
            {task.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  /* 
   * ----------------------------------------------------------------
   * 8) Calendar Theme & Rendering
   * ----------------------------------------------------------------
   */
  const calendarTheme = {
    backgroundColor: '#1a1a1a',
    calendarBackground: '#1a1a1a',
    textSectionTitleColor: '#848484',
    selectedDayBackgroundColor: '#3d5afe',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#3d5afe',
    dayTextColor: '#ffffff',
    textDisabledColor: '#4d4d4d',
    dotColor: '#3d5afe',
    selectedDotColor: '#ffffff',
    arrowColor: '#3d5afe',
    monthTextColor: '#ffffff',
    textDayFontSize: 16,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 14
  };

  // Main Return
  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {/* Greeting */}
        <Animated.View
          entering={FadeInDown.duration(1000).delay(200)}
          style={styles.greetingContainer}
        >
          <Text style={styles.greeting}>{`${greeting}, ${name || 'User'}`}</Text>
          <Text style={styles.subGreeting}>Let's make today productive</Text>
        </Animated.View>

        {/* (Optional) Additional Header */}
        <Animated.Text
          entering={FadeInDown.duration(1000).delay(400)}
          style={styles.header}
        >
          {/* Possibly: "My Goals and Routines" */}
        </Animated.Text>

        {/* Calendar */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
              theme={calendarTheme}
            />
          </Animated.View>

          {/* Routines for Selected Date */}
          {selectedDate && (
            <Animated.View
              entering={FadeInDown.duration(1000).delay(800)}
              style={styles.routinesSection}
            >
                <Text style={styles.dateHeader}>
                  {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              {routinesForSelectedDate.length === 0 ? (
                <Animated.View
                  entering={FadeInDown.duration(1000).delay(1000)}
                  style={styles.emptyState}
                >
                  <Text style={styles.emptyStateText}>No routines scheduled</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Take a moment to reflect or plan ahead
                  </Text>
                </Animated.View>
              ) : (
                <View style={styles.routinesList}>
                  <RoutinesList />
                </View>
              )}
            </Animated.View>
          )}
        </ScrollView>

        {/* Confetti */}
        {showConfetti && (
          <ConfettiCannon
            count={100} // Number of confetti pieces
            origin={{ x: 0.5, y: 0 }} // Start at the top center
            autoStart={true} // Auto-launch confetti
            fadeOut={true} // Fade out confetti as they fall
            fallAngle={180} // Make confetti fall downward
            explosionSpeed={500} // Optional: Adjust the speed of the explosion
            colors={['#3d5afe', '#4CAF50', '#FFF']} // Confetti colors
          />
        )}
      </View>
    </SafeAreaView>
  );
}