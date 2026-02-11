import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const STATUS_STYLES = {
    pending: { bg: '#FEF3C7', text: '#92400E', label: 'Pending' },
    'in-progress': { bg: '#DBEAFE', text: '#1E40AF', label: 'In Progress' },
    completed: { bg: '#D1FAE5', text: '#065F46', label: 'Completed' },
};

const StatusBadge = ({ status }) => {
    const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
    return (
        <View style={[styles.badge, { backgroundColor: style.bg }]}>
            <Text style={[styles.label, { color: style.text }]}>{style.label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    label: { fontSize: 12, fontWeight: '600' },
});

export default StatusBadge;
