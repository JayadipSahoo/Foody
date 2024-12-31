import React, { createContext, useReducer, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';

const CartContext = createContext();

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TO_CART':
            return state.some(item => item.id === action.payload.id)
                ? state
                : [...state, { ...action.payload, quantity: 1 }];
        case 'REMOVE_FROM_CART':
            return state.filter(item => item.id !== action.payload.id);
        case 'INCREMENT_QUANTITY':
            return state.map(item =>
                item.id === action.payload.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
        case 'DECREMENT_QUANTITY':
            return state.map(item =>
                item.id === action.payload.id && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            );
        case 'CLEAR_CART':
            return [];
        default:
            return state;
    }
};

export const CartProvider = ({ children }) => {
    const [cart, dispatch] = useReducer(cartReducer, []);
    const [duplicateItemAttempt, setDuplicateItemAttempt] = useState(false);
    const [itemAdded, setItemAdded] = useState(null);

    useEffect(() => {
        if (duplicateItemAttempt) {
            Toast.show({
                type: 'error',
                text1: 'Item already in cart',
                text2: 'This item has already been added to the cart.',
            });
            setDuplicateItemAttempt(false);
        }
    }, [duplicateItemAttempt]);

    useEffect(() => {
        if (itemAdded) {
            Toast.show({
                type: 'success',
                text1: 'Item added',
                text2: 'Item added to the cart successfully.',
            });
            setItemAdded(null);
        }
    }, [itemAdded]);

    const enhancedDispatch = (action) => {
        if (action.type === 'ADD_TO_CART') {
            if (cart.some(item => item.id === action.payload.id)) {
                setDuplicateItemAttempt(true);
            } else {
                dispatch(action);
                setItemAdded(true);
            }
        } else {
            dispatch(action);
        }
    };

    return (
        <CartContext.Provider value={{ cart, dispatch: enhancedDispatch }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
