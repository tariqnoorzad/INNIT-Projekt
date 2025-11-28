import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ref, onValue } from 'firebase/database';

import { gs } from '../../../styles/globalstyle';
import { rtdb } from '../Firebase/database';
import { formatDateFriendly } from '../Utils/date';

export default function PartnerTicketsScreen({ route, navigation }) {
  const partner = route.params?.partner;
  const partnerId = partner?.partnerId || partner?.id || route.params?.partnerId;
  const partnerName = partner?.name || partner?.partnerName || 'Partner';

  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const ticketsRef = ref(rtdb, 'tickets');
    const unsub = onValue(ticketsRef, (snap) => {
      const val = snap.val() || {};
      const list = Object.keys(val)
        .map((id) => ({ id, ...val[id] }))
        .filter((t) => {
          // match på ID (uid) eller partnerName fra katalogkortet
          if (partnerId && (t.partnerId === partnerId || t.sellerId === partnerId)) {
            return true;
          }
          if (partnerName && t.partnerName && t.partnerName.toLowerCase() === partnerName.toLowerCase()) {
            return true;
          }
          return false;
        });
      setTickets(list);
    });
    return () => unsub();
  }, [partnerId]);

  return (
    <SafeAreaView style={gs.screen} edges={['top', 'bottom']}>
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 12 }}>
            <Text style={gs.h1}>{partnerName}</Text>
            <Text style={gs.subtitle}>Billetter fra partneren</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={{ paddingTop: 12 }}>
            <Text style={gs.subtitle}>Ingen billetter fra denne partner.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[gs.listItem, { marginBottom: 10 }]}
            onPress={() => navigation.navigate('Search/Details', { id: item.id })}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>{item.title}</Text>
            <Text style={gs.subtitle}>
              {item.city || 'Ukendt by'} · {formatDateFriendly(item.dateTime)}
            </Text>
            <View style={[gs.badgeVerified, { backgroundColor: '#0E0F13', marginTop: 6 }]}>
              <Text style={{ color: '#0EF27F', fontWeight: '700' }}>Verificeret partner</Text>
            </View>
            <View style={[gs.buttonPrimary, { marginTop: 10 }]}>
              <Text style={gs.buttonTextDark}>View details</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
