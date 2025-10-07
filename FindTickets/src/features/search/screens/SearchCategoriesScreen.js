import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gs } from '../../../styles/globalstyle';
import CategoryCard from '../components/CategoryCard';
import cats from '../data/categories.json';
import { rtdb } from '../Firebase/database';
import { ref, onValue } from 'firebase/database';

// Entry categories = de 3 kort øverst, altså vi trækker "entry"-kategorierne (Find, Sælg, Partnere) ud af JSON-filen
const entryCats = cats.entry;

export default function SearchCategoriesScreen({ navigation }) {
  const [tickets, setTickets] = useState([]);

  // ✅ Hent billetter fra Firebase
  useEffect(() => {
    const ticketsRef = ref(rtdb, 'tickets');
    const unsubscribe = onValue(ticketsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setTickets(formatted);
      } else {
        setTickets([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Populært lige nu – sorter efter dato og tag de 5 næste events
  const popular = useMemo(() => {
    return [...tickets]
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
      .slice(0, 5);
  }, [tickets]);

  const partners = ['Royal Arena', 'Escape Room', 'Paint Ball', 'Brøndby IF', 'Tivoli']; // mock badges

  return (
    <SafeAreaView style={gs.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* HERO */}
        <View>
          <Text style={gs.h1}>Event Now</Text>
          <Text style={[gs.muted, { marginTop: 6 }]}>
            Find, sælg eller udforsk samarbejdspartnere
          </Text>
        </View>

        {/* QUICK LINKS */}
        <View style={gs.section}>
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
  </View>

  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingTop: 12, gap: 16, paddingBottom: 12 }}
  >
    {popular.map((t) => (
      <Pressable
        key={t.id}
        onPress={() => navigation.navigate('Search/Details', { id: t.id })}
        style={{
          width: 230,                     // bredere kort
          minHeight: 170,                  // højere kort
          padding: 16,
          borderRadius: 20,                // rundere hjørner
          backgroundColor: '#1F2128',      // lidt mørkere baggrund
          justifyContent: 'space-around',
        }}
      >
        {/* Titel */}
        <Text style={{ color: 'white', fontWeight: '700', fontSize: 18 }} numberOfLines={2}>
          {t.title}
        </Text>

        {/* By og dato */}
        <Text style={[gs.subtitle, { marginTop: 6 }]} numberOfLines={1}>
          {t.city ? t.city : 'Ukendt by'} · {new Date(t.dateTime).toLocaleDateString('da-DK', { day: '2-digit', month: 'short', year: 'numeric' })}
        </Text>

        {/* Antal og pris */}
        <Text style={[gs.subtitle, { marginTop: 4 }]}>
          Antal: {t.qty || 'Ukendt'} · Pris: {t.price} kr
        </Text>

        {/* Verified badge */}
        {t.isVerified && (
          <View
            style={{
              backgroundColor: '#0E0F13',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              alignSelf: 'flex-start',
              marginTop: 6,
            }}
          >
            <Text style={{ color: '#0EF27F', fontWeight: '600' }}>Verified</Text>
          </View>
        )}

        {/* CTA knap */}
        <View style={[gs.buttonPrimary, { marginTop: 10, paddingVertical: 10 }]}>
          <Text style={gs.buttonTextDark}>Fra {t.price} kr</Text>
        </View>
      </Pressable>
    ))}
  </ScrollView>
</View>

      </ScrollView>
    </SafeAreaView>
  );
}