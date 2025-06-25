// Get the IP from the environment or use a default
const IP = "192.168.22.45"; // Updated to current IP

// API Configuration
export const API_URL = `http://${IP}:5000/api`;
export const IMAGE_BASE_URL = `http://${IP}:5000`;

// Theme Configuration
export const THEME = {
    colors: {
        primary: "#FFA500",
        secondary: "#4CAF50",
        background: "#F8F9FA",
        text: "#212529",
        error: "#DC3545",
        success: "#28A745",
        info: "#17A2B8",
        warning: "#FFC107",
        dark: "#343A40",
        light: "#F8F9FA",
        white: "#FFFFFF",
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
    },
    fontSizes: {
        small: 12,
        medium: 14,
        large: 16,
        xlarge: 18,
        xxlarge: 20,
    },
    borderRadius: {
        small: 4,
        medium: 8,
        large: 12,
        xl: 16,
    },
};

// Settings
export const APP_SETTINGS = {
    LOCATION_UPDATE_INTERVAL: 10000, // Update location every 10 seconds
    ORDER_REFRESH_INTERVAL: 15000, // Refresh orders every 15 seconds
    DEFAULT_MAP_ZOOM: 15,
    MAX_DELIVERY_RADIUS_KM: 15,
};
