import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { collection, query, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";

// Helper to format today's date as YYYY-MM-DD
const getTodayString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function RoutineCalendar({ navigation }) {
  const [routines, setRoutines] = useState([]);
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    if (!auth.currentUser) {
      Alert.alert("Error", "User not authenticated.");
      navigation.navigate("Login");
      return;
    }

    // Listen for changes in the routines collection
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
  }, [navigation]);

  // Build the markedDates object
  useEffect(() => {
    const newMarkedDates = {};

    // We'll iterate over all routines and compute which dates should be "marked"
    routines.forEach((routine) => {
      // 1) Mark completion if routine.completedDates is set
      // 2) Or if you have a daysOfWeek array, figure out which days in the month it applies

      // Let's assume we only mark the next 30 days for demonstration
      const now = new Date();
      for (let i = 0; i < 60; i++) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;

        // Check if this date's day-of-week is in routine.daysOfWeek
        // (Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6)
        const dayOfWeek = date.getDay(); // 0-6
        if (routine.daysOfWeek?.includes(dayOfWeek)) {
          // Mark it as scheduled
          // Now check if it is completed
          const isCompleted = routine.completedDates?.[dateStr] === true;
          // Build marking
          newMarkedDates[dateStr] = {
            ...newMarkedDates[dateStr],
            marked: true, 
            dotColor: isCompleted ? "green" : "blue", // green if completed, blue if just scheduled
          };
        }
      }

      // Also, if you have a completedDates object, we can forcibly set a check color
      // This ensures we mark any date in completedDates, even if it's in the past
      if (routine.completedDates) {
        Object.keys(routine.completedDates).forEach((dateKey) => {
          // dateKey is "YYYY-MM-DD"
          if (routine.completedDates[dateKey]) {
            // It's completed
            newMarkedDates[dateKey] = {
              ...newMarkedDates[dateKey],
              marked: true,
              dotColor: "green",
            };
          }
        });
      }
    });

    setMarkedDates(newMarkedDates);
  }, [routines]);

  const handleDayPress = useCallback(
    (day) => {
      // day.dateString is in YYYY-MM-DD format
      const dateStr = day.dateString;

      // 1) Find which routines fall on this date
      //    If a routine is weekly-based, check if dayOfWeek is in routine.daysOfWeek
      //    If routine is date-based, check if dateStr is included in the routine's date array or completedDates
      const selectedDate = new Date(dateStr + "T00:00:00");
      const dayOfWeek = selectedDate.getDay(); // 0-6

      const routinesForDay = routines.filter((routine) => {
        // If routine has daysOfWeek
        if (routine.daysOfWeek?.includes(dayOfWeek)) {
          return true;
        }
        // If routine has an explicit list of date strings (not shown in this code),
        // you'd check here as well.
        return false;
      });

      if (routinesForDay.length === 0) {
        Alert.alert("No routine scheduled", `No routine found for ${dateStr}.`);
      } else {
        // Navigate to a screen that shows the routine(s) for that day
        navigation.navigate("View Routines For Day", { dateStr, routinesForDay });
      }
    },
    [routines, navigation]
  );

  return (
    <View style={calendarStyles.container}>
      <Text style={calendarStyles.header}>Routine Calendar</Text>
      <Calendar
        // The min/max dates can be set as needed
        // minDate={getTodayString()}
        // maxDate={"2025-12-31"}
        onDayPress={handleDayPress}
        markedDates={markedDates}
        markingType="dot" // 'dot' or 'multi-dot'
      />
    </View>
  );
}

const calendarStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    marginBottom: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
});
