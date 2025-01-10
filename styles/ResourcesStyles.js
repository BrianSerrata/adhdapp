import { StyleSheet } from "react-native";

const styles = {
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    headerGradient: {
      paddingBottom: 16,
    },
    headerContent: {
      paddingTop: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#FFFFFF',
      padding: 16,
    },
    searchCard: {
      backgroundColor: '#FFFFFF',
      margin: 16,
      borderRadius: 12,
      padding: 12,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F3F4F6',
      borderRadius: 8,
      paddingHorizontal: 12,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      height: 40,
      color: '#1F2937',
      fontSize: 16,
    },
    tabBar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 8,
      marginHorizontal: 16,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      padding: 8,
      marginHorizontal: 4,
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    tabText: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: 12,
      marginTop: 4,
      textAlign: 'center',
    },
    activeTabText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    contentContainer: {
      flex: 1,
      backgroundColor: '#FFFFFF',
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
      backgroundColor: '#FFFFFF',
      margin: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    cardHeader: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: '#1F2937',
    },
    cardDescription: {
      fontSize: 14,
      color: '#6B7280',
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
      backgroundColor: '#F3F4F6',
      borderRadius: 8,
      marginBottom: 8,
    },
    resourceTextContainer: {
      flex: 1,
    },
    resourceButtonText: {
      fontSize: 16,
      color: '#1F2937',
    },
    chatIcon: {
      padding: 8,
    },
  };

  export default styles