// src/screens/SessionDetail.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { auth, db } from '../firebase';
import { collection, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import SessionSummary from '../components/SessionSummary'; // Ensure this component is correctly implemented

const Session = ({ route, navigation }) => {
  const { sessionId } = route.params;
  const [messages, setMessages] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch session messages and summary from Firestore
  const fetchSessionDetails = async () => {
    try {
      const sessionRef = doc(db, 'users', auth.currentUser.uid, 'sessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (sessionSnap.exists()) {
        const sessionData = sessionSnap.data();

        // Fetch messages
        const messagesRef = collection(sessionRef, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        const querySnapshot = await getDocs(q);
        const messagesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messagesData);

        // Retrieve summary
        if (sessionData.summary) {
          setSummary(sessionData.summary);
        }
      } else {
        console.log('No such session!');
        Alert.alert('Error', 'Session not found.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
      Alert.alert('Error', 'Failed to fetch session details.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionDetails();
  }, []);

  // Render each message in the chat
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
        <Text style={styles.timestamp}>
          {item.timestamp?.toDate()
            ? format(item.timestamp.toDate(), 'hh:mm a')
            : ''}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9333ea" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {summary && (
        <View style={styles.summaryContainer}>
          <SessionSummary summaryData={summary} /> 
        </View>
      )}


      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#e9d5ff',
  },
  summaryContainer: {
    marginBottom: 16,
  },
  messageList: {
    paddingBottom: 16,
  },
  messageRow: {
    marginBottom: 16,
  },
  aiRow: {
    alignItems: 'flex-start',
  },
  userRow: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  aiBubble: {
    backgroundColor: '#ffffff',
  },
  userBubble: {
    backgroundColor: '#9333ea',
  },
  messageText: {
    fontSize: 16,
    color: '#1f2937',
  },
  aiText: {
    color: '#7e22ce',
  },
  userText: {
    color: '#ffffff',
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Session;