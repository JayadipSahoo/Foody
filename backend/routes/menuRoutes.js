const express = require("express");
const router = express.Router();
const {
    getMenuItems,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleItemAvailability,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getVendorMenu,
} = require("../controllers/menuController");
const { protect, isVendor } = require("../middleware/authMiddleware");

// Public route for customers to view vendor menus
router.get("/vendor/:vendorId", getVendorMenu);

// Apply protect middleware to all routes
router.use(protect);

// Menu item routes - add isVendor middleware for vendor-only actions
router.route("/").get(getMenuItems).post(isVendor, createMenuItem);

router
    .route("/:id")
    .get(getMenuItem)
    .put(isVendor, updateMenuItem)
    .delete(isVendor, deleteMenuItem);

router.patch("/:id/availability", isVendor, toggleItemAvailability);

// Category routes
router.route("/categories").get(getCategories).post(createCategory);

router.route("/categories/:id").put(updateCategory).delete(deleteCategory);

module.exports = router;
