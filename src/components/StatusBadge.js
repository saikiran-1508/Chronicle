import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const STATUS_STYLES_LIGHT = {
    pending: { bg: '#F5F5F5', text: '#555555', label: 'Pending' },
    'in-progress': { bg: '#E8E8E8', text: '#222222', label: 'In Progress' },
    completed: { bg: '#E0E0E0', text: '#111111', label: 'Completed' },
};

const STATUS_STYLES_DARK = {
    pending: { bg: '#333333', text: '#CCCCCC', label: 'Pending' },
    'in-progress': { bg: '#444444', text: '#EEEEEE', label: 'In Progress' },
    completed: { bg: '#555555', text: '#FFFFFF', label: 'Completed' },
};

const StatusBadge = ({ status }) => {
    const { isDark } = useTheme();
    const styles_map = isDark ? STATUS_STYLES_DARK : STATUS_STYLES_LIGHT;
    const style = styles_map[status] || styles_map.pending;
    return (
        <View style={[styles.badge, { backgroundColor: style.bg }]}>
            <Text style={[styles.label, { color: style.text }]}>{style.label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
    label: { fontSize: 12, fontWeight: '600' },
});

export default StatusBadge;
