import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
} from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from "../styles/RoutineBuilderStyles";

const dismissKeyboard = () => {
  Keyboard.dismiss();
};

export default function RoutineViewer({ route }) {
  const { routine } = route.params || {};
  const [tasks, setTasks] = useState([]);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [timeField, setTimeField] = useState("");
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  useEffect(() => {
    if (routine) {
      setTasks(routine.tasks || []);
    }
  }, [routine]);

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

  const handleConfirm = (time) => {
    const hours = String(time.getHours()).padStart(2, "0");
    const minutes = String(time.getMinutes()).padStart(2, "0");
    const timeString = `${hours}:${minutes}`;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === selectedTaskId
          ? { ...task, timeRange: { ...task.timeRange, [timeField]: timeString } }
          : task
      )
    );
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

  const renderItem = ({ item, drag, isActive }) => {
    const isExpanded = expandedTaskId === item.id;

    return (
      <View
        style={[
          styles.taskItem,
          isActive && styles.draggingTask,
        ]}
      >
        <TouchableOpacity
          style={styles.taskHeader}
          onPress={() => setExpandedTaskId(isExpanded ? null : item.id)}
          onLongPress={drag}
        >
          <TouchableOpacity
            style={[
              styles.checkbox,
              item.isCompleted && styles.checkboxCompleted,
            ]}
            onPress={() => toggleTaskCompletion(item.id)}
          >
            {item.isCompleted && (
              <MaterialIcons name="check" size={16} color="#fff" />
            )}
          </TouchableOpacity>

          <View style={styles.taskTitleContainer}>
            <Text
              style={[
                styles.taskTitle,
                item.isCompleted && styles.completedText,
              ]}
            >
              {item.title}
            </Text>
            <Text style={styles.taskTime}>
              {formatTimeForDisplay(item.timeRange.start)} -{" "}
              {formatTimeForDisplay(item.timeRange.end)}
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
            {/* Title Input */}
            <TextInput
              style={styles.titleInput}
              value={item.title}
              onChangeText={(text) =>
                setTasks(tasks.map((task) =>
                  task.id === item.id ? { ...task, title: text } : task
                ))
              }
            />
            {/* Time Inputs */}
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
            {/* Description Input */}
            <TextInput
              style={styles.descriptionInput}
              value={item.description}
              onChangeText={(text) =>
                setTasks(tasks.map((task) =>
                  task.id === item.id ? { ...task, description: text } : task
                ))
              }
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.header}>{routine.name || "Routine Viewer"}</Text>

          <View style={styles.taskListContainer}>
            <DraggableFlatList
              data={tasks}
              onDragEnd={handleDragEnd}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
            />
          </View>

          <DateTimePickerModal
            isVisible={isTimePickerVisible}
            mode="time"
            onConfirm={handleConfirm}
            onCancel={hideTimePicker}
            date={selectedTime}
          />
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}