import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    gradient: {
      flex: 1,
    },
    container: {
      flex: 1,
      paddingHorizontal: 16,
    },
    backButton: {
      marginRight: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
      backgroundColor: 'white',
    },
    headerTextContainer: {
      flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
      },
      headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
      },
    listContainer: {
      padding: 16,
    },
    sessionCard: {
      backgroundColor: '#FFFFFF',
      padding: 16,
      borderRadius: 16,
      marginBottom: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 2,
    },
    sessionContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sessionDate: {
      fontSize: 16,
      color: '#1F2937',
    },
    iconButton: {
      padding: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 40,
    },
    emptyText: {
      fontSize: 18,
      color: '#4B5563',
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '90%',
      maxHeight: '80%',
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalScrollContent: {
      flexGrow: 1,
    },
    closeButton: {
      marginTop: 15,
      backgroundColor: '#4F46E5',
      borderRadius: 20,
      paddingVertical: 10,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
});

export default styles;
