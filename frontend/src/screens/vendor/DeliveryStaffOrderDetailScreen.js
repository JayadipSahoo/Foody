import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const THEME_COLOR = "#FF9F6A";

const DeliveryStaffOrderDetailScreen = ({ route, navigation }) => {
    const { order } = route.params;
    if (!order)
        return (
            <View style={styles.centered}>
                <Text>No order data.</Text>
            </View>
        );

    const orderDate = new Date(order.createdAt);
    const formattedDate = orderDate.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    });

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "pending":
                return "#FF6B6B";
            case "accepted":
                return "#4361EE";
            case "preparing":
                return "#6C63FF";
            case "ready":
                return "#4CAF50";
            case "out_for_delivery":
                return "#FF9F6A";
            case "picked_up":
                return "#FF9F6A";
            case "on_the_way":
                return "#FF9F6A";
            case "delivered":
                return "#009688";
            case "cancelled":
                return "#DC3545";
            default:
                return "#6C757D";
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialCommunityIcons
                        name="arrow-left"
                        size={24}
                        color="#333"
                    />
                </TouchableOpacity>
                <Text style={styles.title}>Order Details</Text>
                <View style={{ width: 40 }} />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <Text style={styles.orderNumber}>
                        Order #{order._id.slice(-6)}
                    </Text>
                    <Text
                        style={[
                            styles.status,
                            { color: getStatusColor(order.status) },
                        ]}
                    >
                        Status: {order.status.replace(/_/g, " ")}
                    </Text>
                    <Text style={styles.label}>
                        Placed on:{" "}
                        <Text style={styles.value}>{formattedDate}</Text>
                    </Text>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Customer</Text>
                        <View style={styles.infoRow}>
                            <Ionicons
                                name="person-outline"
                                size={18}
                                color="#6C757D"
                            />
                            <Text style={styles.infoText}>
                                {order.customerId?.name || "Customer"}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons
                                name="call-outline"
                                size={18}
                                color="#6C757D"
                            />
                            <Text style={styles.infoText}>
                                {order.customerId?.mobile || "N/A"}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons
                                name="mail-outline"
                                size={18}
                                color="#6C757D"
                            />
                            <Text style={styles.infoText}>
                                {order.customerId?.email || "N/A"}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Order Items</Text>
                        {order.items.map((item, idx) => (
                            <View key={idx} style={styles.itemRow}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <View style={styles.itemDetails}>
                                    <Text style={styles.itemQuantity}>
                                        x{item.quantity}
                                    </Text>
                                    <Text style={styles.itemPrice}>
                                        ₹
                                        {(item.price * item.quantity).toFixed(
                                            2
                                        )}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Payment</Text>
                        <View style={styles.infoRow}>
                            <Ionicons
                                name="card-outline"
                                size={18}
                                color="#6C757D"
                            />
                            <Text style={styles.infoText}>
                                Method: {order.paymentMethod}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons
                                name="checkmark-circle-outline"
                                size={18}
                                color="#6C757D"
                            />
                            <Text style={styles.infoText}>
                                Status: {order.paymentStatus}
                            </Text>
                        </View>
                    </View>
                    {order.deliveryAddress && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                Delivery Address
                            </Text>
                            <Text style={styles.deliveryAddressText}>
                                {order.deliveryAddress}
                            </Text>
                        </View>
                    )}
                    <View style={styles.totalSection}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalAmount}>
                            ₹{order.totalAmount.toFixed(2)}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8F9FA" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    backButton: { padding: 8 },
    title: { fontSize: 20, fontWeight: "bold", color: "#333" },
    scrollContent: { padding: 20 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    orderNumber: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#212529",
        marginBottom: 6,
    },
    status: { fontSize: 15, fontWeight: "bold", marginBottom: 8 },
    label: { fontSize: 14, color: "#6C757D", marginBottom: 8 },
    value: { color: "#212529", fontWeight: "bold" },
    section: { marginTop: 18, marginBottom: 8 },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#212529",
        marginBottom: 8,
    },
    infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
    infoText: { fontSize: 14, color: "#6C757D", marginLeft: 8 },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    itemName: { fontSize: 14, color: "#212529", flex: 1 },
    itemDetails: { flexDirection: "row", alignItems: "center" },
    itemQuantity: { fontSize: 14, color: "#6C757D", marginRight: 8 },
    itemPrice: { fontSize: 14, fontWeight: "bold", color: "#212529" },
    totalSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#E9ECEF",
        marginTop: 10,
    },
    deliveryAddressText: {
        fontSize: 14,
        color: "#6C757D",
        lineHeight: 20,
    },
    totalLabel: { fontSize: 16, fontWeight: "bold", color: "#212529" },
    totalAmount: { fontSize: 20, fontWeight: "bold", color: THEME_COLOR },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default DeliveryStaffOrderDetailScreen;
