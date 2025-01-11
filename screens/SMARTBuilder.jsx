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
  const [generatedPhases, setGeneratedPhases] = useState(null);

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
              model: "gpt-4-1106-preview", // Use a model that supports function calling
              messages: [
                {
                  role: "system",
                  content: `You are a helpful assistant that generates structured, phased training plans with daily routines.
                  Each phase must follow these rules:
                  
                  1. Phase Structure:
                     - Each phase should have a clear focus and progression
                     - Phases should have appropriate durations (e.g., 2-4 weeks)
                     - Phase date ranges must fit within the user's specified start and end dates
                     - Phases should progress logically (e.g., Foundation → Building → Mastery)
                  
                  2. Daily Routine Rules for Each Phase:
                     - Tasks must be completable within a single day
                     - Include 6-8 hours max of activities per day
                     - Ensure 15-30 minute breaks between tasks
                     - Limit intense tasks to 1-2 hours
                     - Use realistic times (5 AM - 10 PM)
                     - Time format must be "HH:mm"
                     - Tasks should flow logically within the day
                  
                  3. Progress Tracking:
                     - Each phase needs clear, measurable metrics
                     - Metrics should show progression across phases
                     - Include specific target values for measurement`
                },
                {
                  role: "user",
                  content: `Generate a training plan for the following SMART goal:
                  Specific: ${goal.specific}
                  Measurable: ${goal.measurable}
                  Achievable: ${goal.achievable}
                  Relevant: ${goal.relevant}
                  Time-based: ${goal.timeBased}
                  Use these user-selected days: ${selectedDays.map(day => DAYS_OF_WEEK[day].label).join(', ')}
                  
                  Time Constraints:
                  - Start Date: ${dateRange.start.toISOString()}
                  - End Date: ${dateRange.end.toISOString()}
                  - Total Duration: ${Math.ceil((dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24))} days
                  
                  Schedule on these days: ${selectedDays.map(day => DAYS_OF_WEEK[day].label).join(', ')}
                  
                  Important: All phases MUST fit within the given date range. No phase can start before ${dateRange.start.toLocaleDateString()} or end after ${dateRange.end.toLocaleDateString()}.`
                }
              ],
              functions: [
                {
                  name: "generate_training_plan",
                  description: "Generate a structured, phased training plan with daily routines",
                  parameters: {
                    type: "object",
                    properties: {
                      phases: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            duration: { type: "string" },
                            dateRange: {
                              type: "object",
                              properties: {
                                start: { type: "string", format: "date-time" },
                                end: { type: "string", format: "date-time" }
                              },
                              required: ["start", "end"]
                            },
                            routine: {
                              type: "object",
                              properties: {
                                tasks: {
                                  type: "array",
                                  items: {
                                    type: "object",
                                    properties: {
                                      title: { type: "string" },
                                      timeRange: {
                                        type: "object",
                                        properties: {
                                          start: { type: "string", pattern: "^([01]\\d|2[0-3]):[0-5]\\d$" },
                                          end: { type: "string", pattern: "^([01]\\d|2[0-3]):[0-5]\\d$" }
                                        },
                                        required: ["start", "end"]
                                      },
                                      description: { type: "string" },
                                      isCompleted: { type: "boolean" }
                                    },
                                    required: ["title", "timeRange", "description", "isCompleted"]
                                  }
                                },
                                daysOfWeek: { type: "array", items: { type: "string" } }
                              },
                              required: ["tasks", "daysOfWeek"]
                            },
                            metrics: {
                              type: "object",
                              properties: {
                                targetValue: { type: "number" },
                                description: { type: "string" }
                              },
                              required: ["targetValue", "description"]
                            }
                          },
                          required: ["name", "duration", "dateRange", "routine", "metrics"]
                        }
                      }
                    },
                    required: ["phases"]
                  }
                }
              ],
              function_call: { name: "generate_training_plan" },
              temperature: 0.7
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`,
              },
            }
          );
          
          // Parse the response
          const functionCall = response.data.choices[0].message.function_call;
          const plan = JSON.parse(functionCall.arguments);    
          console.log("Parsed training plan:", plan);   
    
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

      // After parsing the response and before saving to Firebase:
      setGeneratedPhases(plan.phases);
  
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