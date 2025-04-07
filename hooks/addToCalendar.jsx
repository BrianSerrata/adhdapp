import { useState } from 'react';
import * as Calendar from 'expo-calendar';
import { Alert } from 'react-native';

/**
 * Hook for adding routine tasks to the user's calendar
 * @returns {Object} Functions for adding events to calendar
 */
export default function addToCalendar() {
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Requests calendar permissions if needed
   * @returns {Promise<boolean>} Whether permission was granted
   */
  const ensureCalendarPermission = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      setError(`Permission error: ${err.message}`);
      return false;
    }
  };

  /**
   * Gets device default calendar
   * @returns {Promise<string|null>} Calendar ID or null
   */
  const getDefaultCalendarId = async () => {
    try {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      if (calendars && calendars.length > 0) {
        // Find the default calendar - first try to get the primary calendar
        const primaryCalendar = calendars.find(cal => cal.isPrimary);
        if (primaryCalendar) return primaryCalendar.id;
        
        // Otherwise default to the first calendar
        return calendars[0].id;
      } else {
        setError('No calendars found on device');
        return null;
      }
    } catch (err) {
      setError(`Calendar error: ${err.message}`);
      return null;
    }
  };

  /**
   * Adds a single task to the calendar
   * @param {Object} task - Task to add to calendar
   * @param {Date} date - Date to add the task on
   * @param {string} calendarId - Calendar ID to add to
   * @returns {Promise<string|null>} Event ID or null if failed
   */
  const addTaskToCalendar = async (task, date, calendarId) => {
    try {
      let startDate, endDate;
      
      if (task?.timeRange?.start && task?.timeRange?.end) {
        // Handle tasks with time ranges
        const [startHours, startMinutes] = task.timeRange.start.split(':').map(Number);
        const [endHours, endMinutes] = task.timeRange.end.split(':').map(Number);
        
        startDate = new Date(date);
        startDate.setHours(startHours, startMinutes, 0, 0);
        
        endDate = new Date(date);
        endDate.setHours(endHours, endMinutes, 0, 0);
      } else {
        // Handle tasks without time ranges - make them all-day events
        startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        
        endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
      }
      
      // Create event details
      const eventDetails = {
        title: task.title,
        startDate: startDate,
        endDate: endDate,
        notes: task.description || '',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        allDay: !task?.timeRange?.start, // Set as all-day event if no time range
        alarms: task.reminders ? task.reminders.map(minutes => ({ 
          relativeOffset: -minutes,
          method: Calendar.AlarmMethod.ALERT 
        })) : []
      };
      
      // Create event in calendar
      const eventId = await Calendar.createEventAsync(calendarId, eventDetails);
      return eventId;
    } catch (err) {
      console.error(`Error adding task to calendar: ${err.message}`);
      return null;
    }
  };

  /**
   * Adds all tasks in a routine to the calendar
   * @param {Array} tasks - Array of tasks to add
   * @param {Date|string} date - Date to add tasks on (Date object or ISO string)
   * @param {boolean} isRecurring - Whether the routine is recurring
   * @param {Array} daysOfWeek - Array of days of week for recurring routines
   * @returns {Promise<Object>} Result with success and events info
   */
  const addRoutineToCalendar = async (tasks, date, isRecurring = false, daysOfWeek = []) => {
    if (!tasks || tasks.length === 0) {
      return { success: false, message: 'No tasks provided' };
    }
    
    setIsAdding(true);
    setError(null);
    
    try {
      // Ensure we have calendar permission
      const permissionGranted = await ensureCalendarPermission();
      if (!permissionGranted) {
        setIsAdding(false);
        return { 
          success: false, 
          message: 'Calendar permission not granted' 
        };
      }
      
      // Get the default calendar ID
      const calendarId = await getDefaultCalendarId();
      if (!calendarId) {
        setIsAdding(false);
        return { 
          success: false, 
          message: 'Could not find a default calendar' 
        };
      }
      
      // Convert date string to Date object if needed
      let taskDate;
      if (typeof date === 'string') {
        // Parse the date string correctly (format: YYYY-MM-DD)
        const [year, month, day] = date.split('-').map(Number);
        // Month is 0-based in JavaScript Date (0 = January)
        taskDate = new Date(year, month - 1, day);
      } else {
        taskDate = new Date(date);
      }
      
      if (isNaN(taskDate.getTime())) {
        setIsAdding(false);
        return { 
          success: false, 
          message: 'Invalid date provided' 
        };
      }
      
      // Ensure we're working with a clean date (no time component affecting the day)
      taskDate.setHours(0, 0, 0, 0);
      
      // For one-time routine, simply add all tasks
      if (!isRecurring) {
        const eventIds = [];
        for (const task of tasks) {
          const eventId = await addTaskToCalendar(task, taskDate, calendarId);
          if (eventId) eventIds.push(eventId);
        }
        
        setIsAdding(false);
        return { 
          success: true, 
          message: `Added ${eventIds.length} of ${tasks.length} tasks to calendar`,
          eventIds,
          calendarEvents: eventIds.map((eventId, index) => ({
            eventId,
            taskId: tasks[index].id,
            title: tasks[index].title
          }))
        };
      } 
      // For recurring routines, add tasks for each selected day of week
      else {
        if (!daysOfWeek || daysOfWeek.length === 0) {
          setIsAdding(false);
          return { 
            success: false, 
            message: 'No days selected for recurring routine' 
          };
        }
        
        const eventIds = [];
        let addedCount = 0;
        
        // We'll add tasks for the next 4 weeks
        const numberOfWeeks = 4;
        const today = new Date();
        
        for (let week = 0; week < numberOfWeeks; week++) {
          for (const dayOfWeek of daysOfWeek) {
            // Calculate the next occurrence of this day
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + ((dayOfWeek + 7 - today.getDay()) % 7) + (week * 7));
            
            // Add each task for this day
            for (const task of tasks) {
              const eventId = await addTaskToCalendar(task, targetDate, calendarId);
              if (eventId) {
                eventIds.push(eventId);
                addedCount++;
              }
            }
          }
        }
        
        // Create a mapping between eventIds and tasks
        const calendarEvents = [];
        let taskIndex = 0;
        
        for (const eventId of eventIds) {
          const taskId = tasks[taskIndex % tasks.length].id;
          const taskTitle = tasks[taskIndex % tasks.length].title;
          
          calendarEvents.push({
            eventId,
            taskId,
            title: taskTitle
          });
          
          taskIndex++;
        }
        
        setIsAdding(false);
        return { 
          success: true, 
          message: `Added ${addedCount} tasks across ${daysOfWeek.length} days for ${numberOfWeeks} weeks`,
          eventIds,
          calendarEvents
        };
      }
    } catch (err) {
      setError(`Failed to add to calendar: ${err.message}`);
      setIsAdding(false);
      return { 
        success: false, 
        message: err.message 
      };
    }
  };

  return {
    addRoutineToCalendar,
    isAdding,
    error
  };
}