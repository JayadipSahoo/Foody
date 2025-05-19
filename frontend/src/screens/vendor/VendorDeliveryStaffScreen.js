import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    RefreshControl,
    StatusBar,
    Modal,
    TextInput,
    Clipboard,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useVendorStore } from "../../store/vendorStore";
import useAuthStore from "../../store/authStore";
import axios from "axios";
import { API_URL } from "../../config/constants";
import { useFocusEffect } from "@react-navigation/native";
import { customerAPI } from "../../services/apiService";

const THEME_COLOR = "#FF9F6A";

const VendorDeliveryStaffScreen = ({ navigation }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [deliveryStaff, setDeliveryStaff] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderDetailsMap, setOrderDetailsMap] = useState({});

    // Get vendor data from store
    const { vendorData, isLoading: vendorLoading } = useVendorStore();
    const { token } = useAuthStore();

    // Fetch delivery staff
    const fetchDeliveryStaff = useCallback(async () => {
        if (!vendorData || !vendorData._id || !token) {
            setIsLoading(false);
            setError(
                "Vendor information not available. Please try again later."
            );
            setIsRefreshing(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        // Set a timeout to prevent indefinite loading
        const timeoutId = setTimeout(() => {
            setIsLoading(false);
            setIsRefreshing(false);
            setError(
                "Request timed out. Please check your connection and try again."
            );
        }, 15000); // 15 seconds timeout

        try {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            };

            const response = await axios.get(
                `${API_URL}/delivery/vendor/${vendorData._id}`,
                config
            );

            clearTimeout(timeoutId); // Clear the timeout on success
            setDeliveryStaff(response.data);
        } catch (err) {
            clearTimeout(timeoutId); // Clear the timeout on error
            setError(
                err.response && err.response.data.message
                    ? err.response.data.message
                    : err.message
            );
        } finally {
            clearTimeout(timeoutId); // Ensure timeout is cleared
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [vendorData, token]);

    // Update delivery staff status
    const updateDeliveryStaffStatus = useCallback(
        async (id, status) => {
            if (!token) return;

            try {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                };

                await axios.patch(
                    `${API_URL}/delivery/${id}/status`,
                    { status },
                    config
                );

                // Refresh the staff list
                fetchDeliveryStaff();

                Alert.alert(
                    "Success",
                    `Delivery staff ${
                        status === "active" ? "activated" : "deactivated"
                    } successfully.`
                );
            } catch (err) {
                Alert.alert(
                    "Error",
                    err.response && err.response.data.message
                        ? err.response.data.message
                        : "Failed to update status."
                );
            }
        },
        [token, fetchDeliveryStaff]
    );

    // Handle refresh
    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchDeliveryStaff();
    }, [fetchDeliveryStaff]);

    // Load delivery staff when screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchDeliveryStaff();
        }, [fetchDeliveryStaff])
    );

    // Fetch order details for all staff with assigned orders
    useEffect(() => {
        const fetchOrders = async () => {
            // With the new API returning populated assignedOrders, we don't need
            // to fetch orders separately anymore. The code below is kept for
            // backwards compatibility if the API hasn't been updated yet
            const newMap = {};
            await Promise.all(
                deliveryStaff.map(async (staff) => {
                    if (
                        staff.assignedOrders &&
                        staff.assignedOrders.length > 0
                    ) {
                        // Check if the order objects are already populated
                        if (
                            staff.assignedOrders[0]._id &&
                            typeof staff.assignedOrders[0] === "object"
                        ) {
                            // The orders are already populated, use them directly
                            newMap[staff._id] = staff.assignedOrders;
                        } else {
                            try {
                                // Use a more direct approach to fetch all orders at once
                                // This will make a single API request instead of one per order
                                const config = {
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${token}`,
                                    },
                                };

                                // Get vendor ID
                                const vendorId = vendorData?._id;

                                // Get orders for this vendor - we'll filter them by delivery staff ID later
                                const response = await axios.get(
                                    `${API_URL}/orders/vendor/${vendorId}`,
                                    config
                                );

                                // Filter orders that are assigned to this delivery staff
                                const staffOrders = response.data.filter(
                                    (order) =>
                                        order.deliveryStaffId === staff._id
                                );

                                newMap[staff._id] = staffOrders;
                            } catch (e) {
                                console.error("Error fetching orders:", e);
                                // If there's an error, set an empty array to prevent further errors
                                newMap[staff._id] = [];
                            }
                        }
                    }
                })
            );
            setOrderDetailsMap(newMap);
        };
        if (deliveryStaff.length > 0) fetchOrders();
    }, [deliveryStaff, token, vendorData]);

    // Render delivery staff item
    const renderDeliveryStaffItem = ({ item }) => {
        // If orders are already populated in the item, use them directly
        let orders = [];

        // Check if assignedOrders are populated objects
        if (
            item.assignedOrders &&
            item.assignedOrders.length > 0 &&
            typeof item.assignedOrders[0] === "object" &&
            item.assignedOrders[0]._id
        ) {
            orders = item.assignedOrders;
        } else {
            // Otherwise use the orders from the map
            orders = orderDetailsMap[item._id] || [];
        }

        return (
            <View style={styles.staffItem}>
                <View style={styles.staffInfo}>
                    <Text style={styles.staffName}>{item.name}</Text>
                    <Text style={styles.staffEmail}>{item.email}</Text>
                    <Text style={styles.staffMobile}>{item.mobile}</Text>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: 4,
                        }}
                    >
                        <Text style={styles.codeLabel}>Code: </Text>
                        <Text style={styles.codeValue}>{item.vendorCode}</Text>
                        <TouchableOpacity
                            onPress={() => {
                                Clipboard.setString(item.vendorCode);
                                Alert.alert(
                                    "Copied",
                                    "Code copied to clipboard"
                                );
                            }}
                        >
                            <MaterialCommunityIcons
                                name="content-copy"
                                size={18}
                                color="#888"
                                style={{ marginLeft: 6 }}
                            />
                        </TouchableOpacity>
                    </View>
                    <View
                        style={[
                            styles.statusBadge,
                            {
                                backgroundColor:
                                    item.status === "active"
                                        ? "#4CAF50"
                                        : item.status === "pending"
                                        ? "#FFC107"
                                        : "#F44336",
                            },
                        ]}
                    >
                        <Text style={styles.statusText}>
                            {item.status.toUpperCase()}
                        </Text>
                    </View>

                    {/* Show assigned orders if exist */}
                    {orders.length > 0 ? (
                        <View style={styles.assignedOrdersContainer}>
                            <Text style={styles.assignedOrdersTitle}>
                                Assigned Orders ({orders.length})
                            </Text>
                            {orders.map((order, index) => (
                                <TouchableOpacity
                                    key={order._id || index}
                                    style={styles.currentOrderCard}
                                    onPress={() =>
                                        navigation.navigate(
                                            "DeliveryStaffOrderDetail",
                                            { order }
                                        )
                                    }
                                >
                                    <Text style={styles.currentOrderNumber}>
                                        Order #
                                        {order._id
                                            ? order._id.slice(-6)
                                            : "unknown"}
                                    </Text>
                                    <Text>
                                        Status:{" "}
                                        <Text
                                            style={{
                                                color: "#FF9F6A",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            {order.status}
                                        </Text>
                                    </Text>
                                    <Text>
                                        Customer:{" "}
                                        {order.customerId?.name || "N/A"}
                                    </Text>
                                    <Text
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        Items:{" "}
                                        {order.items &&
                                            order.items
                                                .map(
                                                    (i) =>
                                                        i.name +
                                                        " x" +
                                                        i.quantity
                                                )
                                                .join(", ")}
                                    </Text>
                                    <Text>
                                        Total: ₹
                                        {order.totalAmount
                                            ? order.totalAmount.toFixed(2)
                                            : "0.00"}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : item.assignedOrders &&
                      item.assignedOrders.length > 0 ? (
                        <View style={styles.assignedOrdersContainer}>
                            <Text style={styles.assignedOrdersTitle}>
                                Assigned Orders ({item.assignedOrders.length})
                            </Text>
                            <Text style={styles.loadingText}>
                                Loading order details...
                            </Text>
                        </View>
                    ) : null}
                </View>
                <View style={styles.actionsContainer}>
                    {item.status === "pending" && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.approveButton]}
                            onPress={() =>
                                updateDeliveryStaffStatus(item._id, "active")
                            }
                        >
                            <MaterialCommunityIcons
                                name="check"
                                size={18}
                                color="#fff"
                            />
                            <Text style={styles.actionButtonText}>Approve</Text>
                        </TouchableOpacity>
                    )}
                    {item.status === "active" && (
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                styles.deactivateButton,
                            ]}
                            onPress={() =>
                                updateDeliveryStaffStatus(item._id, "inactive")
                            }
                        >
                            <MaterialCommunityIcons
                                name="close"
                                size={18}
                                color="#fff"
                            />
                            <Text style={styles.actionButtonText}>
                                Deactivate
                            </Text>
                        </TouchableOpacity>
                    )}
                    {item.status === "inactive" && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.approveButton]}
                            onPress={() =>
                                updateDeliveryStaffStatus(item._id, "active")
                            }
                        >
                            <MaterialCommunityIcons
                                name="refresh"
                                size={18}
                                color="#fff"
                            />
                            <Text style={styles.actionButtonText}>
                                Activate
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <>
            <StatusBar backgroundColor={THEME_COLOR} barStyle="light-content" />
            <SafeAreaView style={styles.safeArea}>
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
                        <Text style={styles.title}>Delivery Staff</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    {isLoading && !isRefreshing ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator
                                size="large"
                                color={THEME_COLOR}
                            />
                            <Text style={styles.loadingText}>
                                Loading delivery staff information...
                            </Text>
                        </View>
                    ) : error ? (
                        <View style={styles.errorContainer}>
                            <MaterialCommunityIcons
                                name="alert-circle-outline"
                                size={60}
                                color="#F44336"
                            />
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity
                                style={styles.refreshButton}
                                onPress={fetchDeliveryStaff}
                            >
                                <Text style={styles.refreshButtonText}>
                                    Try Again
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <View style={styles.contentContainer}>
                                <Text style={styles.sectionTitle}>
                                    {deliveryStaff.length > 0
                                        ? "Your Delivery Staff"
                                        : "No Delivery Staff Yet"}
                                </Text>

                                {deliveryStaff.length === 0 && (
                                    <View style={styles.emptyContainer}>
                                        <MaterialCommunityIcons
                                            name="account-group"
                                            size={80}
                                            color="#ddd"
                                        />
                                        <Text style={styles.emptyText}>
                                            You don't have any delivery staff
                                            yet
                                        </Text>
                                        <Text style={styles.emptySubText}>
                                            Generate a vendor code and share it
                                            with your delivery staff to register
                                        </Text>
                                    </View>
                                )}

                                <FlatList
                                    data={deliveryStaff}
                                    keyExtractor={(item) => item._id}
                                    renderItem={renderDeliveryStaffItem}
                                    contentContainerStyle={styles.listContainer}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={isRefreshing}
                                            onRefresh={onRefresh}
                                            colors={[THEME_COLOR]}
                                        />
                                    }
                                />
                            </View>
                        </>
                    )}
                </View>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        paddingVertical: 15,
        paddingHorizontal: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    backButton: {
        padding: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    contentContainer: {
        flex: 1,
        padding: 15,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: "#555",
        textAlign: "center",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
        margin: 15,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    errorText: {
        fontSize: 16,
        color: "#555",
        textAlign: "center",
        marginBottom: 20,
        marginTop: 10,
    },
    refreshButton: {
        backgroundColor: THEME_COLOR,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    refreshButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#333",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 30,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginTop: 15,
        textAlign: "center",
    },
    emptySubText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginTop: 8,
    },
    listContainer: {
        paddingBottom: 20,
    },
    staffItem: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    staffInfo: {
        marginBottom: 10,
    },
    staffName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    staffEmail: {
        fontSize: 14,
        color: "#666",
        marginTop: 2,
    },
    staffMobile: {
        fontSize: 14,
        color: "#666",
        marginTop: 2,
    },
    statusBadge: {
        alignSelf: "flex-start",
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        marginTop: 8,
    },
    statusText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 12,
    },
    actionsContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 5,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        marginLeft: 8,
    },
    approveButton: {
        backgroundColor: "#4CAF50",
    },
    deactivateButton: {
        backgroundColor: "#F44336",
    },
    actionButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 12,
        marginLeft: 4,
    },
    codeLabel: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
    },
    codeValue: {
        fontSize: 14,
        color: "#666",
        marginLeft: 8,
    },
    currentOrderCard: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 6,
        marginVertical: 5,
        borderLeftWidth: 3,
        borderLeftColor: "#FF9F6A",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
    },
    currentOrderTitle: {
        fontWeight: "bold",
        fontSize: 15,
        color: "#212529",
        marginBottom: 2,
    },
    currentOrderNumber: {
        fontWeight: "bold",
        color: "#6C63FF",
        marginBottom: 2,
    },
    assignedOrdersContainer: {
        marginTop: 10,
    },
    assignedOrdersTitle: {
        fontWeight: "bold",
        fontSize: 15,
        color: "#333",
        marginBottom: 5,
    },
    loadingText: {
        fontSize: 14,
        color: "#666",
        fontStyle: "italic",
        textAlign: "center",
        marginVertical: 10,
    },
});

export default VendorDeliveryStaffScreen;
