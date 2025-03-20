import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
  Dimensions
} from 'react-native';

import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import axios from 'axios';
import { auth, db } from '../firebase';
import { collection, addDoc, onSnapshot, doc, updateDoc, getDoc, deleteDoc, query, where, connectFirestoreEmulator } from 'firebase/firestore';
import styles from '../styles/LifeCoachStyles';
import { EXPO_PUBLIC_OPENAI_API_KEY } from '@env';
import Markdown from 'react-native-markdown-display';
import FeedbackModal from '../components/FeedbackModal';
import { TaskChatModal } from '../components/TaskChatModal';
import * as Notifications from 'expo-notifications';
import HTMLParser from 'react-native-html-parser';

import {
  trackMessageSent,
  trackAIResponse,
  trackConversationDuration,
  trackCoachTabOpened} from '../backend/apis/segment';

const LifeCoach = ({ navigation, route }) => {

const SuggestionCard = ({ topic, onSelect }) => {
  return (
    <TouchableOpacity style={styles.suggestionCard} onPress={() => onSelect(topic)}>
      <View style={styles.gradientBackground}> 
        <Text style={styles.suggestionText}>{topic}</Text>
      </View>
    </TouchableOpacity>
  );
};


  const [showSuggestions, setShowSuggestions] = useState(true); // Track visibility of suggestions

  const topicMessages = {
    'Schedule a Reminder': "I'd like to schedule a reminder",
    'Create a Routine': "I'd like to create a routine",
    'Need Help with Tasks': "I need some help with my tasks for  today",
  };
  
  const handleTopicSelect = (selectedTopic) => {
    const message = topicMessages[selectedTopic]; // Get the predefined message
    if (message) {
      handleSend(message)
      setShowSuggestions(false); // Optionally hide suggestions after selection
    }
  };

  const resource = route.params?.resource;
  const isResourceChat = !!resource;

  const [resourceText, setResourceText] = useState("")
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [name, setName] = useState("");
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const flatListRef = useRef(null);

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [oneOffRoutines, setOneOffRoutines] = useState([]);
  const [recurringRoutines, setRecurringRoutines] = useState([]);

  const handleDiscussTask = (task) => {
    console.log("break")
    console.log("TRASK IN CHAT",task)
    // Format the task information as you want it to appear in the input box
    const taskDiscussText = `I need help with my task ${task.title}.\n\nTask details: ${task.description}`
    
    // Set the formatted text as the input value
    setInput(taskDiscussText);
  };

  // Feedback states
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedback, setFeedback] = useState({
    personalization: "1", // How personalized was the advice?
    usefulness: "1", // How useful was the advice?
    clarity: "1", // How clear and easy to follow was the advice?
    motivation: "1", // How motivating was the coach?
    actionability: "1", // Were the recommendations actionable?
    overallSatisfaction: "1", // Overall experience with the coach
    improvementSuggestions: '', // Open-ended improvement suggestions
    coachingPurpose: '', // Open-ended: What did you use the coach for?
    coachingFuture: '',
  });

  const questions = [
    {
      key: 'personalization',
      text: 'How personalized did the advice feel to your situation?',
      labels: ['Not at all', 'Very personalized'],
    },
    {
      key: 'usefulness',
      text: 'How useful was the advice provided by the coach?',
      labels: ['Not useful', 'Very useful'],
    },
    {
      key: 'clarity',
      text: 'How clear and easy to follow was the advice?',
      labels: ['Confusing', 'Very clear'],
    },
    {
      key: 'motivation',
      text: 'How motivated did the coach make you feel to take action?',
      labels: ['Not motivated', 'Very motivated'],
    },
    {
      key: 'actionability',
      text: 'Were the coach\'s recommendations actionable?',
      labels: ['Not actionable', 'Very actionable'],
    },
    {
      key: 'overallSatisfaction',
      text: 'Overall, how satisfied were you with the coaching session?',
      labels: ['Not satisfied', 'Very satisfied'],
    },
    {
      key: 'improvementSuggestions',
      text: 'What could be improved about the coaching experience?',
    },
    {
      key: 'coachingPurpose',
      text: 'What did you use the coach for in this session?',
    },
    {
      key: 'coachingFuture',
      text: 'What do you hope to see out of the coach in the future?',
    },
  ];

  useEffect(() => {
    if (route.params?.newChat && route.params?.resource) {
      // If we're coming from a resource selection, create a new conversation
      createNewConversation();
    } else {
      // Otherwise, load existing conversations or create one if none exist
      const unsubscribe = fetchConversations();
      return () => unsubscribe();
    }
  }, []);

  const handleSubmitFeedback = async () => {
    // Convert numeric feedback to numbers
    const numericFeedback = {
      personalization: Number(feedback.personalization),
      usefulness: Number(feedback.usefulness),
      clarity: Number(feedback.clarity),
      motivation: Number(feedback.motivation),
      actionability: Number(feedback.actionability),
      overallSatisfaction: Number(feedback.overallSatisfaction),
    };
  
    // Include open-ended feedback
    const fullFeedback = {
      ...numericFeedback,
      improvementSuggestions: feedback.improvementSuggestions,
      coachingPurpose: feedback.coachingPurpose,
      coachingFuture: feedback.coachingFuture,
      timestamp: new Date().toISOString(),
    };
  
    const feedbackRef = collection(
      db,
      'users',
      auth.currentUser.uid,
      'feedback' // Name of the feedback collection
    );
  
      // Save to Firestore
      await addDoc(feedbackRef, fullFeedback);
  
      console.log('Feedback successfully submitted to Firestore:', fullFeedback);  
  
    // Reset modal visibility or provide user feedback
    setFeedbackVisible(false);
  };

  useEffect(() => {
    const fetchTodayTasks = () => {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; // 'YYYY-MM-DD'
      const todayDayIndex = today.getDay(); // 0 (Sunday) to 6 (Saturday)
  
      const routinesRef = collection(db, 'users', auth.currentUser.uid, 'routines');
  
      // Query for One-Off Routines
      const oneOffQuery = query(routinesRef, where('createdDate', '==', formattedDate));
  
      // Query for Recurring Routines
      const recurringQuery = query(routinesRef, where('daysOfWeek', 'array-contains', todayDayIndex));
  
      // Listener for One-Off Routines
      const unsubscribeOneOff = onSnapshot(oneOffQuery, (snapshot) => {
        const loadedOneOffRoutines = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOneOffRoutines(loadedOneOffRoutines);
      }, (error) => {
        console.error('Error fetching one-off routines:', error);
        Alert.alert('Error', 'Failed to fetch one-off routines.');
      });
  
      // Listener for Recurring Routines
      const unsubscribeRecurring = onSnapshot(recurringQuery, (snapshot) => {
        const loadedRecurringRoutines = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecurringRoutines(loadedRecurringRoutines);
      }, (error) => {
        console.error('Error fetching recurring routines:', error);
        Alert.alert('Error', 'Failed to fetch recurring routines.');
      });
  
      // Cleanup listeners on unmount
      return () => {
        unsubscribeOneOff();
        unsubscribeRecurring();
      };
    };
  
    fetchTodayTasks();
  }, []); // Only run fetch logic once on mount
  
  // Combine tasks whenever `oneOffRoutines` or `recurringRoutines` changes
  useEffect(() => {
    const combineTasks = () => {
      const allTasks = [];
  
      // Extract tasks from One-Off Routines
      oneOffRoutines.forEach((routine) => {
        if (routine.tasks && Array.isArray(routine.tasks)) {
          routine.tasks.forEach((task) => {
            if (task && typeof task === 'object' && task.id) {
              allTasks.push(task);
            } else {
              console.warn('Invalid task detected:', task);
            }
          });
        } else {
          console.warn('Routine has no tasks or tasks is not an array:', routine);
        }
      });
  
      // Extract tasks from Recurring Routines
      recurringRoutines.forEach((routine) => {
        if (routine.tasks && Array.isArray(routine.tasks)) {
          routine.tasks.forEach((task) => {
            if (task && typeof task === 'object' && task.id) {
              allTasks.push(task);
            } else {
              console.warn('Invalid task detected:', task);
            }
          });
        }
      });
  
      setTasks(allTasks);
      setTasksLoading(false);
    };
  
    combineTasks();
  }, [oneOffRoutines, recurringRoutines]); // Run this effect whenever routines change   


  // useEffect(() => {
  //   // Track "Resources Tab Opened" when the component mounts
  //   trackCoachTabOpened({
  //     userId: auth.currentUser.uid,
  //     timestamp: new Date().toISOString(),
  //   });
  // }, []);

  useEffect(() => {
    const unsubscribe = fetchConversations();
    return () => unsubscribe();
  }, []);

  const conversationStartTimeRef = useRef(null);

  // Effect to handle tracking when activeConversationId changes
  useEffect(() => {
    // If there's an active conversation, set its start time
    if (activeConversationId) {
      const currentConv = conversations.find(conv => conv.id === activeConversationId);
      conversationStartTimeRef.current = currentConv?.startTime?.toDate() || new Date();
    }

    // Cleanup function to run when activeConversationId changes or component unmounts
    return () => {
      if (activeConversationId && conversationStartTimeRef.current) {
        const endTime = new Date();
        const startTime = conversationStartTimeRef.current;
        const durationSeconds = Math.floor((endTime - startTime) / 1000);

        trackConversationDuration({
          userId: auth.currentUser.uid,
          conversationId: activeConversationId,
          durationSeconds,
          timestamp: endTime.toISOString(),
        });

        // Reset the start time
        conversationStartTimeRef.current = null;
      }
    };
  }, [activeConversationId, conversations]);

  const fetchConversations = () => {
    const conversationsRef = collection(db, 'users', auth.currentUser.uid, 'conversations');

    const unsubscribe = onSnapshot(conversationsRef, async (snapshot) => {
      const loadedConversations = snapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().messages?.[0]?.text?.slice(0, 30) || 'New Conversation',
        timestamp: doc.data().createdAt?.toDate() || new Date(),
        ...doc.data(),
      }));

      // Sort conversations by timestamp, newest first
      loadedConversations.sort((a, b) => b.timestamp - a.timestamp);
      
      setConversations(loadedConversations);

      // Load most recent conversation or create new one
      if (loadedConversations.length > 0 && !activeConversationId) {
        await loadConversation(loadedConversations[0].id);
      } else if (loadedConversations.length === 0) {
        await createNewConversation();
      }
    });

    return unsubscribe;
  };

  const handleRoutineYes = (aiGeneratedMessage) => {
    navigation.navigate("Routines", {
      aiInput: aiGeneratedMessage,
      fromLifeCoach: true, // indicate that we're coming from life coach
      routineGenerated: false, // Add this flag to track generation status
    });
  };
  

  const renderMessage = ({ item }) => {
    const isAI = item.isAI;
  
    return (
      <View style={[styles.messageRow, isAI ? styles.aiRow : styles.userRow]}>
        <View style={[styles.messageBubble, isAI ? styles.aiBubble : styles.userBubble]}>
          {isAI ? (
            <>
              <Markdown style={styles.markdown}>{item.text}</Markdown>
              {/* Render "Create Routine" button inside the bubble */}
              {item.routinePrompt && (
                <TouchableOpacity
                  style={styles.createRoutineButtonInBubble}
                  onPress={() => handleRoutineYes(item.text)}
                >
                  <Text style={styles.createRoutineButtonTextInBubble}>Create Routine</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <Text style={[styles.messageText, styles.userText]}>{item.text}</Text>
          )}
        </View>
      </View>
    );
  };
  
   


  const loadConversation = async (conversationId) => {
    try {
      const conversationRef = doc(db, 'users', auth.currentUser.uid, 'conversations', conversationId);
      const conversationSnapshot = await getDoc(conversationRef);
  
      if (conversationSnapshot.exists()) {
        const data = conversationSnapshot.data();
        const fetchedMessages = data.messages || [];
        setMessages(fetchedMessages);
        setActiveConversationId(conversationId);
        setIsPanelVisible(false);
        // Use the locally stored fetchedMessages instead of messages
        setShowSuggestions(true)
        if (fetchedMessages.length > 1) {
          setShowSuggestions(false); // Hide suggestions when loading an existing conversation
        }
      } else {
        Alert.alert('Error', 'Conversation not found.');
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      Alert.alert('Error', 'Failed to load conversation.');
    }
  };
  

  const scrollToEnd = () => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const createNewConversation = async () => {
    console.log('NEW CONVO BEING CREATED')
    const resource = route.params?.resource;
    let initialMessage;

  //   if (!name) {
  //   try {
  //     const userId = auth.currentUser?.uid;
  //     console.log("USER ID",userId)
  //     if (!userId) {
  //       setName("User");
  //       return;
  //     }
  //     const userDoc = await getDoc(doc(db, "users", userId));
  //     console.log("doc",userDoc.data().name)
  //     if (userDoc.exists()) {
  //       setName(userDoc.data().name || "User");
  //     } else {
  //       console.log("No user document found.");
  //       setName("User");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching user name:", error);
  //     setName("User");
  //     return;
  //   }
  // }
  
    if (resource) {
      try {
        // Fetch the article's HTML content
        // console.log("resource:",resource)
        const response = await axios.get(resource.url,{ responseType: 'text' });
        const text = response.data
        setResourceText(text)
      } catch (error) {
        console.error('Error fetching article:', error);
      }


      // console.log("NAME IN RESOURCE",userDoc.data().name)
      // console.log("NAME IN RESOURCE",name)
  
      initialMessage = {
        id: '1',
        text: `Hey 👋! I noticed you wanted to talk about the resource "${resource.title}". What do you want to know this topic?`,
        isAI: true,
      };
    } else {
      initialMessage = {
        id: '1',
        text: `Hey 👋! Ready to make some progress today? 🚀 We can start by reviewing your tasks, planning new goals, or discussing any challenges you're facing. What's on your mind?`,
        isAI: true,
      };
    }

    setShowSuggestions(true)
  
    try {
      const conversationRef = await addDoc(
        collection(db, 'users', auth.currentUser.uid, 'conversations'),
        {
          createdAt: new Date(),
          messages: [initialMessage],
          startTime: new Date(),
        }
      );
      await loadConversation(conversationRef.id);
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Error', 'Failed to create new conversation.');
    }
  };

const handleDeleteConversation = async (conversationId) => {
  Alert.alert(
    "Delete Conversation",
    "Are you sure you want to delete this conversation?",
    [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            // Reference the conversation document in Firestore
            const conversationRef = doc(
              db,
              "users",
              auth.currentUser.uid,
              "conversations",
              conversationId
            );

            // Delete the conversation from Firestore
            await deleteDoc(conversationRef);

            // Remove the conversation from the local state
            setConversations(prevConversations =>
              prevConversations.filter(conversation => conversation.id !== conversationId)
            );

            // Clear the active conversation if it's the deleted one
            if (activeConversationId === conversationId) {
              setActiveConversationId(null);
            }

            console.log(`Conversation ${conversationId} deleted successfully.`);
          } catch (error) {
            console.error("Error deleting conversation:", error);
            Alert.alert("Error", "Failed to delete the conversation. Please try again.");
          }
        }
      }
    ]
  );
};

