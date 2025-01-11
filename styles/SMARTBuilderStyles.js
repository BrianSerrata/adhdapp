import { StyleSheet } from "react-native";


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#121212',
    },
    scrollContainer: {
      padding: 20,
    },
    header: {
      fontSize: 28,
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: 20,
    },
    inputContainer: {
      backgroundColor: '#1a1a1a',
      borderRadius: 12,
      padding: 15,
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      color: '#ffffff',
      marginBottom: 8,
      fontWeight: '500',
    },
    input: {
      backgroundColor: '#242424',
      borderRadius: 8,
      padding: 12,
      color: '#ffffff',
      fontSize: 16,
      minHeight: 45,
    },
    dateContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 15,
    },
    dateButton: {
      flex: 1,
      backgroundColor: '#242424',
      borderRadius: 8,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    dateButtonText: {
      color: '#ffffff',
      fontSize: 14,
    },
    generateButton: {
      backgroundColor: '#3d5afe',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      marginTop: 20,
    },
    generateButtonText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: '600',
    },
    // Day selection styles
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3d5afe',
    marginVertical: 4,
    minWidth: 45,
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: '#3d5afe',
  },
  dayButtonText: {
    color: '#3d5afe',
    fontSize: 14,
    fontWeight: '500',
  },
  dayButtonTextSelected: {
    color: '#ffffff',
  },
  phaseContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  phaseTitleContainer: {
    flex: 1,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  phaseDuration: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  phaseDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  phaseContent: {
    padding: 16,
  },
  metricsContainer: {
    backgroundColor: '#f5f9ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  metricsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  metricsValue: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  metricsDescription: {
    fontSize: 14,
    color: '#666',
  },
  tasksContainer: {
    marginTop: 16,
  },
  tasksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#3d5afe',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3d5afe',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#ffffff',
  }
  });

  export default styles