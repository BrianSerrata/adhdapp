// src/components/SessionSummary.js

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SessionSummary = ({ summaryData, onClose }) => {
  const { keyTakeaways, issuesAcknowledged, actionSteps } = summaryData;

  return (
    <LinearGradient colors={['#e9d5ff', '#dbeafe']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Session Summary</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Feather name="x" size={24} color="#7e22ce" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Takeaways</Text>
          {keyTakeaways.map((takeaway, index) => (
            <View key={index} style={styles.listItem}>
              <Feather name="check-circle" size={20} color="#9333ea" style={styles.listIcon} />
              <Text style={styles.listText}>{takeaway}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Issues Acknowledged</Text>
          {issuesAcknowledged.map((issue, index) => (
            <View key={index} style={styles.listItem}>
              <Feather name="alert-circle" size={20} color="#9333ea" style={styles.listIcon} />
              <Text style={styles.listText}>{issue}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Action Steps</Text>
          {actionSteps.map((step, index) => (
            <View key={index} style={styles.listItem}>
              <Feather name="arrow-right-circle" size={20} color="#9333ea" style={styles.listIcon} />
              <Text style={styles.listText}>{step}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.footerButton, styles.primaryButton]} onPress={onClose}>
          <Feather name="check" size={20} color="#ffffff" style={styles.footerButtonIcon} />
          <Text style={styles.footerButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7e22ce',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#7e22ce',
  },
  footerButtonIcon: {
    marginRight: 8,
  },
  footerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SessionSummary;