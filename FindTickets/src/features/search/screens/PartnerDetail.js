import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gs } from '../../../styles/globalstyle';

export default function PartnerDetail({ route, navigation }) {
  const partner = route.params?.partner;
  if (!partner) return null;

  return (
    <SafeAreaView style={gs.screen} edges={['top','bottom']}>
      <View style={{ padding: 16 }}>
        <View style={[gs.card, { marginBottom: 16 }]}>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: '700' }}>
            {partner.name}
          </Text>
          <Text style={[gs.muted, { marginTop: 8 }]}>{partner.desc}</Text>
        </View>

        {/* CTA knapper */}
        <View style={[gs.rowBetween, { marginTop: 16 }]}>
          <TouchableOpacity
            style={[gs.buttonPrimary, { flex: 1, marginRight: 8 }]}
            onPress={() => alert('Her kunne vi vise billetter for partneren')}
          >
            <Text style={gs.buttonTextDark}>Se billetter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[gs.card, { flex: 1, alignItems: 'center', padding: 12 }]}
          >
            <Text style={{ color: 'white' }}>Følg partner</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
