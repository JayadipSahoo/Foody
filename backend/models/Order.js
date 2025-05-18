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
        min: 1
    },
    isVeg: {
        type: Boolean,
        default: false,
    }
});

const orderSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true
        },
        items: [orderItemSchema],
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        status: {
            type: String,
            enum: ["payment-pending", "pending", "accepted", "preparing", "ready", "delivered", "cancelled"],
            default: "payment-pending"
        },
        deliveryAddress: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            landmark: String
        },
        paymentMethod: {
            type: String,
            enum: ["razorpay", "cod"],
            required: true
        },
        paymentInfo: {
            paymentStatus: {
                type: String,
                enum: ["pending", "completed", "failed", "refunded"],
                default: "pending"
            },
            razorpayOrderId: {
                type: String,
                default: null
            },
            razorpayPaymentId: {
                type: String,
                default: null
            },
            razorpayPaymentSignature: {
                type: String,
                default: null
            }
        },
        specialInstructions: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// Add indexes for better query performance
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ vendorId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ razorpayOrderId: 1 });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;