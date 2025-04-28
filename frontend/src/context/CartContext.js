// src/context/cartContext.js

import React, { createContext, useContext, useState } from 'react';
import { Alert } from 'react-native';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    // Store the restaurant ID and name associated with the current cart
    const [cartRestaurant, setCartRestaurant] = useState(null);

    const addToCart = (item, restaurantId, restaurantName) => {
        // Ensure item has an _id
        if (!item._id) {
            console.error("Item missing _id:", item);
            Alert.alert("Error", "Cannot add item without ID.");
            return;
        }

        setCartItems(prevItems => {
            // Check if we're adding items from a different restaurant
            if (prevItems.length > 0 && cartRestaurant?.id !== restaurantId) {
                Alert.alert(
                    "Start New Cart?",
                    `Your cart contains items from ${cartRestaurant.name}. Starting a new cart with items from ${restaurantName} will clear your current one.`,
                    [
                        {
                            text: "Cancel",
                            style: "cancel",
                            onPress: () => {} // Do nothing, keep existing cart
                        },
                        {
                            text: "OK",
                            onPress: () => {
                                // Clear cart and add the new item
                                setCartRestaurant({ id: restaurantId, name: restaurantName });
                                setCartItems([{
                                    ...item,
                                    quantity: 1,
                                    restaurantId: restaurantId, // Store for consistency check
                                }]);
                                Alert.alert('Item Added', `${item.name} added to your new cart.`);
                            }
                        }
                    ]
                );
                // Return previous items until user confirms clearing
                return prevItems;
            }

            // If cart is empty, set the restaurant
            if (prevItems.length === 0) {
                setCartRestaurant({ id: restaurantId, name: restaurantName });
            }

            // Check if item already exists in cart using _id
            const existingItemIndex = prevItems.findIndex(i => i._id === item._id);

            if (existingItemIndex > -1) {
                // Update quantity of existing item
                const newItems = [...prevItems];
                newItems[existingItemIndex].quantity += 1;
                return newItems;
            } else {
                // Add new item
                return [...prevItems, {
                    ...item,
                    quantity: 1,
                    restaurantId: restaurantId, // Store for consistency check
                }];
            }
        });
         // Only show simple alert if not clearing cart
         if (cartItems.length === 0 || cartRestaurant?.id === restaurantId) {
              Alert.alert('Item Added', `${item.name} added to cart.`);
         }
    };

    // Renamed from removeFromCart to decreaseQuantityOrRemove
    const decreaseQuantityOrRemove = (itemId) => {
        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(i => i._id === itemId);

            if (existingItemIndex > -1) {
                const newItems = [...prevItems];
                if (newItems[existingItemIndex].quantity > 1) {
                    // Decrease quantity if more than 1
                    newItems[existingItemIndex].quantity -= 1;
                    return newItems;
                } else {
                    // Remove item if quantity is 1
                    const filteredItems = prevItems.filter(item => item._id !== itemId);
                     // If cart becomes empty, clear restaurant info
                    if (filteredItems.length === 0) {
                        setCartRestaurant(null);
                    }
                    return filteredItems;
                }
            }
            // Item not found, return previous state
            return prevItems;
        });
    };

     // New function for direct quantity update or removal
    const updateItemQuantity = (itemId, newQuantity) => {
        if (newQuantity <= 0) {
            // If new quantity is 0 or less, remove the item
            setCartItems(prevItems => {
                 const filteredItems = prevItems.filter(item => item._id !== itemId);
                 if (filteredItems.length === 0) {
                     setCartRestaurant(null);
                 }
                 return filteredItems;
            });
        } else {
            // Otherwise, update the quantity
            setCartItems(prevItems => {
                return prevItems.map(item =>
                    item._id === itemId ? { ...item, quantity: newQuantity } : item
                );
            });
        }
    };


    const clearCart = () => {
        Alert.alert(
            "Clear Cart",
            "Are you sure you want to clear your cart?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "OK", onPress: () => {
                    setCartItems([]);
                    setCartRestaurant(null); // Clear restaurant info as well
                }}
            ]
        );
    };

    // Uses numeric price directly
    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            // Ensure price is a number, default to 0 if not
            const price = typeof item.price === 'number' ? item.price : 0;
            return total + (price * item.quantity);
        }, 0); // Return as number, formatting handled in UI
    };

    const getItemCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    // Kept for potential future use, but updateItemQuantity is more versatile
    const getItemQuantity = (itemId) => {
        const item = cartItems.find(item => item._id === itemId);
        return item ? item.quantity : 0;
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            cartRestaurant, // Expose the restaurant info
            addToCart,
            decreaseQuantityOrRemove, // Use this for "-" button
            updateItemQuantity, // Use this for direct quantity changes if needed
            clearCart,
            getCartTotal,
            getItemCount,
            // getItemQuantity, // Optional
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}