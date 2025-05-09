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
    Alert,
    ScrollView,
    Modal,
    StatusBar,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVendorStore } from '../../store/vendorStore';
import { useFocusEffect } from '@react-navigation/native';
import { vendorAPI } from '../../services/apiService';
import { authService } from '../../services/apiService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THEME_COLOR = '#FF9F6A';

// Order Details Modal Component
const OrderDetailsModal = ({ visible, order, onClose, onUpdateStatus }) => {
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
                return '#FF6B6B';
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

    const renderStatusButton = (status, label) => (
        <TouchableOpacity
            style={[
                styles.statusButton,
                { backgroundColor: order.status === status ? getStatusColor(status) : '#F8F9FA' }
            ]}
            onPress={() => onUpdateStatus(order._id, status)}
        >
            <Text style={[
                styles.statusButtonText,
                { color: order.status === status ? '#FFFFFF' : '#6C757D' }
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

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
                            <View style={styles.statusButtonsContainer}>
                                {renderStatusButton('pending', 'Pending')}
                                {renderStatusButton('preparing', 'Preparing')}
                                {renderStatusButton('ready', 'Ready')}
                                {renderStatusButton('delivered', 'Delivered')}
                            </View>
                        </View>

                        {/* Customer Information */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Customer Information</Text>
                            <View style={styles.infoRow}>
                                <Ionicons name="person-outline" size={20} color="#6C757D" />
                                <Text style={styles.infoText}>{order.customer?.name || 'Customer'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons name="call-outline" size={20} color="#6C757D" />
                                <Text style={styles.infoText}>{order.customer?.phone || 'N/A'}</Text>
                            </View>
                        </View>

                        {/* Order Information */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Order Information</Text>
                            <View style={styles.infoRow}>
                                <Ionicons name="receipt-outline" size={20} color="#6C757D" />
                                <Text style={styles.infoText}>Order #{order._id.slice(-6)}</Text>
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
                return '#FF6B6B';
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
                    <Text style={styles.customerName}>{order.customer?.name || 'Customer'}</Text>
                    <Text style={styles.customerPhone}>{order.customer?.phone || 'N/A'}</Text>
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

const VendorOrdersScreen = ({ navigation }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const fetchOrders = async (status = 'all') => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await vendorAPI.getVendorOrders();
            
            // Fetch customer details for each order
            // const ordersWithCustomerDetails = await Promise.all(
            //     response.map(async (order) => {
            //         try {
            //             const customerDetails = await authService.getUserById(order.customerId);
            //             return {
            //                 ...order,
            //                 customer: customerDetails
            //             };
            //         } catch (error) {
            //             console.error('Error fetching customer details:', error);
            //             return order;
            //         }
            //     })
            // );

            setOrders(response);
            
            // Filter orders based on status
            // if (status === 'all') {
            //     setFilteredOrders(ordersWithCustomerDetails);
            // } else {
            //     setFilteredOrders(ordersWithCustomerDetails.filter(order => order.status === status));
            // }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Failed to load orders. Please try again.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await vendorAPI.updateOrderStatus(orderId, newStatus);
            // Refresh orders after status update
            fetchOrders(activeFilter);
            // Update the selected order in the modal
            setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        } catch (error) {
            console.error('Error updating order status:', error);
            Alert.alert('Error', 'Failed to update order status. Please try again.');
        }
    };

    // Fetch orders on screen focus
    useFocusEffect(
        useCallback(() => {
            fetchOrders(activeFilter);
        }, [activeFilter])
    );

    // Handle refresh
    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchOrders(activeFilter);
    }, [activeFilter]);

    // Handle filter change
    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        fetchOrders(filter);
    };

    // Handle order press
    const handleOrderPress = (order) => {
        setSelectedOrder(order);
        setIsModalVisible(true);
    };

    // Render filter buttons
    const renderFilterButtons = () => (
        <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        activeFilter === 'all' && styles.activeFilterButton,
                    ]}
                    onPress={() => handleFilterChange('all')}
                >
                    <Text
                        style={[
                            styles.filterButtonText,
                            activeFilter === 'all' && styles.activeFilterButtonText,
                        ]}
                    >
                        All
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        activeFilter === 'pending' && styles.activeFilterButton,
                    ]}
                    onPress={() => handleFilterChange('pending')}
                >
                    <Text
                        style={[
                            styles.filterButtonText,
                            activeFilter === 'pending' && styles.activeFilterButtonText,
                        ]}
                    >
                        Pending
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        activeFilter === 'preparing' && styles.activeFilterButton,
                    ]}
                    onPress={() => handleFilterChange('preparing')}
                >
                    <Text
                        style={[
                            styles.filterButtonText,
                            activeFilter === 'preparing' && styles.activeFilterButtonText,
                        ]}
                    >
                        Preparing
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        activeFilter === 'ready' && styles.activeFilterButton,
                    ]}
                    onPress={() => handleFilterChange('ready')}
                >
                    <Text
                        style={[
                            styles.filterButtonText,
                            activeFilter === 'ready' && styles.activeFilterButtonText,
                        ]}
                    >
                        Ready
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        activeFilter === 'delivered' && styles.activeFilterButton,
                    ]}
                    onPress={() => handleFilterChange('delivered')}
                >
                    <Text
                        style={[
                            styles.filterButtonText,
                            activeFilter === 'delivered' && styles.activeFilterButtonText,
                        ]}
                    >
                        Delivered
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );

    return (
        <>
            <StatusBar backgroundColor={THEME_COLOR} barStyle="light-content" />
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Orders</Text>
                    <View style={styles.rightPlaceholder} />
                </View>

                {renderFilterButtons()}

                {isLoading && !isRefreshing ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={THEME_COLOR} />
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={() => fetchOrders(activeFilter)}
                        >
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : filteredOrders.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="receipt-outline"
                            size={80}
                            color="#d1d9e6"
                        />
                        <Text style={styles.emptyText}>No orders found</Text>
                        <Text style={styles.emptySubtext}>
                            {activeFilter === 'all'
                                ? "You haven't received any orders yet"
                                : `No ${activeFilter} orders found`}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredOrders}
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
                    onUpdateStatus={updateOrderStatus}
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
        justifyContent: 'space-between',
        backgroundColor: THEME_COLOR,
        paddingVertical: 16,
        paddingHorizontal: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    rightPlaceholder: {
        width: 40,
    },
    filterContainer: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: '#F8F9FA',
    },
    activeFilterButton: {
        backgroundColor: THEME_COLOR,
    },
    filterButtonText: {
        color: '#6C757D',
        fontSize: 14,
        fontWeight: '500',
    },
    activeFilterButtonText: {
        color: '#FFFFFF',
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
    customerName: {
        fontSize: 14,
        color: '#6C757D',
        marginTop: 4,
    },
    customerPhone: {
        fontSize: 14,
        color: '#6C757D',
        marginTop: 2,
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
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
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
    statusSection: {
        marginBottom: 24,
    },
    statusButtonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginRight: 8,
        marginBottom: 8,
    },
    statusButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
});

export default VendorOrdersScreen;
