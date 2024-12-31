import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CustomTabBar from '../components/CustomTabBar';

const Tab = createBottomTabNavigator();

export default function BottomTabs({ navigation }) {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} parentNavigation={navigation} />}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ headerShown: false }} />
            <Tab.Screen name="CartPlaceholder" options={{ tabBarButton: () => null }}>
                {() => null}
            </Tab.Screen>
            <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        </Tab.Navigator>
    );
}
