import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'

export default function Component() {
  const [showFullSummary, setShowFullSummary] = useState(false)

  const keyTakeaways = [
    "Identified triggers for procrastination",
    "Explored strategies for improving time management",
    "Discussed the importance of self-compassion",
    "Recognized progress in managing impulsivity"
  ]

  const issuesAcknowledged = [
    "Difficulty with task initiation",
    "Overwhelm from multiple responsibilities",
    "Negative self-talk patterns",
    "Challenges with maintaining consistent routines"
  ]

  const actionSteps = [
    "Implement a Pomodoro technique for focused work sessions",
    "Create a daily prioritization system using the Eisenhower Matrix",
    "Practice mindfulness for 5 minutes each morning",
    "Establish a bedtime routine to improve sleep hygiene"
  ]

  return (
    <LinearGradient colors={['#e9d5ff', '#dbeafe']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Session Summary</Text>
        <TouchableOpacity style={styles.closeButton}>
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

        {!showFullSummary && (
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setShowFullSummary(true)}
          >
            <Text style={styles.expandButtonText}>Show Full Summary</Text>
            <Feather name="chevron-down" size={20} color="#9333ea" />
          </TouchableOpacity>
        )}

        {showFullSummary && (
          <View style={styles.fullSummary}>
            <Text style={styles.fullSummaryTitle}>Full Session Summary</Text>
            <Text style={styles.fullSummaryText}>
              In today's session, we focused on addressing your challenges with procrastination and time management. 
              We identified specific triggers that lead to procrastination, such as feeling overwhelmed by large tasks 
              and perfectionist tendencies. To combat these issues, we explored strategies like task breakdown and the 
              Pomodoro technique.

              We also discussed the importance of self-compassion, especially when dealing with ADHD-related difficulties. 
              You recognized that negative self-talk has been impacting your motivation, and we practiced reframing these 
              thoughts into more supportive internal dialogues.

              A significant breakthrough was your realization of the progress you've made in managing impulsivity. 
              We celebrated this achievement and discussed how to build upon this success in other areas of your life.

              Moving forward, we've outlined several action steps to help you maintain momentum. These include implementing 
              structured work sessions, creating a prioritization system, and establishing consistent routines for better 
              overall functioning.

              Remember, change is a process, and every small step counts. Be patient with yourself as you implement these 
              new strategies, and don't hesitate to reach out if you need support between sessions.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <Feather name="download" size={20} color="#ffffff" style={styles.footerButtonIcon} />
          <Text style={styles.footerButtonText}>Save Summary</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.footerButton, styles.primaryButton]}>
          <Feather name="check" size={20} color="#ffffff" style={styles.footerButtonIcon} />
          <Text style={styles.footerButtonText}>End Session</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  )
}

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
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 24,
  },
  expandButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9333ea',
    marginRight: 8,
  },
  fullSummary: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  fullSummaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 12,
  },
  fullSummaryText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    backgroundColor: '#9333ea',
    flex: 1,
    marginRight: 8,
  },
  primaryButton: {
    backgroundColor: '#7e22ce',
    marginRight: 0,
    marginLeft: 8,
  },
  footerButtonIcon: {
    marginRight: 8,
  },
  footerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
})