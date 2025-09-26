// Dette er roden til hele React Native / Expo-applikationen.
import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import SearchStack from './src/navigation/SearchStack'; //  Vores  navigation-stack, som indeholder skærmene til søgedelen.


// App-komponenten er roden til hele applikationen.
// Den bruger GestureHandlerRootView til at håndtere gestus, SafeAreaProvider for at sikre korrekt visning på forskellige enheder,
// og NavigationContainer for at håndtere navigationen mellem skærmene.
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <SearchStack />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
