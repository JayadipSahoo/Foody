import React, { useState, useEffect } from 'react';
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
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../config/constants';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Remove the flag that forces mock data for local IPs
// const USE_MOCK_DATA = !API_URL || API_URL.includes('192.168.') || API_URL.includes('localhost');
// Instead, only use mock when API_URL is completely missing
const USE_MOCK_DATA = !API_URL;

const THEME_COLOR = '#FF9F6A';

const RestaurantDetailsScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    
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
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showSchedule, setShowSchedule] = useState(false);
    const [schedule, setSchedule] = useState(null);
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [isRestaurantOpen, setIsRestaurantOpen] = useState(false);
    const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);
    const [showCart, setShowCart] = useState(false);

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
            // First try the public endpoint
            const url = `${API_URL}/public/menu/vendor/${restaurantId}`;
            console.log('Calling API URL:', url);
            
            const response = await axios.get(url, { timeout: 10000 });
            
            // Log the response data for debugging
            console.log('Menu items response:', response.data);
            
            if (Array.isArray(response.data)) {
                console.log('Setting menu items array:', response.data.length, 'items');
                setMenuItems(response.data);
            } else if (response.data && response.data.items) {
                // If API returns an object with items property
                console.log('Setting menu items from object.items:', response.data.items.length, 'items');
                setMenuItems(response.data.items);
            } else if (response.data) {
                // Any other structure, try to use the data directly
                console.log('Setting menu items from response.data');
                setMenuItems(response.data);
            } else {
                // Empty or null response
                console.log('Empty response, using mock data');
                setMenuItems(getMockMenuItems());
            }
        } catch (err) {
            console.error('Error fetching menu items:', err);
            console.error('Error details:', err.response ? err.response.data : 'No response data');
            
            // Try alternative endpoint if this is the first attempt
            if (retryCount === 0) {
                console.log('Trying alternative endpoint for menu items...');
                try {
                    // Try direct menu route as fallback
                    const fallbackUrl = `${API_URL}/menu/vendor/${restaurantId}`;
                    console.log('Calling fallback API URL:', fallbackUrl);
                    
                    const fallbackResponse = await axios.get(fallbackUrl, { timeout: 10000 });
                    if (Array.isArray(fallbackResponse.data)) {
                        setMenuItems(fallbackResponse.data);
                        setLoading(false);
                        return;
                    }
                } catch (fallbackErr) {
                    console.error('Fallback also failed:', fallbackErr);
                }
                
                // If we get here, try once more with retry count incremented
                return fetchMenuItems(retryCount + 1);
            }
            
            setError('Unable to load menu items. Please try again later.');
            
            // Set mock data as last resort
            console.log('Using mock data due to error');
            const mockData = getMockMenuItems();
            console.log('Mock data:', mockData);
            setMenuItems(mockData);
        } finally {
            setLoading(false);
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
    
    // Add item to cart
    const addToCart = (item) => {
        // Only check if accepting orders, ignore restaurant open/closed status
        if (!isAcceptingOrders) {
            Alert.alert('Not Accepting Orders', 'This restaurant is not accepting orders at the moment.');
            return;
        }
        
        // Check if item already in cart
        const existingItem = cartItems.find(cartItem => cartItem._id === item._id);
        
        if (existingItem) {
            // Increase quantity
            setCartItems(cartItems.map(cartItem => 
                cartItem._id === item._id 
                    ? {...cartItem, quantity: cartItem.quantity + 1} 
                    : cartItem
            ));
        } else {
            // Add new item
            setCartItems([...cartItems, {...item, quantity: 1}]);
        }
        
        Alert.alert('Added to Cart', `${item.name} has been added to your cart.`);
    };
    
    // Calculate total cart price
    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };
    
    // Remove item from cart
    const removeFromCart = (itemId) => {
        setCartItems(cartItems.filter(item => item._id !== itemId));
    };
    
    // Update item quantity in cart
    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity === 0) {
            removeFromCart(itemId);
            return;
        }
        
        setCartItems(cartItems.map(item => 
            item._id === itemId ? {...item, quantity: newQuantity} : item
        ));
    };
    
    // Proceed to checkout
    const proceedToCheckout = () => {
        if (cartItems.length === 0) {
            Alert.alert('Empty Cart', 'Please add items to your cart before checking out.');
            return;
        }
        
        // Navigate to checkout screen with cart items
        navigation.navigate('Checkout', {
            restaurant,
            cartItems,
            total: getCartTotal()
        });
    };

    // Render a single menu item
    const renderMenuItem = ({ item }) => {
        if (!item) return null;
        
        return (
            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => addToCart(item)}
                disabled={!item.isAvailable}
            >
                <View style={styles.menuItemDetails}>
                    <View style={styles.menuItemHeader}>
                        <Text style={styles.menuItemName}>{item.name}</Text>
                        <Text style={styles.menuItemPrice}>₹{item.price}</Text>
                    </View>
                    <Text style={styles.menuItemDescription} numberOfLines={2}>
                        {item.description || 'No description available'}
                    </Text>
                    <View style={styles.menuItemMeta}>
                        <View style={[
                            styles.menuItemType,
                            item.isVeg ? styles.vegBadge : styles.nonVegBadge
                        ]}>
                            <Text style={[styles.menuItemTypeText, {color: 'white'}]}>
                                {item.isVeg ? 'Veg' : 'Non-Veg'}
                            </Text>
                        </View>
                        {item.mealType && (
                            <View style={styles.mealTypeBadge}>
                                <Text style={styles.mealTypeText}>{item.mealType}</Text>
                            </View>
                        )}
                        {!item.isAvailable && (
                            <View style={styles.unavailableBadge}>
                                <Text style={styles.unavailableText}>Unavailable</Text>
                            </View>
                        )}
                    </View>
                    {item.isAvailable && (
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => addToCart(item)}
                        >
                            <Text style={styles.addButtonText}>ADD</Text>
                        </TouchableOpacity>
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
            </View>

            {/* Menu Title */}
            <View style={styles.menuTitleContainer}>
                <Text style={styles.menuTitle}>Menu</Text>
                {cartItems.length > 0 && (
                    <TouchableOpacity 
                        style={styles.viewCartButton}
                        onPress={() => setShowCart(true)}
                    >
                        <Text style={styles.viewCartText}>
                            View Cart ({cartItems.reduce((total, item) => total + item.quantity, 0)})
                        </Text>
                    </TouchableOpacity>
                )}
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

    // Render Cart Modal
    const renderCartModal = () => (
        <Modal
            visible={showCart}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowCart(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Your Cart</Text>
                        <TouchableOpacity onPress={() => setShowCart(false)}>
                            <MaterialIcons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>
                    
                    {cartItems.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Your cart is empty</Text>
                        </View>
                    ) : (
                        <>
                            <FlatList
                                data={cartItems}
                                keyExtractor={(item) => item._id}
                                renderItem={({ item }) => (
                                    <View style={styles.cartItem}>
                                        <View style={styles.cartItemInfo}>
                                            <Text style={styles.cartItemName}>{item.name}</Text>
                                            <Text style={styles.cartItemPrice}>₹{item.price}</Text>
                                        </View>
                                        <View style={styles.cartItemQuantity}>
                                            <TouchableOpacity
                                                style={styles.quantityButton}
                                                onPress={() => updateQuantity(item._id, item.quantity - 1)}>
                                                <Text style={styles.quantityButtonText}>-</Text>
                                            </TouchableOpacity>
                                            <Text style={styles.quantityText}>{item.quantity}</Text>
                                            <TouchableOpacity
                                                style={styles.quantityButton}
                                                onPress={() => updateQuantity(item._id, item.quantity + 1)}>
                                                <Text style={styles.quantityButtonText}>+</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            />
                            
                            <View style={styles.cartTotal}>
                                <Text style={styles.cartTotalText}>Total:</Text>
                                <Text style={styles.cartTotalAmount}>₹{getCartTotal()}</Text>
                            </View>
                            
                            <TouchableOpacity
                                style={styles.checkoutButton}
                                onPress={() => {
                                    setShowCart(false);
                                    proceedToCheckout();
                                }}>
                                <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );

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
                <View style={styles.headerRight}>
                    {cartItems.length > 0 && (
                        <TouchableOpacity onPress={() => setShowCart(true)}>
                            <View style={styles.cartIconContainer}>
                                <MaterialIcons name="shopping-cart" size={24} color="#000" />
                                <View style={styles.cartBadge}>
                                    <Text style={styles.cartBadgeText}>{cartItems.reduce((total, item) => total + item.quantity, 0)}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Always show menu items, even while loading */}
            <FlatList
                data={selectedCategory 
                    ? menuItems.filter(item => item.mealType && item.mealType.toLowerCase() === selectedCategory.toLowerCase())
                    : menuItems}
                keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
                renderItem={renderMenuItem}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyMenu}
                contentContainerStyle={styles.menuList}
            />

            {/* Schedule Modal */}
            {renderScheduleModal()}
            
            {/* Cart Modal */}
            {renderCartModal()}
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
    cartIconContainer: {
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        right: -8,
        top: -8,
        backgroundColor: THEME_COLOR,
        borderRadius: 10,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
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
        paddingHorizontal: 16,
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
    viewCartButton: {
        backgroundColor: THEME_COLOR,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    viewCartText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    menuList: {
        paddingBottom: 16,
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
    cartItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    cartItemInfo: {
        flex: 1,
    },
    cartItemName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    cartItemPrice: {
        fontSize: 16,
        color: THEME_COLOR,
        fontWeight: 'bold',
    },
    cartItemQuantity: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        backgroundColor: '#f0f0f0',
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    quantityText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 10,
    },
    cartTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    cartTotalText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    cartTotalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: THEME_COLOR,
    },
    checkoutButton: {
        backgroundColor: THEME_COLOR,
        marginHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default RestaurantDetailsScreen; 