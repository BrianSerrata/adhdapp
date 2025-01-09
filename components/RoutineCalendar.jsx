import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  ScrollView,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { collection, query, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import ConfettiCannon from 'react-native-confetti-cannon';
import styles from "../styles/RoutineCalendarStyles";

const STATUS_COLORS = {
  COMPLETED: '#4CAF50',  // Green
  IN_PROGRESS: '#3d5afe', // Blue
  FAILED: '#FF5252',     // Red
};

export default function RoutineCalendar() {
  const [routines, setRoutines] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Initialize selectedDate with today's date
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // Fetch routines from Firestore
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

  // Build markedDates whenever routines change
  useEffect(() => {
    const newMarkedDates = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
    routines.forEach((routine) => {
      for (let i = -30; i <= 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const dayOfWeek = date.getDay();
  
        if (routine.daysOfWeek?.includes(dayOfWeek)) {
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
  
    console.log("Marked Dates:", newMarkedDates); // Debugging
    setMarkedDates(newMarkedDates);
  }, [routines]);
  
  // const getRoutineStatus = (routine, dateStr, date) => {
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);
  
  //   const isFullyCompleted = isRoutineFullyCompleted(routine, dateStr);
  //   const hasAnyCompletion = routine.completedDates?.[dateStr] && 
  //     Object.values(routine.completedDates[dateStr]).some(v => v === true);
  
  //   if (date > today) {
  //     return 'IN_PROGRESS'; // Mark future routines as in-progress
  //   }
  
  //   if (date < today) {
  //     return isFullyCompleted ? 'COMPLETED' : 'FAILED'; // Mark past dates
  //   }
  
  //   return isFullyCompleted ? 'COMPLETED' : (hasAnyCompletion ? 'IN_PROGRESS' : null);
  // };
  

  const getRoutineStatus = (routine, dateStr, date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Future dates don't need status
    if (date > today) {
      return null;
    }

    const isFullyCompleted = isRoutineFullyCompleted(routine, dateStr);
    const hasAnyCompletion = routine.completedDates?.[dateStr] && 
      Object.values(routine.completedDates[dateStr]).some(v => v === true);
    
    // Past dates
    if (date < today) {
      return isFullyCompleted ? 'COMPLETED' : 'FAILED';
    }
    
    // Today
    return isFullyCompleted ? 'COMPLETED' : (hasAnyCompletion ? 'IN_PROGRESS' : null);
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
    setTimeout(() => setShowConfetti(false), 2000);
  };

  // Derive which routines fall on selectedDate
  const routinesForSelectedDate = routines.filter((routine) => {
    if (!selectedDate) return false;
    
    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12);
    const dayOfWeek = date.getDay();
    const routineDays = routine.daysOfWeek || [];
    
    return routineDays.includes(dayOfWeek);
  });

  const TaskList = ({ routine }) => {
    return routine.tasks.map(task => (
      <TaskRow
        key={task.id}
        routine={routine}
        task={task}
        dateStr={selectedDate}
      />
    ));
  };

  const RoutinesList = () => {
    return routinesForSelectedDate.map(routine => (
      <View key={routine.id} style={styles.routineContainer}>
        <Text style={styles.routineName}>{routine.name}</Text>
        <TaskList routine={routine} />
      </View>
    ));
  };

  function TaskRow({ routine, task, dateStr }) {
    const { id: routineId, completedDates = {} } = routine;
    const isCompleted = completedDates[dateStr]?.[task.id] === true;
    
    const toggleTaskCompletion = async () => {
      const newValue = !isCompleted;
      const routineRef = doc(db, "users", auth.currentUser.uid, "routines", routineId);
      try {
        await updateDoc(routineRef, {
          [`completedDates.${dateStr}.${task.id}`]: newValue
        });
        
        // Check if this completion means the entire routine is now complete
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Focus Routines</Text>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.calendarContainer}>
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
        </View>

        {selectedDate && (
          <View style={styles.routinesSection}>
            <Text style={styles.dateHeader}>
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
            {routinesForSelectedDate.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No routines scheduled
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Take a moment to reflect or plan ahead
                </Text>
              </View>
            ) : (
              <View style={styles.routinesList}>
                <RoutinesList />
              </View>
            )}
          </View>
        )}
      </ScrollView>
      
      {showConfetti && (
        <ConfettiCannon
          count={50}
          origin={{ x: -10, y: 0 }}
          autoStart={true}
          fadeOut={true}
          colors={['#3d5afe', '#4CAF50', '#FFF']}
        />
      )}
    </View>
  );
}