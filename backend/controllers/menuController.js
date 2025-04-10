const MenuItem = require("../models/MenuItem");
const Category = require("../models/Category");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// @desc    Get all menu items for a vendor
// @route   GET /api/menu
// @access  Private (Vendor)
exports.getMenuItems = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const vendorId = req.user._id;
        const { category, search, isAvailable, isVeg, featured } = req.query;

        // Build filter object
        const filter = { vendorId };

        // Add filters based on query parameters
        if (category && mongoose.Types.ObjectId.isValid(category)) {
            filter.categoryId = category;
        }

        if (isAvailable !== undefined) {
            filter.isAvailable = isAvailable === "true";
        }

        if (isVeg !== undefined) {
            filter.isVeg = isVeg === "true";
        }

        if (featured !== undefined) {
            filter.isFeatured = featured === "true";
        }

        // Add search filter if provided
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        // Get menu items
        const menuItems = await MenuItem.find(filter)
            .populate("categoryId", "name")
            .sort({ createdAt: -1 });

        res.status(200).json(menuItems);
    } catch (error) {
        console.error("Error in getMenuItems:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get a single menu item
// @route   GET /api/menu/:id
// @access  Private (Vendor)
exports.getMenuItem = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const menuItem = await MenuItem.findOne({
            _id: req.params.id,
            vendorId: req.user._id,
        }).populate("categoryId", "name");

        if (!menuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        res.status(200).json(menuItem);
    } catch (error) {
        console.error("Error in getMenuItem:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Create a new menu item
// @route   POST /api/menu
// @access  Private (Vendor)
exports.createMenuItem = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const vendorId = req.user._id;

        // Check if category exists and belongs to the vendor
        const category = await Category.findOne({
            _id: req.body.categoryId,
            vendorId,
        });

        if (!category) {
            return res.status(400).json({ message: "Invalid category" });
        }

        // Create menu item
        const menuItem = new MenuItem({
            ...req.body,
            vendorId,
        });

        const createdItem = await menuItem.save();

        // Populate category details for response
        await createdItem.populate("categoryId", "name");

        res.status(201).json(createdItem);
    } catch (error) {
        console.error("Error in createMenuItem:", error);
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(
                (val) => val.message
            );
            return res.status(400).json({ message: messages.join(", ") });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private (Vendor)
exports.updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const vendorId = req.user._id;

        // Check if menu item exists and belongs to the vendor
        let menuItem = await MenuItem.findOne({ _id: id, vendorId });

        if (!menuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        // If categoryId is being updated, verify it exists and belongs to the vendor
        if (
            req.body.categoryId &&
            req.body.categoryId !== menuItem.categoryId.toString()
        ) {
            const category = await Category.findOne({
                _id: req.body.categoryId,
                vendorId,
            });

            if (!category) {
                return res.status(400).json({ message: "Invalid category" });
            }
        }

        // Update menu item
        menuItem = await MenuItem.findByIdAndUpdate(
            id,
            { ...req.body },
            { new: true, runValidators: true }
        ).populate("categoryId", "name");

        res.status(200).json(menuItem);
    } catch (error) {
        console.error("Error in updateMenuItem:", error);
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(
                (val) => val.message
            );
            return res.status(400).json({ message: messages.join(", ") });
        }
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private (Vendor)
exports.deleteMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findOne({
            _id: req.params.id,
            vendorId: req.user._id,
        });

        if (!menuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        await menuItem.deleteOne();

        res.status(200).json({ message: "Menu item removed" });
    } catch (error) {
        console.error("Error in deleteMenuItem:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Toggle availability of a menu item
// @route   PATCH /api/menu/:id/availability
// @access  Private (Vendor)
exports.toggleItemAvailability = async (req, res) => {
    try {
        const { isAvailable } = req.body;

        if (isAvailable === undefined) {
            return res
                .status(400)
                .json({ message: "isAvailable field is required" });
        }

        const menuItem = await MenuItem.findOneAndUpdate(
            { _id: req.params.id, vendorId: req.user._id },
            { isAvailable },
            { new: true }
        );

        if (!menuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        res.status(200).json(menuItem);
    } catch (error) {
        console.error("Error in toggleItemAvailability:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get all categories for a vendor
// @route   GET /api/menu/categories
// @access  Private (Vendor)
exports.getCategories = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const vendorId = req.user._id;

        const categories = await Category.find({ vendorId }).sort({
            displayOrder: 1,
            name: 1,
        });

        res.status(200).json(categories);
    } catch (error) {
        console.error("Error in getCategories:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Create a new category
// @route   POST /api/menu/categories
// @access  Private (Vendor)
exports.createCategory = async (req, res) => {
    try {
        console.log(req.body);
        const vendorId = req.user._id;

        // Check if category with same name already exists for this vendor
        const existingCategory = await Category.findOne({
            name: req.body.name,
            vendorId,
        });

        if (existingCategory) {
            return res.status(400).json({ message: "Category already exists" });
        }

        // Create category
        const category = new Category({
            ...req.body,
            vendorId,
        });

        const createdCategory = await category.save();

        res.status(201).json(createdCategory);
    } catch (error) {
        console.error("Error in createCategory:", error);
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(
                (val) => val.message
            );
            return res.status(400).json({ message: messages.join(", ") });
        }
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Update a category
// @route   PUT /api/menu/categories/:id
// @access  Private (Vendor)
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const vendorId = req.user._id;

        // Check if category exists and belongs to the vendor
        let category = await Category.findOne({ _id: id, vendorId });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // If name is being updated, check if it already exists
        if (req.body.name && req.body.name !== category.name) {
            const existingCategory = await Category.findOne({
                name: req.body.name,
                vendorId,
                _id: { $ne: id },
            });

            if (existingCategory) {
                return res.status(400).json({
                    message: "Category with this name already exists",
                });
            }
        }

        // Update category
        category = await Category.findByIdAndUpdate(
            id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        res.status(200).json(category);
    } catch (error) {
        console.error("Error in updateCategory:", error);
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(
                (val) => val.message
            );
            return res.status(400).json({ message: messages.join(", ") });
        }
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Delete a category
// @route   DELETE /api/menu/categories/:id
// @access  Private (Vendor)
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const vendorId = req.user._id;

        // Start a transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Check if category exists and belongs to the vendor
            const category = await Category.findOne({
                _id: id,
                vendorId,
            }).session(session);

            if (!category) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: "Category not found" });
            }

            // Check if any menu items are using this category
            const menuItemsCount = await MenuItem.countDocuments({
                categoryId: id,
            }).session(session);

            if (menuItemsCount > 0) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    message:
                        "Cannot delete category. It has menu items associated with it.",
                });
            }

            // Delete category
            await Category.findByIdAndDelete(id).session(session);

            await session.commitTransaction();
            session.endSession();

            res.status(200).json({ message: "Category removed" });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    } catch (error) {
        console.error("Error in deleteCategory:", error);
        res.status(500).json({ message: "Server error" });
    }
};
