import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Image,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// Define theme color
const THEME_COLOR = '#FDA535';

const CartScreen = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const navigation = useNavigation();

    useEffect(() => {
        loadCartItems();
    }, []);

    const loadCartItems = async () => {
        try {
            setLoading(true);
            const cartData = await AsyncStorage.getItem('cart');
            if (cartData) {
                const cart = JSON.parse(cartData);
                setCartItems(cart.items || []);
                calculateTotal(cart.items || []);
            }
        } catch (error) {
            console.error('Error loading cart items:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = (items) => {
        const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setTotal(totalPrice);
    };

    const updateItemQuantity = async (itemId, change) => {
        const updatedItems = cartItems.map(item => {
            if (item.id === itemId) {
                const newQuantity = item.quantity + change;
                if (newQuantity < 1) return null; // Remove item if quantity < 1
                return { ...item, quantity: newQuantity };
            }
            return item;
        }).filter(Boolean); // Remove null items

        setCartItems(updatedItems);
        calculateTotal(updatedItems);

        try {
            await AsyncStorage.setItem('cart', JSON.stringify({ items: updatedItems }));
        } catch (error) {
            console.error('Error updating cart:', error);
        }
    };

    const removeItem = async (itemId) => {
        const updatedItems = cartItems.filter(item => item.id !== itemId);
        setCartItems(updatedItems);
        calculateTotal(updatedItems);

        try {
            await AsyncStorage.setItem('cart', JSON.stringify({ items: updatedItems }));
        } catch (error) {
            console.error('Error removing item from cart:', error);
        }
    };

    const clearCart = async () => {
        Alert.alert(
            'Clear Cart',
            'Are you sure you want to remove all items?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear', 
                    style: 'destructive',
                    onPress: async () => {
                        setCartItems([]);
                        setTotal(0);
                        try {
                            await AsyncStorage.setItem('cart', JSON.stringify({ items: [] }));
                        } catch (error) {
                            console.error('Error clearing cart:', error);
                        }
                    }
                }
            ]
        );
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            Alert.alert('Empty Cart', 'Please add items to your cart before checkout');
            return;
        }
        
        // Navigate to checkout screen (to be implemented)
        // navigation.navigate('Checkout');
        Alert.alert('Checkout', 'Proceeding to checkout...');
    };

    const renderCartItem = ({ item }) => (
        <View style={styles.cartItem}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
                <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
            </View>
            
            <View style={styles.quantityContainer}>
                <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => updateItemQuantity(item.id, -1)}
                >
                    <Ionicons name="remove" size={18} color="#fff" />
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>{item.quantity}</Text>
                
                <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => updateItemQuantity(item.id, 1)}
                >
                    <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeItem(item.id)}
            >
                <Ionicons name="trash-outline" size={22} color="#ff4d4d" />
            </TouchableOpacity>
        </View>
    );

    const renderEmptyCart = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <Text style={styles.emptySubText}>
                Add items from a restaurant to get started
            </Text>
            <TouchableOpacity 
                style={styles.browseButton}
                onPress={() => navigation.navigate('Home')}
            >
                <Text style={styles.browseButtonText}>Browse Restaurants</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
            
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Cart</Text>
                {cartItems.length > 0 && (
                    <TouchableOpacity onPress={clearCart}>
                        <Text style={styles.clearText}>Clear All</Text>
                    </TouchableOpacity>
                )}
            </View>
            
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={THEME_COLOR} />
                </View>
            ) : (
                <>
                    <FlatList
                        data={cartItems}
                        renderItem={renderCartItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={
                            cartItems.length === 0 ? { flex: 1 } : styles.cartList
                        }
                        ListEmptyComponent={renderEmptyCart}
                    />
                    
                    {cartItems.length > 0 && (
                        <View style={styles.checkoutContainer}>
                            <View style={styles.totalContainer}>
                                <Text style={styles.totalLabel}>Total:</Text>
                                <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
                            </View>
                            
                            <TouchableOpacity 
                                style={styles.checkoutButton}
                                onPress={handleCheckout}
                            >
                                <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                                <Ionicons name="arrow-forward" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    clearText: {
        color: '#ff4d4d',
        fontSize: 14,
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartList: {
        padding: 15,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        marginBottom: 15,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    itemDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 15,
        fontWeight: '600',
        color: THEME_COLOR,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    quantityButton: {
        backgroundColor: THEME_COLOR,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        marginHorizontal: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
    removeButton: {
        padding: 5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    browseButton: {
        backgroundColor: THEME_COLOR,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    browseButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    checkoutContainer: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        padding: 20,
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    checkoutButton: {
        backgroundColor: THEME_COLOR,
        borderRadius: 10,
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
});

export default CartScreen; 