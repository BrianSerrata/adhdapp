import { 
  StyleSheet,  
  Dimensions,
 } from "react-native";

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F8', // Soft, approachable background
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#5D3FD3', // Vibrant, friendly purple
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '300',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  quoteContainer: {
    backgroundColor: '#7B68EE', // Playful, supportive purple
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#5D3FD3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  quote: {
    color: 'white',
    fontStyle: 'italic',
    textAlign: 'center',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5D3FD3',
    marginBottom: 15,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  featureCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#5D3FD3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#5D3FD3',
    textAlign: 'center',
  },
  challengeCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#5D3FD3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D3FD3',
    marginBottom: 10,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#4A4A4A',
    marginBottom: 15,
  },
  startButton: {
    backgroundColor: '#5D3FD3',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#5D3FD3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#5D3FD3',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  tabButton: {
    alignItems: 'center',
    width: width / 3 - 32,
  },
  tabText: {
    marginTop: 4,
    fontSize: 12,
    color: '#5D3FD3',
    fontWeight: '600',
  },
  reflectionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginVertical: 16,
    shadowColor: '#5D3FD3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reflectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5D3FD3',
    marginBottom: 8,
  },
  reflectionDescription: {
    fontSize: 14,
    color: '#4A4A4A',
    marginBottom: 12,
  },
  reflectionButton: {
    backgroundColor: '#5D3FD3',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  reflectionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(93, 63, 211, 0.5)', // Soft purple overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#5D3FD3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D3FD3',
    marginBottom: 20,
    textAlign: 'center',
  },
  reflectionInput: {
    height: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: '#1F2937',
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#5D3FD3',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
    backgroundColor: '#5D3FD3',
    borderRadius: 5,
    marginBottom: 10,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resourcesContainer: {
    marginTop: 20,
    width: width-32,
    marginBottom: 20,
  },
  resourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white', // Soft purple background
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(93, 63, 211, 0.2)', // Soft purple border
  },
  resourceButtonText: {
    color: '#5D3FD3',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginLeft: 8,
  },  
  subtext: {
    marginTop: 8, // Space between greeting and subtext
    fontSize: 16,
    color: "#848484",
    textAlign: "center", // Center align text
  },  
});

export default styles;