import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import 'react-native-gesture-handler';
import { useCart } from '../context/CartContext';
import { PreferencesContext } from '../context/PreferencesContext';

const { width } = Dimensions.get('window');

export default function RestaurantDetailsScreen({ route, navigation }) {
    const [selectedCategory, setSelectedCategory] = useState('Dinner');
    const { addToCart, removeFromCart, getItemQuantity, getItemCount } = useCart();
    const { isVegOnly } = useContext(PreferencesContext);
    const restaurant = route.params?.restaurant;
    const { menu } = restaurant;

    // Filter menu categories to only show categories that have items (after veg filtering)
    const filteredMenu = {};
    Object.keys(menu).forEach(category => {
        const filteredItems = menu[category].filter(item => !isVegOnly || item.isVeg);
        if (filteredItems.length > 0) {
            filteredMenu[category] = filteredItems;
        }
    });
    
    const menuCategories = Object.keys(filteredMenu);

    // If the selected category is not in filtered menu, select the first available category
    if (menuCategories.length > 0 && !menuCategories.includes(selectedCategory)) {
        setSelectedCategory(menuCategories[0]);
    }

    const handleAddToCart = (item) => {
        addToCart(item, restaurant.id, restaurant.name);
    };

    const handleRemoveFromCart = (itemId) => {
        removeFromCart(itemId);
    };

    const handleCartPress = () => {
        navigation.navigate('Main', {
            screen: 'Cart'
        });
    };

    const renderMenuItem = ({ item }) => {
        const quantity = getItemQuantity(item.id);
        
        return (
            <View style={styles.menuItem}>
                <View style={styles.menuItemContent}>
                    <View style={styles.menuItemHeader}>
                        <View style={styles.nameContainer}>
                            {item.isVeg ? (
                                <View style={[styles.vegIcon, { borderColor: 'green' }]}>
                                    <View style={[styles.vegDot, { backgroundColor: 'green' }]} />
                                </View>
                            ) : (
                                <View style={[styles.vegIcon, { borderColor: 'red' }]}>
                                    <View style={[styles.vegDot, { backgroundColor: 'red' }]} />
                                </View>
                            )}
                            <Text style={styles.menuItemName}>{item.name}</Text>
                        </View>
                        <Text style={styles.menuItemPrice}>{item.price}</Text>
                    </View>
                    <Text style={styles.menuItemDescription}>{item.description}</Text>
                    
                    {quantity > 0 ? (
                        <View style={styles.quantityControls}>
                            <TouchableOpacity 
                                style={styles.quantityButton}
                                onPress={() => handleRemoveFromCart(item.id)}
                            >
                                <Ionicons name="remove" size={20} color="#FFA726" />
                            </TouchableOpacity>
                            <Text style={styles.quantity}>{quantity}</Text>
                            <TouchableOpacity 
                                style={styles.quantityButton}
                                onPress={() => handleAddToCart(item)}
                            >
                                <Ionicons name="add" size={20} color="#FFA726" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity 
                            style={styles.addButton}
                            onPress={() => handleAddToCart(item)}
                        >
                            <Text style={styles.addButtonText}>ADD</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header with back button and cart icon */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.cartButton}
                    onPress={handleCartPress}
                >
                    <Ionicons name="cart-outline" size={24} color="#000" />
                    {getItemCount() > 0 && (
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>{getItemCount()}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Restaurant Banner */}
                <View style={styles.bannerContainer}>
                    <Image
                        source={{ uri: 'https://placeholder.com/restaurant-banner' }}
                        style={styles.bannerImage}
                    />
                    <View style={styles.restaurantInfo}>
                        <Text style={styles.restaurantName}>{restaurant?.name}</Text>
                        <Text style={styles.restaurantTags}>{restaurant?.tags}</Text>
                        <View style={styles.restaurantMeta}>
                            <Text style={styles.rating}>⭐ {restaurant?.rating}</Text>
                            <Text style={styles.timing}>{restaurant?.deliveryTime}</Text>
                        </View>
                    </View>
                </View>

                {menuCategories.length > 0 ? (
                    <>
                        <View style={styles.categoriesContainer}>
                            {menuCategories.map((category) => (
                                <TouchableOpacity
                                    key={category}
                                    style={[
                                        styles.categoryButton,
                                        selectedCategory === category && styles.selectedCategory,
                                    ]}
                                    onPress={() => setSelectedCategory(category)}
                                >
                                    <Text
                                        style={[
                                            styles.categoryText,
                                            selectedCategory === category && styles.selectedCategoryText,
                                        ]}
                                    >
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <FlatList
                            data={filteredMenu[selectedCategory]}
                            renderItem={renderMenuItem}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                        />
                    </>
                ) : (
                    <View style={styles.noMenuContainer}>
                        <Text style={styles.noMenuText}>
                            No {isVegOnly ? 'vegetarian ' : ''}items available in this restaurant
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    header: {
        padding: 26,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginTop: 20,
    },
    bannerContainer: {
        width: width,
        height: 200,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    restaurantInfo: {
        padding: 15,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: -20,
    },
    restaurantName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    restaurantTags: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    restaurantMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        marginRight: 16,
        fontSize: 14,
    },
    timing: {
        fontSize: 14,
        color: '#666',
    },
    categoriesContainer: {
        flexDirection: 'row',
        padding: 15,
        marginTop: 80,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    categoryButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginRight: 12,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
    },
    selectedCategory: {
        backgroundColor: '#FFA726',
    },
    categoryText: {
        fontSize: 16,
        color: '#666',
    },
    selectedCategoryText: {
        color: '#fff',
    },
    menuItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    menuItemContent: {
        flex: 1,
    },
    menuItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    vegIcon: {
        width: 16,
        height: 16,
        borderWidth: 1,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    vegDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    menuItemName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    menuItemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFA726',
    },
    menuItemDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    addButton: {
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 24,
        borderRadius: 4,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#FFA726',
    },
    addButtonText: {
        color: '#FFA726',
        fontWeight: 'bold',
    },
    cartButton: {
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        right: -8,
        top: -8,
        backgroundColor: '#FFA726',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        borderRadius: 20,
        paddingHorizontal: 8,
        alignSelf: 'flex-start',
    },
    quantityButton: {
        padding: 8,
    },
    quantity: {
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 12,
        color: '#2B2B2B',
    },
    noMenuContainer: {
        padding: 20,
        alignItems: 'center',
    },
    noMenuText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
}); 