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
} = require("../controllers/menuController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Apply protection to all routes - only authenticated users can access
router.use(protect);
router.use(authorize("vendor"));

// Menu item routes
router.route("/").get(getMenuItems).post(createMenuItem);

router
    .route("/:id")
    .get(getMenuItem)
    .put(updateMenuItem)
    .delete(deleteMenuItem);

router.patch("/:id/availability", toggleItemAvailability);

// Category routes
router.route("/categories").get(getCategories).post(createCategory);

router.route("/categories/:id").put(updateCategory).delete(deleteCategory);

module.exports = router;
