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
app.use(cors());

// Logger
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Define API base URL
const API_BASE_URL = "/api";

// Routes
app.use(`${API_BASE_URL}/auth`, require("./routes/authRoutes"));
app.use(`${API_BASE_URL}/vendor`, require("./routes/vendorRoutes"));
app.use(`${API_BASE_URL}/menu`, require("./routes/menuRoutes"));

// Default route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Meshi API" });
});

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
