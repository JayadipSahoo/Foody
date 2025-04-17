const jwt = require("jsonwebtoken");
const Vendor = require("../models/Vendor");
const asyncHandler = require("express-async-handler");

// Generate JWT token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
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

        // Create vendor with role field
        const vendor = await Vendor.create({
            name,
            email,
            password,
            businessName,
            address,
            contactNumber,
            locationsServed: locationsServed || [],
            role: 'vendor' // Explicitly set the role
        });

        if (vendor) {
            // Generate token with role
            const token = generateToken(vendor._id, vendor.role);
            
            res.status(201).json({
                _id: vendor._id,
                name: vendor.name,
                email: vendor.email,
                businessName: vendor.businessName,
                address: vendor.address,
                contactNumber: vendor.contactNumber,
                locationsServed: vendor.locationsServed,
                isAcceptingOrders: vendor.isAcceptingOrders,
                role: vendor.role,
                userType: "vendor",
                token,
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

        // Generate token with role
        const token = generateToken(vendor._id, vendor.role || 'vendor');

        res.json({
            _id: vendor._id,
            name: vendor.name,
            email: vendor.email,
            businessName: vendor.businessName,
            address: vendor.address,
            contactNumber: vendor.contactNumber,
            locationsServed: vendor.locationsServed,
            isAcceptingOrders: vendor.isAcceptingOrders,
            role: vendor.role || 'vendor',
            userType: "vendor",
            token,
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
        // Check if req.user exists before trying to access its properties
        if (!req.user || !req.user._id) {
            return res.status(401).json({ 
                message: "Not authorized, user ID not found",
                debug: { 
                    hasUser: !!req.user,
                    userId: req.user ? req.user._id : 'none',
                }
            });
        }

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

// @desc    Update vendor profile
// @route   PATCH /api/vendor/profile
// @access  Private
const updateVendorProfile = async (req, res) => {
    try {
        // Add request debugging
        console.log("Update profile request:", {
            userId: req.user?._id,
            userRole: req.role,
            body: req.body,
            headers: {
                ...req.headers,
                authorization: req.headers.authorization ? 
                    `Bearer ${req.headers.authorization.split(' ')[1].substring(0, 10)}...` : 
                    null
            }
        });
        
        // Check if req.user exists before trying to access its properties
        if (!req.user || !req.user._id) {
            return res.status(401).json({ 
                message: "Not authorized, user ID not found"
            });
        }

        // Ensure the user is a vendor
        if (req.role !== 'vendor') {
            console.error(`Non-vendor role (${req.role}) attempting to update vendor profile`);
            return res.status(403).json({ 
                message: "Not authorized, only vendors can update vendor profiles" 
            });
        }

        const {
            name,
            email,
            businessName,
            address,
            contactNumber,
            locationsServed
        } = req.body;

        // Find the vendor
        const vendor = await Vendor.findById(req.user._id);

        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        // Check if another vendor is using the new email (if changed)
        if (email && email !== vendor.email) {
            const existingVendor = await Vendor.findOne({ email });
            if (existingVendor) {
                return res.status(400).json({ message: "Email is already in use" });
            }
        }

        // Update vendor fields
        if (name) vendor.name = name;
        if (email) vendor.email = email;
        if (businessName !== undefined) vendor.businessName = businessName;
        if (address !== undefined) vendor.address = address;
        if (contactNumber !== undefined) vendor.contactNumber = contactNumber;
        
        // Always update locationsServed, whether it's an empty array or populated
        // This fixes the issue where empty arrays wouldn't update
        if (locationsServed !== undefined) {
            console.log("Updating locations served:", locationsServed);
            vendor.locationsServed = locationsServed;
        }

        // Save the updated vendor
        const updatedVendor = await vendor.save();
        console.log("Vendor updated successfully:", updatedVendor._id);
        console.log("Updated locations:", updatedVendor.locationsServed);

        res.json({
            _id: updatedVendor._id,
            name: updatedVendor.name,
            email: updatedVendor.email,
            businessName: updatedVendor.businessName,
            address: updatedVendor.address,
            contactNumber: updatedVendor.contactNumber,
            locationsServed: updatedVendor.locationsServed,
            isAcceptingOrders: updatedVendor.isAcceptingOrders,
        });
    } catch (error) {
        console.error("Error in updateVendorProfile: ", error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * @desc    Get vendors by location
 * @route   GET /api/vendor/by-location
 * @access  Public
 */
const getVendorsByLocation = asyncHandler(async (req, res) => {
  const { location } = req.query;

  if (!location) {
    res.status(400);
    throw new Error('Location parameter is required');
  }

  // Find vendors that serve the specified location
  // We'll use a case-insensitive regex to match location names or partial matches
  const locationPattern = new RegExp(location, 'i');

  // Fixed query - removed isActive which doesn't exist in the model
  const vendors = await Vendor.find({
    locationsServed: { $elemMatch: { $regex: locationPattern } }
  })
  .select('name businessName description locationsServed isAcceptingOrders')
  .lean();

  // Format response to match frontend expectations
  const formattedVendors = vendors.map(vendor => ({
    id: vendor._id,
    name: vendor.businessName || vendor.name,
    description: vendor.description || `Food vendor serving ${vendor.locationsServed.join(', ')}`,
    rating: 4.5, // Default rating since averageRating doesn't exist in the model
    isAcceptingOrders: vendor.isAcceptingOrders
  }));

  res.json({
    success: true,
    count: formattedVendors.length,
    data: formattedVendors
  });
});

// @desc    Get public vendor profile
// @route   GET /api/public/vendor/:vendorId
// @access  Public
const getVendorPublicProfile = async (req, res) => {
    try {
        const { vendorId } = req.params;
        
        if (!vendorId) {
            return res.status(400).json({ message: 'Vendor ID is required' });
        }

        const vendor = await Vendor.findById(vendorId).select(
            'name email phone description location address businessHours isAcceptingOrders isOpen coverImage logo cuisine averageRating reviewCount'
        );

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        res.status(200).json(vendor);
    } catch (error) {
        console.error('Error in getVendorPublicProfile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Export all controller functions
module.exports = {
    // Include existing exports
    getVendorProfile,
    // Add the new function
    updateVendorProfile,
    // ... other existing exports
    vendorSignup,
    vendorLogin,
    getVendorsByLocation,
    getVendorPublicProfile
};
