import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    ScrollView,
    Modal,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { customerAPI } from '../services/apiService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THEME_COLOR = '#fda535';

// Order Details Modal Component
const OrderDetailsModal = ({ visible, order, onClose }) => {
    const insets = useSafeAreaInsets();
    
    if (!order) return null;

    const orderDate = new Date(order.createdAt);
    const formattedDate = orderDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return '#fda535';
            case 'accepted':
                return '#4361EE';
            case 'preparing':
                return '#6C63FF';
            case 'ready':
                return '#4CAF50';
            case 'delivered':
                return '#009688';
            case 'cancelled':
                return '#DC3545';
            default:
                return '#6C757D';
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { paddingBottom: insets.bottom }]}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Order Details</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        {/* Order Status */}
                        <View style={styles.statusSection}>
                            <Text style={styles.sectionTitle}>Order Status</Text>
                            <View style={[
                                styles.statusDisplay,
                                { backgroundColor: `${getStatusColor(order.status)}15` }
                            ]}>
                                <Text style={[
                                    styles.statusText,
                                    { color: getStatusColor(order.status) }
                                ]}>
                                    {order.status}
                                </Text>
                            </View>
                        </View>

                        {/* Vendor Information */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Vendor Information</Text>
                            <View style={styles.infoRow}>
                                <Ionicons name="business-outline" size={20} color="#6C757D" />
                                <Text style={styles.infoText}>{order.vendorId?.businessName || 'Vendor'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons name="call-outline" size={20} color="#6C757D" />
                                <Text style={styles.infoText}>{order.vendorId?.contactNumber || 'N/A'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons name="mail-outline" size={20} color="#6C757D" />
                                <Text style={styles.infoText}>{order.vendorId?.email || 'N/A'}</Text>
                            </View>
                        </View>

                        {/* Order Information */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Order Information</Text>
                            <View style={styles.infoRow}>
                                <Ionicons name="receipt-outline" size={20} color="#6C757D" />
                                <Text style={styles.infoText}>Order # {order._id}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons name="time-outline" size={20} color="#6C757D" />
                                <Text style={styles.infoText}>{formattedDate}</Text>
                            </View>
                        </View>

                        {/* Items */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Order Items</Text>
                            {order.items.map((item, index) => (
                                <View key={index} style={styles.itemRow}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <View style={styles.itemDetails}>
                                        <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                                        <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Payment Information */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Payment Information</Text>
                            <View style={styles.infoRow}>
                                <Ionicons name="card-outline" size={20} color="#6C757D" />
                                <Text style={styles.infoText}>Method: {order.paymentMethod}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons name="checkmark-circle-outline" size={20} color="#6C757D" />
                                <Text style={styles.infoText}>Status: {order.paymentStatus}</Text>
                            </View>
                        </View>

                        {/* Total Amount */}
                        <View style={styles.totalSection}>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.totalAmount}>₹{order.totalAmount.toFixed(2)}</Text>
                        </View>
                        <View style={styles.bottomPadding}></View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

// Order Item Component
const OrderItem = ({ order, onPress }) => {
    const orderDate = new Date(order.createdAt);
    const formattedDate = orderDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return '#fda535';
            case 'accepted':
                return '#4361EE';
            case 'preparing':
                return '#6C63FF';
            case 'ready':
                return '#4CAF50';
            case 'delivered':
                return '#009688';
            case 'cancelled':
                return '#DC3545';
            default:
                return '#6C757D';
        }
    };

    return (
        <TouchableOpacity style={styles.orderItem} onPress={() => onPress(order)}>
            <View style={styles.orderHeader}>
                <View>
                    <Text style={styles.orderNumber}>Order #{order._id.slice(-6)}</Text>
                    <View style={styles.customerInfo}>
                        <View style={styles.infoRow}>
                            <Ionicons name="business-outline" size={16} color="#6C757D" />
                            <Text style={styles.customerName}>{order.vendorId?.businessName || 'Vendor'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="call-outline" size={16} color="#6C757D" />
                            <Text style={styles.customerPhone}>{order.vendorId?.contactNumber || 'N/A'}</Text>
                        </View>
                    </View>
                </View>
                <View
                    style={[
                        styles.orderStatus,
                        { backgroundColor: `${getStatusColor(order.status)}15` },
                    ]}
                >
                    <Text
                        style={[styles.orderStatusText, { color: getStatusColor(order.status) }]}
                    >
                        {order.status}
                    </Text>
                </View>
            </View>

            <View style={styles.orderDetails}>
                <View style={styles.orderInfo}>
                    <Ionicons name="time-outline" size={16} color="#6C757D" />
                    <Text style={styles.orderTime}>{formattedDate}</Text>
                </View>
                <View style={styles.orderInfo}>
                    <Ionicons name="receipt-outline" size={16} color="#6C757D" />
                    <Text style={styles.orderItemCount}>
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                    </Text>
                </View>
            </View>

            <View style={styles.orderSummary}>
                <View style={styles.paymentMethodContainer}>
                    <Text style={styles.paymentMethod}>{order.paymentMethod}</Text>
                </View>
                <Text style={styles.orderTotal}>₹{order.totalAmount.toFixed(2)}</Text>
            </View>
        </TouchableOpacity>
    );
};

const UserOrdersScreen = ({ navigation }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await customerAPI.getCustomerOrders();
            setOrders(response);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Failed to load orders. Please try again.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Fetch orders on screen focus
    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [])
    );

    // Handle refresh
    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchOrders();
    }, []);

    // Handle order press
    const handleOrderPress = (order) => {
        setSelectedOrder(order);
        setIsModalVisible(true);
    };

    return (
        <>
            <StatusBar backgroundColor={THEME_COLOR} barStyle="light-content" />
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>My Orders</Text>
                </View>

                {isLoading && !isRefreshing ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={THEME_COLOR} />
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity 
                            style={styles.retryButton}
                            onPress={() => fetchOrders()}
                        >
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : orders.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="receipt-outline"
                            size={80}
                            color="#d1d9e6"
                        />
                        <Text style={styles.emptyText}>No orders found</Text>
                        <Text style={styles.emptySubtext}>
                            You haven't placed any orders yet
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={orders}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <OrderItem order={item} onPress={handleOrderPress} />
                        )}
                        contentContainerStyle={styles.listContainer}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={onRefresh}
                                colors={[THEME_COLOR]}
                            />
                        }
                    />
                )}

                <OrderDetailsModal
                    visible={isModalVisible}
                    order={selectedOrder}
                    onClose={() => {
                        setIsModalVisible(false);
                        setSelectedOrder(null);
                    }}
                />
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    listContainer: {
        padding: 16,
    },
    orderItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212529',
    },
    customerInfo: {
        marginTop: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    customerName: {
        fontSize: 14,
        color: '#6C757D',
        marginLeft: 4,
    },
    customerPhone: {
        fontSize: 14,
        color: '#6C757D',
        marginLeft: 4,
    },
    orderStatus: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    orderStatusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    orderDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    orderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    orderTime: {
        fontSize: 14,
        color: '#6C757D',
        marginLeft: 4,
    },
    orderItemCount: {
        fontSize: 14,
        color: '#6C757D',
        marginLeft: 4,
    },
    orderSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    paymentMethodContainer: {
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    paymentMethod: {
        fontSize: 14,
        color: '#6C757D',
        fontWeight: '500',
    },
    orderTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212529',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#DC3545',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: THEME_COLOR,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212529',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#6C757D',
        textAlign: 'center',
        marginTop: 8,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212529',
    },
    closeButton: {
        padding: 8,
    },
    modalBody: {
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: '#6C757D',
        marginLeft: 8,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemName: {
        fontSize: 14,
        color: '#212529',
        flex: 1,
    },
    itemDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemQuantity: {
        fontSize: 14,
        color: '#6C757D',
        marginRight: 8,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#212529',
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E9ECEF',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212529',
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: THEME_COLOR,
    },
    bottomPadding: {
        height: 40,
    },
    statusSection: {
        marginBottom: 24,
    },
    statusDisplay: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 16,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
});

export default UserOrdersScreen; 