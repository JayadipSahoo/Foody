import React from 'react';
import { CartProvider } from './src/context/CartContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <CartProvider>
      <AppNavigator />
    </CartProvider>
  );
}