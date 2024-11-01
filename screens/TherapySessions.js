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

  // Fetch all sessions from Firestore
  const fetchSessions = async () => {
    try {
      const sessionsRef = collection(db, 'users', auth.currentUser.uid, 'sessions');
      const q = query(sessionsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const sessionsData = querySnapshot.docs.map(doc => ({
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

  // Render each session item
  const renderSession = ({ item }) => {
    const createdAt = item.createdAt?.toDate();
    const formattedDate = createdAt ? format(createdAt, 'MMMM dd, yyyy hh:mm a') : 'Unknown Date';

    return (
      <TouchableOpacity
        style={styles.sessionItem}
        onPress={() => navigation.navigate('Session', { sessionId: item.id })}
      >
        <Text style={styles.sessionDate}>{formattedDate}</Text>
        
        {/* Conditionally render book icon if summary exists */}
        {item.summary && (
          <TouchableOpacity onPress={() => handleSummaryPress(item.summary)} style={styles.iconButton}>
            <Feather name="book" size={20} color="#9333ea" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9333ea" />
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
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Modal for Session Summary */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <SessionSummary 
          summaryData={selectedSummary} 
          onClose={() => setModalVisible(false)} 
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#e9d5ff',
  },
  listContainer: {
    paddingBottom: 16,
  },
  sessionItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  sessionDate: {
    fontSize: 16,
    color: '#9333ea',
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
    color: '#7e22ce',
  },
});

export default TherapySessions;
