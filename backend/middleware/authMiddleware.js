const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Vendor = require("../models/Vendor");
const DeliveryStaff = require("../models/DeliveryStaff");

// Middleware to protect routes
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Log decoded token for debugging
            console.log("Decoded token:", decoded);

            // Prioritize Vendor model first to ensure vendor routes work properly
            let user = await Vendor.findById(decoded.id).select("-password");
            let isVendorUser = true;

            // If not found in Vendor model, check User model
            if (!user) {
                user = await User.findById(decoded.id).select("-password");
                isVendorUser = false;
            }

            // If not found in User model, check DeliveryStaff model
            let isDeliveryStaff = false;
            if (!user) {
                user = await DeliveryStaff.findById(decoded.id).select(
                    "-password"
                );
                isDeliveryStaff = !!user;
            }

            // Set the user object and role in the request
            if (user) {
                req.user = user;
                if (isVendorUser) {
                    req.role = "vendor";
                } else if (isDeliveryStaff) {
                    req.role = "delivery";
                } else {
                    req.role = decoded.role || user.role || "user";
                }

                // For debugging
                console.log("User authenticated:", {
                    id: user._id,
                    role: req.role,
                    isVendor: isVendorUser,
                    isDeliveryStaff,
                    modelRole: user.role,
                });

                next();
            } else {
                console.error("User not found for ID:", decoded.id);
                return res
                    .status(404)
                    .json({ message: "User account not found" });
            }
        } catch (error) {
            console.error("Auth middleware error:", error);

            // Specific error for expired tokens
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    message: "Your session has expired. Please login again.",
                    expired: true,
                });
            }

            return res
                .status(401)
                .json({ message: "Not authorized, token failed" });
        }
    } else if (!token) {
        console.error("No auth token provided");
        return res.status(401).json({ message: "Not authorized, no token" });
    }
};

// Check if user is a vendor
const isVendor = (req, res, next) => {
    if (req.role === "vendor") {
        next();
    } else {
        console.error(`Access denied: User role (${req.role}) is not vendor`);
        return res.status(403).json({
            message: `Role (${req.role}) is not authorized to access this resource`,
        });
    }
};

// Dynamic role checking middleware
const checkRole = (role) => {
    return (req, res, next) => {
        if (req.role === role) {
            next();
        } else {
            console.error(
                `Access denied: User role (${req.role}) is not ${role}`
            );
            return res.status(403).json({
                message: `Role (${req.role}) is not authorized to access this resource`,
            });
        }
    };
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    console.error(`Error handler: ${err.message}`);
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};

module.exports = { protect, isVendor, checkRole, errorHandler };
