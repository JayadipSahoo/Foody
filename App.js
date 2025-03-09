import React from 'react';
import { CartProvider } from './src/context/CartContext';
import { PreferencesProvider } from './src/context/PreferencesContext';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import CustomDrawer from './src/components/CustomDrawer';
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import SignInScreen from './src/screens/SignInScreen';
import HomeScreen from './src/screens/HomeScreen';
import RestaurantDetailsScreen from './src/screens/RestaurantDetailsScreen';
import CartScreen from './src/screens/CartScreen';
import OrdersScreen from './src/screens/OrdersScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function MainDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: '#FFA726',
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#2B2B2B',
        drawerLabelStyle: {
          marginLeft: -20,
          fontSize: 16,
        },
      }}
    >
      <Drawer.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          drawerIcon: ({color}) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Orders" 
        component={OrdersScreen}
        options={{
          drawerIcon: ({color}) => (
            <Ionicons name="receipt-outline" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          drawerIcon: ({color}) => (
            <Ionicons name="cart-outline" size={24} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <PreferencesProvider>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="Main" component={MainDrawer} />
            <Stack.Screen name="RestaurantDetails" component={RestaurantDetailsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </PreferencesProvider>
  );
}