/**
 * App.js — Root component
 * Wraps the app in AuthProvider and conditionally renders
 * Auth stack (SignIn/SignUp) or Main stack (tasks, chat, profile).
 */

import React from 'react';
import { TouchableOpacity, Text, View, StatusBar, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, useAuth } from './src/context/AuthContext';

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

const screenOptions = {
    headerStyle: { backgroundColor: '#4F46E5' },
    headerTintColor: '#FFFFFF',
    headerTitleStyle: { fontWeight: '600' },
    headerBackTitleVisible: false,
    contentStyle: { backgroundColor: '#F3F4F6' },
};

function AuthNavigator() {
    return (
        <AuthStack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#F3F4F6' },
            }}
        >
            <AuthStack.Screen name="SignIn" component={SignInScreen} />
            <AuthStack.Screen name="SignUp" component={SignUpScreen} />
        </AuthStack.Navigator>
    );
}

function MainNavigator() {
    return (
        <MainStack.Navigator screenOptions={screenOptions}>
            <MainStack.Screen
                name="TaskList"
                component={TaskListScreen}
                options={({ navigation }) => ({
                    title: 'Task Tracker',
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Profile')}
                            activeOpacity={0.7}
                            style={{ marginRight: 12 }}
                        >
                            <Text style={{ fontSize: 22 }}>👤</Text>
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Chat')}
                                activeOpacity={0.7}
                                style={{ marginRight: 16 }}
                            >
                                <Text style={{ fontSize: 20 }}>💬</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('CreateTask')}
                                activeOpacity={0.7}
                            >
                                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                                    + New
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

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return user ? <MainNavigator /> : <AuthNavigator />;
}

export default function App() {
    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
            <AuthProvider>
                <NavigationContainer>
                    <RootNavigator />
                </NavigationContainer>
            </AuthProvider>
        </>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
});
