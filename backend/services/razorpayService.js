const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance with API keys
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Create a new Razorpay order
 * @param {Number} amount - Amount in rupees (will be converted to paise)
 * @returns {Object} Razorpay order object
 */
exports.createRazorpayOrder = async (amount) => {
  try {
    const options = {
      amount: amount * 100,  // Convert to paise (Razorpay uses smallest currency unit)
      currency: "INR"
    };
    
    const order = await instance.orders.create(options);
    return order;
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw new Error("Failed to create payment order");
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
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + "|" + paymentId)
      .digest("hex");
    
    return generatedSignature === signature;
  } catch (error) {
    console.error("Error verifying payment:", error);
    return false;
  }
};

/**
 * Export the Razorpay instance for direct access if needed
 */
exports.razorpay = instance; 