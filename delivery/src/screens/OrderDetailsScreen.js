import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { API_URL, THEME } from "../config/config";
import useUserStore from "../store/userStore";

const OrderDetailsScreen = ({ route, navigation }) => {
    const { orderId, isAssigned } = route.params;
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useUserStore();

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

    // Accept order
    const handleAcceptOrder = async () => {
        try {
            setIsLoading(true);
            await axios.post(
                `${API_URL}/orders/delivery/accept/${orderId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            Alert.alert("Success", "Order accepted successfully!", [
                {
                    text: "OK",
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error) {
            console.error("Error accepting order:", error);
            Alert.alert("Error", "Failed to accept order. Please try again.");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
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
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.orderId}>
                        Order #{order.orderNumber}
                    </Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{order.status}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Customer</Text>
                    <View style={styles.infoRow}>
                        <Ionicons
                            name="person"
                            size={18}
                            color={THEME.colors.primary}
                        />
                        <Text style={styles.infoText}>
                            {order.customer?.name || "Customer"}
                        </Text>
                    </View>
                    {order.customer?.phoneNumber && (
                        <View style={styles.infoRow}>
                            <Ionicons
                                name="call"
                                size={18}
                                color={THEME.colors.primary}
                            />
                            <Text style={styles.infoText}>
                                {order.customer.phoneNumber}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Address</Text>
                    <View style={styles.infoRow}>
                        <Ionicons
                            name="location"
                            size={18}
                            color={THEME.colors.primary}
                        />
                        <Text style={styles.infoText}>
                            {order.deliveryAddress?.formattedAddress ||
                                "Address not available"}
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Restaurant</Text>
                    <View style={styles.infoRow}>
                        <Ionicons
                            name="restaurant"
                            size={18}
                            color={THEME.colors.primary}
                        />
                        <Text style={styles.infoText}>
                            {order.vendorName || "Restaurant"}
                        </Text>
                    </View>
                    {order.vendorAddress && (
                        <View style={styles.infoRow}>
                            <Ionicons
                                name="business"
                                size={18}
                                color={THEME.colors.primary}
                            />
                            <Text style={styles.infoText}>
                                {order.vendorAddress}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Items</Text>
                    {order.items &&
                        order.items.map((item, index) => (
                            <View key={index} style={styles.orderItem}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemQuantity}>
                                        {item.quantity}x
                                    </Text>
                                    <Text style={styles.itemName}>
                                        {item.name}
                                    </Text>
                                </View>
                                <Text style={styles.itemPrice}>
                                    ${(item.price * item.quantity).toFixed(2)}
                                </Text>
                            </View>
                        ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>
                            ${order.subtotal?.toFixed(2) || "0.00"}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Delivery Fee</Text>
                        <Text style={styles.summaryValue}>
                            ${order.deliveryFee?.toFixed(2) || "0.00"}
                        </Text>
                    </View>
                    {order.tax > 0 && (
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tax</Text>
                            <Text style={styles.summaryValue}>
                                ${order.tax?.toFixed(2) || "0.00"}
                            </Text>
                        </View>
                    )}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>
                            ${order.totalAmount?.toFixed(2) || "0.00"}
                        </Text>
                    </View>
                    <View style={styles.paymentMethod}>
                        <Ionicons
                            name="card"
                            size={18}
                            color={THEME.colors.primary}
                        />
                        <Text style={styles.paymentMethodText}>
                            {order.paymentMethod || "Cash on Delivery"}
                        </Text>
                    </View>
                </View>

                <View style={styles.actions}>
                    {!isAssigned ? (
                        <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={handleAcceptOrder}
                        >
                            <Text style={styles.buttonText}>Accept Order</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.deliveryButton}
                            onPress={() =>
                                navigation.navigate("Delivery", {
                                    orderId: order._id,
                                })
                            }
                        >
                            <Text style={styles.buttonText}>
                                Start Delivery
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
        padding: THEME.spacing.md,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        backgroundColor: THEME.colors.white,
        borderRadius: THEME.borderRadius.medium,
        padding: THEME.spacing.md,
        marginBottom: THEME.spacing.lg,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: THEME.spacing.md,
        paddingBottom: THEME.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: THEME.colors.light,
    },
    orderId: {
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
    section: {
        marginBottom: THEME.spacing.lg,
    },
    sectionTitle: {
        fontSize: THEME.fontSizes.large,
        fontWeight: "bold",
        color: THEME.colors.dark,
        marginBottom: THEME.spacing.sm,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: THEME.spacing.sm,
    },
    infoText: {
        marginLeft: THEME.spacing.sm,
        color: THEME.colors.dark,
        fontSize: THEME.fontSizes.medium,
    },
    orderItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: THEME.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: THEME.colors.light,
    },
    itemInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    itemQuantity: {
        fontWeight: "bold",
        marginRight: THEME.spacing.sm,
        color: THEME.colors.primary,
    },
    itemName: {
        fontSize: THEME.fontSizes.medium,
        color: THEME.colors.dark,
    },
    itemPrice: {
        fontWeight: "bold",
        color: THEME.colors.dark,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: THEME.spacing.sm,
    },
    summaryLabel: {
        color: THEME.colors.dark,
    },
    summaryValue: {
        color: THEME.colors.dark,
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: THEME.spacing.sm,
        paddingTop: THEME.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: THEME.colors.light,
    },
    totalLabel: {
        fontSize: THEME.fontSizes.large,
        fontWeight: "bold",
        color: THEME.colors.dark,
    },
    totalValue: {
        fontSize: THEME.fontSizes.large,
        fontWeight: "bold",
        color: THEME.colors.primary,
    },
    paymentMethod: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: THEME.spacing.md,
    },
    paymentMethodText: {
        marginLeft: THEME.spacing.sm,
        color: THEME.colors.dark,
    },
    actions: {
        marginTop: THEME.spacing.md,
    },
    acceptButton: {
        backgroundColor: THEME.colors.primary,
        padding: THEME.spacing.md,
        borderRadius: THEME.borderRadius.small,
        alignItems: "center",
    },
    deliveryButton: {
        backgroundColor: THEME.colors.secondary,
        padding: THEME.spacing.md,
        borderRadius: THEME.borderRadius.small,
        alignItems: "center",
    },
    buttonText: {
        color: THEME.colors.white,
        fontWeight: "bold",
        fontSize: THEME.fontSizes.large,
    },
});

export default OrderDetailsScreen;
