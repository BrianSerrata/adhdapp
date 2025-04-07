import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Platform
} from 'react-native';
import { 
  Ionicons,
  MaterialCommunityIcons 
} from '@expo/vector-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase'; // Adjust the import path to your Firebase config

const SCREEN_WIDTH = Dimensions.get('window').width;
const TIME_SLOT_HEIGHT = 60;
const TIME_LABEL_WIDTH = 60;

export default function DayCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Generate time slots for the day (6:00 AM to 10:00 PM)
  const timeSlots = [];
  for (let hour = 6; hour < 23; hour++) {
    const formattedHour = hour.toString().padStart(2, '0');
    timeSlots.push(`${formattedHour}:00`);
  }
  
  // Format date for display
  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  
  // Navigate to previous/next day
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };
  
  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };
  
  // Format time for display
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  // Calculate position and height for an event
  const calculateEventStyle = (startTime, endTime) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startPosition = (startHour - 6) * TIME_SLOT_HEIGHT + startMinute;
    const endPosition = (endHour - 6) * TIME_SLOT_HEIGHT + endMinute;
    const duration = endPosition - startPosition;
    
    return {
      top: startPosition,
      height: duration,
    };
  };
  
  // Check if events overlap and calculate width and position
  const getEventColumnPosition = (event) => {
    const [eventStartHour, eventStartMinute] = event.timeRange.start.split(':').map(Number);
    const [eventEndHour, eventEndMinute] = event.timeRange.end.split(':').map(Number);
    const eventStart = eventStartHour * 60 + eventStartMinute;
    const eventEnd = eventEndHour * 60 + eventEndMinute;
    
    // Find overlapping events
    const overlappingEvents = events.filter((e) => {
      if (e.id === event.id) return false;
      
      const [eStartHour, eStartMinute] = e.timeRange.start.split(':').map(Number);
      const [eEndHour, eEndMinute] = e.timeRange.end.split(':').map(Number);
      const eStart = eStartHour * 60 + eStartMinute;
      const eEnd = eEndHour * 60 + eEndMinute;
      
      return (
        (eventStart >= eStart && eventStart < eEnd) ||
        (eventEnd > eStart && eventEnd <= eEnd) ||
        (eventStart <= eStart && eventEnd >= eEnd)
      );
    });
    
    // If no overlapping events, use full width
    if (overlappingEvents.length === 0) {
      return {
        left: 0,
        width: SCREEN_WIDTH - TIME_LABEL_WIDTH,
      };
    }
    
    // Simple algorithm for overlapping events
    const overlapCount = overlappingEvents.length + 1;
    const columnWidth = (SCREEN_WIDTH - TIME_LABEL_WIDTH) / overlapCount;
    
    // Find the first available column
    let column = 0;
    const occupiedColumns = new Set();
    
    overlappingEvents.forEach((e) => {
      // Simplified approach - in a real app you'd need a more sophisticated algorithm
      if (e.id < event.id) {
        occupiedColumns.add(e.id % overlapCount);
      }
    });
    
    while (occupiedColumns.has(column)) {
      column++;
    }
    
    return {
      left: column * columnWidth + TIME_LABEL_WIDTH,
      width: columnWidth,
    };
  };
  
  // Calculate current time indicator position
  const getCurrentTimePosition = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    if (hours < 6 || hours >= 23) {
      return null; // Outside of our displayed time range
    }
    
    return (hours - 6) * TIME_SLOT_HEIGHT + minutes;
  };
  
  const currentTimePosition = getCurrentTimePosition();
  
  // Assign colors based on event type/category (can be customized)
  const getEventColor = (event) => {
    // Simple color assignment based on a property of the event
    // You can implement your own logic here
    const colors = {
      work: '#0ea5e9',     // sky
      personal: '#f59e0b',  // amber
      health: '#4f46e5',    // indigo
      learning: '#8b5cf6',  // violet
      default: '#6b7280',   // gray
    };
    
    // Extract category from the event title or use a category field if available
    const category = event.category || 'default';
    return colors[category] || colors.default;
  };
  
  // Fetch events from Firestore
  const fetchEvents = async () => {
    try {
      // Format date for query
      const dateStart = new Date(selectedDate);
      dateStart.setHours(0, 0, 0, 0);
      
      const dateEnd = new Date(selectedDate);
      dateEnd.setHours(23, 59, 59, 999);
      
      const routinesRef = collection(db, "users", auth.currentUser.uid, "routines");
      const q = query(
        routinesRef, 
        where("date", ">=", dateStart), 
        where("date", "<=", dateEnd)
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedEvents = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Assign ID and category to each event
        data.routine.forEach((event, index) => {
          fetchedEvents.push({
            ...event,
            id: `${doc.id}-${index}`,
            // Determine category from event title or set a default
            category: event.category || 
                      (event.title.toLowerCase().includes('work') ? 'work' : 
                       event.title.toLowerCase().includes('exercise') ? 'health' :
                       event.title.toLowerCase().includes('learn') ? 'learning' : 'personal')
          });
        });
      });
      
      setEvents(fetchedEvents);
    } catch (error) {
      console.error("Error fetching events: ", error);
    }
  };
  
  useEffect(() => {
    fetchEvents();
  }, [selectedDate]);
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
      
      {/* Calendar Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <Text style={styles.subText}>{events.length} events scheduled</Text>
        </View>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={goToPreviousDay}>
            <Ionicons name="chevron-back" size={20} color="#e2e8f0" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton} onPress={goToNextDay}>
            <Ionicons name="chevron-forward" size={20} color="#e2e8f0" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={16} color="#e2e8f0" />
            <Text style={styles.addButtonText}>Add Event</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Calendar Body */}
      <ScrollView style={styles.calendarBody}>
        <View style={styles.calendarContent}>
          {/* Time Labels */}
          <View style={styles.timeLabels}>
            {timeSlots.map((time) => (
              <View key={time} style={styles.timeSlot}>
                <Text style={styles.timeText}>{formatTime(time)}</Text>
              </View>
            ))}
          </View>
          
          {/* Events Grid */}
          <View style={styles.eventsGrid}>
            {/* Time slot grid lines */}
            {timeSlots.map((time) => (
              <View key={time} style={styles.gridLine} />
            ))}
            
            {/* Current time indicator */}
            {currentTimePosition !== null && (
              <View style={[styles.currentTimeLine, { top: currentTimePosition }]}>
                <View style={styles.currentTimeDot} />
              </View>
            )}
            
            {/* Events */}
            {events.map((event) => {
              const eventStyle = calculateEventStyle(
                event.timeRange.start,
                event.timeRange.end
              );
              const columnPosition = getEventColumnPosition(event);
              const color = getEventColor(event);
              
              // Determine if the event is tall enough to display details
              const showTime = eventStyle.height > 50;
              const showDescription = eventStyle.height > 80;
              
              return (
                <TouchableOpacity
                  key={event.id}
                  style={[
                    styles.event,
                    {
                      top: eventStyle.top,
                      height: eventStyle.height,
                      left: columnPosition.left,
                      width: columnPosition.width,
                      borderLeftColor: color,
                      backgroundColor: `${color}20`,
                    },
                  ]}
                  onPress={() => {
                    setSelectedEvent(event);
                    setIsModalVisible(true);
                  }}
                >
                  <Text style={[styles.eventTitle, { color }]} numberOfLines={1}>
                    {event.title}
                  </Text>
                  
                  {showTime && (
                    <Text style={styles.eventTime}>
                      {formatTime(event.timeRange.start)} - {formatTime(event.timeRange.end)}
                    </Text>
                  )}
                  
                  {showDescription && (
                    <Text style={styles.eventDescription} numberOfLines={2}>
                      {event.description}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
      
      {/* Event Detail Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={0.9}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={[
                styles.categoryDot, 
                { backgroundColor: selectedEvent ? getEventColor(selectedEvent) : '#6b7280' }
              ]} />
              <Text style={styles.modalTitle}>{selectedEvent?.title}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.modalDetail}>
                <View>
                  <Text style={styles.modalTime}>
                    {selectedEvent && 
                      `${formatTime(selectedEvent.timeRange.start)} - ${formatTime(selectedEvent.timeRange.end)}`
                    }
                  </Text>
                </View>
                
                <View style={[
                  styles.categoryTag, 
                  { 
                    backgroundColor: selectedEvent 
                      ? `${getEventColor(selectedEvent)}20` 
                      : '#6b728020',
                    borderColor: selectedEvent 
                      ? getEventColor(selectedEvent) 
                      : '#6b7280',
                  }
                ]}>
                  <Text style={[
                    styles.categoryText,
                    { color: selectedEvent ? getEventColor(selectedEvent) : '#6b7280' }
                  ]}>
                    {selectedEvent?.category || 'General'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.modalDescription}>
                {selectedEvent?.description}
              </Text>
              
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.deleteButton}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
  },
  subText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
    marginLeft: 12,
  },
  addButtonText: {
    fontSize: 14,
    color: '#e2e8f0',
    marginLeft: 4,
  },
  calendarBody: {
    flex: 1,
  },
  calendarContent: {
    flexDirection: 'row',
  },
  timeLabels: {
    width: TIME_LABEL_WIDTH,
    borderRightWidth: 1,
    borderRightColor: '#334155',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
  },
  timeSlot: {
    height: TIME_SLOT_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.5)',
  },
  timeText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  eventsGrid: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    height: TIME_SLOT_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.5)',
  },
  currentTimeLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#ef4444',
    zIndex: 10,
  },
  currentTimeDot: {
    position: 'absolute',
    left: -4,
    top: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  event: {
    position: 'absolute',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    overflow: 'hidden',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  eventTime: {
    fontSize: 12,
    color: '#e2e8f0',
    marginTop: 4,
  },
  eventDescription: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  modalDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTime: {
    fontSize: 14,
    color: '#94a3b8',
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalDescription: {
    fontSize: 14,
    color: '#e2e8f0',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalButtonText: {
    fontSize: 14,
    color: '#e2e8f0',
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#ef444420',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#ef4444',
  },
});