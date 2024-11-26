// src/styles/TherapyChatStyles.js

import { StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  endSessionButton: {
    padding: 8,
  },
  headerTimer: {
    fontSize: 14,
    color: '#6D28D9',
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 8,
  },
  messageRow: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 2,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userBubble: {
    backgroundColor: '#6D28D9',
    borderWidth: 1,
    borderColor: '#6B21A8',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  aiText: {
    color: '#1F2937',
  },
  userText: {
    color: '#FFFFFF',
  },
  bottomContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
    padding: 12,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 2,
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 2,
  },
  loadingText: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1F2937',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 20,
  },
  durationButton: {
    backgroundColor: '#6D28D9',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginVertical: 8,
    width: '100%',
  },
  durationButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  suggestionCard: {
    backgroundColor: '#6D28D9', // Purple background
    paddingVertical: 6, // Slightly increased height for better touch area
    paddingHorizontal: 16, // Adjusted padding for better spacing
    borderRadius: 20, // More rounded corners
    marginRight: 8, // Space between cards
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    minWidth: 80, // Ensure the cards are wide enough
    height: 35, // Increased height for better visibility
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: 14, // Slightly larger font size for readability
    color: '#ffffff', // White text for contrast
    textAlign: 'center', // Center the text
  },
  suggestionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionsWrapper: {
    marginBottom: 8, // Space between suggestions and input
  },
  journalButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#6D28D9",
    borderRadius: 5,
  },
  journalButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  centeredView: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalInput: {
    width: '100%',
    height: 100,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: '45%',
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F3F4F6',
  },
  modalButtonSave: {
    backgroundColor: '#6D28D9',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },  
});

export default styles;
