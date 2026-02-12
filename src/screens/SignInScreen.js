/**
 * SignInScreen — Theme-aware
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
import { useTheme } from '../context/ThemeContext';

export default function SignInScreen({ navigation }) {
    const { signIn, googleSignIn } = useAuth();
    const { colors } = useTheme();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSignIn = async () => {
        if (!email.trim()) return Alert.alert('Error', 'Please enter your email.');
        if (!password) return Alert.alert('Error', 'Please enter your password.');

        setLoading(true);
        const result = await signIn(email.trim(), password);
        setLoading(false);

        if (!result.success) {
            Alert.alert('Sign In Failed', result.error);
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
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.buttonBg }]}>
                        <Text style={[styles.iconText, { color: colors.buttonText }]}>C</Text>
                    </View>
                    <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>Sign in to your Chronicle account</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.inputBorder, color: colors.inputText }]}
                            placeholder="you@example.com"
                            placeholderTextColor={colors.textPlaceholder}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
                        <View style={styles.passwordRow}>
                            <TextInput
                                style={[styles.input, styles.passwordInput, { backgroundColor: colors.surface, borderColor: colors.inputBorder, color: colors.inputText }]}
                                placeholder="Enter your password"
                                placeholderTextColor={colors.textPlaceholder}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Text style={[styles.eyeText, { color: colors.textMuted }]}>{showPassword ? 'Hide' : 'Show'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.buttonBg }, loading && styles.buttonDisabled]}
                        onPress={handleSignIn}
                        disabled={loading || googleLoading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.buttonText} />
                        ) : (
                            <Text style={[styles.buttonText, { color: colors.buttonText }]}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
                        <Text style={[styles.dividerText, { color: colors.textMuted }]}>or</Text>
                        <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
                    </View>

                    <TouchableOpacity
                        style={[styles.googleButton, { backgroundColor: colors.surface, borderColor: colors.buttonBg }, googleLoading && styles.buttonDisabled]}
                        onPress={handleGoogleSignIn}
                        disabled={loading || googleLoading}
                        activeOpacity={0.8}
                    >
                        {googleLoading ? (
                            <ActivityIndicator color={colors.text} />
                        ) : (
                            <>
                                <Text style={[styles.googleIcon, { color: colors.text }]}>G</Text>
                                <Text style={[styles.googleButtonText, { color: colors.text }]}>Continue with Google</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textMuted }]}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text style={[styles.footerLink, { color: colors.text }]}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },
    header: { alignItems: 'center', marginBottom: 36 },
    iconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 20, elevation: 6 },
    iconText: { fontSize: 32, fontWeight: '700' },
    title: { fontSize: 28, fontWeight: '700', marginBottom: 6 },
    subtitle: { fontSize: 15 },
    form: { marginBottom: 24 },
    inputGroup: { marginBottom: 18 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
    input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
    passwordRow: { position: 'relative' },
    passwordInput: { paddingRight: 60 },
    eyeButton: { position: 'absolute', right: 14, top: 14 },
    eyeText: { fontSize: 14, fontWeight: '600' },
    button: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8, elevation: 4 },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { fontSize: 17, fontWeight: '700' },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 22 },
    dividerLine: { flex: 1, height: 1 },
    dividerText: { marginHorizontal: 14, fontSize: 14 },
    googleButton: { borderWidth: 1.5, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    googleIcon: { fontSize: 20, fontWeight: '700', marginRight: 10 },
    googleButtonText: { fontSize: 16, fontWeight: '600' },
    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    footerText: { fontSize: 15 },
    footerLink: { fontSize: 15, fontWeight: '700' },
});
