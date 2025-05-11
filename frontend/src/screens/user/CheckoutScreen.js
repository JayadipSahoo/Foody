// pre-gemini checkoutScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Alert, ScrollView, SafeAreaView, StatusBar, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCart } from '../../context/CartContext';
import useUserStore from '../../store/userStore';
import api from "../../services/apiService";
import hashItemSnapshot from '../../utils/hashItemSnapshot';

const paymentOptions = [
  { key: 'upi', label: 'UPI' },
  { key: 'card', label: 'Credit/Debit Card' },
  { key: 'cod', label: 'Cash on Delivery' },
];

// Theme color
const THEME_COLOR = '#fda535';

// Component for individual cart item in the order summary
const CartItemRow = ({ item, onIncrease, onDecrease }) => (
  <View style={styles.cartItemRow}>
    <View style={styles.cartItemInfo}>
      <View style={styles.itemNameRow}>
        {item.isVeg ? (
          <View style={styles.vegIndicator}>
            <View style={styles.vegDot} />
          </View>
        ) : (
          <View style={styles.nonVegIndicator}>
            <View style={styles.nonVegDot} />
          </View>
        )}
        <Text style={styles.cartItemName}>{item.name}</Text>
      </View>
      <Text style={styles.cartItemPrice}>₹{item.price}</Text>
    </View>
    <View style={styles.cartItemControls}>
      <TouchableOpacity style={styles.qtyBtn} onPress={onDecrease}>
        <Text style={styles.qtyBtnText}>-</Text>
      </TouchableOpacity>
      <Text style={styles.cartItemQty}>{item.quantity}</Text>
      <TouchableOpacity style={styles.qtyBtn} onPress={onIncrease}>
        <Text style={styles.qtyBtnText}>+</Text>
      </TouchableOpacity>
    </View>
    <Text style={styles.cartItemTotal}>₹{item.price * item.quantity}</Text>
  </View>
);

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { cartItems, cartRestaurant, getCartTotal, updateItemQuantity, clearCart } = useCart();
  const { lastOrderedLocation } = useUserStore();
  const [paymentMethod, setPaymentMethod] = useState(paymentOptions[0].key);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [showInstructionsInput, setShowInstructionsInput] = useState(false);
  const [total, setTotal] = useState(0);
  
  // Get restaurant name from CartContext if available, or from route params
  const restaurantName = cartRestaurant?.name || route.params?.restaurant?.name || "Restaurant";

  // Calculate total whenever cartItems change
  useEffect(() => {
    setTotal(getCartTotal());
    console.log("Cart items in checkout:", cartItems);
  }, [cartItems]);

  const handlePay = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Please add items before checking out.');
      return;
    }
  
    try {
      // Construct item payload with ID, quantity, and version hash
      const items = cartItems.map(item => {
        const itemSnapshot = {
          name: item.name,
          price: item.price,
          isAvailable: item.isAvailable,
          isVeg: item.isVeg
        };
        const hash = hashItemSnapshot(itemSnapshot);
        
        // Include debug info
        console.log(`Preparing to order: ${item.name}, Scheduled: ${item.isScheduled}, Available: ${item.isAvailable}`);
        
        return {
          itemId: item._id,
          quantity: item.quantity,
          versionHash: hash,
          // Include isScheduled flag for backend to handle specially
          isScheduled: !!item.isScheduled
        };
      });
  
      const orderPayload = {
        items,
        vendorId: cartRestaurant?.id || cartRestaurant?._id,
        deliveryAddress: lastOrderedLocation,
        paymentMethod,
        specialInstructions: instructions.trim()
      };

      // Order Payload for Debugging
      console.log("Placing Order : ", orderPayload);
  
      const response = await api.post("/orders", orderPayload);
  
      Alert.alert('Order Placed Successfully', 'Your food is being prepared!', [
        {
          text: 'OK',
          onPress: () => {
            clearCart();
            navigation.navigate('CustomerTabs', { screen: 'Home' });
          }
        }
      ]);
    } catch (error) {
      if (error.response?.status === 409) {
        Alert.alert(
          'Menu Updated',
          'Some items have changed since you added them. Please review your cart again.',
          [
            {
              text: 'Go Back',
              onPress: () => {
                clearCart();
                navigation.navigate('RestaurantDetails', { restaurant: cartRestaurant || route.params?.restaurant });
              }
            }
          ]
        );
      } else {
        Alert.alert('Order Failed', 'Something went wrong. Please try again.');
      }
    }
  };

  // Handle navigation back to restaurant
  const handleAddMoreItems = () => {
    navigation.goBack();
  };

  // Calculate delivery time (30-45 minutes from now)
  const getEstimatedDeliveryTime = () => {
    const now = new Date();
    const minDeliveryTime = new Date(now.getTime() + 30 * 60000); // +30 minutes
    const maxDeliveryTime = new Date(now.getTime() + 45 * 60000); // +45 minutes
    
    const formatTime = (date) => {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    return `${formatTime(minDeliveryTime)} - ${formatTime(maxDeliveryTime)}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{restaurantName}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer}>
        {/* Order Summary */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Your Order</Text>
          {cartItems.length > 0 ? (
            cartItems.map(item => (
              <CartItemRow
                key={item._id}
                item={item}
                onIncrease={() => updateItemQuantity(item._id, item.quantity + 1)}
                onDecrease={() => updateItemQuantity(item._id, item.quantity - 1)}
              />
            ))
          ) : (
            <Text style={styles.emptyCartText}>Your cart is empty</Text>
          )}
          <TouchableOpacity 
            style={styles.addMoreButton}
            onPress={handleAddMoreItems}
          >
            <MaterialIcons name="add" size={20} color="#4CAF50" />
            <Text style={styles.addMoreText}>Add more items</Text>
          </TouchableOpacity>
        </View>

        {/* Special Instructions */}
        {showInstructionsInput ? (
          <View style={styles.instructionsInputContainer}>
            <TextInput
              style={styles.instructionsInput}
              placeholder="Add cooking instructions, allergies, etc."
              multiline
              value={instructions}
              onChangeText={setInstructions}
            />
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => setShowInstructionsInput(false)}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.instructionsBox}
            onPress={() => setShowInstructionsInput(true)}
          >
            <MaterialIcons name="note-add" size={20} color="#666" />
            <Text style={styles.instructionsText}>
              {instructions ? instructions : "Add notes for the restaurant"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Delivery Details Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          
          {/* Delivery Time */}
          <View style={styles.detailRow}>
            <MaterialIcons name="access-time" size={24} color={THEME_COLOR} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Estimated Time</Text>
              <Text style={styles.detailValue}>{getEstimatedDeliveryTime()}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#999" />
          </View>
          
          {/* Delivery Location */}
          <View style={styles.detailRow}>
            <MaterialIcons name="location-on" size={24} color={THEME_COLOR} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Delivery Address</Text>
              <Text style={styles.detailValue}>{lastOrderedLocation || "Select a location"}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#999" />
          </View>
          
          {/* User Information */}
          <View style={styles.detailRow}>
            <MaterialIcons name="person" size={24} color={THEME_COLOR} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Contact Info</Text>
              <Text style={styles.detailValue}>Baibhav, +91-9521399080</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#999" />
          </View>
          
          {/* Total Bill */}
          <View style={styles.detailRow}>
            <MaterialIcons name="receipt" size={24} color={THEME_COLOR} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Order Total</Text>
              <Text style={styles.totalValue}>₹{total}</Text>
            </View>
          </View>
          
          <Text style={styles.taxNote}>Includes all taxes and delivery charges</Text>
        </View>
        
        {/* Extra padding to ensure content isn't hidden behind payment bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Fixed Payment Bar */}
      <View style={styles.payBar}>
        <TouchableOpacity style={styles.payOption} onPress={() => setShowPaymentModal(true)}>
          <MaterialIcons name="account-balance-wallet" size={20} color="#333" />
          <Text style={styles.payOptionText}>
            {paymentOptions.find(opt => opt.key === paymentMethod)?.label}
          </Text>
          <MaterialIcons name="keyboard-arrow-down" size={18} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.payBtn} onPress={handlePay}>
          <Text style={styles.payBtnText}>Pay ₹{total}</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Modal */}
      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Payment Method</Text>
            <FlatList
              data={paymentOptions}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    setPaymentMethod(item.key);
                    setShowPaymentModal(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{item.label}</Text>
                  {paymentMethod === item.key && (
                    <MaterialIcons name="check" size={20} color={THEME_COLOR} />
                  )}
                </TouchableOpacity>
              )}
              keyExtractor={item => item.key}
            />
            <TouchableOpacity onPress={() => setShowPaymentModal(false)} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
    backgroundColor: '#fff',
    zIndex: 10
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center'
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 16,
  },
  sectionCard: {
    margin: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  emptyCartText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  cartItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  cartItemInfo: {
    flex: 2,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vegIndicator: {
    width: 16,
    height: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'green',
  },
  nonVegIndicator: {
    width: 16,
    height: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  nonVegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    marginLeft: 24,
  },
  cartItemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  qtyBtn: {
    backgroundColor: THEME_COLOR,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItemQty: {
    marginHorizontal: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  addMoreText: {
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 8,
  },
  instructionsBox: {
    backgroundColor: '#F9F9F9',
    margin: 16,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructionsText: {
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  instructionsInputContainer: {
    margin: 16,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  instructionsInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  saveButton: {
    alignSelf: 'flex-end',
    backgroundColor: THEME_COLOR,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  detailTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#999',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  taxNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    textAlign: 'right',
  },
  bottomPadding: {
    height: 80 // Provides space at the bottom so content doesn't hide behind payment bar
  },
  payBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#F2F2F2',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  payOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 10,
    marginRight: 10
  },
  payOptionText: {
    marginLeft: 6,
    marginRight: 4,
    fontWeight: 'bold'
  },
  payBtn: {
    flex: 1,
    backgroundColor: THEME_COLOR,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center'
  },
  payBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F2F2F2'
  },
  modalOptionText: {
    flex: 1,
    fontSize: 16
  },
  modalCloseBtn: {
    marginTop: 16,
    alignItems: 'center'
  },
  modalCloseText: {
    color: '#fda535',
    fontWeight: 'bold'
  },
});

export default CheckoutScreen;