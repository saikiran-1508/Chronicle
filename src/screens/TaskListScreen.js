/**
 * TaskListScreen — Theme-aware
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
import { useTheme } from '../context/ThemeContext';
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
    const { colors, isDark } = useTheme();
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

    useEffect(() => { loadTasks(); }, [loadTasks]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => loadTasks());
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

    if (loading) return <LoadingState message="Loading tasks..." />;
    if (error) return <ErrorState message={error} onRetry={loadTasks} />;

    const renderTask = ({ item }) => {
        const isOverdue = item.overdue || false;
        const formatShort = (iso) => {
            if (!iso) return null;
            return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.card, borderColor: isOverdue ? '#E53E3E' : colors.cardBorder }]}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('TaskDetail', { taskId: item.id, title: item.title })}
            >
                <View style={styles.cardHeader}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <StatusBadge status={item.status} />
                </View>

                {item.latestNote && (
                    <Text style={[styles.notePreview, { color: colors.textMuted }]} numberOfLines={2}>
                        {item.latestNote}
                    </Text>
                )}

                <View style={styles.cardFooter}>
                    <Text style={[styles.noteCount, { color: colors.textPlaceholder }]}>
                        {item.notesCount} {item.notesCount === 1 ? 'note' : 'notes'}
                    </Text>
                    {item.startTime && (
                        <Text style={[styles.scheduleTag, { color: colors.textMuted }]}>
                            ⏰ {formatShort(item.startTime)}
                        </Text>
                    )}
                    {item.finishBy && (
                        <Text style={[styles.scheduleTag, { color: isOverdue ? '#E53E3E' : colors.textMuted }]}>
                            🏁 {formatShort(item.finishBy)}
                        </Text>
                    )}
                    {isOverdue && (
                        <Text style={styles.overdueTag}>OVERDUE</Text>
                    )}
                    <Text style={[styles.chevron, { color: colors.chevron }]}>›</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Filter Tabs */}
            <View style={[styles.filterRow, { backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
                {FILTERS.map((f) => (
                    <TouchableOpacity
                        key={f.key}
                        style={[
                            styles.filterTab,
                            { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                            activeFilter === f.key && { backgroundColor: colors.buttonBg, borderColor: colors.buttonBg },
                        ]}
                        onPress={() => setActiveFilter(f.key)}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.filterText,
                            { color: colors.textMuted },
                            activeFilter === f.key && { color: colors.buttonText },
                        ]}>
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
                        icon="—"
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
                        tintColor={colors.text}
                        colors={[colors.text]}
                    />
                }
            />

            {/* New Task FAB */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.fab }]}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('CreateTask')}
            >
                <Text style={[styles.fabIcon, { color: colors.fabText }]}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 4,
        borderBottomWidth: 1,
    },
    filterTab: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
    },
    filterText: { fontSize: 13, fontWeight: '600' },
    list: { padding: 16, paddingBottom: 80 },
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 10 },
    notePreview: { fontSize: 13, lineHeight: 19, marginBottom: 10 },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    noteCount: { fontSize: 12, fontWeight: '500' },
    scheduleTag: { fontSize: 11, fontWeight: '500' },
    overdueTag: { fontSize: 10, fontWeight: '800', color: '#E53E3E', backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, overflow: 'hidden' },
    chevron: { fontSize: 20, fontWeight: '300' },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
    },
    fabIcon: { fontSize: 28, fontWeight: '300', lineHeight: 30 },
});

export default TaskListScreen;
