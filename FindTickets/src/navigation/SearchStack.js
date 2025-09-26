// Denne fil definerer en "stack navigator" for søgedelen af appen.
// Stacken styrer navigationen mellem de forskellige skærme i Search-modulet:
// 1) SearchCategoriesScreen  -> Indgangsside med kategorier (Find, Sælg, Partnere)
// 2) SearchResultsScreen     -> Viser en liste med billetter (søgning/filtrering)
// 3) TicketDetailsScreen     -> Detaljeret visning af en valgt billet

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SearchCategoriesScreen from '../features/search/screens/SearchCategoriesScreen';
import SearchResultsScreen from '../features/search/screens/SearchResultsScreen';
import TicketDetailsScreen from '../features/search/screens/TicketDetailsScreen';
import SellTicket from '../features/search/screens/SellTicket';
import PartnersList from '../features/search/screens/PartnerList';
import PartnerDetail from '../features/search/screens/PartnerDetail';



// Opretter en stack navigator
// Stack-instansen holder styr på navigationen
const Stack = createNativeStackNavigator();

// SearchStack-komponenten definerer de forskellige skærme i stacken, altså selve komponenten, der definerer SearchStack
export default function SearchStack() {
  return (
    // Stack.Navigator fungerer som en "container" for de tre skærme
    <Stack.Navigator>
      <Stack.Screen name="Search/Categories" component={SearchCategoriesScreen} options={{ title: 'Event Now' }} />
      <Stack.Screen name="Search/Results" component={SearchResultsScreen} options={{ title: 'Find billetter' }} />
      <Stack.Screen name="Search/Details" component={TicketDetailsScreen} options={{ title: 'Detaljer' }} />
      <Stack.Screen name="SellTicket" component={SellTicket} />
      <Stack.Screen name="PartnersList" component={PartnersList} />
      <Stack.Screen name="PartnerDetail" component={PartnerDetail} />
    </Stack.Navigator>
  );
}
