const Order = require("../models/Order");
const Menu = require("../models/MenuItem");
const hashItemSnapshot = require("../utils/hashItemSnapshot");
const { mockProcessPayment } = require("../services/paymentService");

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
        const { items, vendorId, deliveryAddress, paymentMethod, specialInstructions } = req.body;
        
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "No items in order" });
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
        
        // If no valid items, return error
        if (orderItems.length === 0) {
            return res.status(400).json({ 
                message: "No valid items in order", 
                details: invalidItems
            });
        }
        
        // If some items were invalid but others were valid, continue with valid ones
        if (invalidItems.length > 0) {
            console.log(`Warning: ${invalidItems.length} invalid items were removed from the order`);
        }
        
        // Mock payment
        const paymentInfo = await mockProcessPayment({ amount: totalAmount, method: paymentMethod });
        if (!paymentInfo || !paymentInfo.success) {
            return res.status(402).json({ message: "Payment failed", paymentInfo });
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
            paymentStatus: "completed"
        });
        
        res.status(201).json({ 
            order, 
            paymentInfo,
            removedItems: invalidItems.length > 0 ? invalidItems : undefined
        });
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
            .populate('customerId', 'name email mobile')
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