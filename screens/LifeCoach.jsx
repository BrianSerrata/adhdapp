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
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { auth, db } from '../firebase';
import { collection, addDoc, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import styles from '../styles/LifeCoachStyles';
import { OPENAI_API_KEY } from '@env';

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

  const renderMessage = ({ item }) => (
    <View style={[styles.messageRow, item.isAI ? styles.aiRow : styles.userRow]}>
      {item.isAI && (
        <View style={styles.avatarContainer}>
          <MaterialIcons name="psychology" size={24} color="#3d5afe" />
        </View>
      )}
      <View style={[styles.messageBubble, item.isAI ? styles.aiBubble : styles.userBubble]}>
        <Text style={[styles.messageText, item.isAI ? styles.aiText : styles.userText]}>
          {item.text}
        </Text>
      </View>
    </View>
  );


  const loadConversation = async (conversationId) => {
    try {
      const conversationRef = doc(db, 'users', auth.currentUser.uid, 'conversations', conversationId);
      const conversationSnapshot = await getDoc(conversationRef);

      if (conversationSnapshot.exists()) {
        const data = conversationSnapshot.data();
        setMessages(data.messages || []);
        setActiveConversationId(conversationId);
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

  const handleSend = async () => {
    if (!input.trim() || !activeConversationId) return;

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
        : `You are a life coach specializing in ADHD. Provide concise, actionable advice.`,
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
      max_tokens: 300,
      temperature: 0.7,
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    };

    const response = await axios.post(apiUrl, payload, { headers });
    return response.data.choices[0].message.content.trim();
  };

  // ... rest of your existing functions (getAIResponse, scrollToEnd) ...

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        activeConversationId === item.id && styles.activeConversation
      ]}
      onPress={() => loadConversation(item.id)}
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