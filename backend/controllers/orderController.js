const Order = require("../models/Order");

// @desc    Get all orders for a customer
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.user._id })
            .sort({ createdAt: -1 });
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
        if (order.customerId.toString() !== req.user._id.toString() && 
            order.vendorId.toString() !== req.user._id.toString()) {
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
            totalAmount,
            deliveryAddress,
            paymentMethod,
            specialInstructions
        } = req.body;

        const order = await Order.create({
            customerId: req.user._id,
            vendorId,
            items,
            totalAmount,
            deliveryAddress,
            paymentMethod,
            specialInstructions,
            status: "pending"
        });

        res.status(201).json(order);
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
                    params: req.params
                }
            });
        }

        // Ensure the vendor is requesting their own orders
        if (req.params.vendorId !== req.user._id.toString()) {
            return res.status(403).json({ 
                message: "Not authorized to access these orders",
                debug: {
                    requestedVendor: req.params.vendorId,
                    userVendor: req.user._id.toString()
                }
            });
        }

        const orders = await Order.find({ vendorId: req.params.vendorId })
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
        const validStatuses = ["pending", "accepted", "preparing", "ready", "delivered", "cancelled"];
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