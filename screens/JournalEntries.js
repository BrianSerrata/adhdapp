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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { format } from 'date-fns';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const JournalEntries = ({ navigation }) => {
  const [entryText, setEntryText] = useState('');
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
    if (entryText.trim() === '') {
      return;
    }

    try {
      const entriesRef = collection(db, 'users', auth.currentUser.uid, 'entries');
      await addDoc(entriesRef, {
        content: entryText.trim(),
        timestamp: serverTimestamp(),
      });
      setEntryText('');
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

  const renderEntryItem = ({ item }) => {
    const formattedDate = item.timestamp
      ? format(item.timestamp.toDate(), 'MMM dd, yyyy')
      : 'Just now';

    return (
      <View style={styles.messageRow}>
        <View style={styles.messageBubble}>
          <Text style={styles.messageText}>{item.content}</Text>
          <Text style={styles.timestamp}>{formattedDate}</Text>
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => handleDeleteEntry(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#4B5563" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Journal</Text>
            <Text style={styles.headerSubtitle}>Record your thoughts</Text>
          </View>
          <TouchableOpacity onPress={handleGetInsights}>
            <MaterialIcons name="insights" size={24} color="#6D28D9" />
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
            style={styles.messageList}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No entries yet</Text>
                <Text style={styles.emptySubtext}>Start journaling your thoughts</Text>
              </View>
            }
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
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Insights & Advice</Text>
                <TouchableOpacity
                  style={styles.closeButtonTop}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#4B5563" />
                </TouchableOpacity>
              </View>
              
              {isLoadingInsights ? (
                <View style={styles.modalLoadingContainer}>
                  <ActivityIndicator size="large" color="#6D28D9" />
                </View>
              ) : (
                <ScrollView
                  style={styles.modalScrollView}
                  contentContainerStyle={styles.modalScrollContent}
                >
                  <Text style={styles.modalText}>{insights}</Text>
                </ScrollView>
              )}
              
              <TouchableOpacity
                style={styles.closeButtonBottom}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={entryText}
            onChangeText={setEntryText}
            placeholder="Write your thoughts..."
            placeholderTextColor="#9CA3AF"
            multiline
          />
          <TouchableOpacity
            onPress={handleAddEntry}
            style={[
              styles.sendButton,
              { backgroundColor: entryText.trim() ? '#6D28D9' : '#C4B5FD' },
            ]}
            disabled={!entryText.trim()}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = {
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  backButton: {
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  messageList: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  messageRow: {
    marginBottom: 16,
  },
  messageBubble: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
    color: '#1F2937',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#4B5563',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '90%',
      maxHeight: '80%',
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 20,
      elevation: 5, // For Android shadow
      shadowColor: '#000', // For iOS shadow
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1F2937',
    },
    closeButtonTop: {
      padding: 4,
    },
    modalLoadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      height: 200, // Adjust as needed
    },
    modalScrollView: {
      flex: 1,
      marginBottom: 20,
    },
    modalScrollContent: {
      paddingBottom: 20,
    },
    modalText: {
      fontSize: 16,
      color: '#1F2937',
      lineHeight: 24,
    },
    closeButtonBottom: {
      alignSelf: 'flex-end',
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: '#6D28D9',
      borderRadius: 20,
    },
    closeButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  };

export default JournalEntries;