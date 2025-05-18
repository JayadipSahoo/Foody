const express = require("express");
const router = express.Router();
const {
    createOrder,
    getCustomerOrders,
    getOrderById,
    updateOrderStatus,
    getVendorOrders,
    verifyPayment,
    getRazorpayKey
} = require("../controllers/orderController");
const { protect, isVendor } = require("../middleware/authMiddleware");

// Apply protection to all routes
router.use(protect);

// Routes
router.route("/")
    .post(createOrder);

router.route("/:id")
    .get(getOrderById);

// Update order status
router.put("/:id/status", isVendor, updateOrderStatus);

// Verify payment
router.post("/verify-payment", verifyPayment);
router.get("/razorpay/key", getRazorpayKey);

// Vendor can see their orders
router.get("/vendor/:vendorId", isVendor, getVendorOrders);

// Customer can see their orders
router.get("/customer/:customerId", getCustomerOrders);

module.exports = router; 