import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const MOODS = [
  'reflective',
  'joyful',
  'anxious',
  'melancholy',
  'grateful',
  'frustrated',
  'peaceful',
  'energetic',
];

const moodColors = {
  reflective: { bg: 'rgba(66, 135, 245, 0.1)', text: '#4287f5', border: 'rgba(66, 135, 245, 0.3)' },
  joyful: { bg: 'rgba(245, 215, 66, 0.1)', text: '#f5d742', border: 'rgba(245, 215, 66, 0.3)' },
  anxious: { bg: 'rgba(245, 147, 66, 0.1)', text: '#f59342', border: 'rgba(245, 147, 66, 0.3)' },
  melancholy: { bg: 'rgba(111, 66, 245, 0.1)', text: '#6f42f5', border: 'rgba(111, 66, 245, 0.3)' },
  grateful: { bg: 'rgba(66, 245, 111, 0.1)', text: '#42f56f', border: 'rgba(66, 245, 111, 0.3)' },
  frustrated: { bg: 'rgba(245, 66, 66, 0.1)', text: '#f54242', border: 'rgba(245, 66, 66, 0.3)' },
  peaceful: { bg: 'rgba(66, 245, 215, 0.1)', text: '#42f5d7', border: 'rgba(66, 245, 215, 0.3)' },
  energetic: { bg: 'rgba(179, 66, 245, 0.1)', text: '#b342f5', border: 'rgba(179, 66, 245, 0.3)' },
};

export default function NewEntryModal({ isOpen, onClose, onSave, existingEntry = null }) {
  const [content, setContent] = useState('');
  const [selectedMoods, setSelectedMoods] = useState(['reflective']);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const autoSaveTimer = useRef(null);
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;
  const buttonScaleAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 15,
          stiffness: 150,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);
    }
  }, [isOpen]);

  useEffect(() => {
    if (existingEntry) {
      setContent(existingEntry.content);
      setSelectedMoods(existingEntry.moods);
      setTags(existingEntry.tags);
    }
  }, [existingEntry]);

  useEffect(() => {
    if (content.trim() && isDirty) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      
      autoSaveTimer.current = setTimeout(() => {
        handleSave(true);
      }, 1000);
    }
    
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [content, selectedMoods, tags]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
      setIsDirty(true);
    }
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
    setIsDirty(true);
  };

  const handleMoodToggle = (mood) => {
    setSelectedMoods(prev => {
      if (prev.includes(mood)) {
        return prev.filter(m => m !== mood);
      }
      return [...prev, mood];
    });
    setIsDirty(true);
  };

  const handleContentChange = (text) => {
    setContent(text);
    setIsDirty(true);
  };

  const handleSave = async (isAutoSave = false) => {
    if (content.trim()) {
      setIsSaving(true);
      
      if (!isAutoSave) {
        Animated.sequence([
          Animated.timing(buttonScaleAnim, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true
          }),
          Animated.timing(buttonScaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true
          })
        ]).start();
      }

      const entryData = {
        content,
        moods: selectedMoods,
        tags,
      };
      
      onSave(entryData, existingEntry?.id);

      if (!isAutoSave) {
        setContent('');
        setSelectedMoods(['reflective']);
        setTags([]);
        onClose();
      }
      
      setIsSaving(false);
      setIsDirty(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            { opacity: fadeAnim },
            styles.overlayBackground
          ]}
        />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1} onPress={() => Keyboard.dismiss()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Entry</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                >
                  <Feather name="x" size={16} color="rgba(255, 255, 255, 0.7)" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Mood</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.moodButtonsContainer}
                  >
                    {MOODS.map((mood) => (
                      <TouchableOpacity
                        key={mood}
                        style={[
                          styles.moodButton,
                          selectedMoods.includes(mood)
                            ? {
                                backgroundColor: moodColors[mood].bg,
                                borderColor: moodColors[mood].border,
                              }
                            : {
                                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                borderColor: 'rgba(255, 255, 255, 0.15)',
                              },
                        ]}
                        onPress={() => handleMoodToggle(mood)}
                      >
                        <Text
                          style={[
                            styles.moodButtonText,
                            selectedMoods.includes(mood)
                              ? { color: moodColors[mood].text }
                              : { color: 'rgba(255, 255, 255, 0.7)' },
                          ]}
                        >
                          {mood}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.section}>
                  <TextInput
                    style={styles.contentInput}
                    placeholder="What's on your mind?"
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    value={content}
                    onChangeText={handleContentChange}
                    multiline
                    textAlignVertical="top"
                    numberOfLines={5}
                    autoFocus
                  />
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Tags</Text>
                  <View style={styles.tagsContainer}>
                    {tags.map((tag) => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveTag(tag)}
                        >
                          <Text style={styles.removeTagButton}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                  <View style={styles.tagInputContainer}>
                    <TextInput
                      style={styles.tagInput}
                      placeholder="Add a tag..."
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      value={tagInput}
                      onChangeText={setTagInput}
                      onSubmitEditing={handleAddTag}
                    />
                    <TouchableOpacity
                      style={styles.addTagButton}
                      onPress={handleAddTag}
                    >
                      <Text style={styles.addTagButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  <View style={styles.buttonGlow} />
                  <Animated.View style={{
                    transform: [{ scale: buttonScaleAnim }],
                    width: '100%'
                  }}>
                    <TouchableOpacity
                      style={[
                        styles.saveButton,
                        !content.trim() || isSaving
                          ? { opacity: 0.6 }
                          : null,
                      ]}
                      onPress={() => handleSave(false)}
                      disabled={!content.trim() || isSaving}
                    >
                      <Text style={styles.saveButtonText}>
                        {isSaving ? 'Saving...' : 'Save'}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </ScrollView>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(8px)',
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: '#121220',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: 'white',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 20,
    maxHeight: '80%',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  moodButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 4,
  },
  moodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    marginRight: 8,
  },
  moodButtonText: {
    fontSize: 12,
  },
  contentInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    height: 150,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  removeTagButton: {
    marginLeft: 6,
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 16,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRightWidth: 0,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    padding: 12,
    color: 'white',
  },
  addTagButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  addTagButtonText: {
    color: 'white',
  },
  buttonContainer: {
    position: 'relative',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  buttonGlow: {
    position: 'absolute',
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(61, 90, 254, 0.2)',
    bottom: 0,
    alignSelf: 'center',
    opacity: 0.8,
  },
  saveButton: {
    backgroundColor: '#3D5AFE',
    borderRadius: 100,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});