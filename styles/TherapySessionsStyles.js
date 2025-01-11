import { StyleSheet } from "react-native";

const TherapyChatStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#242424',
  },
  backButton: {
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerTimer: {
    fontSize: 14,
    color: '#848484',
  },
  endSessionButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
    padding: 10,
  },
  messageList: {
    paddingVertical: 10,
  },
  messageRow: {
    marginBottom: 12,
  },
  aiRow: {
    alignItems: 'flex-start',
  },
  userRow: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  aiBubble: {
    backgroundColor: '#1a1a1a',
    borderBottomLeftRadius: 0,
  },
  userBubble: {
    backgroundColor: '#3d5afe',
    borderBottomRightRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: '#ffffff',
  },
  aiText: {
    color: '#ffffff',
  },
  userText: {
    color: '#ffffff',
  },
  journalButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#6D28D9',
  },
  journalButtonText: {
    fontSize: 14,
    color: '#ffffff',
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#848484',
    marginLeft: 8,
  },
  bottomContainer: {
    padding: 8,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#242424',
  },
  suggestionsWrapper: {
    marginBottom: 8,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  suggestionCard: {
    backgroundColor: '#242424',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestionText: {
    fontSize: 14,
    color: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    flex: 1,
    backgroundColor: '#242424',
    color: '#ffffff',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3d5afe',
  },
  modalScrollView: {
    flexGrow: 1,
  },
  modalView: {
    backgroundColor: '#1a1a1a',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 10,
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#242424',
    color: '#ffffff',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  modalButtonCancel: {
    backgroundColor: '#FF5252',
  },
  modalButtonSave: {
    backgroundColor: '#3d5afe',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#ffffff',
  },
});

export default TherapyChatStyles;
