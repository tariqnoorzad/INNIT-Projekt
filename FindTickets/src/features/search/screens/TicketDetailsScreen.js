// Denne fil viser detaljer for en valgt billet/event.
// Den henter billetdata baseret på ID'et, der sendes via navigationen.
// Hvis billetten ikke findes, vises en "Ticket not found" besked.
// Hvis billetten findes, vises detaljer som titel, by, dato, pris og andre metadata.
// Der er også en "Buy securely" knap, som i denne stub blot viser en alert.
import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { gs } from '../../../styles/globalstyle';
import data from '../data/mockTickets.json';

// Hjælpefunktioner til datoformatering
function formatShort(dt) {
  return new Date(dt).toLocaleDateString('da-DK', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
function formatLong(dt) { 
  return new Date(dt).toLocaleString('da-DK', { weekday: 'short', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' });
}

// Komponent til at vise en række med ikon og tekst
function MetaItem({ icon, children }) {
  return ( 
    <View style={gs.metaRow}>
      <Icon name={icon} size={18} color="#B8BDC7" />
      <Text style={gs.metaValue}>{children}</Text>
    </View>
  );
}

// Hovedkomponenten for TicketDetailsScreen
// Modtager 'route' prop for at få adgang til navigationens parametre
// Finder billetten baseret på ID'et fra route.params
export default function TicketDetailsScreen({ route }) {
  const ticket = data.find(t => t.id === route.params?.id); // Finder billetten baseret på ID fra navigationens parametre

  // Hvis billetten ikke findes, vis en "Ticket not found" besked
  if (!ticket) {
    return (
      <SafeAreaView style={gs.screen}>
        <View style={[gs.container, { paddingTop: 24 }]}>
          <Text style={gs.subtitle}>Ticket not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Hvis billetten findes, vis dens detaljer
  return (
    <SafeAreaView style={gs.screen} edges={['top','bottom']}>
      {/* Scrollbart indhold */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>

        {/* HERO */}
        <Text style={gs.h1}>{ticket.title}</Text>
        <Text style={[gs.muted, { marginTop: 6 }]}>{ticket.city} · {formatShort(ticket.dateTime)}</Text>
        <Text style={[gs.muted, { marginTop: 6 }]}>Pris: <Text style={{ color: 'white', fontWeight: '800' }}>{ticket.price} DKK</Text></Text>

        {/* INFO-KORT */}
        <View style={[gs.card, gs.shadowSm, { marginTop: 16 }]}>
          <View style={[gs.rowBetween, { alignItems: 'center' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {ticket.isVerified && (
                <View style={gs.badgeVerified}>
                  <Text style={{ color: '#0E0F13', fontWeight: '700' }}>Verified</Text>
                </View>
              )}
              <View style={gs.pill}>
                <Text style={gs.muted}>{(ticket.category || 'event').toUpperCase()}</Text>
              </View>
            </View>
            <View style={gs.pricePill}>
              <Text style={gs.buttonTextDark}>{ticket.price} DKK</Text>
            </View>
          </View>

          <View style={gs.divider} />

          <MetaItem icon="calendar">{formatLong(ticket.dateTime)}</MetaItem>
          <MetaItem icon="map-marker">{ticket.city}</MetaItem>
          <MetaItem icon="ticket-confirmation">Digital billet (QR)</MetaItem>
        </View>

        {/* TRUST/SAFETY */}
        <View style={[gs.card, gs.shadowSm, { marginTop: 16 }]}>
          <Text style={gs.title}>Tryg handel</Text>
          <MetaItem icon="shield-check">Verificeret sælger/partner</MetaItem>
          <MetaItem icon="credit-card-check">Escrow: pengene frigives efter overdragelse</MetaItem>
          <MetaItem icon="qrcode-scan">QR tjek ved møde</MetaItem>
        </View>

        {/* Primær CTA i content (hvis man scroller) */}
        <Pressable
          style={[gs.buttonPrimary, { marginTop: 16, height: 52, borderRadius: 16 }]}
          onPress={() => alert('Secure checkout – stub')}
        >
          <Text style={gs.buttonTextDark}>Buy securely</Text>
        </Pressable>

        <Pressable style={{ marginTop: 12 }} onPress={() => alert('Report issue – stub')}>
          <Text style={{ color: 'white' }}>Report issue</Text>
        </Pressable>
      </ScrollView>

      {/* Verified køb i bunden */}
      <View style={gs.ctaBar}>
        <View style={{ flex: 1 }}>
          <Text style={[gs.muted, { fontSize: 12 }]}>Total</Text>
          <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>{ticket.price} DKK</Text>
        </View>
        <Pressable
          style={[gs.buttonPrimary, { flex: 1.2, height: 48, borderRadius: 12 }]}
          onPress={() => alert('Secure checkout – stub')}
        >
          <Text style={gs.buttonTextDark}>Buy securely</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
