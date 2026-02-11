/**
 * AddNoteScreen
 * ─────────────
 * Allows the user to write a progress note for a task.
 * Optionally marks the task as complete via a checkbox.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { addNote } from '../services/api';

const AddNoteScreen = ({ route, navigation }) => {
    const { taskId, taskTitle, taskStatus } = route.params;

    const [content, setContent] = useState('');
    const [markComplete, setMarkComplete] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const isTaskAlreadyComplete = taskStatus === 'completed';

    const handleSubmit = async () => {
        const trimmed = content.trim();
        if (!trimmed) {
            Alert.alert('Required', 'Please enter a note before submitting.');
            return;
        }

        try {
            setSubmitting(true);
            await addNote(taskId, {
                content: trimmed,
                markComplete: markComplete && !isTaskAlreadyComplete,
            });
            Alert.alert('Success', 'Progress note added!', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (err) {
            Alert.alert('Error', err.message || 'Failed to save note. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                {/* Task context */}
                <View style={styles.contextCard}>
                    <Text style={styles.contextLabel}>Adding note to</Text>
                    <Text style={styles.contextTitle}>{taskTitle}</Text>
                </View>

                {/* Note input */}
                <Text style={styles.label}>Progress Note</Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="Describe what progress was made…"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    value={content}
                    onChangeText={setContent}
                    editable={!submitting}
                />

                {/* Mark complete checkbox */}
                {!isTaskAlreadyComplete && (
                    <TouchableOpacity
                        style={styles.checkboxRow}
                        activeOpacity={0.7}
                        onPress={() => setMarkComplete(!markComplete)}
                    >
                        <View style={[styles.checkbox, markComplete && styles.checkboxChecked]}>
                            {markComplete && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.checkboxLabel}>Mark task as completed</Text>
                    </TouchableOpacity>
                )}

                {/* Submit button */}
                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                    activeOpacity={0.85}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    <Text style={styles.submitButtonText}>
                        {submitting ? 'Saving…' : 'Save Note'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    scroll: {
        padding: 16,
        paddingBottom: 40,
    },
    contextCard: {
        backgroundColor: '#EEF2FF',
        borderRadius: 10,
        padding: 14,
        marginBottom: 20,
    },
    contextLabel: {
        fontSize: 12,
        color: '#6366F1',
        fontWeight: '500',
        marginBottom: 2,
    },
    contextTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#312E81',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    textArea: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 14,
        fontSize: 15,
        color: '#111827',
        minHeight: 140,
        lineHeight: 22,
        marginBottom: 16,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 24,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkboxChecked: {
        backgroundColor: '#4F46E5',
        borderColor: '#4F46E5',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    checkboxLabel: {
        fontSize: 15,
        color: '#374151',
    },
    submitButton: {
        backgroundColor: '#4F46E5',
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default AddNoteScreen;
