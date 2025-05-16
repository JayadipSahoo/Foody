export const API_URL = "http://192.168.0.101:5000/api";

export const THEME = {
    colors: {
        primary: "#FF6B6B",
        secondary: "#4ECDC4",
        background: "#F7F7F7",
        text: "#333333",
        white: "#FFFFFF",
        light: "#F5F5F5",
        gray: "#888888",
        error: "#FF5252",
        success: "#4CAF50",
        warning: "#FFC107",
    },
    fontSizes: {
        small: 12,
        medium: 14,
        large: 16,
        xlarge: 18,
        xxlarge: 24,
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        xxl: 32,
    },
    borderRadius: {
        small: 4,
        medium: 8,
        large: 12,
        full: 9999,
    },
};

export const APP_SETTINGS = {
    LOCATION_UPDATE_INTERVAL: 10000, // Update location every 10 seconds
    ORDER_REFRESH_INTERVAL: 15000, // Refresh orders every 15 seconds
    DEFAULT_MAP_ZOOM: 15,
    MAX_DELIVERY_RADIUS_KM: 15,
};
