import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    SectionList,
    FlatList,
    ActivityIndicator,
    Modal,
    StatusBar,
    Image,
    Alert,
    Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CartTab from '../../components/CartTab';

// Remove the flag that forces mock data for local IPs
// const USE_MOCK_DATA = !API_URL || API_URL.includes('192.168.') || API_URL.includes('localhost');
// Instead, only use mock when API_URL is completely missing
const USE_MOCK_DATA = !API_URL;

const THEME_COLOR = '#fda535';

const RestaurantDetailsScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { cartItems, cartRestaurant, addToCart, updateItemQuantity, getCartTotal, getItemCount } = useCart();
    
    // Log route params for debugging
    console.log('Route params:', route.params);
    
    // If restaurant data isn't provided or is incomplete, use mock data
    const mockRestaurant = {
        _id: 'mock-id-123',
        name: 'Sample Restaurant',
        description: 'This is a sample restaurant with delicious food options.',
        isAcceptingOrders: true,
        coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80',
    };
    
    // Use restaurant from params if available, or fall back to mock data
    const initialRestaurantData = route.params?.restaurant || mockRestaurant;
    
    // Create a state for the restaurant data
    const [restaurant, setRestaurant] = useState(null);

    // NEW: Add state for time window message
    const [timeWindowMessage, setTimeWindowMessage] = useState(null);

    // Process restaurant data properly
    useEffect(() => {
        // Create a new object to avoid mutating the original
        if (initialRestaurantData) {
            const processedRestaurant = { ...initialRestaurantData };
            
            // If it has id but not _id, set _id in the new object
            if (processedRestaurant.id && !processedRestaurant._id) {
                console.log('Converting id to _id for consistency');
                processedRestaurant._id = processedRestaurant.id;
            }
            
            setRestaurant(processedRestaurant);
            
            console.log('Restaurant object:', processedRestaurant);
            if (processedRestaurant) {
                console.log('Restaurant ID:', processedRestaurant._id || processedRestaurant.id);
                console.log('Restaurant name:', processedRestaurant.name);
            }
        } else {
            console.warn('No restaurant data provided in route params');
            setRestaurant(mockRestaurant);
        }
    }, [initialRestaurantData]);

    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showSchedule, setShowSchedule] = useState(false);
    const [schedule, setSchedule] = useState(null);
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [isRestaurantOpen, setIsRestaurantOpen] = useState(false);
    const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);

    // Helper function to get current day of week (0-6, Sunday-Saturday)
    const getCurrentDayOfWeek = () => {
        return new Date().getDay();
    };
    
    // Helper function to convert day number to name
    const getDayName = (dayNumber) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[dayNumber];
    };
    
    // Helper function to get mock schedule data
    const getMockSchedule = () => {
        return {
            'Monday': { isOpen: true, openTime: '09:00', closeTime: '22:00' },
            'Tuesday': { isOpen: true, openTime: '09:00', closeTime: '22:00' },
            'Wednesday': { isOpen: true, openTime: '09:00', closeTime: '22:00' },
            'Thursday': { isOpen: true, openTime: '09:00', closeTime: '22:00' },
            'Friday': { isOpen: true, openTime: '09:00', closeTime: '23:00' },
            'Saturday': { isOpen: true, openTime: '10:00', closeTime: '23:00' },
            'Sunday': { isOpen: true, openTime: '10:00', closeTime: '22:00' }
        };
    };

    // Simulate theme colors
    const themeColors = {
        primary: '#FF4500',
        background: '#F8F8F8',
        card: '#FFFFFF',
        text: '#212121',
        border: '#E0E0E0',
        notification: '#FF4500',
    };

    useEffect(() => {
        if (USE_MOCK_DATA) {
            console.log('Using mock data directly (API_URL may be invalid)');
            setMenuItems(getMockMenuItems());
            setLoading(false);
            const mockSchedule = getMockSchedule();
            setSchedule(mockSchedule);
            updateIsRestaurantOpen(mockSchedule);
        } else if (restaurant?._id) {
            fetchMenuItems();
            fetchSchedule();
            fetchVendorStatus();
        }
    }, [restaurant]);

    // Fetch vendor status
    const fetchVendorStatus = async () => {
        if (!restaurant) {
            console.log('No restaurant data available for vendor status');
            return;
        }
        
        const restaurantId = restaurant._id || restaurant.id;
        
        if (!restaurantId) {
            console.log('No restaurant ID available for vendor status');
            return;
        }
        
        console.log('Fetching vendor status for restaurant ID:', restaurantId);
        try {
            // Use the public API endpoint for vendor information
            const url = `${API_URL}/public/vendor/${restaurantId}`;
            console.log('Calling vendor status API URL:', url);
            
            const response = await axios.get(url);
            console.log('Vendor status response:', response.data);
            
            // Check if the vendor is accepting orders
            if (response.data && 'isAcceptingOrders' in response.data) {
                setIsAcceptingOrders(response.data.isAcceptingOrders);
            } else {
                // Default to true if we can't determine
                console.log('Could not determine accepting orders status, defaulting to true');
                setIsAcceptingOrders(true);
            }
        } catch (err) {
            console.error('Error fetching vendor status:', err);
            console.error('Vendor status error details:', err.response ? err.response.data : 'No response data');
            // Default to true if we can't fetch status
            console.log('Error fetching vendor status, defaulting to true');
            setIsAcceptingOrders(true);
        }
    };

    // Fetch menu items for the restaurant
    const fetchMenuItems = async (retryCount = 0) => {
        if (!restaurant) {
            console.log('No restaurant data available');
            setError('Restaurant information not available');
            setLoading(false);
            return;
        }
        
        // Support both id and _id for flexibility
        const restaurantId = restaurant._id || restaurant.id;
        
        if (!restaurantId) {
            console.log('No restaurant ID available');
            setError('Restaurant information not available');
            setLoading(false);
            return;
        }
        
        console.log('Fetching menu items for restaurant ID:', restaurantId);
        console.log('Using API URL:', API_URL);
        
        setLoading(true);
        setError(null);
        
        try {
            // Use the correct API endpoint path structure
            const url = `${API_URL}/public/user/menu/${restaurantId}`;
            console.log('Calling menu API URL:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Menu items fetched raw data:', data);
            
            if (data && data.items && Array.isArray(data.items)) {
                console.log(`Received ${data.items.length} total menu items`);
                console.log(`Breakdown: ${data.items.filter(i => i.isScheduled).length} scheduled items, ${data.items.filter(i => !i.isScheduled).length} regular items`);
                
                // Always show scheduled items as available
                const processedItems = data.items.map(item => {
                    if (item.isScheduled) {
                        return {...item, isAvailable: true};
                    }
                    return item;
                });
                
                setMenuItems(processedItems);
                
                // Set time window message - for now always show it if there are any menu items
                // This helps users understand the availability windows even if no scheduled items
                // are currently available
                setTimeWindowMessage("Menu availability times");
            } else {
                console.log('No valid items array in API response');
                setMenuItems([]);
                setTimeWindowMessage(null);
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching menu items:', error);
            
            if (retryCount < 2) {
                // Retry after delay (exponential backoff)
                const delay = Math.pow(2, retryCount) * 1000;
                console.log(`Retrying after ${delay}ms...`);
                setTimeout(() => fetchMenuItems(retryCount + 1), delay);
            } else {
                setError('Failed to load menu items. Please try again.');
                setLoading(false);
            }
        }
    };

    // Mock data function
    const getMockMenuItems = () => [
        {
            _id: '1',
            name: 'Butter Chicken',
            price: 250,
            description: 'Creamy tomato sauce with tender chicken pieces',
            isVeg: false,
            isAvailable: true,
            category: 'Main Course',
            mealType: 'Lunch'
        },
        {
            _id: '2',
            name: 'Paneer Tikka',
            price: 200,
            description: 'Marinated cottage cheese grilled to perfection',
            isVeg: true,
            isAvailable: true,
            category: 'Starters',
            mealType: 'Dinner'
        },
        {
            _id: '3',
            name: 'Masala Dosa',
            price: 120,
            description: 'South Indian crepe filled with spiced potatoes',
            isVeg: true,
            isAvailable: true,
            category: 'Breakfast',
            mealType: 'Breakfast'
        }
    ];

    // Helper function to update restaurant open status based on schedule
    const updateIsRestaurantOpen = (scheduleData) => {
        if (!scheduleData) return;
        
        const today = getDayName(getCurrentDayOfWeek());
        const todaySchedule = scheduleData[today];
        
        if (todaySchedule && todaySchedule.isOpen) {
            // Get current time
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const currentTime = currentHour * 60 + currentMinute; // time in minutes
            
            // Parse opening and closing times
            const openingTime = parseTimeString(todaySchedule.openTime);
            const closingTime = parseTimeString(todaySchedule.closeTime);
            
            // Check if current time is within operating hours
            if (currentTime >= openingTime && currentTime <= closingTime) {
                setIsRestaurantOpen(true);
            } else {
                setIsRestaurantOpen(false);
            }
        } else {
            setIsRestaurantOpen(false);
        }
    };
    
    // Helper function to parse time string like "09:00" to minutes
    const parseTimeString = (timeString) => {
        if (!timeString) return 0;
        
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    };

    // Fetch restaurant schedule
    const fetchSchedule = async (retryCount = 0) => {
        if (retryCount > 2) {
            console.log('Exhausted retry attempts for schedule. Using mock data.');
            const mockData = getMockSchedule();
            setSchedule(mockData);
            updateIsRestaurantOpen(mockData);
            return;
        }

        if (!restaurant) {
            console.log('No restaurant data available for schedule fetch');
            const mockData = getMockSchedule();
            setSchedule(mockData);
            updateIsRestaurantOpen(mockData);
            return;
        }

        // Support both id and _id for flexibility
        const restaurantId = restaurant._id || restaurant.id;
        
        // Don't attempt to fetch if no restaurant ID is available
        if (!restaurantId) {
            console.log('No restaurant ID available for schedule fetch');
            const mockData = getMockSchedule();
            setSchedule(mockData);
            updateIsRestaurantOpen(mockData);
            return;
        }

        setScheduleLoading(true);
        try {
            console.log(`Attempting to fetch schedule (attempt ${retryCount + 1})...`);
            
            // Primary endpoint
            const primaryEndpoint = `${API_URL}/menu-schedule/week/${restaurantId}`;
            console.log(`Trying primary endpoint: ${primaryEndpoint}`);
            
            const response = await axios.get(primaryEndpoint, { timeout: 10000 });
            
            if (response.data && Object.keys(response.data).length > 0) {
                console.log('Schedule fetched successfully from primary endpoint');
                const formattedSchedule = response.data;
                setSchedule(formattedSchedule);
                updateIsRestaurantOpen(formattedSchedule);
            } else {
                throw new Error('Empty schedule data received');
            }
        } catch (error) {
            console.log(`Primary endpoint failed: ${error.message}`);
            
            // Try fallback endpoint
            try {
                const fallbackEndpoint = `${API_URL}/menu-schedule/today/${restaurantId}`;
                console.log(`Trying fallback endpoint: ${fallbackEndpoint}`);
                
                const fallbackResponse = await axios.get(fallbackEndpoint, { timeout: 10000 });
                
                if (fallbackResponse.data) {
                    console.log('Schedule fetched from fallback endpoint');
                    const currentDay = getDayName(getCurrentDayOfWeek());
                    const mockData = getMockSchedule();
                    
                    // Replace just today's data with the actual data
                    mockData[currentDay] = fallbackResponse.data;
                    
                    setSchedule(mockData);
                    updateIsRestaurantOpen(mockData);
                } else {
                    throw new Error('Empty fallback schedule data');
                }
            } catch (fallbackError) {
                console.log(`Fallback endpoint failed: ${fallbackError.message}`);
                console.log(`Retrying schedule fetch (${retryCount + 1}/3)...`);
                
                // Wait before retrying
                setTimeout(() => {
                    fetchSchedule(retryCount + 1);
                }, 1000 * (retryCount + 1)); // Exponential backoff
                return;
            }
        } finally {
            setScheduleLoading(false);
        }
    };

    // Get unique categories from menu items
    const getUniqueCategories = () => {
        return [...new Set(menuItems.map(item => item.category))].filter(Boolean);
    };
    
    // Render a single menu item
    const renderMenuItem = ({ item }) => {
        if (!item) {
            console.log("Skipping null/undefined menu item");
            return null;
        }
        
        console.log("Rendering menu item:", item.name, 
                    "isAvailable:", item.isAvailable, 
                    "isScheduled:", item.isScheduled);
        
        // Ensure item has necessary properties with fallbacks
        const menuItem = {
            _id: item._id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: (item.name && item.name.trim()) || 'Unnamed Item',
            price: item.price || 0,
            description: (item.description && item.description.trim()) || 'No description available',
            isVeg: !!item.isVeg,
            // Force scheduled items to be available
            isAvailable: item.isScheduled ? true : (item.isAvailable !== false),
            mealType: item.mealType || '',
            isScheduled: !!item.isScheduled,
            category: item.category || ''
        };
        
        const cartItem = cartItems.find(ci => ci._id === menuItem._id);
        const isInCart = !!cartItem;
        
        return (
            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => !isInCart && menuItem.isAvailable && addToCart(menuItem, restaurant?._id, restaurant?.name)}
                disabled={!menuItem.isAvailable}
            >
                <View style={styles.menuItemDetails}>
                    <View style={styles.menuItemHeader}>
                        <Text style={styles.menuItemName}>{menuItem.name}</Text>
                        <Text style={styles.menuItemPrice}>₹{menuItem.price}</Text>
                    </View>
                    <Text style={styles.menuItemDescription} numberOfLines={2}>
                        {menuItem.description}
                    </Text>
                    <View style={styles.menuItemMeta}>
                        <View style={[
                            styles.menuItemType,
                            menuItem.isVeg ? styles.vegBadge : styles.nonVegBadge
                        ]}>
                            <Text style={[styles.menuItemTypeText, {color: 'white'}]}>
                                {menuItem.isVeg ? 'Veg' : 'Non-Veg'}
                            </Text>
                        </View>
                        {menuItem.mealType && (
                            <View style={styles.mealTypeBadge}>
                                <Text style={styles.mealTypeText}>{menuItem.mealType}</Text>
                            </View>
                        )}
                        {menuItem.isScheduled && (
                            <View style={styles.scheduledBadge}>
                                <MaterialIcons name="access-time" size={12} color={THEME_COLOR} />
                                <Text style={styles.scheduledText}>Scheduled</Text>
                            </View>
                        )}
                        {!menuItem.isAvailable && (
                            <View style={styles.unavailableBadge}>
                                <Text style={styles.unavailableText}>Unavailable</Text>
                            </View>
                        )}
                    </View>
                    {menuItem.isAvailable && (
                        isInCart ? (
                            <View style={styles.quantityControl}>
                                <TouchableOpacity 
                                    style={styles.quantityButton}
                                    onPress={() => updateItemQuantity(menuItem._id, cartItem.quantity - 1)}
                                >
                                    <Text style={styles.quantityButtonText}>-</Text>
                                </TouchableOpacity>
                                <Text style={styles.quantityText}>{cartItem.quantity}</Text>
                                <TouchableOpacity 
                                    style={styles.quantityButton}
                                    onPress={() => updateItemQuantity(menuItem._id, cartItem.quantity + 1)}
                                >
                                    <Text style={styles.quantityButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => addToCart(menuItem, restaurant?._id, restaurant?.name)}
                            >
                                <Text style={styles.addButtonText}>ADD</Text>
                            </TouchableOpacity>
                        )
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    // Render empty state for menu items
    const renderEmptyMenu = () => {
        if (loading) return null;
        
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                    {error || 'No menu items available for this restaurant.'}
                </Text>
            </View>
        );
    };

    // GroupMenuItems by category for SectionList
    const groupedMenuItems = () => {
        const categories = getUniqueCategories();
        
        return categories.map(category => ({
            title: category,
            data: menuItems.filter(item => item.category === category)
        }));
    };

    // Render header component for the SectionList
    const renderHeader = () => (
        <>
            {/* Restaurant Info - removed banner image */}
            <View style={styles.infoContainer}>
                <View style={styles.nameContainer}>
                    <Text style={styles.restaurantName}>{restaurant?.name || 'Restaurant'}</Text>
                </View>
                
                <Text style={styles.restaurantDescription}>
                    {restaurant?.description || 'No description available'}
                </Text>

                {/* Display time window message if available */}
                {timeWindowMessage ? (
                    <View style={styles.timeWindowContainer}>
                        {/* Time window header */}
                        <View style={styles.timeWindowHeader}>
                            <MaterialIcons name="access-time" size={18} color="#fda535" />
                            <Text style={styles.timeWindowTitle}>Menu Availability</Text>
                        </View>
                        
                        {/* Lunch time window */}
                        <View style={styles.mealTimeWindow}>
                            <Text style={styles.mealTypeTitle}>🍜 Lunch:</Text>
                            <Text style={styles.timeWindowText}>
                                Available from 5:00 PM previous day until 9:00 AM today
                            </Text>
                        </View>
                        
                        {/* Dinner time window */}
                        <View style={styles.mealTimeWindow}>
                            <Text style={styles.mealTypeTitle}>🍲 Dinner:</Text>
                            <Text style={styles.timeWindowText}>
                                Available from 5:00 PM previous day until 6:00 PM today
                            </Text>
                        </View>
                        
                        {/* Early access note */}
                        <View style={styles.earlyAccessNote}>
                            <MaterialIcons name="new-releases" size={16} color="#fda535" />
                            <Text style={styles.earlyAccessText}>
                                Next day's lunch available from 6:00 PM
                            </Text>
                        </View>
                    </View>
                ) : null}
            </View>

            {/* Menu Title */}
            <View style={styles.menuTitleContainer}>
                <Text style={styles.menuTitle}>Menu</Text>
            </View>
            
            {/* Meal type pills */}
            <View style={styles.categoriesContainer}>
                <FlatList
                    horizontal
                    data={['all', 'breakfast', 'lunch', 'dinner']}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryButton,
                                selectedCategory === item ? styles.activeCategory : null,
                                selectedCategory === null && item === 'all' ? styles.activeCategory : null,
                            ]}
                            onPress={() => {
                                if (item === 'all') {
                                    setSelectedCategory(null);
                                } else {
                                    setSelectedCategory(item);
                                }
                            }}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    selectedCategory === item ? styles.activeCategoryText : null,
                                    selectedCategory === null && item === 'all' ? styles.activeCategoryText : null,
                                ]}
                            >
                                {item.charAt(0).toUpperCase() + item.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    )}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                />
            </View>

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={THEME_COLOR} />
                    <Text style={styles.loadingText}>Loading menu items...</Text>
                </View>
            )}
        </>
    );

    // Render the Schedule Modal
    const renderScheduleModal = () => {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const formatDay = (day) => day.charAt(0).toUpperCase() + day.slice(1);
        const today = getDayName(getCurrentDayOfWeek());

        return (
            <Modal
                visible={showSchedule}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowSchedule(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Restaurant Hours</Text>
                            <TouchableOpacity onPress={() => setShowSchedule(false)}>
                                <MaterialIcons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        
                        {scheduleLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={THEME_COLOR} />
                                <Text style={styles.loadingText}>Loading schedule...</Text>
                            </View>
                        ) : !schedule ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No schedule information available</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={days}
                                keyExtractor={(item) => item}
                                renderItem={({ item: day }) => (
                                    <View style={[
                                        styles.scheduleItem, 
                                        today === day && styles.todayScheduleItem
                                    ]}>
                                        <Text style={[
                                            styles.scheduleDay,
                                            today === day && styles.todayText
                                        ]}>
                                            {formatDay(day)}
                                            {today === day && ' (Today)'}
                                        </Text>
                                        {schedule[day]?.isOpen ? (
                                            <Text style={styles.scheduleTime}>
                                                {formatTime(schedule[day].openTime)} - {formatTime(schedule[day].closeTime)}
                                            </Text>
                                        ) : (
                                            <Text style={styles.scheduleClosed}>Closed</Text>
                                        )}
                                    </View>
                                )}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        );
    };

    // Format time for schedule display (e.g., "9:00 AM")
    const formatTime = (timeString) => {
        if (!timeString) return '';
        
        try {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const formattedHour = hour % 12 || 12;
            
            return `${formattedHour}:${minutes} ${ampm}`;
        } catch (err) {
            console.error('Error formatting time:', err);
            return timeString;
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {restaurant?.name || 'Restaurant Details'}
                </Text>
                <View style={styles.headerRight} />
            </View>

            {/* Menu Items List */}
            <FlatList
                data={selectedCategory 
                    ? menuItems.filter(item => item.mealType && item.mealType.toLowerCase() === selectedCategory.toLowerCase())
                    : menuItems}
                keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
                renderItem={renderMenuItem}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyMenu}
                contentContainerStyle={styles.menuList}
                // Add extra padding at the bottom to account for the cart tab
                contentInset={{ bottom: cartItems.length > 0 ? 70 : 0 }}
            />

            {/* Schedule Modal */}
            {renderScheduleModal()}
            
            {/* Bottom Cart Tab */}
            <CartTab restaurant={restaurant} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        elevation: 2,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        textAlign: 'center',
    },
    headerRight: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    banner: {
        width: '100%',
        height: 200,
    },
    placeholderBanner: {
        width: '100%',
        height: 200,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#999',
        fontSize: 16,
    },
    infoContainer: {
        padding: 16,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    restaurantName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    badgeContainer: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: THEME_COLOR,
        marginBottom: 4,
    },
    closedBadge: {
        backgroundColor: '#FF5252',
    },
    notAcceptingBadge: {
        backgroundColor: '#FFC107',
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    restaurantDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        lineHeight: 20,
    },
    scheduleButton: {
        backgroundColor: 'transparent',
        borderColor: THEME_COLOR,
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    scheduleButtonText: {
        color: THEME_COLOR,
        fontWeight: '600',
    },
    categoriesContainer: {
        marginVertical: 16,
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    activeCategory: {
        backgroundColor: THEME_COLOR,
    },
    categoryText: {
        fontSize: 14,
        color: '#666',
    },
    activeCategoryText: {
        color: 'white',
        fontWeight: 'bold',
    },
    menuTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 16,
    },
    menuTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    menuList: {
        paddingBottom: 80, // Extra padding to account for the cart tab
    },
    menuItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#eee',
    },
    menuItemDetails: {
        flex: 1,
        justifyContent: 'space-between',
    },
    menuItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    menuItemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    menuItemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: THEME_COLOR,
        marginLeft: 8,
    },
    menuItemDescription: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
        marginBottom: 8,
    },
    menuItemMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    menuItemType: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: 8,
        marginBottom: 4,
    },
    vegBadge: {
        backgroundColor: 'green',
    },
    nonVegBadge: {
        backgroundColor: 'red',
    },
    menuItemTypeText: {
        fontSize: 12,
        color: 'white',
        fontWeight: 'bold',
    },
    mealTypeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        backgroundColor: '#f0f0f0',
        marginRight: 8,
    },
    mealTypeText: {
        fontSize: 12,
        color: '#666',
    },
    unavailableBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        backgroundColor: '#FF5252',
    },
    unavailableText: {
        fontSize: 12,
        color: 'white',
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: THEME_COLOR,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        alignSelf: 'flex-end',
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    scheduleItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    scheduleDay: {
        fontSize: 16,
        color: '#333',
    },
    todayScheduleItem: {
        backgroundColor: '#f0f0f0',
    },
    todayText: {
        fontWeight: 'bold',
    },
    scheduleTime: {
        fontSize: 16,
        color: '#666',
    },
    scheduleClosed: {
        fontSize: 16,
        color: 'red',
    },
    timeWindowContainer: {
        backgroundColor: 'rgba(253, 165, 53, 0.1)',
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 16,
        marginVertical: 12,
    },
    timeWindowHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    timeWindowTitle: {
        color: '#fda535',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    mealTimeWindow: {
        marginLeft: 4,
        marginBottom: 4,
    },
    mealTypeTitle: {
        color: '#333',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    timeWindowText: {
        color: '#666',
        fontSize: 12,
        marginLeft: 4,
    },
    earlyAccessNote: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        backgroundColor: 'rgba(253, 165, 53, 0.2)',
        padding: 8,
        borderRadius: 4,
    },
    earlyAccessText: {
        color: '#fda535',
        fontSize: 12,
        marginLeft: 6,
        fontWeight: '500',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#FFFFFF',
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    viewCartButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: THEME_COLOR,
    },
    viewCartText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    cartTotal: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    scheduledBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        backgroundColor: 'rgba(253, 165, 53, 0.2)',
        marginLeft: 8,
    },
    scheduledText: {
        fontSize: 10,
        color: '#fda535',
        fontWeight: 'bold',
        marginLeft: 2,
    },
    // Quantity controls for menu items
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
    },
    quantityButton: {
        backgroundColor: THEME_COLOR,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    quantityText: {
        marginHorizontal: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default RestaurantDetailsScreen;