import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background for the app theme
  },
  headerGradient: {
    paddingBottom: 16,
    backgroundColor: '#1a1a1a', // Darker gradient effect
  },
  headerContent: {
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff', // White text for contrast
    paddingHorizontal: 16,
  },
  searchCard: {
    backgroundColor: '#1a1a1a', // Card matches the dark theme
    margin: 16,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c2c2c', // Slightly lighter for input background
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
    color: '#848484', // Icon color for low emphasis
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#ffffff', // White input text
    fontSize: 16,
    fontWeight: '500',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#1a1a1a', // Matches header theme
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle inactive tab background
  },
  activeTab: {
    backgroundColor: '#3d5afe', // Active tab with a vibrant highlight
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.7)', // Muted white for inactive text
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#121212', // Match main app background
  },
  pagerView: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    backgroundColor: '#1a1a1a',
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2c2c2c', // Subtle border for differentiation
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2c',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff', // Main text white
  },
  cardDescription: {
    fontSize: 14,
    color: '#848484', // Muted text color
    marginTop: 4,
  },
  resourceListContainer: {
    padding: 16,
  },
  resourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#2c2c2c', // Button matches overall app theme
    borderRadius: 8,
    marginBottom: 8,
  },
  resourceTextContainer: {
    flex: 1,
  },
  resourceButtonText: {
    fontSize: 16,
    color: '#ffffff', // Text aligned with app theme
  },
  chatIcon: {
    padding: 8,
    color: '#3d5afe', // Highlighted color for icons
  },
});

export default styles;