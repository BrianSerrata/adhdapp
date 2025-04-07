import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated
} from 'react-native';
import { format } from 'date-fns';
import { Feather } from '@expo/vector-icons';

const moodColors = {
  reflective: { bg: 'rgba(66, 135, 245, 0.1)', text: '#4287f5' },
  joyful: { bg: 'rgba(245, 215, 66, 0.1)', text: '#f5d742' },
  anxious: { bg: 'rgba(245, 147, 66, 0.1)', text: '#f59342' },
  melancholy: { bg: 'rgba(111, 66, 245, 0.1)', text: '#6f42f5' },
  grateful: { bg: 'rgba(66, 245, 111, 0.1)', text: '#42f56f' },
  frustrated: { bg: 'rgba(245, 66, 66, 0.1)', text: '#f54242' },
  peaceful: { bg: 'rgba(66, 245, 215, 0.1)', text: '#42f5d7' },
  energetic: { bg: 'rgba(179, 66, 245, 0.1)', text: '#b342f5' },
};

// Add onEdit to props
export default function JournalEntryDetail({ entry, isOpen, onClose, onDelete, onEdit }) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {toValue: 1,
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
  
    if (!entry || !isOpen) return null;
  
    const formattedDate = format(entry.date, 'EEEE, MMMM d, yyyy');
    const formattedTime = format(entry.date, 'h:mm a');
  
    // Function to convert plain text to paragraphs
    const formatContent = (content) => {
      return content.split('\n').map((paragraph, index) => (
        <Text key={index} style={[styles.contentText, index > 0 && styles.paragraphSpacing]}>
          {paragraph}
        </Text>
      ));
    };
  
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
          
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.dateText}>{formattedDate}</Text>
                  <Text style={styles.timeText}>{formattedTime}</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                >
                  <Feather name="x" size={16} color="rgba(255, 255, 255, 0.7)" />
                </TouchableOpacity>
              </View>
  
              <ScrollView style={styles.modalBody}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.moodBadgeContainer}
                >
                  {entry.moods.map((mood, index) => (
                    <View 
                      key={index}
                      style={[
                        styles.moodBadge,
                        { backgroundColor: moodColors[mood]?.bg || moodColors.reflective.bg },
                        index > 0 && { marginLeft: 8 }
                      ]}
                    >
                      <Text 
                        style={[
                          styles.moodText,
                          { color: moodColors[mood]?.text || moodColors.reflective.text }
                        ]}
                      >
                        {mood}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
  
                <View style={styles.contentContainer}>
                  {formatContent(entry.content)}
                </View>
  
                {entry.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {entry.tags.map((tag) => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
  
              <View style={styles.modalFooter}>
                <View style={styles.footerButtons}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                      onEdit(entry);
                      onClose();
                    }}
                  >
                    <Feather name="edit-2" size={16} color="#3D5AFE" style={styles.editIcon} />
                    <Text style={styles.editText}>Edit Entry</Text>
                  </TouchableOpacity>
  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={onDelete}
                  >
                    <Feather name="trash-2" size={16} color="#f54242" style={styles.deleteIcon} />
                    <Text style={styles.deleteText}>Delete Entry</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
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
    modalContent: {
      backgroundColor: '#121220',
      borderRadius: 24,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      width: '100%',
      maxWidth: 400,
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    dateText: {
      fontSize: 20,
      fontWeight: '300',
      color: 'white',
    },
    timeText: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.7)',
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
      maxHeight: 500,
    },
    moodBadgeContainer: {
      marginBottom: 16,
      flexGrow: 0,
    },
    moodBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 100,
    },
    moodText: {
      fontSize: 12,
      fontWeight: '500',
    },
    contentContainer: {
      marginBottom: 24,
    },
    contentText: {
      color: 'rgba(255, 255, 255, 0.82)',
      fontSize: 16,
      lineHeight: 24,
    },
    paragraphSpacing: {
      marginTop: 16,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    tag: {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 6,
    },
    tagText: {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: 14,
    },
    modalFooter: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    footerButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    editIcon: {
      marginRight: 8,
    },
    editText: {
      color: '#3D5AFE',
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    deleteIcon: {
      marginRight: 8,
    },
    deleteText: {
      color: '#f54242',
    },
  });

