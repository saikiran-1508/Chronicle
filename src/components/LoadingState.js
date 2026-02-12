import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const LoadingState = ({ message = 'Loading...' }) => {
    const { colors } = useTheme();
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.text} />
            <Text style={[styles.text, { color: colors.textMuted }]}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    text: { marginTop: 12, fontSize: 15 },
});

export default LoadingState;
