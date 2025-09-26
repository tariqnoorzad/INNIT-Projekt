// Denne del af appen viser en liste over billetter, som brugeren kan søge og filtrere i.
// Skærmen indeholder en søgefelt, en filterbar og en liste over resultater.
// Når brugeren trykker på en billet, navigeres der til TicketDetailsScreen med den valgte billets ID.
import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gs } from '../../../styles/globalstyle';
import data from '../data/mockTickets.json';
import cats from '../data/categories.json'; 
import FilterBar from '../components/FilterBar';

export default function SearchResultsScreen({ navigation }) {
  // q = søgeterm fra inputfeltet
  const [q, setQ] = useState('');
  // cat = valgt kategori (default = 'all'), hvilket betyder ingen filtrering på kategori
  const [cat, setCat] = useState('all');

  // useMemo bruges til at optimere ydeevnen ved kun at genberegne resultaterne, når 'q' eller 'cat' ændrer sig
  // Filtrerer data baseret på søgeterm og valgt kategori
  const results = useMemo(() => {
    const s = q.trim().toLowerCase(); // Trim og lav søgeterm om til små bogstaver for konsistent sammenligning
    return data.filter(d => { // Filtrering baseret på både søgeterm og kategori
      // Tjekker om søgetermen findes i titlen eller byen, eller hvis søgetermen er tom
      const matchText = !s || d.title.toLowerCase().includes(s) || d.city.toLowerCase().includes(s); // tom søgeterm matcher alt
      const matchCat  = cat === 'all' || d.category === cat; // 'all' matcher alle kategorier
      return matchText && matchCat; // Begge betingelser skal være opfyldt
    });
  }, [q, cat]); // Afhængigheder for useMemo

  // Render skærmen med en SafeAreaView, FlatList til at vise resultaterne, og komponenter til søgning og filtrering
  // Når der ikke er nogen resultater, vises en besked om "Ingen resultater"
  // Når en billet trykkes på, navigeres der til TicketDetailsScreen med den valgte billets ID
  return (
    <SafeAreaView style={gs.screen} edges={['top','bottom']}> 
      <FlatList
        data={results}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false} 
        keyboardShouldPersistTaps="handled" 

        ListHeaderComponent={ // Header-komponenten indeholder søgefeltet og filterbaren
          <View style={{ marginBottom: 12 }}>
            <Text style={[gs.title, { marginBottom: 8 }]}>Find billetter</Text>
            <TextInput
              placeholder="Søg efter koncert, kamp, teater…"
              placeholderTextColor="#8A8F98"
              value={q} // Søgeterm
              onChangeText={setQ} // Opdaterer søgeterm ved tekstændring
              style={{ backgroundColor: '#191B22', color: 'white', padding: 12, borderRadius: 12, marginBottom: 12 }}
            />
            <FilterBar selected={cat} onChange={setCat} items={cats.filters} /> {/* Filterbar til valg af kategori */}
          </View>
        }

        ListEmptyComponent={<Text style={gs.subtitle}>Ingen resultater</Text>} // Vis når der ikke er nogen resultater

        // Render hver billet i listen
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[gs.listItem, { marginBottom: 10 }]}
            onPress={() => navigation.navigate('Search/Details', { id: item.id })}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>{item.title}</Text>
            <Text style={gs.subtitle}> 
              {item.city} · {new Date(item.dateTime).toLocaleString('da-DK')} 
            </Text>
            {item.isVerified && (
              <View style={[gs.badgeVerified, { alignSelf: 'flex-start', marginTop: 6 }]}>
                <Text style={{ color: '#0E0F13' }}>Verified</Text>
              </View>
            )}
            <View style={[gs.buttonPrimary, { marginTop: 10 }]}>
              <Text style={gs.buttonTextDark}>View details</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
