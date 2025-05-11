import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Screens
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import OrderDetailsScreen from "../screens/OrderDetailsScreen";
import DeliveryScreen from "../screens/DeliveryScreen";
import ProfileScreen from "../screens/ProfileScreen";

// Store
import useUserStore from "../store/userStore";

const Stack = createStackNavigator();

const AppNavigator = () => {
    const [isLoading, setIsLoading] = useState(true);
    const { user, setUser } = useUserStore();

    useEffect(() => {
        // Check if user is already logged in
        const checkUserSession = async () => {
            try {
                const userData = await AsyncStorage.getItem("user");
                const token = await AsyncStorage.getItem("token");

                if (userData && token) {
                    setUser(JSON.parse(userData));
                }
            } catch (error) {
                console.error("Error checking user session:", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkUserSession();
    }, []);

    if (isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: "#FFA500",
                    },
                    headerTintColor: "#fff",
                    headerTitleStyle: {
                        fontWeight: "bold",
                    },
                }}
            >
                {user ? (
                    <>
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
                    </>
                ) : (
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
