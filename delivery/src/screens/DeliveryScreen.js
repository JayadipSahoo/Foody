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
    Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as Location from "expo-location";
import { API_URL, THEME, APP_SETTINGS } from "../config/constants";
import { useUserStore } from "../store/userStore";
import LeafletMap from "../components/LeafletMap";
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
    
    const locationSubscription = useRef(null);

    // Order status steps
    const deliverySteps = [
        { id: "accepted", label: "Order Accepted", icon: "checkmark-circle" },
        { id: "picked_up", label: "Picked Up", icon: "restaurant" },
        { id: "on_the_way", label: "On The Way", icon: "bicycle" },
        { id: "delivered", label: "Delivered", icon: "home" },
    ];

    const [currentStep, setCurrentStep] = useState(0);

    // Start tracking location with highest accuracy
    const startLocationTracking = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            
            if (status !== "granted") {
                setErrorMsg("Permission to access location was denied");
                return;
            }

            // IIIT Bhubaneswar coordinates (for fallback only)
            const iiitLocation = {
                latitude: 20.29413,
                longitude: 85.74424,
                accuracy: 5
            };
            
            // First try to get device location
            try {
                const deviceLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Highest,
                    maximumAge: 0
                });
                
                console.log("Using actual device location:", deviceLocation.coords);
                
                // Use the actual device location
                const actualLocation = {
                    latitude: deviceLocation.coords.latitude,
                    longitude: deviceLocation.coords.longitude,
                    accuracy: deviceLocation.coords.accuracy || 5,
                    altitude: deviceLocation.coords.altitude,
                    speed: deviceLocation.coords.speed,
                    heading: deviceLocation.coords.heading,
                    timestamp: deviceLocation.timestamp
                };
                
                setLocation(actualLocation);
                updateDeliveryLocation(actualLocation);
                
                // Set up continuous location updates
                locationSubscription.current = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.Highest,
                        distanceInterval: 5, // Update every 5 meters
                        timeInterval: 10000 // Or every 10 seconds
                    },
                    newLocation => {
                        console.log("Location updated from device:", newLocation.coords);
                        const updatedLocation = {
                            latitude: newLocation.coords.latitude,
                            longitude: newLocation.coords.longitude,
                            accuracy: newLocation.coords.accuracy || 5,
                            altitude: newLocation.coords.altitude,
                            speed: newLocation.coords.speed,
                            heading: newLocation.coords.heading,
                            timestamp: newLocation.timestamp
                        };
                        setLocation(updatedLocation);
                        updateDeliveryLocation(updatedLocation);
                    }
                );
                
            } catch (error) {
                // If device location fails, use IIIT location as fallback
                console.error("Error getting device location, using fallback:", error);
                setLocation(iiitLocation);
                updateDeliveryLocation(iiitLocation);
                console.log("Using IIIT Bhubaneswar location as fallback");
            }
            
        } catch (error) {
            console.error("Error starting tracking:", error);
            setErrorMsg("Could not set location: " + error.message);
        }
    };
    
    // Calculate distance between two points in meters
    const calculateDistance = (coords1, coords2) => {
        if (!coords1 || !coords2) return 0;
        
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371e3; // Earth radius in meters
        
        const lat1 = toRad(coords1.latitude);
        const lat2 = toRad(coords2.latitude);
        const deltaLat = toRad(coords2.latitude - coords1.latitude);
        const deltaLon = toRad(coords2.longitude - coords1.longitude);
        
        const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return R * c; // Distance in meters
    };

    // Fetch order details
    const fetchOrderDetails = async () => {
        try {
            setIsLoading(true);
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
    }, []);

    // Show loading state
    if (isLoading || !order) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={THEME.colors.primary} />
                <Text style={styles.loadingText}>
                    {!location ? 'Getting your location...' : 'Loading order details...'}
                </Text>
                {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
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
                            Getting your location...
                        </Text>
                    </View>
                ) : (
                    <LeafletMap 
                        deliveryLocation={location}
                        style={styles.map}
                        onLocationUpdate={(updatedLocation) => {
                            // Handle location update from the map
                            console.log("Location updated:", updatedLocation);
                            setLocation(updatedLocation);
                            updateDeliveryLocation(updatedLocation);
                        }}
                    />
                )}
            </View>

            {/* Order Info */}
            <ScrollView style={styles.infoContainer}>
                <View style={styles.orderHeader}>
                    <Text style={styles.orderTitle}>
                        Order #{order.orderNumber || 'Loading...'}
                    </Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{order.status || 'Loading...'}</Text>
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
                                const phoneNumber = order.customer?.phoneNumber;
                                if (phoneNumber) {
                                    Linking.openURL(`tel:${phoneNumber}`);
                                } else {
                                    Alert.alert("No phone number available");
                                }
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
        padding: 20,
    },
    mapContainer: {
        height: "40%",
        position: "relative",
        borderBottomWidth: 1,
        borderBottomColor: THEME.colors.light,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        textAlign: 'center',
        color: THEME.colors.dark,
    },
    errorText: {
        fontSize: 16,
        color: THEME.colors.error,
        textAlign: 'center',
        marginVertical: 10,
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
});

export default DeliveryScreen;
