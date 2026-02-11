/**
 * SignUpScreen — Create a new account with name, email, and password.
 * Includes client-side validation and Google Sign-In option.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants';

export default function SignUpScreen({ navigation }) {
    const { signUp, googleSignIn } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const validate = () => {
        if (!name.trim()) { Alert.alert('Error', 'Please enter your name.'); return false; }
        if (!email.trim()) { Alert.alert('Error', 'Please enter your email.'); return false; }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            Alert.alert('Error', 'Please enter a valid email address.');
            return false;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters.');
            return false;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return false;
        }

        return true;
    };

    const handleSignUp = async () => {
        if (!validate()) return;

        setLoading(true);
        const result = await signUp(name.trim(), email.trim(), password);
        setLoading(false);

        if (!result.success) {
            Alert.alert('Sign Up Failed', result.error);
        }
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        const result = await googleSignIn();
        setGoogleLoading(false);

        if (!result.success) {
            Alert.alert('Google Sign In Failed', result.error);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconCircle}>
                        <Text style={styles.iconText}>+</Text>
                    </View>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Get started with Task Tracker</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="John Doe"
                            placeholderTextColor={COLORS.textDisabled}
                            value={name}
                            onChangeText={setName}
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="you@example.com"
                            placeholderTextColor={COLORS.textDisabled}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.passwordRow}>
                            <TextInput
                                style={[styles.input, styles.passwordInput]}
                                placeholder="At least 6 characters"
                                placeholderTextColor={COLORS.textDisabled}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Re-enter your password"
                            placeholderTextColor={COLORS.textDisabled}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showPassword}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSignUp}
                        disabled={loading || googleLoading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>Create Account</Text>
                        )}
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Google Sign In */}
                    <TouchableOpacity
                        style={[styles.googleButton, googleLoading && styles.buttonDisabled]}
                        onPress={handleGoogleSignIn}
                        disabled={loading || googleLoading}
                        activeOpacity={0.8}
                    >
                        {googleLoading ? (
                            <ActivityIndicator color={COLORS.textPrimary} />
                        ) : (
                            <>
                                <Text style={styles.googleIcon}>G</Text>
                                <Text style={styles.googleButtonText}>Continue with Google</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.footerLink}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 28,
        paddingVertical: 32,
    },
    header: {
        alignItems: 'center',
        marginBottom: 28,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    iconText: {
        fontSize: 32,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.textMuted,
    },
    form: {
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 6,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    passwordRow: {
        position: 'relative',
    },
    passwordInput: {
        paddingRight: 50,
    },
    eyeButton: {
        position: 'absolute',
        right: 14,
        top: 14,
    },
    eyeText: {
        fontSize: 18,
    },
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    dividerText: {
        marginHorizontal: 14,
        fontSize: 14,
        color: COLORS.textMuted,
    },
    googleButton: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
    },
    googleIcon: {
        fontSize: 20,
        fontWeight: '700',
        color: '#4285F4',
        marginRight: 10,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 15,
        color: COLORS.textMuted,
    },
    footerLink: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.primary,
    },
});
