import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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

export default function JournalEntry({ entry, onDelete, onClick }) {
  const formattedTime = format(entry.date, 'h:mm a');
  const contentPreview = entry.content.length > 100 
    ? `${entry.content.substring(0, 100).trim()}...` 
    : entry.content;

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onClick}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.moodScrollView}
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
                  <Text style={[
                    styles.moodText,
                    { color: moodColors[mood]?.text || moodColors.reflective.text }
                  ]}>
                    {mood}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <Text style={styles.timeText}>{formattedTime}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={onClick}
          >
            <Feather name="more-horizontal" size={16} color="rgba(255, 255, 255, 0.7)" />
          </TouchableOpacity>
        </View>

        <Text style={styles.contentText}>{contentPreview}</Text>

        <View style={styles.footer}>
          {entry.tags.length > 0 ? (
            <View style={styles.tagsContainer}>
              {entry.tags.slice(0, 2).map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
              {entry.tags.length > 2 && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>+{entry.tags.length - 2} more</Text>
                </View>
              )}
            </View>
          ) : (
            <View />
          )}
          <TouchableOpacity style={styles.chevronButton}>
            <Feather name="chevron-right" size={20} color="#3D5AFE" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginBottom: 16,
  },
  cardContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'column',
    gap: 8,
  },
  moodScrollView: {
    flexGrow: 0,
  },
  moodBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
  },
  moodText: {
    fontSize: 12,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  moreButton: {
    padding: 4,
  },
  contentText: {
    color: 'rgba(255, 255, 255, 0.82)',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  chevronButton: {
    padding: 4,
  },
});