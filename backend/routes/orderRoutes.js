const express = require("express");
const router = express.Router();
const {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    getVendorOrders,
    assignDeliveryStaff,
    getDeliveryOrders,
    acceptOrder,
    updateDeliveryOrderStatus,
    updateDeliveryLocation,
} = require("../controllers/orderController");
const { protect, isVendor } = require("../middleware/authMiddleware");

// Apply protection to all routes
router.use(protect);

// Routes
router.route("/").post(createOrder).get(getOrders);

// Delivery staff routes - MUST BE BEFORE THE :id ROUTE TO AVOID CONFLICTS
router.get("/delivery", getDeliveryOrders);
router.post("/delivery/accept/:orderId", acceptOrder);
router.put("/delivery/status/:orderId", updateDeliveryOrderStatus);
router.post("/delivery/location/:orderId", updateDeliveryLocation);

// Vendor can see their orders
router.get("/vendor/:vendorId", isVendor, getVendorOrders);

// Get single order by ID - Put this AFTER other specific routes
router.route("/:id").get(getOrderById);

// Update order status
router.put("/:id/status", isVendor, updateOrderStatus);

// Assign delivery staff to order (vendor only)
router.patch(
    "/:orderId/assign-delivery",
    protect,
    isVendor,
    assignDeliveryStaff
);

module.exports = router;
