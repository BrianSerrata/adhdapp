import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutUp,
  Layout,
} from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";

// This component only displays 3 tasks at a time
export default function LimitedTaskList({
  routine,
  tasks,
  selectedDate,
  toggleTaskCompletion,
  renderTaskRow,
}) {
  // Keep track of which tasks are currently visible
  const [visibleTasks, setVisibleTasks] = useState(() => tasks.slice(0, 3));

  // Keep track of the “cursor” or index of next task to reveal
  const [nextIndex, setNextIndex] = useState(3);

  // Called when a task is completed
  const handleTaskCompletion = (taskId) => {
    // We'll call the parent toggle logic
    toggleTaskCompletion(routine, taskId);

    // Animate the removal of the completed task from visibleTasks
    // and reveal a new one if available
    setVisibleTasks((prev) => {
      const filtered = prev.filter((t) => t.id !== taskId);

      // If we have more tasks in the queue
      if (nextIndex < tasks.length) {
        // Add the next task
        const nextTask = tasks[nextIndex];
        setNextIndex((prevIndex) => prevIndex + 1);
        return [...filtered, nextTask];
      }
      return filtered;
    });
  };

  return (
    <Animated.View
      style={{ marginTop: 10 }}
      // Layout automatically animates reordering, insertion, removal
      // Combined with fade out or fade in props
      layout={Layout.springify()}
    >
      {visibleTasks.map((task) => (
        <Animated.View
          key={task.id}
          entering={FadeInDown.delay(150)}
          exiting={FadeOutUp}
          style={{ marginBottom: 10 }}
        >
          {/* We reuse your existing <TaskRow> logic or custom row */}
          {renderTaskRow(routine, task, () => handleTaskCompletion(task.id))}
        </Animated.View>
      ))}

      {/* (Optional) "Up next" preview if there's more tasks */}
      {nextIndex < tasks.length && (
        <View style={styles.upNextContainer}>
          <Text style={styles.upNextText}>
            {tasks.length - nextIndex} more tasks up next...
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  upNextContainer: {
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#2F3541",
  },
  upNextText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
});
