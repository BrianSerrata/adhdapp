import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  // Container & Layout
  container: {
    flex: 1,
    backgroundColor: '#171717',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#171717',
  },
  
  // Left Panel
  panelToggle: {
    position: 'absolute',
    top: 5,
    left: 10,
    zIndex: 10,
    backgroundColor: '#242424',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    opacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,
  },
  leftPanel: {
    width: 250,
    backgroundColor: '#242424',
    borderRightWidth: 1,
    borderRightColor: '#3A3A3A',
    padding: 16,
    flexShrink: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  conversationList: {
    flex: 1,
  },
  conversationItem: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2.84,
    elevation: 3,
  },
  activeConversation: {
    backgroundColor: '#171717',
  },
  conversationText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  newConversationButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  newConversationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Chat Container
  chatContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#171717',
  },
  messageList: {
    paddingVertical: 16,
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
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  aiBubble: {
    backgroundColor: '#171717',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#242424',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#ffffff',
  },
  aiText: {
    color: '#ffffff',
  },
  userText: {
    color: '#ffffff',
  },

  // Loading Indicator
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    marginLeft: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#848484',
    marginLeft: 8,
  },

  // Input Area
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#171717',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 18,
    marginBottom: 7
  },
  input: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    color: '#ffffff',
    fontSize: 16,
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    minHeight: 45,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3d5afe',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  chatContainerWithPanel: {
    marginLeft: 16,
  },
  conversationDate: {
    fontSize: 12,
    color: '#848484',
    marginTop: 4,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#242424',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  markdown: {
    body: { color: '#ffffff', fontSize: 16 },
    heading1: { fontSize: 24, fontWeight: 'bold', color: '#4f46e5' },
    heading2: { fontSize: 20, fontWeight: 'bold', color: '#7c3aed' },
    link: { color: '#3d5afe', textDecorationLine: 'underline' },
    list_item: { color: '#ffffff', fontSize: 16 },
    blockquote: { borderLeftWidth: 4, borderLeftColor: '#7c3aed', paddingLeft: 8, color: '#ffffff' },
  },
  createRoutineButtonInBubble: {
    marginTop: 12,
    backgroundColor: "#3d5afe", // Match theme color
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start", // Align within the text bubble
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createRoutineButtonTextInBubble: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  suggestionCard: {
    borderRadius: 20, // Ensures rounded corners
    marginRight: 8, // Space between cards
    elevation: 3, // Better shadow effect
    backgroundColor:"#242424"
  },
  gradientBackground: {
    paddingVertical: 6, // Height control
    paddingHorizontal: 16, // Adjusted padding for better spacing
    borderRadius: 20, // Ensures rounded edges match parent
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80, // Minimum width for consistency
    height: 35, // Fixed height 
  },
  suggestionText: {
    color: '#fff', // Ensures text is readable on gradient
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionsWrapper: {
    position: 'absolute',
    bottom: 90, // Positions it just above the input container
    left: 0,
    right: 0,
  }
});

export default styles;
