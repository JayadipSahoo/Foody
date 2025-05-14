const express = require("express");
const router = express.Router();
const {
    deliveryStaffSignup,
    deliveryStaffLogin,
    getDeliveryStaffProfile,
    getVendorDeliveryStaff,
    generateVendorCode,
    updateDeliveryStaffStatus,
    getAllVendors,
    registerDeliveryStaff,
} = require("../controllers/deliveryStaffController");
const { protect, checkRole } = require("../middleware/authMiddleware");

// Public routes
router.post("/signup", deliveryStaffSignup);
router.post("/login", deliveryStaffLogin);
router.get("/vendors", getAllVendors);

// Protected routes - delivery staff
router.get("/profile", protect, getDeliveryStaffProfile);

// Protected routes - vendor only
router.get(
    "/vendor/:vendorId",
    protect,
    checkRole("vendor"),
    getVendorDeliveryStaff
);
router.post("/code", protect, checkRole("vendor"), generateVendorCode);
router.patch(
    "/:id/status",
    protect,
    checkRole("vendor"),
    updateDeliveryStaffStatus
);

// Add the missing register-by-vendor route
router.post(
    "/register-by-vendor",
    protect,
    checkRole("vendor"),
    registerDeliveryStaff
);

module.exports = router;
