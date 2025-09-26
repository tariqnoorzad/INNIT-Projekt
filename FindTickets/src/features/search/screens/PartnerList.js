import React from 'react';
import { FlatList, Text, ImageBackground, View, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gs } from '../../../styles/globalstyle';
import { PARTNERS } from '../data/partners';

const { width } = Dimensions.get('window');

export default function PartnersList({ navigation }) {
const renderItem = ({ item }) => (
  <Pressable
    onPress={() => navigation.navigate('PartnerDetail', { partner: item })}
    style={{ marginBottom: 4 }} // næsten ingen luft
  >
    <ImageBackground
      source={{ uri: item.image }}
      style={{
        width: width - 32,
        height: 180, // samme højde som før
        justifyContent: 'flex-end',
        borderRadius: 16,
        overflow: 'hidden',
      }}
      imageStyle={{ borderRadius: 16 }}
    >
      <View
        style={{
          backgroundColor: 'rgba(0,0,0,0.55)',
          padding: 12,
        }}
      >
        <Text style={{ color: 'white', fontSize: 20, fontWeight: '700' }}>
          {item.name}
        </Text>
        <Text style={{ color: '#ddd', fontSize: 14, marginTop: 4 }} numberOfLines={2}>
          {item.desc}
        </Text>
      </View>
    </ImageBackground>
  </Pressable>
);

  return (
    <SafeAreaView style={gs.screen} edges={['top', 'bottom']}>
      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        data={PARTNERS}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}
