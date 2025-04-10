import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Base URL configuration
export const getBaseUrl = () => {
    return "http://192.168.0.111:5000/api";
};

// Create axios instance
const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        "Content-Type": "application/json",
    },
});

// Add request interceptor for authentication
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Authentication services
export const authService = {
    // Register user
    signup: async (userData, userType = "customer") => {
        try {
            const endpoint =
                userType === "vendor" ? "/vendor/signup" : "/auth/signup";
            const response = await api.post(endpoint, userData);
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    message: "An error occurred during signup",
                }
            );
        }
    },

    // Login user
    login: async (email, password, userType = "customer") => {
        try {
            const endpoint =
                userType === "vendor" ? "/vendor/login" : "/auth/login";
            const response = await api.post(endpoint, { email, password });
            if (response.data.token) {
                await AsyncStorage.setItem("userToken", response.data.token);
                await AsyncStorage.setItem(
                    "userData",
                    JSON.stringify(response.data)
                );
                await AsyncStorage.setItem(
                    "userType",
                    response.data.userType || userType
                );
            }
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    message: "An error occurred during login",
                }
            );
        }
    },

    // Logout user
    logout: async () => {
        try {
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userData");
            await AsyncStorage.removeItem("userType");
        } catch (error) {
            console.error("Logout error:", error);
        }
    },

    // Get current user
    getUserProfile: async (userType = "customer") => {
        try {
            const endpoint =
                userType === "vendor" ? "/vendor/profile" : "/auth/profile";
            const response = await api.get(endpoint);
            return response.data;
        } catch (error) {
            throw (
                error.response?.data || {
                    message: "Error fetching user profile",
                }
            );
        }
    },
};

export default api;
