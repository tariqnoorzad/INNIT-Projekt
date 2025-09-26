// src/features/search/components/FilterBar.js
// Dette er en horisontal filterbar, der bruges til at filtrere søgeresultaterne i SearchResultsScreen.
// Den viser en række filtre for kategorier (f.eks. "Alle", "Koncerter", "Sport", "Teater"), som brugeren kan vælge imellem.
// Når et filter vælges, kaldes onChange-funktionen med det valgte filter-id.
import React from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';

// FilterBar komponent
// Modtager 'selected' (valgt filter-id), 'onChange' (funktion ved filterændring) og 'items' (liste over filtre) som props
// 'items' er et array af objekter med 'id' og 'title' felter
export default function FilterBar({ selected = 'all', onChange, items = [] }) {
  const list = [{ id: 'all', title: 'Alle' }, ...items]; // items er et ARRAY nu

  // Render filterbaren som en horisontal ScrollView med knapper for hvert filter
  // Den valgte knap fremhæves visuelt
  // Når en knap trykkes, kaldes onChange med det tilsvarende filter-id
  return (
    <View style={{ marginBottom: 12 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
        {list.map((c) => {
          const active = selected === c.id; // Tjekker om dette filter er det valgte
          return (
            <TouchableOpacity
              key={c.id}
              onPress={() => onChange?.(c.id)} // Kald onChange med filter-id ved tryk
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: active ? '#6EE7B7' : '#191B22'
              }}>
              <Text style={{ color: active ? '#0E0F13' : 'white', fontWeight: '600' }}>
                {c.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
