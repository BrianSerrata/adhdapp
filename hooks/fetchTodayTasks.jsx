import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { Alert } from 'react-native';
import { auth,db } from '../firebase';

export const fetchTodayTasks = () => {
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!auth.currentUser) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const dayOfWeek = today.getDay(); // 0-6 (Sunday-Saturday)
    
    // Reference to user's routines
    const routinesRef = collection(db, 'users', auth.currentUser.uid, 'routines');
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(
      routinesRef,
      (snapshot) => {
        try {
          const fetchedRoutines = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Filter routines applicable for today
          const routinesForToday = fetchedRoutines.filter(routine => {
            // Non-recurring routines for today
            if (!routine.isRecurring && routine.createdDate === todayStr) {
              return true;
            }
            
            // Recurring routines scheduled for today's day of week
            if (routine.isRecurring && routine.daysOfWeek?.includes(dayOfWeek)) {
              // Check if today is within date range (if specified)
              if (routine.dateRange) {
                const startDate = new Date(routine.dateRange.start);
                const endDate = new Date(routine.dateRange.end);
                if (!(today >= startDate && today <= endDate)) {
                  return false;
                }
              }
              return true;
            }
            
            return false;
          });
          
          // Extract tasks from applicable routines
          const allTasks = [];
          
          routinesForToday.forEach(routine => {
            const routineTasks = routine.tasks.map(task => ({
              ...task,
              routineId: routine.id,
              routineName: routine.name,
              isCompleted: routine.completedDates?.[todayStr]?.[task.id] || false
            }));
            
            allTasks.push(...routineTasks);
          });
          
          setTodayTasks(allTasks);
          setLoading(false);
        } catch (err) {
          console.error('Error processing routines:', err);
          setError('Failed to process routines');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching routines:', err);
        setError('Failed to fetch routines');
        setLoading(false);
      }
    );
    
    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);
  
  return {
    todayTasks,
    pendingTasksCount: todayTasks.filter(task => !task.isCompleted).length,
    completedTasksCount: todayTasks.filter(task => task.isCompleted).length,
    loading,
    error
  };
};