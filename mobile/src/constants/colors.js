/**
 * Shared colors and design tokens used across the app.
 */

export const COLORS = {
    primary: '#4F46E5',
    primaryLight: '#EEF2FF',
    primaryDark: '#312E81',

    background: '#F3F4F6',
    surface: '#FFFFFF',
    surfaceAlt: '#F9FAFB',

    textPrimary: '#111827',
    textSecondary: '#374151',
    textMuted: '#6B7280',
    textDisabled: '#9CA3AF',

    border: '#E5E7EB',
    borderLight: '#F3F4F6',

    success: '#D1FAE5',
    successText: '#065F46',
    warning: '#FEF3C7',
    warningText: '#92400E',
    info: '#DBEAFE',
    infoText: '#1E40AF',

    white: '#FFFFFF',
    black: '#000000',
};

export const STATUS_COLORS = {
    pending: { bg: COLORS.warning, text: COLORS.warningText },
    'in-progress': { bg: COLORS.info, text: COLORS.infoText },
    completed: { bg: COLORS.success, text: COLORS.successText },
};
