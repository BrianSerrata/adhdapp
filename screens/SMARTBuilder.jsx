import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { MaterialIcons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import axios from 'axios';
import { OPENAI_API_KEY } from '@env';
import styles from '../styles/SMARTBuilderStyles';

// Days of week constants
const DAYS_OF_WEEK = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

const SMARTBuilder = ({ navigation }) => {
  // SMART Goal state
  const [goal, setGoal] = useState({
    specific: '',
    measurable: '',
    achievable: '',
    relevant: '',
    timeBased: ''
  });

  // Date picker state
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [dateType, setDateType] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date()
  });

  // Days of week selection state
  const [selectedDays, setSelectedDays] = useState([]);

  const [loading, setLoading] = useState(false);

  const toggleDaySelection = (dayValue) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayValue)) {
        return prev.filter((val) => val !== dayValue);
      } else {
        return [...prev, dayValue];
      }
    });
  };

  const handleGenerateRoutines = async () => {
    // Add validation for selected days
    if (!goal.specific || !goal.measurable || !dateRange.start || !dateRange.end || selectedDays.length === 0) {
      Alert.alert('Missing Information', 'Please fill in all required fields and select at least one day of the week');
      return;
    }
  
    setLoading(true);
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Generate a phased training plan with routines. Return JSON in this format: {\"phases\": [{\"name\": \"Phase 1 - Foundation\",\"duration\": \"2 weeks\",\"routine\": {\"tasks\": [{\"title\": \"string\",\"timeRange\": {\"start\": \"string\",\"end\": \"string\"},\"description\": \"string\",\"isCompleted\": false}],\"daysOfWeek\": [0,1,2,3,4,5,6]},\"metrics\": {\"targetValue\": \"number\",\"description\": \"string\"}}]}"
            },
            {
              role: "user",
              content: `Generate a training plan for: ${goal.specific}. Schedule for days: ${selectedDays.map(day => DAYS_OF_WEEK[day].label).join(', ')}`
            }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );
  
      console.log("OpenAI raw response:", response.data.choices[0].message.content);
      let plan = JSON.parse(response.data.choices[0].message.content);
      
      if (!plan.phases || !Array.isArray(plan.phases)) {
        throw new Error("Invalid response format from AI");
      }
      
      // Update each phase's routine to use the selected days
      plan.phases = plan.phases.map(phase => ({
        ...phase,
        routine: {
          ...phase.routine,
          daysOfWeek: selectedDays // Override with user-selected days
        }
      }));
  
      const dynamicGoalRef = collection(db, 'users', auth.currentUser.uid, 'dynamicGoals');
      const goalData = {
        smartGoal: goal,
        dateRange: {
          start: dateRange.start,
          end: dateRange.end
        },
        selectedDays, // Save selected days
        phases: plan.phases,
        currentPhase: 0,
        createdAt: serverTimestamp(),
      };
  
      await addDoc(dynamicGoalRef, goalData);
      Alert.alert('Success', 'Dynamic goal created successfully!');
      navigation.navigate('Calendar');
  
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Failed to generate routines. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showDatePicker = (type) => {
    setDateType(type);
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirm = (date) => {
    setDateRange(prev => ({
      ...prev,
      [dateType]: date
    }));
    hideDatePicker();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Create Dynamic Goal</Text>

        {/* Existing SMART goal inputs */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Specific</Text>
          <TextInput
            style={styles.input}
            placeholder="What do you want to accomplish?"
            placeholderTextColor="#848484"
            value={goal.specific}
            onChangeText={(text) => setGoal(prev => ({ ...prev, specific: text }))}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Measurable</Text>
          <TextInput
            style={styles.input}
            placeholder="How will you measure progress?"
            placeholderTextColor="#848484"
            value={goal.measurable}
            onChangeText={(text) => setGoal(prev => ({ ...prev, measurable: text }))}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Achievable</Text>
          <TextInput
            style={styles.input}
            placeholder="Is this goal realistic?"
            placeholderTextColor="#848484"
            value={goal.achievable}
            onChangeText={(text) => setGoal(prev => ({ ...prev, achievable: text }))}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Relevant</Text>
          <TextInput
            style={styles.input}
            placeholder="Why is this goal important?"
            placeholderTextColor="#848484"
            value={goal.relevant}
            onChangeText={(text) => setGoal(prev => ({ ...prev, relevant: text }))}
          />
        </View>

        {/* Days of Week Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Schedule Days</Text>
          <View style={styles.daysContainer}>
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = selectedDays.includes(day.value);
              return (
                <TouchableOpacity
                  key={day.value}
                  style={[
                    styles.dayButton,
                    isSelected && styles.dayButtonSelected
                  ]}
                  onPress={() => toggleDaySelection(day.value)}
                >
                  <Text style={[
                    styles.dayButtonText,
                    isSelected && styles.dayButtonTextSelected
                  ]}>
                    {day.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Time Range */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Time Range</Text>
          <View style={styles.dateContainer}>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => showDatePicker('start')}
            >
              <MaterialIcons name="calendar-today" size={20} color="#3d5afe" />
              <Text style={styles.dateButtonText}>
                {dateRange.start.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => showDatePicker('end')}
            >
              <MaterialIcons name="calendar-today" size={20} color="#3d5afe" />
              <Text style={styles.dateButtonText}>
                {dateRange.end.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.generateButton}
          onPress={handleGenerateRoutines}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <MaterialIcons name="auto-awesome" size={24} color="#ffffff" />
              <Text style={styles.generateButtonText}>Generate Dynamic Goal</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      <DateTimePickerModal
        isVisible={datePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        date={dateType === 'start' ? dateRange.start : dateRange.end}
        isDarkModeEnabled={false}
        textColor={Platform.OS === 'ios' ? undefined : '#000'}
        themeVariant="light"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      />
    </SafeAreaView>
  );
};

export default SMARTBuilder;