/**
 * AddNoteScreen — Theme-aware
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
import { useTheme } from '../context/ThemeContext';

const AddNoteScreen = ({ route, navigation }) => {
    const { taskId, taskTitle, taskStatus } = route.params;
    const { colors } = useTheme();

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
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                <View style={[styles.contextCard, { backgroundColor: colors.inputBg }]}>
                    <Text style={[styles.contextLabel, { color: colors.textMuted }]}>Adding note to</Text>
                    <Text style={[styles.contextTitle, { color: colors.text }]}>{taskTitle}</Text>
                </View>

                <Text style={[styles.label, { color: colors.textSecondary }]}>Progress Note</Text>
                <TextInput
                    style={[styles.textArea, { backgroundColor: colors.surface, borderColor: colors.inputBorder, color: colors.inputText }]}
                    placeholder="Describe what progress was made..."
                    placeholderTextColor={colors.textPlaceholder}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    value={content}
                    onChangeText={setContent}
                    editable={!submitting}
                />

                {!isTaskAlreadyComplete && (
                    <TouchableOpacity
                        style={styles.checkboxRow}
                        activeOpacity={0.7}
                        onPress={() => setMarkComplete(!markComplete)}
                    >
                        <View style={[
                            styles.checkbox,
                            { borderColor: colors.chevron },
                            markComplete && { backgroundColor: colors.buttonBg, borderColor: colors.buttonBg },
                        ]}>
                            {markComplete && <Text style={[styles.checkmark, { color: colors.buttonText }]}>✓</Text>}
                        </View>
                        <Text style={[styles.checkboxLabel, { color: colors.textSecondary }]}>Mark task as completed</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: colors.buttonBg }, submitting && styles.submitButtonDisabled]}
                    activeOpacity={0.85}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    <Text style={[styles.submitButtonText, { color: colors.buttonText }]}>
                        {submitting ? 'Saving...' : 'Save Note'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: 16, paddingBottom: 40 },
    contextCard: { borderRadius: 10, padding: 14, marginBottom: 20 },
    contextLabel: { fontSize: 12, fontWeight: '500', marginBottom: 2 },
    contextTitle: { fontSize: 16, fontWeight: '600' },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    textArea: { borderRadius: 10, borderWidth: 1, padding: 14, fontSize: 15, minHeight: 140, lineHeight: 22, marginBottom: 16 },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, marginBottom: 24 },
    checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    checkmark: { fontSize: 14, fontWeight: '700' },
    checkboxLabel: { fontSize: 15 },
    submitButton: { borderRadius: 12, paddingVertical: 15, alignItems: 'center', elevation: 4 },
    submitButtonDisabled: { opacity: 0.6 },
    submitButtonText: { fontSize: 16, fontWeight: '700' },
});

export default AddNoteScreen;
