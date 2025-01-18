import { StyleSheet } from "react-native";

const slateStyles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  safeContainer: {
    flex: 1,
    backgroundColor: '#1C1F26', // Deep slate background
  },
  container: {
    flex: 1,
    backgroundColor: '#1C1F26',
    paddingBottom: 60, // Space for the tab bar
  },
  greetingContainer: {
    paddingTop: 10, // Reduce top padding to move it closer to the top
    paddingBottom: 10, // Reduce bottom padding for tighter spacing
    paddingHorizontal: 16, // Keep some horizontal padding
    alignItems: 'flex-start', // Align content to the left
    backgroundColor: '#1C1F26', // Slightly lighter slate
    borderBottomWidth: 1,
    borderBottomColor: '#1C1F26',
  },  
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: "DM Sans",
    fontWeight: "bold",
    color: '#D1D5DB', // Soft slate gray for text
    textAlign: 'center',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: '#9CA3AF', // Muted slate gray for subtler text
    textAlign: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: '600',
    color: '#D1D5DB',
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#1C1F26',
  },
  calendarContainer: {
    margin: 10,
    marginBottom: 0,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#23272F', // Slightly lighter slate
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  routinesSection: {
    padding: 15,
  },
  dateHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 15,
    marginTop: 10,
  },
  routinesList: {
    gap: 15,
  },
  routineContainer: {
    backgroundColor: '#23272F',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2.84,
    elevation: 3,
  },
  routineName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D1D5DB',
    marginBottom: 12,
  },
  taskItem: {
    backgroundColor: '#2B3039',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2.84,
    elevation: 3,
  },
  draggingTask: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  taskTitleContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#D1D5DB',
    marginBottom: 4,
  },
  taskTime: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  expandedContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2B3039',
  },
  titleInput: {
    fontSize: 16,
    padding: 12,
    backgroundColor: '#2F3541', // Dark slate for inputs
    borderRadius: 8,
    marginBottom: 12,
    color: '#D1D5DB',
  },
  timeInputsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#2F3541',
    borderRadius: 8,
  },
  timeButtonText: {
    color: '#60A5FA', // Subtle blue accent
    fontSize: 14,
  },
  description: {
    fontSize: 16,
    padding: 12,
    backgroundColor: '#2F3541',
    borderRadius: 8,
    marginBottom: 12,
    minHeight: 80,
    color: '#D1D5DB',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#1F252E', // Slightly darker slate
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#FF4D4F',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#2B3039',
    borderRadius: 12,
    marginTop: 10,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  quoteBubbleContainer: {
    marginVertical: 20,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#23272F', // Slightly lighter slate for contrast
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 4,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#9CA3AF', // Muted slate gray for the text
    textAlign: 'center',
    lineHeight: 22,
  },
  monthHeader: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: "System", // Match the rest of the calendar's style
    color: '#D1D5DB', // Slate white text
    textAlign: 'left', // Align text to the left
    paddingLeft: 16, // Add padding for left alignment
    paddingTop: 10, // Space from the top
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3a5a40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#3a5a40',
  },
});

export default slateStyles;
