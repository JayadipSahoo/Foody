/**
 * Application constants
 */

// API Configuration
export const API_URL = "http://192.168.0.101:5000/api";
// If using iOS simulator, use 'http://localhost:5000/api'
// If using physical device, use your computer's local IP address like 'http://192.168.1.100:5000/api'

// API timeout in milliseconds
export const API_TIMEOUT = 15000;
export const API_TIMEOUT_MS = 30000; // 30 seconds - deprecated, use API_TIMEOUT instead

// App info
export const APP_VERSION = "1.0.0";
export const ENVIRONMENT = process.env.NODE_ENV || "development";

// Currency symbol to use throughout the app
export const CURRENCY_SYMBOL = "₹";

// Meal types
export const MEAL_TYPES = {
    BREAKFAST: "Breakfast",
    LUNCH: "Lunch",
    DINNER: "Dinner",
    SNACK: "Snack",
    BEVERAGE: "Beverage",
    DESSERT: "Dessert",
};

// Legacy meal types array - deprecated, use MEAL_TYPES object instead
export const MEAL_TYPES_ARRAY = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snacks",
    "Beverages",
];
