const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Category is required"],
        },
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: [true, "Vendor is required"],
        },
        image: {
            type: String,
            default: "",
        },
        isVeg: {
            type: Boolean,
            default: false,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        customization: [
            {
                name: String,
                options: [
                    {
                        name: String,
                        price: Number,
                    },
                ],
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Add indexes for better query performance
menuItemSchema.index({ vendorId: 1, categoryId: 1 });
menuItemSchema.index({ name: "text", description: "text" });

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

module.exports = MenuItem;
