/**
 * TaskDetailScreen
 * ────────────────
 * Shows full task details, all progress notes, and AI recommendations.
 * A floating "Add Note" button navigates to the AddNote screen.
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
} from 'react-native';
import { fetchTask, fetchNotes, fetchAIRecommendation } from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import StatusBadge from '../components/StatusBadge';

const TaskDetailScreen = ({ route, navigation }) => {
    const { taskId } = route.params;

    const [task, setTask] = useState(null);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // AI recommendation state
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [showAiModal, setShowAiModal] = useState(false);

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

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadData();
        });
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
            setAiResult('⚠️ Could not get AI recommendations. Please check your Groq API key and try again.');
        } finally {
            setAiLoading(false);
        }
    };

    if (loading) return <LoadingState message="Loading task…" />;
    if (error) return <ErrorState message={error} onRetry={loadData} />;
    if (!task) return <ErrorState message="Task not found." />;

    const formattedDate = new Date(task.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    const renderNote = ({ item, index }) => (
        <View style={styles.noteCard}>
            <View style={styles.noteHeader}>
                <View style={styles.noteNumberBadge}>
                    <Text style={styles.noteNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.noteDate}>
                    {new Date(item.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Text>
            </View>
            <Text style={styles.noteContent}>{item.content}</Text>
        </View>
    );

    const ListHeader = () => (
        <View style={styles.detailSection}>
            <View style={styles.metaRow}>
                <StatusBadge status={task.status} />
                <Text style={styles.date}>Created {formattedDate}</Text>
            </View>

            {task.dueDate && (
                <View style={styles.dueRow}>
                    <Text style={styles.dueLabel}>⏰ Due: </Text>
                    <Text style={styles.dueDate}>
                        {new Date(task.dueDate).toLocaleString('en-US', {
                            month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                        })}
                    </Text>
                    {task.reminderEnabled && (
                        <Text style={styles.reminderBadge}> 🔔 Reminder</Text>
                    )}
                </View>
            )}

            {task.description ? (
                <Text style={styles.description}>{task.description}</Text>
            ) : (
                <Text style={[styles.description, styles.noDescription]}>
                    No description provided.
                </Text>
            )}

            {/* AI Insights Button */}
            <TouchableOpacity
                style={styles.aiButton}
                onPress={handleAIInsights}
                activeOpacity={0.8}
            >
                <Text style={styles.aiButtonText}>🤖 AI Insights</Text>
            </TouchableOpacity>

            <View style={styles.notesHeader}>
                <Text style={styles.notesTitle}>Progress Notes</Text>
                <Text style={styles.notesBadge}>{notes.length}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={notes}
                keyExtractor={(item) => item.id}
                renderItem={renderNote}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={
                    <View style={styles.emptyNotes}>
                        <Text style={styles.emptyNotesIcon}>📝</Text>
                        <Text style={styles.emptyNotesText}>
                            No progress notes yet. Add your first note!
                        </Text>
                    </View>
                }
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.85}
                onPress={() =>
                    navigation.navigate('AddNote', {
                        taskId: task.id,
                        taskTitle: task.title,
                        taskStatus: task.status,
                    })
                }
            >
                <Text style={styles.fabText}>+ Add Note</Text>
            </TouchableOpacity>

            {/* AI Modal */}
            <Modal visible={showAiModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>🤖 AI Insights</Text>
                        {aiLoading ? (
                            <View style={styles.aiLoadingBox}>
                                <ActivityIndicator size="large" color="#4F46E5" />
                                <Text style={styles.aiLoadingText}>Analyzing task…</Text>
                            </View>
                        ) : (
                            <ScrollView style={styles.aiResultScroll} showsVerticalScrollIndicator={false}>
                                <Text style={styles.aiResultText}>{aiResult}</Text>
                            </ScrollView>
                        )}
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setShowAiModal(false)}
                        >
                            <Text style={styles.modalCloseText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    list: { padding: 16, paddingBottom: 90 },
    detailSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    date: { fontSize: 13, color: '#9CA3AF' },
    dueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: '#FEF3C7',
        padding: 8,
        borderRadius: 8,
    },
    dueLabel: { fontSize: 13, fontWeight: '600', color: '#92400E' },
    dueDate: { fontSize: 13, color: '#92400E' },
    reminderBadge: { fontSize: 12, color: '#92400E' },
    description: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 22,
        marginBottom: 16,
    },
    noDescription: { fontStyle: 'italic', color: '#9CA3AF' },
    // ── AI Button ──
    aiButton: {
        backgroundColor: '#EEF2FF',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#C7D2FE',
    },
    aiButtonText: { fontSize: 15, fontWeight: '600', color: '#4338CA' },
    // ── Notes Header ──
    notesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 14,
    },
    notesTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
    notesBadge: {
        marginLeft: 8,
        backgroundColor: '#EEF2FF',
        color: '#4F46E5',
        fontSize: 12,
        fontWeight: '700',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        overflow: 'hidden',
    },
    noteCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#4F46E5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    noteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    noteNumberBadge: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    noteNumber: { fontSize: 11, fontWeight: '700', color: '#4F46E5' },
    noteDate: { fontSize: 12, color: '#9CA3AF' },
    noteContent: { fontSize: 14, color: '#374151', lineHeight: 20 },
    emptyNotes: { alignItems: 'center', paddingVertical: 32 },
    emptyNotesIcon: { fontSize: 36, marginBottom: 8 },
    emptyNotesText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center' },
    fab: {
        position: 'absolute',
        bottom: 24,
        left: 16,
        right: 16,
        backgroundColor: '#4F46E5',
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    fabText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    // ── AI Modal ──
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 16,
    },
    aiLoadingBox: { alignItems: 'center', paddingVertical: 40 },
    aiLoadingText: { fontSize: 14, color: '#6B7280', marginTop: 12 },
    aiResultScroll: { maxHeight: 400 },
    aiResultText: { fontSize: 14, color: '#374151', lineHeight: 22 },
    modalCloseButton: {
        marginTop: 16,
        backgroundColor: '#4F46E5',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
    },
    modalCloseText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});

export default TaskDetailScreen;
