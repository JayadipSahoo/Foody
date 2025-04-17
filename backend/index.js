const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/authMiddleware");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure CORS
app.use(cors({
    origin: ['http://localhost:19006', 'http://localhost:3000', 'http://192.168.29.159:19006', 'exp://192.168.29.159:19000', 'http://localhost:19000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));

// Logger
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Define API base URL
const API_BASE_URL = "/api";

// Routes
app.use(`${API_BASE_URL}/auth`, require("./routes/authRoutes"));
app.use(`${API_BASE_URL}/menu`, require("./routes/menuRoutes"));
app.use(`${API_BASE_URL}/vendor`, require("./routes/vendorRoutes"));
app.use(`${API_BASE_URL}/menu-schedule`, require("./routes/menuScheduleRoutes"));
app.use(`${API_BASE_URL}/vendor/schedule`, require("./routes/vendorScheduleRoutes"));

// Public routes that don't require authentication
app.use(`${API_BASE_URL}/public`, require("./routes/publicRoutes"));

// Default route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Meshi API" });
});

// Debug endpoint to check authentication
app.get(`${API_BASE_URL}/debug/auth`, require("./middleware/authMiddleware").protect, (req, res) => {
    res.json({
        authenticated: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.role || 'unknown',
            type: req.user.businessName ? 'vendor' : 'customer'
        },
        token: req.headers.authorization ? "Bearer " + req.headers.authorization.split(" ")[1].substring(0, 10) + "..." : "No token"
    });
});

// Debug endpoint to check vendor permissions
app.get(`${API_BASE_URL}/debug/vendor`, 
    require("./middleware/authMiddleware").protect, 
    (req, res) => {
        const isVendorType = req.user.businessName ? true : false;
        const hasVendorRole = req.role === 'vendor';
        
        res.json({
            userId: req.user._id,
            name: req.user.name,
            email: req.user.email,
            detectedRole: req.role,
            assignedRole: req.user.role,
            isVendorByBusinessName: isVendorType,
            hasVendorRole: hasVendorRole,
            canAccessVendorRoutes: isVendorType && hasVendorRole,
            vendorFields: {
                businessName: req.user.businessName || null,
                address: req.user.address || null,
                contactNumber: req.user.contactNumber || null
            }
        });
    }
);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
    console.log(
        `API accessible at http://192.168.0.111:${PORT}${API_BASE_URL}`
    );
});
