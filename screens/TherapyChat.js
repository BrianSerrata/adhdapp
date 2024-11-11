// src/screens/TherapyChat.js

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { OPENAI_API_KEY } from '@env'; // Ensure this is set up correctly
import { auth, db } from '../firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import SessionSummary from '../components/SessionSummary'; // Import the SessionSummary component
import styles from '../styles/TherapyChatStyles';

const TherapyChat = ({ navigation, route }) => {

  const resource = route.params?.resource;
  const isResourceChat = !!resource;

  const [messages, setMessages] = useState([
    {
      id: '1',
      text: isResourceChat
        ? `Hi! I'm here to chat about the resource "${resource.title}". What would you like to know?`
        : "Hi! I'm here to chat and help you process your thoughts. How are you feeling today?",
      isAI: true,
    },
  ]);

  const SuggestionCard = ({ topic, onSelect }) => {
    return (
      <TouchableOpacity style={styles.suggestionCard} onPress={() => onSelect(topic)}>
        <Text style={styles.suggestionText}>{topic}</Text>
      </TouchableOpacity>
    );
  };
  

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [isSessionSetupVisible, setIsSessionSetupVisible] = useState(!isResourceChat);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [hasSessionStarted, setHasSessionStarted] = useState(isResourceChat);
  const [sessionDuration, setSessionDuration] = useState(null);
  const flatListRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isResourceChat) {
      startResourceChat();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startResourceChat = async () => {
    try {
      // TODO: probably going to have to create a dedicated collection for resource-specific convos
      const docRef = await addDoc(collection(db, 'users', auth.currentUser.uid, 'sessions'), {
        createdAt: serverTimestamp(),
        resourceTitle: resource.title,
        resourceUrl: resource.url,
        messages: [],
      });
      setSessionId(docRef.id);
    } catch (error) {
      console.error('Error starting resource chat:', error);
      Alert.alert('Error', 'Could not start a new chat session.');
    }
  };

  const startSession = async (duration) => {
    try {
      const docRef = await addDoc(collection(db, 'users', auth.currentUser.uid, 'sessions'), {
        createdAt: serverTimestamp(),
        duration: duration,
        messages: [],
      });
      setSessionId(docRef.id);
      setSessionDuration(duration);
      setTimeRemaining(duration * 60); // Convert minutes to seconds
      setIsSessionSetupVisible(false);
      setHasSessionStarted(true);

      // Start the timer
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleEndSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Set initial AI message
      setMessages([
        {
          id: '1',
          text: "Hi! I'm here to chat and help you process your thoughts. How are you feeling today?",
          isAI: true,
        },
      ]);
    } catch (error) {
      console.error('Error starting session:', error);
      Alert.alert('Error', 'Could not start a new session.');
    }
  };

  const formatTimeRemaining = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Session Setup Modal Component
  const SessionSetupModal = () => (
    <Modal
      visible={isSessionSetupVisible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Choose Session Duration</Text>
          <Text style={styles.modalSubtitle}>How long would you like to chat?</Text>
          
          {[15, 30, 45].map((duration) => (
            <TouchableOpacity
              key={duration}
              style={styles.durationButton}
              onPress={() => startSession(duration)}
            >
              <Text style={styles.durationButtonText}>{duration} minutes</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = { id: Date.now().toString(), text: input, isAI: false };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      scrollToEnd();

      setLoading(true);

      try {
        const aiResponse = await getAIResponse([...messages, userMessage]);
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          isAI: true,
        };
        setMessages(prev => [...prev, aiMessage]);

        // Save messages to Firestore
        await saveMessageToFirestore(userMessage);
        await saveMessageToFirestore(aiMessage);
      } catch (error) {
        console.error('Error fetching AI response:', error);
        Alert.alert('Error', 'There was an issue communicating with the AI. Please try again.');
      } finally {
        setLoading(false);
        scrollToEnd();
      }
    }
  };

  const saveMessageToFirestore = async (message) => {
    if (!sessionId) return;

    try {
      const sessionRef = collection(db, 'users', auth.currentUser.uid, 'sessions', sessionId, 'messages');
      await addDoc(sessionRef, {
        text: message.text,
        isAI: message.isAI,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const scrollToEnd = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const getAIResponse = async (conversation) => {
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    const systemPrompt = {
      role: 'system',
      content: isResourceChat
        ? `You are an AI assistant specializing in ADHD resources. The user wants to discuss the resource "${resource.url}". Before proceeding, make sure to parse the article by accessing the url.
           Provide information, answer questions, and offer insights related to this specific resource. If asked about other topics, gently redirect the conversation back to the resource. Be empathetic, informative, and supportive in your responses.`
        : `I want you to act as a licensed therapist with expertise in mental health counseling, specializing in ADHD and related challenges.  
                Conduct this conversation as a real therapy session, using an empathetic, ADHD-informed, patient-centered approach. 
                Recognize and validate the unique struggles associated with ADHD, such as difficulty with focus, organization, 
                impulsivity, emotional regulation, and feeling misunderstood. Acknowledge the strengths and resilience often present in individuals with ADHD.
                
                Offer active listening and validation for my experiences, and provide constructive feedback grounded in therapeutic frameworks 
                such as cognitive-behavioral therapy, mindfulness, acceptance and commitment therapy, and ADHD-specific coaching strategies where appropriate. 
                
                Help me explore my thoughts and feelings, offering insights and coping strategies that can support my needs with ADHD. 
                Emphasize practical, actionable steps for managing symptoms, improving focus, and reducing overwhelm, and encourage positive self-reflection on personal strengths.
                
                At the end of each session, summarize key takeaways or next steps based on our conversation, highlighting specific strategies that might be helpful. 
                Focus on creating a safe, supportive, and confidential environment that prioritizes my emotional well-being and acknowledges the complexities of living with ADHD.`
    };

    // Format the conversation for OpenAI's API
    const messagesForAI = [
      systemPrompt,
      ...conversation.map(msg => ({
        role: msg.isAI ? 'assistant' : 'user',
        content: msg.text,
      }))
    ];

    const payload = {
      model: 'gpt-4o-mini', // Ensure the correct model name
      messages: messagesForAI,
      max_tokens: 300,
      temperature: 0.7,
      n: 1,
      stop: null,
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    };

    try {
      const response = await axios.post(apiUrl, payload, { headers });

      if (response.data && response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content.trim();
      } else {
        throw new Error('Invalid response from OpenAI');
      }
    } catch (error) {
      // Log detailed error for debugging
      console.error('OpenAI API Error:', error.response ? error.response.data : error.message);
      throw error;
    }
  };

  const handleEndSession = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (messages.length === 0) {
      Alert.alert('No Messages', 'There are no messages to summarize.');
      setMessages([]);
      setInput('');
      setLoading(false);
      navigation.goBack();
      return;
    }

    setIsSummaryVisible(true);

    // Prepare the conversation for summary
    const systemPrompt = {
      role: 'system',
      content: `You are an ADHD therapist tasked with summarizing a therapy session.
      Analyze the following conversation to identify key takeaways, issues acknowledged, and action steps for managing ADHD symptoms.
      Focus on macro patterns and overarching themes rather than individual messages.
      Present the summary in three clearly labeled sections in this exact format:
    
      ### Key Takeaways
      - List each key takeaway here, using "you" statements where possible.
    
      ### Issues Acknowledged
      - List each issue here, keeping the language supportive and gentle.
    
      ### Action Steps
      - List each action step here with practical, motivating language to encourage engagement.
    
      Use "###" for section headers and prefix each point with a dash ("-") to ensure consistent formatting.`
    };

    const userPrompt = {
      role: 'user',
      content: `Here is the conversation from my therapy session:\n${messages.map(msg => `${msg.isAI ? 'Therapist' : 'Me'}: ${msg.text}`).join('\n')}`,
    };

    const conversationForSummary = [systemPrompt, userPrompt];

    const payload = {
      model: 'gpt-4o-mini', // Ensure the correct model name
      messages: conversationForSummary,
      max_tokens: 500,
      temperature: 0.7,
      n: 1,
      stop: null,
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    };

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', payload, { headers });

      if (response.data && response.data.choices && response.data.choices.length > 0) {
        const summaryText = response.data.choices[0].message.content.trim();
        // Parse the summaryText into structured data
        const summarySections = parseSummary(summaryText);
        setSummaryData(summarySections);
        const sessionRef = doc(db, 'users', auth.currentUser.uid, 'sessions', sessionId);
        // Save the summary to the session document
        await updateDoc(sessionRef, { summary: summarySections });
        
        console.log('Summary saved successfully!');

      } else {
        Alert.alert('Error', 'Failed to retrieve summary. Please try again later.');
        setIsSummaryVisible(false);
      }
    } catch (error) {
      console.error('Error fetching summary:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'An error occurred while fetching the summary. Please try again.');
      setIsSummaryVisible(false);
    }

  };

  const parseSummary = (text) => {
    // Simple parser to extract sections. For more robust parsing, consider using regex or AI assistance.
    const sections = {
      keyTakeaways: [],
      issuesAcknowledged: [],
      actionSteps: [],
    };

    const takeawayMatch = text.match(/### Key Takeaways\s*((?:- .*\n?)+)/i);
    const issuesMatch = text.match(/### Issues Acknowledged\s*((?:- .*\n?)+)/i);
    const actionMatch = text.match(/### Action Steps\s*((?:- .*\n?)+)/i);

    if (takeawayMatch && takeawayMatch[1]) {
      sections.keyTakeaways = takeawayMatch[1].split('\n').map(item => item.replace(/^- /, '').trim()).filter(item => item);
    }

    if (issuesMatch && issuesMatch[1]) {
      sections.issuesAcknowledged = issuesMatch[1].split('\n').map(item => item.replace(/^- /, '').trim()).filter(item => item);
    }

    if (actionMatch && actionMatch[1]) {
      sections.actionSteps = actionMatch[1].split('\n').map(item => item.replace(/^- /, '').trim()).filter(item => item);
    }

    return sections;
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageRow, item.isAI ? styles.aiRow : styles.userRow]}>
      <View
        style={[
          styles.messageBubble,
          item.isAI ? styles.aiBubble : styles.userBubble,
        ]}
      >
        <Text style={[styles.messageText, item.isAI ? styles.aiText : styles.userText]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#f0f4f8', '#d9e2ec']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {!isResourceChat && <SessionSetupModal />}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#6D28D9" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              {isResourceChat ? `Chat about ${resource.title}` : 'AI Therapist Chat'}
            </Text>
            {!isResourceChat && hasSessionStarted && timeRemaining !== null && (
              <Text style={styles.headerTimer}>
                Time remaining: {formatTimeRemaining(timeRemaining)}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={handleEndSession} style={styles.endSessionButton}>
            <Ionicons name="exit-outline" size={24} color="#6D28D9" />
          </TouchableOpacity>
        </View>

        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={scrollToEnd}
            onLayout={scrollToEnd}
          />

          {loading && (
            <View style={styles.loadingIndicator}>
              <ActivityIndicator size="small" color="#6D28D9" />
              <Text style={styles.loadingText}>AI is typing...</Text>
            </View>
          )}
        </View>

        {/* KeyboardAvoidingView wraps the suggestions and input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.bottomContainer}>
            {/* Suggestion Cards */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.suggestionsWrapper}
              contentContainerStyle={styles.suggestionsContainer}
              keyboardShouldPersistTaps="handled" // **Added this line**
            >
              {['Topic 1', 'Topic 2', 'Topic 3', 'Topic 4'].map((topic, index) => (
                <SuggestionCard key={index} topic={topic} onSelect={(selectedTopic) => {
                  setInput(selectedTopic);
                  scrollToEnd();
                }} />
              ))}
            </ScrollView>

            {/* Input Box */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Type your message..."
                placeholderTextColor="#9CA3AF"
                multiline
              />
              <TouchableOpacity
                onPress={handleSend}
                style={[
                  styles.sendButton,
                  { backgroundColor: input.trim() ? '#6D28D9' : '#C4B5FD' },
                ]}
                disabled={!input.trim() || loading}
              >
                <Ionicons name="send" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>

        <Modal
          visible={isSummaryVisible && summaryData !== null}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setIsSummaryVisible(false);
            navigation.goBack();
          }}
        >
          <SessionSummary
            summaryData={summaryData}
            onClose={() => {
              setIsSummaryVisible(false);
              navigation.goBack();
            }}
          />
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default TherapyChat;
