import React, { createContext, useContext, useState } from 'react';
import { Alert } from 'react-native';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (item, restaurantId, restaurantName) => {
        setCartItems(prevItems => {
            // Check if we're adding items from a different restaurant
            if (prevItems.length > 0 && prevItems[0].restaurantId !== restaurantId) {
                Alert.alert(
                    "Clear Cart?",
                    "Adding items from a different restaurant will clear your current cart.",
                    [
                        {
                            text: "Cancel",
                            style: "cancel"
                        },
                        {
                            text: "OK",
                            onPress: () => {
                                setCartItems([{
                                    ...item,
                                    quantity: 1,
                                    restaurantId,
                                    restaurantName
                                }]);
                            }
                        }
                    ]
                );
                return prevItems;
            }

            // Check if item already exists in cart
            const existingItemIndex = prevItems.findIndex(i => i.id === item.id);
            
            if (existingItemIndex > -1) {
                // Update quantity of existing item
                const newItems = [...prevItems];
                newItems[existingItemIndex].quantity += 1;
                return newItems;
            }

            // Add new item
            return [...prevItems, {
                ...item,
                quantity: 1,
                restaurantId,
                restaurantName
            }];
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(i => i.id === itemId);
            
            if (existingItemIndex > -1) {
                const newItems = [...prevItems];
                if (newItems[existingItemIndex].quantity > 1) {
                    // Decrease quantity if more than 1
                    newItems[existingItemIndex].quantity -= 1;
                    return newItems;
                } else {
                    // Remove item if quantity is 1
                    return prevItems.filter(item => item.id !== itemId);
                }
            }
            return prevItems;
        });
    };

    const clearCart = () => {
        Alert.alert(
            "Clear Cart",
            "Are you sure you want to clear your cart?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "OK",
                    onPress: () => setCartItems([])
                }
            ]
        );
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = parseFloat(item.price.replace('₹', ''));
            return total + (price * item.quantity);
        }, 0).toFixed(2);
    };

    const getItemCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const getItemQuantity = (itemId) => {
        const item = cartItems.find(item => item.id === itemId);
        return item ? item.quantity : 0;
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            clearCart,
            getCartTotal,
            getItemCount,
            getItemQuantity,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
} 