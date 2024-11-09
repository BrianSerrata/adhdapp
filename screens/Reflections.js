import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Modal,
  Portal,
  Provider as PaperProvider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import RNPickerSelect from 'react-native-picker-select';
import { format } from 'date-fns';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase'; // Adjust this import based on your project
import { LinearGradient } from 'expo-linear-gradient';


const Reflections = () => {
  const [reflections, setReflections] = useState([]);
  const [selectedReflection, setSelectedReflection] = useState(null);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReflections = async () => {
      try {
        const userRef = collection(db, 'users', auth.currentUser.uid, 'reflections');
        const q = query(userRef, orderBy('date', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date.toDate(), // Convert Firestore timestamp to JS date
          }));
          setReflections(data);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching reflections:', error);
        Alert.alert('Error', 'Failed to load reflections. Please try again later.');
        setLoading(false);
      }
    };

    fetchReflections();
  }, []);

  const openReflectionDialog = (reflection) => {
    setSelectedReflection(reflection);
    setIsDialogVisible(true);
  };

  const closeReflectionDialog = () => {
    setSelectedReflection(null);
    setIsDialogVisible(false);
  };

  const renderReflectionItem = ({ item }) => (
    <TouchableOpacity onPress={() => openReflectionDialog(item)} style={styles.cardWrapper}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Icon name="calendar" size={20} color="#4f46e5" style={styles.icon} />
          <View style={styles.cardText}>
            <Text style={styles.dateText}>{format(item.date, 'MMMM d, yyyy')}</Text>
            <Text style={styles.questionText} numberOfLines={1}>
              {item.question}
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color="#4f46e5" />
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.container}>
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Past Reflections</Text>
        </View>
        <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.container}>
        <ScrollView style={styles.scrollArea}>
          {loading ? (
            <Text style={styles.loadingText}>Loading reflections...</Text>
          ) : reflections.length === 0 ? (
            <Text style={styles.emptyText}>No reflections found. Try adjusting your filter.</Text>
          ) : (
            
            <FlatList
              data={reflections}
              keyExtractor={(item) => item.id}
              renderItem={renderReflectionItem}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </ScrollView>
</LinearGradient>
        <Portal>
          <Modal visible={isDialogVisible} onDismiss={closeReflectionDialog} contentContainerStyle={styles.modalContainer}>
            {selectedReflection && (
              <Card>
                <Card.Content>
                  <Text style={styles.modalDate}>{format(selectedReflection.date, 'MMMM d, yyyy')}</Text>
                  <Text style={styles.modalQuestion}>{selectedReflection.question}</Text>
                  <Text style={styles.modalAnswer}>{selectedReflection.answer}</Text>
                  <Button mode="contained" onPress={closeReflectionDialog} style={styles.closeButton}>
                    Close
                  </Button>
                </Card.Content>
              </Card>
            )}
          </Modal>
        </Portal>
      </SafeAreaView>
    </PaperProvider>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'linear-gradient(to bottom, #4f46e5, #9333ea)', // Gradient background
    padding: 16,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  filterContainer: {
    marginBottom: 16,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  cardText: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  questionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  scrollArea: {
    borderRadius: 8,
    backgroundColor: 'linear-gradient(to bottom, #4f46e5, #9333ea)', // Gradient background
    padding: 8,
    marginTop: 8,
  },
  listContainer: {
    paddingBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
  },
  modalContainer: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
  },
  modalDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  modalAnswer: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 16,
  },
  closeButton: {
    alignSelf: 'center',
    backgroundColor: '#4f46e5',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: '#1F2937',
    paddingRight: 30, // To ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#1F2937',
    paddingRight: 30, // To ensure the text is never behind the icon
  },
  iconContainer: {
    top: 12,
    right: 10,
  },
});

export default Reflections;
