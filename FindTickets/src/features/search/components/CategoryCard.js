// src/features/search/components/CategoryCard.js
// Dette er et kort, der repræsenterer en kategori på forsiden af søgedelen (SearchCategoriesScreen).
// (Find, Sælg, Partner)
// Kortet viser et ikon, en titel og en ID for kategorien.
import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { gs } from '../../../styles/globalstyle';

// Kortets ikon baseres på kategoriens "icon" felt
// Vi laver et simpelt map fra kategori-id til ikon-navn
// Hvis ikonet ikke findes i mappet, bruges et standardikon
const ICON_MAP = {
  search: 'magnify',
  'ticket-plus': 'ticket-plus',
  handshake: 'handshake-outline', 
};

// Kategori-kort komponent
// Modtager 'item' (kategori data) og 'onPress' (funktion ved tryk) som props
export default function CategoryCard({ item, onPress }) {
  const iconName = ICON_MAP[item.icon] || 'shape'; // Få ikon-navnet fra mappet eller brug standardikonet
  return (
    <Pressable
      onPress={onPress} // Kald onPress-funktionen ved tryk
      style={[gs.card, gs.shadowSm, { width: '31%', marginBottom: 12 }]}
    >
      <View style={gs.iconCircle}>
        <Icon name={iconName} size={20} color="#0E0F13" />
      </View>
      <Text style={{ color: 'white', fontWeight: '700', marginTop: 8 }}>{item.title}</Text>
      <Text style={gs.subtitle}>({item.id})</Text>
    </Pressable>
  );
}
