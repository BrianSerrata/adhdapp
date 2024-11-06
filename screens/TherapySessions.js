import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { auth, db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import { Feather } from '@expo/vector-icons';
import SessionSummary from '../components/SessionSummary';

const TherapySessions = ({ navigation }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchSessions = async () => {
    try {
      const sessionsRef = collection(db, 'users', auth.currentUser.uid, 'sessions');
      const q = query(sessionsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const sessionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      Alert.alert('Error', 'Failed to fetch sessions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSummaryPress = (summary) => {
    setSelectedSummary(summary);
    setModalVisible(true);
  };

  const renderSession = ({ item }) => {
    const createdAt = item.createdAt?.toDate();
    const formattedDate = createdAt ? format(createdAt, 'MMMM dd, yyyy hh:mm a') : 'Unknown Date';

    return (
      <TouchableOpacity
        style={styles.sessionItem}
        onPress={() => navigation.navigate('Session', { sessionId: item.id })}
      >
        <Text style={styles.sessionDate}>{formattedDate}</Text>
        {item.summary && (
          <TouchableOpacity onPress={() => handleSummaryPress(item.summary)} style={styles.iconButton}>
            <Feather name="book" size={20} color="#6D28D9" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6D28D9" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {sessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No past sessions found.</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderSession}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <SessionSummary summaryData={selectedSummary} onClose={() => setModalVisible(false)} />
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#F0F4F8',
  },
  listContainer: {
    paddingBottom: 16,
  },
  sessionItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  sessionDate: {
    fontSize: 16,
    color: '#1F2937',
  },
  iconButton: {
    padding: 8,
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
  },
  emptyText: {
    fontSize: 18,
    color: '#7E22CE',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  modalScrollContent: {
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#6D28D9',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default TherapySessions;