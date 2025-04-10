const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: [true, "Vendor is required"],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Add indexes for better query performance
categorySchema.index({ vendorId: 1 });
categorySchema.index({ displayOrder: 1 });

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
