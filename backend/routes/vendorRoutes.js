const express = require("express");
const router = express.Router();
const {
    vendorSignup,
    vendorLogin,
    getVendorProfile,
} = require("../controllers/vendorController");
const { protect } = require("../middleware/authMiddleware");

// Vendor routes
router.post("/signup", vendorSignup);
router.post("/login", vendorLogin);
router.get("/profile", protect, getVendorProfile);

module.exports = router;
