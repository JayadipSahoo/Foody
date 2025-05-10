import React, { useEffect, useMemo } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar, View, ActivityIndicator, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import useAuthStore from "../store/authStore";
import CheckoutScreen from '../screens/CheckoutScreen';

// Define our theme color
const THEME_COLOR = '#fda535'; // Updated theme color

// Authentication screens
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import SplashScreen from "../screens/SplashScreen";

// Main app screens
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import RestaurantDetailsScreen from "../screens/RestaurantDetailsScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import CartScreen from "../screens/CartScreen"; // Will need to create this file

// Vendor screens
import VendorDashboardScreen from '../screens/vendor/VendorDashboardScreen';
import VendorOrdersScreen from '../screens/vendor/VendorOrdersScreen';
import VendorMenuScreen from '../screens/vendor/VendorMenuScreen';
import VendorScheduleScreen from '../screens/vendor/VendorScheduleScreen';
import VendorMenuScheduleScreen from '../screens/vendor/VendorMenuScheduleScreen';
import VendorScheduleDetailScreen from '../screens/vendor/VendorScheduleDetailScreen';
import EditMenuItem from '../screens/vendor/EditMenuItem';

// Create navigation components
const Stack = createNativeStackNavigator(); // For screen-to-screen navigation
const Tab = createBottomTabNavigator(); // For tab-based navigation at the bottom

// Customer Tab Navigator
const CustomerTab = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Cart') {
                        iconName = focused ? 'cart' : 'cart-outline';
                    } else if (route.name === 'Notifications') {
                        iconName = focused ? 'notifications' : 'notifications-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: THEME_COLOR,
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 5
                },
            })}
        >
            <Tab.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{ 
                    headerShown: false
                }}
            />
            <Tab.Screen 
                name="Cart" 
                component={CartScreen} 
                options={{ 
                    headerShown: false
                }}
            />
            <Tab.Screen 
                name="Notifications" 
                component={NotificationsScreen} 
                options={{ 
                    headerShown: false
                }}
            />
            <Tab.Screen 
                name="Profile" 
                component={ProfileScreen} 
                options={{ 
                    headerShown: false
                }}
            />
        </Tab.Navigator>
    );
};

// Vendor Tab Navigator
function VendorTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    // Choose the icon based on which tab is selected
                    let iconName;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'Orders') {
                        iconName = focused ? 'list' : 'list-outline';
                    } else if (route.name === 'Menu') {
                        iconName = focused ? 'restaurant' : 'restaurant-outline';
                    } else if (route.name === 'Menu Scheduler') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: THEME_COLOR, // Updated theme color
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}
        >
            <Tab.Screen 
                name="Dashboard" 
                component={VendorDashboardScreen} 
                options={{ headerShown: false }}
            />
            <Tab.Screen 
                name="Orders" 
                component={VendorOrdersScreen} 
                options={{ headerShown: false }}
            />
            <Tab.Screen 
                name="Menu" 
                component={VendorMenuScreen} 
                options={{ headerShown: false }}
            />
            <Tab.Screen 
                name="Schedule" 
                component={VendorScheduleScreen} 
                options={{ headerShown: false }}
            />
            <Tab.Screen 
                name="Profile" 
                component={ProfileScreen} 
                options={{ headerShown: false }}
            />
        </Tab.Navigator>
    );
}

// Vendor Stack Navigation - Handles navigating between vendor screens
const VendorStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="VendorTabs"
                component={VendorTabNavigator}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="VendorScheduleScreen"
                component={VendorScheduleScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="VendorMenuScreen"
                component={VendorMenuScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="VendorOrdersScreen"
                component={VendorOrdersScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="MenuSchedulerScreen"
                component={VendorMenuScheduleScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="VendorScheduleDetailScreen"
                component={VendorScheduleDetailScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="EditMenuItem"
                component={EditMenuItem}
                options={{ 
                    headerShown: false
                }}
            />
        </Stack.Navigator>
    );
};

// Customer Stack Navigation - Handles navigating between customer screens
const CustomerStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="CustomerTabs"
                component={CustomerTab}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="RestaurantDetails"
                component={RestaurantDetailsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Checkout"
                component={CheckoutScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

// Main App Navigator - Controls which screens to show based on authentication status
const AppNavigator = () => {
    // Get authentication state from the store
    const { isAuthenticated, userType, init, isInitialized } = useAuthStore();

    // Check if user is logged in when app starts
    useEffect(() => {
        init();
    }, []);

    // Build the right screens based on auth status and user type
    const screenContent = useMemo(() => {
        // Show loading screen while checking authentication
        if (!isInitialized) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={THEME_COLOR} />
                </View>
            );
        }

        // Create two separate navigators based on authentication state
        if (isAuthenticated) {
            // Authenticated navigator
            return (
                <Stack.Navigator initialRouteName="Main">
                    <Stack.Screen 
                        name="Main" 
                        component={userType === 'vendor' ? VendorStack : CustomerStack}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                        name="RestaurantDetails" 
                        component={RestaurantDetailsScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                        name="Notifications" 
                        component={NotificationsScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                        name="Profile" 
                        component={ProfileScreen}
                        options={{ headerShown: false }}
                    />
                </Stack.Navigator>
            );
        } else {
            // Unauthenticated navigator
            return (
                <Stack.Navigator initialRouteName="Splash">
                    <Stack.Screen 
                        name="Splash" 
                        component={SplashScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                        name="Welcome" 
                        component={WelcomeScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                        name="Login" 
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                        name="Signup" 
                        component={SignupScreen}
                        options={{ headerShown: false }}
                    />
                </Stack.Navigator>
            );
        }
    }, [isAuthenticated, userType, isInitialized]);

    return (
        <NavigationContainer>
            <StatusBar backgroundColor={THEME_COLOR} barStyle="light-content" />
            {screenContent}
        </NavigationContainer>
    );
};

// Styles for components
const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AppNavigator;