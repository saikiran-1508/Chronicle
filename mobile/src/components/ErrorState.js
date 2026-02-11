import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ErrorState = ({ message = 'Something went wrong.', onRetry }) => (
    <View style={styles.container}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.message}>{message}</Text>
        {onRetry && (
            <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.8}>
                <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
        )}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#F9FAFB',
    },
    icon: { fontSize: 40, marginBottom: 12 },
    message: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    button: {
        backgroundColor: '#4F46E5',
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});

export default ErrorState;
