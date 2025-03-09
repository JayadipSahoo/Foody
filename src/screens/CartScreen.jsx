import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useCart } from '../context/CartContext';

export default function CartScreen({ navigation }) {
    const { cartItems, addToCart, removeFromCart, clearCart, getCartTotal } = useCart();

    const renderCartItem = ({ item }) => (
        <View style={styles.cartItem}>
            <View style={styles.itemInfo}>
                {item.isVeg ? (
                    <View style={[styles.vegIcon, { borderColor: 'green' }]}>
                        <View style={[styles.vegDot, { backgroundColor: 'green' }]} />
                    </View>
                ) : (
                    <View style={[styles.vegIcon, { borderColor: 'red' }]}>
                        <View style={[styles.vegDot, { backgroundColor: 'red' }]} />
                    </View>
                )}
                <View>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>{item.price}</Text>
                </View>
            </View>

            <View style={styles.quantityControls}>
                <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => removeFromCart(item.id)}
                >
                    <Ionicons name="remove" size={20} color="#FFA726" />
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => addToCart(item, item.restaurantId, item.restaurantName)}
                >
                    <Ionicons name="add" size={20} color="#FFA726" />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (cartItems.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="cart-outline" size={80} color="#666" />
                <Text style={styles.emptyText}>Your cart is empty</Text>
                <TouchableOpacity 
                    style={styles.browseButton}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.browseButtonText}>Browse Restaurants</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cart</Text>
                <TouchableOpacity onPress={clearCart}>
                    <Text style={styles.clearCart}>Clear</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{cartItems[0]?.restaurantName}</Text>
            </View>

            <FlatList
                data={cartItems}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.cartList}
            />

            <View style={styles.footer}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalText}>Total Amount</Text>
                    <Text style={styles.totalAmount}>₹{getCartTotal()}</Text>
                </View>
                <TouchableOpacity 
                    style={styles.checkoutButton}
                    onPress={() => navigation.navigate('Checkout')}
                >
                    <Text style={styles.checkoutButtonText}>Place Order</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        marginTop: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2B2B2B',
    },
    clearCart: {
        color: '#FFA726',
        fontSize: 14,
    },
    restaurantInfo: {
        padding: 16,
        backgroundColor: '#f8f8f8',
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2B2B2B',
    },
    cartList: {
        padding: 16,
    },
    cartItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    itemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
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
    itemName: {
        fontSize: 16,
        color: '#2B2B2B',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 14,
        color: '#666',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        borderRadius: 20,
        paddingHorizontal: 8,
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
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalText: {
        fontSize: 16,
        color: '#666',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2B2B2B',
    },
    checkoutButton: {
        backgroundColor: '#FFA726',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginTop: 16,
        marginBottom: 24,
    },
    browseButton: {
        backgroundColor: '#FFA726',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    browseButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
