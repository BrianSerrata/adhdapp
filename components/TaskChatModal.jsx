import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  Pressable
} from 'react-native';
import { Checkbox } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { fetchTodayTasks } from '../hooks/fetchTodayTasks';
import { formatTimeForDisplay } from '../utils/utils';

export const TaskChatModal = ({onDiscussTask}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const { todayTasks, loading, error } = fetchTodayTasks();
  
  // Mark task as completed
  const toggleTaskCompletion = (taskId, routineId) => {
    // This would connect to your Firebase update logic
    console.log('Toggle task completion:', taskId, routineId);
    // You would update Firestore here
  };
  
  // Function to handle discuss action
  const handleDiscussTask = (task) => {
    setModalVisible(false); // Close modal after selecting task to discuss
    if (onDiscussTask) {
        onDiscussTask(task)
    }
  };
  
  const pendingTasks = todayTasks.filter(task => !task.isCompleted);
  const completedTasks = todayTasks.filter(task => task.isCompleted);
  
  // Function to render a single task
  const renderTask = (task) => (
    <View key={task.id} style={[styles.taskItem, task.isCompleted && styles.completedTask]}>
      <View style={styles.taskHeader}>
        <View style={styles.checkboxContainer}>
          <Text style={[
            styles.taskTitle, 
            task.isCompleted && styles.completedText
          ]}>
            {task.name || task.title}
          </Text>
        </View>
      </View>

      {/* Task Description */}
      {task.description && (
        <Text style={styles.taskDescription}>{task.description}</Text>
      )}
      
      <View style={styles.taskFooter}>
        <View style={styles.timeInfo}>
          <View style={styles.timeItem}>
            <Ionicons name="time-outline" size={12} color="#666" />
            <Text style={styles.timeText}>{formatTimeForDisplay(task.timeRange.start) || '9:00 AM'}</Text>
          </View>
          <View style={styles.timeItem}>
            <Ionicons name="calendar-outline" size={12} color="#666" />
            <Text style={styles.timeText}>Today</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.discussButton}
          onPress={() => handleDiscussTask(task)}
        >
          <Ionicons name="chatbubble-outline" size={12} color="#60A5FA" />
          <Text style={styles.discussText}>Discuss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <View>
      <TouchableOpacity 
        style={styles.showTasksButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>View Tasks</Text>
      </TouchableOpacity>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Today's Tasks</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#60A5FA" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
                onPress={() => setActiveTab('pending')}
              >
                <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
                  Pending ({pendingTasks.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
                onPress={() => setActiveTab('completed')}
              >
                <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
                  Completed ({completedTasks.length})
                </Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.tasksList}>
              {loading ? (
                <Text style={styles.statusMessage}>Loading tasks...</Text>
              ) : error ? (
                <Text style={styles.errorMessage}>{error}</Text>
              ) : activeTab === 'pending' ? (
                pendingTasks.length > 0 ? (
                  pendingTasks.map(renderTask)
                ) : (
                  <Text style={styles.statusMessage}>No pending tasks for today</Text>
                )
              ) : (
                completedTasks.length > 0 ? (
                  completedTasks.map(renderTask)
                ) : (
                  <Text style={styles.statusMessage}>No completed tasks yet</Text>
                )
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
    showTasksButton: {
      backgroundColor: '#3d5afe',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 15,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    buttonText: {
      color: '#D1D5DB',
      fontWeight: '600',
      fontSize: 15,
      fontFamily: "DM Sans",
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
      width: '90%',
      maxHeight: '80%',
      backgroundColor: '#171717',
      borderRadius: 15,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FFFFFF',
      fontFamily: "DM Sans",
    },
    tabContainer: {
      flexDirection: 'row',
      marginBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#2B3039',
    },
    tab: {
      paddingVertical: 10,
      paddingHorizontal: 15,
      marginRight: 10,
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: '#4A90E2',
    },
    tabText: {
      color: '#9CA3AF',
      fontWeight: '500',
    },
    activeTabText: {
      color: '#60A5FA',
      fontWeight: '600',
    },
    tasksList: {
      maxHeight: '80%',
    },
    taskItem: {
      padding: 16,
      borderRadius: 15,
      marginBottom: 16,
      backgroundColor: '#252525',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    completedTask: {
      backgroundColor: '#1F1F1F',
    },
    taskHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    taskTitle: {
      fontSize: 16,
      fontWeight: '500',
      flex: 1,
      color: '#D1D5DB',
    },
    taskDescription: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 6,
        lineHeight: 20,
      },
    completedText: {
      textDecorationLine: 'line-through',
      color: '#9CA3AF',
    },
    priorityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: '#2e2e2e',
    },
    priorityText: {
      fontSize: 12,
      fontWeight: '500',
      color: '#60A5FA',
    },
    taskFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    timeInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    timeItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 12,
    },
    timeText: {
      fontSize: 12,
      color: '#9CA3AF',
      marginLeft: 4,
    },
    discussButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: '#242424',
    },
    discussText: {
      fontSize: 12,
      color: '#60A5FA',
      marginLeft: 4,
    },
    statusMessage: {
      textAlign: 'center',
      padding: 20,
      color: '#9CA3AF',
    },
    errorMessage: {
      textAlign: 'center',
      padding: 20,
      color: '#FF4D4F',
    },
  });