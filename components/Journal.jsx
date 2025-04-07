import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  FlatList,
  Alert
} from 'react-native';
import { format, subDays } from 'date-fns';
import JournalEntry from './JournalEntry';
import JournalEntryDetail from './JournalEntryDetail';
import NewEntryModal from './NewEntryModal';
import EmptyState from './EmptyState';
import { Feather } from '@expo/vector-icons';
import { collection, query, orderBy, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import SearchModal from './JournalSearchModal';
import FilterModal from './FilterModal';

// Sample data structure
export const sampleEntries = [
  {
    id: '1',
    date: new Date(),
    content:
      'Today was productive. I finished the main components of the app and started working on the journal feature. The design is coming together nicely, and I\'m excited to see the final result. I need to focus on the animations and transitions next to make the experience more fluid.',
    mood: 'grateful',
    tags: ['coding', 'productive'],
  },
  {
    id: '2',
    date: subDays(new Date(), 1),
    content:
      'Feeling a bit tired today, but managed to get some work done. Need to focus more tomorrow. Perhaps I should try to get to bed earlier tonight and start fresh in the morning. Sometimes a good night\'s sleep is all you need to reset.',
    mood: 'reflective',
    tags: ['tired', 'work'],
  },
];

// Replace the static entries state with Firebase data
export default function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isCreatingEntry, setIsCreatingEntry] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ mood: null, tags: [] });
  const [currentEntryId, setCurrentEntryId] = useState(null);  // Add this state

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  // Add Firebase listener for journal entries
  useEffect(() => {
    if (!auth.currentUser) return;

    const journalRef = collection(db, 'users', auth.currentUser.uid, 'journal');
    const q = query(journalRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const journalData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(), // Convert Firestore Timestamp to Date
      }));
      setEntries(journalData);
    });

    return () => unsubscribe();
  }, []);

  const todaysEntries = entries.filter(
    (entry) => format(entry.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

  const filteredEntries = entries.filter(entry => {
    if (activeFilters.mood && entry.mood !== activeFilters.mood) {
      return false;
    }
    if (activeFilters.tags.length > 0 && 
        !activeFilters.tags.every(tag => entry.tags.includes(tag))) {
      return false;
    }
    return true;
  });

  const allTags = [...new Set(entries.flatMap(entry => entry.tags))];
  const allMoods = [...new Set(entries.map(entry => entry.mood))];

  const handleSaveEntry = async (newEntry) => {
    setIsCreatingEntry(true);

    try {
      const journalRef = collection(db, 'users', auth.currentUser.uid, 'journal');
      
      const entryData = {
        date: new Date(selectedDate),
        content: newEntry.content,
        moods: newEntry.moods,
        tags: newEntry.tags,
        updatedAt: new Date(),
      };

      if (currentEntryId) {
        // Update existing entry
        const entryDocRef = doc(journalRef, currentEntryId);
        await updateDoc(entryDocRef, entryData);
      } else {
        // Create new entry
        const docRef = await addDoc(journalRef, {
          ...entryData,
          createdAt: new Date()
        });
        setCurrentEntryId(docRef.id); // Store the ID of the new entry
      }
    } catch (error) {
      console.error('Error saving journal entry:', error);
      Alert.alert('Error', 'Failed to save journal entry. Please try again.');
    } finally {
      setTimeout(() => {
        setIsCreatingEntry(false);
      }, 1000);
    }
  };

  const handleDeleteEntry = async (id) => {
    try {
      const entryRef = doc(db, 'users', auth.currentUser.uid, 'journal', id);
      await deleteDoc(entryRef);
      
      if (selectedEntry?.id === id) {
        setSelectedEntry(null);
      }
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      Alert.alert('Error', 'Failed to delete journal entry. Please try again.');
    }
  };

  const handleOpenModal = () => {
    setCurrentEntryId(null); // Reset current entry ID for new entries
    setIsModalOpen(true);
  };

  const handleEditEntry = (entry) => {
    setCurrentEntryId(entry.id);
    setIsModalOpen(true);
  };

  const hasEntries = entries.length > 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}></Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setIsSearchVisible(true)}
          >
            <Feather name="search" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setIsFilterVisible(true)}
          >
            <Feather name="more-horizontal" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Entry List */}
      <View style={styles.entriesContainer}>
        {hasEntries ? (
          <FlatList
            data={todaysEntries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <JournalEntry
                entry={item}
                onDelete={() => handleDeleteEntry(item.id)}
                onClick={() => setSelectedEntry(item)}
              />
            )}
            contentContainerStyle={styles.entriesList}
          />
        ) : (
          <EmptyState />
        )}
      </View>

      {/* Add Button */}
      <View style={styles.addButtonContainer}>
        <Animated.View 
          style={[
            styles.buttonGlow,
            { transform: [{ scale: pulseAnim }] }
          ]}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleOpenModal}  // Use new handler
          activeOpacity={0.8}
        >
          <Feather name="plus" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <NewEntryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentEntryId(null); // Reset ID when closing
        }}
        onSave={handleSaveEntry}
        existingEntry={entries.find(e => e.id === currentEntryId)}
      />

      <JournalEntryDetail
        entry={selectedEntry}
        isOpen={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onDelete={() => {
          if (selectedEntry) handleDeleteEntry(selectedEntry.id);
        }}
        onEdit={handleEditEntry}
      />

      <SearchModal
        isVisible={isSearchVisible}
        onClose={() => setIsSearchVisible(false)}
        entries={entries}
        onSelectEntry={(entry) => {
          setSelectedEntry(entry);
          setIsSearchVisible(false);
        }}
      />

      <FilterModal
        isVisible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        onApplyFilters={setActiveFilters}
        allTags={allTags}
        allMoods={allMoods}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080811',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: 'white',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  entriesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  entriesList: {
    paddingTop: 16,
    gap: 16,
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(61, 90, 254, 0.3)',
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3D5AFE',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#3D5AFE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});