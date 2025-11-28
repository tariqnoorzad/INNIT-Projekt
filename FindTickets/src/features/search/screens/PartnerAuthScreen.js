import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { ref, set, get } from 'firebase/database';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

import { gs } from '../../../styles/globalstyle';
import { auth, rtdb } from '../Firebase/database';

const PARTNER_INVITE_CODE = 'PARTNER2025'; // Simpel kode for partner signup

export default function PartnerAuthScreen({ navigation }) {
  const [mode, setMode] = useState('login'); // login | signup
  const isLogin = mode === 'login';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!email || !password || (!isLogin && (!name || !inviteCode))) {
      setError(isLogin ? 'Udfyld email og kodeord.' : 'Udfyld navn, kode og kodeord.');
      return;
    }

    if (!isLogin && inviteCode.trim() !== PARTNER_INVITE_CODE) {
      setError('Ugyldig partnerkode.');
      return;
    }

    setLoading(true);
    try {
      let userCredential;

      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        // Bloker login hvis brugeren ikke er partner
        const u = userCredential.user;
        const profileSnap = await get(ref(rtdb, `users/${u.uid}`));
        const profileData = profileSnap.val();
        if (!profileData || profileData.role !== 'partner') {
          await auth.signOut();
          setError('Denne konto er ikke partner. Brug almindeligt login.');
          setLoading(false);
          return;
        }
      } else {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        const user = userCredential.user;
        try {
          await updateProfile(user, { displayName: name });
        } catch (e) {
          console.log('updateProfile error', e);
        }

        await set(ref(rtdb, `users/${user.uid}`), {
          email: user.email,
          name,
          createdAt: Date.now(),
          role: 'partner',
          partnerId: user.uid,
          partnerName: name,
        });
      }

      navigation.goBack();
    } catch (err) {
      console.log('Partner auth error', err);
      setError(mapFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={gs.screen}>
      <View style={[gs.container, styles.root]}>
        <Pressable onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
          <Text style={[gs.subtitle, { color: '#6EE7B7', fontWeight: '700' }]}>
            ← Tilbage til almindelig login
          </Text>
        </Pressable>

        <Text style={gs.h1}>
          {isLogin ? 'Partner login' : 'Partner signup'}
        </Text>
        <Text style={gs.subtitle}>
          Kun partnere med gyldig kode.
        </Text>

        <View style={[gs.card, gs.shadowSm, styles.card]}>
          {!isLogin && (
            <>
              <Text style={styles.label}>Navn</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Partner navn"
                placeholderTextColor="#6B7280"
                style={styles.input}
              />
            </>
          )}

          <Text style={[styles.label, !isLogin && { marginTop: 16 }]}>
            Email
          </Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="partner@email.dk"
            placeholderTextColor="#6B7280"
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Kodeord</Text>
          <TextInput
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#6B7280"
            style={styles.input}
          />

          {!isLogin && (
            <>
              <Text style={[styles.label, { marginTop: 16 }]}>Partnerkode</Text>
              <TextInput
                autoCapitalize="characters"
                value={inviteCode}
                onChangeText={setInviteCode}
                placeholder="PARTNER KODE"
                placeholderTextColor="#6B7280"
                style={styles.input}
              />
            </>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

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
                {isLogin ? 'Log ind' : 'Opret partner'}
              </Text>
            )}
          </Pressable>

          <View style={styles.switchRow}>
            <Text style={gs.muted}>
              {isLogin
                ? 'Ingen partnerkonto endnu? '
                : 'Har du allerede en partnerkonto? '}
            </Text>
            <Pressable
              onPress={() => {
                setMode(isLogin ? 'signup' : 'login');
                setError('');
              }}
            >
              <Text style={styles.switchLink}>
                {isLogin ? 'Opret partner' : 'Log ind'}
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
