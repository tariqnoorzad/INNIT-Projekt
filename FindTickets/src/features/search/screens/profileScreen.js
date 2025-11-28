import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { ref, onValue } from 'firebase/database';
import { signOut } from 'firebase/auth';

import { gs } from '../../../styles/globalstyle';
import { rtdb, auth } from '../../search/Firebase/database';
import { formatDateLong, formatDateFriendly } from '../../search/Utils/date';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const userRef = ref(rtdb, `users/${user.uid}`);
    const unsubUser = onValue(userRef, (snap) => {
      const data = snap.val() || {};
      setProfile({
        uid: user.uid,
        email: user.email,
        ...data,
      });
      setLoadingProfile(false);
    });

    const purchasesRef = ref(rtdb, `userPurchases/${user.uid}`);
    const unsubPurchases = onValue(purchasesRef, (snap) => {
      const val = snap.val() || {};
      const list = Object.entries(val).map(([id, v]) => ({
        id,
        ...v,
      }));

      // Seneste køb først
      list.sort((a, b) => (b.purchasedAt || 0) - (a.purchasedAt || 0));

      setPurchases(list);
      setLoadingPurchases(false);
    });

    const ratingsRef = ref(rtdb, `userRatings/${user.uid}`);
    const unsubRatings = onValue(ratingsRef, (snap) => {
      const val = snap.val() || {};
      const list = Object.entries(val).map(([id, v]) => ({
        id,
        ...v,
      }));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setRatings(list);
      setLoadingRatings(false);
    });

    const ratingSummaryRef = ref(rtdb, `users/${user.uid}/ratingSummary`);
    const unsubRatingSummary = onValue(ratingSummaryRef, (snap) => {
      setRatingSummary(snap.val() || null);
    });

    return () => {
      unsubUser();
      unsubPurchases();
      unsubRatings();
      unsubRatingSummary();
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error', err);
      Alert.alert('Fejl', 'Kunne ikke logge ud. Prøv igen.');
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={gs.screen}>
        <View style={[gs.container, { paddingTop: 24 }]}>
          <Text style={gs.title}>Ikke logget ind</Text>
          <Text style={gs.subtitle}>Log ind for at se din profil.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isLoading = loadingProfile || loadingPurchases;
  const isRatingsLoading = loadingRatings;

  const displayName =
    profile?.name ||
    profile?.displayName ||
    (profile?.email ? profile.email.split('@')[0] : 'Bruger');

  const createdAtText = profile?.createdAt
    ? formatDateLong(new Date(profile.createdAt).toISOString())
    : 'Ukendt';

  const mitIdVerified = !!profile?.mitIdVerified;
  const isPartner = profile?.role === 'partner';

  return (
    <SafeAreaView style={gs.screen} edges={['top', 'bottom']}>
      {isLoading ? (
        <View
          style={[
            gs.container,
            { flex: 1, justifyContent: 'center', alignItems: 'center' },
          ]}
        >
          <ActivityIndicator size="large" color="#6EE7B7" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          {/* Overskrift */}
          <Text style={gs.h1}>Profil</Text>

          {/* Brugerinfo-kort */}
          <View style={[gs.card, gs.shadowSm]}>
            <View style={[gs.rowBetween, { alignItems: 'center' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#6EE7B7',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 10,
                  }}
                >
                  <Icon name="account" size={22} color="#0E0F13" />
                </View>
                <View>
                  <Text style={gs.title}>{displayName}</Text>
                  <Text style={gs.subtitle}>{profile?.email}</Text>
                </View>
              </View>
            </View>

            <View style={gs.divider} />

            {/* Oprettelsesdato */}
            <View style={gs.metaRow}>
              <Icon name="calendar" size={18} color="#B8BDC7" />
              <Text style={gs.metaValue}>Medlem siden: {createdAtText}</Text>
            </View>

            <View style={[gs.metaRow, { marginTop: 8 }]}>
              <Icon name="account-check" size={18} color="#B8BDC7" />
              <Text style={gs.metaValue}>
                Rolle: {isPartner ? 'Partner' : 'Privat bruger'}
              </Text>
            </View>


              <View style={[gs.metaRow, { marginTop: 8 }]}>
                <Icon name="shield-check" size={18} color="#B8BDC7" />
                <Text style={gs.metaValue}>MitID-verificeret</Text>
              </View>



            {/* Logout-knap */}
            <Pressable
              onPress={handleLogout}
              style={[
                gs.buttonPrimary,
                { marginTop: 16, alignSelf: 'stretch' },
              ]}
            >
              <Text style={gs.buttonTextDark}>Log ud</Text>
            </Pressable>

            {isPartner && (
              <Pressable
                onPress={() => navigation.navigate('Search', { screen: 'PartnerDashboard' })}
                style={[
                  gs.buttonPrimary,
                  { marginTop: 10, alignSelf: 'stretch', backgroundColor: '#4ADE80' },
                ]}
              >
                <Text style={gs.buttonTextDark}>Gå til Partner Dashboard</Text>
              </Pressable>
            )}
          </View>

          {/* Modtagne ratings - kun for privat sælger (P2P) */}
          {!isPartner && (
            <View style={[gs.section, { marginTop: 24 }]}>
              <Text style={gs.title}>Modtagne ratings</Text>
              {isRatingsLoading ? (
                <ActivityIndicator style={{ marginTop: 12 }} color="#6EE7B7" />
              ) : ratingSummary ? (
                <View style={[gs.card, { marginTop: 12 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Icon name="star" size={20} color="#FACC15" />
                    <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
                      {ratingSummary.avg?.toFixed(1)}
                    </Text>
                    <Text style={gs.muted}>({ratingSummary.count || 0})</Text>
                  </View>
                  {ratings.slice(0, 3).map((r) => (
                    <View key={r.id} style={[gs.metaRow, { marginTop: 10 }]}>
                      <Icon name="ticket" size={16} color="#B8BDC7" />
                      <Text style={gs.metaValue}>
                        {r.ticketTitle || 'Billet'} · {r.stars}★
                      </Text>
                    </View>
                  ))}
                  {ratings.length === 0 && (
                    <Text style={[gs.muted, { marginTop: 10 }]}>
                      Ingen detaljerede ratings endnu.
                    </Text>
                  )}
                </View>
              ) : (
                <Text style={[gs.subtitle, { marginTop: 8 }]}>Ingen ratings endnu.</Text>
              )}
            </View>
          )}

          {/* Købte billetter */}
          <View style={[gs.section, { marginTop: 24 }]}>
            <Text style={gs.title}>Dine billetter</Text>
            <Text style={[gs.subtitle, { marginTop: 2 }]}>
              Billetter købt via Event Now.
            </Text>

            {purchases.length === 0 ? (
              <Text style={[gs.subtitle, { marginTop: 12 }]}>
                Du har endnu ikke købt nogen billetter.
              </Text>
            ) : (
              <View style={{ marginTop: 12, gap: 10 }}>
                {purchases.map((p) => {
                  const total =
                    (Number(p.price) || 0) * (Number(p.quantity) || 1);

                  const dateLabel = p.dateTime
                    ? formatDateFriendly(p.dateTime)
                    : formatDateFriendly(
                        new Date(p.purchasedAt).toISOString()
                      );

                  return (
                    <View key={p.id} style={[gs.listItem]}>
                      <View style={gs.rowBetween}>
                        <Text
                          style={{
                            color: 'white',
                            fontWeight: '700',
                            fontSize: 15,
                          }}
                          numberOfLines={1}
                        >
                          {p.title || 'Billet'}
                        </Text>
                        <Text
                          style={{
                            color: 'white',
                            fontWeight: '700',
                            fontSize: 14,
                          }}
                        >
                          {total} DKK
                        </Text>
                      </View>

                      <Text
                        style={[gs.muted, { marginTop: 4, fontSize: 12 }]}
                        numberOfLines={1}
                      >
                        {dateLabel}
                        {p.city ? ` · ${p.city}` : ''}
                      </Text>

                      <View
                        style={[
                          gs.rowBetween,
                          { marginTop: 8, alignItems: 'center' },
                        ]}
                      >
                        <Text style={[gs.muted, { fontSize: 12 }]}>
                          Antal: {p.quantity || 1}
                        </Text>
                        {p.partner && (
                          <View style={gs.badgeVerified}>
                            <Text
                              style={{
                                color: 'white',
                                fontSize: 11,
                                fontWeight: '600',
                              }}
                            >
                              {p.partner}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
