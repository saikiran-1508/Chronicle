/**
 * ReminderService — Local push notification scheduling for task reminders.
 * Uses @notifee/react-native for Android local notifications
 * and AsyncStorage for persisting the user's sound preference.
 */

import notifee, { TriggerType, AndroidImportance } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHANNEL_ID = 'chronicle-reminders';
const SOUND_STORAGE_KEY = '@chronicle_reminder_sound';
const CUSTOM_SOUND_URI_KEY = '@chronicle_custom_sound_uri';

// ── Channel Setup ───────────────────────────────────────────────────────────

const ensureChannel = async () => {
    await notifee.createChannel({
        id: CHANNEL_ID,
        name: 'Task Reminders',
        description: 'Notifications for task start time reminders',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
    });
};

// Initialize channel on import
ensureChannel();

// ── Sound Preference Persistence ────────────────────────────────────────────

/**
 * Get the stored sound preference key.
 * Returns 'default' if no preference is saved.
 */
export const getSelectedSound = async () => {
    try {
        const soundKey = await AsyncStorage.getItem(SOUND_STORAGE_KEY);
        return soundKey || 'default';
    } catch {
        return 'default';
    }
};

/**
 * Save the user's preferred reminder sound key.
 */
export const setSelectedSound = async (soundKey) => {
    try {
        await AsyncStorage.setItem(SOUND_STORAGE_KEY, soundKey);
    } catch (e) {
        console.warn('Failed to save sound preference:', e);
    }
};

/**
 * Get the stored custom sound file URI (for sounds picked from device).
 */
export const getCustomSoundUri = async () => {
    try {
        return await AsyncStorage.getItem(CUSTOM_SOUND_URI_KEY);
    } catch {
        return null;
    }
};

/**
 * Save a custom sound file URI.
 */
export const setCustomSoundUri = async (uri) => {
    try {
        await AsyncStorage.setItem(CUSTOM_SOUND_URI_KEY, uri || '');
    } catch (e) {
        console.warn('Failed to save custom sound URI:', e);
    }
};

// ── Reminder Scheduling ─────────────────────────────────────────────────────

/**
 * Schedule a local notification at the given start time.
 * @param {string} taskId - Unique task ID (used as notification ID)
 * @param {string} taskTitle - Task title for notification content
 * @param {string} startTimeISO - ISO date string for when to fire the notification
 * @returns {boolean} true if scheduled, false if time is in the past
 */
export const scheduleReminder = async (taskId, taskTitle, startTimeISO) => {
    const notifDate = new Date(startTimeISO);
    const now = new Date();

    // Don't schedule if the time is in the past
    if (notifDate <= now) {
        console.log('Reminder time is in the past, skipping schedule.');
        return false;
    }

    // Ensure channel exists
    await ensureChannel();

    // Cancel any existing reminder for this task first
    await cancelReminder(taskId);

    // Create a trigger-based notification
    const trigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: notifDate.getTime(),
    };

    await notifee.createTriggerNotification(
        {
            id: taskId,
            title: '⏰ Task Reminder',
            body: `Time to start: ${taskTitle}`,
            android: {
                channelId: CHANNEL_ID,
                importance: AndroidImportance.HIGH,
                pressAction: {
                    id: 'default',
                },
                smallIcon: 'ic_launcher',
            },
        },
        trigger,
    );

    console.log(`Reminder scheduled for task "${taskTitle}" at ${notifDate.toLocaleString()}`);
    return true;
};

/**
 * Cancel a scheduled reminder for a task.
 * @param {string} taskId - The task ID whose reminder should be cancelled
 */
export const cancelReminder = async (taskId) => {
    try {
        await notifee.cancelNotification(taskId);
        console.log(`Reminder cancelled for task ${taskId}`);
    } catch (e) {
        // Notification may not exist — that's fine
    }
};

export default {
    scheduleReminder,
    cancelReminder,
    getSelectedSound,
    setSelectedSound,
    getCustomSoundUri,
    setCustomSoundUri,
};
