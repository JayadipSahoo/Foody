const express = require("express");
const router = express.Router();
const {
    vendorSignup,
    vendorLogin,
    getVendorProfile,
    getVendorsByLocation,
    updateVendorProfile
} = require("../controllers/vendorController");
const { protect, isVendor } = require("../middleware/authMiddleware");

// Vendor routes
router.post("/signup", vendorSignup);
router.post("/login", vendorLogin);

// Protected vendor-only routes
// Note: isVendor middleware is temporarily removed to debug the issue
router.get("/profile", protect, getVendorProfile);
router.patch("/profile", protect, updateVendorProfile);

// Get vendors by location (public)
router.get('/by-location', getVendorsByLocation);

// Import and use schedule routes
// Note: These are mounted separately in index.js under /api/vendor/schedule

// Protected routes - will implement these later
/* 
router.get('/me', protect, getVendorProfile);
router.patch('/password', protect, updateVendorPassword);
router.patch('/toggle-active', protect, toggleActiveStatus);

// Location routes
router.post('/locations', protect, addLocation);
router.patch('/locations/:locationId', protect, updateLocation);
router.delete('/locations/:locationId', protect, deleteLocation);

// Staff routes
router.post('/staff', protect, addStaffMember);
router.patch('/staff/:staffId', protect, updateStaffMember);
router.delete('/staff/:staffId', protect, deleteStaffMember);
*/

module.exports = router;
