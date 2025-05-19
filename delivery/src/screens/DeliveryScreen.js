import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { API_URL, THEME, APP_SETTINGS } from "../config/constants";
import { useUserStore } from "../store/userStore";
import Constants from "expo-constants";

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === "expo";

const DeliveryScreen = ({ route, navigation }) => {
    const { orderId } = route.params;
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const { token } = useUserStore();
    const mapRef = useRef(null);
    const locationSubscription = useRef(null);

    // Order status steps
    const deliverySteps = [
        { id: "accepted", label: "Order Accepted", icon: "checkmark-circle" },
        { id: "picked_up", label: "Picked Up", icon: "restaurant" },
        { id: "on_the_way", label: "On The Way", icon: "bicycle" },
        { id: "delivered", label: "Delivered", icon: "home" },
    ];

    const [currentStep, setCurrentStep] = useState(0);

    // Fetch order details
    const fetchOrderDetails = async () => {
        try {
            const response = await axios.get(`${API_URL}/orders/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOrder(response.data);

            // Set current step based on order status
            const status = response.data.status.toLowerCase();
            if (status === "accepted") setCurrentStep(0);
            else if (status === "picked_up") setCurrentStep(1);
            else if (status === "on_the_way") setCurrentStep(2);
            else if (status === "delivered") setCurrentStep(3);
        } catch (error) {
            console.error("Error fetching order details:", error);
            Alert.alert(
                "Error",
                "Failed to load order details. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Update order status
    const updateOrderStatus = async (newStatus) => {
        try {
            setIsLoading(true);
            await axios.put(
                `${API_URL}/orders/delivery/status/${orderId}`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Update local order data
            fetchOrderDetails();

            Alert.alert("Success", `Order status updated to ${newStatus}`);
        } catch (error) {
            console.error("Error updating order status:", error);
            Alert.alert(
                "Error",
                "Failed to update order status. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Initialize location tracking
    const startLocationTracking = async () => {
        try {
            const { status } =
                await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                setErrorMsg("Permission to access location was denied");
                return;
            }

            // Get initial location
            const initialLocation = await Location.getCurrentPositionAsync({});
            setLocation(initialLocation.coords);

            // Set up location subscription
            locationSubscription.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 10, // min distance (meters) between updates
                    timeInterval: APP_SETTINGS.LOCATION_UPDATE_INTERVAL,
                },
                (newLocation) => {
                    setLocation(newLocation.coords);

                    // Also send location update to server
                    updateDeliveryLocation(newLocation.coords);
                }
            );
        } catch (error) {
            console.error("Error starting location tracking:", error);
            setErrorMsg("Could not track location");
        }
    };

    // Update delivery location on server
    const updateDeliveryLocation = async (coords) => {
        try {
            await axios.post(
                `${API_URL}/orders/delivery/location/${orderId}`,
                {
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error("Error updating delivery location:", error);
        }
    };

    // Handle step completion
    const handleCompleteStep = () => {
        if (currentStep < deliverySteps.length - 1) {
            const newStatus = deliverySteps[currentStep + 1].id.toUpperCase();
            updateOrderStatus(newStatus);
        } else {
            // If delivery is complete, navigate back to home
            Alert.alert(
                "Delivery Complete",
                "The order has been successfully delivered.",
                [
                    {
                        text: "OK",
                        onPress: () => navigation.navigate("Home"),
                    },
                ]
            );
        }
    };

    // Initial setup
    useEffect(() => {
        fetchOrderDetails();
        startLocationTracking();

        // Cleanup
        return () => {
            if (locationSubscription.current) {
                locationSubscription.current.remove();
            }
        };
    }, [orderId]);

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={THEME.colors.primary} />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.centered}>
                <Text>Order not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Map View */}
            <View style={styles.mapContainer}>
                {!location ? (
                    <View style={styles.centered}>
                        <ActivityIndicator
                            size="large"
                            color={THEME.colors.primary}
                        />
                        <Text style={styles.loadingText}>
                            Getting location...
                        </Text>
                    </View>
                ) : isExpoGo ? (
                    <View style={styles.mapFallback}>
                        <Ionicons
                            name="map-outline"
                            size={50}
                            color={THEME.colors.primary}
                        />
                        <Text style={styles.mapFallbackText}>
                            Map view is not available in Expo Go
                        </Text>
                        <Text style={styles.mapFallbackDetail}>
                            Current location: {"\n"}
                            Latitude: {location.latitude.toFixed(6)}
                            {"\n"}
                            Longitude: {location.longitude.toFixed(6)}
                        </Text>
                    </View>
                ) : (
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        initialRegion={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        }}
                    >
                        {/* Delivery Person Marker */}
                        <Marker
                            coordinate={{
                                latitude: location.latitude,
                                longitude: location.longitude,
                            }}
                            title="Your Location"
                        >
                            <View style={styles.deliveryMarker}>
                                <Ionicons
                                    name="bicycle"
                                    size={20}
                                    color="#fff"
                                />
                            </View>
                        </Marker>

                        {/* Restaurant Marker */}
                        {order.vendorLocation && (
                            <Marker
                                coordinate={{
                                    latitude: order.vendorLocation.latitude,
                                    longitude: order.vendorLocation.longitude,
                                }}
                                title={order.vendorName || "Restaurant"}
                            >
                                <View style={styles.restaurantMarker}>
                                    <Ionicons
                                        name="restaurant"
                                        size={20}
                                        color="#fff"
                                    />
                                </View>
                            </Marker>
                        )}

                        {/* Customer Marker */}
                        {order.deliveryAddress?.coordinates && (
                            <Marker
                                coordinate={{
                                    latitude:
                                        order.deliveryAddress.coordinates
                                            .latitude,
                                    longitude:
                                        order.deliveryAddress.coordinates
                                            .longitude,
                                }}
                                title="Delivery Location"
                            >
                                <View style={styles.customerMarker}>
                                    <Ionicons
                                        name="home"
                                        size={20}
                                        color="#fff"
                                    />
                                </View>
                            </Marker>
                        )}
                    </MapView>
                )}
            </View>

            {/* Order Info */}
            <ScrollView style={styles.infoContainer}>
                <View style={styles.orderHeader}>
                    <Text style={styles.orderTitle}>
                        Order #{order.orderNumber}
                    </Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{order.status}</Text>
                    </View>
                </View>

                {/* Order Details Summary */}
                <View style={styles.orderSummary}>
                    <View style={styles.summaryItem}>
                        <Ionicons
                            name="person"
                            size={18}
                            color={THEME.colors.primary}
                        />
                        <Text style={styles.summaryText}>
                            {order.customer?.name || "Customer"}
                        </Text>
                    </View>

                    <View style={styles.summaryItem}>
                        <Ionicons
                            name="call"
                            size={18}
                            color={THEME.colors.primary}
                        />
                        <Text style={styles.summaryText}>
                            {order.customer?.phoneNumber || "No phone"}
                        </Text>
                        <TouchableOpacity
                            style={styles.callButton}
                            onPress={() => {
                                // Handle call action
                            }}
                        >
                            <Text style={styles.callButtonText}>Call</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.summaryItem}>
                        <Ionicons
                            name="location"
                            size={18}
                            color={THEME.colors.primary}
                        />
                        <Text style={styles.summaryText} numberOfLines={2}>
                            {order.deliveryAddress?.formattedAddress ||
                                "No address"}
                        </Text>
                    </View>
                </View>

                {/* Progress Steps */}
                <View style={styles.progressContainer}>
                    {deliverySteps.map((step, index) => (
                        <View
                            key={step.id}
                            style={[
                                styles.progressStep,
                                index <= currentStep ? styles.activeStep : {},
                            ]}
                        >
                            <View style={styles.stepIconContainer}>
                                <Ionicons
                                    name={step.icon}
                                    size={24}
                                    color={
                                        index <= currentStep
                                            ? "#fff"
                                            : THEME.colors.dark
                                    }
                                />
                            </View>
                            <Text
                                style={[
                                    styles.stepLabel,
                                    index <= currentStep
                                        ? styles.activeStepLabel
                                        : {},
                                ]}
                            >
                                {step.label}
                            </Text>
                            {index < deliverySteps.length - 1 && (
                                <View
                                    style={[
                                        styles.progressLine,
                                        index < currentStep
                                            ? styles.activeProgressLine
                                            : {},
                                    ]}
                                />
                            )}
                        </View>
                    ))}
                </View>

                {/* Action Button */}
                {currentStep < deliverySteps.length - 1 && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleCompleteStep}
                    >
                        <Text style={styles.actionButtonText}>
                            {currentStep === 0
                                ? "Pick Up Order"
                                : currentStep === 1
                                ? "Start Delivery"
                                : "Complete Delivery"}
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    mapContainer: {
        height: "40%",
        position: "relative",
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    mapActions: {
        position: "absolute",
        bottom: THEME.spacing.md,
        right: THEME.spacing.md,
    },
    mapButton: {
        backgroundColor: THEME.colors.white,
        padding: THEME.spacing.sm,
        borderRadius: 30,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    deliveryMarker: {
        backgroundColor: THEME.colors.secondary,
        padding: THEME.spacing.sm,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "#fff",
    },
    restaurantMarker: {
        backgroundColor: THEME.colors.primary,
        padding: THEME.spacing.sm,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "#fff",
    },
    customerMarker: {
        backgroundColor: THEME.colors.info,
        padding: THEME.spacing.sm,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "#fff",
    },
    infoContainer: {
        height: "60%",
        padding: THEME.spacing.md,
    },
    orderHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: THEME.spacing.md,
    },
    orderTitle: {
        fontSize: THEME.fontSizes.xlarge,
        fontWeight: "bold",
        color: THEME.colors.dark,
    },
    statusBadge: {
        backgroundColor: THEME.colors.primary,
        paddingHorizontal: THEME.spacing.md,
        paddingVertical: THEME.spacing.xs,
        borderRadius: 20,
    },
    statusText: {
        color: THEME.colors.white,
        fontWeight: "bold",
        fontSize: THEME.fontSizes.small,
    },
    orderSummary: {
        backgroundColor: THEME.colors.white,
        borderRadius: THEME.borderRadius.medium,
        padding: THEME.spacing.md,
        marginBottom: THEME.spacing.md,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    summaryItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: THEME.spacing.sm,
    },
    summaryText: {
        marginLeft: THEME.spacing.sm,
        color: THEME.colors.dark,
        flex: 1,
    },
    callButton: {
        backgroundColor: THEME.colors.primary,
        paddingHorizontal: THEME.spacing.md,
        paddingVertical: THEME.spacing.xs,
        borderRadius: THEME.borderRadius.small,
    },
    callButtonText: {
        color: THEME.colors.white,
        fontWeight: "bold",
    },
    progressContainer: {
        marginBottom: THEME.spacing.lg,
    },
    progressStep: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: THEME.spacing.md,
    },
    stepIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: THEME.colors.light,
        justifyContent: "center",
        alignItems: "center",
        marginRight: THEME.spacing.sm,
    },
    activeStep: {
        color: THEME.colors.primary,
    },
    activeStepLabel: {
        color: THEME.colors.primary,
        fontWeight: "bold",
    },
    stepLabel: {
        fontSize: THEME.fontSizes.medium,
        color: THEME.colors.dark,
    },
    progressLine: {
        position: "absolute",
        left: 20,
        top: 40,
        width: 2,
        height: 30,
        backgroundColor: THEME.colors.light,
        zIndex: -1,
    },
    activeProgressLine: {
        backgroundColor: THEME.colors.secondary,
    },
    actionButton: {
        backgroundColor: THEME.colors.secondary,
        padding: THEME.spacing.md,
        borderRadius: THEME.borderRadius.small,
        alignItems: "center",
        marginBottom: THEME.spacing.lg,
    },
    actionButtonText: {
        color: THEME.colors.white,
        fontWeight: "bold",
        fontSize: THEME.fontSizes.large,
    },
    mapFallback: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        padding: 20,
    },
    mapFallbackText: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 10,
        color: THEME.colors.primary,
    },
    mapFallbackDetail: {
        marginTop: 15,
        fontSize: 14,
        textAlign: "center",
        lineHeight: 22,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
    },
});

export default DeliveryScreen;
