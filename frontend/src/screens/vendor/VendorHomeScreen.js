import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../store/authStore';
import axios from 'axios';
import { API_URL, MOCK_DATA, DEBUG } from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../../services/apiService';

const VendorHomeScreen = ({ navigation }) => {
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        pendingOrders: 0,
        todayRevenue: 0,
        totalOrders: 0,
        totalMenuItems: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const { user, logout } = useAuthStore();
    const [isMockData, setIsMockData] = useState(false);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching dashboard data...');
            
            if (!user || !user._id) {
                console.log('User data not available yet, aborting dashboard data fetch');
                console.log('Using mock data as fallback');
                
                // Use mock data as fallback
                setDashboardData({
                    pendingOrders: MOCK_DATA.vendor.orders.filter(o => o.status === 'pending').length,
                    totalOrders: MOCK_DATA.vendor.orders.length,
                    todayRevenue: MOCK_DATA.vendor.orders.reduce((sum, o) => sum + o.totalAmount, 0),
                    totalMenuItems: MOCK_DATA.vendor.menu.length
                });
                setRecentOrders(MOCK_DATA.vendor.orders);
                setIsMockData(true);
                
                setLoading(false);
                setRefreshing(false);
                return;
            }
            
            // Check if we're using a mock token
            const storedToken = await AsyncStorage.getItem('userToken');
            if (storedToken === 'mock-token-for-testing-only') {
                console.log('Mock token detected, using mock data');
                setDashboardData({
                    pendingOrders: MOCK_DATA.vendor.orders.filter(o => o.status === 'pending').length,
                    totalOrders: MOCK_DATA.vendor.orders.length,
                    todayRevenue: MOCK_DATA.vendor.orders.reduce((sum, o) => sum + o.totalAmount, 0),
                    totalMenuItems: MOCK_DATA.vendor.menu.length
                });
                setRecentOrders(MOCK_DATA.vendor.orders);
                setIsMockData(true);
                setLoading(false);
                setRefreshing(false);
                return;
            }
            
            console.log('User ID:', user._id);
            // Log user object for debugging
            if (DEBUG.AUTH) {
                console.log('User object:', JSON.stringify(user, null, 2));
            }
            
            let orders = [];
            let menuItems = [];
            let profileData = null;
            let usedMockData = false;
            
            try {
                // Use the authService method instead of direct axios call
                console.log('Using authService.getVendorProfile()');
                profileData = await authService.getVendorProfile();
                console.log('Vendor profile fetched:', profileData);
            } catch (profileError) {
                console.error('Error fetching vendor profile:', profileError);
                
                // Check for server connection issues
                if (profileError.code === 'ECONNABORTED' || 
                    profileError.message?.includes('Network Error') ||
                    !profileError.response) {
                    Alert.alert(
                        'Server Connection Issue',
                        'Unable to connect to the server. The app will use mock data.',
                        [{ text: 'OK' }]
                    );
                    // Use mock data
                    profileData = MOCK_DATA.vendor.profile;
                    usedMockData = true;
                }
                // If token is invalid, try to handle auth error
                else if (profileError.response?.status === 401) {
                    console.log('Authentication failed - logging out user');
                    if (!isMockData) {
                        Alert.alert(
                            'Authentication Error',
                            'Your session has expired. Please log in again.',
                            [
                                {
                                    text: 'OK',
                                    onPress: async () => {
                                        await logout();
                                        navigation.reset({
                                            index: 0,
                                            routes: [{ name: 'Login' }],
                                        });
                                    }
                                }
                            ]
                        );
                        setLoading(false);
                        setRefreshing(false);
                        return;
                    } else {
                        // If we're in mock mode and get a 401, just use mock data
                        profileData = MOCK_DATA.vendor.profile;
                        usedMockData = true;
                    }
                }
                // Continue with other requests even if profile fetch fails
            }
            
            try {
                // Get orders data
                const ordersRes = await axios.get(`${API_URL}/orders/vendor/${user._id}`);
                console.log('Vendor orders fetched:', ordersRes.data ? ordersRes.data.length : 0);
                orders = ordersRes.data || [];
            } catch (ordersError) {
                console.error('Error fetching orders:', ordersError);
                console.log('Using mock orders as fallback');
                orders = MOCK_DATA.vendor.orders;
                usedMockData = true;
            }
            
            try {
                // Get menu items
                const menuRes = await axios.get(`${API_URL}/menu/vendor/${user._id}`);
                console.log('Vendor menu items fetched:', menuRes.data ? menuRes.data.length : 0);
                menuItems = menuRes.data || [];
            } catch (menuError) {
                console.error('Error fetching menu items:', menuError);
                console.log('Using mock menu items as fallback');
                menuItems = MOCK_DATA.vendor.menu;
                usedMockData = true;
            }
            
            setIsMockData(usedMockData);
            
            // Calculate stats
            const pendingOrders = orders.filter(order => 
                order.status === 'pending' || order.status === 'accepted' || order.status === 'preparing'
            ).length;
            
            const todayOrders = orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                const today = new Date();
                return orderDate.toDateString() === today.toDateString();
            });
            
            const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            
            // Set stats
            setDashboardData({
                pendingOrders,
                totalOrders: orders.length,
                todayRevenue,
                totalMenuItems: menuItems.length
            });
            
            // Get recent orders (latest 5)
            const sortedOrders = [...orders].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            setRecentOrders(sortedOrders.slice(0, 5));
            
        } catch (error) {
            console.error('Error fetching dashboard data:', error.response || error);
            // If we get a 401 error, we might need to log out
            if (error.response?.status === 401) {
                Alert.alert(
                    'Authentication Error',
                    'Your session has expired. Please log in again.',
                    [
                        {
                            text: 'OK',
                            onPress: async () => {
                                await logout();
                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'Login' }],
                                });
                            }
                        }
                    ]
                );
            } else {
                setError('Failed to load dashboard data. Please try again.');
                // Use mock data as fallback
                console.log('Using mock data as fallback due to error');
                setDashboardData({
                    pendingOrders: MOCK_DATA.vendor.orders.filter(o => o.status === 'pending').length,
                    totalOrders: MOCK_DATA.vendor.orders.length,
                    todayRevenue: MOCK_DATA.vendor.orders.reduce((sum, o) => sum + o.totalAmount, 0),
                    totalMenuItems: MOCK_DATA.vendor.menu.length
                });
                setRecentOrders(MOCK_DATA.vendor.orders);
                setIsMockData(true);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchDashboardData();
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const navigateToScreen = (screenName) => {
        navigation.navigate(screenName);
    };

    const QuickActionButton = ({ title, icon, onPress }) => (
        <TouchableOpacity style={styles.actionButton} onPress={onPress}>
            <Ionicons name={icon} size={24} color="#FF6B6B" />
            <Text style={styles.actionButtonText}>{title}</Text>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#FF6B6B" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {isMockData && (
                <View style={styles.mockDataBanner}>
                    <Ionicons name="information-circle-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.mockDataText}>
                        Using mock data - Server unavailable
                    </Text>
                </View>
            )}
            
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.header}>
                    <Text style={styles.welcomeText}>Welcome back,</Text>
                    <Text style={styles.vendorName}>{user?.name || 'Vendor'}</Text>
                </View>

                {error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity 
                            style={styles.retryButton} 
                            onPress={fetchDashboardData}
                        >
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View style={styles.statsContainer}>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>{dashboardData.pendingOrders}</Text>
                                <Text style={styles.statLabel}>Pending Orders</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>${dashboardData.todayRevenue}</Text>
                                <Text style={styles.statLabel}>Today's Revenue</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>{dashboardData.totalOrders}</Text>
                                <Text style={styles.statLabel}>Total Orders</Text>
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>Quick Actions</Text>
                        <View style={styles.actionsContainer}>
                            <QuickActionButton
                                title="Menu"
                                icon="restaurant-outline"
                                onPress={() => navigateToScreen('Menu')}
                            />
                            <QuickActionButton
                                title="Orders"
                                icon="receipt-outline"
                                onPress={() => navigateToScreen('Orders')}
                            />
                            <QuickActionButton
                                title="Dashboard"
                                icon="stats-chart-outline"
                                onPress={() => navigateToScreen('Dashboard')}
                            />
                            <QuickActionButton
                                title="Payments"
                                icon="wallet-outline"
                                onPress={() => navigateToScreen('Payment')}
                            />
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 16,
    },
    header: {
        marginBottom: 24,
    },
    welcomeText: {
        fontSize: 16,
        color: '#6C757D',
    },
    vendorName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212529',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF6B6B',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6C757D',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 16,
    },
    actionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionButton: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionButtonText: {
        marginTop: 8,
        fontSize: 14,
        color: '#495057',
        fontWeight: '500',
    },
    errorContainer: {
        padding: 16,
        backgroundColor: '#FFF3F3',
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
    },
    errorText: {
        color: '#DC3545',
        marginBottom: 12,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    mockDataBanner: {
        backgroundColor: '#FF6B6B',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    mockDataText: {
        color: '#FFFFFF',
        fontSize: 14,
        marginLeft: 8,
    },
});

export default VendorHomeScreen;