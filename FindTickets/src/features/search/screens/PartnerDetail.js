import React from 'react';
import { View, Text, TouchableOpacity, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gs } from '../../../styles/globalstyle';

export default function PartnerDetail({ route, navigation }) {
  const partner = route.params?.partner;
  if (!partner) return null;

  const openWebsite = () => {
    if (partner.url) {
      Linking.openURL(partner.url);
    } else {
      alert('Der er ingen hjemmeside tilknyttet denne partner.');
    }
  };

  return (
    <SafeAreaView style={gs.screen} edges={['top', 'bottom']}>
      <View style={{ padding: 16 }}>
        {/* Partnerbillede */}
        <Image
          source={partner.image}
          style={{
            width: '100%',
            height: 200,
            borderRadius: 16,
            marginBottom: 16,
          }}
          resizeMode="cover"
        />

        {/* Partnerbeskrivelse */}
        <View style={[gs.card, { marginBottom: 16 }]}>
          <Text style={{ color: 'white', fontSize: 22, fontWeight: '700' }}>
            {partner.name}
          </Text>
          <Text style={[gs.muted, { marginTop: 8 }]}>{partner.desc}</Text>
        </View>

        {/* CTA-knapper */}
        <View style={{ gap: 12 }}>
          {/* BYTTET: Fuld-bredde = SE BILLETTER */}
          <TouchableOpacity
            style={[gs.buttonPrimary]}
            onPress={() =>
              navigation.navigate('PartnerTickets', {
                partnerId: partner.partnerId || partner.id,
                partnerName: partner.name,
                partner,
              })
            }
          >
            <Text style={gs.buttonTextDark}>Se billetter</Text>
          </TouchableOpacity>

          {/* Række med to knapper: venstre = SE HJEMMESIDE, højre = FØLG PARTNER (lys grå) */}
          <View style={gs.rowBetween}>
            <TouchableOpacity
              style={[gs.buttonPrimary, { flex: 1, marginRight: 8 }]}
              onPress={openWebsite}
            >
              <Text style={gs.buttonTextDark}>Se hjemmeside</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                gs.card,
                {
                  flex: 1,
                  alignItems: 'center',
                  padding: 12,
                  backgroundColor: '#262d3cff', // lysere grå end standard card
                  borderRadius: 12,
                },
              ]}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Følg partner</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
