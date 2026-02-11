/**
 * CreateTaskScreen
 * ────────────────
 * Form to create a new task with optional due date and reminder toggle.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    Switch,
    Platform,
} from 'react-native';
import { createTask } from '../services/api';

const CreateTaskScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Reminder / Due date
    const [hasDueDate, setHasDueDate] = useState(false);
    const [dueDate, setDueDate] = useState('');
    const [dueTime, setDueTime] = useState('');
    const [reminderEnabled, setReminderEnabled] = useState(false);

    const handleSubmit = async () => {
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            Alert.alert('Validation', 'Please enter a task title.');
            return;
        }

        setSubmitting(true);
        try {
            // Build due date ISO string if set
            let dueDateISO = null;
            if (hasDueDate && dueDate) {
                const timeStr = dueTime || '23:59';
                dueDateISO = `${dueDate}T${timeStr}:00`;
            }

            await createTask({
                title: trimmedTitle,
                description: description.trim(),
                status: 'pending',
                dueDate: dueDateISO,
                reminderEnabled: hasDueDate && reminderEnabled,
            });
            Alert.alert('Success', 'Task created!', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (err) {
            Alert.alert('Error', err.message || 'Failed to create task.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Title */}
            <Text style={styles.label}>Task Title *</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. Design login screen"
                placeholderTextColor="#9CA3AF"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
            />

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add details about the task…"
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
            />

            {/* Due Date Toggle */}
            <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Set Due Date</Text>
                <Switch
                    value={hasDueDate}
                    onValueChange={(v) => {
                        setHasDueDate(v);
                        if (!v) setReminderEnabled(false);
                    }}
                    trackColor={{ false: '#D1D5DB', true: '#A5B4FC' }}
                    thumbColor={hasDueDate ? '#4F46E5' : '#F3F4F6'}
                />
            </View>

            {hasDueDate && (
                <View style={styles.dateSection}>
                    <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="2026-02-15"
                        placeholderTextColor="#9CA3AF"
                        value={dueDate}
                        onChangeText={setDueDate}
                        maxLength={10}
                    />

                    <Text style={styles.label}>Due Time (HH:MM, 24hr)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="14:30"
                        placeholderTextColor="#9CA3AF"
                        value={dueTime}
                        onChangeText={setDueTime}
                        maxLength={5}
                    />

                    {/* Reminder Toggle */}
                    <View style={styles.switchRow}>
                        <View>
                            <Text style={styles.switchLabel}>🔔 Enable Reminder</Text>
                            <Text style={styles.switchHint}>Get notified when task is due</Text>
                        </View>
                        <Switch
                            value={reminderEnabled}
                            onValueChange={setReminderEnabled}
                            trackColor={{ false: '#D1D5DB', true: '#A5B4FC' }}
                            thumbColor={reminderEnabled ? '#4F46E5' : '#F3F4F6'}
                        />
                    </View>
                </View>
            )}

            {/* Submit */}
            <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
                activeOpacity={0.85}
            >
                <Text style={styles.submitText}>
                    {submitting ? 'Creating…' : 'Create Task'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    content: { padding: 20, paddingBottom: 40 },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
        marginTop: 12,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 14,
        fontSize: 15,
        color: '#111827',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    textArea: {
        height: 100,
        paddingTop: 14,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 14,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    switchLabel: { fontSize: 15, fontWeight: '600', color: '#374151' },
    switchHint: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
    dateSection: {
        backgroundColor: '#FEFCE8',
        borderRadius: 10,
        padding: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    submitButton: {
        backgroundColor: '#4F46E5',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 28,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: { opacity: 0.6 },
    submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

export default CreateTaskScreen;
