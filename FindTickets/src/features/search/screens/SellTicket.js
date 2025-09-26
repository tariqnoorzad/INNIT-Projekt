// src/features/sell/screens/SellTicket.js
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gs } from '../../../styles/globalstyle';
import { rtdb } from '../Firebase/database'; // ✅ Import fra din firebase.js
import { ref, push, set } from 'firebase/database';

// Midlertidige kategorier – kan senere hentes fra en JSON eller backend
const CATEGORIES = ['Musik', 'Sport', 'Teater', 'Comedy', 'Festival', 'Andet'];

export default function SellTicket({ navigation }) {
  const [form, setForm] = useState({
    title: '',
    partner: '',
    category: '',
    price: '',
    qty: '',
    city: '',
    note: '',
    dateTime: '', // 👈 nyt felt til dato
  });

  const handleChange = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const canSubmit =
    form.title.trim() &&
    form.partner.trim() &&
    form.category.trim() &&
    Number(form.price) > 0 &&
    Number(form.qty) > 0 &&
    form.dateTime.trim(); // 👈 kræver også dato

  const onSubmit = async () => {
    if (!canSubmit) {
      Alert.alert(
        'Manglende felter',
        'Udfyld venligst titel, partner, kategori, pris, antal og dato.'
      );
      return;
    }

    try {
      // Reference til "tickets" i RTDB
      const ticketsRef = ref(rtdb, 'tickets');

      // Generer unik nøgle og gem billet
      const newTicketRef = push(ticketsRef);
      await set(newTicketRef, {
        title: form.title,
        partner: form.partner,
        category: form.category,
        price: Number(form.price),
        qty: Number(form.qty),
        city: form.city,
        note: form.note,
        dateTime: form.dateTime,
        createdAt: new Date().toISOString(),
      });

      Alert.alert('Opslået ✅', 'Din billet er sat til salg.');

      // Nulstil formular
      setForm({
        title: '',
        partner: '',
        category: '',
        price: '',
        qty: '',
        city: '',
        note: '',
        dateTime: '',
      });

      navigation.goBack();
    } catch (error) {
      console.error('Fejl ved gemning i Firebase RTDB:', error);
      Alert.alert('Fejl ❌', 'Noget gik galt. Prøv igen.');
    }
  };

  return (
    <SafeAreaView style={gs.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={gs.h1}>Sælg din billet</Text>
        <Text style={[gs.muted, { marginBottom: 16 }]}>
          Udfyld oplysningerne herunder for at sætte din billet til salg.
        </Text>

        {/* Titel */}
        <TextInput
          placeholder="Event / titel"
          placeholderTextColor="#666"
          value={form.title}
          onChangeText={(v) => handleChange('title', v)}
          style={[gs.card, { marginBottom: 12, color: 'white' }]}
        />

        {/* Partner */}
        <TextInput
          placeholder="Partner (fx Tivoli, Royal Arena)"
          placeholderTextColor="#666"
          value={form.partner}
          onChangeText={(v) => handleChange('partner', v)}
          style={[gs.card, { marginBottom: 12, color: 'white' }]}
        />

        {/* Kategori */}
        <View style={{ marginBottom: 16 }}>
          <Text style={[gs.subtitle, { marginBottom: 8 }]}>Kategori</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => handleChange('category', c)}
                style={[
                  gs.pill,
                  { backgroundColor: form.category === c ? '#6EE7B7' : '#191B22' },
                ]}
              >
                <Text style={{ color: form.category === c ? '#0E0F13' : 'white' }}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pris + antal */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <TextInput
            placeholder="Pris (DKK)"
            placeholderTextColor="#666"
            value={form.price}
            onChangeText={(v) => handleChange('price', v.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            style={[gs.card, { flex: 1, color: 'white' }]}
          />
          <TextInput
            placeholder="Antal"
            placeholderTextColor="#666"
            value={form.qty}
            onChangeText={(v) => handleChange('qty', v.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            style={[gs.card, { flex: 1, color: 'white' }]}
          />
        </View>

        {/* Dato */}
        <TextInput
          placeholder="Dato (fx 2025-10-15 20:00)"
          placeholderTextColor="#666"
          value={form.dateTime}
          onChangeText={(v) => handleChange('dateTime', v)}
          style={[gs.card, { marginBottom: 12, color: 'white' }]}
        />

        {/* By */}
        <TextInput
          placeholder="By (valgfri)"
          placeholderTextColor="#666"
          value={form.city}
          onChangeText={(v) => handleChange('city', v)}
          style={[gs.card, { marginBottom: 12, color: 'white' }]}
        />

        {/* Note */}
        <TextInput
          placeholder="Beskrivelse (valgfri)"
          placeholderTextColor="#666"
          value={form.note}
          onChangeText={(v) => handleChange('note', v)}
          multiline
          style={[
            gs.card,
            { minHeight: 100, textAlignVertical: 'top', marginBottom: 16, color: 'white' },
          ]}
        />

        {/* CTA */}
        <TouchableOpacity
          style={[gs.buttonPrimary, !canSubmit && { opacity: 0.5 }]}
          onPress={onSubmit}
          disabled={!canSubmit}
        >
          <Text style={gs.buttonTextDark}>Sæt til salg</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}