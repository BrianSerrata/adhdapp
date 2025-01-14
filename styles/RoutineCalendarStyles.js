import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    safeContainer: {
      flex: 1,
      backgroundColor: '#121212', // Match your app's background color
    },
    container: {
      flex: 1,
      backgroundColor: '#121212',
      paddingBottom: 60, // Space for the tab bar
    },
    greetingContainer: {
      paddingTop: 40, // Space for the header
      paddingBottom: 20,
      paddingHorizontal: 16,
      backgroundColor: '#121212',
      borderBottomWidth: 1,
      borderBottomColor: '#121212',
      alignItems: 'center',
    },
    greeting: {
      fontSize: 24,
      fontWeight: '600',
      color: '#ffffff',
      textAlign: 'center',
      marginBottom: 4,
    },
    subGreeting: {
      fontSize: 16,
      color: '#848484',
      textAlign: 'center',
    },
    header: {
      fontSize: 28,
      fontWeight: '600',
      color: '#ffffff',
      padding: 20,
      paddingBottom: 10,
      backgroundColor: '#121212',
    },
    calendarContainer: {
      margin: 10,
      marginBottom: 0,
      borderRadius: 15,
      overflow: 'hidden',
      backgroundColor: '#1a1a1a',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    routinesSection: {
      padding: 15,
    },
    dateHeader: {
      fontSize: 20,
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: 15,
      marginTop: 10,
    },
    routinesList: {
      gap: 15,
    },
    routineContainer: {
      backgroundColor: '#1a1a1a',
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
      color: '#ffffff',
      marginBottom: 12,
    },
    taskRow: {
      paddingVertical: 10,
    },
    taskContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    // checkbox: {
    //   width: 24,
    //   height: 24,
    //   borderRadius: 12,
    //   borderWidth: 2,
    //   borderColor: '#3d5afe',
    //   marginRight: 12,
    //   justifyContent: 'center',
    //   alignItems: 'center',
    // },
    // checkboxCompleted: {
    //   backgroundColor: '#3d5afe',
    //   borderColor: '#3d5afe',
    // },
    // checkmark: {
    //   width: 12,
    //   height: 12,
    //   backgroundColor: '#ffffff',
    //   borderRadius: 6,
    // },
    // taskTitle: {
    //   fontSize: 16,
    //   color: '#ffffff',
    //   flex: 1,
    // },
    taskTitleCompleted: {
      color: '#848484',
      textDecorationLine: 'line-through',
    },
    emptyState: {
      alignItems: 'center',
      padding: 30,
      backgroundColor: '#1a1a1a',
      borderRadius: 12,
      marginTop: 10,
    },
    emptyStateText: {
      fontSize: 18,
      color: '#848484',
      fontWeight: '600',
      marginBottom: 8,
    },
    emptyStateSubtext: {
      fontSize: 14,
      color: '#616161',
      textAlign: 'center',
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
  });

export default styles