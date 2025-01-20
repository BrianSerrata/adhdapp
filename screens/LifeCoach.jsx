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
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { auth, db } from '../firebase';
import { collection, addDoc, onSnapshot, doc, updateDoc, getDoc, deleteDoc, query, where } from 'firebase/firestore';
import styles from '../styles/LifeCoachStyles';
import { EXPO_PUBLIC_OPENAI_API_KEY } from '@env';
import Markdown from 'react-native-markdown-display';
import FeedbackModal from '../components/FeedbackModal';

import {
  trackMessageSent,
  trackAIResponse,
  trackConversationDuration,
  trackCoachTabOpened} from '../backend/apis/segment';

const LifeCoach = ({ navigation, route }) => {
  const resource = route.params?.resource;
  const isResourceChat = !!resource;

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

  const fetchUserName = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setName(userDoc.data().name || "User");
      } else {
        console.log("No user document found.");
        setName("User");
      }
    } catch (error) {
      console.error("Error fetching user name:", error);
      setName("User");
    }
  };
  
  useEffect(() => {
    fetchUserName();
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
        console.log('One-Off Routines:', loadedOneOffRoutines);
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
        console.log('Recurring Routines:', loadedRecurringRoutines);
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
  
      console.log('Combining tasks. One-Off Routines:', oneOffRoutines);
      console.log('Combining tasks. Recurring Routines:', recurringRoutines);
  
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
  
      // Log combined tasks for debugging
      console.log('Combined Tasks:', allTasks);
  
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

  const renderMessage = ({ item }) => {
    const isAI = item.isAI;
  
    return (
      <View style={[styles.messageRow, isAI ? styles.aiRow : styles.userRow]}>
        <View style={[styles.messageBubble, isAI ? styles.aiBubble : styles.userBubble]}>
          {isAI ? (
            <Markdown style={styles.markdown}>
              {item.text}
            </Markdown>
          ) : (
            <Text style={[styles.messageText, styles.userText]}>
              {item.text}
            </Text>
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
        setMessages(data.messages || []);
        setActiveConversationId(conversationId);
        setIsPanelVisible(false)

        // trackConversationStarted({
        //   userId: auth.currentUser.uid,
        //   conversationId: conversationId,
        //   initialMessage: data.messages?.[0]?.text || 'N/A',
        //   timestamp: new Date().toISOString(),
        // });

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

    // setMessages([
    //   {
    //     id: '1',
    //     text: "Hi! I'm here to chat and help you process your thoughts. How are you feeling today?",
    //     isAI: true,
    //   },
    // ]);

    try {

      const initialMessage = {
        id: '1',
        text: `Hey ${name}! Ready to make some progress today? 🚀 We can start by reviewing your tasks, planning new goals, or discussing any challenges you're facing. What's on your mind?`,
        isAI: true,
      };

      const conversationRef = await addDoc(collection(db, 'users', auth.currentUser.uid, 'conversations'), {
        createdAt: new Date(),
        messages: [initialMessage],
        startTime: new Date(), // Track when the conversation started
      });
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

  const handleSend = async () => {
    if (!input.trim() || !activeConversationId) return;
    Keyboard.dismiss()

    const userMessage = { id: Date.now().toString(), text: input, isAI: false };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    scrollToEnd();
    setLoading(true);

    trackMessageSent({
      userId: auth.currentUser.uid,
      conversationId: activeConversationId,
      message: input.trim(),
      timestamp: new Date().toISOString(),
    });

    try {
      const aiResponse = await getAIResponse([...messages, userMessage]);
      const aiMessage = { id: (Date.now() + 1).toString(), text: aiResponse, isAI: true };
      
      const updatedMessages = [...messages, userMessage, aiMessage];
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
      console.error('Error fetching AI response:', error);
      Alert.alert('Error', 'Failed to get AI response. Please try again.');
    } finally {
      setLoading(false);
      scrollToEnd();
    }
  };

  const getAIResponse = async (conversation) => {
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

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
        ? `You are an AI assistant specializing in ADHD resources. The user wants to discuss the resource "${resource.title}".`
        : `You are a compassionate ADHD life coach who combines proven coaching methods with deep neurobiological understanding and genuine empathy. Your approach is to meet people where they are, acknowledge their struggles, and guide them toward growth while helping them understand and work with their unique brain wiring.
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


        Essential Tasks for Today:
        ${todayTasksText}
        
        Limit responses to 300 tokens to maintain clarity and focus.`,
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
      max_tokens: 350,
      temperature: 0.75,
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${EXPO_PUBLIC_OPENAI_API_KEY}`,
    };

    const response = await axios.post(apiUrl, payload, { headers });
    return response.data.choices[0].message.content.trim();
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
                  onPress={handleSend}
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

          <View style={{marginBottom: 70}}>
            <FeedbackModal
                visible={feedbackVisible}
                setVisible={setFeedbackVisible}
                questions={questions}
                feedback={feedback}
                setFeedback={setFeedback}
                handleSubmit={handleSubmitFeedback}
                showFeedbackIcon={true}
              />
          </View>

          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default LifeCoach;