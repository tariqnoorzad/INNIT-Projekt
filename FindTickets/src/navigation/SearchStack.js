import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SearchCategoriesScreen from '../features/search/screens/SearchCategoriesScreen';
import SearchResultsScreen from '../features/search/screens/SearchResultsScreen';
import TicketDetailsScreen from '../features/search/screens/TicketDetailsScreen';
import SellTicket from '../features/search/screens/SellTicket';
import PartnersList from '../features/search/screens/PartnerList';
import PartnerDetail from '../features/search/screens/PartnerDetail';

// 👇 NYT: import login screen
import LoginScreen from '../features/search/screens/loginScreen';

const Stack = createNativeStackNavigator();

export default function SearchStack() {
  return (
    <Stack.Navigator initialRouteName="Login">
      {/* 🔐 Login / Opret bruger */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />

      {/* Resten af appen efter login */}
      <Stack.Screen
        name="Search/Categories"
        component={SearchCategoriesScreen}
        options={{ title: 'Event Now' }}
      />
      <Stack.Screen
        name="Search/Results"
        component={SearchResultsScreen}
        options={{ title: 'Find billetter' }}
      />
      <Stack.Screen
        name="Search/Details"
        component={TicketDetailsScreen}
        options={{ title: 'Detaljer' }}
      />
      <Stack.Screen
        name="SellTicket"
        component={SellTicket}
      />
      <Stack.Screen
        name="PartnersList"
        component={PartnersList}
      />
      <Stack.Screen
        name="PartnerDetail"
        component={PartnerDetail}
      />
    </Stack.Navigator>
  );
}
