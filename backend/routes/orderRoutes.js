const express = require("express");
const router = express.Router();
const {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    getVendorOrders,
} = require("../controllers/orderController");
const { protect, isVendor } = require("../middleware/authMiddleware");

// Apply protection to all routes
router.use(protect);

// Routes
router.route("/")
    .post(createOrder)
    .get(getOrders);

router.route("/:id")
    .get(getOrderById);

// Update order status
router.put("/:id/status", isVendor, updateOrderStatus);

// Vendor can see their orders
router.get("/vendor/:vendorId", isVendor, getVendorOrders);

module.exports = router; 