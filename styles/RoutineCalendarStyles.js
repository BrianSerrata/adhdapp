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
    // Dark background for the entire screen
    backgroundColor: '#171717',
  },
  container: {
    flex: 1,
    backgroundColor: '#171717',
    paddingBottom: 60, // Space for the tab bar
  },
  greetingContainer: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    backgroundColor: '#171717',
    borderBottomWidth: 1,
    borderBottomColor: '#171717',
  },  
  greeting: {
    fontSize: 24,
    fontFamily: "DM Sans",
    fontWeight: "bold",
    // White text for the greeting
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: '#9CA3AF', // Muted gray for subtler text
    textAlign: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: '600',
    // White text for larger headers
    color: '#FFFFFF',
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#111111',
  },
  // White "card" for the calendar
  calendarContainer: {
    margin: 16,
    marginTop: 8,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  routinesSection: {
    padding: 15,
    bottom: 30
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
    backgroundColor: '#252525', // Darker background to align with the black aesthetic
    borderRadius: 15, // Slightly more rounded corners for a softer feel
    padding: 16, // Increased padding for a more spacious layout
    marginBottom: 16, // Reduced margin for closer stacking
    marginTop: 16,
    shadowColor: '#000', // Darker shadow for depth
    shadowOffset: { width: 0, height: 2 }, // Slightly deeper shadow for better definition
    shadowOpacity: 0.3, 
    shadowRadius: 4,
    elevation: 5, // Stronger elevation for a floating effect
    borderWidth: 1, 
    borderColor: '#2A2D34', // Subtle border for separation without being too prominent
  },
  routineName: {
    fontSize: 18,
    fontWeight: 'bold', // Bold for clear visibility
    color: '#E5E7EB', // Lighter slate gray for better contrast on a dark background
    marginBottom: 8, // Reduced margin for tighter spacing
  },
  taskItem: {
    backgroundColor: '#2e2e2e', // Darker shade for tasks to align with the black theme
    borderRadius: 15, // Matches the container's rounded corners
    marginBottom: 12, // Consistent spacing between tasks
    shadowColor: '#000', // Subtle shadow to lift tasks slightly off the background
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4, // Slight elevation for separation
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
  taskTitleCompleted: {
    textDecorationLine: 'line-through', 
    color: '#999', 
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
    backgroundColor: '#2F3541', 
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
    backgroundColor: '#242424',
    borderRadius: 8,
  },
  timeButtonText: {
    color: '#60A5FA', // Blue accent
    fontSize: 14,
  },
  description: {
    fontSize: 16,
    padding: 12,
    backgroundColor: '#242424',
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
    backgroundColor: '#1F252E',
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
  quoteBubbleContainer: {
    marginVertical: 20,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#252525',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 4,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
  monthHeader: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: "System", 
    // Black text on a white background card
    color: '#000000', 
    textAlign: 'left', 
    paddingLeft: 16, 
    paddingTop: 10, 
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
  emptyStateTouchable: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#A0AEC0',
    marginBottom: 5,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
  },
  actionButtonContainer: {
    marginTop: 15,
    alignSelf: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  subtext: {
    marginTop: 8,
    fontSize: 16,
    color: "#848484",
    textAlign: "center",
  },
  fireIconContainer: {
    position: "absolute",
    bottom: 1,
    right: 20,
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 16,
  },
  progressBar: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2A2A2A',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressChunk: {
    height: '100%',
    borderRightWidth: 2,
    borderRightColor: '#111111',
  },
  incompleteChunk: {
    flex: 1,
    backgroundColor: '#3A3A3A',
  },
  progressFill: {
    flex: 1,
  },
  fireContainer: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fireIcon: {
    width: 24,
    height: 24,
    marginLeft: 4,
  },
  streakText: {
    color: '#FFA500',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  minimizeButton: {
    padding: 10,
    backgroundColor: "#252525",
    borderRadius: 5,
    marginBottom: 10,
    alignSelf: "flex-end",
    right: 36, 
    top: 10,
  },
  minimizeButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },  
});

export default slateStyles;
