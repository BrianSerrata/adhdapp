import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { auth, db } from '../firebase';
import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  addDoc
} from 'firebase/firestore';
import debounce from 'lodash.debounce'; // Install lodash.debounce
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import styles from '../styles/RoutineManagerStyles';
import slateStyles from '../styles/RoutineCalendarStyles';
import FeedbackModal from '../components/FeedbackModal';

import { trackTaskRemoved,
         trackRoutineDeleted
 } from '../backend/apis/segment';

// Utility function to generate a random ID for new tasks
const generateId = () => Math.random().toString(36).substr(2, 9);

const RoutineManager = () => {
  const [routines, setRoutines] = useState([]);
  const [expandedRoutineId, setExpandedRoutineId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Time picker state
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [timeField, setTimeField] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  // Feedback logic / states
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedback, setFeedback] = useState({
    managementEase: "1",
    clarity: "1",
    deleteReason: "1",
    suggestion: '',
  });

  const questions = [
    {
      key: 'managementEase',
      text: 'How easy was it to manage and view your routines?',
      labels: ['Difficult', 'Very easy'],
    },
    {
      key: 'clarity',
      text: 'How clear was the information provided about each routine?',
      labels: ['Confusing', 'Very clear'],
    },
    {
      key: 'deleteReason',
      text: 'If applicable, what is the primary reason for deleting a routine?',
    },
    {
      key: 'suggestion',
      text: 'Is there anything you\'d like to see in the future for improving routine management?',
    },
  ];
  

  const handleSubmitFeedback = async () => {
    // Handle feedback submission logic (e.g., saving to Firestore)

    const numericFeedback = {
      managementEase: Number(feedback.managementEase),
      clarity: Number(feedback.clarity),
    };

    const fullFeedback = {
      ...numericFeedback,
      deleteReason: feedback.deleteReason,
      suggestion: feedback.suggestion,
      timestamp: new Date().toISOString(),
    };
  
    const feedbackRef = collection(
      db,
      'users',
      auth.currentUser.uid,
      'feedback' // Name of the feedback collection
    );
  
      // Save to Firestore
      await addDoc(feedbackRef, fullFeedback);
  
      console.log('Feedback successfully submitted to Firestore:', fullFeedback);  
      setFeedbackVisible(false); // Close the feedback form after submission
  };

  const debounceUpdate = useRef(
    debounce(async (routineId, updatedTasks) => {
      const routineRef = doc(db, 'users', auth.currentUser.uid, 'routines', routineId);
      try {
        await updateDoc(routineRef, { tasks: updatedTasks });
      } catch (error) {
        console.error('Error updating routine:', error);
        Alert.alert('Error', 'Failed to update routine.');
      }
    }, 500)
  ).current;

  // ------------------ Fetch Routines ------------------
  useEffect(() => {
    setLoading(true)
    const unsubscribe = onSnapshot(
      collection(db, 'users', auth.currentUser.uid, 'routines'),
      (snapshot) => {
        const loadedRoutines = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((routine) => !routine.dateRange); // Exclude routines with dateRange
        setRoutines(loadedRoutines);
        setLoading(false)
      }
    );

    return () => unsubscribe();
  }, []);

  // ------------------ Expand/Collapse Routine ------------------
  const toggleExpandRoutine = (routineId) => {
    setExpandedRoutineId((prevId) => (prevId === routineId ? null : routineId));
  };

  // ------------------ Utility: Format Time for Display ------------------
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

  const handleConfirmTime = async (time) => {
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    setRoutines((prevRoutines) =>
      prevRoutines.map((routine) =>
        routine.id === expandedRoutineId
          ? {
              ...routine,
              tasks: routine.tasks.map((task) =>
                task.id === selectedTaskId
                  ? {
                      ...task,
                      timeRange: {
                        ...task.timeRange,
                        [timeField]: timeString,
                      },
                    }
                  : task
              ),
            }
          : routine
      )
    );

    // Save updated tasks to Firestore
    const routine = routines.find((r) => r.id === expandedRoutineId);
    if (routine) {
      try {
        const routineRef = doc(
          db,
          'users',
          auth.currentUser.uid,
          'routines',
          expandedRoutineId
        );
        await updateDoc(routineRef, {
          tasks: routine.tasks.map((task) =>
            task.id === selectedTaskId
              ? {
                  ...task,
                  timeRange: {
                    ...task.timeRange,
                    [timeField]: timeString,
                  },
                }
              : task
          ),
        });
      } catch (error) {
        console.error('Error updating task time:', error);
        Alert.alert('Error', 'Failed to update task time.');
      }
    }
    setTimePickerVisible(false);
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


  // ------------------ Edit Task Field ------------------
  const handleTaskEdit = async (routineId, taskId, field, value) => {
    setRoutines((prevRoutines) =>
      prevRoutines.map((routine) =>
        routine.id === routineId
          ? {
              ...routine,
              tasks: routine.tasks.map((task) =>
                task.id === taskId
                  ? field === 'timeRange'
                    ? {
                        ...task,
                        timeRange: {
                          ...task.timeRange,
                          ...value,
                        },
                      }
                    : { ...task, [field]: value }
                  : task
              ),
            }
          : routine
      )
    );
    const routine = routines.find((r) => r.id === routineId);
    if (routine) {
      const updatedTasks = routine.tasks.map((task) =>
        task.id === taskId
          ? field === 'timeRange'
            ? {
                ...task,
                timeRange: {
                  ...task.timeRange,
                  ...value,
                },
              }
            : { ...task, [field]: value }
          : task
      );
      debounceUpdate(routineId, updatedTasks);
    }
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

  // ------------------ Delete Routine ------------------
  const deleteRoutine = async (routineId) => {
    Alert.alert('Delete Routine', 'Are you sure you want to delete this routine?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const routineRef = doc(
              db,
              'users',
              auth.currentUser.uid,
              'routines',
              routineId
            );
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

  // ------------------ Render a Single Task ------------------
  const renderTask = ({ item: task }) => {
    const isExpanded = task.id === expandedTaskId;

    return (
      <Animated.View
        style={styles.taskItem}
        entering={FadeInDown.duration(500).delay(200)}
      >
        <TouchableOpacity
          style={styles.taskHeader}
          onPress={() => setExpandedTaskId(isExpanded ? null : task.id)}
        >
          <View style={styles.taskTitleContainer}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskTime}>
              {formatTimeForDisplay(task.timeRange?.start)} -{' '}
              {formatTimeForDisplay(task.timeRange?.end)}
            </Text>
          </View>

          <MaterialIcons
            name={isExpanded ? 'expand-less' : 'expand-more'}
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
                  {formatTimeForDisplay(task.timeRange?.start) || 'Start Time'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => showTimePicker(expandedRoutineId, task.id, 'end')}
              >
                <MaterialIcons name="access-time" size={20} color="#007AFF" />
                <Text style={styles.timeButtonText}>
                  {formatTimeForDisplay(task.timeRange?.end) || 'End Time'}
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

  // ------------------ Render a Single Routine ------------------
  const renderRoutine = ({ item: routine }) => {
    const isExpanded = routine.id === expandedRoutineId;

    return (
      <View style={styles.routineContainer}>
        <TouchableOpacity
          style={styles.routineHeader}
          onPress={() => toggleExpandRoutine(routine.id)}
        >
          <Text style={styles.routineTitle}>{routine.name}</Text>
          <MaterialIcons
            name={isExpanded ? 'expand-less' : 'expand-more'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        {isExpanded && (
          <FlatList
            data={routine.tasks}
            keyExtractor={(task) => task.id}
            renderItem={renderTask}
            contentContainerStyle={styles.taskList}
          />
        )}

        <TouchableOpacity
          style={[styles.removeButton, {marginTop: 12}]}
          onPress={() => deleteRoutine(routine.id)}
        >
          <MaterialIcons name="delete" size={24} color="#FF4D4F" />
          <Text style={styles.removeButtonText}>Delete Routine</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={slateStyles.safeContainer}>
      <FlatList
        ListHeaderComponent={<Text style={slateStyles.header}>My Routines</Text>}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#9CA3AF" style={{ marginTop: 20 }} />
          ) : (
            <View style={slateStyles.emptyState}>
              <Text style={slateStyles.emptyStateText}>No Routines Found</Text>
              <Text style={slateStyles.emptyStateSubtext}>
                You don’t have any routines yet. Create one to get started!
              </Text>
            </View>
          )
        }
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={renderRoutine}
        contentContainerStyle={routines.length === 0 ? { flexGrow: 1 } : null}
      />

            <FeedbackModal
                visible={feedbackVisible}
                setVisible={setFeedbackVisible}
                questions={questions}
                feedback={feedback}
                setFeedback={setFeedback}
                handleSubmit={handleSubmitFeedback}
                showFeedbackIcon={true}
            />

      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleConfirmTime}
        onCancel={() => setTimePickerVisible(false)}
        date={selectedTime}
        isDarkModeEnabled
        textColor={Platform.OS === 'ios' ? 'white' : 'white'}
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      />
    </SafeAreaView>
  );
};

export default RoutineManager;
