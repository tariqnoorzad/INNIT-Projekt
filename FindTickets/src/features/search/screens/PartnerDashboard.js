import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ref, onValue, remove } from 'firebase/database';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

import { gs } from '../../../styles/globalstyle';
import { auth, rtdb } from '../Firebase/database';
import { formatDateFriendly } from '../Utils/date';

export default function PartnerDashboard({ navigation }) {
  const user = auth.currentUser;
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPartner, setIsPartner] = useState(false);

  useEffect(() => {
    if (!user) return;
    const userRef = ref(rtdb, `users/${user.uid}`);
    const unsubUser = onValue(userRef, (snap) => {
      const data = snap.val() || {};
      setIsPartner(data.role === 'partner');
    });

    const ticketsRef = ref(rtdb, 'tickets');
    const unsubTickets = onValue(ticketsRef, (snap) => {
      const val = snap.val() || {};
      const list = Object.values(val).filter(
        (t) => t.sellerId === user.uid && t.sellerType === 'partner'
      );
      list.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
      setTickets(list);
      setLoading(false);
    });
    return () => {
      unsubTickets();
      unsubUser();
    };
  }, [user]);

  const handleDelete = (ticketId) => {
    Alert.alert('Slet billet', 'Er du sikker på, at du vil slette denne billet?', [
      { text: 'Annuller', style: 'cancel' },
      {
        text: 'Slet',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove(ref(rtdb, `tickets/${ticketId}`));
          } catch (err) {
            console.error('Delete ticket error', err);
            Alert.alert('Fejl', 'Kunne ikke slette billetten.');
          }
        },
      },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView style={gs.screen}>
        <View style={[gs.container, { paddingTop: 24 }]}>
          <Text style={gs.title}>Log ind som partner</Text>
          <Text style={gs.subtitle}>Du skal være partner for at se dashboardet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isPartner) {
    return (
      <SafeAreaView style={gs.screen}>
        <View style={[gs.container, { paddingTop: 24 }]}>
          <Text style={gs.title}>Ikke partner</Text>
          <Text style={gs.subtitle}>Opgrader din konto til partner for at bruge dashboardet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={gs.screen} edges={['top', 'bottom']}>
      <View style={{ padding: 16, flex: 1 }}>
        <View style={gs.rowBetween}>
          <Text style={gs.h1}>Partner Dashboard</Text>
          <Pressable
            onPress={() => navigation.navigate('SellTicket')}
            style={[gs.buttonPrimary, { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 }]}
          >
            <Text style={gs.buttonTextDark}>Opret billet</Text>
          </Pressable>
        </View>
        <Text style={[gs.subtitle, { marginTop: -6 }]}>
          Administrer billetter for din partner-konto.
        </Text>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator color="#6EE7B7" size="large" />
          </View>
        ) : tickets.length === 0 ? (
          <View style={{ marginTop: 20 }}>
            <Text style={gs.subtitle}>Ingen billetter endnu.</Text>
          </View>
        ) : (
          <FlatList
            data={tickets}
            keyExtractor={(item) => item.id}
            style={{ marginTop: 16 }}
            renderItem={({ item }) => (
              <View style={[gs.listItem, { marginBottom: 12 }]}>
                <View style={gs.rowBetween}>
                  <Text style={{ color: 'white', fontWeight: '700' }}>{item.title}</Text>
                  <Text style={{ color: 'white', fontWeight: '700' }}>{item.price} DKK</Text>
                </View>
                <Text style={[gs.subtitle, { marginTop: 4 }]}>
                  {item.city || 'Ukendt by'} · {formatDateFriendly(item.dateTime)}
                </Text>
                <View style={[gs.rowBetween, { marginTop: 8 }]}>
                  <View style={[gs.badgeVerified, { backgroundColor: '#0E0F13' }]}>
                    <Text style={{ color: '#0EF27F', fontWeight: '700' }}>Verificeret partner</Text>
                  </View>
                  <Pressable onPress={() => handleDelete(item.id)}>
                    <Icon name="trash-can-outline" size={20} color="#F87171" />
                  </Pressable>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
