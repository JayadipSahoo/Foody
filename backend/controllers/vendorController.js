const jwt = require("jsonwebtoken");
const Vendor = require("../models/Vendor");

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

// @desc    Register a new vendor
// @route   POST /api/vendor/signup
// @access  Public
const vendorSignup = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            businessName,
            address,
            contactNumber,
            locationsServed,
        } = req.body;

        // Check if vendor exists
        const vendorExists = await Vendor.findOne({ email });

        if (vendorExists) {
            return res.status(400).json({ message: "Vendor already exists" });
        }

        // Create vendor
        const vendor = await Vendor.create({
            name,
            email,
            password,
            businessName,
            address,
            contactNumber,
            locationsServed: locationsServed || [],
        });

        if (vendor) {
            res.status(201).json({
                _id: vendor._id,
                name: vendor.name,
                email: vendor.email,
                businessName: vendor.businessName,
                address: vendor.address,
                contactNumber: vendor.contactNumber,
                locationsServed: vendor.locationsServed,
                isAcceptingOrders: vendor.isAcceptingOrders,
                userType: "vendor", // Adding userType to distinguish between customer and vendor
                token: generateToken(vendor._id),
            });
        } else {
            res.status(400).json({ message: "Invalid vendor data" });
        }
    } catch (error) {
        console.error("Error in vendor signup: ", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth vendor & get token
// @route   POST /api/vendor/login
// @access  Public
const vendorLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for vendor email
        const vendor = await Vendor.findOne({ email });

        if (!vendor) {
            return res
                .status(401)
                .json({ message: "Invalid email or password" });
        }

        // Check if password matches
        const isMatch = await vendor.matchPassword(password);

        if (!isMatch) {
            return res
                .status(401)
                .json({ message: "Invalid email or password" });
        }

        res.json({
            _id: vendor._id,
            name: vendor.name,
            email: vendor.email,
            businessName: vendor.businessName,
            address: vendor.address,
            contactNumber: vendor.contactNumber,
            locationsServed: vendor.locationsServed,
            isAcceptingOrders: vendor.isAcceptingOrders,
            userType: "vendor", // Adding userType to distinguish between customer and vendor
            token: generateToken(vendor._id),
        });
    } catch (error) {
        console.error("Error in vendor login: ", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get vendor profile
// @route   GET /api/vendor/profile
// @access  Private
const getVendorProfile = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.user._id);

        if (vendor) {
            res.json({
                _id: vendor._id,
                name: vendor.name,
                email: vendor.email,
                businessName: vendor.businessName,
                address: vendor.address,
                contactNumber: vendor.contactNumber,
                locationsServed: vendor.locationsServed,
                isAcceptingOrders: vendor.isAcceptingOrders,
            });
        } else {
            res.status(404).json({ message: "Vendor not found" });
        }
    } catch (error) {
        console.error("Error in getVendorProfile: ", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { vendorSignup, vendorLogin, getVendorProfile };
