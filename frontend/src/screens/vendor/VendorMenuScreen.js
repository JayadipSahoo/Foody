import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    ScrollView,
    Alert,
    TextInput,
    RefreshControl,
    StatusBar,
    Platform,
    Animated
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useVendorStore } from '../../store/vendorStore';
import { useFocusEffect } from '@react-navigation/native';

const THEME_COLOR = '#FF9F6A';

const VendorMenuScreen = ({ navigation }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredItems, setFilteredItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'breakfast', 'lunch', 'dinner'
    const [showSuccessBanner, setShowSuccessBanner] = useState(false);
    const successOpacity = new Animated.Value(0);
    
    // Get functions from vendor store - use correct function names from vendorStore
    const { 
        fetchMenuItems,
        createMenuItem,
        updateMenuItem,
        toggleItemAvailability,
        menuItems: storeMenuItems,
        isLoading: storeIsLoading,
        error: storeError,
        vendorData,
        fetchVendorProfile
    } = useVendorStore();

    // Fetch vendor data and menu items on initial load
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // Fetch vendor profile first to get the latest isAcceptingOrders status
                await fetchVendorProfile({ force: true });
                await fetchMenuItems({ force: true });
            } catch (err) {
                setError('Failed to load data. Please try again.');
                console.error('Error fetching data:', err);
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        };
        
        fetchData();
    }, [fetchVendorProfile, fetchMenuItems]);

    // Fetch menu items function
    const getMenuItems = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            // Also refresh the vendor profile to get the latest status
            await fetchVendorProfile({ force: true });
            await fetchMenuItems({ force: true });
        } catch (err) {
            setError('Failed to load menu items. Please try again.');
            console.error('Error fetching menu items:', err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [fetchMenuItems, fetchVendorProfile]);

    // Update local state when store data changes
    useEffect(() => {
        if (storeMenuItems && storeMenuItems.length > 0) {
            setMenuItems(storeMenuItems);
            setFilteredItems(storeMenuItems);
            setError(null);
        } else if (storeError) {
            setError(storeError);
        }
        
        if (!storeIsLoading) {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [storeMenuItems, storeError, storeIsLoading]);
    
    // Fetch on initial load
    useEffect(() => {
        getMenuItems();
    }, [getMenuItems]);

    // Handle refresh
    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        getMenuItems();
    }, [getMenuItems]);

    // Handle save item
    const handleSaveItem = useCallback(async (item) => {
        // Validate required fields
        if (!item.name || !item.price) {
            Alert.alert('Error', 'Name and price are required');
            return;
        }

        try {
            if (item._id) {
                // Update existing item - use correct function name
                await updateMenuItem(item._id, item);
            } else {
                // Create new item - use correct function name
                await createMenuItem(item);
            }
            // Refresh menu items
            getMenuItems();
        } catch (error) {
            console.error('Error saving menu item:', error);
            Alert.alert('Error', 'Failed to save menu item: ' + (error.message || 'Unknown error'));
        }
    }, [createMenuItem, updateMenuItem, getMenuItems]);

    // Handle toggle availability
    const handleToggleAvailability = useCallback(async (itemId) => {
        try {
            // Use correct function name
            await toggleItemAvailability(itemId);
            // Refresh menu items
            getMenuItems();
        } catch (error) {
            console.error('Error toggling availability:', error);
            Alert.alert('Error', 'Failed to update item availability');
        }
    }, [toggleItemAvailability, getMenuItems]);

    // Combined effect for filtering by search and meal type
    useEffect(() => {
        if (menuItems.length > 0) {
            let filtered = [...menuItems];
            
            // First filter by meal type tab
            if (activeTab !== 'all') {
                filtered = filtered.filter(item => item.mealType === activeTab);
            }
            
            // Then apply search filter if any
        if (searchQuery) {
                filtered = filtered.filter(item => 
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
                );
            }
            
            setFilteredItems(filtered);
        }
    }, [searchQuery, menuItems, activeTab]);

    // Determine if the store is actually accepting orders based on vendor data
    // Only consider the store open if we have explicitly confirmed it's accepting orders
    const isStoreOpen = vendorData && vendorData.isAcceptingOrders === true;

    // Show success banner when store is open
    useEffect(() => {
        if (isStoreOpen && !isLoading) {
            setShowSuccessBanner(true);
            
            // Animate banner in
            Animated.timing(successOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
            }).start();
            
            // Hide banner after 3 seconds
            const timer = setTimeout(() => {
                Animated.timing(successOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true
                }).start(() => {
                    setShowSuccessBanner(false);
                });
            }, 3000);
            
            return () => clearTimeout(timer);
        }
    }, [isStoreOpen, isLoading, successOpacity]);

    // Add a focus effect to refresh data when the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            // Refresh vendor profile and menu items when screen is focused
            const refreshData = async () => {
                try {
                    // No need to set loading state here to avoid flash
                    await fetchVendorProfile({ force: true });
                    // Only refresh menu items if they haven't been loaded yet
                    if (menuItems.length === 0) {
                        await fetchMenuItems({ force: true });
                    }
                } catch (err) {
                    console.error('Error refreshing data on focus:', err);
                }
            };
            
            refreshData();
            
            // Return cleanup function
            return () => {};
        }, [fetchVendorProfile, fetchMenuItems, menuItems.length])
    );

    const renderMenuItem = useCallback(({ item }) => (
        <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('EditMenuItem', { 
                item,
                onSave: handleSaveItem
            })}
        >
            <View style={styles.menuItemContent}>
                <Text style={styles.itemCategory}>
                    {item.mealType ? item.mealType.charAt(0).toUpperCase() + item.mealType.slice(1) : 'Lunch'}
                </Text>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.description || 'No description'}
                </Text>
               
                        </View>
            <View style={styles.priceContainer}>
                <Text style={styles.itemPrice}>₹{parseFloat(item.price).toFixed(2)}</Text>
                <TouchableOpacity 
                    style={[
                        styles.availabilityButton, 
                        { backgroundColor: item.isAvailable ? THEME_COLOR : '#ccc' }
                    ]}
                    onPress={() => handleToggleAvailability(item._id)}
                >
                    <Text style={styles.availabilityButtonText}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                    </Text>
                </TouchableOpacity>
                        </View>
        </TouchableOpacity>
    ), [handleSaveItem, handleToggleAvailability, navigation]);
    
    // Handle tab change
    const handleTabChange = useCallback((tabName) => {
        setActiveTab(tabName);
    }, []);

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
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                    </TouchableOpacity>
                        <Text style={styles.title}>My Food List</Text>
                        <View style={{ width: 24 }} />
                    </View>
                    
                    {/* Show a success banner briefly when store is open */}
                    {showSuccessBanner && (
                        <Animated.View 
                            style={[
                                styles.statusBanner, 
                                { backgroundColor: '#4CAF50' },
                                { opacity: successOpacity }
                            ]}
                        >
                            <MaterialCommunityIcons name="store-check" size={20} color="#fff" />
                            <Text style={styles.statusBannerText}>
                                Your store is open! Items marked as available will be shown to customers.
                            </Text>
                    <TouchableOpacity 
                                style={styles.statusBannerButton}
                                onPress={() => navigation.navigate('VendorScheduleScreen')}
                            >
                                <Text style={styles.statusBannerButtonText}>Manage</Text>
                    </TouchableOpacity>
                        </Animated.View>
                    )}
                    
                    {/* Only show the closed banner when the store is closed */}
                    {!isStoreOpen && (
                        <View style={[
                            styles.statusBanner, 
                            { backgroundColor: '#f44336' }
                        ]}>
                            <MaterialCommunityIcons name="store-off" size={20} color="#fff" />
                            <Text style={styles.statusBannerText}>
                                Your store is closed. No orders can be placed regardless of item availability.
                            </Text>
                    <TouchableOpacity 
                                style={styles.statusBannerButton}
                                onPress={() => navigation.navigate('VendorScheduleScreen')}
                            >
                                <Text style={styles.statusBannerButtonText}>Open Store</Text>
                    </TouchableOpacity>
                </View>
                    )}

                    <View style={styles.tabContainer}>
        <TouchableOpacity 
                            style={[styles.tabButton, activeTab === 'all' && styles.activeTab]}
                            onPress={() => handleTabChange('all')}
                        >
                            <Text style={activeTab === 'all' ? styles.activeTabText : styles.tabText}>All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.tabButton, activeTab === 'breakfast' && styles.activeTab]}
                            onPress={() => handleTabChange('breakfast')}
                        >
                            <Text style={activeTab === 'breakfast' ? styles.activeTabText : styles.tabText}>Breakfast</Text>
        </TouchableOpacity>
                    <TouchableOpacity 
                            style={[styles.tabButton, activeTab === 'lunch' && styles.activeTab]}
                            onPress={() => handleTabChange('lunch')}
                    >
                            <Text style={activeTab === 'lunch' ? styles.activeTabText : styles.tabText}>Lunch</Text>
                    </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.tabButton, activeTab === 'dinner' && styles.activeTab]}
                            onPress={() => handleTabChange('dinner')}
                        >
                            <Text style={activeTab === 'dinner' ? styles.activeTabText : styles.tabText}>Dinner</Text>
                    </TouchableOpacity>
            </View>
                    
                    <Text style={styles.totalItems}>Total {filteredItems.length} Items</Text>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

                    {isLoading ? (
                <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={THEME_COLOR} />
                </View>
                    ) : error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={getMenuItems}>
                                <Text style={styles.retryButtonText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : filteredItems.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="food-off" size={64} color="#ddd" />
                            <Text style={styles.emptyText}>No menu items found</Text>
                            <Text style={styles.emptySubText}>
                                {searchQuery ? 'Try a different search term' : activeTab !== 'all' ? `No ${activeTab} items found` : 'Add your first menu item'}
                            </Text>
                            {!searchQuery && (
                                <TouchableOpacity
                                    style={styles.addFirstItemButton}
                                    onPress={() => navigation.navigate('EditMenuItem', { 
                                        onSave: handleSaveItem,
                                        item: activeTab !== 'all' ? { mealType: activeTab } : undefined
                                    })}
                                >
                                    <Text style={styles.addFirstItemButtonText}>Add Item</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                <FlatList
                    data={filteredItems}
                    renderItem={renderMenuItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.menuList}
                    refreshControl={
                                <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} 
                                    colors={[THEME_COLOR]}
                                    tintColor={THEME_COLOR}
                        />
                    }
                />
                    )}
                    
                    <View style={styles.floatingButtonContainer}>
            <TouchableOpacity 
                            style={styles.floatingButton}
                            onPress={() => navigation.navigate('EditMenuItem', { 
                                onSave: handleSaveItem,
                                item: activeTab !== 'all' ? { mealType: activeTab } : undefined
                            })}
            >
                <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                            </View>
        </SafeAreaView>
        </>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    tabButton: {
        marginRight: 20,
        paddingBottom: 8,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: THEME_COLOR,
    },
    tabText: {
        color: '#999',
        fontSize: 16,
    },
    activeTabText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalItems: {
        fontSize: 14,
        color: '#666',
        marginLeft: 16,
        marginBottom: 8,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    searchInput: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
    },
    menuList: {
        padding: 16,
    },
    menuItem: {
        flexDirection: 'row',
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    menuItemContent: {
        flex: 1,
    },
    itemCategory: {
        fontSize: 12,
        color: '#FFFFFF',
        backgroundColor: THEME_COLOR,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 6,
    },
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 6,
    },
    itemDescription: {
        color: '#666',
        marginBottom: 8,
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        marginLeft: 4,
        color: '#666',
        fontSize: 12,
    },
    pickupText: {
        color: '#666',
        fontSize: 12,
    },
    priceContainer: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingLeft: 10,
    },
    itemPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    availabilityButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5
    },
    availabilityButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
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
        marginBottom: 20,
        fontSize: 16,
        color: '#F44336',
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: THEME_COLOR,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#333',
        textAlign: 'center',
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginTop: 8,
    },
    addFirstItemButton: {
        backgroundColor: THEME_COLOR,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 20,
    },
    addFirstItemButtonText: {
        color: 'white',
        fontSize: 16,
    },
    floatingButtonContainer: {
        position: 'absolute',
        right: 20,
        bottom: 20,
    },
    floatingButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: THEME_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginHorizontal: 15,
        marginBottom: 10,
        borderRadius: 8,
    },
    statusBannerText: {
        flex: 1,
        color: '#fff',
        marginLeft: 8,
        fontSize: 13,
    },
    statusBannerButton: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 4,
    },
    statusBannerButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
});

export default VendorMenuScreen;