const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const vendorSchema = new mongoose.Schema(
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
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
        },
        businessName: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        contactNumber: {
            type: String,
            trim: true,
        },
        locationsServed: [
            {
                type: String,
                trim: true,
            },
        ],
        isAcceptingOrders: {
            type: Boolean,
            default: false,
        },
        notifications: [
            {
                message: String,
                readStatus: {
                    type: Boolean,
                    default: false,
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
vendorSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to check if password matches
vendorSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;
