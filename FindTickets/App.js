import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Hvis du IKKE bruger Expo, brug: import Ionicons from 'react-native-vector-icons/Ionicons';

import SearchStack from './src/navigation/SearchStack';
import SearchCategoriesScreen from './src/features/search/screens/SearchCategoriesScreen'; // tjek sti

const Tab = createBottomTabNavigator();


export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarActiveTintColor: '#6EE7B7', // Spotify grøn
              tabBarInactiveTintColor: '#B3B3B3', // grå
              tabBarStyle: {
                backgroundColor: '#0E0F13', // Spotify mørk baggrund
                borderTopWidth: 0,
                
              },
              tabBarIcon: ({ color, size }) => {
                let iconName;

                if (route.name === 'Home') {
                  iconName = 'home';
                } else if (route.name === 'Search') {
                  iconName = 'search'; // skiftet fra map til search
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
            })}
          >
            {/* Første tab: hele search-flow (stack) */}
            <Tab.Screen name="Home" component={SearchStack} />

            {/* Anden tab: direkte søge screen */}
            <Tab.Screen
              name="Search"
              component={SearchCategoriesScreen}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}