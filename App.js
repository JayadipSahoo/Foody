import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { CartProvider } from './src/services/CartContext';
import Routes from './src/routes';
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <NavigationContainer>
      <CartProvider>
        <Routes />
        <Toast />
      </CartProvider>
    </NavigationContainer>
  );
}