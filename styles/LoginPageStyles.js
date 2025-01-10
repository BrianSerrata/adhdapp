// LoginPageStyles.js
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    card: {
        margin: 20,
        backgroundColor: '#1a1a1a',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardHeader: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: '#848484',
    },
    cardContent: {
        gap: 15,
    },
    inputContainer: {
        backgroundColor: '#242424',
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2.84,
        elevation: 3,
    },
    icon: {
        marginRight: 12,
        color: '#848484',
    },
    input: {
        flex: 1,
        color: '#ffffff',
        fontSize: 16,
        height: 24,
    },
    eyeIcon: {
        padding: 4,
        color: '#848484',
    },
    button: {
        backgroundColor: '#3d5afe',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2.84,
        elevation: 3,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
    },
    cardFooter: {
        alignItems: 'center',
        marginTop: 24,
        gap: 12,
    },
    footerText: {
        color: '#848484',
        fontSize: 14,
    },
    linkText: {
        color: '#3d5afe',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default styles;