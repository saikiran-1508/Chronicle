import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const EmptyState = ({ icon = '—', title, message }) => {
    const { colors } = useTheme();
    return (
        <View style={styles.container}>
            <Text style={[styles.icon, { color: colors.chevron }]}>{icon}</Text>
            <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
            {message && <Text style={[styles.message, { color: colors.textPlaceholder }]}>{message}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    icon: { fontSize: 48, marginBottom: 12 },
    title: { fontSize: 17, fontWeight: '600', marginBottom: 6 },
    message: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});

export default EmptyState;
