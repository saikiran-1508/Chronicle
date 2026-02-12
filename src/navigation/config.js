/**
 * Navigation configuration — stack navigator setup.
 * Extracted from App.js for cleaner separation of concerns.
 */

import { SCREENS } from '../constants';

export const SCREEN_OPTIONS = {
    headerStyle: { backgroundColor: '#000000' },
    headerTintColor: '#FFFFFF',
    headerTitleStyle: { fontWeight: '600' },
    headerBackTitleVisible: false,
    contentStyle: { backgroundColor: '#FFFFFF' },
};

export const SCREEN_NAMES = SCREENS;
