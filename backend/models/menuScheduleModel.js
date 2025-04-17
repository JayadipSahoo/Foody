const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    image: {
        type: String,
    },
    isVeg: {
        type: Boolean,
        default: false,
    },
    mealType: {
        type: String,
        enum: ["breakfast", "lunch", "dinner"],
        default: "lunch",
    },
}, { _id: false });

const dayScheduleSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: true,
        min: 0,
        max: 6, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    items: [menuItemSchema],
}, { _id: false });

const specialScheduleSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    items: [menuItemSchema],
}, { _id: false });

const menuScheduleSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Vendor',
    },
    title: {
        type: String,
        required: [true, "Schedule title is required"],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    daySchedule: [dayScheduleSchema],
    specialSchedules: [specialScheduleSchema],
}, { timestamps: true });

// Only one menu schedule can be active at a time for a vendor
menuScheduleSchema.pre('save', async function(next) {
    if (this.isActive) {
        // Find other active menu schedules for this vendor and deactivate them
        await this.constructor.updateMany(
            { 
                vendor: this.vendor, 
                _id: { $ne: this._id }, 
                isActive: true 
            },
            { isActive: false }
        );
    }
    next();
});

// Add indexes for better query performance
menuScheduleSchema.index({ vendor: 1 });
menuScheduleSchema.index({ "daySchedule.day": 1 });
menuScheduleSchema.index({ "specialSchedules.date": 1 });

module.exports = mongoose.model('MenuSchedule', menuScheduleSchema); 