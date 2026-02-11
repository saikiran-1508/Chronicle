/**
 * TaskListScreen
 * ──────────────
 * Displays tasks with status filter tabs, latest note preview, and note count.
 * Tapping a card navigates to the detail view. Pull-to-refresh supported.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { fetchTasks } from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'in-progress', label: 'Active' },
    { key: 'completed', label: 'Done' },
];

const TaskListScreen = ({ navigation }) => {
    const [tasks, setTasks] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const loadTasks = useCallback(async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            setError(null);
            const data = await fetchTasks();
            setTasks(data);
        } catch (err) {
            setError(err.message || 'Failed to load tasks');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadTasks();
        });
        return unsubscribe;
    }, [navigation, loadTasks]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadTasks(true);
    };

    const filteredTasks =
        activeFilter === 'all'
            ? tasks
            : tasks.filter((t) => t.status === activeFilter);

    if (loading) return <LoadingState message="Loading tasks…" />;
    if (error) return <ErrorState message={error} onRetry={loadTasks} />;

    const renderTask = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() =>
                navigation.navigate('TaskDetail', { taskId: item.id, title: item.title })
            }
        >
            <View style={styles.cardHeader}>
                <Text style={styles.title} numberOfLines={1}>
                    {item.title}
                </Text>
                <StatusBadge status={item.status} />
            </View>

            {item.latestNote && (
                <Text style={styles.notePreview} numberOfLines={2}>
                    📝 {item.latestNote}
                </Text>
            )}

            <View style={styles.cardFooter}>
                <Text style={styles.noteCount}>
                    {item.notesCount} {item.notesCount === 1 ? 'note' : 'notes'}
                </Text>
                {item.dueDate && (
                    <Text style={styles.dueTag}>
                        ⏰ {new Date(item.dueDate).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric',
                        })}
                    </Text>
                )}
                <Text style={styles.chevron}>›</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Filter Tabs */}
            <View style={styles.filterRow}>
                {FILTERS.map((f) => (
                    <TouchableOpacity
                        key={f.key}
                        style={[styles.filterTab, activeFilter === f.key && styles.filterTabActive]}
                        onPress={() => setActiveFilter(f.key)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.filterText, activeFilter === f.key && styles.filterTextActive]}>
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredTasks}
                keyExtractor={(item) => item.id}
                renderItem={renderTask}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <EmptyState
                        icon="📝"
                        title={activeFilter === 'all' ? 'No Tasks Yet' : `No ${activeFilter} Tasks`}
                        message={activeFilter === 'all'
                            ? 'Create your first task to get started.'
                            : 'Try a different filter.'}
                    />
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#4F46E5"
                        colors={['#4F46E5']}
                    />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    // ── Filter Tabs ──
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 4,
        backgroundColor: '#F3F4F6',
    },
    filterTab: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    filterTabActive: {
        backgroundColor: '#4F46E5',
        borderColor: '#4F46E5',
    },
    filterText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
    filterTextActive: { color: '#FFFFFF' },
    // ── List ──
    list: { padding: 16, paddingBottom: 32 },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        flex: 1,
        marginRight: 10,
    },
    notePreview: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 19,
        marginBottom: 10,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    noteCount: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
    dueTag: { fontSize: 11, color: '#D97706', fontWeight: '500' },
    chevron: { fontSize: 20, color: '#D1D5DB', fontWeight: '300' },
});

export default TaskListScreen;
