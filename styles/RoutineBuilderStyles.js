import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#171717",
  },
  container: {
    flex: 1,
    backgroundColor: "#171717",
    paddingBottom: 60, // space for bottom elements
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "600",
    color: "#FFFFFF",
    padding: 20,
    marginTop: 25,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#D1D5DB",
    marginBottom: 12,
  },
  inputContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    width: "100%",
    marginTop: 50,
    marginBottom: 16,
  },
  goalInput: {
    backgroundColor: "#252525",
    color: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    fontSize: 16,
    lineHeight: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
    width: "100%",
  },
  micButton: {
    position: "absolute",
    right: 16,
    top: "50%", 
    marginTop: -12, // Half of icon size for vertical centering
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  generateButton: {
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#252525",
  },
  dayButtonSelected: {
    backgroundColor: "#3D5AFE",
  },
  dayButtonText: {
    color: "#848484",
    fontSize: 14,
    fontWeight: "600",
  },
  dayButtonTextSelected: {
    color: "#FFFFFF",
  },
  taskListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  taskListTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  addButton: {
    backgroundColor: "#3D5AFE",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  taskListContainer: {
    width: "100%",
  },
  taskList: {
    paddingBottom: 80,
  },
  taskItem: {
    backgroundColor: "#2e2e2e",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2.84,
    elevation: 3,
  },
  draggingTask: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dragHandle: {
    padding: 8,
    marginRight: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#3D5AFE",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxCompleted: {
    backgroundColor: "#3D5AFE",
  },
  taskTitleContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#D1D5DB",
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  taskTime: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  taskContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingRight: 12,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#848484",
  },
  expandedContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#242424",
  },
  titleInput: {
    fontSize: 16,
    padding: 12,
    backgroundColor: "#242424",
    borderRadius: 8,
    marginBottom: 12,
    color: "#FFFFFF",
  },
  timeInputsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  timeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#252525",
    borderRadius: 8,
  },
  timeButtonText: {
    color: "#60A5FA",
    fontSize: 14,
  },
  descriptionInput: {
    fontSize: 16,
    padding: 12,
    backgroundColor: "#242424",
    borderRadius: 8,
    marginBottom: 12,
    minHeight: 80,
    color: "#D1D5DB",
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#242424",
    borderRadius: 8,
  },
  removeButtonText: {
    color: "#FF4D4F",
    fontSize: 14,
    fontWeight: "500",
  },
  bottomSpacing: {
    height: 100,
  },
  saveButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#121212",
    borderTopWidth: 1,
    borderTopColor: "#242424",
  },
  saveButton: {
    backgroundColor: "#4C5B6C",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#2e2e2e",
    borderRadius: 8,
    marginBottom: 16,
  },
  dateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginLeft: 8,
  },
  fixedHeader: {
    position: "relative",
    zIndex: 1,
    backgroundColor: "#1F1F1F",
    paddingHorizontal: 16,
  },
  reminderOptionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 15,
  },
  reminderLabel: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginRight: 10,
  },
  reminderOptionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: "#242424",
    marginRight: 8,
  },
  reminderOptionButtonSelected: {
    backgroundColor: "#3D5AFE",
  },
  reminderOptionText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  reminderOptionTextSelected: {
    color: "#FFFFFF",
  },
  menuIcon: {
    position: "absolute",
    top: 10,
    left: 16,
    zIndex: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#242424",
    color: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#3A1A1A",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#3D5AFE",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Dimmed background
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#1a1a1a", // Dark theme consistent with other inputs
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8, // Slight elevation for depth
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 16,
    textAlign: "center",
  },
  routineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#242424',
  },
  routineName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    flex: 1,
  },
  routineActions: {
    flexDirection: 'row',
    alignItems: 'center',
    // If your React Native version supports "gap", you can use it;
    // otherwise, use marginRight on each action:
    gap: 8,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#3d5afe',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyBackgroundContainer: {
    top: 60,  // Adjust to move down from the top
    left: 20, // Adjust to move away from the left edge
    right: 0, 
    backgroundColor: "transparent", // Ensure no background blocks other elements
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginBottom: 275,
  },
  emptyHeaderText: {
    fontSize: 23,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "left",  // Align text to the left
    marginBottom: 4,    // Reduced margin to bring text closer
    marginLeft: 5,      // Slight left padding for stagger effect
  },
  emptySubText: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "left",  // Align text to the left
    marginLeft: 4,     // More left padding to create a staggered effect
  },
  emptyIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    top: -75
  },
  targetIcon: {
    width: 100,  // Adjust size as needed
    height: 100,
    marginLeft:50,
  },
  // Ensure your main list and other content have a higher z-index (or are rendered later)
  safeArea: {
    flex: 1,
    backgroundColor: "#171717",
    position: "relative",
  },
  targetIcon: {
    marginTop: 20,
    opacity: 1, // Adjust for subtle effect
  },  
});

export default styles;