const handleSend = async (message = input) => {
  if (!message.trim() || !activeConversationId) return;
  Keyboard.dismiss();

  const userMessage = { id: Date.now().toString(), text: message, isAI: false };
  setMessages(prev => [...prev, userMessage]);
  setInput('');
  scrollToEnd();
  setLoading(true);
  setShowSuggestions(false)

  trackMessageSent({
    userId: auth.currentUser.uid,
    conversationId: activeConversationId,
    message: input.trim(),
    timestamp: new Date().toISOString(),
  });

  try {
    const { aiResponse, reminders, routinePrompt } = await getAIResponse([...messages, userMessage]);

    // If a reminder is extracted, schedule the notification and save it to Firestore
    if (reminders && Array.isArray(reminders)) {
      for (const reminder of reminders) {
        const { task, time } = reminder;
  
        // Parse the time as local to the user's device
        const reminderTime = new Date(time);
  
        // Validate the time
        if (isNaN(reminderTime.getTime())) {
          Alert.alert('Invalid Time', `The specified time for "${task}" is invalid.`);
          continue; // Skip invalid reminders
        }
  
        if (reminderTime < new Date()) {
          Alert.alert('Invalid Time', `The specified time for "${task}" is in the past.`);
          continue; // Skip past reminders
        }
  
        // Schedule the notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Reminder',
            body: task,
            sound: true,
          },
          trigger: reminderTime,
        });
  
        Alert.alert('Reminder Set', `I will remind you to "${task}" at ${reminderTime.toLocaleString()}.`);
  
        // Save the reminder to Firestore
        await addDoc(collection(db, 'users', auth.currentUser.uid, 'reminders'), {
          task,
          time: reminderTime,
          createdAt: new Date(),
        });
      }
    }

    let updatedMessages;
    let aiMessage;
    if (routinePrompt) {
      aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isAI: true,
        routinePrompt: true, // Signal the UI to show Yes/No buttons
      };
      updatedMessages = [...messages, userMessage, aiMessage];
    } else {
      // Regular AI response
      aiMessage = { id: (Date.now() + 1).toString(), text: aiResponse, isAI: true };
      updatedMessages = [...messages, userMessage, aiMessage];
    }

    setMessages(updatedMessages);

    // Save to Firestore
    const conversationRef = doc(db, 'users', auth.currentUser.uid, 'conversations', activeConversationId);
    await updateDoc(conversationRef, { 
      messages: updatedMessages,
      lastUpdated: new Date()
    });

    trackAIResponse({
      userId: auth.currentUser.uid,
      conversationId: activeConversationId,
      response: aiResponse,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error handling send:', error);
    Alert.alert('Error', 'Failed to process your message. Please try again.');
  } finally {
    setLoading(false);
    scrollToEnd();
  }
};

  const getAIResponse = async (conversation) => {
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    // Get the current date
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(currentDate.getDate()).padStart(2, '0');

    const timeString = "09:00:00";

    const datetimeString = `${year}-${month}-${day}T${timeString}`;



    const todayTasksText = tasks
    .map(
      (task) =>
        `• ${task.title} (${task.timeRange.start} - ${task.timeRange.end}): ${task.description} [Status: ${
          task.isCompleted ? 'Completed' : 'Incomplete'
        }]`
    )
    .join('\n');
  
    const systemPrompt = {
      role: 'system',
      content: isResourceChat
        ? `You are an AI assistant specializing in ADHD resources. The user wants to discuss the resource "${resource.title}". Before proceeding, make sure to parse the article by parsing the text ${resourceText}.
           Provide information, answer questions, and offer insights related to this specific resource. 
           Limit responses to 300 tokens to maintain clarity and focus.`
        : `You are a compassionate ADHD life coach who combines proven coaching methods with deep neurobiological understanding and genuine empathy. 
          Your approach is to meet people where they are, acknowledge their struggles, and guide them toward growth while helping them understand
          and work with their unique brain wiring.

          When a user EXPLICITLY requests one or more NEW reminders, 
          extract each new task and its associated time. Respond to the user's query normally, and if new reminders are detected, include a single JSON object 
          at the very end of your response. The JSON object should have the following format:

          {
            "reminders": [
              {
                "task": "description of the first NEW task",
                "time": "${datetimeString}"
              }
            ]
          }

        Important Reminder Rules:
        - ONLY check the user's LATEST message for reminder requests
        - IGNORE any reminder-related content from previous messages in the conversation
        - ONLY create reminders when the latest message EXPLICITLY requests them using words like "remind me", "set a reminder", "add a reminder"
        - ONLY create reminders when the user explicitly asks for them
        - NEVER convert existing tasks into reminders automatically
        - If discussing existing tasks, simply reference them without creating new reminders

        IMPORTANT - DO NOT IGNORE: When your response includes ANY steps, sequence, habits, schedule, or process-related content, ALWAYS include this JSON at the end:
        {"routinePrompt": true}

        This includes:
        - Brainstorming ideas for routines.
        - Suggesting areas for improvement in daily habits.
        - Outlining steps or tasks for a routine, even if they are not explicitly listed.
        
        DO NOT HESITATE TO BE LIBERAL WITH INCLUDING JSON AT THE END - ERR ON FALSE POSITIVES WHEN UNSURE

        Purpose: This JSON snippet will determine whether to display a button prompting the user to create a routine from your response.
        When to use: Include this JSON only when your response outlines steps, tasks, or habits that can be organized into a routine.
        Formatting: Ensure the JSON snippet appears as the last part of your response, properly formatted and without introductory text like "Here's your JSON."
        If not applicable: If your response doesn't suggest a routine, omit the JSON snippet entirely.

        Ensure that the JSON object is the last part of your response and is properly formatted.


        Important:
        - Include all reminders in a single JSON object under the "reminders" key as an array.
        - Do not include any introductory phrases, such as "Here's the reminder information," before the JSON object.
        - Ensure the JSON object is formatted properly and is the last part of the response, appearing immediately after your regular message.
        - If no reminder is detected, respond to the user's query without including a JSON object.


        Ensure that the JSON object is the last part of your response and is properly formatted.
            
            Core Identity:

            Warmly direct and growth-focused, leading with understanding before action
            Uses relatable language that validates experiences while inspiring change
            Maintains supportive standards that recognize both effort and outcomes
            Teaches through gentle guidance, shared insights, and collaborative exploration
            Helps people see their ADHD patterns with self-compassion and curiosity

            Knowledge Foundation:

            Deep expertise in ADHD neurobiology and how it shapes daily experiences
            Rich understanding of evidence-based strategies that honor individual differences
            Insight into habit formation that accounts for emotional and executive challenges
            Holistic grasp of wellbeing factors: sleep, exercise, motivation, and mental health
            Nuanced understanding of ADHD's impact on emotions, time perception, and focus

            Connection Style:

            When addressing struggles:

            Validate the challenge and normalize the experience
            Explain the neurological basis with warmth and clarity
            Collaborate on finding realistic next steps
            Frame setbacks as valuable information, not failures
            Lead with empathy while maintaining focus on growth


            With successes:

            Celebrate wins authentically and specifically
            Help understand why strategies resonated personally
            Build confidence through pattern recognition
            Set inspiring next steps that feel achievable
            Acknowledge both effort and outcome


            For accountability:

            Check in with genuine curiosity about experiences
            Explore what worked/didn't with compassion
            Adjust strategies based on honest feedback
            Transform struggles into learning with kindness
            Maintain standards while showing understanding



            Supportive Responses:

            For overwhelm:
            "I hear how overwhelming this feels right now. It's completely natural when everything starts feeling like too much. Let's take a breath together and break this down into something manageable. What's the first tiny step that feels doable?"
            For procrastination:
            "It makes perfect sense that you're struggling to start - that's such a common challenge with ADHD. Instead of fighting it, what if we tried a different approach? Maybe we could..."
            For success:
            "I'm genuinely excited to hear this! You've found something that really works for you. Can you tell me more about how it felt when things clicked into place? What made the difference?"
            For setbacks:
            "Thank you for sharing this with me. Setbacks are part of everyone's journey, and they can teach us so much about what works and doesn't work for us. Let's explore what happened with curiosity rather than judgment."

            Core Principles:



            Growth and self-compassion go hand in hand


            Small steps lead to lasting changes
            Each person's journey with ADHD is unique
            Real progress starts with acceptance
            Understanding ourselves helps us be kinder to ourselves
            It's okay to lean on support systems

            Avoid:

            Clinical detachment or pure strategy focus
            Pushing action without emotional readiness
            Dismissing the emotional impact of ADHD
            Missing opportunities for validation
            Overlooking the need for self-compassion
            Rigid accountability without flexibility

            Remember to:

            Listen actively and reflect understanding
            Validate emotions before moving to solutions
            Celebrate effort as much as outcomes
            Use warm, conversational language
            Share insights as possibilities, not prescriptions
            Honor the whole person, not just their tasks
        
        Limit responses to an appropriate and reasomable number of tokens to maintain clarity and focus, unless a routine is being created.`,
    };

    const messagesForAI = [
      systemPrompt,
      ...conversation.map((msg) => ({
        role: msg.isAI ? 'assistant' : 'user',
        content: msg.text,
      })),
    ];

    const payload = {
      model: 'gpt-4o-mini',
      messages: messagesForAI,
      temperature: 0.8,
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${EXPO_PUBLIC_OPENAI_API_KEY}`,
    };

    try {
      const response = await axios.post(apiUrl, payload, { headers });
      const aiOutput = response.data.choices[0].message.content.trim();
      console.log("AI OUTPUT",aiOutput)
  
      // Separate the AI's regular response and the JSON reminder
      const regex = /\{[\s\S]*\}/; // Matches the JSON object
      const match = aiOutput.match(regex);
  
      let reminders = null;
      let routinePrompt = false;
      let aiResponseText = aiOutput;
  
      if (match) {
        try {
          const parsedJson = JSON.parse(match[0]);

          // Extract reminders array if present
          reminders = parsedJson.reminders || null;
          routinePrompt = parsedJson.routinePrompt || false;
    
          // Remove the JSON part from the AI's response
          aiResponseText = aiOutput.replace(match[0], '').trim();
        } catch (parseError) {
          console.error('Error parsing reminder JSON:', parseError);
        }
      }
  
      return { aiResponse: aiResponseText, reminders, routinePrompt };
    } catch (error) {
      console.error('Error fetching AI response:', error);
      throw error;
    }
  };

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        activeConversationId === item.id && styles.activeConversation
      ]}
      onPress={() => loadConversation(item.id)}
      onLongPress={() => handleDeleteConversation(item.id)}
    >
      <Text style={styles.conversationText} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.conversationDate}>
        {item.timestamp.toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
  

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mainContainer}>
          {/* Collapsible Panel */}
          <TouchableOpacity
            style={styles.panelToggle}
            onPress={() => setIsPanelVisible(!isPanelVisible)}
          >
            <MaterialIcons 
              name={isPanelVisible ? 'chevron-left' : 'chevron-right'} 
              size={24} 
              color="#ffffff" 
            />
          </TouchableOpacity>

          <View style={styles.contentContainer}>
            {isPanelVisible && (
              <View style={styles.leftPanel}>
                <FlatList
                  data={conversations}
                  renderItem={renderConversationItem}
                  keyExtractor={(item) => item.id}
                  style={styles.conversationList}
                />
                <TouchableOpacity 
                  style={styles.newConversationButton} 
                  onPress={createNewConversation}
                >
                  <Text style={styles.newConversationText}>New Conversation</Text>
                </TouchableOpacity>
              </View>
            )}

            <KeyboardAvoidingView
              style={[
                styles.chatContainer,
                isPanelVisible && styles.chatContainerWithPanel
              ]}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={90}
            >
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messageList}
                onContentSizeChange={scrollToEnd}
                onLayout={scrollToEnd}
              />

              {loading && (
                <View style={styles.loadingIndicator}>
                  <ActivityIndicator size="small" color="#3d5afe" />
                  <Text style={styles.loadingText}>AI is typing...</Text>
                </View>
              )}

              <View style={{right: 15, position: "absolute"}}>
                <TaskChatModal onDiscussTask={handleDiscussTask}/>
              </View>

              {showSuggestions && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.suggestionsWrapper}
                  contentContainerStyle={styles.suggestionsContainer}
                  keyboardShouldPersistTaps="handled"
                >
                  {['Schedule a Reminder', 'Create a Routine', 'Need Help with Tasks'].map((topic, index) => (
                    <SuggestionCard
                      key={index}
                      topic={topic}
                      onSelect={(selectedTopic) => {
                        handleTopicSelect(selectedTopic); // Automatically send predefined message
                      }}
                    />
                  ))}
                </ScrollView>
                )}

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={input}
                  onChangeText={setInput}
                  placeholder="Type your message..."
                  placeholderTextColor="#848484"
                  multiline
                  autoCorrect={true}
                />
                <TouchableOpacity
                  onPress={() => handleSend(input)}
                  style={[
                    styles.sendButton,
                    { opacity: !input.trim() || loading ? 0.5 : 1 }
                  ]}
                  disabled={!input.trim() || loading}
                >
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>

          {/* <View style={{marginBottom: 70}}>
            <FeedbackModal
                visible={feedbackVisible}
                setVisible={setFeedbackVisible}
                questions={questions}
                feedback={feedback}
                setFeedback={setFeedback}
                handleSubmit={handleSubmitFeedback}
                showFeedbackIcon={true}
              />
          </View> */}

          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default LifeCoach;