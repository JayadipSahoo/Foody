const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"],
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    isVeg: {
        type: Boolean,
        default: false,
    },
});

const orderSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
        },
        items: [orderItemSchema],
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: [
                "pending",
                "accepted",
                "preparing",
                "ready",
                "delivered",
                "cancelled",
            ],
            default: "pending",
        },
        deliveryAddress: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            landmark: String,
        },
        paymentMethod: {
            type: String,
            enum: ["cash", "card", "upi"],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending",
        },
        specialInstructions: {
            type: String,
            trim: true,
        },
        deliveryStaffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliveryStaff",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Add indexes for better query performance
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ vendorId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
