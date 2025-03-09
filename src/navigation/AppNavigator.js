import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import SignInScreen from '../screens/SignInScreen';
import HomeScreen from '../screens/HomeScreen';
import RestaurantDetailsScreen from '../screens/RestaurantDetailsScreen';
import CartScreen from '../screens/CartScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen 
                    name="Splash" 
                    component={SplashScreen} 
                />
                <Stack.Screen 
                    name="Welcome" 
                    component={WelcomeScreen} 
                />
                <Stack.Screen 
                    name="SignIn" 
                    component={SignInScreen} 
                />
                <Stack.Screen 
                    name="Home" 
                    component={HomeScreen} 
                />
                <Stack.Screen 
                    name="RestaurantDetails" 
                    component={RestaurantDetailsScreen} 
                />
                <Stack.Screen 
                    name="Cart" 
                    component={CartScreen} 
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
} 