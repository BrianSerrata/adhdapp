import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#121212',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 20,
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
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#3d5afe',
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxCompleted: {
      backgroundColor: '#3d5afe',
      borderColor: '#3d5afe',
    },
    checkmark: {
      width: 12,
      height: 12,
      backgroundColor: '#ffffff',
      borderRadius: 6,
    },
    taskTitle: {
      fontSize: 16,
      color: '#ffffff',
      flex: 1,
    },
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
  });

export default styles