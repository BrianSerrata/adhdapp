import React, { useEffect } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import useFetchUserCalendar from '../hooks/fetchUserCalendar';

export default function CalendarToggle({ isEnabled, onToggle, onEventsLoaded }) {
  const { events, loading, error, hasPermission, requestPermission } = useFetchUserCalendar();
  
  // When events load or change, pass them to parent
  useEffect(() => {
    if (isEnabled && onEventsLoaded) {
      onEventsLoaded(events);
    }
    console.log('Events:', events);
  }, [isEnabled, events, onEventsLoaded]);
  
  const handleToggle = async (value) => {
    // If turning on and no permission, request it
    if (value && !hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        // If permission denied, don't turn on the toggle
        return;
      }
    }
    
    // Call the parent component's toggle handler
    onToggle(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconTextContainer}>
        <MaterialIcons 
          name="event" 
          size={24} 
          color="#fff" 
          style={styles.icon} 
        />
        <Text style={styles.text}>Plan around my calendar</Text>
        <Switch
          value={isEnabled}
          onValueChange={handleToggle}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  infoContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoText: {
    color: '#dadada',
    fontSize: 14,
    fontStyle: 'italic',
  }
});