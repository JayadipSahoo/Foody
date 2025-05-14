const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const deliveryStaffSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/.+\@.+\..+/, "Please enter a valid email address"],
        },
        mobile: {
            type: String,
            required: [true, "Mobile number is required"],
            trim: true,
        },
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: [true, "Vendor association is required"],
        },
        vendorCode: {
            type: String,
            required: true,
            trim: true,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        currentLocation: {
            latitude: Number,
            longitude: Number,
            lastUpdated: {
                type: Date,
                default: Date.now,
            },
        },
        role: {
            type: String,
            default: "delivery",
            immutable: true,
        },
        status: {
            type: String,
            enum: ["active", "inactive", "pending"],
            default: "pending",
        },
        currentOrder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const DeliveryStaff = mongoose.model("DeliveryStaff", deliveryStaffSchema);

module.exports = DeliveryStaff;
