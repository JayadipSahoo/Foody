import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar, View, ActivityIndicator } from "react-native";
import useAuthStore from "../store/authStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Import screens
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import HomeScreen from "../screens/HomeScreen";

// Import vendor screens (to be created)
import VendorHomeScreen from "../screens/vendor/VendorHomeScreen";
import VendorOrdersScreen from "../screens/vendor/VendorOrdersScreen";
import VendorMenuScreen from "../screens/vendor/VendorMenuScreen";
import VendorPaymentScreen from "../screens/vendor/VendorPaymentScreen";
import VendorDashboardScreen from "../screens/vendor/VendorDashboardScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Vendor Tab Navigator Component
const VendorTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: "#4361ee",
                tabBarInactiveTintColor: "#adb5bd",
                tabBarStyle: {
                    backgroundColor: "#ffffff",
                    borderTopWidth: 1,
                    borderTopColor: "#f1f3f5",
                    height: 60,
                    paddingBottom: 10,
                    paddingTop: 5,
                },
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="VendorHome"
                component={VendorHomeScreen}
                options={{
                    tabBarLabel: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="home"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="VendorOrders"
                component={VendorOrdersScreen}
                options={{
                    tabBarLabel: "Orders",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="clipboard-list"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="VendorMenu"
                component={VendorMenuScreen}
                options={{
                    tabBarLabel: "Menu",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="food-variant"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="VendorPayment"
                component={VendorPaymentScreen}
                options={{
                    tabBarLabel: "Payment",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="cash"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="VendorDashboard"
                component={VendorDashboardScreen}
                options={{
                    tabBarLabel: "Dashboard",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="view-dashboard"
                            color={color}
                            size={size}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const AppNavigator = () => {
    const [isLoading, setIsLoading] = useState(true);
    const { isAuthenticated, init, userType } = useAuthStore();

    useEffect(() => {
        const initializeAuth = async () => {
            await init();
            setIsLoading(false);
        };

        initializeAuth();
    }, [init]);

    if (isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <ActivityIndicator size="large" color="#4361ee" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    // Auth screens
                    <Stack.Group>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Signup" component={SignupScreen} />
                    </Stack.Group>
                ) : (
                    // App screens based on user type
                    <Stack.Group>
                        {userType === "vendor" ? (
                            <Stack.Screen name="VendorTabs" component={VendorTabNavigator} />
                        ) : (
                            <Stack.Screen name="Home" component={HomeScreen} />
                        )}
                    </Stack.Group>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;