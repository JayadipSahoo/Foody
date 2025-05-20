// pre-gemini checkoutScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Alert, ScrollView, SafeAreaView, StatusBar, TextInput, ActivityIndicator, Linking, Platform, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCart } from '../../context/CartContext';
import useUserStore from '../../store/userStore';
import api, { customerAPI } from "../../services/apiService";
import hashItemSnapshot from '../../utils/hashItemSnapshot';
import RazorpayCheckout from 'react-native-razorpay';

// Theme color
const THEME_COLOR = '#fda535';

// Payment options array
const paymentOptions = [
  { key: 'razorpay', label: 'Pay Online (Razorpay)' },
  { key: 'cod', label: 'Cash on Delivery' }
];

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

const MockRazorpayCheckout = ({ options, onSuccess, onCancel }) => {
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');
  const [expiry, setExpiry] = useState('12/25');
  const [cvv, setCvv] = useState('123');
  const [name, setName] = useState('Demo User');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    // Simulate processing delay
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess({
        razorpay_payment_id: 'pay_' + Math.random().toString(36).substring(2, 15),
        razorpay_order_id: options.order_id,
        razorpay_signature: 'sig_' + Math.random().toString(36).substring(2, 15)
      });
    }, 2000);
  };

  return (
    <View style={mockStyles.container}>
      <View style={mockStyles.header}>
        <Image 
          source={{ uri: 'https://razorpay.com/favicon.png' }} 
          style={mockStyles.logo}
        />
        <Text style={mockStyles.headerText}>Razorpay Checkout</Text>
        <TouchableOpacity onPress={onCancel} style={mockStyles.closeButton}>
          <Text style={mockStyles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <View style={mockStyles.body}>
        <Text style={mockStyles.title}>{options.name}</Text>
        <Text style={mockStyles.description}>{options.description}</Text>
        <Text style={mockStyles.amount}>₹{(options.amount/100).toFixed(2)}</Text>
        
        <View style={mockStyles.cardContainer}>
          <Text style={mockStyles.label}>Card Number</Text>
          <TextInput
            value={cardNumber}
            onChangeText={setCardNumber}
            style={mockStyles.input}
            placeholder="1234 5678 9012 3456"
            keyboardType="number-pad"
            maxLength={19}
          />
          
          <View style={mockStyles.row}>
            <View style={mockStyles.half}>
              <Text style={mockStyles.label}>Expiry</Text>
              <TextInput
                value={expiry}
                onChangeText={setExpiry}
                style={mockStyles.input}
                placeholder="MM/YY"
                maxLength={5}
              />
            </View>
            <View style={mockStyles.half}>
              <Text style={mockStyles.label}>CVV</Text>
              <TextInput
                value={cvv}
                onChangeText={setCvv}
                style={mockStyles.input}
                placeholder="123"
                keyboardType="number-pad"
                maxLength={3}
                secureTextEntry
              />
            </View>
          </View>
          
          <Text style={mockStyles.label}>Name on Card</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={mockStyles.input}
            placeholder="John Doe"
          />
          
          <TouchableOpacity 
            style={mockStyles.payButton}
            onPress={handlePay}
            disabled={isProcessing}
          >
            <Text style={mockStyles.payButtonText}>
              {isProcessing ? 'Processing...' : `Pay ₹${(options.amount/100).toFixed(2)}`}
            </Text>
          </TouchableOpacity>

          <Text style={mockStyles.disclaimer}>
            This is a demo payment screen. No actual payment will be processed.
          </Text>
        </View>
      </View>
    </View>
  );
};

const mockStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#023c69',
    padding: 15,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  logo: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
  },
  body: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  half: {
    width: '48%',
  },
  payButton: {
    backgroundColor: '#FDA535',
    borderRadius: 4,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimer: {
    marginTop: 15,
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  }
});

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
  const [razorpayOrderId, setRazorpayOrderId] = useState(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isLoadingRazorpay, setIsLoadingRazorpay] = useState(false);
  const [showMockRazorpay, setShowMockRazorpay] = useState(false);
  const [razorpayOptions, setRazorpayOptions] = useState(null);
  
  // Get restaurant name from CartContext if available, or from route params
  const restaurantName = cartRestaurant?.name || route.params?.restaurant?.name || "Restaurant";

  // Calculate total whenever cartItems change
  useEffect(() => {
    setTotal(getCartTotal());
    console.log("Cart items in checkout:", cartItems);
  }, [cartItems]);

  // Function to process Razorpay payment
  const processRazorpayPayment = async (options, orderId, fallbackToWebCheckout = false) => {
    try {
      console.log("Starting demo Razorpay payment flow");
      
      // Instead of trying the native module, show our mock UI
      setRazorpayOptions(options);
      setShowMockRazorpay(true);
      
      // This will be resolved when the mock UI calls onSuccess
      return new Promise((resolve, reject) => {
        // These functions will be passed to the mock component
        options.onSuccess = (data) => {
          setShowMockRazorpay(false);
          resolve(data);
        };
        
        options.onCancel = () => {
          setShowMockRazorpay(false);
          reject({
            code: 'PAYMENT_CANCELLED',
            description: 'Payment was cancelled by user'
          });
        };
      });
    } catch (error) {
      console.error('Error in processRazorpayPayment:', error);
      throw error;
    }
  };

  const handlePay = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Please add items before checking out.');
      return;
    }
  
    try {
      setIsPaymentProcessing(true);
      
      // Construct item payload with ID, quantity, and version hash
      const items = cartItems.map(item => {
        const itemSnapshot = {
          name: item.name,
          price: item.price,
          isAvailable: item.isAvailable,
          isVeg: item.isVeg
        };
        const hash = hashItemSnapshot(itemSnapshot);
        
        return {
          itemId: item._id,
          quantity: item.quantity,
          versionHash: hash,
          isScheduled: !!item.isScheduled
        };
      });
  
      const orderPayload = {
        items,
        vendorId: cartRestaurant?.id || cartRestaurant?._id,
        deliveryAddress: lastOrderedLocation,
        paymentMethod: paymentMethod,
        specialInstructions: instructions.trim()
      };

      console.log("Placing Order: ", orderPayload);
  
      const response = await customerAPI.createOrder(orderPayload);
      console.log("Order created:", response);
      
      if (paymentMethod === 'razorpay') {
        // Handle Razorpay payment
        try {
          setIsLoadingRazorpay(true);
          // Get Razorpay key
          console.log("Fetching Razorpay key from server...");
          const keyResponse = await customerAPI.getRazorpayKey();
          const key = keyResponse.key;
          
          if (!key) {
            throw new Error("Could not retrieve Razorpay key from server");
          }
          console.log("Received Razorpay key successfully", key.substring(0, 4) + "...");
          
          // Get user data for prefill
          const user = useUserStore.getState().user || {};
          
          if (!response.razorpayOrder || !response.razorpayOrder.id) {
            throw new Error("No Razorpay order ID received from server");
          }
          
          const options = {
            description: `Food Order #${response.order._id.slice(-6)}`,
            image: 'https://i.imgur.com/3g7nmJC.png', // Use a remote image URL
            currency: 'INR',
            key: key,
            amount: response.razorpayOrder.amount || (getCartTotal() * 100),
            name: 'Foody',
            order_id: response.razorpayOrder.id,
            prefill: {
              email: user.email || 'user@example.com',
              contact: user.mobile || '9876543210',
              name: user.name || 'User Name'
            },
            theme: { color: THEME_COLOR },
            // Optional additional settings for better UX
            remember_customer: true,
            send_sms_hash: true
          };
          
          console.log("Opening Razorpay with options:", { 
            ...options, 
            key: options.key.substring(0, 4) + "..." // Don't log full key
          });
          
          // Use our custom function that includes fallback
          setIsLoadingRazorpay(false);
          const data = await processRazorpayPayment(options, response.razorpayOrder.id, true);
          console.log("Razorpay payment successful:", data);
          
          if (!data || !data.razorpay_payment_id || !data.razorpay_signature) {
            throw new Error("Incomplete payment data received");
          }
          
          // Verify payment with backend
          const verifyPayload = {
            razorpayOrderId: response.razorpayOrder.id,
            razorpayPaymentId: data.razorpay_payment_id,
            razorpayPaymentSignature: data.razorpay_signature
          };
          
          console.log("Verifying payment with backend...");
          const verificationResponse = await customerAPI.verifyPayment(verifyPayload);
          console.log("Payment verification response:", verificationResponse);
          
          // Payment successful
          Alert.alert('Payment Successful', 'Your order has been placed successfully!');
          clearCart();
          navigation.navigate('CustomerTabs', { screen: 'Orders' });
        } catch (paymentError) {
          console.error('Razorpay payment error:', paymentError);
          setIsLoadingRazorpay(false);
          
          // Handle different payment error scenarios
          if (paymentError.code === 'PAYMENT_CANCELLED') {
            Alert.alert('Payment Cancelled', 'You cancelled the payment process.');
          } else if (paymentError.code === 'NETWORK_ERROR') {
            Alert.alert('Network Error', 'Please check your internet connection and try again.');
          } else if (paymentError.message && paymentError.message.includes('not properly initialized')) {
            Alert.alert(
              'Payment Gateway Error', 
              'The payment system is currently unavailable. Please try Cash on Delivery instead, or try again later.'
            );
          } else {
            Alert.alert(
              'Payment Failed', 
              'There was an issue processing your payment. Please try again or use Cash on Delivery.\n\n' + 
              (paymentError.description || paymentError.message || '')
            );
          }
          // Fall back to COD as a backup option
          setPaymentMethod('cod');
        }
      } else if (paymentMethod === 'cod') {
        // COD order success
        Alert.alert('Order Placed Successfully', 'Your food is being prepared and will be delivered soon!', [
          {
            text: 'OK',
            onPress: () => {
              clearCart();
              navigation.navigate('CustomerTabs', { screen: 'Orders' });
            }
          }
        ]);
      }
    } catch (error) {
      console.error('Order creation error:', error);
      if (error.response?.data?.shouldEmptyCart) {
        Alert.alert(
          'Menu Updated',
          'The menu for this restaurant was updated. Please refresh your cart.',
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
        Alert.alert('Order Failed', error.response?.data?.message || error.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsPaymentProcessing(false);
      setIsLoadingRazorpay(false);
    }
  };

  // Handle navigation back to restaurant
  const handleAddMoreItems = () => {
    navigation.goBack();
  };

  // Calculate delivery time based on the type of meal ordered
  const getEstimatedDeliveryTime = () => {
    const now = new Date();
    
    // Determine meal type based on cart items
    const getMealType = () => {
      // Breakfast items typically include these keywords
      const breakfastKeywords = ['breakfast', 'morning', 'pancake', 'egg', 'bread', 'toast', 'cereal', 'coffee', 'tea', 'omelette', 'idli', 'dosa'];
      
      // Dinner items typically include these keywords
      const dinnerKeywords = ['dinner', 'night', 'soup', 'pasta', 'pizza', 'steak', 'curry', 'biryani', 'noodles', 'kebab', 'roti'];
      
      // Default to lunch for items that don't match specific keywords
      
      // Check each item in cart
      let breakfastCount = 0;
      let lunchCount = 0;
      let dinnerCount = 0;
      
      cartItems.forEach(item => {
        const itemName = item.name.toLowerCase();
        const itemCategory = item.category?.toLowerCase() || '';
        
        // Check if item name or category contains breakfast keywords
        if (breakfastKeywords.some(keyword => itemName.includes(keyword) || itemCategory.includes(keyword))) {
          breakfastCount++;
        }
        // Check if item name or category contains dinner keywords
        else if (dinnerKeywords.some(keyword => itemName.includes(keyword) || itemCategory.includes(keyword))) {
          dinnerCount++;
        }
        // Default to lunch for other items
        else {
          lunchCount++;
        }
      });
      
      // Determine dominant meal type
      if (breakfastCount > lunchCount && breakfastCount > dinnerCount) {
        return 'breakfast';
      } else if (dinnerCount > lunchCount && dinnerCount > breakfastCount) {
        return 'dinner';
      } else {
        return 'lunch'; // Default to lunch
      }
    };
    
    const mealType = getMealType();
    let deliveryStartTime, deliveryEndTime;
    
    // Set delivery time based on meal type
    if (mealType === 'breakfast') {
      // Breakfast delivery between 8-9am IST
      deliveryStartTime = new Date();
      deliveryStartTime.setHours(8, 0, 0);
      
      deliveryEndTime = new Date();
      deliveryEndTime.setHours(9, 0, 0);
    } else if (mealType === 'lunch') {
      // Lunch delivery between 1-2pm IST
      deliveryStartTime = new Date();
      deliveryStartTime.setHours(13, 0, 0);
      
      deliveryEndTime = new Date();
      deliveryEndTime.setHours(14, 0, 0);
    } else {
      // Dinner delivery between 7-8pm IST
      deliveryStartTime = new Date();
      deliveryStartTime.setHours(19, 0, 0);
      
      deliveryEndTime = new Date();
      deliveryEndTime.setHours(20, 0, 0);
    }
    
    // If current time is after delivery window, set for next day
    if (now > deliveryEndTime) {
      deliveryStartTime.setDate(deliveryStartTime.getDate() + 1);
      deliveryEndTime.setDate(deliveryEndTime.getDate() + 1);
    }
    
    const formatTime = (date) => {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    return `${formatTime(deliveryStartTime)} - ${formatTime(deliveryEndTime)} (${mealType.charAt(0).toUpperCase() + mealType.slice(1)})`;
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
              <Text style={styles.detailValue}>
                {lastOrderedLocation || "No delivery address selected"}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#999" />
          </View>
          
          {/* User Information */}
          <View style={styles.detailRow}>
            <MaterialIcons name="person" size={24} color={THEME_COLOR} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Contact Info</Text>
              <Text style={styles.detailValue}>
                {useUserStore.getState().user?.name || "User"}, {useUserStore.getState().phoneNumber || useUserStore.getState().user?.mobile || "Add phone number"}
              </Text>
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
        <TouchableOpacity 
          style={[styles.payBtn, isPaymentProcessing && styles.payBtnDisabled]} 
          onPress={handlePay}
          disabled={isPaymentProcessing}
        >
          {isPaymentProcessing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.payBtnText}>Pay ₹{total}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Payment Processing Overlay */}
      {(isPaymentProcessing || isLoadingRazorpay) && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color={THEME_COLOR} />
            <Text style={styles.processingText}>
              {isLoadingRazorpay ? 'Preparing payment gateway...' : 'Processing your payment...'}
            </Text>
            <Text style={styles.processingSubtext}>Please don't close the app</Text>
          </View>
        </View>
      )}

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

      {/* Mock Razorpay Modal */}
      <Modal
        visible={showMockRazorpay}
        animationType="slide"
        transparent={false}
      >
        {razorpayOptions && (
          <MockRazorpayCheckout
            options={razorpayOptions}
            onSuccess={razorpayOptions.onSuccess}
            onCancel={razorpayOptions.onCancel}
          />
        )}
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
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  processingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  processingText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333',
  },
  processingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  payBtnDisabled: {
    backgroundColor: '#fda53599',
  },
});

export default CheckoutScreen;