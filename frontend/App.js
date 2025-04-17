import React, { useEffect } from 'react';
import { CartProvider } from './src/context/CartContext';
import { PreferencesProvider } from './src/context/PreferencesContext';
import AppNavigator from './src/navigators/AppNavigator';
import useUserStore from './src/store/userStore';

// Initialize the user store as early as possible
const InitUserStore = () => {
    const { initUserData } = useUserStore();
    
    useEffect(() => {
        initUserData();
    }, []);
    
    return null;
};

export default function App() {
    console.log('App component rendering');
    return (
        <PreferencesProvider>
            <CartProvider>
                <InitUserStore />
                <AppNavigator />
            </CartProvider>
        </PreferencesProvider>
    );
}
