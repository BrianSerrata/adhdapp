// TODO: implement time-formatting, task not deleting when delete button pressed

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  SafeAreaView,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { auth, db } from '../firebase';
import { collection, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import DraggableFlatList from 'react-native-draggable-flatlist';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import styles from '../styles/RoutineManagerStyles';
import Animated, { FadeInDown } from 'react-native-reanimated';

const RoutineManager = () => {
  const [routines, setRoutines] = useState([]);
  const [expandedRoutineId, setExpandedRoutineId] = useState(null);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [timeField, setTimeField] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState(null);


  // Fetch routines
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users', auth.currentUser.uid, 'routines'),
      (snapshot) => {
        const loadedRoutines = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRoutines(loadedRoutines);
      }
    );

    return () => unsubscribe();
  }, []);

  // Expand/Collapse Routine
  const toggleExpandRoutine = (routineId) => {
    setExpandedRoutineId((prevId) => (prevId === routineId ? null : routineId));
  };

  // Edit Task
  const handleTaskEdit = (routineId, taskId, field, value) => {
    setRoutines((prevRoutines) =>
      prevRoutines.map((routine) =>
        routine.id === routineId
          ? {
              ...routine,
              tasks: routine.tasks.map((task) =>
                task.id === taskId
                  ? {
                      ...task,
                      [field]: field === 'timeRange'
                        ? { ...task.timeRange, ...value }
                        : value,
                    }
                  : task
              ),
            }
          : routine
      )
    );
  };

  // Save Routine
  const saveRoutine = async (routineId, updatedTasks) => {
    try {
      const routineRef = doc(db, 'users', auth.currentUser.uid, 'routines', routineId);
      await updateDoc(routineRef, { tasks: updatedTasks });
      Alert.alert('Success', 'Routine saved successfully.');
    } catch (error) {
      console.error('Error saving routine:', error);
      Alert.alert('Error', 'Failed to save routine.');
    }
  };

  // Delete Routine
  const deleteRoutine = async (routineId) => {
    Alert.alert('Delete Routine', 'Are you sure you want to delete this routine?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const routineRef = doc(db, 'users', auth.currentUser.uid, 'routines', routineId);
            await deleteDoc(routineRef);
            setRoutines((prev) => prev.filter((routine) => routine.id !== routineId));
          } catch (error) {
            console.error('Error deleting routine:', error);
            Alert.alert('Error', 'Failed to delete routine.');
          }
        },
      },
    ]);
  };

  const showTimePicker = (routineId, taskId, field) => {
    const routine = routines.find((r) => r.id === routineId);
    const task = routine?.tasks.find((t) => t.id === taskId);

    if (task?.timeRange?.[field]) {
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

  const handleConfirm = (time) => {
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    setTasks(prev =>
      prev.map(task =>
        task.id === selectedTaskId
          ? { ...task, timeRange: { ...task.timeRange, [timeField]: timeString } }
          : task
      )
    );
    hideTimePicker();
  };

  const renderTask = ({ item: task, drag, isActive }) => {
    const isExpanded = task.id === expandedTaskId;
  
    return (
      <Animated.View
        style={[styles.taskItem, isActive && styles.draggingTask]}
        entering={FadeInDown.duration(500).delay(200)}
      >
        <TouchableOpacity
          style={styles.taskHeader}
          onPress={() => setExpandedTaskId(isExpanded ? null : task.id)}
          onLongPress={drag}
        >
          <TouchableOpacity
            style={[styles.checkbox, task.isCompleted && styles.checkboxCompleted]}
            onPress={() => handleTaskEdit(expandedRoutineId, task.id, 'isCompleted', !task.isCompleted)}
          >
            {task.isCompleted && <MaterialIcons name="check" size={16} color="#fff" />}
          </TouchableOpacity>
  
          <View style={styles.taskTitleContainer}>
            <Text
              style={[
                styles.taskTitle,
                task.isCompleted && styles.completedText,
              ]}
            >
              {task.title}
            </Text>
            <Text style={styles.taskTime}>
              {task.timeRange?.start || 'Not Set'} - {task.timeRange?.end || 'Not Set'}
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
            <TextInput
              style={styles.titleInput}
              value={task.title}
              placeholder="Task title"
              onChangeText={(text) =>
                handleTaskEdit(expandedRoutineId, task.id, 'title', text)
              }
            />
  
            <View style={styles.timeInputsContainer}>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => showTimePicker(expandedRoutineId, task.id, 'start')}
              >
                <MaterialIcons name="access-time" size={20} color="#007AFF" />
                <Text style={styles.timeButtonText}>
                {task.timeRange?.start || 'Start Time'}
                </Text>
              </TouchableOpacity>
  
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => showTimePicker(expandedRoutineId, task.id, 'end')}
              >
                <MaterialIcons name="access-time" size={20} color="#007AFF" />
                <Text style={styles.timeButtonText}>
                    {task.timeRange?.end || 'End Time'}
                </Text>
              </TouchableOpacity>
            </View>
  
            <TextInput
              style={styles.descriptionInput}
              value={task.description}
              placeholder="Task description"
              multiline
              numberOfLines={3}
              onChangeText={(text) =>
                handleTaskEdit(expandedRoutineId, task.id, 'description', text)
              }
            />
  
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveTask(expandedRoutineId, task.id)}
            >
              <MaterialIcons name="delete-outline" size={20} color="#FF3B30" />
              <Text style={styles.removeButtonText}>Remove Task</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    );
  };

  // TODO: implement functinality to add tasks to independent routines
  const handleAddTask = () => {
    const newTask = {
      id: generateId(),
      title: "New Task",
      timeRange: { start: "", end: "" },
      description: "Description of the task.",
      isCompleted: false,
    };
    setTasks([newTask, ...tasks]);
  };
  const handleRemoveTask = (routineId, taskId) => {
    setRoutines((prevRoutines) =>
      prevRoutines.map((routine) =>
        routine.id === routineId
          ? {
              ...routine,
              tasks: routine.tasks.filter((task) => task.id !== taskId),
            }
          : routine
      )
    );
  
    // Persist changes
    const routine = routines.find((r) => r.id === routineId);
    if (routine) {
      saveRoutine(routineId, routine.tasks.filter((task) => task.id !== taskId));
    }
  };
  

  const renderRoutine = ({ item: routine }) => {
    const isExpanded = routine.id === expandedRoutineId;

    return (
      <View style={styles.routineContainer}>
        <TouchableOpacity style={styles.routineHeader} onPress={() => toggleExpandRoutine(routine.id)}>
          <Text style={styles.routineTitle}>{routine.name}</Text>
          <MaterialIcons name={isExpanded ? 'expand-less' : 'expand-more'} size={24} color="#fff" />
        </TouchableOpacity>
        {isExpanded && (
          <DraggableFlatList
            data={routine.tasks}
            onDragEnd={({ data }) => {
              handleTaskEdit(routine.id, null, 'tasks', data);
              saveRoutine(routine.id, data);
            }}
            keyExtractor={(task) => task.id}
            renderItem={renderTask}
            contentContainerStyle={styles.taskList}
          />
        )}
            <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteRoutine(routine.id)}
            >
            <MaterialIcons name="delete" size={24} color="#ff5252" />
            <Text style={styles.removeButtonText}>Delete Routine</Text>
            </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={routines}
        renderItem={renderRoutine}
        keyExtractor={(routine) => routine.id}
        contentContainerStyle={styles.routineList}
      />
        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          onConfirm={handleConfirm}
          onCancel={hideTimePicker}
          date={selectedTime}
          isDarkModeEnabled={true}
          textColor={Platform.OS === "ios" ? undefined : "#000"}
          themeVariant="light"
          display={Platform.OS === "ios" ? "spinner" : "default"}
        />
    </SafeAreaView>
  );
};

export default RoutineManager;
