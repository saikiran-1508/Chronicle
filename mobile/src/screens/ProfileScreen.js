/**
 * ProfileScreen
 * ─────────────
 * Shows user avatar (emoji), name, task stats, and task history.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    TextInput,
    Modal,
} from 'react-native';
import { fetchProfile, updateProfile, fetchTasks } from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import StatusBadge from '../components/StatusBadge';

const AVATAR_OPTIONS = [
    '😊', '🚀', '💻', '🎯', '⚡', '🔥', '🎨', '🧑‍💻',
    '👩‍💻', '🦊', '🐱', '🌟', '💎', '🏆', '🎮', '🤖',
];

const ProfileScreen = ({ navigation }) => {
    const [profileData, setProfileData] = useState(null);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [activeTasks, setActiveTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState('');

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [profile, allTasks] = await Promise.all([
                fetchProfile(),
                fetchTasks(),
            ]);
            setProfileData(profile);
            setCompletedTasks(allTasks.filter((t) => t.status === 'completed'));
            setActiveTasks(allTasks.filter((t) => t.status !== 'completed'));
        } catch (err) {
            setError(err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        const unsub = navigation.addListener('focus', loadData);
        return unsub;
    }, [navigation, loadData]);

    const handleAvatarSelect = async (emoji) => {
        setShowAvatarPicker(false);
        try {
            const updated = await updateProfile({ avatar: emoji });
            setProfileData((prev) => ({ ...prev, ...updated }));
        } catch (e) { }
    };

    const handleNameSave = async () => {
        setEditingName(false);
        if (!nameInput.trim()) return;
        try {
            const updated = await updateProfile({ name: nameInput.trim() });
            setProfileData((prev) => ({ ...prev, ...updated }));
        } catch (e) { }
    };

    if (loading) return <LoadingState message="Loading profile…" />;
    if (error) return <ErrorState message={error} onRetry={loadData} />;

    const { stats } = profileData;

    const renderTaskItem = ({ item }) => (
        <TouchableOpacity
            style={styles.taskItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('TaskDetail', { taskId: item.id, title: item.title })}
        >
            <View style={styles.taskItemRow}>
                <Text style={styles.taskItemTitle} numberOfLines={1}>{item.title}</Text>
                <StatusBadge status={item.status} />
            </View>
            <Text style={styles.taskItemMeta}>
                {item.notesCount} {item.notesCount === 1 ? 'note' : 'notes'}
            </Text>
        </TouchableOpacity>
    );

    const ListHeader = () => (
        <View>
            {/* Avatar & Name */}
            <View style={styles.profileCard}>
                <TouchableOpacity
                    style={styles.avatarContainer}
                    onPress={() => setShowAvatarPicker(true)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.avatar}>{profileData.avatar}</Text>
                    <Text style={styles.avatarEdit}>tap to change</Text>
                </TouchableOpacity>

                {editingName ? (
                    <View style={styles.nameEditRow}>
                        <TextInput
                            style={styles.nameInput}
                            value={nameInput}
                            onChangeText={setNameInput}
                            autoFocus
                            onSubmitEditing={handleNameSave}
                            onBlur={handleNameSave}
                        />
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={() => {
                            setNameInput(profileData.name);
                            setEditingName(true);
                        }}
                    >
                        <Text style={styles.name}>{profileData.name}</Text>
                        <Text style={styles.nameHint}>tap to edit name</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <StatBox label="Total" value={stats.total} color="#4F46E5" />
                <StatBox label="Active" value={stats.inProgress} color="#2563EB" />
                <StatBox label="Pending" value={stats.pending} color="#D97706" />
                <StatBox label="Done" value={stats.completed} color="#059669" />
            </View>

            {/* Active Tasks Section */}
            {activeTasks.length > 0 && (
                <Text style={styles.sectionTitle}>🔄 Active Tasks ({activeTasks.length})</Text>
            )}
            {activeTasks.map((item) => (
                <View key={item.id}>{renderTaskItem({ item })}</View>
            ))}

            {/* History Section */}
            <Text style={styles.sectionTitle}>✅ Completed ({completedTasks.length})</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={completedTasks}
                keyExtractor={(item) => item.id}
                renderItem={renderTaskItem}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No completed tasks yet.</Text>
                }
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />

            {/* Avatar Picker Modal */}
            <Modal visible={showAvatarPicker} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Choose Your Avatar</Text>
                        <View style={styles.avatarGrid}>
                            {AVATAR_OPTIONS.map((emoji) => (
                                <TouchableOpacity
                                    key={emoji}
                                    style={[
                                        styles.avatarOption,
                                        profileData.avatar === emoji && styles.avatarOptionSelected,
                                    ]}
                                    onPress={() => handleAvatarSelect(emoji)}
                                >
                                    <Text style={styles.avatarOptionText}>{emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity
                            style={styles.modalClose}
                            onPress={() => setShowAvatarPicker(false)}
                        >
                            <Text style={styles.modalCloseText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const StatBox = ({ label, value, color }) => (
    <View style={styles.statBox}>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    list: { padding: 16, paddingBottom: 32 },
    // ── Profile Card ──
    profileCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    avatarContainer: { alignItems: 'center', marginBottom: 12 },
    avatar: { fontSize: 56 },
    avatarEdit: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
    name: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center' },
    nameHint: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 2 },
    nameEditRow: { flexDirection: 'row', alignItems: 'center' },
    nameInput: {
        fontSize: 20, fontWeight: '600', color: '#111827',
        borderBottomWidth: 2, borderBottomColor: '#4F46E5',
        paddingVertical: 4, paddingHorizontal: 8, minWidth: 150, textAlign: 'center',
    },
    // ── Stats ──
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statBox: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        marginHorizontal: 4,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    statValue: { fontSize: 24, fontWeight: '800' },
    statLabel: { fontSize: 11, color: '#6B7280', marginTop: 2, fontWeight: '500' },
    // ── Sections ──
    sectionTitle: {
        fontSize: 16, fontWeight: '700', color: '#111827',
        marginTop: 8, marginBottom: 10,
    },
    taskItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 14,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    taskItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    taskItemTitle: { fontSize: 14, fontWeight: '600', color: '#374151', flex: 1, marginRight: 8 },
    taskItemMeta: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
    emptyText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingVertical: 20 },
    // ── Modal ──
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: 24, paddingBottom: 40,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 20 },
    avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
    avatarOption: {
        width: 56, height: 56, borderRadius: 28,
        justifyContent: 'center', alignItems: 'center',
        margin: 6, backgroundColor: '#F3F4F6',
    },
    avatarOptionSelected: { backgroundColor: '#EEF2FF', borderWidth: 2, borderColor: '#4F46E5' },
    avatarOptionText: { fontSize: 28 },
    modalClose: { marginTop: 16, alignItems: 'center', paddingVertical: 10 },
    modalCloseText: { fontSize: 15, color: '#6B7280', fontWeight: '600' },
});

export default ProfileScreen;
