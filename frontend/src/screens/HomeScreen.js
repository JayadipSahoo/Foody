import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Image,
    FlatList,
    Modal,
} from "react-native";
import useAuthStore from "../store/authStore";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from 'axios';
import { API_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserStore from "../store/userStore";

const HomeScreen = () => {
    const { user, userType, logout } = useAuthStore();
    const { 
        notificationCount, 
        lastOrderedLocation, 
        setLastOrderedLocation,
        initUserData
    } = useUserStore();
    const navigation = useNavigation();
    const [locationQuery, setLocationQuery] = useState("");
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [availableLocations, setAvailableLocations] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [restaurants, setRestaurants] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Initialize user data when component mounts
    useEffect(() => {
        initUserData();
    }, []);

    // Set default location from last ordered location if available
    useEffect(() => {
        if (lastOrderedLocation && !selectedLocation) {
            setSelectedLocation(lastOrderedLocation);
            setLocationQuery(lastOrderedLocation);
        }
    }, [lastOrderedLocation]);

    // Load saved location on initial render
    useEffect(() => {
        const loadSavedLocation = async () => {
            try {
                const savedLocation = await AsyncStorage.getItem('userSelectedLocation');
                if (savedLocation) {
                    setSelectedLocation(savedLocation);
                    setLocationQuery(savedLocation);
                } else if (user?.defaultLocation) {
                    // If no saved location but user has defaultLocation, use that
                    setSelectedLocation(user.defaultLocation);
                    setLocationQuery(user.defaultLocation);
                }
            } catch (error) {
                console.error('Error loading saved location:', error);
            }
        };
        
        loadSavedLocation();
        // Fetch available locations from vendor schema
        fetchAvailableLocations();
    }, []);

    // Fetch restaurants when a location is selected
    useEffect(() => {
        if (selectedLocation) {
            fetchRestaurantsByLocation(selectedLocation);
        }
    }, [selectedLocation]);

    useEffect(() => {
        // Filter locations based on query
        if (locationQuery.trim() === '') {
            setFilteredLocations([]);
        } else {
            const filtered = availableLocations.filter(location => 
                location.toLowerCase().includes(locationQuery.toLowerCase())
            );
            setFilteredLocations(filtered);
        }
    }, [locationQuery, availableLocations]);

    const fetchAvailableLocations = async () => {
        try {
            setIsLoading(true);
            // In a real implementation, fetch actual locations from backend
            // const response = await axios.get(`${API_URL}/api/vendors/locations`);
            // setAvailableLocations(response.data);
            
            // Mock data
            setTimeout(() => {
                setAvailableLocations([
                    "IIIT Bhubaneswar",
                    "KIIT Campus",
                    "Silicon Institute",
                    "SOA University",
                    "Utkal University",
                    "CET Bhubaneswar",
                    "Infocity Area",
                    "Patia",
                    "Chandrasekharpur",
                    "Acharya Vihar"
                ]);
                setIsLoading(false);
            }, 500);
        } catch (error) {
            console.error('Error fetching locations:', error);
            setIsLoading(false);
        }
    };

    const fetchRestaurantsByLocation = async (location) => {
        try {
            setIsLoading(true);
            
            // Use the correct endpoint URL matching the backend route in index.js
            const response = await axios.get(`${API_URL}/vendor/by-location?location=${encodeURIComponent(location)}`);
            
            // Process the response properly
            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                setRestaurants(response.data.data);
            } else {
                setRestaurants([]);
            }
            
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            setIsLoading(false);
            
            // If in development mode, use fallback data for testing
            if (process.env.NODE_ENV === 'development') {
                if (location === "IIIT Bhubaneswar") {
                    setRestaurants([
                        {
                            id: 1,
                            name: "Aunty IIIT Lunch Dinner",
                            description: "Veg, Non-Veg Meals and Tiffin Service",
                            rating: 4.7,
                        },
                        {
                            id: 3,
                            name: "IIIT Campus Cafe",
                            description: "Coffee, Snacks, Quick Bites",
                            rating: 4.2,
                        }
                    ]);
                } else {
                    setRestaurants([
                        {
                            id: 2,
                            name: "Chai Lelo Paratha",
                            description: "Dinner Veg",
                            rating: 4.5,
                        },
                        {
                            id: 4,
                            name: location + " Food Corner",
                            description: "Local cuisine",
                            rating: 4.0,
                        }
                    ]);
                }
            }
        }
    };

    const handleLocationSelect = (location) => {
        setSelectedLocation(location);
        setLocationQuery(location);
        setShowLocationDropdown(false);
        
        // Save as last ordered location
        setLastOrderedLocation(location);
        
        // Filter restaurants based on location
        fetchRestaurantsByLocation(location);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }]
            });
        } catch (error) {
            console.error("Logout Failed", error);
        }
    };

    const getTimeOfDay = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Morning";
        if (hour < 18) return "Afternoon";
        return "Evening";
    };

    // Render the location dropdown outside of the ScrollView
    const renderLocationDropdown = () => {
        if (showLocationDropdown && filteredLocations.length > 0) {
            return (
                <View style={styles.dropdownContainer}>
                    <FlatList
                        data={filteredLocations}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                style={styles.dropdownItem}
                                onPress={() => handleLocationSelect(item)}
                            >
                                <Ionicons name="location" size={18} color="#FFA726" />
                                <Text style={styles.dropdownText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                        style={styles.dropdown}
                    />
                </View>
            );
        }
        return null;
    };

    // Navigate to notification screen
    const goToNotifications = () => {
        navigation.navigate('Notifications');
    };
    
    // Navigate to profile screen
    const goToProfile = () => {
        navigation.navigate('Profile');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={goToProfile}>
                    <View style={styles.profileButton}>
                        <Text style={styles.profileButtonText}>
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </Text>
                    </View>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.notificationContainer} onPress={goToNotifications}>
                    <Ionicons name="notifications-outline" size={28} color="#333" />
                    {notificationCount > 0 && (
                        <View style={styles.notificationBadge}>
                            <Text style={styles.notificationCount}>
                                {notificationCount > 99 ? '99+' : notificationCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.locationWrapper}>
                <Text style={styles.greeting}>
                    Hey {user?.name?.split(' ')[0] || 'there'}, Good {getTimeOfDay()}!
                </Text>

                <View style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={22} color="#999" style={styles.locationIcon} />
                    <TextInput
                        style={styles.locationInput}
                        placeholder="Select delivery location..."
                        placeholderTextColor="#999"
                        value={locationQuery}
                        onChangeText={(text) => {
                            setLocationQuery(text);
                            setShowLocationDropdown(true);
                        }}
                        onFocus={() => setShowLocationDropdown(true)}
                    />
                    {locationQuery.length > 0 && (
                        <TouchableOpacity 
                            style={styles.clearButton}
                            onPress={() => {
                                setLocationQuery('');
                                setSelectedLocation(null);
                            }}
                        >
                            <Ionicons name="close-circle" size={20} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>
                
                {renderLocationDropdown()}
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                    {selectedLocation ? `Restaurants delivering to ${selectedLocation}` : "Restaurants Available Near You"}
                </Text>
                <TouchableOpacity>
                    <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={restaurants}
                keyExtractor={item => item.id ? item.id.toString() : Math.random().toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={styles.restaurantCard}
                        onPress={() => navigation.navigate('RestaurantDetails', { restaurant: item })}
                    >
                        <View style={styles.restaurantImage} />
                        <View style={styles.restaurantInfo}>
                            <Text style={styles.restaurantName}>{item.name}</Text>
                            <Text style={styles.restaurantDescription}>{item.description}</Text>
                            <View style={styles.restaurantMeta}>
                                <View style={styles.ratingContainer}>
                                    <Ionicons name="star" size={16} color="#FFC107" />
                                    <Text style={styles.rating}>{item.rating}</Text>
                                </View>
                                <Text 
                                    style={[
                                        styles.statusBadge, 
                                        item.isAcceptingOrders ? styles.open : styles.closed
                                    ]}
                                >
                                    {item.isAcceptingOrders ? 'Open' : 'Closed'}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.restaurantList}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {isLoading 
                                ? "Loading restaurants..." 
                                : selectedLocation 
                                    ? `No restaurants available in ${selectedLocation}` 
                                    : "Select a location to see available restaurants"}
                        </Text>
                    </View>
                }
            />
            
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FF9F6A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    notificationContainer: {
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FF5252',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    notificationCount: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    locationWrapper: {
        paddingHorizontal: 20,
        zIndex: 2,
    },
    greeting: {
        fontSize: 24,
        fontWeight: "600",
        marginBottom: 20,
        marginTop: 10,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EAEAEA',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 10,
        height: 50,
        position: 'relative',
    },
    locationIcon: {
        marginRight: 10,
    },
    locationInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    clearButton: {
        padding: 5,
    },
    dropdownContainer: {
        width: '100%',
        zIndex: 2,
        marginBottom: 15,
    },
    dropdown: {
        backgroundColor: '#fff',
        borderRadius: 12,
        maxHeight: 200,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dropdownText: {
        fontSize: 16,
        marginLeft: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
        zIndex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    seeAllText: {
        fontSize: 16,
        color: '#FFA726',
    },
    restaurantList: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    restaurantCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    restaurantImage: {
        width: 120,
        backgroundColor: '#ddd',
    },
    restaurantInfo: {
        padding: 12,
        flex: 1,
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    restaurantDescription: {
        fontSize: 14,
        color: '#888',
        marginBottom: 8,
    },
    restaurantMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    rating: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: '500',
    },
    statusBadge: {
        backgroundColor: '#FFA726',
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        padding: 4,
        borderRadius: 4,
        marginLeft: 10,
    },
    open: {
        backgroundColor: '#4CAF50',
    },
    closed: {
        backgroundColor: '#f44336',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});

export default HomeScreen;
