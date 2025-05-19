const Order = require("../models/Order");
const Menu = require("../models/MenuItem");
const hashItemSnapshot = require("../utils/hashItemSnapshot");
const razorpayService = require('../services/razorpayService');
const DeliveryStaff = require("../models/DeliveryStaff");

// @desc    Get all orders for a customer
// @route   GET /api/orders
// @access  Private
exports.getCustomerOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.user._id })
            .populate('vendorId', 'businessName contactNumber email')
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
        const orderId = req.params.id;

        // Validate orderId format to prevent casting errors
        if (
            !orderId ||
            typeof orderId !== "string" ||
            orderId === "[object Object]"
        ) {
            return res.status(400).json({ message: "Invalid order ID format" });
        }

        const order = await Order.findById(orderId)
            .populate("vendorId", "name address")
            .populate("customerId", "name email mobile");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Check if user is authorized to view this order
        if (
            order.customerId &&
            order.customerId._id &&
            order.customerId._id.toString() !== req.user._id.toString() &&
            order.vendorId &&
            order.vendorId._id &&
            order.vendorId._id.toString() !== req.user._id.toString() &&
            (!order.deliveryStaffId ||
                order.deliveryStaffId.toString() !== req.user._id.toString()) &&
            req.user.role !== "delivery"
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
        
        // Validate payment method
        if (!paymentMethod || !['razorpay', 'cod'].includes(paymentMethod)) {
            return res.status(400).json({ message: "Invalid payment method. Please choose razorpay or cod." });
        }
        
        let totalAmount = 0;
        const orderItems = [];
        const invalidItems = [];
        
        for (const cartItem of items) {
            let { itemId, quantity, versionHash, isScheduled } = cartItem;
            
            console.log(`Processing order item: ${itemId}, Scheduled: ${isScheduled}, Quantity: ${quantity}`);
            
            // Basic validation
            if (!quantity || typeof quantity !== 'number') {
                console.log(`Invalid quantity for item ${itemId}`);
                invalidItems.push("Item with invalid quantity");
                continue;
            }
            
            // For scheduled items without proper IDs, we can't look them up in the database
            // but we need to let them through since they're already validated by time windows
            if (isScheduled && (!itemId || itemId.startsWith('scheduled-') || itemId.startsWith('tomorrow-'))) {
                console.log(`Processing scheduled item without proper DB ID: ${itemId || 'missing'}`);
                
                // Try to get a name from hash if available
                let name = cartItem.name || "Scheduled Menu Item";
                let price = cartItem.price || 0;
                
                if (typeof price !== 'number') {
                    price = parseFloat(price) || 0;
                }
                
                // Add directly to order items
                orderItems.push({
                    name,
                    price,
                    quantity,
                    isVeg: !!cartItem.isVeg,
                    isScheduled: true
                });
                
                totalAmount += price * quantity;
                continue;
            }
            
            // For regular items, we require an itemId
            if (!itemId) {
                console.log(`Missing itemId for regular item`);
                invalidItems.push("Item without ID");
                continue;
            }
            
            // For regular items or scheduled items with DB IDs, verify them
            try {
                const menuItem = await Menu.findById(itemId);
                
                // For debugging
                console.log(`Menu item from DB: ${menuItem ? menuItem.name : 'Not found'}, isAvailable: ${menuItem ? menuItem.isAvailable : 'N/A'}`);
                
                // If item not found, skip it
                if (!menuItem) {
                    console.log(`Menu item not found in DB: ${itemId}`);
                    invalidItems.push(`Menu item not found: ${itemId}`);
                    continue;
                }
                
                // Skip availability check for scheduled items, they should always be orderable when visible
                if (!isScheduled && !menuItem.isAvailable) {
                    console.log(`Item not available: ${menuItem.name}`);
                    invalidItems.push(`Item not available: ${menuItem.name}`);
                    continue;
                }
                
                // Skip hash check for scheduled items
                if (!isScheduled && versionHash) {
                    const currentHash = hashItemSnapshot(menuItem);
                    if (currentHash !== versionHash) {
                        console.log(`Version mismatch for item ${menuItem.name}`);
                        invalidItems.push(`Item updated: ${menuItem.name}`);
                        continue;
                    }
                }
                
                orderItems.push({
                    name: menuItem.name,
                    price: menuItem.price,
                    quantity,
                    isVeg: menuItem.isVeg,
                    isScheduled: isScheduled || false
                });
                
                totalAmount += menuItem.price * quantity;
            } catch (err) {
                console.error(`Error processing item ${itemId}:`, err);
                invalidItems.push(`Error processing item: ${itemId}`);
            }
        }
        
        // If any items are invalid, reject the entire order
        if (invalidItems.length > 0) {
            return res.status(400).json({ 
                message: "Menu for this restaurant was updated. Please refresh your cart.",
                invalidItems,
                shouldEmptyCart: true
            });
        }
        
        // If no valid items, return error
        if (orderItems.length === 0) {
            return res.status(400).json({ 
                message: "No valid items in order"
            });
        }
        
        // Create Razorpay order if payment method is razorpay
        let razorpayOrder = null;
        if (paymentMethod === 'razorpay') {
            razorpayOrder = await razorpayService.createRazorpayOrder(totalAmount);
        }
        
        // Create order in database
        const orderData = {
            customerId: req.user._id,
            vendorId,
            items: orderItems,
            totalAmount,
            deliveryAddress,
            paymentMethod,
            specialInstructions,
            status: paymentMethod === 'cod' ? 'pending' : 'payment-pending',
            paymentInfo: {
                paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending'
            }
        };
        
        // Add Razorpay order ID if it exists
        if (razorpayOrder) {
            orderData.paymentInfo.razorpayOrderId = razorpayOrder.id;
        }
        
        const order = await Order.create(orderData);
        
        const response = {
            order
        };
        
        // Add Razorpay details to response if needed
        if (razorpayOrder) {
            response.razorpayOrder = {
                id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency
            };
        }
        
        res.status(201).json(response);
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

        // If there was a previous delivery staff assigned, remove this order from their assignedOrders
        if (
            order.deliveryStaffId &&
            order.deliveryStaffId.toString() !== deliveryStaffId
        ) {
            await DeliveryStaff.findByIdAndUpdate(order.deliveryStaffId, {
                $pull: { assignedOrders: orderId },
            });
        }

        // Assign the new delivery staff to the order
        order.deliveryStaffId = deliveryStaffId;
        await order.save();

        // Add this order to the delivery staff's assignedOrders array if not already there
        await DeliveryStaff.findByIdAndUpdate(deliveryStaffId, {
            $addToSet: { assignedOrders: orderId },
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

        // Add to delivery staff's assignedOrders array
        await DeliveryStaff.findByIdAndUpdate(req.user._id, {
            $addToSet: { assignedOrders: orderId },
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

        // If delivered, remove order from assigned orders array
        if (status === "delivered") {
            await DeliveryStaff.findByIdAndUpdate(req.user._id, {
                $pull: { assignedOrders: orderId },
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

// @desc    Update delivery staff location
// @route   POST /api/orders/delivery/location/:orderId
// @access  Private (Delivery staff only)
exports.updateDeliveryLocation = async (req, res) => {
    try {
        // Check if user is a delivery staff
        if (req.user.role !== "delivery") {
            return res.status(403).json({
                message:
                    "Not authorized. Only delivery staff can access this endpoint.",
            });
        }

        const { orderId } = req.params;
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return res
                .status(400)
                .json({ message: "Latitude and longitude are required" });
        }

        // Find the order
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Check if this delivery staff is assigned to this order
        if (
            order.deliveryStaffId &&
            order.deliveryStaffId.toString() !== req.user._id.toString()
        ) {
            return res
                .status(403)
                .json({ message: "Not authorized to update this order" });
        }

        // Update the delivery location
        // Note: You would typically store this in a separate collection or use a real-time database
        // For simplicity, we'll just acknowledge the update

        res.status(200).json({
            message: "Delivery location updated successfully",
        });
    } catch (error) {
        console.error("Error in updateDeliveryLocation:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// @desc    Verify Razorpay payment
// @route   POST /api/orders/verify-payment
// @access  Private
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpayPaymentSignature } = req.body;
        
        // Find the order
        const order = await Order.findOne({ 'paymentInfo.razorpayOrderId': razorpayOrderId });
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        // Check if user is authorized to verify this payment
        if (order.customerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }
        
        // Verify signature
        const isValid = razorpayService.verifyPaymentSignature(
            razorpayOrderId,
            razorpayPaymentId,
            razorpayPaymentSignature
        );
        
        if (!isValid) {
            return res.status(400).json({ message: "Invalid payment signature" });
        }
        
        // Update order
        order.paymentInfo.razorpayPaymentId = razorpayPaymentId;
        order.paymentInfo.razorpayPaymentSignature = razorpayPaymentSignature;
        order.status = "pending"; // Change from payment-pending to pending
        order.paymentInfo.paymentStatus = "completed";
        
        await order.save();
        
        res.status(200).json({ order });
    } catch (error) {
        console.error("Error in verifyPayment:", error);
        res.status(500).json({ message: "Server error" });
    }
}; 

exports.getRazorpayKey = async (req, res) => {
    try {
        const key = process.env.RAZORPAY_KEY_ID;
        res.status(200).json({ key });
    } catch (error) {
        console.error("Error in getRazorpayKey:", error);
        res.status(500).json({ message: "Server error" });
    }
};