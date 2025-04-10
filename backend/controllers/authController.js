const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
    try {
        const { name, email, password, mobile, defaultLocation } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            mobile,
            defaultLocation,
            role: "customer", // Default role for signup
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                mobile: user.mobile,
                defaultLocation: user.defaultLocation,
                userType: "customer", // Add userType to distinguish between customer and vendor
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.error("Error in signup: ", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        if (!user) {
            return res
                .status(401)
                .json({ message: "Invalid email or password" });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res
                .status(401)
                .json({ message: "Invalid email or password" });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            mobile: user.mobile,
            defaultLocation: user.defaultLocation,
            userType: "customer", // Add userType to distinguish between customer and vendor
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("Error in login: ", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                mobile: user.mobile,
                defaultLocation: user.defaultLocation,
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Error in getUserProfile: ", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { signup, login, getUserProfile };
