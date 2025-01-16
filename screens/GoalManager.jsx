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
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase'; // Adjust path as needed
import slateStyles from '../styles/RoutineCalendarStyles';

export default function GoalManager({ navigation }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);

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
    try {
      const goalDocRef = doc(db, 'users', auth.currentUser.uid, 'dynamicGoals', goalId);
      await deleteDoc(goalDocRef);

      setGoals((prevGoals) => prevGoals.filter((g) => g.id !== goalId));

      Alert.alert('Goal Deleted', 'The goal has been removed from the database.');
    } catch (err) {
      console.error('Error deleting goal:', err);
      Alert.alert('Error', 'Could not delete goal. Please try again.');
    }
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
                  <Text style={slateStyles.removeButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
