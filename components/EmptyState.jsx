import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function EmptyState() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Feather name="book-open" size={48} color="rgba(255, 255, 255, 0.2)" />
      </View>
      <Text style={styles.title}>No entries yet</Text>
      <Text style={styles.description}>
        Start journaling by tapping the + button below
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '300',
    color: 'white',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
});