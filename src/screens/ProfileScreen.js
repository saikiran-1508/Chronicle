/**
 * ProfileScreen — Theme-aware
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
    Alert,
    Image,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { fetchProfile, updateProfile, fetchTasks } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import StatusBadge from '../components/StatusBadge';

const AVATAR_EMOJIS = [
    '🤖', '👽', '🦊', '🐻', '🐵', '🦄', '💀', '🎃',
    '🦸', '🧑‍✈️', '🧙', '😇', '🐱', '🐶', '🦁', '🐼',
];

const ProfileScreen = ({ navigation }) => {
    const { user, signOut } = useAuth();
    const { colors, isDark } = useTheme();
    const [profileData, setProfileData] = useState(null);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [activeTasks, setActiveTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const [photoUri, setPhotoUri] = useState(null);

    const userEmail = user?.email || '';

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

    useEffect(() => { loadData(); }, [loadData]);
    useEffect(() => {
        const unsub = navigation.addListener('focus', loadData);
        return unsub;
    }, [navigation, loadData]);

    const handleAvatarSelect = async (emoji) => {
        setShowAvatarPicker(false);
        setPhotoUri(null);
        try {
            const updated = await updateProfile({ avatar: emoji });
            setProfileData((prev) => ({ ...prev, ...updated }));
        } catch (e) { }
    };

    const handleUploadPhoto = () => {
        launchImageLibrary(
            { mediaType: 'photo', maxWidth: 300, maxHeight: 300, quality: 0.8 },
            (response) => {
                if (response.didCancel) return;
                if (response.errorCode) {
                    Alert.alert('Error', response.errorMessage || 'Could not pick image.');
                    return;
                }
                if (response.assets && response.assets[0]) {
                    setPhotoUri(response.assets[0].uri);
                    setShowAvatarPicker(false);
                }
            },
        );
    };

    const handleNameSave = async () => {
        setEditingName(false);
        if (!nameInput.trim()) return;
        try {
            const updated = await updateProfile({ name: nameInput.trim() });
            setProfileData((prev) => ({ ...prev, ...updated }));
        } catch (e) { }
    };

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out', style: 'destructive',
                onPress: async () => {
                    const result = await signOut();
                    if (!result.success) Alert.alert('Error', result.error || 'Failed to sign out.');
                },
            },
        ]);
    };

    if (loading) return <LoadingState message="Loading profile..." />;
    if (error) return <ErrorState message={error} onRetry={loadData} />;

    const { stats } = profileData;
    const isEmoji = profileData.avatar && profileData.avatar.length > 1;

    const StatBox = ({ label, value }) => (
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
        </View>
    );

    const renderTaskItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.taskItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('TaskDetail', { taskId: item.id, title: item.title })}
        >
            <View style={styles.taskItemRow}>
                <Text style={[styles.taskItemTitle, { color: colors.textSecondary }]} numberOfLines={1}>{item.title}</Text>
                <StatusBadge status={item.status} />
            </View>
            <Text style={[styles.taskItemMeta, { color: colors.textPlaceholder }]}>
                {item.notesCount} {item.notesCount === 1 ? 'note' : 'notes'}
            </Text>
        </TouchableOpacity>
    );

    const ListHeader = () => (
        <View>
            <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.avatarWrapper}>
                    <TouchableOpacity
                        style={[styles.avatarCircle, { backgroundColor: isDark ? '#333' : '#E8E8E8', borderColor: isDark ? '#555' : '#CCCCCC' }]}
                        onPress={() => setShowAvatarPicker(true)}
                        activeOpacity={0.8}
                    >
                        {photoUri ? (
                            <Image source={{ uri: photoUri }} style={styles.avatarImage} />
                        ) : isEmoji ? (
                            <Text style={styles.avatarEmoji}>{profileData.avatar}</Text>
                        ) : (
                            <Text style={styles.avatarSilhouette}>👤</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.avatarPlusButton, { backgroundColor: colors.buttonBg, borderColor: colors.background }]}
                        onPress={() => setShowAvatarPicker(true)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.avatarPlusText, { color: colors.buttonText }]}>+</Text>
                    </TouchableOpacity>
                </View>

                {editingName ? (
                    <View style={styles.nameEditRow}>
                        <TextInput
                            style={[styles.nameInput, { color: colors.text, borderBottomColor: colors.buttonBg }]}
                            value={nameInput}
                            onChangeText={setNameInput}
                            autoFocus
                            onSubmitEditing={handleNameSave}
                            onBlur={handleNameSave}
                            placeholderTextColor={colors.textPlaceholder}
                        />
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.nameRow}
                        onPress={() => { setNameInput(profileData.name); setEditingName(true); }}
                    >
                        <Text style={[styles.name, { color: colors.text }]}>{profileData.name}</Text>
                        <Text style={styles.editIcon}> ✏️</Text>
                    </TouchableOpacity>
                )}

                <Text style={[styles.email, { color: colors.textPlaceholder }]}>{userEmail}</Text>
            </View>

            <View style={styles.statsRow}>
                <StatBox label="Total" value={stats.total} />
                <StatBox label="Active" value={stats.inProgress} />
                <StatBox label="Pending" value={stats.pending} />
                <StatBox label="Done" value={stats.completed} />
            </View>

            {activeTasks.length > 0 && (
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Tasks ({activeTasks.length})</Text>
            )}
            {activeTasks.map((item) => (
                <View key={item.id}>{renderTaskItem({ item })}</View>
            ))}

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Completed ({completedTasks.length})</Text>
        </View>
    );

    const ListFooter = () => (
        <View style={[styles.signOutSection, { borderTopColor: colors.divider }]}>
            <TouchableOpacity
                style={[styles.signOutButton, { backgroundColor: colors.surface, borderColor: colors.buttonBg }]}
                onPress={handleSignOut}
                activeOpacity={0.8}
            >
                <Text style={[styles.signOutText, { color: colors.text }]}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={completedTasks}
                keyExtractor={(item) => item.id}
                renderItem={renderTaskItem}
                ListHeaderComponent={ListHeader}
                ListFooterComponent={ListFooter}
                ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: colors.textPlaceholder }]}>No completed tasks yet.</Text>
                }
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />

            <Modal visible={showAvatarPicker} transparent animationType="slide">
                <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
                    <View style={[styles.modalContent, { backgroundColor: colors.modalBg }]}>
                        <TouchableOpacity style={styles.uploadButton} onPress={handleUploadPhoto} activeOpacity={0.7}>
                            <View style={[styles.uploadIcon, { backgroundColor: colors.inputBg }]}>
                                <Text style={styles.uploadIconText}>🖼️</Text>
                            </View>
                            <Text style={[styles.uploadLabel, { color: colors.textSecondary }]}>Upload Photo</Text>
                        </TouchableOpacity>

                        <View style={[styles.modalDivider, { backgroundColor: colors.divider }]} />

                        <Text style={[styles.modalTitle, { color: colors.textMuted }]}>Or pick a character:</Text>
                        <View style={styles.avatarGrid}>
                            {AVATAR_EMOJIS.map((emoji) => (
                                <TouchableOpacity
                                    key={emoji}
                                    style={[
                                        styles.avatarOption,
                                        { backgroundColor: colors.inputBg },
                                        profileData.avatar === emoji && { borderWidth: 2, borderColor: colors.buttonBg },
                                    ]}
                                    onPress={() => handleAvatarSelect(emoji)}
                                >
                                    <Text style={styles.avatarOptionText}>{emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.modalClose} onPress={() => setShowAvatarPicker(false)}>
                            <Text style={[styles.modalCloseText, { color: colors.textMuted }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    list: { padding: 16, paddingBottom: 32 },
    profileCard: { borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16, borderWidth: 1, elevation: 3 },
    avatarWrapper: { position: 'relative', marginBottom: 16 },
    avatarCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 2, overflow: 'hidden' },
    avatarImage: { width: 100, height: 100, borderRadius: 50 },
    avatarSilhouette: { fontSize: 44 },
    avatarEmoji: { fontSize: 44 },
    avatarPlusButton: { position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
    avatarPlusText: { fontSize: 16, fontWeight: '700', lineHeight: 18 },
    nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    name: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
    editIcon: { fontSize: 14 },
    email: { fontSize: 14, textAlign: 'center', marginTop: 2 },
    nameEditRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    nameInput: { fontSize: 20, fontWeight: '600', borderBottomWidth: 2, paddingVertical: 4, paddingHorizontal: 8, minWidth: 150, textAlign: 'center' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    statBox: { flex: 1, borderRadius: 12, padding: 14, marginHorizontal: 4, alignItems: 'center', borderWidth: 1, elevation: 1 },
    statValue: { fontSize: 24, fontWeight: '800' },
    statLabel: { fontSize: 11, marginTop: 2, fontWeight: '500' },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 8, marginBottom: 10 },
    taskItem: { borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, elevation: 1 },
    taskItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    taskItemTitle: { fontSize: 14, fontWeight: '600', flex: 1, marginRight: 8 },
    taskItemMeta: { fontSize: 12, marginTop: 4 },
    emptyText: { fontSize: 14, textAlign: 'center', paddingVertical: 20 },
    signOutSection: { marginTop: 32, paddingTop: 20, borderTopWidth: 1 },
    signOutButton: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5 },
    signOutText: { fontSize: 16, fontWeight: '600' },
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
    uploadButton: { alignItems: 'center', paddingVertical: 16 },
    uploadIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    uploadIconText: { fontSize: 24 },
    uploadLabel: { fontSize: 14, fontWeight: '600' },
    modalDivider: { height: 1, marginVertical: 16 },
    modalTitle: { fontSize: 14, fontWeight: '600', marginBottom: 16 },
    avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
    avatarOption: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', margin: 6 },
    avatarOptionText: { fontSize: 26 },
    modalClose: { marginTop: 16, alignItems: 'center', paddingVertical: 10 },
    modalCloseText: { fontSize: 15, fontWeight: '600' },
});

export default ProfileScreen;
