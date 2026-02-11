import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EmptyState = ({ icon = '📋', title, message }) => (
    <View style={styles.container}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
        {message && <Text style={styles.message}>{message}</Text>}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    icon: { fontSize: 48, marginBottom: 12 },
    title: { fontSize: 17, fontWeight: '600', color: '#374151', marginBottom: 6 },
    message: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },
});

export default EmptyState;
