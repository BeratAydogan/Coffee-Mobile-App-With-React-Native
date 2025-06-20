import React from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Ionicons kullandım, sen istediğini kullanabilirsin

import HomeScreen from './pages/HomeScreen/HomeScreen';
import DetailScreen from './pages/DetailScreen/DetailScreen';
import CartScreen from './pages/CartScreen/CartScreen';  // Sepet ekranı
import OrderHistoryScreen from './pages/OrderHistoryScreen/OrderHistoryScreen';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: '#6f4e37',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
       <Stack.Screen
  name="Home"
  component={HomeScreen}
  options={({ navigation }) => ({
    title: '☕Sabit Kahve',
    headerTitleStyle: { fontWeight: 'bold', fontSize: 20 },
    headerStyle: {
      backgroundColor: '#6f4e37',  // burası header arka plan rengi

    },
    headerTitleAlign: 'center',
    headerTintColor: '#fff', 
    headerRight: () => (
      <TouchableOpacity
        style={{ marginRight: 15 }}
        onPress={() => navigation.navigate('CartScreen')}
      >
        <Icon name="shopping-cart" size={25} color="#fff" />
      </TouchableOpacity>
    ),
  })}
/>

        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={({ navigation }) => ({
            title: 'Detaylar',
            headerRight: () => (
              <TouchableOpacity
                style={{ marginRight: 15 }}
                onPress={() => navigation.navigate('CartScreen')}
              >
                <Icon name="shopping-cart" size={25} color="#6f4e37" />
              </TouchableOpacity>
            ),
          })}
        />
     <Stack.Screen
  name="CartScreen"
  component={CartScreen}
  options={({ navigation }) => ({
    title: 'Sepet',
    headerRight: () => (
      <TouchableOpacity
        style={{ marginRight: 15 }}
        onPress={() => navigation.navigate('OrderHistory')}
      >
        <Icon name="history" size={24} color="#6f4e37" />
      </TouchableOpacity>
    ),
  })}
/>
         <Stack.Screen 
        name="OrderHistory" 
        component={OrderHistoryScreen} 
        options={{ title: 'Geçmiş Siparişler' }}
      />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
