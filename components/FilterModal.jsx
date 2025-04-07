import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// First, define a constant array of all possible moods at the top of the file
const MOODS = [
  "reflective",
  "joyful",
  "anxious",
  "melancholy",
  "grateful",
  "frustrated",
  "peaceful",
  "energetic",
];

const FilterModal = ({ isVisible, onClose, onApplyFilters, allTags, allMoods }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleApply = () => {
    onApplyFilters({
      mood: selectedMood,
      tags: selectedTags,
    });
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter Entries</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.sectionTitle}>Mood</Text>
            <View style={styles.moodGrid}>
              {MOODS.map(mood => (
                <TouchableOpacity
                  key={mood}
                  style={[
                    styles.moodItem,
                    selectedMood === mood && styles.selectedMood
                  ]}
                  onPress={() => setSelectedMood(mood === selectedMood ? null : mood)}
                >
                  <Text style={[
                    styles.moodText,
                    selectedMood === mood && styles.selectedMoodText
                  ]}>
                    {mood}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagList}>
              {allTags.map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagItem,
                    selectedTags.includes(tag) && styles.selectedTag
                  ]}
                  onPress={() => handleTagToggle(tag)}
                >
                  <Text style={styles.tagText}>#{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSelectedMood(null);
                setSelectedTags([]);
              }}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    marginTop: 16,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  moodItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#242424',
    minWidth: '30%',
    alignItems: 'center',
  },
  selectedMood: {
    backgroundColor: '#3d5afe',
  },
  moodText: {
    color: '#848484',
    fontSize: 14,
  },
  selectedMoodText: {
    color: '#fff',
    fontWeight: '500',
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#242424',
  },
  selectedTag: {
    backgroundColor: '#3d5afe',
  },
  tagText: {
    color: '#fff',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#242424',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  applyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#3d5afe',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FilterModal;