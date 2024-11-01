import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
      paddingHorizontal: 16,
    },
    welcomeContainer: {
      alignItems: 'center',
      marginTop: 40,
      marginBottom: 32,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#6b21a8',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: '#7e22ce',
    },
    buttonContainer: {
      gap: 16,
    },
    button: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: 16,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    iconContainer: {
      padding: 12,
      borderRadius: 12,
    },
    buttonText: {
      flex: 1,
    },
    buttonTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1e40af',
      marginBottom: 4,
    },
    buttonSubtitle: {
      fontSize: 14,
      color: '#3b82f6',
    },
    encouragingText: {
      textAlign: 'center',
      fontSize: 14,
      color: '#7e22ce',
      fontStyle: 'italic',
      marginTop: 32,
    },
  });

  export default styles;