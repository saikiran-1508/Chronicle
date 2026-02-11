import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

const LoadingState = ({ message = 'Loading…' }) => (
    <View style={styles.container}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.text}>{message}</Text>
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
    text: {
        marginTop: 12,
        fontSize: 15,
        color: '#6B7280',
    },
});

export default LoadingState;
