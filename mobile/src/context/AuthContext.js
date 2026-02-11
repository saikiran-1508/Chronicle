/**
 * AuthContext — Firebase Authentication state management.
 * Provides signIn, signUp, googleSignIn, signOut helpers and
 * an onAuthStateChanged listener to keep the UI in sync.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// ── Configure Google Sign-In ────────────────────────────────────────────────
// Replace the webClientId with the one from your Firebase project
// (found in Firebase Console → Authentication → Sign-in method → Google → Web SDK configuration)
GoogleSignin.configure({
    webClientId: 'YOUR_WEB_CLIENT_ID_HERE', // TODO: replace with your Firebase web client ID
});

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Listen for Firebase auth state changes
    useEffect(() => {
        const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // ── Email / Password Sign In ────────────────────────────────────────────
    const signIn = async (email, password) => {
        try {
            await auth().signInWithEmailAndPassword(email, password);
            return { success: true };
        } catch (error) {
            return { success: false, error: getFirebaseErrorMessage(error.code) };
        }
    };

    // ── Email / Password Sign Up ────────────────────────────────────────────
    const signUp = async (name, email, password) => {
        try {
            const credential = await auth().createUserWithEmailAndPassword(email, password);
            // Set the display name on the newly created user
            await credential.user.updateProfile({ displayName: name });
            return { success: true };
        } catch (error) {
            return { success: false, error: getFirebaseErrorMessage(error.code) };
        }
    };

    // ── Google Sign In ──────────────────────────────────────────────────────
    const googleSignIn = async () => {
        try {
            // Check if device supports Google Play services
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            // Get the user's ID token
            const response = await GoogleSignin.signIn();
            // Create a Google credential with the token
            const googleCredential = auth.GoogleAuthProvider.credential(response.data?.idToken);
            // Sign in to Firebase with the Google credential
            await auth().signInWithCredential(googleCredential);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Google sign-in failed' };
        }
    };

    // ── Sign Out ────────────────────────────────────────────────────────────
    const signOut = async () => {
        try {
            await auth().signOut();
            try { await GoogleSignin.revokeAccess(); } catch (_) { }
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, googleSignIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

// ── Human-readable error messages ───────────────────────────────────────────
function getFirebaseErrorMessage(code) {
    switch (code) {
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please sign in instead.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/weak-password':
            return 'Password must be at least 6 characters.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
        case 'auth/invalid-credential':
            return 'Invalid email or password. Please try again.';
        default:
            return 'Something went wrong. Please try again.';
    }
}

export default AuthContext;
