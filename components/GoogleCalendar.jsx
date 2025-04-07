import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert } from 'react-native';
import * as Calendar from 'expo-calendar';

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calendarId, setCalendarId] = useState(null);

  // Get permission and access calendar
  const getCalendarPermission = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status === 'granted') {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      console.log('Calendars:', calendars);
      // Find the default calendar (usually the first one)
      const defaultCalendar = calendars[0];
      if (defaultCalendar) {
        setCalendarId(defaultCalendar.id);
        fetchEvents(defaultCalendar.id);
      } else {
        Alert.alert('No calendars found', 'No calendars were found on your device');
      }
    } else {
      Alert.alert('Permission required', 'Calendar permission is required to view your events');
    }
  };

  // Fetch events for the next 7 days
  const fetchEvents = async (id) => {
    try {
      setLoading(true);
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(now.getDate()); // 7 days from now
      
      const fetchedEvents = await Calendar.getEventsAsync(
        [id],
        now,
        endDate
      );

      console.log('Fetched events:', fetchedEvents)
      
      setEvents(fetchedEvents);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch calendar events');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCalendarPermission();
  }, []);

  const refreshEvents = () => {
    if (calendarId) {
      fetchEvents(calendarId);
    } else {
      getCalendarPermission();
    }
  };

  // Format date for display
  const formatEventTime = (event) => {
    const start = new Date(event.startDate);
    return start.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <Button 
        title="Refresh Calendar Events" 
        onPress={refreshEvents}
        color="#3d5afe"
      />
      
      {loading ? (
        <Text style={styles.loadingText}>Loading events...</Text>
      ) : events.length > 0 ? (
        <View style={styles.eventsContainer}>
          <Text style={styles.eventsTitle}>Upcoming Events ({events.length})</Text>
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.eventItem}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventTime}>{formatEventTime(item)}</Text>
                {item.location && (
                  <Text style={styles.eventLocation}>{item.location}</Text>
                )}
              </View>
            )}
          />
        </View>
      ) : (
        <Text style={styles.noEventsText}>No upcoming events found</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
  },
  noEventsText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
  },
  eventsContainer: {
    marginTop: 15,
    flex: 1,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  eventItem: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  eventTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  }
});