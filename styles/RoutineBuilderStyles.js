import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1C1F26',
  },
  container: {
    flex: 1,
    backgroundColor: '#1C1F26',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 24,
    marginTop: 8,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  inputContainer: {
    backgroundColor: '#1a1a1a',
    placeholder: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  goalInput: {
    backgroundColor: '#1a1a1a', // Consistent with generateButton background
    color: '#ffffff', // White text for readability
    borderRadius: 12, // Match the generateButton rounded corners
    paddingHorizontal: 16, // Consistent padding
    paddingVertical: 20, // Consistent vertical padding
    fontSize: 16, // Standard readable font size
    lineHeight: 20, // Better spacing for multiline input
    marginBottom: 16, // Space below the input
    marginTop: 50,
    shadowColor: '#000', // Add subtle shadow for a tactile feel
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },  
  generateButton: {
    backgroundColor: '#2f4156',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  dayButtonSelected: {
    backgroundColor: '#3d5afe',
  },
  dayButtonText: {
    color: '#848484',
    fontSize: 14,
    fontWeight: '600',
  },
  dayButtonTextSelected: {
    color: '#ffffff',
  },
  taskListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  taskListTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  addButton: {
    backgroundColor: '#3d5afe',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskListContainer: {
    width: '100%',
  },
  taskList: {
    paddingBottom: 80,
  },
  taskItem: {
    backgroundColor: '#1a1a1a',
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
  dragHandle: {
    padding: 8,
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3d5afe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#3d5afe',
  },
  taskTitleContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 4,
  },
  taskTime: {
    fontSize: 14,
    color: '#848484',
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingRight: 12,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#848484',
  },
  expandedContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#242424',
  },
  titleInput: {
    fontSize: 16,
    padding: 12,
    backgroundColor: '#242424',
    borderRadius: 8,
    marginBottom: 12,
    color: '#ffffff',
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
    color: '#3d5afe',
    fontSize: 14,
  },
  descriptionInput: {
    fontSize: 16,
    padding: 12,
    backgroundColor: '#242424',
    borderRadius: 8,
    marginBottom: 12,
    minHeight: 80,
    color: '#ffffff',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#3a1a1a',
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#ff4d4f',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 100,
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#121212',
    borderTopWidth: 1,
    borderTopColor: '#242424',
  },
  saveButton: {
    backgroundColor: '#4c5b6c',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // In RoutineBuilderStyles.js
dateButton: {
  flexDirection: "row",
  alignItems: "center",
  padding: 12,
  backgroundColor: "#2f4156",
  borderRadius: 8,
  marginBottom: 16,
},
dateButtonText: {
  color: "#fff",
  fontSize: 16,
  marginLeft: 8,
},
// Add these to your styles
fixedHeader: {
  position: 'relative',
  zIndex: 1,
  backgroundColor: 'your-background-color',
  paddingHorizontal: 16,
},
reminderOptionsContainer: {
  flexDirection: "row",
  alignItems: "center", // Align label and buttons
  marginTop: 8,
  marginBottom: 15,
},
reminderLabel: {
  color: "white", // Matches button text color
  fontWeight: "600", // Slightly bold for emphasis
  fontSize: 16, // Consistent with a modern, readable size
  marginRight: 10, // Adds spacing between label and buttons
},
reminderOptionButton: {
  paddingVertical: 6,
  paddingHorizontal: 10,
  borderRadius: 4,
  backgroundColor: "#242424",
  marginRight: 8,
},
reminderOptionButtonSelected: {
  backgroundColor: "#3d5afe",
},
reminderOptionText: {
  color: "white",
  fontSize: 14, // Slightly smaller than the label
},
reminderOptionTextSelected: {
  color: "#FFFFFF",
},
});

export default styles;