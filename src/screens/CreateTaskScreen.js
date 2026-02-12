/**
 * CreateTaskScreen — Theme-aware
 * Supports Start Time and Finish By scheduling.
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
} from 'react-native';
import { createTask } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const CreateTaskScreen = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Scheduling
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [finishDate, setFinishDate] = useState('');
    const [finishTime, setFinishTime] = useState('');

    const handleSubmit = async () => {
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            Alert.alert('Validation', 'Please enter a task title.');
            return;
        }
        setSubmitting(true);
        try {
            let startTimeISO = null;
            if (startDate) {
                const st = startTime || '00:00';
                startTimeISO = `${startDate}T${st}:00`;
            }
            let finishByISO = null;
            if (finishDate) {
                const ft = finishTime || '23:59';
                finishByISO = `${finishDate}T${ft}:00`;
            }
            await createTask({
                title: trimmedTitle,
                description: description.trim(),
                status: 'pending',
                startTime: startTimeISO,
                finishBy: finishByISO,
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
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Task Title *</Text>
            <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.inputBorder, color: colors.inputText }]}
                placeholder="e.g. Design login screen"
                placeholderTextColor={colors.textPlaceholder}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
            <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.inputBorder, color: colors.inputText }]}
                placeholder="Add details about the task..."
                placeholderTextColor={colors.textPlaceholder}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
            />

            {/* Start Time Section */}
            <View style={[styles.scheduleSection, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                <Text style={[styles.scheduleTitle, { color: colors.text }]}>⏰ I will start at</Text>
                <Text style={[styles.scheduleHint, { color: colors.textPlaceholder }]}>When do you plan to begin this task?</Text>

                <View style={styles.dateTimeRow}>
                    <View style={styles.dateField}>
                        <Text style={[styles.smallLabel, { color: colors.textMuted }]}>Date (YYYY-MM-DD)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.inputBorder, color: colors.inputText }]}
                            placeholder="2026-02-15"
                            placeholderTextColor={colors.textPlaceholder}
                            value={startDate}
                            onChangeText={setStartDate}
                            maxLength={10}
                        />
                    </View>
                    <View style={styles.timeField}>
                        <Text style={[styles.smallLabel, { color: colors.textMuted }]}>Time (HH:MM)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.inputBorder, color: colors.inputText }]}
                            placeholder="09:00"
                            placeholderTextColor={colors.textPlaceholder}
                            value={startTime}
                            onChangeText={setStartTime}
                            maxLength={5}
                        />
                    </View>
                </View>
            </View>

            {/* Finish By Section */}
            <View style={[styles.scheduleSection, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                <Text style={[styles.scheduleTitle, { color: colors.text }]}>🏁 Finish by</Text>
                <Text style={[styles.scheduleHint, { color: colors.textPlaceholder }]}>Deadline — task becomes overdue (pending) if not completed by this time</Text>

                <View style={styles.dateTimeRow}>
                    <View style={styles.dateField}>
                        <Text style={[styles.smallLabel, { color: colors.textMuted }]}>Date (YYYY-MM-DD)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.inputBorder, color: colors.inputText }]}
                            placeholder="2026-02-20"
                            placeholderTextColor={colors.textPlaceholder}
                            value={finishDate}
                            onChangeText={setFinishDate}
                            maxLength={10}
                        />
                    </View>
                    <View style={styles.timeField}>
                        <Text style={[styles.smallLabel, { color: colors.textMuted }]}>Time (HH:MM)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.inputBorder, color: colors.inputText }]}
                            placeholder="17:00"
                            placeholderTextColor={colors.textPlaceholder}
                            value={finishTime}
                            onChangeText={setFinishTime}
                            maxLength={5}
                        />
                    </View>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.buttonBg }, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
                activeOpacity={0.85}
            >
                <Text style={[styles.submitText, { color: colors.buttonText }]}>
                    {submitting ? 'Creating...' : 'Create Task'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20, paddingBottom: 40 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 12 },
    input: { borderRadius: 10, padding: 14, fontSize: 15, borderWidth: 1 },
    textArea: { height: 100, paddingTop: 14 },
    scheduleSection: { borderRadius: 12, padding: 16, marginTop: 20, borderWidth: 1 },
    scheduleTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    scheduleHint: { fontSize: 12, marginBottom: 12, lineHeight: 17 },
    dateTimeRow: { flexDirection: 'row', gap: 12 },
    dateField: { flex: 3 },
    timeField: { flex: 2 },
    smallLabel: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
    submitButton: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 28, elevation: 4 },
    submitButtonDisabled: { opacity: 0.6 },
    submitText: { fontSize: 16, fontWeight: '700' },
});

export default CreateTaskScreen;
