const jwt = require("jsonwebtoken");
const DeliveryStaff = require("../models/DeliveryStaff");
const Vendor = require("../models/Vendor");
const asyncHandler = require("express-async-handler");

// Generate JWT token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

// @desc    Register a new delivery staff
// @route   POST /api/delivery/signup
// @access  Public
const deliveryStaffSignup = async (req, res) => {
    try {
        const { name, email, password, mobile, vendorId, vendorCode } =
            req.body;

        // Check if delivery staff exists
        const staffExists = await DeliveryStaff.findOne({ email });

        if (staffExists) {
            return res
                .status(400)
                .json({ message: "Delivery staff already exists" });
        }

        // Check if vendor exists and validate vendor code
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        // Validate vendor code
        const validCode = vendor.deliveryStaffCodes.find(
            (code) => code.code === vendorCode && !code.isUsed
        );

        if (!validCode) {
            return res.status(400).json({ message: "Invalid vendor code" });
        }

        // Create delivery staff
        const deliveryStaff = await DeliveryStaff.create({
            name,
            email,
            password,
            mobile,
            vendorId,
            vendorCode,
            role: "delivery",
            status: "pending", // Admin needs to approve
        });

        if (deliveryStaff) {
            // Update vendor code as used
            await Vendor.findByIdAndUpdate(
                vendorId,
                {
                    $set: {
                        "deliveryStaffCodes.$[elem].isUsed": true,
                        "deliveryStaffCodes.$[elem].assignedTo":
                            deliveryStaff._id,
                    },
                    $push: { deliveryStaff: deliveryStaff._id },
                },
                {
                    arrayFilters: [{ "elem.code": vendorCode }],
                    new: true,
                }
            );

            // Generate token with role
            const token = generateToken(deliveryStaff._id, deliveryStaff.role);

            res.status(201).json({
                _id: deliveryStaff._id,
                name: deliveryStaff.name,
                email: deliveryStaff.email,
                mobile: deliveryStaff.mobile,
                vendorId: deliveryStaff.vendorId,
                status: deliveryStaff.status,
                role: deliveryStaff.role,
                userType: "delivery",
                token,
            });
        } else {
            res.status(400).json({ message: "Invalid delivery staff data" });
        }
    } catch (error) {
        console.error("Error in delivery staff signup: ", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth delivery staff & get token
// @route   POST /api/delivery/login
// @access  Public
const deliveryStaffLogin = async (req, res) => {
    try {
        const { email, password, vendorCode, vendorId } = req.body;

        // At least one authentication method must be provided
        if ((!password && !vendorCode) || !email) {
            return res.status(400).json({
                message:
                    "Please provide email and either password or vendor code",
            });
        }

        // Find delivery staff by email and optionally vendorId
        let query = { email };
        if (vendorId) {
            query.vendorId = vendorId;
        }

        const staff = await DeliveryStaff.findOne(query);

        if (!staff) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        let isAuthenticated = false;

        // Authenticate with password if provided
        if (password) {
            isAuthenticated = await staff.matchPassword(password);
        }
        // Otherwise authenticate with vendor code
        else if (vendorCode && staff.vendorCode === vendorCode) {
            isAuthenticated = true;
        }

        if (!isAuthenticated) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        // If account is pending, don't allow login
        if (staff.status === "pending") {
            return res.status(403).json({
                message: "Your account is pending approval from the vendor",
            });
        }

        // If account is inactive, don't allow login
        if (staff.status === "inactive") {
            return res.status(403).json({
                message: "Your account has been deactivated",
            });
        }

        // Generate token with role
        const token = generateToken(staff._id, staff.role);

        // Get vendor name for response
        const vendor = await Vendor.findById(staff.vendorId);
        const vendorName = vendor ? vendor.name : "Unknown";

        res.json({
            _id: staff._id,
            name: staff.name,
            email: staff.email,
            mobile: staff.mobile,
            vendorId: staff.vendorId,
            vendorName: vendorName,
            status: staff.status,
            isAvailable: staff.isAvailable,
            role: staff.role,
            userType: "delivery",
            token,
        });
    } catch (error) {
        console.error("Error in delivery staff login: ", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get delivery staff profile
// @route   GET /api/delivery/profile
// @access  Private
const getDeliveryStaffProfile = async (req, res) => {
    try {
        // Check if req.user exists before trying to access its properties
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                message: "Not authorized, user ID not found",
            });
        }

        const deliveryStaff = await DeliveryStaff.findById(req.user._id);

        if (deliveryStaff) {
            // Get vendor name
            const vendor = await Vendor.findById(deliveryStaff.vendorId);
            const vendorName = vendor ? vendor.name : "Unknown";

            res.json({
                _id: deliveryStaff._id,
                name: deliveryStaff.name,
                email: deliveryStaff.email,
                mobile: deliveryStaff.mobile,
                vendorId: deliveryStaff.vendorId,
                vendorName: vendorName,
                status: deliveryStaff.status,
                isAvailable: deliveryStaff.isAvailable,
            });
        } else {
            res.status(404).json({ message: "Delivery staff not found" });
        }
    } catch (error) {
        console.error("Error in getDeliveryStaffProfile: ", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all delivery staff for a vendor
// @route   GET /api/delivery/vendor/:vendorId
// @access  Private (Vendor only)
const getVendorDeliveryStaff = async (req, res) => {
    try {
        // Check if req.user exists and has vendor role
        if (!req.user || !req.user._id || req.role !== "vendor") {
            return res.status(401).json({
                message:
                    "Not authorized, only vendors can access this resource",
            });
        }

        // Ensure the vendor is requesting their own delivery staff
        if (req.params.vendorId !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Not authorized to access these delivery staff",
            });
        }

        const deliveryStaff = await DeliveryStaff.find({
            vendorId: req.params.vendorId,
            status: "active",
        }).select("-password");

        res.status(200).json(deliveryStaff);
    } catch (error) {
        console.error("Error in getVendorDeliveryStaff:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Generate vendor code for delivery staff
// @route   POST /api/delivery/code
// @access  Private (Vendor only)
const generateVendorCode = async (req, res) => {
    try {
        // Check if req.user exists and has vendor role
        if (!req.user || !req.user._id || req.role !== "vendor") {
            return res.status(401).json({
                message: "Not authorized, only vendors can generate codes",
            });
        }

        // Generate a random code (6 alphanumeric characters)
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Add code to vendor
        const vendor = await Vendor.findByIdAndUpdate(
            req.user._id,
            {
                $push: {
                    deliveryStaffCodes: {
                        code,
                        isUsed: false,
                        generatedAt: new Date(),
                        assignedTo: null,
                    },
                },
            },
            { new: true }
        );

        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        res.status(201).json({
            code,
            message: "Vendor code generated successfully",
        });
    } catch (error) {
        console.error("Error in generateVendorCode:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Update delivery staff status (approve/reject)
// @route   PATCH /api/delivery/:id/status
// @access  Private (Vendor only)
const updateDeliveryStaffStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !["active", "inactive"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        // Check if req.user exists and has vendor role
        if (!req.user || !req.user._id || req.role !== "vendor") {
            return res.status(401).json({
                message:
                    "Not authorized, only vendors can update delivery staff status",
            });
        }

        // Find the delivery staff
        const deliveryStaff = await DeliveryStaff.findById(req.params.id);

        if (!deliveryStaff) {
            return res
                .status(404)
                .json({ message: "Delivery staff not found" });
        }

        // Ensure the vendor owns this delivery staff
        if (deliveryStaff.vendorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Not authorized to update this delivery staff",
            });
        }

        // Update status
        deliveryStaff.status = status;
        await deliveryStaff.save();

        res.status(200).json({
            _id: deliveryStaff._id,
            name: deliveryStaff.name,
            status: deliveryStaff.status,
            message: `Delivery staff ${
                status === "active" ? "activated" : "deactivated"
            } successfully`,
        });
    } catch (error) {
        console.error("Error in updateDeliveryStaffStatus:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get all vendors
// @route   GET /api/delivery/vendors
// @access  Public
const getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find({ isAcceptingOrders: true }).select(
            "name businessName address"
        );
        res.status(200).json(vendors);
    } catch (error) {
        console.error("Error in getAllVendors:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Register a delivery staff by vendor
// @route   POST /api/delivery/register-by-vendor
// @access  Private (Vendor only)
const registerDeliveryStaff = async (req, res) => {
    try {
        const { name, email, mobile, vendorCode, vendorId } = req.body;

        // Validate required fields
        if (!name || !email || !mobile || !vendorCode) {
            return res.status(400).json({
                message:
                    "Please provide all required fields (name, email, mobile, vendorCode)",
            });
        }

        // Validate vendor ID matches the logged-in vendor
        if (vendorId !== req.user._id.toString()) {
            return res.status(403).json({
                message:
                    "Not authorized to register delivery staff for another vendor",
            });
        }

        // Check if delivery staff exists
        const staffExists = await DeliveryStaff.findOne({ email });
        if (staffExists) {
            return res.status(400).json({
                message: "Delivery staff with this email already exists",
            });
        }

        // Create delivery staff with vendor code (no password needed)
        const deliveryStaffData = {
            name,
            email,
            mobile,
            vendorCode,
            vendorId,
            role: "delivery",
            status: "active", // Auto-approve since vendor is creating it
            isAvailable: true,
        };

        console.log("Creating delivery staff:", deliveryStaffData);

        const deliveryStaff = await DeliveryStaff.create(deliveryStaffData);

        if (deliveryStaff) {
            // Add reference to the delivery staff in the vendor's record
            await Vendor.findByIdAndUpdate(vendorId, {
                $push: { deliveryStaff: deliveryStaff._id },
            });

            res.status(201).json({
                _id: deliveryStaff._id,
                name: deliveryStaff.name,
                email: deliveryStaff.email,
                mobile: deliveryStaff.mobile,
                vendorId: deliveryStaff.vendorId,
                status: deliveryStaff.status,
                message: "Delivery staff registered successfully",
            });
        } else {
            res.status(400).json({ message: "Invalid delivery staff data" });
        }
    } catch (error) {
        console.error("Error in registerDeliveryStaff:", error);
        res.status(500).json({
            message: error.message || "Server error registering delivery staff",
        });
    }
};

// @desc    Get all active delivery staff
// @route   GET /api/delivery/all-active
// @access  Private (Vendor only)
const getAllActiveDeliveryStaff = async (req, res) => {
    try {
        // Only allow vendors to fetch all active delivery staff
        console.log("req.user", req.user);
        if (!req.user || !req.user._id || req.role !== "vendor") {
            return res.status(401).json({
                message:
                    "Not authorized, only vendors can access this resource",
            });
        }
        const deliveryStaff = await DeliveryStaff.find({
            status: "active",
        }).select("-password");
        console.log("hiii");
        res.status(200).json(deliveryStaff);
    } catch (error) {
        console.error("Error in getAllActiveDeliveryStaff:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    deliveryStaffSignup,
    deliveryStaffLogin,
    getDeliveryStaffProfile,
    getVendorDeliveryStaff,
    generateVendorCode,
    updateDeliveryStaffStatus,
    getAllVendors,
    registerDeliveryStaff,
    getAllActiveDeliveryStaff,
};
