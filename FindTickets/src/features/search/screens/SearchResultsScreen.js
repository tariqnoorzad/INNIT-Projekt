import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gs } from '../../../styles/globalstyle';
import cats from '../data/categories.json';
import FilterBar from '../components/FilterBar';
import { rtdb } from '../Firebase/database';
import { ref, onValue } from 'firebase/database';
import { formatDateFriendly } from '../Utils/date';

// Hjælpefunktion – undgår crash og håndterer "YYYY/DD/MM" string
function formatDate(dt) {
  if (!dt) return 'Ukendt dato';

  // Hvis dt allerede er et Date objekt
  if (dt instanceof Date) return dt.toLocaleDateString('da-DK', { day: '2-digit', month: 'short', year: 'numeric' });

  // Hvis dt er string i format "YYYY/DD/MM"
  const parts = dt.split('/');
  if (parts.length === 3) {
    const [year, day, month] = parts.map(Number);
    // Bemærk: month i JS Date er 0-indexed
    const dateObj = new Date(year, month - 1, day);
    if (!isNaN(dateObj)) {
      return dateObj.toLocaleDateString('da-DK', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  }

  // Fallback
  return dt;
}

export default function SearchResultsScreen({ navigation }) {
  const [q, setQ] = useState('');               
  const [cat, setCat] = useState('all');         
  const [dbCategories, setDbCategories] = useState([]); 
  const [tickets, setTickets] = useState([]); 

  const DEFAULT_CATEGORIES = ['Comedy', 'Musik', 'Sport', 'Festival', 'Teater', 'Andet'];

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
  
        // ✅ Hent unikke kategorier fra billetterne
        const categories = [...new Set(formatted.map(t => t.category).filter(Boolean))];
        setDbCategories(categories);
      } else {
        setTickets([]);
        setDbCategories([]);
      }
    });
    return () => unsubscribe();
  }, []);


  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    return tickets.filter((d) => {
      const matchText =
        !s ||
        d.title.toLowerCase().includes(s) ||
        (d.city && d.city.toLowerCase().includes(s));
      const matchCat = cat === 'all' || d.category === cat;
      return matchText && matchCat;
    });
  }, [q, cat, tickets]);

  const filterItems = useMemo(() => {
    const merged = new Set([
      ...DEFAULT_CATEGORIES,
      ...dbCategories.filter(Boolean),
    ]);
    return Array.from(merged).map((c) => ({ id: c, title: c }));
  }, [dbCategories]);

  return (
    <SafeAreaView style={gs.screen} edges={['top', 'bottom']}>
      <FlatList
        data={results}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={{ marginBottom: 12 }}>
            <Text style={[gs.title, { marginBottom: 8 }]}>Find billetter</Text>
            <TextInput
              placeholder="Søg efter koncert, kamp, teater…"
              placeholderTextColor="#8A8F98"
              value={q}
              onChangeText={setQ}
              style={{
                backgroundColor: '#191B22',
                color: 'white',
                padding: 12,
                borderRadius: 12,
                marginBottom: 12,
              }}
            />
            <FilterBar
              selected={cat}
              onChange={setCat}
              items={filterItems}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={{ paddingTop: 24 }}>
            <Text style={gs.subtitle}>Ingen resultater</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[gs.listItem, { marginBottom: 10 }]}
            onPress={() => navigation.navigate('Search/Details', { id: item.id })}
            activeOpacity={0.8}
          >
            {/* Titel */}
            <Text style={{ color: 'white', fontWeight: '600' }}>
              {item.title}
            </Text>

            <Text style={gs.subtitle}>
              {(item.city && item.city.trim()) ? item.city : 'Ukendt by'} · {formatDateFriendly(item.dateTime)}
            </Text>

            {/* Pris */}
            <Text style={[gs.subtitle, { marginTop: 4 }]}>
              Pris: {item.price} DKK
            </Text>

            {/* Verified badge */}
            {item.isVerified && (
              <View
                style={[
                  gs.badgeVerified,
                  { alignSelf: 'flex-start', marginTop: 6 },
                ]}
              >
                <Text style={{ color: '#0E0F13' }}>Verified</Text>
              </View>
            )}

            {/* CTA knap */}
            <View style={[gs.buttonPrimary, { marginTop: 10 }]}>
              <Text style={gs.buttonTextDark}>View details</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
