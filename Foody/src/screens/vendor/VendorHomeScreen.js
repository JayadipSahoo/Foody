import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Alert,
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import useAuthStore from "../../store/authStore";

const VendorHomeScreen = () => {
    const { user, logout } = useAuthStore();
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [deliveryRadius, setDeliveryRadius] = useState(3000); // 3km in meters

    // Default location (can be replaced with the vendor's saved location)
    const defaultLocation = {
        latitude: 28.6139,
        longitude: 77.2090,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setErrorMsg("Permission to access location was denied");
                return;
            }

            try {
                // Get the current location
                let location = await Location.getCurrentPositionAsync({});
                setLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                });
            } catch (error) {
                setErrorMsg("Could not fetch location");
                console.log(error);
            }
        })();
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            Alert.alert(
                "Logout Failed",
                "Failed to log out. Please try again."
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Meshi - Vendor</Text>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.welcomeCard}>
                    <Text style={styles.welcomeText}>
                        Welcome, {user?.name || "Vendor"}!
                    </Text>
                    <Text style={styles.welcomeDescription}>
                        Manage your restaurant, view orders, and track deliveries all in one place.
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Your Location</Text>
                    {errorMsg ? (
                        <Text style={styles.errorText}>{errorMsg}</Text>
                    ) : (
                        <View style={styles.mapContainer}>
                            <MapView
                                style={styles.map}
                                initialRegion={location || defaultLocation}
                                region={location || defaultLocation}
                            >
                                {location && (
                                    <>
                                        <Marker
                                            coordinate={{
                                                latitude: location.latitude,
                                                longitude: location.longitude,
                                            }}
                                            title={user?.businessName || "Your Restaurant"}
                                            description="Your current location"
                                        >
                                            <MaterialCommunityIcons
                                                name="store"
                                                size={36}
                                                color="#4361ee"
                                            />
                                        </Marker>
                                        <Circle
                                            center={{
                                                latitude: location.latitude,
                                                longitude: location.longitude,
                                            }}
                                            radius={deliveryRadius}
                                            fillColor="rgba(67, 97, 238, 0.2)"
                                            strokeColor="rgba(67, 97, 238, 0.5)"
                                        />
                                    </>
                                )}
                            </MapView>
                            <View style={styles.mapOverlay}>
                                <Text style={styles.mapLabel}>
                                    Delivery Radius: {deliveryRadius / 1000} km
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Business Status</Text>
                    <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>Current Status:</Text>
                        <Text
                            style={[
                                styles.statusValue,
                                user?.isAcceptingOrders
                                    ? styles.statusActive
                                    : styles.statusInactive,
                            ]}
                        >
                            {user?.isAcceptingOrders
                                ? "Active & Accepting Orders"
                                : "Inactive - Not Accepting Orders"}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.statusButton,
                            user?.isAcceptingOrders
                                ? styles.stopButton
                                : styles.startButton,
                        ]}
                    >
                        <Text style={styles.statusButtonText}>
                            {user?.isAcceptingOrders
                                ? "Stop Accepting Orders"
                                : "Start Accepting Orders"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, styles.statCardPrimary]}>
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Pending Orders</Text>
                    </View>
                    <View style={[styles.statCard, styles.statCardSecondary]}>
                        <Text style={styles.statValue}>₹8,459</Text>
                        <Text style={styles.statLabel}>Today's Sales</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#4361ee",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
    },
    logoutButton: {
        backgroundColor: "#fff",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    logoutText: {
        color: "#4361ee",
        fontWeight: "600",
    },
    content: {
        flex: 1,
        padding: 20,
    },
    welcomeCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    welcomeDescription: {
        fontSize: 16,
        color: "#666",
        lineHeight: 22,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15,
    },
    mapContainer: {
        height: 300,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 10,
    },
    map: {
        width: "100%",
        height: "100%",
    },
    mapOverlay: {
        position: "absolute",
        bottom: 10,
        left: 10,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    mapLabel: {
        color: "#333",
        fontWeight: "600",
    },
    errorText: {
        color: "#e63946",
        textAlign: "center",
        marginVertical: 10,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    statusLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#555",
        marginRight: 10,
    },
    statusValue: {
        fontSize: 16,
        fontWeight: "bold",
    },
    statusActive: {
        color: "#2ecc71",
    },
    statusInactive: {
        color: "#e74c3c",
    },
    statusButton: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    startButton: {
        backgroundColor: "#2ecc71",
    },
    stopButton: {
        backgroundColor: "#e74c3c",
    },
    statusButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    statCard: {
        width: "48%",
        padding: 20,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statCardPrimary: {
        backgroundColor: "#4361ee",
    },
    statCardSecondary: {
        backgroundColor: "#3a0ca3",
    },
    statValue: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 14,
        color: "#fff",
        opacity: 0.9,
    },
});

export default VendorHomeScreen;