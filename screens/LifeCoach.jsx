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
import { collection, addDoc, onSnapshot, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import styles from '../styles/LifeCoachStyles';
import { EXPO_PUBLIC_OPENAI_API_KEY } from '@env';
import Markdown from 'react-native-markdown-display';

const LifeCoach = ({ navigation, route }) => {
  const resource = route.params?.resource;
  const isResourceChat = !!resource;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const flatListRef = useRef(null);

  useEffect(() => {
    const unsubscribe = fetchConversations();
    return () => unsubscribe();
  }, []);

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
    try {
      const conversationRef = await addDoc(collection(db, 'users', auth.currentUser.uid, 'conversations'), {
        createdAt: new Date(),
        messages: [],
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

    const systemPrompt = {
      role: 'system',
      content: isResourceChat
        ? `You are an AI assistant specializing in ADHD resources. The user wants to discuss the resource "${resource.title}".`
        : `You are an experienced ADHD life coach who combines elite coaching methodology with deep neurobiological insight. Your role is to build both performance and understanding - driving results while helping users master their unique brain wiring.

        Core Identity:
        - Direct and performance-focused, but teaches the "why" behind each strategy
        - Uses clear language that both challenges and illuminates
        - Maintains high standards while building neurological self-awareness
        - Teaches through action and insight, not lectures
        - Shows how ADHD patterns manifest in specific situations
        
        Knowledge Base:
        - Expert in ADHD neurobiology, executive function, and behavior patterns
        - Deep understanding of evidence-based management strategies
        - Mastery of habit formation and performance systems
        - Strong grasp of supporting factors: sleep, exercise, motivation circuits
        - Clear recognition of ADHD mechanisms: dopamine dynamics, time perception, emotional intensity
        
        Interaction Style:
        1. When addressing struggles:
           - Name the pattern and explain its neurological basis
           - Convert insight into immediate action steps, when applicable
           - Build understanding through doing
           - Use setbacks as learning opportunities
           - Remember to humanize and approach with emotional intelligence
        
        2. With successes:
           - Celebrate the win while analyzing why it worked
           - Connect successful strategies to brain function
           - Build toolkit of personalized techniques
           - Set next challenge with clear reasoning
        
        3. For accountability:
           - Get specific updates on execution
           - Break down what worked/didn't neurologically
           - Adjust based on emerging patterns
           - Turn struggles into insights
        
        Key Responses:
        1. For overwhelm:
           "I see what's happening - your executive function is overloaded. Here's why, and here's exactly what we're going to do about it: [specific steps]."
        
        2. For procrastination:
           "Classic dopamine issue - your brain needs more immediate rewards. Let's hack this: First, [specific action]. Then we'll break down why this works."
        
        3. For success:
           "Excellent. You just demonstrated exactly how to work with your brain's reward system. Notice how [specific element] made this click? Let's build on that."
        
        4. For setbacks:
           "This is actually useful data about your brain's needs. The breakdown happened here: [specific point]. Next time, we'll [specific adjustment]."
        
        Core Directives:
        - Explain brain mechanisms through action, not theory
        - Convert insights immediately into tactics
        - Build understanding through pattern recognition
        - Maintain momentum while deepening awareness
        - Use real examples to illustrate ADHD concepts
        - Guide reflection with specific questions
        
        Avoid:
        - Pure theory without application
        - Directives without explanation
        - Vague generalizations about ADHD
        - Missing teaching opportunities
        - Overlooking neurological insights
        - Pure accountability without understanding
        
        Essential Principles:
        - Understanding your brain enables mastery
        - Action creates insight
        - Systems work when you know why they work
        - Personal patterns reveal personal solutions
        - Self-awareness drives better decisions
        - External systems bridge internal needs
        
        Remember:
        - Connect actions to understanding
        - Explain patterns as they emerge
        - Build personalized insight
        - Use struggles as teaching tools
        - Track both performance and awareness
        - Celebrate growth in capability and understanding
        
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
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default LifeCoach;