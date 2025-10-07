import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { ref, get } from "firebase/database";
import { rtdb } from "../Firebase/database"; // tilpas sti
import { gs } from '../../../styles/globalstyle';
import { formatDateFriendly, formatDateLong } from '../Utils/date';




function MetaItem({ icon, children }) {
  return ( 
    <View style={gs.metaRow}>
      <Icon name={icon} size={18} color="#B8BDC7" />
      <Text style={gs.metaValue}>{children}</Text>
    </View>
  );
}

export default function TicketDetailsScreen({ route }) {
  const { id } = route.params || {}; // fx "-OaVGWaKCCmV8fnVDX38"
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Henter specifik billet fra /tickets/<id>
    const ticketRef = ref(rtdb, `tickets/${id}`);
    get(ticketRef)
      .then(snapshot => {
        if (snapshot.exists()) {
          setTicket({ id, ...snapshot.val() });
        } else {
          setTicket(null);
        }
      })
      .catch(err => {
        console.error("Error fetching ticket:", err);
        setTicket(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={gs.screen}>
        <View style={[gs.container, { paddingTop: 24 }]}>
          <ActivityIndicator size="large" color="white" />
        </View>
      </SafeAreaView>
    );
  }

  if (!ticket) {
    return (
      <SafeAreaView style={gs.screen}>
        <View style={[gs.container, { paddingTop: 24 }]}>
          <Text style={gs.subtitle}>Ticket not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={gs.screen} edges={['top','bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Titel & basisinfo */}
        <Text style={gs.h1}>{ticket.title}</Text>
   
        {/* Info-kort */}
        <View style={[gs.card, gs.shadowSm, { marginTop: 16 }]}>
          <View style={[gs.rowBetween, { alignItems: 'center' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={gs.pill}>
                <Text style={gs.muted}>{(ticket.category || 'event').toUpperCase()}</Text>
              </View>
            </View>
            <View style={gs.pricePill}>
              <Text style={gs.buttonTextDark}>{ticket.price} DKK</Text>
            </View>
          </View>

          <View style={gs.divider} />

          <MetaItem icon="calendar">{formatDateLong(ticket.dateTime)}</MetaItem>
          <MetaItem icon="map-marker">{ticket.city || "Ukendt by"}</MetaItem>
          <MetaItem icon="store">{ticket.partner || "Ingen partner"}</MetaItem>
          <MetaItem icon="ticket-confirmation">Antal: {ticket.qty || 1}</MetaItem>
        </View>

        {/* Tryg handel */}
        <View style={[gs.card, gs.shadowSm, { marginTop: 16 }]}>
          <Text style={gs.title}>Tryg handel</Text>
          <MetaItem icon="shield-check">Verificeret sælger/partner</MetaItem>
          <MetaItem icon="credit-card-check">Escrow: pengene frigives efter overdragelse</MetaItem>
          <MetaItem icon="qrcode-scan">QR tjek ved møde</MetaItem>
        </View>

        {/* CTA knapper */}
        <Pressable style={{ marginTop: 12 }} onPress={() => alert('Report issue')}>
          <Text style={{ color: 'white' }}>Report issue</Text>
        </Pressable>
      </ScrollView>

      {/* CTA bar i bunden */}
      <View style={gs.ctaBar}>
        <View style={{ flex: 1 }}>
          <Text style={[gs.muted, { fontSize: 12 }]}>Total</Text>
          <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>{ticket.price} DKK</Text>
        </View>
        <Pressable
          style={[gs.buttonPrimary, { flex: 1.2, height: 48, borderRadius: 12 }]}
          onPress={() => alert('Secure checkout')}
        >
          <Text style={gs.buttonTextDark}>Buy securely</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}