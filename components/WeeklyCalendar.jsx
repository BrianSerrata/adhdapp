import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const WeeklyCalendar = ({ onDayPress, markedDates }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);

  useEffect(() => {
    generateWeekDays(selectedDate);
  }, [selectedDate]);

  const generateWeekDays = (date) => {
    const curr = new Date(date);
    const week = [];
    
    // Starting from Sunday (or Monday if you prefer)
    curr.setDate(curr.getDate() - curr.getDay());
    
    for (let i = 0; i < 7; i++) {
      week.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    
    setWeekDays(week);
  };

  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };
  

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const handleDaySelect = (date) => {
    setSelectedDate(date);
    if (onDayPress) {
      onDayPress(formatDate(date));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() - 7);
            setSelectedDate(newDate);
          }}
          style={styles.arrowCircle}
        >
          <Text style={styles.arrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.monthText}>
          {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>

        <TouchableOpacity
          onPress={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + 7);
            setSelectedDate(newDate);
          }}
          style={styles.arrowCircle}
        >
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.weekDays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Text key={day} style={styles.weekDayText}>
            {day}
          </Text>
        ))}
      </View>
      
      <View style={styles.daysGrid}>
        {weekDays.map((date) => {
          const dateStr = formatDate(date);
          const isSelected = formatDate(selectedDate) === dateStr;
          const hasMarker = markedDates && markedDates[dateStr];
          
          return (
            <TouchableOpacity
              key={dateStr}
              onPress={() => handleDaySelect(date)}
              style={[
                styles.dayButton,
                isSelected && styles.selectedDay
              ]}
            >
              <Text style={[
                styles.dayText,
                isSelected && styles.selectedDayText,
                isToday(date) && !isSelected && styles.todayText
              ]}>
                {date.getDate()}
              </Text>
              {hasMarker && (
                <View style={[
                  styles.dot,
                  isSelected && styles.selectedDot
                ]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#171717',
    borderRadius: 15,
    padding: 16,
    marginHorizontal: 16,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  arrow: {
    color: '#60A5FA',
    fontSize: 24,
  },
  monthText: {
    color: '#feffff',
    fontSize: 20,
    fontFamily: 'Comic Sans',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekDayText: {
    color: '#feffff',
    fontSize: 14,
    fontFamily: 'DM Sans',
    flex: 1,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: '14%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedDay: {
    backgroundColor: '#002c5c',
    width: 36,  // Ensure the width and height are the same for a perfect circle
    height: 36,
    borderRadius: 18, // Half of width/height to make it a circle
    justifyContent: 'center',
    alignItems: 'center',
  },  
  dayText: {
    color: '#feffff',
    fontSize: 16,
    fontFamily: 'DM Sans',
  },
  selectedDayText: {
    color: '#ffffff',
  },
  todayText: {
    color: '#FF9800',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#60A5FA',
    marginTop: 4,
  },
  selectedDot: {
    backgroundColor: '#ffffff',
  },
  arrowCircle: {
    width: 25, // Adjust the size for a cute circle
    height: 25,
    borderRadius: 20, // Ensures the shape is circular
    backgroundColor: "#d4d3d2", // Choose a color that fits your theme
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8, // Space between arrows and text
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4, // Adds a slight shadow effect for depth
  },
  arrow: {
    color: "#171717",
    fontSize: 15, // Adjust arrow size
    fontWeight: "bold",
  },  
});

export default WeeklyCalendar;