/**
 * TaskDetailScreen — Theme-aware
 * Shows task details, schedule, status actions, notes, and AI insights.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Modal,
    ScrollView,
    Alert,
} from 'react-native';
import { fetchTask, fetchNotes, fetchAIRecommendation, updateTask } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import StatusBadge from '../components/StatusBadge';

const TaskDetailScreen = ({ route, navigation }) => {
    const { taskId } = route.params;
    const { colors } = useTheme();

    const [task, setTask] = useState(null);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [showAiModal, setShowAiModal] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [taskData, notesData] = await Promise.all([
                fetchTask(taskId),
                fetchNotes(taskId),
            ]);
            setTask(taskData);
            setNotes(notesData);
        } catch (err) {
            setError(err.message || 'Failed to load task details');
        } finally {
            setLoading(false);
        }
    }, [taskId]);

    useEffect(() => { loadData(); }, [loadData]);
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => loadData());
        return unsubscribe;
    }, [navigation, loadData]);

    const handleAIInsights = async () => {
        setAiLoading(true);
        setShowAiModal(true);
        setAiResult(null);
        try {
            const { recommendation } = await fetchAIRecommendation(taskId);
            setAiResult(recommendation);
        } catch (err) {
            setAiResult('Could not get AI recommendations. Please try again in a moment.');
        } finally {
            setAiLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        setStatusUpdating(true);
        try {
            const updated = await updateTask(task.id, { status: newStatus });
            setTask(updated);
        } catch (err) {
            Alert.alert('Error', 'Failed to update status.');
        } finally {
            setStatusUpdating(false);
        }
    };

    if (loading) return <LoadingState message="Loading task..." />;
    if (error) return <ErrorState message={error} onRetry={loadData} />;
    if (!task) return <ErrorState message="Task not found." />;

    const formattedDate = new Date(task.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
    });

    const formatDateTime = (iso) => {
        if (!iso) return null;
        return new Date(iso).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        });
    };

    const isOverdue = task.overdue || false;

    const renderNote = ({ item, index }) => (
        <View style={[styles.noteCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderLeftColor: colors.buttonBg }]}>
            <View style={styles.noteHeader}>
                <View style={[styles.noteNumberBadge, { backgroundColor: colors.inputBg }]}>
                    <Text style={[styles.noteNumber, { color: colors.text }]}>{index + 1}</Text>
                </View>
                <Text style={[styles.noteDate, { color: colors.textPlaceholder }]}>
                    {new Date(item.createdAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                </Text>
            </View>
            <Text style={[styles.noteContent, { color: colors.textSecondary }]}>{item.content}</Text>
        </View>
    );

    const ListHeader = () => (
        <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.metaRow}>
                <StatusBadge status={task.status} />
                {isOverdue && <Text style={styles.overdueTag}>OVERDUE</Text>}
                <Text style={[styles.date, { color: colors.textPlaceholder }]}>Created {formattedDate}</Text>
            </View>

            {/* Schedule Info */}
            {(task.startTime || task.finishBy) && (
                <View style={[styles.scheduleCard, { backgroundColor: colors.inputBg }]}>
                    {task.startTime && (
                        <View style={styles.scheduleRow}>
                            <Text style={[styles.scheduleIcon, { color: colors.textMuted }]}>⏰</Text>
                            <Text style={[styles.scheduleLabel, { color: colors.textMuted }]}>Start: </Text>
                            <Text style={[styles.scheduleValue, { color: colors.textSecondary }]}>{formatDateTime(task.startTime)}</Text>
                        </View>
                    )}
                    {task.finishBy && (
                        <View style={styles.scheduleRow}>
                            <Text style={[styles.scheduleIcon, { color: isOverdue ? '#E53E3E' : colors.textMuted }]}>🏁</Text>
                            <Text style={[styles.scheduleLabel, { color: isOverdue ? '#E53E3E' : colors.textMuted }]}>Finish by: </Text>
                            <Text style={[styles.scheduleValue, { color: isOverdue ? '#E53E3E' : colors.textSecondary }]}>{formatDateTime(task.finishBy)}</Text>
                        </View>
                    )}
                </View>
            )}

            {task.description ? (
                <Text style={[styles.description, { color: colors.textSecondary }]}>{task.description}</Text>
            ) : (
                <Text style={[styles.description, styles.noDescription, { color: colors.textPlaceholder }]}>
                    No description provided.
                </Text>
            )}

            {/* Status Action Buttons */}
            <View style={styles.actionRow}>
                {task.status === 'pending' && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.buttonBg }]}
                        onPress={() => handleStatusChange('in-progress')}
                        disabled={statusUpdating}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.actionButtonText, { color: colors.buttonText }]}>
                            {statusUpdating ? 'Updating...' : '▶ Start Working'}
                        </Text>
                    </TouchableOpacity>
                )}
                {task.status === 'in-progress' && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#16A34A' }]}
                        onPress={() => handleStatusChange('completed')}
                        disabled={statusUpdating}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                            {statusUpdating ? 'Updating...' : '✓ Mark Complete'}
                        </Text>
                    </TouchableOpacity>
                )}
                {task.status === 'completed' && (
                    <View style={[styles.completedBanner, { backgroundColor: '#16A34A20' }]}>
                        <Text style={[styles.completedText, { color: '#16A34A' }]}>✓ Task Completed</Text>
                    </View>
                )}
            </View>

            <TouchableOpacity
                style={[styles.aiButton, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                onPress={handleAIInsights}
                activeOpacity={0.8}
            >
                <Text style={[styles.aiButtonText, { color: colors.text }]}>AI Insights</Text>
            </TouchableOpacity>

            <View style={[styles.notesHeader, { borderTopColor: colors.divider }]}>
                <Text style={[styles.notesTitle, { color: colors.text }]}>Progress Notes</Text>
                <Text style={[styles.notesBadge, { backgroundColor: colors.inputBg, color: colors.text }]}>{notes.length}</Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={notes}
                keyExtractor={(item) => item.id}
                renderItem={renderNote}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={
                    <View style={styles.emptyNotes}>
                        <Text style={[styles.emptyNotesIcon, { color: colors.chevron }]}>—</Text>
                        <Text style={[styles.emptyNotesText, { color: colors.textPlaceholder }]}>
                            No progress notes yet. Add your first note!
                        </Text>
                    </View>
                }
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.buttonBg }]}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('AddNote', {
                    taskId: task.id, taskTitle: task.title, taskStatus: task.status,
                })}
            >
                <Text style={[styles.fabText, { color: colors.buttonText }]}>+ Add Note</Text>
            </TouchableOpacity>

            {/* AI Modal */}
            <Modal visible={showAiModal} transparent animationType="fade">
                <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
                    <View style={[styles.modalContent, { backgroundColor: colors.modalBg }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>AI Insights</Text>
                        {aiLoading ? (
                            <View style={styles.aiLoadingBox}>
                                <ActivityIndicator size="large" color={colors.text} />
                                <Text style={[styles.aiLoadingText, { color: colors.textMuted }]}>Analyzing task...</Text>
                            </View>
                        ) : (
                            <ScrollView style={styles.aiResultScroll} showsVerticalScrollIndicator={false}>
                                <Text style={[styles.aiResultText, { color: colors.textSecondary }]}>{aiResult}</Text>
                            </ScrollView>
                        )}
                        <TouchableOpacity
                            style={[styles.modalCloseButton, { backgroundColor: colors.buttonBg }]}
                            onPress={() => setShowAiModal(false)}
                        >
                            <Text style={[styles.modalCloseText, { color: colors.buttonText }]}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    list: { padding: 16, paddingBottom: 90 },
    detailSection: { borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, elevation: 2 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
    date: { fontSize: 13, marginLeft: 'auto' },
    overdueTag: { fontSize: 11, fontWeight: '800', color: '#E53E3E', backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
    scheduleCard: { borderRadius: 10, padding: 12, marginBottom: 14 },
    scheduleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    scheduleIcon: { fontSize: 14, marginRight: 6 },
    scheduleLabel: { fontSize: 13, fontWeight: '600' },
    scheduleValue: { fontSize: 13 },
    description: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
    noDescription: { fontStyle: 'italic' },
    actionRow: { marginBottom: 12 },
    actionButton: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', elevation: 2 },
    actionButtonText: { fontSize: 16, fontWeight: '700' },
    completedBanner: { borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
    completedText: { fontSize: 15, fontWeight: '700' },
    aiButton: { borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 16, borderWidth: 1 },
    aiButtonText: { fontSize: 15, fontWeight: '600' },
    notesHeader: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingTop: 14 },
    notesTitle: { fontSize: 16, fontWeight: '700' },
    notesBadge: { marginLeft: 8, fontSize: 12, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: 'hidden' },
    noteCard: { borderRadius: 10, padding: 14, marginBottom: 10, borderLeftWidth: 3, borderWidth: 1, elevation: 1 },
    noteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    noteNumberBadge: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    noteNumber: { fontSize: 11, fontWeight: '700' },
    noteDate: { fontSize: 12 },
    noteContent: { fontSize: 14, lineHeight: 20 },
    emptyNotes: { alignItems: 'center', paddingVertical: 32 },
    emptyNotesIcon: { fontSize: 36, marginBottom: 8 },
    emptyNotesText: { fontSize: 14, textAlign: 'center' },
    fab: { position: 'absolute', bottom: 24, left: 16, right: 16, borderRadius: 12, paddingVertical: 15, alignItems: 'center', elevation: 6 },
    fabText: { fontSize: 16, fontWeight: '700' },
    modalOverlay: { flex: 1, justifyContent: 'center', padding: 20 },
    modalContent: { borderRadius: 16, padding: 20, maxHeight: '80%' },
    modalTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
    aiLoadingBox: { alignItems: 'center', paddingVertical: 40 },
    aiLoadingText: { fontSize: 14, marginTop: 12 },
    aiResultScroll: { maxHeight: 400 },
    aiResultText: { fontSize: 14, lineHeight: 22 },
    modalCloseButton: { marginTop: 16, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
    modalCloseText: { fontSize: 15, fontWeight: '600' },
});

export default TaskDetailScreen;
