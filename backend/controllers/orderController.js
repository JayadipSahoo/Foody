const Order = require("../models/Order");
const Menu = require("../models/MenuItem");
const hashItemSnapshot = require("../utils/hashItemSnapshot");
const { mockProcessPayment } = require("../services/paymentService");
const DeliveryStaff = require("../models/DeliveryStaff");

// @desc    Get all orders for a customer
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.user._id }).sort({
            createdAt: -1,
        });
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error in getOrders:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get a single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Check if user is authorized to view this order
        if (
            order.customerId.toString() !== req.user._id.toString() &&
            order.vendorId.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: "Not authorized" });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error("Error in getOrderById:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const {
            items,
            vendorId,
            deliveryAddress,
            paymentMethod,
            specialInstructions,
        } = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "No items in order" });
        }
        let totalAmount = 0;
        const orderItems = [];
        for (const cartItem of items) {
            const { itemId, quantity, versionHash } = cartItem;
            if (!itemId || typeof quantity !== "number" || !versionHash) {
                return res.status(400).json({ message: "Invalid item format" });
            }
            const menuItem = await Menu.findById(itemId);
            if (!menuItem || !menuItem.isAvailable) {
                return res.status(409).json({
                    message: "Menu has been updated. Please refresh your cart.",
                });
            }
            const currentHash = hashItemSnapshot(menuItem);
            if (currentHash !== versionHash) {
                return res.status(409).json({
                    message: "Menu has been updated. Please refresh your cart.",
                });
            }
            orderItems.push({
                name: menuItem.name,
                price: menuItem.price,
                quantity,
                isVeg: menuItem.isVeg,
            });
            totalAmount += menuItem.price * quantity;
        }
        // Mock payment
        const paymentInfo = await mockProcessPayment({
            amount: totalAmount,
            method: paymentMethod,
        });
        if (!paymentInfo || !paymentInfo.success) {
            return res
                .status(402)
                .json({ message: "Payment failed", paymentInfo });
        }
        // Create order
        const order = await Order.create({
            customerId: req.user._id,
            vendorId,
            items: orderItems,
            totalAmount,
            deliveryAddress,
            paymentMethod,
            specialInstructions,
            status: "pending",
            paymentStatus: "completed",
        });
        res.status(201).json({ order, paymentInfo });
    } catch (error) {
        console.error("Error in createOrder:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get all orders for a vendor
// @route   GET /api/orders/vendor/:vendorId
// @access  Private (Vendor only)
exports.getVendorOrders = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                message: "Not authorized, user ID not found",
                debug: {
                    hasUser: !!req.user,
                    params: req.params,
                },
            });
        }

        // Ensure the vendor is requesting their own orders
        if (req.params.vendorId !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Not authorized to access these orders",
                debug: {
                    requestedVendor: req.params.vendorId,
                    userVendor: req.user._id.toString(),
                },
            });
        }

        const orders = await Order.find({ vendorId: req.params.vendorId })
            .populate("customerId", "name email mobile")
            .sort({ createdAt: -1 });

        res.status(200).json(orders);
    } catch (error) {
        console.error("Error in getVendorOrders:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Vendor only)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // Validate status
        const validStatuses = [
            "pending",
            "accepted",
            "preparing",
            "ready",
            "delivered",
            "cancelled",
        ];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Ensure the vendor owns this order
        if (order.vendorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        order.status = status;
        await order.save();

        res.status(200).json(order);
    } catch (error) {
        console.error("Error in updateOrderStatus:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Assign a delivery staff to an order
exports.assignDeliveryStaff = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { deliveryStaffId } = req.body;
        if (!deliveryStaffId) {
            return res
                .status(400)
                .json({ message: "deliveryStaffId is required" });
        }
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        // If there was a previous delivery staff assigned, clear their currentOrder
        if (
            order.deliveryStaffId &&
            order.deliveryStaffId.toString() !== deliveryStaffId
        ) {
            await DeliveryStaff.findByIdAndUpdate(order.deliveryStaffId, {
                currentOrder: null,
            });
        }
        // Assign the new delivery staff to the order
        order.deliveryStaffId = deliveryStaffId;
        await order.save();
        // Set the currentOrder for the assigned delivery staff
        await DeliveryStaff.findByIdAndUpdate(deliveryStaffId, {
            currentOrder: orderId,
        });
        res.status(200).json({
            message: "Delivery staff assigned successfully",
            order,
        });
    } catch (error) {
        console.error("Error assigning delivery staff:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get orders for delivery staff (available and assigned)
// @route   GET /api/orders/delivery
// @access  Private (Delivery staff only)
exports.getDeliveryOrders = async (req, res) => {
    try {
        // Check if user is a delivery staff
        if (req.user.role !== "delivery") {
            return res.status(403).json({
                message:
                    "Not authorized. Only delivery staff can access this endpoint.",
            });
        }

        // Get all available orders (ready for pickup) that don't have delivery staff assigned
        const availableOrders = await Order.find({
            status: "ready",
            deliveryStaffId: { $exists: false },
        }).populate("vendorId", "name address");

        // Get orders assigned to this delivery staff
        const assignedOrders = await Order.find({
            deliveryStaffId: req.user._id,
        }).populate("vendorId", "name address");

        res.status(200).json({
            availableOrders,
            assignedOrders,
        });
    } catch (error) {
        console.error("Error in getDeliveryOrders:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Accept an order for delivery
// @route   POST /api/orders/delivery/accept/:orderId
// @access  Private (Delivery staff only)
exports.acceptOrder = async (req, res) => {
    try {
        // Check if user is a delivery staff
        if (req.user.role !== "delivery") {
            return res.status(403).json({
                message:
                    "Not authorized. Only delivery staff can access this endpoint.",
            });
        }

        const { orderId } = req.params;

        // Find the order
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Check if order is available for delivery
        if (order.status !== "ready") {
            return res
                .status(400)
                .json({ message: "This order is not ready for delivery yet" });
        }

        // Check if already assigned
        if (order.deliveryStaffId) {
            return res.status(400).json({
                message: "This order is already assigned to a delivery staff",
            });
        }

        // Assign to this delivery staff
        order.deliveryStaffId = req.user._id;
        order.status = "out_for_delivery";
        await order.save();

        // Update delivery staff's current order
        await DeliveryStaff.findByIdAndUpdate(req.user._id, {
            currentOrder: orderId,
        });

        res.status(200).json({
            message: "Order accepted successfully",
            order,
        });
    } catch (error) {
        console.error("Error in acceptOrder:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Update delivery order status
// @route   PUT /api/orders/delivery/status/:orderId
// @access  Private (Delivery staff only)
exports.updateDeliveryOrderStatus = async (req, res) => {
    try {
        // Check if user is a delivery staff
        if (req.user.role !== "delivery") {
            return res.status(403).json({
                message:
                    "Not authorized. Only delivery staff can access this endpoint.",
            });
        }

        const { orderId } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ["picked_up", "on_the_way", "delivered"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        // Find the order
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Check if this delivery staff is assigned to this order
        if (order.deliveryStaffId.toString() !== req.user._id.toString()) {
            return res
                .status(403)
                .json({ message: "Not authorized to update this order" });
        }

        // Update status
        order.status = status;
        await order.save();

        // If delivered, clear currentOrder from delivery staff
        if (status === "delivered") {
            await DeliveryStaff.findByIdAndUpdate(req.user._id, {
                currentOrder: null,
            });
        }

        res.status(200).json({
            message: "Order status updated successfully",
            order,
        });
    } catch (error) {
        console.error("Error in updateDeliveryOrderStatus:", error);
        res.status(500).json({ message: "Server error" });
    }
};
