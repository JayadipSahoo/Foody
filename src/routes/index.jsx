// navigation/Routes.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import SignIn from '../screens/SignIn';
import SignUp from '../screens/SignUp';
import BottomTabs from '../components/BottomTab';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import MapScreen from '../screens/MapScreen';
import ForgotPassword from '../screens/ForgotPassword';

const Stack = createStackNavigator();

function Routes() {
    return (
        <Stack.Navigator initialRouteName="Splash">
            <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SignIn" component={SignIn} options={{ headerShown: false }} />
            <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
            <Stack.Screen name="BottomTabs" component={BottomTabs} options={{ headerShown: false }} />
            <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MapScreen" component={MapScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}

export default Routes;
