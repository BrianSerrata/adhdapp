import { useState } from 'react';
import * as Calendar from 'expo-calendar';
import { Alert } from 'react-native';

/**
 * Hook for deleting routine-related events from the user's calendar
 * @returns {Object} Functions and state for deleting calendar events
 */
export default function deleteFromCalendar() {
  const [isDeleting, setIsDeleting] = useState(false);
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
   * Delete a single event from calendar by its ID
   * @param {string} eventId - Event ID to delete
   * @returns {Promise<boolean>} Whether deletion was successful
   */
  const deleteCalendarEvent = async (eventId) => {
    if (!eventId) return false;
    
    try {
      await Calendar.deleteEventAsync(eventId);
      return true;
    } catch (err) {
      console.error(`Failed to delete event ${eventId}:`, err.message);
      return false;
    }
  };

  /**
   * Delete multiple events from calendar by their IDs
   * @param {Array<string>} eventIds - Array of event IDs to delete
   * @returns {Promise<Object>} Result with success and deletion counts
   */
  const deleteCalendarEvents = async (eventIds) => {
    if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
      return {
        success: false,
        message: 'No event IDs provided',
        count: 0
      };
    }

    setIsDeleting(true);
    setError(null);
    
    try {
      // Ensure we have calendar permission
      const permissionGranted = await ensureCalendarPermission();
      if (!permissionGranted) {
        setIsDeleting(false);
        return { 
          success: false, 
          message: 'Calendar permission not granted',
          count: 0
        };
      }
      
      // Delete each event
      let successCount = 0;
      let failCount = 0;
      
      for (const eventId of eventIds) {
        try {
          const success = await deleteCalendarEvent(eventId);
          if (success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (err) {
          console.error(`Error deleting event ${eventId}:`, err.message);
          failCount++;
        }
      }
      
      const result = {
        success: successCount > 0,
        message: `Deleted ${successCount} of ${eventIds.length} calendar events${
          failCount > 0 ? ` (${failCount} failed)` : ''
        }`,
        count: successCount
      };
      
      setIsDeleting(false);
      return result;
    } catch (err) {
      setError(`Failed to delete calendar events: ${err.message}`);
      setIsDeleting(false);
      return { 
        success: false, 
        message: `Error: ${err.message}`,
        count: 0
      };
    }
  };

  return {
    deleteCalendarEvent,
    deleteCalendarEvents,
    isDeleting,
    error
  };
}