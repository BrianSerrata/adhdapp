import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: "#F2F2F7"
    },
    header: {
      fontSize: 34,
      fontWeight: "bold",
      color: "#000",
      marginBottom: 24,
      marginTop: 8
    },
    inputContainer: {
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3
    },
    goalInput: {
      fontSize: 16,
      minHeight: 80,
      marginBottom: 16,
      color: "#000"
    },
    generateButton: {
      backgroundColor: "#007AFF",
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    },
    generateButtonDisabled: {
      opacity: 0.7
    },
    generateButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600"
    },
    taskListHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16
    },
    taskListTitle: {
      fontSize: 22,
      fontWeight: "600",
      color: "#000"
    },
    addButton: {
      backgroundColor: "#34C759",
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center"
    },
    taskList: {
      paddingBottom: 80
    },
    taskItem: {
      backgroundColor: "#fff",
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
    },
    draggingTask: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5
    },
    taskHeader: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 12
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: "#007AFF",
      alignItems: "center",
      justifyContent: "center"
    },
    checkboxCompleted: {
      backgroundColor: "#007AFF"
    },
    taskTitleContainer: {
      flex: 1
    },
    taskTitle: {
      fontSize: 16,
      fontWeight: "500",
      color: "#000",
      marginBottom: 4
    },
    taskTime: {
      fontSize: 14,
      color: "#666"
    },
    completedText: {
      textDecorationLine: "line-through",
      color: "#999"
    },
    expandedContent: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: "#E5E5EA"
    },
    titleInput: {
      fontSize: 16,
      padding: 12,
      backgroundColor: "#F2F2F7",
      borderRadius: 8,
      marginBottom: 12
    },
    timeInputsContainer: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 12
    },
    timeButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 12,
      backgroundColor: "#F2F2F7",
      borderRadius: 8
    },
    timeButtonText: {
      color: "#007AFF",
      fontSize: 14
    },
    descriptionInput: {
      fontSize: 16,
      padding: 12,
      backgroundColor: "#F2F2F7",
      borderRadius: 8,
      marginBottom: 12,
      minHeight: 80
    },
    removeButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 12,
      backgroundColor: "#FFE5E5",
      borderRadius: 8
    },
    removeButtonText: {
      color: "#FF3B30",
      fontSize: 14,
      fontWeight: "500"
    },
    saveButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600"
    },
    safeArea: {
        flex: 1,
        backgroundColor: "#F2F2F7"
      },
      scrollContent: {
        padding: 16
      },
      // ... keep existing styles ...
      taskListContainer: {
        // Remove any height constraints
        width: '100%'
      },
      bottomSpacing: {
        height: 100 // Space for the save button
      },
      saveButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: '#F2F2F7',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA'
      },
      saveButton: {
        backgroundColor: "#007AFF",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3
      },
      // Pseudocode for styles
daysContainer: {
  flexDirection: "row",
  justifyContent: "space-around",
  marginVertical: 12,
},
dayButton: {
  paddingVertical: 10,
  paddingHorizontal: 14,
  borderRadius: 20,
  backgroundColor: "#eee",
},
dayButtonSelected: {
  backgroundColor: "#6D28D9",
},
dayButtonText: {
  fontSize: 16,
  color: "#666",
},
dayButtonTextSelected: {
  color: "#fff",
},
  });

export default styles