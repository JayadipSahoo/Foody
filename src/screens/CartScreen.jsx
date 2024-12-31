import React, { useContext } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import CartContext from '../services/CartContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

const CartScreen = () => {
    const { cart, dispatch } = useContext(CartContext);
    const navigation = useNavigation();

    const removeFromCart = (id) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: { id } });
    };

    const incrementQuantity = (id) => {
        dispatch({ type: 'INCREMENT_QUANTITY', payload: { id } });
    };

    const decrementQuantity = (id) => {
        dispatch({ type: 'DECREMENT_QUANTITY', payload: { id } });
    };

    const sanitizedCart = cart.filter(item => item.id !== undefined && item.id !== null);

    const calculateSubtotal = () => {
        return sanitizedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
    };

    const deliveryCost = 60.20; // Assuming a fixed delivery cost
    const subtotal = parseFloat(calculateSubtotal());
    const totalCost = (subtotal + deliveryCost).toFixed(2);

    const renderRightActions = (id) => (
        <RectButton style={styles.rightAction} onPress={() => removeFromCart(id)}>
            <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
        </RectButton>
    );

    const renderLeftActions = (id, quantity) => (
        <View style={styles.leftActionContainer}>
            <RectButton style={styles.leftAction} onPress={() => incrementQuantity(id)}>
                <Text style={styles.actionText}>+</Text>
            </RectButton>
            <View style={styles.quantityContainer}>
                <Text style={styles.quantityText}>{quantity}</Text>
            </View>
            <RectButton style={styles.leftAction} onPress={() => decrementQuantity(id)}>
                <Text style={styles.actionText}>-</Text>
            </RectButton>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#2B2B2B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Cart</Text>
                <View style={{ width: 40 }} />
            </View>
            {sanitizedCart.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Cart is empty</Text>
                </View>
            ) : (
                <>
                    <View style={styles.itemCountContainer}>
                        <Text style={styles.itemCountText}>{sanitizedCart.length} Item{sanitizedCart.length > 1 ? 's' : ''}</Text>
                    </View>
                    <FlatList
                        data={sanitizedCart}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <Swipeable
                                renderRightActions={() => renderRightActions(item.id)}
                            >
                                <View style={styles.itemContainer}>
                                    <View style={styles.actionContainer}>
                                        {renderLeftActions(item.id, item.quantity)}
                                    </View>
                                    <Image source={item.image} style={styles.itemImage} />
                                    <View style={styles.itemTextContainer}>
                                        <Text style={styles.itemTitle}>{item.title}</Text>
                                        <Text style={styles.itemPrice}>₹{item.price}</Text>
                                    </View>
                                </View>
                            </Swipeable>
                        )}
                    />
                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryText}>Subtotal:</Text>
                            <Text style={styles.summaryText}>₹{subtotal}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryText}>Delivery:</Text>
                            <Text style={styles.summaryText}>₹{deliveryCost}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.totalText}>Total Cost:</Text>
                            <Text style={styles.totalText}>₹{totalCost}</Text>
                        </View>
                        <TouchableOpacity style={styles.checkoutButton} onPress={() => navigation.navigate('Checkout', { subtotal, deliveryCost, totalCost })}>
                            <Text style={styles.checkoutButtonText}>Checkout</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F9',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginTop: 30,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2B2B2B',
        textAlign: 'center',
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#888',
    },
    itemCountContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    itemCountText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2B2B2B',
    },
    itemContainer: {
        marginHorizontal: 16,
        flexDirection: 'row',
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
    },
    actionContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        marginRight: 10,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 10,
    },
    itemTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemPrice: {
        fontSize: 14,
        color: '#888',
    },
    deleteIcon: {
        padding: 10,
    },
    icon: {
        width: 24,
        height: 24,
        tintColor: '#FFFFFF',
    },
    rightAction: {
        backgroundColor: '#EB4335',
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
        borderRadius: 10,
        marginBottom: 15,
        marginRight: 16
    },
    leftActionContainer: {
        backgroundColor: '#FFAC1C',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 6,
        width: 60,
        height: 100,
    },
    leftAction: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '30%',
    },
    actionText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    quantityContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '40%',
    },
    quantityText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    summaryContainer: {
        padding: 20,
        borderTopWidth: 1,
        borderColor: '#ddd',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    summaryText: {
        fontSize: 16,
        color: '#2B2B2B',
    },
    totalText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 20,
    },
    checkoutButton: {
        backgroundColor: '#FFAC1C',
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CartScreen;
