const Razorpay = require('razorpay');
const crypto = require('crypto');

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';

// Fallback values for development (do not use in production)
// Using test credentials from Razorpay documentation for development
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'thisissupposedtobeaskeykeysecretformasternewtestaccount';

// Log warning if using fallback values
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('WARNING: Using default test Razorpay credentials. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables for production use.');
} else {
  console.log(`Razorpay initialized in ${isProduction ? 'PRODUCTION' : 'TEST'} mode`);
}

// Initialize Razorpay instance with API keys
let instance;
try {
  instance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
});
  console.log('Razorpay instance created successfully');
} catch (error) {
  console.error('Failed to initialize Razorpay:', error);
  // Create a dummy instance that logs errors instead of crashing
  instance = {
    orders: {
      create: async () => {
        console.error('Attempted to create order with invalid Razorpay instance');
        throw new Error('Razorpay not properly initialized');
      },
      fetch: async () => {
        console.error('Attempted to fetch order with invalid Razorpay instance');
        throw new Error('Razorpay not properly initialized');
      }
    }
  };
}

/**
 * Create a new Razorpay order
 * @param {Number} amount - Amount in rupees (will be converted to paise)
 * @returns {Object} Razorpay order object
 */
exports.createRazorpayOrder = async (amount) => {
  try {
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error(`Invalid amount: ${amount}. Amount must be a positive number.`);
    }
    
    const amountInPaise = Math.round(amount * 100);
    console.log(`Creating Razorpay order for amount: ₹${amount} (${amountInPaise} paise)`);
    
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1 // Auto-capture payment
    };
    
    const order = await instance.orders.create(options);
    console.log(`Razorpay order created: ${order.id}`);
    return order;
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    // Provide more helpful error message based on the type of error
    if (error.error && error.error.description) {
      throw new Error(`Razorpay error: ${error.error.description}`);
    } else if (error.statusCode === 401) {
      throw new Error("Payment gateway authentication failed. Please check your API keys.");
    } else {
      throw new Error(`Failed to create payment order: ${error.message}`);
    }
  }
};

/**
 * Verify Razorpay payment signature
 * @param {String} orderId - Razorpay order ID
 * @param {String} paymentId - Razorpay payment ID
 * @param {String} signature - Razorpay signature
 * @returns {Boolean} Whether signature is valid
 */
exports.verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    // Validate inputs to prevent errors
    if (!orderId || !paymentId || !signature) {
      console.error("Missing required parameters for signature verification");
      return false;
    }
    
    console.log(`Verifying signature for payment ${paymentId}, order ${orderId}`);
    
    const payload = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest("hex");
    
    const isValid = generatedSignature === signature;
    console.log(`Signature verification ${isValid ? 'succeeded' : 'failed'}`);
    
    return isValid;
  } catch (error) {
    console.error("Error verifying payment signature:", error);
    return false;
  }
};

/**
 * Get Razorpay order status
 * @param {String} orderId - Razorpay order ID
 * @returns {Object} Order details from Razorpay
 */
exports.getOrderStatus = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error("Order ID is required");
    }
    
    const order = await instance.orders.fetch(orderId);
    return order;
  } catch (error) {
    console.error(`Error fetching Razorpay order ${orderId}:`, error);
    throw new Error(`Failed to fetch order status: ${error.message}`);
  }
};

/**
 * Export the Razorpay instance for direct access if needed
 */
exports.razorpay = instance; 