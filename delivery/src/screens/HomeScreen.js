import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { API_URL, THEME, APP_SETTINGS } from "../config/config";
import useUserStore from "../store/userStore";

const HomeScreen = ({ navigation }) => {
    const [availableOrders, setAvailableOrders] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { user, token } = useUserStore();
    const [activeTab, setActiveTab] = useState("available");

    // Fetch orders
    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${API_URL}/orders/delivery`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const { availableOrders, assignedOrders } = response.data;

            setAvailableOrders(availableOrders || []);
            setMyOrders(assignedOrders || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
            Alert.alert("Error", "Failed to load orders. Please try again.");
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    // Accept an order
    const handleAcceptOrder = async (orderId) => {
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

            // Refresh orders list
            fetchOrders();

            Alert.alert("Success", "Order accepted successfully!");
        } catch (error) {
            console.error("Error accepting order:", error);
            Alert.alert("Error", "Failed to accept order. Please try again.");
            setIsLoading(false);
        }
    };

    // Refresh control handler
    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    // Initial load
    useEffect(() => {
        fetchOrders();

        // Set up a periodic refresh
        const interval = setInterval(() => {
            fetchOrders();
        }, APP_SETTINGS.ORDER_REFRESH_INTERVAL);

        return () => clearInterval(interval);
    }, []);

    // Navigation options
    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    style={{ marginRight: 15 }}
                    onPress={() => navigation.navigate("Profile")}
                >
                    <Ionicons
                        name="person-circle-outline"
                        size={24}
                        color="#fff"
                    />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    // Render an order item
    const renderOrderItem = ({ item }) => {
        const isAssigned = activeTab === "myOrders";

        return (
            <TouchableOpacity
                style={styles.orderCard}
                onPress={() =>
                    navigation.navigate("OrderDetails", {
                        orderId: item._id,
                        isAssigned,
                    })
                }
            >
                <View style={styles.orderHeader}>
                    <Text style={styles.orderNumber}>
                        Order #{item.orderNumber}
                    </Text>
                    <Text style={styles.orderStatus}>{item.status}</Text>
                </View>

                <View style={styles.orderInfo}>
                    <Ionicons
                        name="location"
                        size={18}
                        color={THEME.colors.primary}
                    />
                    <Text style={styles.orderText} numberOfLines={2}>
                        {item.deliveryAddress?.formattedAddress ||
                            "No address provided"}
                    </Text>
                </View>

                <View style={styles.orderInfo}>
                    <Ionicons
                        name="restaurant"
                        size={18}
                        color={THEME.colors.primary}
                    />
                    <Text style={styles.orderText}>
                        {item.vendorName || "Restaurant"}
                    </Text>
                </View>

                <View style={styles.orderFooter}>
                    <Text style={styles.orderPrice}>
                        ${item.totalAmount?.toFixed(2)}
                    </Text>
                    {!isAssigned && (
                        <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={() => handleAcceptOrder(item._id)}
                        >
                            <Text style={styles.acceptButtonText}>Accept</Text>
                        </TouchableOpacity>
                    )}
                    {isAssigned && (
                        <TouchableOpacity
                            style={styles.startButton}
                            onPress={() =>
                                navigation.navigate("Delivery", {
                                    orderId: item._id,
                                })
                            }
                        >
                            <Text style={styles.startButtonText}>
                                Start Delivery
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    // Render the list of orders
    const renderOrdersList = () => {
        const data = activeTab === "available" ? availableOrders : myOrders;

        if (isLoading) {
            return (
                <View style={styles.centered}>
                    <ActivityIndicator
                        size="large"
                        color={THEME.colors.primary}
                    />
                </View>
            );
        }

        if (data.length === 0) {
            return (
                <View style={styles.centered}>
                    <Ionicons
                        name={activeTab === "available" ? "search" : "bicycle"}
                        size={64}
                        color={THEME.colors.dark}
                        style={{ opacity: 0.3 }}
                    />
                    <Text style={styles.noOrdersText}>
                        {activeTab === "available"
                            ? "No orders available at the moment"
                            : "You have no active orders"}
                    </Text>
                    <TouchableOpacity
                        onPress={onRefresh}
                        style={styles.refreshButton}
                    >
                        <Text style={styles.refreshButtonText}>Refresh</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <FlatList
                data={data}
                renderItem={renderOrderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[THEME.colors.primary]}
                    />
                }
            />
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === "available" && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab("available")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "available" && styles.activeTabText,
                        ]}
                    >
                        Available Orders
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === "myOrders" && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab("myOrders")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "myOrders" && styles.activeTabText,
                        ]}
                    >
                        My Orders{" "}
                        {myOrders.length > 0 && `(${myOrders.length})`}
                    </Text>
                </TouchableOpacity>
            </View>

            {renderOrdersList()}
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
        padding: THEME.spacing.lg,
    },
    tabs: {
        flexDirection: "row",
        backgroundColor: THEME.colors.white,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tabButton: {
        flex: 1,
        paddingVertical: THEME.spacing.md,
        alignItems: "center",
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: THEME.colors.primary,
    },
    tabText: {
        color: THEME.colors.dark,
        fontWeight: "500",
    },
    activeTabText: {
        color: THEME.colors.primary,
        fontWeight: "bold",
    },
    listContent: {
        padding: THEME.spacing.md,
    },
    orderCard: {
        backgroundColor: THEME.colors.white,
        borderRadius: THEME.borderRadius.medium,
        padding: THEME.spacing.md,
        marginBottom: THEME.spacing.md,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    orderHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: THEME.spacing.sm,
    },
    orderNumber: {
        fontWeight: "bold",
        fontSize: THEME.fontSizes.medium,
        color: THEME.colors.dark,
    },
    orderStatus: {
        color: THEME.colors.primary,
        fontWeight: "500",
        fontSize: THEME.fontSizes.small,
    },
    orderInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: THEME.spacing.sm,
    },
    orderText: {
        marginLeft: THEME.spacing.sm,
        color: THEME.colors.dark,
        flex: 1,
    },
    orderFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: THEME.spacing.sm,
        paddingTop: THEME.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: THEME.colors.light,
    },
    orderPrice: {
        fontWeight: "bold",
        fontSize: THEME.fontSizes.large,
        color: THEME.colors.dark,
    },
    acceptButton: {
        backgroundColor: THEME.colors.primary,
        paddingHorizontal: THEME.spacing.md,
        paddingVertical: THEME.spacing.sm,
        borderRadius: THEME.borderRadius.small,
    },
    acceptButtonText: {
        color: THEME.colors.white,
        fontWeight: "bold",
    },
    startButton: {
        backgroundColor: THEME.colors.secondary,
        paddingHorizontal: THEME.spacing.md,
        paddingVertical: THEME.spacing.sm,
        borderRadius: THEME.borderRadius.small,
    },
    startButtonText: {
        color: THEME.colors.white,
        fontWeight: "bold",
    },
    noOrdersText: {
        marginTop: THEME.spacing.md,
        color: THEME.colors.dark,
        opacity: 0.5,
        fontSize: THEME.fontSizes.large,
        textAlign: "center",
    },
    refreshButton: {
        marginTop: THEME.spacing.lg,
        backgroundColor: THEME.colors.primary,
        paddingHorizontal: THEME.spacing.lg,
        paddingVertical: THEME.spacing.sm,
        borderRadius: THEME.borderRadius.small,
    },
    refreshButtonText: {
        color: THEME.colors.white,
        fontWeight: "500",
    },
});

export default HomeScreen;
