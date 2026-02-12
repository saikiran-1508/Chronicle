/**
 * Default reminder sound options.
 * 'file' values correspond to raw resource names on Android.
 * 'default' uses the system notification sound.
 */

const REMINDER_SOUNDS = [
    { key: 'default', label: 'Default', file: 'default', icon: '🔔' },
    { key: 'gentle_chime', label: 'Gentle Chime', file: 'gentle_chime', icon: '🎵' },
    { key: 'bell', label: 'Classic Bell', file: 'bell', icon: '🔕' },
    { key: 'digital', label: 'Digital Alert', file: 'digital', icon: '📱' },
    { key: 'soft_ping', label: 'Soft Ping', file: 'soft_ping', icon: '✨' },
];

export default REMINDER_SOUNDS;
