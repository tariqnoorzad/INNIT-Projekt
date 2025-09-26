import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';



// Din SearchStack
import SearchStack from './src/navigation/SearchStack';
import SearchCategoriesScreen from './src/features/search/screens/SearchResultsScreen';



const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: '#6EE7B7',
              tabBarInactiveTintColor: '#B8BDC7',
              tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
              tabBarStyle: {
                position: 'absolute',
                bottom: 10,
                left: 20,
                right: 20,
                backgroundColor: '#191B22',
                height: 60,
                paddingBottom: 40,
                paddingTop: 10,
                shadowColor: '#000',
                shadowOpacity: 0.15,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 10,
              },
            }}
          >
            <Tab.Screen
              name="Home"
              component={SearchStack}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="home-outline" size={size} color={color} />
                  
                ),
              }}
            />
            <Tab.Screen
              name="Quick Search"
              component={SearchCategoriesScreen}
              options={{
                title: 'Search',
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="magnify" size={size} color={color} />
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
