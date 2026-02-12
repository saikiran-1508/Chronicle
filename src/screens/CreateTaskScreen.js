/**
 * CreateTaskScreen — Theme-aware
 * Supports Start Time and Finish By scheduling with native DatePickers.
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { createTask } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { scheduleReminder } from '../services/ReminderService';

const CreateTaskScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Store as Date objects, initialized to null
    const [startDateTime, setStartDateTime] = useState(null);
    const [finishDateTime, setFinishDateTime] = useState(null);

    const [reminderEnabled, setReminderEnabled] = useState(false);

    // Picker State
    const [pickerMode, setPickerMode] = useState('date'); // 'date' or 'time'
    const [showPicker, setShowPicker] = useState(false);
    const [activeField, setActiveField] = useState(null); // 'start', 'finish'

    // Helper to format Date to YYYY-MM-DD
    const formatDate = (date) => {
        if (!date) return '';
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    // Helper to format Date to HH:MM
    const formatTime = (date) => {
        if (!date) return '';
        const h = String(date.getHours()).padStart(2, '0');
        const m = String(date.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    };

    const openPicker = (field, mode) => {
        setActiveField(field);
        setPickerMode(mode);
        setShowPicker(true);
    };

    const onPickerChange = (event, selectedDate) => {
        setShowPicker(false);
        if (event.type === 'dismissed' || !selectedDate) {
            return;
        }

        const currentState = activeField === 'start' ? startDateTime : finishDateTime;
        const currentData = currentState || new Date(); // If null, assume today/now

        const newDate = new Date(currentData);

        if (pickerMode === 'date') {
            newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        } else {
            newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
            // Reset seconds/ms for cleanliness
            newDate.setSeconds(0);
            newDate.setMilliseconds(0);
        }

        if (activeField === 'start') {
            setStartDateTime(newDate);
            // If we just set a start date, enable reminder by default if it wasn't on
            // (Optional UX choice, but helpful)
        } else {
            setFinishDateTime(newDate);
        }
    };

    const handleSubmit = async () => {
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            Alert.alert('Validation', 'Please enter a task title.');
            return;
        }
        setSubmitting(true);
        try {
            // Construct ISO strings from Date objects
            // We need to account for timezone offset manually if we want local time ISO,
            // or just use typical collection:
            // Actually, backend usually expects ISO. react-native Date.toISOString() returns UTC.
            // If your backend expects local time string (e.g. "2023-10-27T09:00:00"), 
            // you might want to format manually.
            // For now, let's send standard ISO (UTC) or construct a local-like ISO string 
            // depending on how your backend parses it. 
            // Assuming backend stores simplified ISO or handles timezone. 
            // Let's standardise on a simple "YYYY-MM-DDTHH:mm:ss" format for local visual consistency 
            // if the backend is naive, or use ISO if it's smart.
            // Given previous code used `${startDate}T${startTime}:00`, it implies local time string.

            const toLocalISO = (date) => {
                if (!date) return null;
                const pad = (n) => String(n).padStart(2, '0');
                return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
            };

            const startTimeISO = toLocalISO(startDateTime);
            const finishByISO = toLocalISO(finishDateTime);

            const newTask = await createTask({
                title: trimmedTitle,
                description: description.trim(),
                status: 'pending',
                startTime: startTimeISO,
                finishBy: finishByISO,
                reminderEnabled: reminderEnabled && !!startTimeISO,
            });

            // Schedule local notification if reminder is enabled
            if (reminderEnabled && startTimeISO) {
                // For local notification, we need the timestamp. 
                // scheduleReminder takes ISO string, but let's pass the string we made.
                // The service parses it via `new Date(startTimeISO)`. 
                // Note: `new Date("2023-01-01T10:00:00")` in JS assumes local time if no Z provided.
                await scheduleReminder(newTask.id, trimmedTitle, startTimeISO);
            }

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
                    {/* Date Picker Trigger */}
                    <TouchableOpacity
                        style={[styles.pickerField, { backgroundColor: colors.surface, borderColor: colors.inputBorder, flex: 3 }]}
                        onPress={() => openPicker('start', 'date')}
                    >
                        <Text style={[styles.smallLabel, { color: colors.textMuted }]}>Date</Text>
                        <Text style={[styles.pickerValue, { color: startDateTime ? colors.inputText : colors.textPlaceholder }]}>
                            {formatDate(startDateTime) || 'Select Date'}
                        </Text>
                    </TouchableOpacity>

                    {/* Time Picker Trigger */}
                    <TouchableOpacity
                        style={[styles.pickerField, { backgroundColor: colors.surface, borderColor: colors.inputBorder, flex: 2 }]}
                        onPress={() => openPicker('start', 'time')}
                    >
                        <Text style={[styles.smallLabel, { color: colors.textMuted }]}>Time</Text>
                        <Text style={[styles.pickerValue, { color: startDateTime ? colors.inputText : colors.textPlaceholder }]}>
                            {formatTime(startDateTime) || '--:--'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Reminder Toggle */}
            {startDateTime && (
                <View style={[styles.reminderRow, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                    <View style={styles.reminderTextWrap}>
                        <Text style={[styles.reminderLabel, { color: colors.text }]}>🔔 Remind me</Text>
                        <Text style={[styles.reminderHint, { color: colors.textPlaceholder }]}>Get a notification at start time</Text>
                    </View>
                    <Switch
                        value={reminderEnabled}
                        onValueChange={setReminderEnabled}
                        trackColor={{ false: colors.inputBorder, true: colors.buttonBg }}
                        thumbColor={'#fff'}
                    />
                </View>
            )}

            {/* Finish By Section */}
            <View style={[styles.scheduleSection, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                <Text style={[styles.scheduleTitle, { color: colors.text }]}>🏁 Finish by</Text>
                <Text style={[styles.scheduleHint, { color: colors.textPlaceholder }]}>Deadline — task becomes overdue if not completed</Text>

                <View style={styles.dateTimeRow}>
                    {/* Date Picker Trigger */}
                    <TouchableOpacity
                        style={[styles.pickerField, { backgroundColor: colors.surface, borderColor: colors.inputBorder, flex: 3 }]}
                        onPress={() => openPicker('finish', 'date')}
                    >
                        <Text style={[styles.smallLabel, { color: colors.textMuted }]}>Date</Text>
                        <Text style={[styles.pickerValue, { color: finishDateTime ? colors.inputText : colors.textPlaceholder }]}>
                            {formatDate(finishDateTime) || 'Select Date'}
                        </Text>
                    </TouchableOpacity>

                    {/* Time Picker Trigger */}
                    <TouchableOpacity
                        style={[styles.pickerField, { backgroundColor: colors.surface, borderColor: colors.inputBorder, flex: 2 }]}
                        onPress={() => openPicker('finish', 'time')}
                    >
                        <Text style={[styles.smallLabel, { color: colors.textMuted }]}>Time</Text>
                        <Text style={[styles.pickerValue, { color: finishDateTime ? colors.inputText : colors.textPlaceholder }]}>
                            {formatTime(finishDateTime) || '--:--'}
                        </Text>
                    </TouchableOpacity>
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

            {/* DateTimePicker Modal/Display */}
            {showPicker && (
                <DateTimePicker
                    value={(activeField === 'start' ? startDateTime : finishDateTime) || new Date()}
                    mode={pickerMode}
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onPickerChange}
                />
            )}
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
    pickerField: { borderRadius: 10, padding: 12, borderWidth: 1, justifyContent: 'center' },
    pickerValue: { fontSize: 15 },
    smallLabel: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
    reminderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, padding: 16, marginTop: 16, borderWidth: 1 },
    reminderTextWrap: { flex: 1 },
    reminderLabel: { fontSize: 15, fontWeight: '600' },
    reminderHint: { fontSize: 12, marginTop: 2 },
    submitButton: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 28, elevation: 4 },
    submitButtonDisabled: { opacity: 0.6 },
    submitText: { fontSize: 16, fontWeight: '700' },
});

export default CreateTaskScreen;
