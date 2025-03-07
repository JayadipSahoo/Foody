import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import RestaurantDetailsScreen from '../screens/RestaurantDetailsScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen 
                    name="Home" 
                    component={HomeScreen} 
                />
                <Stack.Screen 
                    name="RestaurantDetails" 
                    component={RestaurantDetailsScreen} 
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
} 