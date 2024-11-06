import { StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    card: {
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
    },
    cardHeader: {
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#4f46e5',
      textAlign: 'center',
    },
    description: {
      fontSize: 14,
      color: '#666',
      textAlign: 'center',
    },
    cardContent: {
      marginBottom: 20,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F3F4F6',
      borderRadius: 12,
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    icon: {
      marginRight: 8,
    },
    input: {
      flex: 1,
      height: 50,
      color: '#1F2937',
    },
    eyeIcon: {
      padding: 4,
    },
    button: {
      backgroundColor: '#4f46e5',
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
    },
    cardFooter: {
      alignItems: 'center',
      marginTop: 10,
    },
    footerText: {
      color: '#666',
      fontSize: 14,
    },
    linkText: {
      color: '#4f46e5',
      fontWeight: '600',
      textDecorationLine: 'underline',
    },
  });

  export default styles