import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gs } from '../../../styles/globalstyle';
import { rtdb, auth } from '../Firebase/database';
import { ref, push, set } from 'firebase/database';
import { FlatList } from 'react-native';

const CATEGORIES = ['Musik', 'Sport', 'Teater', 'Comedy', 'Festival', 'Andet'];
const getDaysInMonth = (month, year) => {
  const date = new Date(year, month - 1, 1);
  const days = [];
  while (date.getMonth() === month - 1) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export default function SellTicket() {
  const [form, setForm] = useState({
    title: '',
    partner: '',
    category: '',
    price: '',
    qty: '',
    city: '',
    note: '',
    dateTime: '',
  });

  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
    hour: new Date().getHours(),
    minute: new Date().getMinutes(),
  });

  const handleChange = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const canSubmit =
    form.title.trim() &&
    form.partner.trim() &&
    form.category.trim() &&
    Number(form.price) > 0 &&
    Number(form.qty) > 0 &&
    form.dateTime.trim();

  const formatDateTime = (d) => {
    const yyyy = d.year;
    const mm = String(d.month).padStart(2, '0');
    const dd = String(d.day).padStart(2, '0');
    const hh = String(d.hour).padStart(2, '0');
    const min = String(d.minute).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  const saveDateTime = () => {
    handleChange('dateTime', formatDateTime(selectedDate));
    setShowDateModal(false);
  };

  const onSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Login påkrævet', 'Log ind for at sætte en billet til salg.');
      return;
    }

    if (!canSubmit) {
      Alert.alert(
        'Manglende felter',
        'Udfyld venligst titel, partner, kategori, pris, antal og dato.'
      );
      return;
    }

    try {
      const ticketsRef = ref(rtdb, 'tickets');
      const newTicketRef = push(ticketsRef);
      const newId = newTicketRef.key;

      const dateObj = new Date(form.dateTime);
      if (isNaN(dateObj)) {
        Alert.alert('Ugyldig dato', 'Vælg venligst en gyldig dato og tid.');
        return;
      }

      await set(newTicketRef, {
        id: newId,
        title: form.title,
        partner: form.partner,
        category: form.category,
        price: Number(form.price),
        qty: Number(form.qty),
        city: form.city,
        note: form.note,
        dateTime: dateObj.toISOString(),
        createdAt: new Date().toISOString(),
        sellerId: user.uid,
        sellerType: 'p2p',
        sellerName:
          user.displayName ||
          (user.email ? user.email.split('@')[0] : 'Sælger'),
      });

      Alert.alert('Opslået', 'Din billet er sat til salg.');
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
    } catch (error) {
      console.error('Fejl ved gemning i Firebase RTDB:', error);
      Alert.alert('Fejl', 'Noget gik galt. Prøv igen.');
    }
  };

  // Hjælpefunktion til at generere arrays
  const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => i + start);

  return (
    <SafeAreaView style={gs.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={gs.h1}>Sælg din billet</Text>

        <TextInput
          placeholder="Event / titel"
          placeholderTextColor="#666"
          value={form.title}
          onChangeText={(v) => handleChange('title', v)}
          style={[gs.card, { marginBottom: 12, color: 'white' }]}
        />

        <TextInput
          placeholder="Placering"
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
                <Text style={{ color: form.category === c ? '#0E0F13' : 'white' }}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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

        {/* Dato/Tid */}
        <TouchableOpacity
          onPress={() => setShowDateModal(true)}
          style={[gs.card, { marginBottom: 12 }]}
        >
          <Text style={{ color: form.dateTime ? 'white' : '#666' }}>
            {form.dateTime || 'Vælg dato og tid'}
          </Text>
        </TouchableOpacity>

        <TextInput
          placeholder="By"
          placeholderTextColor="#666"
          value={form.city}
          onChangeText={(v) => handleChange('city', v)}
          style={[gs.card, { marginBottom: 12, color: 'white' }]}
        />
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

        <TouchableOpacity
          style={[gs.buttonPrimary, !canSubmit && { opacity: 0.5 }]}
          onPress={onSubmit}
          disabled={!canSubmit}
        >
          <Text style={gs.buttonTextDark}>Sæt til salg</Text>
        </TouchableOpacity>



<Modal visible={showDateModal} transparent animationType="slide">
  <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}>
    <View style={{ margin: 20, backgroundColor: '#222', padding: 20, borderRadius: 12 }}>

      <Text style={{ color: 'white', fontSize: 20, fontWeight: '600', marginBottom: 16, textAlign: 'center' }}>
        Vælg dato og tid
      </Text>

      {/* Måned + år navigation */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <TouchableOpacity onPress={() => setSelectedDate(prev => {
          const newMonth = prev.month === 1 ? 12 : prev.month - 1;
          const newYear = prev.month === 1 ? prev.year - 1 : prev.year;
          return { ...prev, month: newMonth, year: newYear };
        })}>
          <Text style={{ color: 'white', fontSize: 32 }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 18 }}>
          {selectedDate.month}/{selectedDate.year}
        </Text>
        <TouchableOpacity onPress={() => setSelectedDate(prev => {
          const newMonth = prev.month === 12 ? 1 : prev.month + 1;
          const newYear = prev.month === 12 ? prev.year + 1 : prev.year;
          return { ...prev, month: newMonth, year: newYear };
        })}>
          <Text style={{ color: 'white', fontSize: 32 }}>›</Text>
        </TouchableOpacity>
      </View>

      <FlatList
  data={getDaysInMonth(selectedDate.month, selectedDate.year)}
  keyExtractor={(item) => item.toDateString()}
  numColumns={7}
  renderItem={({ item }) => {
    const day = item.getDate();
    const isSelected = selectedDate.day === day;
    return (
      <TouchableOpacity
        onPress={() => setSelectedDate(prev => ({ ...prev, day }))}
        style={{
          width: 40,           // fast bredde
          aspectRatio: 1,      // kvadratisk
          margin: 2,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 6,
          backgroundColor: isSelected ? '#6EE7B7' : '#444',
        }}
      >
        <Text style={{ color: isSelected ? '#0E0F13' : 'white', fontWeight: isSelected ? '600' : '400' }}>
          {day}
        </Text>
      </TouchableOpacity>
    );
  }}
/>

      {/* Tid */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 16 }}>
        <TextInput
          keyboardType="numeric"
          placeholder="HH"
          placeholderTextColor="#666"
          value={String(selectedDate.hour).padStart(2, '0')}
          onChangeText={(v) => {
            const num = parseInt(v, 10);
            if (!isNaN(num)) {
              const hour = Math.max(0, Math.min(23, num));
              setSelectedDate(prev => ({ ...prev, hour }));
            } else if (v === '') {
              // Lad input stå tomt uden at ændre selectedDate.hour
              setSelectedDate(prev => ({ ...prev, hour: '' }));
            }
          }}
          style={{
            flex: 1,
            backgroundColor: '#333',
            color: 'white',
            textAlign: 'center',
            borderRadius: 6,
            paddingVertical: 10,
            marginRight: 8,
          }}
        />
        <TextInput
          keyboardType="numeric"
          placeholder="MM"
          placeholderTextColor="#666"
          value={String(selectedDate.minute).padStart(2, '0')}
          onChangeText={(v) => {
            const num = parseInt(v, 10);
            if (!isNaN(num)) {
              const minute = Math.max(0, Math.min(59, num));
              setSelectedDate(prev => ({ ...prev, minute }));
            } else if (v === '') {
              setSelectedDate(prev => ({ ...prev, minute: '' }));
            }
          }}
          style={{
            flex: 1,
            backgroundColor: '#333',
            color: 'white',
            textAlign: 'center',
            borderRadius: 6,
            paddingVertical: 10,
          }}
        />
      </View>

      {/* Gem / Annuller */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={saveDateTime} style={[gs.buttonPrimary, { flex: 1, marginRight: 8 }]}>
          <Text style={gs.buttonTextDark}>Gem</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowDateModal(false)} style={[gs.buttonPrimary, { flex: 1 }]}>
          <Text style={gs.buttonTextDark}>Annuller</Text>
        </TouchableOpacity>
      </View>

    </View>
  </View>
</Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
