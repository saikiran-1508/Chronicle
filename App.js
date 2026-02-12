/**
 * App.js — Root component
 * Wraps the app in AuthProvider + ThemeProvider and conditionally renders
 * Auth stack (SignIn/SignUp) or Main stack (tasks, chat, profile).
 */

import React, { useEffect } from 'react';
import { TouchableOpacity, Text, View, StatusBar, ActivityIndicator, StyleSheet, Platform, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import notifee, { AuthorizationStatus } from '@notifee/react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import TaskListScreen from './src/screens/TaskListScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import AddNoteScreen from './src/screens/AddNoteScreen';
import CreateTaskScreen from './src/screens/CreateTaskScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

// ── Request notification permissions on app start ───────────────────────────
async function requestNotificationPermission() {
    try {
        const settings = await notifee.requestPermission();
        if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
            console.log('Notification permission denied by user.');
        } else {
            console.log('Notification permission granted.');
        }
    } catch (e) {
        console.warn('Failed to request notification permission:', e);
    }
}

function AuthNavigator() {
    const { colors } = useTheme();
    return (
        <AuthStack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
            }}
        >
            <AuthStack.Screen name="SignIn" component={SignInScreen} />
            <AuthStack.Screen name="SignUp" component={SignUpScreen} />
        </AuthStack.Navigator>
    );
}

function MainNavigator() {
    const { colors, isDark, toggleTheme } = useTheme();

    const mainScreenOptions = {
        headerStyle: { backgroundColor: colors.headerBg },
        headerTintColor: colors.headerText,
        headerTitleStyle: { fontWeight: '600' },
        headerBackTitleVisible: false,
        contentStyle: { backgroundColor: colors.background },
    };

    return (
        <MainStack.Navigator screenOptions={mainScreenOptions}>
            <MainStack.Screen
                name="TaskList"
                component={TaskListScreen}
                options={({ navigation }) => ({
                    title: 'Chronicle',
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Profile')}
                            activeOpacity={0.7}
                            style={{
                                marginRight: 12,
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: isDark ? '#444444' : '#333333',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{ fontSize: 14, color: '#FFFFFF', fontWeight: '700' }}>U</Text>
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={toggleTheme}
                                activeOpacity={0.7}
                                style={{ marginRight: 16 }}
                            >
                                <Text style={{ fontSize: 18 }}>
                                    {isDark ? '☀️' : '🌙'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Chat')}
                                activeOpacity={0.7}
                            >
                                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                                    Chat
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ),
                })}
            />
            <MainStack.Screen
                name="TaskDetail"
                component={TaskDetailScreen}
                options={({ route }) => ({
                    title: route.params?.title || 'Task Details',
                })}
            />
            <MainStack.Screen
                name="AddNote"
                component={AddNoteScreen}
                options={{ title: 'Add Progress Note' }}
            />
            <MainStack.Screen
                name="CreateTask"
                component={CreateTaskScreen}
                options={{ title: 'New Task' }}
            />
            <MainStack.Screen
                name="Chat"
                component={ChatScreen}
                options={{ title: 'AI Assistant' }}
            />
            <MainStack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'My Profile' }}
            />
        </MainStack.Navigator>
    );
}

function RootNavigator() {
    const { user, loading } = useAuth();
    const { colors } = useTheme();

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.text} />
                <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading...</Text>
            </View>
        );
    }

    return user ? <MainNavigator /> : <AuthNavigator />;
}

export default function App() {
    // Request notification permission when the app starts
    useEffect(() => {
        requestNotificationPermission();
    }, []);

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />
            <ThemeProvider>
                <AuthProvider>
                    <NavigationContainer>
                        <RootNavigator />
                    </NavigationContainer>
                </AuthProvider>
            </ThemeProvider>
        </>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
});
