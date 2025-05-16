import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Screens
import LoginScreen from "../screens/LoginScreen";
import SignupRequestScreen from "../screens/SignupRequestScreen";
import HomeScreen from "../screens/HomeScreen";
import OrderDetailsScreen from "../screens/OrderDetailsScreen";
import DeliveryScreen from "../screens/DeliveryScreen";
import ProfileScreen from "../screens/ProfileScreen";

// Store
import { useUserStore } from "../store/userStore";

const Stack = createStackNavigator();

// Main Navigator
const AppNavigator = () => {
    const [isLoading, setIsLoading] = useState(true);
    const { user, initUserData } = useUserStore();

    useEffect(() => {
        // Initialize user data from AsyncStorage
        const loadUserData = async () => {
            try {
                await initUserData();
                console.log(
                    "Auth state:",
                    user ? "User is logged in" : "No user logged in"
                );
            } catch (error) {
                console.error("Error loading user data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, []);

    if (isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#fff",
                }}
            >
                <ActivityIndicator size="large" color="#FF6B6B" />
                <Text style={{ marginTop: 10 }}>Loading...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {user ? (
                    // Main App Screens (Protected)
                    <Stack.Screen
                        name="Main"
                        component={MainStack}
                        options={{ headerShown: false }}
                    />
                ) : (
                    // Auth Screens
                    <Stack.Screen
                        name="Auth"
                        component={AuthStack}
                        options={{ headerShown: false }}
                    />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

// Auth Stack (Login, Signup)
const AuthStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen
                name="SignupRequest"
                component={SignupRequestScreen}
            />
        </Stack.Navigator>
    );
};

// Main App Stack (Protected routes)
const MainStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: "#FF6B6B",
                },
                headerTintColor: "#fff",
                headerTitleStyle: {
                    fontWeight: "bold",
                },
            }}
        >
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: "Delivery Dashboard" }}
            />
            <Stack.Screen
                name="OrderDetails"
                component={OrderDetailsScreen}
                options={{ title: "Order Details" }}
            />
            <Stack.Screen
                name="Delivery"
                component={DeliveryScreen}
                options={{ title: "Delivery Progress" }}
            />
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: "Profile" }}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;
