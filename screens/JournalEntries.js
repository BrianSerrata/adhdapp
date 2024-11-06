import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { format } from 'date-fns';
import axios from 'axios';
import styles from '../styles/JournalEntriesStyles';

const JournalEntries = ({ navigation }) => {
  const [entryText, setEntryText] = useState('');
  const [title, setTitle] = useState('');
  const [entryType, setEntryType] = useState('journal'); // "journal" or "impulse"
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [insights, setInsights] = useState('');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'User not authenticated.');
      navigation.navigate('Login');
      return;
    }

    const entriesRef = collection(db, 'users', auth.currentUser.uid, 'entries');
    const q = query(entriesRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const entriesData = [];
      querySnapshot.forEach((doc) => entriesData.push({ id: doc.id, ...doc.data() }));
      setEntries(entriesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigation]);

  const handleAddEntry = async () => {
    if (entryText.trim() === '' && title.trim() === '') {
      Alert.alert('Validation Error', 'Please enter a title and content for your entry.');
      return;
    }

    try {
      const entriesRef = collection(db, 'users', auth.currentUser.uid, 'entries');
      await addDoc(entriesRef, {
        title: title.trim() || (entryType === 'impulse' ? 'Impulse Log' : 'Journal Entry'),
        content: entryText.trim(),
        type: entryType,
        timestamp: serverTimestamp(),
      });
      setTitle('');
      setEntryText('');
      setEntryType('journal');
    } catch (error) {
      console.error('Error adding entry:', error);
      Alert.alert('Error', 'Failed to add entry. Please try again.');
    }
  };

  const handleDeleteEntry = (entryId) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const entryDocRef = doc(db, 'users', auth.currentUser.uid, 'entries', entryId);
            await deleteDoc(entryDocRef);
          } catch (error) {
            console.error('Error deleting entry:', error);
            Alert.alert('Error', 'Failed to delete entry. Please try again.');
          }
        },
      },
    ]);
  };

  const renderEntryItem = ({ item }) => {
    const formattedTimestamp = item.timestamp
      ? format(item.timestamp.toDate(), 'MMMM dd, yyyy hh:mm a')
      : 'Just now';

    return (
      <View style={styles.entryItem}>
        <View style={styles.entryTextContainer}>
          <Text style={styles.entryTitle}>{item.title}</Text>
          <Text style={styles.entryContent}>{item.content}</Text>
          <Text style={styles.entryTimestamp}>{formattedTimestamp}</Text>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteEntry(item.id)}>
          <Feather name="x" size={18} color="#6D28D9" />
        </TouchableOpacity>
      </View>
    );
  };

  const handleGetInsights = async () => {
    if (entries.length === 0) {
      Alert.alert('No Entries', 'Please log some entries to receive insights.');
      return;
    }

    setIsLoadingInsights(true);
    setIsModalVisible(true);

    const entryTexts = entries
      .map((entry) => {
        const timestamp = entry.timestamp ? format(entry.timestamp.toDate(), 'MMMM dd, yyyy hh:mm a') : 'Unknown time';
        return `${entry.content} (Logged on: ${timestamp})`;
      })
      .join('\n');

    const systemPrompt = {
      role: 'system',
      content: `You are an ADHD therapist analyzing a list of journal entries. 
                  Focus on identifying any overarching patterns or common themes that could provide useful insights.
                  Highlight any recurring triggers, environmental factors, or emotional responses.
                  Avoid detailed individual analysis; instead, focus on general trends in timing, context, or content.`
    };
    
    const userPrompt = {
      role: 'user',
      content: `Entries:\n${entryTexts}`
    };
    
    const messages = [systemPrompt, userPrompt];
    
    const payload = {
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 1000,
      temperature: 0.7,
      n: 1,
      stop: null,
    };
    
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    };
    
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', payload, { headers });
    
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        setInsights(response.data.choices[0].message.content.trim());
      } else {
        setInsights('Failed to retrieve insights. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching insights:', error.response ? error.response.data : error.message);
      setInsights('An error occurred while fetching insights. Please try again.');
    } finally {
      setIsLoadingInsights(false);
    }
  };    

  return (
    <LinearGradient colors={['#f0f4f8', '#d9e2ec']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="#6D28D9" />
          </TouchableOpacity>
          <Text style={styles.title}>Journal & Impulses</Text>
          <TouchableOpacity onPress={handleGetInsights}>
            <MaterialIcons name="insights" size={24} color="#6D28D9" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#9CA3AF"
          />
          <TextInput
            style={styles.entryInput}
            placeholder="What's on your mind?"
            value={entryText}
            onChangeText={setEntryText}
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: entryText.trim() ? '#6D28D9' : '#C4B5FD' }]}
            onPress={handleAddEntry}
            activeOpacity={0.8}
            disabled={!entryText.trim()}
          >
            <Feather name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6D28D9" />
          </View>
        ) : (
          <FlatList
            data={entries}
            renderItem={renderEntryItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>No entries logged yet.</Text>}
          />
        )}

        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Insights & Advice</Text>
              {isLoadingInsights ? (
                <ActivityIndicator size="large" color="#6D28D9" />
              ) : (
                <ScrollView>
                  <Text style={styles.modalText}>{insights}</Text>
                </ScrollView>
              )}
              <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default JournalEntries;