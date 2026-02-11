/**
 * Navigation configuration — stack navigator setup.
 * Extracted from App.js for cleaner separation of concerns.
 */

import { SCREENS } from '../constants';

export const SCREEN_OPTIONS = {
    headerStyle: { backgroundColor: '#4F46E5' },
    headerTintColor: '#FFFFFF',
    headerTitleStyle: { fontWeight: '600' },
    headerBackTitleVisible: false,
    contentStyle: { backgroundColor: '#F3F4F6' },
};

export const SCREEN_NAMES = SCREENS;
