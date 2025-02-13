import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";

import Animated, { FadeInDown } from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

import {
  doc,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";
import styles from "../styles/RoutineCalendarStyles";
import { trackTaskCompletionToggled,
         trackRoutineCompleted,
 } from "../backend/apis/segment";

const TaskRow = ({ routine, task, selectedDate, expandedTaskId, setExpandedTaskId, formatTimeForDisplay, showTimePicker, triggerConfetti }) => {

    const soundFiles = [
        require('../assets/pop.mp3'),
      ];
    
    // Completion logic
    const isCompleted = routine.completedDates?.[selectedDate]?.[task.id] === true;

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
      <Animated.View style={styles.taskItem} entering={FadeInDown.duration(1000).delay(200)}>
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

  export default TaskRow