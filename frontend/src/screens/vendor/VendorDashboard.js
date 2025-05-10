import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import api from '../../services/apiService';
import useAuthStore from '../../store/authStore';
import { useVendorStore } from '../../store/vendorStore';
import API from '../../services/apiService';

const { width } = Dimensions.get('window');

// Statistic Card Component
const StatCard = ({ icon, title, value, color, backgroundColor }) => (
  <View style={[styles.statCard, { backgroundColor }]}>
    <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  </View>
);

// Action Card Component
const ActionCard = ({ icon, title, subtitle, onPress, color }) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress}>
    <View style={[styles.actionIconContainer, { backgroundColor: `${color}10` }]}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
    </View>
    <View style={styles.actionContent}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </View>
    <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
  </TouchableOpacity>
);

// Order Item Component for Recent Orders
const OrderItem = ({ order, onPress }) => {
  const orderDate = new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  const total = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#fda535';
      case 'accepted':
        return '#2196F3';
      case 'preparing':
        return '#673AB7';
      case 'ready':
        return '#4CAF50';
      case 'delivered':
        return '#009688';
      case 'cancelled':
        return '#fda535';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <TouchableOpacity style={styles.orderItem} onPress={() => onPress(order._id)}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>#{order._id.slice(-6)}</Text>
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
        <View style={styles.orderCustomer}>
          <MaterialCommunityIcons name="account" size={16} color="#666" />
          <Text style={styles.orderCustomerName}>
            {order.customer?.name || 'Customer'}
          </Text>
        </View>
        <Text style={styles.orderTime}>{formattedDate}</Text>
      </View>

      <View style={styles.orderSummary}>
        <Text style={styles.orderItemCount}>
          {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
        </Text>
        <Text style={styles.orderTotal}>₹{total.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const VendorDashboard = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const vendorStore = useVendorStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [vendorData, setVendorData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [isMockData, setIsMockData] = useState(false);

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching dashboard data for vendor:", user?._id);
      
      // Get vendor profile
      let vendorProfile = null;
      try {
        vendorProfile = await vendorStore.fetchVendorProfile({ force: true });
      } catch (profileError) {
        console.error('Error fetching vendor profile:', profileError);
        // Use mock profile data
        vendorProfile = {
          _id: 'mock-' + (user?._id || 'vendor'),
          name: user?.name || 'Demo Restaurant',
          email: user?.email || 'demo@example.com',
          phone: '1234567890',
          address: '123 Food Street, Cuisine City',
          description: 'A demo restaurant with mock data',
          cuisineType: 'Mixed',
          openingHours: '9 AM - 10 PM',
          averageRating: 4.5,
        };
        setIsMockData(true);
      }
      
      setVendorData(vendorProfile);
      
      // Get vendor orders
      let orders = [];
      try {
        if (vendorProfile?._id) {
          orders = await vendorStore.fetchOrders({ force: true });
        }
      } catch (ordersError) {
        console.error('Error fetching orders:', ordersError);
        // Use mock orders
        orders = generateMockOrders();
        setIsMockData(true);
      }
      
      // Sort by date (newest first) and take the 5 most recent
      const sortedOrders = [...orders].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ).slice(0, 5);
      
      setRecentOrders(sortedOrders);
      
      // Generate sales data (either from orders or mock)
      const weekData = generateWeeklySalesData(orders);
      setSalesData(weekData);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Show an alert to the user
      Alert.alert(
        'Error',
        'Failed to load dashboard data. Using demo data.',
        [{ text: 'OK' }]
      );
      
      // Set mock data
      setVendorData({
        _id: 'mock-vendor',
        name: user?.name || 'Demo Restaurant',
        email: user?.email || 'demo@example.com',
        phone: '1234567890',
        address: '123 Food Street, Cuisine City',
        description: 'A demo restaurant with mock data',
        cuisineType: 'Mixed',
        openingHours: '9 AM - 10 PM',
        averageRating: 4.5,
      });
      
      const mockOrders = generateMockOrders();
      setRecentOrders(mockOrders.slice(0, 5));
      setSalesData(generateWeeklySalesData(mockOrders));
      setIsMockData(true);
      
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Generate mock orders for demo purposes
  const generateMockOrders = () => {
    const statuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
    const mockOrders = [];
    
    for (let i = 1; i <= 15; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 7)); // Random day in the past week
      
      mockOrders.push({
        _id: `mock-order-${i}`,
        userId: `mock-user-${Math.floor(Math.random() * 10) + 1}`,
        items: [
          { name: 'Burger', quantity: 2, price: 8.99 },
          { name: 'Fries', quantity: 1, price: 3.99 }
        ],
        totalAmount: (8.99 * 2) + 3.99,
        status,
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
        deliveryAddress: '456 Customer Ave, Food City',
        customerName: `Mock Customer ${i}`
      });
    }
    
    return mockOrders;
  };

  // Generate demo sales data for the week
  const generateWeeklySalesData = (orders) => {
    // Generate random but reasonably looking sales data
    const generateRandom = (min, max) => {
      return Math.floor(Math.random() * (max - min + 1) + min);
    };

    const data = [
      generateRandom(1000, 5000),
      generateRandom(2000, 6000),
      generateRandom(3000, 7000),
      generateRandom(2500, 6500),
      generateRandom(4000, 8000),
      generateRandom(5000, 9000),
      generateRandom(3500, 7500),
    ];

    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          data,
          color: () => '#4361ee', // Line color
          strokeWidth: 2,
        },
      ],
    };
  };

  // Calculate statistics
  const calculateStatistics = () => {
    if (!recentOrders || recentOrders.length === 0) {
      return {
        pendingOrders: 0,
        todayRevenue: 0,
        totalOrders: 0,
      };
    }

    const pendingOrders = recentOrders.filter((order) =>
      ['pending', 'accepted', 'preparing'].includes(order.status.toLowerCase())
    ).length;

    // Calculate today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRevenue = recentOrders
      .filter((order) => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return (
          orderDate.getTime() === today.getTime() &&
          order.status.toLowerCase() !== 'cancelled'
        );
      })
      .reduce((sum, order) => {
        return (
          sum +
          order.items.reduce(
            (itemSum, item) => itemSum + item.price * item.quantity,
            0
          )
        );
      }, 0);

    return {
      pendingOrders,
      todayRevenue,
      totalOrders: recentOrders.length,
    };
  };

  const stats = calculateStatistics();

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  // Navigation functions
  const navigateToMenu = () => navigation.navigate('VendorMenu');
  const navigateToOrders = (filter = 'all') => navigation.navigate('VendorOrders', { filter });
  const navigateToLocations = () => navigation.navigate('VendorLocations');
  const navigateToStaff = () => navigation.navigate('VendorStaff');
  const navigateToOrderDetails = (orderId) => navigation.navigate('VendorOrderDetails', { orderId });

  // Handle refresh
  const onRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  // Chart configuration
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(67, 97, 238, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#4361ee',
    },
  };

  // Effect to fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4361ee" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isMockData && (
        <View style={styles.mockDataBanner}>
          <MaterialCommunityIcons name="information" size={20} color="#fff" />
          <Text style={styles.mockDataText}>Using mock data - Server unavailable</Text>
        </View>
      )}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#4361ee']} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>
              Welcome back,
            </Text>
            <Text style={styles.restaurantName}>
              {vendorData?.restaurantName || user?.name || 'Restaurant Owner'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('VendorProfile')}
          >
            {vendorData?.logo ? (
              <Image 
                source={{ uri: vendorData.logo }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <MaterialCommunityIcons name="account" size={24} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="clock-outline"
            title="Pending Orders"
            value={stats.pendingOrders}
            color="#fda535"
            backgroundColor="#fff"
          />
          <StatCard
            icon="currency-inr"
            title="Today's Revenue"
            value={formatCurrency(stats.todayRevenue)}
            color="#4CAF50"
            backgroundColor="#fff"
          />
          <StatCard
            icon="receipt-text-outline"
            title="Total Orders"
            value={stats.totalOrders}
            color="#2196F3"
            backgroundColor="#fff"
          />
        </View>

        {/* Weekly Sales Chart */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Sales</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See Details</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chartContainer}>
            <LineChart
              data={salesData}
              width={width - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <ActionCard
              icon="food-variant"
              title="Manage Menu"
              subtitle="Add, edit or remove items"
              onPress={navigateToMenu}
              color="#fda535"
            />
            <ActionCard
              icon="clock-outline"
              title="Pending Orders"
              subtitle={`${stats.pendingOrders} orders waiting`}
              onPress={() => navigateToOrders('pending')}
              color="#2196F3"
            />
            <ActionCard
              icon="map-marker-outline"
              title="Locations"
              subtitle="Manage your service areas"
              onPress={navigateToLocations}
              color="#4CAF50"
            />
            <ActionCard
              icon="account-group-outline"
              title="Staff"
              subtitle="Manage your team members"
              onPress={navigateToStaff}
              color="#9C27B0"
            />
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => navigateToOrders()}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentOrders.length > 0 ? (
            <View style={styles.recentOrdersContainer}>
              {recentOrders.slice(0, 5).map((order) => (
                <OrderItem
                  key={order._id}
                  order={order}
                  onPress={navigateToOrderDetails}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyOrdersContainer}>
              <MaterialCommunityIcons
                name="receipt-text-outline"
                size={50}
                color="#d1d9e6"
              />
              <Text style={styles.emptyOrdersText}>No orders yet</Text>
              <Text style={styles.emptyOrdersSubtext}>
                Your recent orders will appear here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4361ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 8,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4361ee',
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  actionsContainer: {
    marginTop: 8,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  recentOrdersContainer: {
    marginTop: 8,
  },
  orderItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderCustomer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderCustomerName: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  orderTime: {
    fontSize: 14,
    color: '#666',
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItemCount: {
    fontSize: 14,
    color: '#666',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyOrdersContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emptyOrdersText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  emptyOrdersSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  mockDataBanner: {
    backgroundColor: '#e74c3c',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderRadius: 5,
    marginBottom: 10,
  },
  mockDataText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});

export default VendorDashboard; 