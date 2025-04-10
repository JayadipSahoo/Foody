const express = require("express");
const router = express.Router();
const {
    signup,
    login,
    getUserProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Auth routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", protect, getUserProfile);

module.exports = router;
