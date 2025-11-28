import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import SearchStack from './src/navigation/SearchStack';
import SearchResultsScreen from './src/features/search/screens/SearchResultsScreen';
import SellTicket from './src/features/search/screens/SellTicket';
import LoginScreen from './src/features/search/screens/loginScreen';
import ProfileScreen from './src/features/search/screens/profileScreen';
import PartnerAuthScreen from './src/features/search/screens/PartnerAuthScreen';


import { auth } from './src/features/search/Firebase/database';
import { onAuthStateChanged } from 'firebase/auth';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 🔹 Dine tabs, som før
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#6EE7B7',
        tabBarInactiveTintColor: '#B3B3B3',
        tabBarStyle: {
          backgroundColor: '#0E0F13',
          borderTopWidth: 0,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Search') {
            iconName = 'search';
          } else if (route.name === 'Sell') {
            iconName = 'ticket';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {/* Home-tab: bruger SearchStack → starter i kategori-mode */}
      <Tab.Screen
        name="Home"
        component={SearchStack}
        initialParams={{ mode: 'home' }}
      />

      {/* Search-tab: også SearchStack → men i search-mode */}
      <Tab.Screen
        name="Search"
        component={SearchStack}
        initialParams={{ mode: 'search' }}
      />

      {/* Sell-tab: direkte skærm */}
      <Tab.Screen name="Sell" component={SellTicket} />

      {/* Profile-tab */}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}


// 🔹 Simpel stack til auth-flow (lige nu kun loginScreen)
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="PartnerAuth" component={PartnerAuthScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setInitializing(false);
    });

    return unsub;
  }, []);

  // Simpel loading mens vi finder ud af om der er en bruger
  if (initializing) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <View
            style={{
              flex: 1,
              backgroundColor: '#0E0F13',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size="large" color="#6EE7B7" />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          {/* Hvis der er en bruger -> vis tabs, ellers login */}
          {user ? <MainTabs /> : <AuthStack />}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
