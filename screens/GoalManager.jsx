import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  query, 
  where,
  addDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase'; // Adjust path as needed
import slateStyles from '../styles/RoutineCalendarStyles';
import FeedbackModal from '../components/FeedbackModal';

export default function GoalManager({ navigation }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Feedback logic / states
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  // Feedback logic / states
  const [feedback, setFeedback] = useState({
    deleteReason: "1",
    managementEase: "1",
    clarity: "1",
    suggestion: '',
  });

  const questions = [
    {
      key: 'deleteReason',
      text: 'If applicable, what is the primary reason for deleting a goal?',
      labels: ['No longer needed', 'Not helpful'],
    },
    {
      key: 'managementEase',
      text: 'How easy was it to manage and view your goals?',
      labels: ['Difficult', 'Very easy'],
    },
    {
      key: 'clarity',
      text: 'How clear was the information provided about each goal?',
      labels: ['Confusing', 'Very clear'],
    },
    {
      key: 'suggestion',
      text: 'Is there anything you\'d like to see in the future for improving goal management?',
    },
  ];
  

  const handleSubmitFeedback = async () => {
    // Handle feedback submission logic (e.g., saving to Firestore)

    const numericFeedback = {
      deleteReason: Number(feedback.deleteReason),
      managementEase: Number(feedback.managementEase),
      clarity: Number(feedback.clarity),
    };

    const fullFeedback = {
      ...numericFeedback,
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


  useEffect(() => {
    fetchGoals();
  }, []);

  async function fetchGoals() {
    setLoading(true);
    try {
      const goalsRef = collection(db, 'users', auth.currentUser.uid, 'dynamicGoals');
      const snapshot = await getDocs(goalsRef);

      const fetchedGoals = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setGoals(fetchedGoals);
    } catch (err) {
      console.log('Error fetching goals:', err);
      Alert.alert('Error', 'Could not fetch goals. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteGoal(goalId) {
    Alert.alert('Delete Goal', 'Are you sure you want to delete this goal and all its associated sub-goals?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            // Reference to the goal document
            const goalDocRef = doc(db, 'users', auth.currentUser.uid, 'dynamicGoals', goalId);
            
            // Delete the goal document
            await deleteDoc(goalDocRef);
            
            // Update local state for goals
            setGoals((prevGoals) => prevGoals.filter((g) => g.id !== goalId));
            
            // Reference to the routines collection and query routines associated with this goal
            const routinesRef = collection(db, 'users', auth.currentUser.uid, 'routines');
            const routinesQuery = query(routinesRef, where('goalId', '==', goalId));
            const routinesSnapshot = await getDocs(routinesQuery);
            
            // Delete each routine associated with the goal
            const deletePromises = routinesSnapshot.docs.map((doc) => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
  
          } catch (err) {
            console.error('Error deleting goal:', err);
            Alert.alert('Error', 'Could not delete goal and its routines. Please try again.');
          }
        },
      },
    ]);
  }
  

  return (
    <SafeAreaView style={slateStyles.safeContainer}>
      <ScrollView
        style={slateStyles.scrollView}
        contentContainerStyle={slateStyles.scrollContent}
      >

        <Text style={slateStyles.header}>My Goals</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#9CA3AF" style={{ marginTop: 20 }} />
        ) : goals.length === 0 ? (
          <View style={slateStyles.emptyState}>
            <Text style={slateStyles.emptyStateText}>No Goals Found</Text>
            <Text style={slateStyles.emptyStateSubtext}>
              You don’t have any Goals yet. Create one to get started!
            </Text>
          </View>
        ) : (
          goals.map((goal) => {
            const { id, smartGoal, dateRange, phases } = goal;
            // Some goals might not have phases if they haven’t been generated yet
            const phaseCount = phases?.length || 0;

            // Convert Firestore Timestamp or string to Date
            const startDate = dateRange.start?.toDate?.() || new Date(dateRange.start);
            const endDate = dateRange.end?.toDate?.() || new Date(dateRange.end);

            return (
              <View key={id} style={slateStyles.routineContainer}>
                <Text style={slateStyles.routineName}>
                  {smartGoal?.specific ?? 'Untitled Goal'}
                </Text>
                <Text style={slateStyles.taskTime}>
                  {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                </Text>
                <Text style={[slateStyles.taskTime, { marginTop: 4 }]}>
                  {phaseCount} Phase{phaseCount === 1 ? '' : 's'}
                </Text>

                {/* View Details Button */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('GoalDetail', { goal })}
                  style={[slateStyles.timeButton, { marginTop: 12 }]}
                >
                  <MaterialIcons name="visibility" size={20} color="#60A5FA" />
                  <Text style={slateStyles.timeButtonText}>View Details</Text>
                </TouchableOpacity>

                {/* Delete Button */}
                <TouchableOpacity
                  onPress={() => handleDeleteGoal(id)}
                  style={[slateStyles.removeButton, { marginTop: 12 }]}
                >
                  <MaterialIcons name="delete" size={20} color="#FF4D4F" />
                  <Text style={slateStyles.removeButtonText}>Delete Goal</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

      </ScrollView>

      <FeedbackModal
          visible={feedbackVisible}
          setVisible={setFeedbackVisible}
          questions={questions}
          feedback={feedback}
          setFeedback={setFeedback}
          handleSubmit={handleSubmitFeedback}
          showFeedbackIcon={true}
        />

    </SafeAreaView>
  );
}
