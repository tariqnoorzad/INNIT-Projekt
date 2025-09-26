// src/features/search/screens/SearchCategoriesScreen.js
// Dette er "forsiden" for søgedelen af appen.
// Her kan brugeren vælge mellem forskellige kategorier (Find, Sælg, Partnere).
// Skærmen viser også populære events og samarbejdspartnere.
import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gs } from '../../../styles/globalstyle';
import CategoryCard from '../components/CategoryCard';
import cats from '../data/categories.json';
import tickets from '../data/mockTickets.json';

// Entry categories = de 3 kort øverst, altså vi trækker "entry"-kategorierne (Find, Sælg, Partnere) ud af JSON-filen
const entryCats = cats.entry;

export default function SearchCategoriesScreen({ navigation }) {
  // Her vil vi udregne de 5 næste events i tid, som bruges til at fremvise "Populært lige nu" for brugeren.
  // useMemo sikrer, at vi kun genberegner denne liste, hvis 'tickets' ændrer sig.
  const popular = useMemo(() => {
    return [...tickets]
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
      .slice(0, 5);
  }, []);

  const partners = ['Royal Arena', 'Escape Room', 'Paint Ball', 'Brøndby IF', 'Tivoli']; // mock badges

  return (
    <SafeAreaView style={gs.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* HERO */}
        <View>
          <Text style={gs.h1}>Event Now</Text>
          <Text style={[gs.muted, { marginTop: 6 }]}>
            Find, sælg eller udforsk samarbejdspartnere — alt samlet ét sted.
          </Text>
          <Pressable
            onPress={() => navigation.navigate('Search/Results')}
            style={[gs.buttonPrimary, { marginTop: 14, alignSelf: 'flex-start' }]}
          >
            <Text style={gs.buttonTextDark}>Find billetter</Text>
          </Pressable>
        </View>

        {/* QUICK LINKS */}
        <View style={gs.section}>
          <Text style={gs.title}>EVENT NOW</Text>
          <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {entryCats.map((item) => (
              <CategoryCard
                key={item.id}
                item={item}
                onPress={() =>
                  item.id === 'search'
                    ? navigation.navigate('Search/Results')
                    : item.id === 'sell'
                      ? navigation.navigate('SellTicket')
                      : item.id === 'partners'
                        ? navigation.navigate('PartnersList')
                        : alert('Kommer snart')
                }
              />

            ))}
          </View>
        </View>

        {/* POPULÆRT LIGE NU */}
        <View style={gs.section}>
          <View style={gs.rowBetween}>
            <Text style={gs.title}>Populært lige nu</Text>
            <Pressable onPress={() => navigation.navigate('Search/Results')}>
              <Text style={gs.muted}>Se alle</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 12, gap: 12 }}
          >
            {popular.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => navigation.navigate('Search/Details', { id: t.id })}
                style={[gs.card, gs.shadowSm, { width: 220 }]}
              >
                <Text style={{ color: 'white', fontWeight: '700' }} numberOfLines={1}>
                  {t.title}
                </Text>
                <Text style={gs.subtitle} numberOfLines={1}>
                  {t.city} · {new Date(t.dateTime).toLocaleDateString('da-DK', { day: '2-digit', month: 'short' })}
                </Text>
                <View style={[gs.buttonPrimary, { marginTop: 10, paddingVertical: 8 }]}>
                  <Text style={gs.buttonTextDark}>Fra {t.price} kr</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* TRUSTED PARTNERS */}
        <View style={gs.section}>
          <Text style={gs.title}>Trygge partnere</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
            {partners.map((p) => (
              <View key={p} style={[gs.card, gs.shadowSm, { paddingVertical: 8, paddingHorizontal: 12 }]}>
                <Text style={{ color: 'white', fontWeight: '600' }}>{p}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
