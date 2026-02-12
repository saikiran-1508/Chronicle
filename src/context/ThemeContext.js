/**
 * ThemeContext
 * ────────────
 * Provides light/dark theme support across the app.
 * Persists user's theme preference using AsyncStorage (gracefully handles
 * cases where the native module is not yet linked).
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const THEME_KEY = '@chronicle_theme';

// Try to import AsyncStorage; if native module isn't linked yet, fall back to null
let AsyncStorage = null;
try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
    // Native module not linked — persistence disabled until rebuild
}

const lightColors = {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceBorder: '#F0F0F0',
    card: '#FFFFFF',
    cardBorder: '#F0F0F0',
    text: '#111111',
    textSecondary: '#333333',
    textMuted: '#777777',
    textPlaceholder: '#AAAAAA',
    headerBg: '#000000',
    headerText: '#FFFFFF',
    inputBg: '#F5F5F5',
    inputBorder: '#E0E0E0',
    inputText: '#111111',
    buttonBg: '#000000',
    buttonText: '#FFFFFF',
    divider: '#F0F0F0',
    fab: '#000000',
    fabText: '#FFFFFF',
    modalOverlay: 'rgba(0,0,0,0.5)',
    modalBg: '#FFFFFF',
    statusActive: '#000000',
    statusPending: '#777777',
    chevron: '#CCCCCC',
    shadow: '#000',
};

const darkColors = {
    background: '#000000',
    surface: '#1A1A1A',
    surfaceBorder: '#333333',
    card: '#1A1A1A',
    cardBorder: '#333333',
    text: '#FFFFFF',
    textSecondary: '#DDDDDD',
    textMuted: '#888888',
    textPlaceholder: '#666666',
    headerBg: '#111111',
    headerText: '#FFFFFF',
    inputBg: '#222222',
    inputBorder: '#444444',
    inputText: '#FFFFFF',
    buttonBg: '#FFFFFF',
    buttonText: '#000000',
    divider: '#333333',
    fab: '#FFFFFF',
    fabText: '#000000',
    modalOverlay: 'rgba(0,0,0,0.7)',
    modalBg: '#1A1A1A',
    statusActive: '#FFFFFF',
    statusPending: '#888888',
    chevron: '#555555',
    shadow: '#000',
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (AsyncStorage) {
            AsyncStorage.getItem(THEME_KEY).then((value) => {
                if (value === 'dark') setIsDark(true);
            }).catch(() => { });
        }
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        if (AsyncStorage) {
            AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light').catch(() => { });
        }
    };

    const colors = isDark ? darkColors : lightColors;

    return (
        <ThemeContext.Provider value={{ colors, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};
