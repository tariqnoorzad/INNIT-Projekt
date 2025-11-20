// src/features/search/screens/loginScreen.js

import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { auth, rtdb } from '../Firebase/database';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { gs } from '../../../styles/globalstyle';

export default function LoginScreen() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const isLogin = mode === 'login';

  const [name, setName] = useState('');      // 👈 NYT
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (!email || !password || (!isLogin && !name)) {
      setError(isLogin ? 'Udfyld email og kodeord.' : 'Udfyld navn, email og kodeord.');
      return;
    }

    setLoading(true);
    try {
      let userCredential;

      if (isLogin) {
        // 🔓 Login
        userCredential = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
      } else {
        // 🆕 Opret bruger
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        const user = userCredential.user;

        // Sæt displayName i Firebase Auth (valgfrit, men nice)
        try {
          await updateProfile(user, { displayName: name });
        } catch (e) {
          console.log('updateProfile error', e);
        }

        // Gem brugerprofil i Realtime Database
        await set(ref(rtdb, `users/${user.uid}`), {
          email: user.email,
          name,
          createdAt: Date.now(),
        });
      }

      // App.js fanger login via onAuthStateChanged og viser tabs
    } catch (err) {
      console.log('Auth error', err);
      setError(mapFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={gs.screen}>
      <View style={[gs.container, styles.root]}>
        {/* Overskrift */}
        <Text style={gs.h1}>
          {isLogin ? 'Velkommen tilbage' : 'Opret bruger'}
        </Text>
        <Text style={gs.subtitle}>
          {isLogin
            ? 'Log ind for at købe og sælge billetter.'
            : 'Lav en konto og kom i gang.'}
        </Text>

        <View style={[gs.card, gs.shadowSm, styles.card]}>
          {/* Navn kun ved oprettelse */}
          {!isLogin && (
            <>
              <Text style={styles.label}>Navn</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Dit navn"
                placeholderTextColor="#6B7280"
                style={styles.input}
              />
            </>
          )}

          {/* Email */}
          <Text style={[styles.label, !isLogin && { marginTop: 16 }]}>
            Email
          </Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="din@email.dk"
            placeholderTextColor="#6B7280"
            style={styles.input}
          />

          {/* Kodeord */}
          <Text style={[styles.label, { marginTop: 16 }]}>Kodeord</Text>
          <TextInput
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#6B7280"
            style={styles.input}
          />

          {/* Fejlbesked */}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Primær knap */}
          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            style={[
              gs.buttonPrimary,
              styles.primaryButton,
              loading && { opacity: 0.7 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#0E0F13" />
            ) : (
              <Text style={gs.buttonTextDark}>
                {isLogin ? 'Log ind' : 'Opret konto'}
              </Text>
            )}
          </Pressable>

          {/* Skift mellem login / signup */}
          <View style={styles.switchRow}>
            <Text style={gs.muted}>
              {isLogin
                ? 'Har du ikke en konto? '
                : 'Har du allerede en konto? '}
            </Text>
            <Pressable
              onPress={() => {
                setMode(isLogin ? 'signup' : 'login');
                setError('');
              }}
            >
              <Text style={styles.switchLink}>
                {isLogin ? 'Opret dig' : 'Log ind'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function mapFirebaseError(err) {
  if (!err?.code) return 'Noget gik galt. Prøv igen.';

  switch (err.code) {
    case 'auth/invalid-email':
      return 'Ugyldig email.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Forkert email eller kodeord.';
    case 'auth/email-already-in-use':
      return 'Der findes allerede en konto med den email.';
    case 'auth/weak-password':
      return 'Kodeordet er for svagt (min. 6 tegn).';
    default:
      return 'Noget gik galt. Prøv igen.';
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  card: {
    marginTop: 8,
  },
  label: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0E0F13',
    borderWidth: 1,
    borderColor: '#2A2E36',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: 'white',
    fontSize: 14,
  },
  error: {
    color: '#F97373',
    marginTop: 10,
    fontSize: 13,
  },
  primaryButton: {
    marginTop: 20,
  },
  switchRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  switchLink: {
    color: '#6EE7B7',
    fontWeight: '600',
  },
});
