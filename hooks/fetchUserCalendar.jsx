import { useState, useEffect, useRef } from 'react';
import * as Calendar from 'expo-calendar';

export default function useFetchUserCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [calendarId, setCalendarId] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  
  // Use ref to prevent multiple initialization attempts
  const initialized = useRef(false);

  // Request calendar permissions
  const requestCalendarPermission = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        setHasPermission(true);
        return true;
      } else {
        setError('Calendar permission not granted');
        return false;
      }
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Get device calendars and set default
  const getDeviceCalendars = async () => {
    try {
      if (!hasPermission) {
        const permissionGranted = await requestCalendarPermission();
        if (!permissionGranted) return null;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      if (calendars && calendars.length > 0) {
        // Default to first calendar (usually device default)
        setCalendarId(calendars[0].id);
        return calendars[0].id;
      } else {
        setError('No calendars found on device');
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Throttle ref to prevent too frequent API calls
  const lastFetchTime = useRef(0);
  
  // Fetch today's events
  const fetchTodayEvents = async (id = null) => {
    // Add throttling to prevent excessive API calls
    const now = Date.now();
    if (now - lastFetchTime.current < 2000) { // 2 second throttle
      return;
    }
    lastFetchTime.current = now;
    
    try {
      setLoading(true);
      setError(null);
      
      // Use provided id or get default calendar id
      const calId = id || calendarId || await getDeviceCalendars();
      
      if (!calId) {
        setLoading(false);
        return;
      }
      
      // Set time range to today only
      const currentDate = new Date();
      const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const endOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
      
      const fetchedEvents = await Calendar.getEventsAsync(
        [calId],
        startOfDay,
        endOfDay
      );
      
      // Use function form of setEvents to avoid issues with stale state
      setEvents(fetchedEvents || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initialize on component mount - with protection against multiple initializations
  useEffect(() => {
    if (initialized.current) return;
    
    const initCalendar = async () => {
      initialized.current = true;
      const permissionGranted = await requestCalendarPermission();
      if (permissionGranted) {
        const id = await getDeviceCalendars();
        if (id) {
          fetchTodayEvents(id);
        }
      }
    };
    
    initCalendar();
    
    return () => {
      initialized.current = false;
    };
  }, []);

  // Format event time helper
  const formatEventTime = (event) => {
    const start = new Date(event.startDate);
    return start.toLocaleString();
  };

  return {
    events,
    loading,
    error,
    hasPermission,
    refreshEvents: fetchTodayEvents,
    requestPermission: requestCalendarPermission,
    formatEventTime
  };
}