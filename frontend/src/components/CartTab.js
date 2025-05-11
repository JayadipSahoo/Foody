import React, { useState, useEffect } from 'react';
import { 
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useCart } from '../context/CartContext';

const THEME_COLOR = '#fda535';

/**
 * Reusable animated cart tab component that shows the current cart state
 * and navigates to checkout when pressed.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.restaurant - Optional restaurant object to pass to checkout
 *                                   (used when on RestaurantDetailsScreen)
 */
const CartTab = ({ restaurant }) => {
  const navigation = useNavigation();
  const { cartItems, cartRestaurant, getCartTotal, getItemCount } = useCart();
  const [cartTabAnimation] = useState(new Animated.Value(0));

  // Animation for cart tab
  useEffect(() => {
    if (cartItems.length > 0) {
      Animated.spring(cartTabAnimation, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(cartTabAnimation, {
        toValue: 0,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }
  }, [cartItems]);

  const total = getCartTotal();
  const itemCount = getItemCount();
  
  if (itemCount === 0) return null;
  
  const translateY = cartTabAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0]
  });
  
  const handlePress = () => {
    if (itemCount > 0) {
      // If we're on a restaurant screen, use that restaurant
      // Otherwise use the restaurant from the cart context
      const restaurantToUse = restaurant || cartRestaurant;
      navigation.navigate('Checkout', { restaurant: restaurantToUse });
    }
  };
  
  return (
    <Animated.View 
      style={[
        styles.cartTabContainer,
        { transform: [{ translateY }] }
      ]}
    >
      <TouchableOpacity
        style={styles.cartTab}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.cartTabContent}>
          <View style={styles.cartTabInfo}>
            <Text style={styles.cartTabItemCount}>
              {itemCount === 1 ? '1 item added' : `${itemCount} items added`}
            </Text>
            <Text style={styles.cartTabTotal}>
              worth ₹{total}
            </Text>
          </View>
          <View style={styles.cartTabArrow}>
            <MaterialIcons name="arrow-forward" size={24} color="#FFF" />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cartTabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  cartTab: {
    backgroundColor: THEME_COLOR,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cartTabContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartTabInfo: {
    flex: 1,
  },
  cartTabItemCount: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartTabTotal: {
    color: 'white',
    fontSize: 14,
  },
  cartTabArrow: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CartTab; 