import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ErrorState = ({ message = 'Something went wrong.', onRetry }) => {
    const { colors } = useTheme();
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.icon, { color: colors.text }]}>!</Text>
            <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
            {onRetry && (
                <TouchableOpacity style={[styles.button, { backgroundColor: colors.buttonBg }]} onPress={onRetry} activeOpacity={0.8}>
                    <Text style={[styles.buttonText, { color: colors.buttonText }]}>Try Again</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    icon: { fontSize: 40, marginBottom: 12, fontWeight: '700' },
    message: { fontSize: 15, textAlign: 'center', marginBottom: 20, lineHeight: 22 },
    button: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 8 },
    buttonText: { fontSize: 15, fontWeight: '600' },
});

export default ErrorState;
