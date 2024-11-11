import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  // Container and Background Styles
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  gradientBackground: {
    flex: 1,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  backButton: {
    marginRight: 12,
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

  // List and Entry Styles
  messageList: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  messageRow: {
    marginBottom: 16,
  },
  messageBubble: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },

  // Input Container Styles
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Loading and Empty States
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
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
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
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // Added to support proper layout structure
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalLoadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  modalScrollView: {
    maxHeight: '70%',
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  modalText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
    padding: 10,
  },
  // Updated button styles
  closeButtonBottom: {
    marginTop: 15, // Add space between scroll content and button
    width: '100%', // Take full width to ensure consistent positioning
    backgroundColor: '#6D28D9',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center', // Center the text horizontally
    justifyContent: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeButtonTop: {
    padding: 4,
  },
    container: {
      flex: 1,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    contentContainer: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
    },
    messageList: {
      flex: 1,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
    },
    input: {
      flex: 1,
      minHeight: 40,
      maxHeight: 100,
      backgroundColor: '#F3F4F6',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 8,
      fontSize: 16,
      color: '#1F2937',
    },
});

export default styles;