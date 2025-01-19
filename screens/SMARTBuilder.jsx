import React, { useState, useEffect, useCallback } from 'react';
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
  Keyboard,
  TouchableWithoutFeedback,
  Animated
} from 'react-native';

import DateTimePickerModal from "react-native-modal-datetime-picker";
import { MaterialIcons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import axios from 'axios';
import { EXPO_PUBLIC_OPENAI_API_KEY } from '@env';
import DraggableFlatList from "react-native-draggable-flatlist";

import styles from '../styles/SMARTBuilderStyles';
import { styles as PhaseBuilderStyles } from '../styles/PhaseBuilderStyles';
import FeedbackModal from '../components/FeedbackModal';

// -------------------------------------
// Constants
// -------------------------------------
const DAYS_OF_WEEK = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

// Helper to dismiss keyboard
const dismissKeyboard = () => {
  Keyboard.dismiss();
};

/**
 * =============================================================================
 * CHILD COMPONENT: PhaseRoutineView
 * =============================================================================
 * Shows & edits a single phase's tasks (draggable, time pickers, remove, etc.).
 * Does NOT include day-of-week selection or “Generate Routine” UI.
 * Instead of saving directly to Firestore, it calls back to the parent so the
 * parent can manage & save all phases at once.
 * =============================================================================
 */
function PhaseRoutineView({ phaseIndex, routine, onUpdateRoutine }) {
    const [tasks, setTasks] = useState([]);
    const [expandedTaskId, setExpandedTaskId] = useState(null);
  
    const [isTimePickerVisible, setTimePickerVisible] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [timeField, setTimeField] = useState("");
    const [selectedTime, setSelectedTime] = useState(new Date());
  
    useEffect(() => {
      console.log("Routine in PhaseRoutineView:", routine);
      if (routine && routine.tasks) {
        setTasks(routine.tasks);
      }
    }, [routine]);
  
    // Generate a random ID for tasks
    const generateId = () => Math.random().toString(36).substr(2, 9);
  
    // ---------------------------
    // Event Handlers
    // ---------------------------
    const handleAddTask = () => {
      const newTask = {
        id: generateId(),
        title: "New Task",
        timeRange: { start: "", end: "" },
        description: "",
        isCompleted: false,
      };
      const updated = [newTask, ...tasks];
      setTasks(updated);
      // <-- notify parent
      onUpdateRoutine(phaseIndex, updated);
    };
  
    const handleRemoveTask = (taskId) => {
      const updated = tasks.filter(t => t.id !== taskId);
      setTasks(updated);
      // <-- notify parent
      onUpdateRoutine(phaseIndex, updated);
    };
  
    const toggleTaskCompletion = (taskId) => {
      const updated = tasks.map(task =>
        task.id === taskId
          ? { ...task, isCompleted: !task.isCompleted }
          : task
      );
      setTasks(updated);
      // <-- notify parent
      onUpdateRoutine(phaseIndex, updated);
    };
  
    // const handleDragEnd = ({ data }) => {
    //   setTasks(data);
    //   // <-- notify parent
    //   onUpdateRoutine(phaseIndex, data);
    // };
  
    const handleConfirmTime = (time) => {
      const hours = String(time.getHours()).padStart(2, '0');
      const minutes = String(time.getMinutes()).padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
  
      const updated = tasks.map(task =>
        task.id === selectedTaskId
          ? {
              ...task,
              timeRange: { ...task.timeRange, [timeField]: timeString },
            }
          : task
      );
  
      setTasks(updated);
      // <-- notify parent
      onUpdateRoutine(phaseIndex, updated);
      hideTimePicker();
    };
  
    // ---------------------------
    // Time Picker
    // ---------------------------
    const showTimePicker = (taskId, field) => {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.timeRange[field]) {
        const [hours, minutes] = task.timeRange[field].split(':').map(Number);
        const time = new Date();
        time.setHours(hours);
        time.setMinutes(minutes);
        setSelectedTime(time);
      } else {
        setSelectedTime(new Date());
      }
      setSelectedTaskId(taskId);
      setTimeField(field);
      setTimePickerVisible(true);
    };
  
    const hideTimePicker = () => {
      setTimePickerVisible(false);
      setSelectedTaskId(null);
      setTimeField("");
    };
  
    const formatTimeForDisplay = (timeString) => {
      if (!timeString) return '';
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      return date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };
  
    // ---------------------------
    // Rendering
    // ---------------------------
    const renderItem = useCallback(({ item, drag, isActive }) => {
      const isExpanded = expandedTaskId === item.id;
  
      return (
        <Animated.View
          style={[
            PhaseBuilderStyles.taskItem,
            isActive && PhaseBuilderStyles.draggingTask
          ]}
        >
          <TouchableOpacity
            style={PhaseBuilderStyles.taskHeader}
            onPress={() => setExpandedTaskId(isExpanded ? null : item.id)}
            onLongPress={drag}
          >
            {/* <TouchableOpacity
              style={[
                PhaseBuilderStyles.checkbox,
                item.isCompleted && PhaseBuilderStyles.checkboxCompleted
              ]}
              onPress={() => toggleTaskCompletion(item.id)}
            >
              {item.isCompleted && (
                <MaterialIcons name="check" size={16} color="#fff" />
              )}
            </TouchableOpacity> */}
  
            <View style={PhaseBuilderStyles.taskTitleContainer}>
              <Text
                style={[
                  PhaseBuilderStyles.taskTitle,
                  item.isCompleted && PhaseBuilderStyles.completedText
                ]}
              >
                {item.title}
              </Text>
              <Text style={PhaseBuilderStyles.taskTime}>
                {formatTimeForDisplay(item.timeRange.start)} - {formatTimeForDisplay(item.timeRange.end)}
              </Text>
            </View>
  
            <MaterialIcons
              name={isExpanded ? "expand-less" : "expand-more"}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
  
          {isExpanded && (
            <View style={PhaseBuilderStyles.expandedContent}>
              <TextInput
                style={PhaseBuilderStyles.titleInput}
                value={item.title}
                placeholder="Task title"
                onChangeText={(text) => {
                  const updated = tasks.map(t =>
                    t.id === item.id ? { ...t, title: text } : t
                  );
                  setTasks(updated);
                  // <-- notify parent
                  onUpdateRoutine(phaseIndex, updated);
                }}
              />
  
              <View style={PhaseBuilderStyles.timeInputsContainer}>
                <TouchableOpacity
                  style={PhaseBuilderStyles.timeButton}
                  onPress={() => showTimePicker(item.id, "start")}
                >
                  <MaterialIcons name="access-time" size={20} color="#007AFF" />
                  <Text style={PhaseBuilderStyles.timeButtonText}>
                    {formatTimeForDisplay(item.timeRange.start) || "Start Time"}
                  </Text>
                </TouchableOpacity>
  
                <TouchableOpacity
                  style={PhaseBuilderStyles.timeButton}
                  onPress={() => showTimePicker(item.id, "end")}
                >
                  <MaterialIcons name="access-time" size={20} color="#007AFF" />
                  <Text style={PhaseBuilderStyles.timeButtonText}>
                    {formatTimeForDisplay(item.timeRange.end) || "End Time"}
                  </Text>
                </TouchableOpacity>
              </View>
  
              <TextInput
                style={PhaseBuilderStyles.descriptionInput}
                value={item.description}
                placeholder="Task description"
                multiline
                numberOfLines={3}
                onChangeText={(desc) => {
                  const updated = tasks.map(t =>
                    t.id === item.id ? { ...t, description: desc } : t
                  );
                  setTasks(updated);
                  // <-- notify parent
                  onUpdateRoutine(phaseIndex, updated);
                }}
              />
  
              <TouchableOpacity
                style={PhaseBuilderStyles.removeButton}
                onPress={() => handleRemoveTask(item.id)}
              >
                <MaterialIcons name="delete-outline" size={20} color="#FF3B30" />
                <Text style={PhaseBuilderStyles.removeButtonText}>
                  Remove Task
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      );
    }, [expandedTaskId, tasks]);
  
return (
    <View style={{ marginTop: 10, marginBottom: 10 }}>
      {/* "Add Task" Button */}
      <TouchableOpacity
        style={[PhaseBuilderStyles.addButton, { alignSelf: 'flex-end' }]}
        onPress={handleAddTask}
      >
        <MaterialIcons name="add" size={24} color="#fff" />
        <Text style={PhaseBuilderStyles.addButtonText}>Add Task</Text>
      </TouchableOpacity>

      {/* Render tasks via map instead of DraggableFlatList */}
      {console.log("TASKS:",tasks)}
      {tasks.map((item) => {
        const isExpanded = expandedTaskId === item.id;

        return (
          <Animated.View
            key={item.id}
            style={PhaseBuilderStyles.taskItem}
          >
            {/* Task Header */}
            <TouchableOpacity
              style={PhaseBuilderStyles.taskHeader}
              onPress={() => setExpandedTaskId(isExpanded ? null : item.id)}
            >
              {/* Checkbox */}
              {/* <TouchableOpacity
                style={[
                  PhaseBuilderStyles.checkbox,
                  item.isCompleted && PhaseBuilderStyles.checkboxCompleted
                ]}
                onPress={() => toggleTaskCompletion(item.id)}
              >
                {item.isCompleted && (
                  <MaterialIcons name="check" size={16} color="#fff" />
                )}
              </TouchableOpacity> */}

              {/* Task Title + Time */}
              <View style={PhaseBuilderStyles.taskTitleContainer}>
                <Text
                  style={[
                    PhaseBuilderStyles.taskTitle,
                    item.isCompleted && PhaseBuilderStyles.completedText
                  ]}
                >
                  {item.title}
                </Text>
                <Text style={PhaseBuilderStyles.taskTime}>
                  {formatTimeForDisplay(item.timeRange.start)} - {formatTimeForDisplay(item.timeRange.end)}
                </Text>
              </View>

              {/* Expand / Collapse Icon */}
              <MaterialIcons
                name={isExpanded ? "expand-less" : "expand-more"}
                size={24}
                color="#666"
              />
            </TouchableOpacity>

            {/* Expanded Content */}
            {isExpanded && (
              <View style={PhaseBuilderStyles.expandedContent}>
                {/* Title Input */}
                <TextInput
                  style={PhaseBuilderStyles.titleInput}
                  value={item.title}
                  placeholder="Task title"
                  onChangeText={(text) => {
                    const updated = tasks.map(t =>
                      t.id === item.id ? { ...t, title: text } : t
                    );
                    setTasks(updated);
                    onUpdateRoutine(phaseIndex, updated);
                  }}
                />

                {/* Time Inputs */}
                <View style={PhaseBuilderStyles.timeInputsContainer}>
                  <TouchableOpacity
                    style={PhaseBuilderStyles.timeButton}
                    onPress={() => showTimePicker(item.id, "start")}
                  >
                    <MaterialIcons name="access-time" size={20} color="#007AFF" />
                    <Text style={PhaseBuilderStyles.timeButtonText}>
                      {formatTimeForDisplay(item.timeRange.start) || "Start Time"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={PhaseBuilderStyles.timeButton}
                    onPress={() => showTimePicker(item.id, "end")}
                  >
                    <MaterialIcons name="access-time" size={20} color="#007AFF" />
                    <Text style={PhaseBuilderStyles.timeButtonText}>
                      {formatTimeForDisplay(item.timeRange.end) || "End Time"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Description Input */}
                <TextInput
                  style={PhaseBuilderStyles.descriptionInput}
                  value={item.description}
                  placeholder="Task description"
                  multiline
                  numberOfLines={3}
                  onChangeText={(desc) => {
                    const updated = tasks.map(t =>
                      t.id === item.id ? { ...t, description: desc } : t
                    );
                    setTasks(updated);
                    onUpdateRoutine(phaseIndex, updated);
                  }}
                />

                {/* Remove Task Button */}
                <TouchableOpacity
                  style={PhaseBuilderStyles.removeButton}
                  onPress={() => handleRemoveTask(item.id)}
                >
                  <MaterialIcons name="delete-outline" size={20} color="#FF3B30" />
                  <Text style={PhaseBuilderStyles.removeButtonText}>
                    Remove Task
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        );
      })}
    {/* Time Picker Modal */}
    <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleConfirmTime}
        onCancel={hideTimePicker}
        date={selectedTime}
        isDarkModeEnabled={true}
        textColor={Platform.OS === 'ios' ? "white" : 'white'}
        themeVariant="light"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      />
    </View>
  );
}

/**
 * =============================================================================
 * PARENT COMPONENT: SMARTBuilder
 * =============================================================================
 * - Has the original form for SMART goal, day-of-week selection, date range, etc.
 * - Generates phases with handleGenerateRoutines
 * - Displays collapsible phases
 * - Inside each expanded phase, uses PhaseRoutineView to display tasks
 * - There's a single "Save Plan" button to finalize all phases after editing
 * =============================================================================
 */
export default function SMARTBuilder({ navigation }) {
  // SMART Goal
  const [goal, setGoal] = useState({
    specific: '',
    measurable: '',
    achievable: '',
    relevant: '',
    timeBased: ''
  });

  const questions = [
    {
      key: 'relevance',
      text: 'How relevant are the tasks to your goal?',
      labels: ['Not relevant', 'Very relevant'],
    },
    {
      key: 'timeline',
      text: 'How realistic is the suggested timeline?',
      labels: ['Unrealistic', 'Very realistic'],
    },
    {
      key: 'taskCompleteness',
      text: 'Do the tasks cover everything necessary for your goal?',
      labels: ['Incomplete', 'Complete'],
    },
    {
      key: 'clarity',
      text: 'How clear and easy to follow are the tasks?',
      labels: ['Confusing', 'Very clear'],
    },
  ];  

  // Date range
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [dateType, setDateType] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date()
  });

  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedback, setFeedback] = useState({
    relevance: "1",
    timeline: "1",
    taskCompleteness: "1",
    clarity: "1",
    suggestion: '',
  });

  const handleSubmitFeedback = () => {
    // Handle feedback submission logic (e.g., saving to Firestore)

    const numericFeedback = {
      relevance: Number(feedback.relevance),
      timeline: Number(feedback.timeline),
      taskCompleteness: Number(feedback.taskCompleteness),
      clarity: Number(feedback.clarity),
      suggestion: feedback.suggestion,
    };

    console.log('Feedback submitted:', numericFeedback);
    setFeedbackVisible(false); // Close the feedback form after submission
  };

  function generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // Days of week
  const [selectedDays, setSelectedDays] = useState([]);

  // Generated phases
  const [generatedPhases, setGeneratedPhases] = useState([]);
  const [loading, setLoading] = useState(false);

  // Collapsible
  const [expandedPhaseIndex, setExpandedPhaseIndex] = useState(null);

  const togglePhase = (index) => {
    setExpandedPhaseIndex(index === expandedPhaseIndex ? null : index);
  };

  // Toggle day
  const toggleDaySelection = (dayValue) => {
    setSelectedDays(prev =>
      prev.includes(dayValue)
        ? prev.filter(val => val !== dayValue)
        : [...prev, dayValue]
    );
  };

  // Date pickers
  const showDatePicker = (type) => {
    setDateType(type);
    setDatePickerVisible(true);
  };
  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };
  const handleConfirmDate = (date) => {
    setDateRange(prev => ({
      ...prev,
      [dateType]: date
    }));
    hideDatePicker();
  };

  // Called by child to update tasks for a given phase
  const handleUpdateRoutine = (phaseIndex, updatedTasks) => {
    // console.log("ROUTINE:", phase.routine)
    setGeneratedPhases(prev => {
      const newPhases = [...prev];
      newPhases[phaseIndex] = {
        ...newPhases[phaseIndex],
        routine: {
          ...newPhases[phaseIndex].routine,
          tasks: updatedTasks
        }
      };
      return newPhases;
    });
  };

  // 1) Generate plan from LLM
  const handleGenerateRoutines = async () => {
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
              content: `You are an expert mentor who breaks down complex goals into specific, actionable micro-skills, with clear progression and mastery criteria.

                        Core Philosophy:
                        1. Every skill must be broken down into specific, learnable micro-components
                        2. Each task must teach ONE specific technique/skill that can be practiced and mastered
                        3. Progress must be measurable through concrete outputs or demonstrations
                        4. Tasks build upon each other in a clear sequence

                        Task Structure:
                        1. Each task must specify:
                          - The exact micro-skill being learned
                          - How to practice it (specific exercises/drills)
                          - What success looks like (observable criteria)
                          - How to verify mastery
                          - Required setup/materials
                          - Time to spend practicing

                        Example Breakdown - Public Speaking:
                        ❌ Bad: "Learn audience engagement techniques"
                        ✅ Good: "Master the Figure 8 scanning technique"
                        - Specific Practice:
                          1. Stand in front of mirror
                          3. Add head movement to match eye movement
                          4. Practice with 3 focal points: left, center, right
                          5. Record yourself speaking for 2 minutes using technique
                        - Success Criteria:
                          - Complete 3 full Figure 8 patterns per minute
                          - Maintain natural speaking pace while scanning
                          - Head movement stays subtle (<15 degrees)
                        - Verification:
                          - Record and review video
                          - Get feedback on smoothness of movement
                          - No skipping sections of audience

                        Example Breakdown - Python Web Development:
                        ❌ Bad: "Learn Flask basics"
                        ✅ Good: "Build a single-route Flask application that returns JSON"
                        - Specific Steps:
                          1. Create new Flask project with specific directory structure
                          2. Write function that returns {"status": "success"}
                          3. Add route decorator to function
                          4. Test endpoint with curl/Postman
                          5. Verify JSON is properly formatted
                        - Success Criteria:
                          - Application runs without errors
                          - Returns valid JSON
                          - Follows REST principles
                          - Passes provided test cases
                        - Verification:
                          - All tests pass
                          - Code review checklist complete
                          - Can explain each line's purpose

                        Example Breakdown - Olympic Weightlifting:
                        ❌ Bad: "Practice clean technique"
                        ✅ Good: "Master First Pull Position with PVC pipe"
                        - Specific Practice:
                          1. Set feet at hip width
                          2. Grip PVC at proper clean width
                          3. Push knees back to touch bar
                          4. Maintain back angle for 5 seconds
                          5. Repeat 10 times with perfect form
                        - Success Criteria:
                          - Back maintains 45-degree angle
                          - Bar touches mid-shin
                          - Weight in mid-foot
                          - No early arm bend
                        - Verification:
                          - Record and review form
                          - Coach check-off
                          - Can maintain position under load

                        Phase Types:
                        1. Foundation Phases
                          - Focus: Individual micro-skills
                          - Duration: As long as needed for mastery
                          - Must include specific drills
                          - Clear "done" criteria

                        2. Integration Phases
                          - Focus: Combining mastered micro-skills
                          - Duration: Based on complexity
                          - Must reference specific prior skills
                          - Include structured practice combining skills

                        3. Application Phases
                          - Focus: Real-world implementation
                          - Duration: Project/goal dependent
                          - Must use multiple mastered skills
                          - Include specific success metrics

                        Progress Structure:
                        1. Micro-skill mastery
                          - Each skill has clear "done" criteria
                          - Must be observable/measurable
                          - Includes specific test cases
                          
                        2. Integration checkpoints
                          - Combine specific micro-skills
                          - Clear success criteria
                          - Recorded/observed performance

                        3. Application milestones
                          - Real-world implementation
                          - Specific deliverables
                          - External verification possible

                        Schedule Requirements:
                        1. Practice sessions must focus on ONE specific micro-skill
                        2. Include exact setup instructions
                        3. Specify practice duration
                        4. Include verification method
                        5. Define next step if mastered
                        6. Define remedial step if not mastered`
            },
            {
              role: "user",
              content: `Generate a training plan for this SMART goal:
                Specific: ${goal.specific}
                Measurable: ${goal.measurable}
                Achievable: ${goal.achievable}
                Relevant: ${goal.relevant}
                Time-based: ${goal.timeBased}
                Days: ${selectedDays.map(d => DAYS_OF_WEEK[d].label).join(', ')}
                
                Date Range:
                Start: ${dateRange.start.toISOString()}
                End: ${dateRange.end.toISOString()}
                Total Duration: ${Math.ceil((dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24))} days
                
                Must fit within ${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}.`
            }
          ],
          functions: [
            {
              name: "generate_training_plan",
              description: "Generate a phased training plan with daily routines",
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
            Authorization: `Bearer ${EXPO_PUBLIC_OPENAI_API_KEY}`,
          },
        }
      );

      const functionCall = response.data.choices[0].message.function_call;
      const plan = JSON.parse(functionCall.arguments);
      console.log("AI Plan:", plan);

      if (!plan.phases || !Array.isArray(plan.phases)) {
        throw new Error("Invalid response from AI");
      }

      // Insert selectedDays into each phase's routine (just in case)
      const updatedPhases = plan.phases.map(phase => ({
        ...phase,
        id: generateId(), // Unique ID for each phase
        routine: {
          ...phase.routine,
          daysOfWeek: selectedDays,
          tasks: phase.routine.tasks.map(task => ({
            ...task,
            id: generateId() // Unique ID for each task
          }))
        },
        dateRange: {
          start: new Date(phase.dateRange.start),
          end: new Date(phase.dateRange.end)
        }
      }));      
      

      setGeneratedPhases(updatedPhases);
      setExpandedPhaseIndex(null);

      Alert.alert("Success", "Phases generated! Expand them to edit tasks.");
    } catch (err) {
      console.error("Error generating routines:", err);
      Alert.alert("Error", err.message || "Failed to generate routines.");
    } finally {
      setLoading(false);
    }
  };

  // 2) Once user is done editing tasks in each phase, “Save Plan”
  const handleSavePlan = async () => {
    if (!generatedPhases.length) {
      Alert.alert("No phases", "Generate phases before saving.");
      return;
    }
    try {
      // Reference to the dynamicGoals collection for the current user

      const dynamicGoalRef = collection(db, 'users', auth.currentUser.uid, 'dynamicGoals');
      const goalData = {
        smartGoal: goal,
        dateRange: {
          start: dateRange.start,
          end: dateRange.end
        },
        selectedDays,
        phases: generatedPhases,
        currentPhase: 0,
        createdAt: serverTimestamp(),
      };
      const goalDocRef = await addDoc(dynamicGoalRef, goalData);

      const goalId = goalDocRef.id;
      
      // Reference to the 'routines' subcollection within the newly created goal document
      const routinesRef =  collection(
        db,
        "users",
        auth.currentUser.uid,
        "routines"
      );
      
      // Prepare promises to add each routine directly
      const routinesPromises = generatedPhases.map(phase => {
        const routineData = {
          name: phase.name, // Using phase.name as the routine name
          dateRange: {
            start: phase.dateRange.start.toISOString(),
            end: phase.dateRange.end.toISOString(),
          },
          isRecurring: true,
          tasks: phase.routine.tasks.map(task => ({
            id: task.id,
            title: task.title,
            timeRange: {
              start: task.timeRange.start,
              end: task.timeRange.end,
            },
            description: task.description,
            isCompleted: task.isCompleted,
          })),
          daysOfWeek: phase.routine.daysOfWeek,
          createdAt: serverTimestamp(),
          goalId
        };
        return addDoc(routinesRef, routineData);
      });
      
      // Execute all promises concurrently
      await Promise.all(routinesPromises);
      
      Alert.alert("Plan Saved", "Your entire plan has been saved!");
      // Optionally navigate to another screen
      // navigation.navigate('Calendar');
    } catch (err) {
      console.error("Error saving routines:", err);
      Alert.alert("Error", "Failed to save routines. Please try again.");
    }
  };  

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        nestedScrollEnabled={false}  // allow inner list to scroll
        >

          <Text style={styles.header}>Set the goal, make it happen.</Text>

          {/* SMART Goal Inputs */}
          <View style = {{marginBottom: 20}}>
            <Text style={styles.label}>Specific</Text>
            <TextInput
              style={styles.input}
              placeholder="What do you want to accomplish?"
              placeholderTextColor="#848484"
              value={goal.specific}
              onChangeText={(text) => setGoal(prev => ({ ...prev, specific: text }))}
            />
          </View>

          <View style = {{marginBottom: 20}}>
            <Text style={styles.label}>Measurable</Text>
            <TextInput
              style={styles.input}
              placeholder="How will you measure progress?"
              placeholderTextColor="#848484"
              value={goal.measurable}
              onChangeText={(text) => setGoal(prev => ({ ...prev, measurable: text }))}
            />
          </View>

          {/* <View style={styles.inputContainer}>
            <Text style={styles.label}>Achievable</Text>
            <TextInput
              style={styles.input}
              placeholder="Is this goal realistic?"
              placeholderTextColor="#848484"
              value={goal.achievable}
              onChangeText={(text) => setGoal(prev => ({ ...prev, achievable: text }))}
            />
          </View> */}

          <View style = {{marginBottom: 20}}>
            <Text style={styles.label}>Relevant</Text>
            <TextInput
              style={styles.input}
              placeholder="Why is this goal important?"
              placeholderTextColor="#848484"
              value={goal.relevant}
              onChangeText={(text) => setGoal(prev => ({ ...prev, relevant: text }))}
            />
          </View>

          {/* Date Range */}
          <View >
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

          <View>
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
                    <Text
                      style={[
                        styles.dayButtonText,
                        isSelected && styles.dayButtonTextSelected
                      ]}
                    >
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Generate Button */}
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
                <Text style={styles.generateButtonText}>
                  Create Goal
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Collapsible Phases */}
          {!!generatedPhases.length && (
            <View style={{ marginTop: 20 }}>
              <Text style={styles.header}>Generated Phases</Text>
              {generatedPhases.map((phase, index) => {
                const isExpanded = expandedPhaseIndex === index;
                return (
                  <View key={phase.id} style={PhaseBuilderStyles.phaseContainer}>
                    <TouchableOpacity
                      style={PhaseBuilderStyles.phaseHeader}
                      onPress={() => togglePhase(index)}
                    >
                      <Text style={PhaseBuilderStyles.phaseHeaderText}>
                        {phase.name} ({phase.duration})
                      </Text>
                      <MaterialIcons
                        name={isExpanded ? "expand-less" : "expand-more"}
                        size={24}
                        color="#666"
                      />
                    </TouchableOpacity>

                {isExpanded && (
                    <View style={PhaseBuilderStyles.phaseContent}>
                        {/* Highlighted Section for Date Range and Goal */}
                        <View style={PhaseBuilderStyles.highlightContainer}>
                        <View style={PhaseBuilderStyles.highlightBox}>
                            <MaterialIcons name="date-range" size={20} color="#ffffff" />
                            <Text style={PhaseBuilderStyles.highlightText}>
                            {new Date(phase.dateRange.start).toLocaleDateString()} -{" "}
                            {new Date(phase.dateRange.end).toLocaleDateString()}
                            </Text>
                        </View>
                        <View style={PhaseBuilderStyles.highlightBox}>
                            <MaterialIcons name="flag" size={20} color="#ffffff" />
                            <Text style={PhaseBuilderStyles.highlightText}>
                            {"\n"}
                            {phase.metrics.description}
                            </Text>
                        </View>
                        </View>

                        {/* Routine Editor for Tasks */}
                        {/* {console.log("ROUTINE:", phase.routine)} */}
                        <PhaseRoutineView
                        phaseIndex={index}
                        routine={phase.routine}
                        onUpdateRoutine={handleUpdateRoutine}
                        />
                    </View>
                    )}
                  </View>
                );
              })}

              <FeedbackModal
                visible={feedbackVisible}
                setVisible={setFeedbackVisible}
                questions={questions}
                feedback={feedback}
                setFeedback={setFeedback}
                handleSubmit={handleSubmitFeedback}
                showFeedbackIcon={true}
              />

              {/* Single "Save Plan" button for everything */}
              <TouchableOpacity
                style={[
                  styles.generateButton,
                  { backgroundColor: '#3a5a40', marginTop: 20 }
                ]}
                onPress={handleSavePlan}
              >
                <MaterialIcons name="save" size={24} color="#ffffff" />
                <Text style={styles.generateButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={datePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        date={dateType === 'start' ? dateRange.start : dateRange.end}
        isDarkModeEnabled={true}
        textColor={Platform.OS === "ios" ? "white" : "white"}
        themeVariant="light"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      />
    </SafeAreaView>
  );
}