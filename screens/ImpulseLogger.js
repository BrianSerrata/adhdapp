import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
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
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { format } from 'date-fns';
import axios from 'axios';

const ImpulseLogger = ({ navigation }) => {
  const [impulseText, setImpulseText] = useState('');
  const [impulses, setImpulses] = useState([]);
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

    const impulsesRef = collection(db, 'users', auth.currentUser.uid, 'impulses');
    const q = query(impulsesRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const impulsesData = [];
        querySnapshot.forEach((doc) => {
          impulsesData.push({ id: doc.id, ...doc.data() });
        });
        setImpulses(impulsesData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching impulses:', error);
        Alert.alert('Error', 'Failed to fetch impulses.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [navigation]);

  const handleAddImpulse = async () => {
    if (impulseText.trim() === '') {
      Alert.alert('Validation Error', 'Please enter an impulse.');
      return;
    }

    try {
      const impulsesRef = collection(db, 'users', auth.currentUser.uid, 'impulses');
      await addDoc(impulsesRef, {
        text: impulseText.trim(),
        timestamp: serverTimestamp(),
      });
      setImpulseText('');
    } catch (error) {
      console.error('Error adding impulse:', error);
      Alert.alert('Error', 'Failed to add impulse. Please try again.');
    }
  };

  const handleDeleteImpulse = (impulseId) => {
    Alert.alert(
      'Delete Impulse',
      'Are you sure you want to delete this impulse?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const impulseDocRef = doc(db, 'users', auth.currentUser.uid, 'impulses', impulseId);
              await deleteDoc(impulseDocRef);
            } catch (error) {
              console.error('Error deleting impulse:', error);
              Alert.alert('Error', 'Failed to delete impulse. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderImpulseItem = ({ item }) => {
    const createdAt = item.timestamp?.toDate();
    const formattedTimestamp = createdAt
      ? format(createdAt, 'MMMM dd, yyyy hh:mm a')
      : 'Just now';

    return (
      <View style={styles.impulseItem}>
        <View style={styles.impulseTextContainer}>
          <Text style={styles.impulseText}>{item.text}</Text>
          <Text style={styles.impulseTimestamp}>{formattedTimestamp}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteImpulse(item.id)}
        >
          <Feather name="x" size={18} color="#9333ea" />
        </TouchableOpacity>
      </View>
    );
  };


const handleGetInsights = async () => {
  if (impulses.length === 0) {
    Alert.alert('No Impulses', 'Please log some impulses to receive insights.');
    return;
  }

  setIsLoadingInsights(true);
  setIsModalVisible(true);

  const impulseTexts = impulses
  .map((impulse) => {
    const timestamp = impulse.timestamp ? format(impulse.timestamp.toDate(), 'MMMM dd, yyyy hh:mm a') : 'Unknown time';
    return `${impulse.text} (Logged on: ${timestamp})`;
  })
  .join('\n');

  const systemPrompt = {
    role: 'system',
    content: `You are an ADHD therapist analyzing a list of impulses logged by a patient. 
              Focus on identifying any overarching patterns or common themes that could provide useful insights into the patient's ADHD symptoms.
              Highlight any recurring triggers, environmental factors, or emotional responses that seem to repeat across different impulses.
              Avoid detailed, individual analysis of each impulse; instead, focus on any general trends in timing, context, or content.
              If any significant temporal patterns emerge (such as time of day, week, or specific contexts where impulses increase), be sure to note these.
              Otherwise, refrain from unnecessary temporal analysis. Provide high-level advice and strategies for managing these identified patterns effectively.`
  };
  

  const userPrompt = {
    role: 'user',
    content: `Impulses:\n${impulseTexts}`
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
    <LinearGradient colors={['#f3e8ff', '#dbeafe']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="#6b21a8" />
          </TouchableOpacity>
          <Text style={styles.title}>Impulse Logger</Text>
          <TouchableOpacity onPress={handleGetInsights}>
            <MaterialIcons name="insights" size={24} color="#6b21a8" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="What's on your mind?"
            value={impulseText}
            onChangeText={setImpulseText}
            placeholderTextColor="#9333ea"
            multiline
            maxLength={200}
          />
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: impulseText.trim() ? '#9333ea' : '#a78bfa' },
            ]}
            onPress={handleAddImpulse}
            activeOpacity={0.8}
            disabled={!impulseText.trim()}
          >
            <Feather name="plus" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9333ea" />
          </View>
        ) : (
          <FlatList
            data={impulses}
            renderItem={renderImpulseItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No impulses logged yet.</Text>
              </View>
            }
          />
        )}

        <Text style={styles.encouragingText}>
          "Awareness is the first step towards change! 🌱"
        </Text>

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
                <ActivityIndicator size="large" color="#9333ea" />
              ) : (
                <ScrollView>
                  <Text style={styles.modalText}>{insights}</Text>
                </ScrollView>
              )}
              {!isLoadingInsights && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6b21a8',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#6b21a8',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  addButton: {
    backgroundColor: '#9333ea',
    borderRadius: 12,
    padding: 12,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  impulseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  impulseTextContainer: {
    flex: 1,
  },
  impulseText: {
    fontSize: 16,
    color: '#1e40af',
    marginBottom: 4,
  },
  impulseTimestamp: {
    fontSize: 12,
    color: '#3b82f6',
  },
  deleteButton: {
    padding: 4,
  },
  encouragingText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#7e22ce',
    fontStyle: 'italic',
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#7e22ce',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6b21a8',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    color: '#1e40af',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#9333ea',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default ImpulseLogger;
