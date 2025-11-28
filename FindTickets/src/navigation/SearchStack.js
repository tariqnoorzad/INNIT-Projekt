// src/navigation/SearchStack.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SearchCategoriesScreen from '../features/search/screens/SearchCategoriesScreen';
import SearchResultsScreen from '../features/search/screens/SearchResultsScreen';
import TicketDetailsScreen from '../features/search/screens/TicketDetailsScreen';
import SellTicket from '../features/search/screens/SellTicket';
import PartnersList from '../features/search/screens/PartnerList';
import PartnerDetail from '../features/search/screens/PartnerDetail';
import PartnerDashboard from '../features/search/screens/PartnerDashboard';
import PartnerTicketsScreen from '../features/search/screens/PartnerTicketsScreen';
import PartnerAuthScreen from '../features/search/screens/PartnerAuthScreen';

const Stack = createNativeStackNavigator();

export default function SearchStack({ route }) {
  // mode kommer fra Tabs via initialParams
  const mode = route?.params?.mode ?? 'home';

  // Bestem hvilken screen der skal være først
  const initialRouteName =
    mode === 'search' ? 'Search/Results' : 'Search/Categories';

  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
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
      <Stack.Screen name="SellTicket" component={SellTicket} />
      <Stack.Screen name="PartnersList" component={PartnersList} />
      <Stack.Screen name="PartnerDetail" component={PartnerDetail} />
      <Stack.Screen name="PartnerTickets" component={PartnerTicketsScreen} />
      <Stack.Screen name="PartnerDashboard" component={PartnerDashboard} />
      <Stack.Screen name="PartnerAuth" component={PartnerAuthScreen} options={{ title: 'Partner login' }} />
    </Stack.Navigator>
  );
}
