import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Base URL configuration
export const getBaseUrl = () => {
    return "http://192.168.22.45:5000/api";
};

// Debug flag for API requests - set to false for real API calls
const DEBUG_API = false;

// Mock data for missing endpoints
const MOCK_DATA = {
    menu: [
        {
            _id: "menu1",
            name: "Margherita Pizza",
            description: "Classic cheese pizza with tomato sauce",
            price: 299,
            isVeg: true,
            isAvailable: true,
            image: "https://via.placeholder.com/150",
            category: "Pizza",
        },
        {
            _id: "menu2",
            name: "Chicken Burger",
            description: "Grilled chicken patty with lettuce and special sauce",
            price: 199,
            isVeg: false,
            isAvailable: true,
            image: "https://via.placeholder.com/150",
            category: "Burgers",
        },
        {
            _id: "menu3",
            name: "Veg Noodles",
            description: "Stir-fried noodles with vegetables",
            price: 149,
            isVeg: true,
            isAvailable: true,
            image: "https://via.placeholder.com/150",
            category: "Chinese",
        },
    ],
    orders: [
        {
            _id: "order1",
            orderNumber: "ORD001",
            user: { _id: "user1", name: "John Doe", phone: "1234567890" },
            customer: { name: "John Doe", phone: "1234567890" },
            items: [
                {
                    _id: "menu1",
                    name: "Margherita Pizza",
                    price: 299,
                    quantity: 1,
                    isVeg: true,
                },
            ],
            totalAmount: 299,
            status: "pending",
            createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
            deliveryAddress: "123 Main St, City",
        },
        {
            _id: "order2",
            orderNumber: "ORD002",
            user: { _id: "user2", name: "Jane Smith", phone: "9876543210" },
            customer: { name: "Jane Smith", phone: "9876543210" },
            items: [
                {
                    _id: "menu2",
                    name: "Chicken Burger",
                    price: 199,
                    quantity: 2,
                    isVeg: false,
                },
            ],
            totalAmount: 398,
            status: "delivered",
            createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
            deliveryAddress: "456 Oak St, City",
        },
    ],
    schedule: {
        isOpen: true,
        openingTime: "09:00",
        closingTime: "22:00",
        offDays: [0], // Sunday is off
        specialHours: [],
    },
    profile: {
        _id: "vendor1",
        name: "Test Restaurant",
        email: "vendor@test.com",
        phone: "1234567890",
        address: "789 Shop St, City",
        description: "A restaurant for testing purposes",
        cuisineType: ["Italian", "Chinese", "Fast Food"],
        rating: 4.5,
        image: "https://via.placeholder.com/150",
    },
};

// Create axios instance
const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000, // 15 seconds timeout
});

// Token management
const tokenManager = {
    getToken: async () => {
        try {
            return await AsyncStorage.getItem("userToken");
        } catch (error) {
            console.error("Error getting token:", error);
            return null;
        }
    },

    setToken: async (token) => {
        try {
            await AsyncStorage.setItem("userToken", token);
            return true;
        } catch (error) {
            console.error("Error setting token:", error);
            return false;
        }
    },

    removeToken: async () => {
        try {
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userData");
            await AsyncStorage.removeItem("userType");
            return true;
        } catch (error) {
            console.error("Error removing token:", error);
            return false;
        }
    },
};

// Track request count to prevent infinite loops
let consecutiveRequestCount = 0;
const MAX_CONSECUTIVE_REQUESTS = 10;
const resetRequestCount = () => {
    consecutiveRequestCount = 0;
};

// Add request interceptor for authentication
api.interceptors.request.use(
    async (config) => {
        try {
            // Increment the request counter
            consecutiveRequestCount++;

            // Check for potential infinite loop
            if (consecutiveRequestCount > MAX_CONSECUTIVE_REQUESTS) {
                console.error(
                    "Too many consecutive requests detected - possible infinite loop"
                );
                resetRequestCount();
                throw new Error(
                    "Request loop detected. Check your component lifecycle methods."
                );
            }

            const token = await tokenManager.getToken();

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            if (DEBUG_API) {
                console.log(
                    `[API Request] ${config.method?.toUpperCase()} ${
                        config.url
                    }`,
                    config.data || ""
                );
            }

            return config;
        } catch (error) {
            console.error("Error in request interceptor:", error);
            return Promise.reject(error);
        }
    },
    (error) => {
        console.error("Request interceptor error:", error);
        return Promise.reject(error);
    }
);

// Add response interceptor for handling token expiration and missing endpoints
api.interceptors.response.use(
    (response) => {
        // Reset the consecutive request counter on successful response
        resetRequestCount();

        if (DEBUG_API) {
            console.log(
                `[API Response] ${response.config.method?.toUpperCase()} ${
                    response.config.url
                }`,
                response.status,
                response.data ? "✓" : "✗"
            );
        }

        return response;
    },
    async (error) => {
        // Reset the consecutive request counter on failed response
        resetRequestCount();

        if (DEBUG_API) {
            console.error(
                `[API Error] ${error.config?.method?.toUpperCase()} ${
                    error.config?.url
                }`,
                error.response?.status,
                error.response?.data || error.message
            );
        }

        const originalRequest = error.config;
        const url = originalRequest.url;

        // Handle 404 errors for missing vendor endpoints
        if (error.response && error.response.status === 404) {
            console.log(`[API Error] 404 error for endpoint: ${url}`);

            // Don't intercept menu endpoints anymore - let the app use real APIs
            // Disable mock data handling to allow adding real items
            /*
            // Handle vendor menu endpoint
            if (url.includes('/vendor/menu') || url.includes('/menu')) {
                console.log('[Mock API] Returning mock menu data');
                return {
                    data: MOCK_DATA.menu,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: originalRequest
                };
            }
            */

            // Keep other mock endpoints if needed
            // Handle vendor orders endpoint
            if (url.includes("/vendor/orders")) {
                console.log("[Mock API] Returning mock orders data");
                return {
                    data: MOCK_DATA.orders,
                    status: 200,
                    statusText: "OK",
                    headers: {},
                    config: originalRequest,
                };
            }

            // Handle vendor schedule endpoint
            if (url.includes("/vendor/schedule")) {
                console.log("[Mock API] Returning mock schedule data");
                return {
                    data: MOCK_DATA.schedule,
                    status: 200,
                    statusText: "OK",
                    headers: {},
                    config: originalRequest,
                };
            }

            // Handle vendor profile endpoint
            if (url.includes("/vendor/profile")) {
                console.log("[Mock API] Returning mock profile data");
                return {
                    data: MOCK_DATA.profile,
                    status: 200,
                    statusText: "OK",
                    headers: {},
                    config: originalRequest,
                };
            }
        }

        // If error is 401 Unauthorized and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // For simplicity, just log the user out
                await tokenManager.removeToken();

                // Return a specific auth error
                return Promise.reject({
                    ...error,
                    isAuthError: true,
                    message: "Your session has expired. Please log in again.",
                });
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        // For 403 Forbidden errors
        if (error.response?.status === 403) {
            console.log(
                `[API Error 403] ${error.config?.method?.toUpperCase()} ${
                    error.config?.url
                }`,
                error.response?.data || {}
            );

            // Only treat as auth error if it's explicitly about authentication
            const isRealAuthError =
                error.response?.data?.message?.includes("not authorized") ||
                error.response?.data?.message?.includes("expired");

            if (isRealAuthError) {
                return Promise.reject({
                    ...error,
                    isAuthError: true,
                    message:
                        "You don't have permission to access this resource.",
                });
            } else {
                // Regular permission error - don't log out
                return Promise.reject({
                    ...error,
                    message:
                        error.response?.data?.message ||
                        "You don't have permission to perform this action.",
                });
            }
        }

        // Server connection issues
        if (!error.response) {
            return Promise.reject({
                ...error,
                isConnectionError: true,
                message:
                    "Unable to connect to the server. Please check your internet connection.",
            });
        }

        return Promise.reject(error);
    }
);

// Customer API service
export const customerAPI = {

    getRazorpayKey: async () => {
        try {
            const response = await api.get('/orders/razorpay/key');
            return response.data;
        } catch (error) {
            console.error('Error fetching Razorpay key:', error);
            throw error;
        }
    },

    getOrders: async () => {
        try {
            const response = await api.get("/orders");
            return response.data;
        } catch (error) {
            console.error("Error fetching customer orders:", error);
            throw error;
        }
    },

    getOrderById: async (id) => {
        try {
            console.log("API: Fetching order by ID:", id);
            // Validate ID format to prevent sending invalid requests
            if (!id || id === "[object Object]" || typeof id !== "string") {
                console.error(`Invalid order ID format: ${id}`);
                return null;
            }

            const response = await api.get(`/orders/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching order ${id}:`, error);
            // Return null instead of throwing to prevent crashing the UI
            return null;
        }
    },

    createOrder: async (orderData) => {
        try {
            const response = await api.post("/orders", orderData);
            return response.data;
        } catch (error) {
            console.error("Error creating order:", error);
            throw error;
        }
    },

    verifyPayment: async (paymentData) => {
        try {
            const response = await api.post('/orders/verify-payment', paymentData);
            return response.data;
        } catch (error) {
            console.error('Error verifying payment:', error);
            throw error;
        }
    },
    
    // Get all orders made by the current user
    getCustomerOrders: async () => {
        try {
            // Get user ID from stored user data
            const userData = await AsyncStorage.getItem('userData');
            if (!userData) {
                throw new Error('No user data found');
            }

            const { _id: userId } = JSON.parse(userData);
            if (!userId) {
                throw new Error('No user ID found in user data');
            }
            const response = await api.get(`/orders/customer/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user orders:', error);
            throw error;
        }
    },
};

// Vendor API service
export const vendorAPI = {
    // Vendor profile
    getProfile: async () => {
        try {
            const response = await api.get("/vendor/profile");
            return response.data;
        } catch (error) {
            console.error("Error fetching vendor profile:", error);
            throw error;
        }
    },

    // Update vendor profile
    updateProfile: async (profileData) => {
        try {
            console.log("API: Sending profile update with data:", {
                ...profileData,
                locationsServed: profileData.locationsServed
                    ? `Array(${
                          profileData.locationsServed.length
                      }): ${JSON.stringify(profileData.locationsServed)}`
                    : "undefined",
            });

            const response = await api.patch("/vendor/profile", profileData);

            console.log(
                "API: Profile update response status:",
                response.status
            );
            console.log("API: Profile update response data:", {
                ...response.data,
                locationsServed: response.data.locationsServed
                    ? `Array(${
                          response.data.locationsServed.length
                      }): ${JSON.stringify(response.data.locationsServed)}`
                    : "undefined",
            });

            return response.data;
        } catch (error) {
            console.error("Error updating vendor profile:", error);
            console.error(
                "Error details:",
                error.response?.data || "No response data"
            );
            throw error;
        }
    },

    // Get vendor schedule
    getSchedule: async () => {
        try {
            const response = await api.get("/vendor/schedule");
            return response.data;
        } catch (error) {
            console.error("Error fetching vendor schedule:", error);
            // Return default schedule if endpoint not available
            return {
                isOpen: true,
                openingTime: "09:00",
                closingTime: "22:00",
                offDays: [],
                specialHours: [],
            };
        }
    },

    // Update vendor schedule
    updateSchedule: async (scheduleData) => {
        try {
            const response = await api.put("/vendor/schedule", scheduleData);
            return response.data;
        } catch (error) {
            console.error("Error updating vendor schedule:", error);
            // For now, return the input data to avoid breaking the UI
            return scheduleData;
        }
    },

    // Vendor orders
    getVendorOrders: async () => {
        try {
            // Get vendor ID from stored user data
            const userData = await AsyncStorage.getItem("userData");
            if (!userData) {
                throw new Error("No user data found");
            }

            const { _id: vendorId } = JSON.parse(userData);
            if (!vendorId) {
                throw new Error("No vendor ID found in user data");
            }

            const response = await api.get(`/orders/vendor/${vendorId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching vendor orders:", error);
            throw error;
        }
    },

    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await api.put(`/orders/${orderId}/status`, {
                status,
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating order ${orderId} status:`, error);
            throw error;
        }
    },

    // Menu items
    getMenu: async () => {
        try {
            // Fix the endpoint to match what the backend expects - without leading /vendor
            const response = await api.get("/menu");
            return response.data;
        } catch (error) {
            console.error("Error fetching menu items:", error);
            throw error;
        }
    },

    // Get specific menu item
    getMenuItem: async (id) => {
        try {
            const response = await api.get(`/menu/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching menu item ${id}:`, error);
            throw error;
        }
    },

    // Add new menu item
    addMenuItem: async (menuItemData) => {
        try {
            const response = await api.post("/menu", menuItemData);
            return response.data;
        } catch (error) {
            console.error("Error adding menu item:", error);
            throw error;
        }
    },

    // Update menu item
    updateMenuItem: async (id, menuItemData) => {
        try {
            const response = await api.put(`/menu/${id}`, menuItemData);
            return response.data;
        } catch (error) {
            console.error(`Error updating menu item ${id}:`, error);
            throw error;
        }
    },

    // Delete menu item
    deleteMenuItem: async (id) => {
        try {
            const response = await api.delete(`/menu/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting menu item ${id}:`, error);
            throw error;
        }
    },

    // Toggle menu item availability
    toggleItemAvailability: async (id) => {
        if (!id) {
            console.error("toggleItemAvailability: Missing menu item ID");
            throw new Error("Menu item ID is required");
        }

        try {
            // Use the correct endpoint
            const response = await api.patch(`/menu/${id}/availability`);
            return response.data;
        } catch (error) {
            console.error(
                `Error toggling menu item ${id} availability:`,
                error
            );
            throw error;
        }
    },

    // Get menu categories
    getCategories: async () => {
        try {
            const response = await api.get("/menu/categories");
            return response.data;
        } catch (error) {
            console.error("Error fetching menu categories:", error);
            throw error;
        }
    },

    // Add new category
    addCategory: async (categoryData) => {
        try {
            const response = await api.post("/menu/categories", categoryData);
            return response.data;
        } catch (error) {
            console.error("Error adding category:", error);
            throw error;
        }
    },

    // Update category
    updateCategory: async (id, categoryData) => {
        try {
            const response = await api.put(
                `/menu/categories/${id}`,
                categoryData
            );
            return response.data;
        } catch (error) {
            console.error(`Error updating category ${id}:`, error);
            throw error;
        }
    },

    // Delete category
    deleteCategory: async (id) => {
        try {
            const response = await api.delete(`/menu/categories/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting category ${id}:`, error);
            throw error;
        }
    },

    // Menu schedules
    getMenuSchedules: async () => {
        try {
            const response = await api.get("/menu-schedule");
            return response.data;
        } catch (error) {
            console.error("Error fetching menu schedules:", error);
            throw error;
        }
    },

    getMenuSchedule: async (id) => {
        try {
            const response = await api.get(`/menu-schedule/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching menu schedule ${id}:`, error);
            throw error;
        }
    },

    createMenuSchedule: async (scheduleData) => {
        try {
            const response = await api.post("/menu-schedule", scheduleData);
            return response.data;
        } catch (error) {
            console.error("Error creating menu schedule:", error);
            throw error;
        }
    },

    updateMenuSchedule: async (id, scheduleData) => {
        try {
            const response = await api.put(
                `/menu-schedule/${id}`,
                scheduleData
            );
            return response.data;
        } catch (error) {
            console.error(`Error updating menu schedule ${id}:`, error);
            throw error;
        }
    },

    deleteMenuSchedule: async (id) => {
        try {
            const response = await api.delete(`/menu-schedule/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting menu schedule ${id}:`, error);
            throw error;
        }
    },

    toggleMenuScheduleStatus: async (id) => {
        try {
            const response = await api.patch(`/menu-schedule/${id}/toggle`);
            return response.data;
        } catch (error) {
            console.error(`Error toggling menu schedule ${id} status:`, error);
            throw error;
        }
    },

    getTodayMenu: async (vendorId) => {
        try {
            const response = await api.get(`/menu-schedule/today/${vendorId}`);
            return response.data;
        } catch (error) {
            console.error(
                `Error fetching today's menu for vendor ${vendorId}:`,
                error
            );
            throw error;
        }
    },

    getWeekMenu: async (vendorId) => {
        try {
            const response = await api.get(`/menu-schedule/week/${vendorId}`);
            return response.data;
        } catch (error) {
            console.error(
                `Error fetching weekly menu for vendor ${vendorId}:`,
                error
            );
            throw error;
        }
    },

    assignDeliveryStaffToOrder: async (orderId, deliveryStaffId) => {
        try {
            const response = await api.patch(
                `/orders/${orderId}/assign-delivery`,
                { deliveryStaffId }
            );
            return response.data;
        } catch (error) {
            console.error(
                `Error assigning delivery staff to order ${orderId}:`,
                error
            );
            throw error;
        }
    },
};

// Authentication services
export const authService = {
    // Register user
    signup: async (userData, userType = "customer") => {
        try {
            const endpoint =
                userType === "vendor" ? "/vendor/signup" : "/auth/signup";
            const response = await api.post(endpoint, userData);

            // Store auth data if token is returned
            if (response.data && response.data.token) {
                await tokenManager.setToken(response.data.token);
                await AsyncStorage.setItem(
                    "userData",
                    JSON.stringify(response.data)
                );
                await AsyncStorage.setItem("userType", userType);
            } else {
                throw new Error("No authentication token received");
            }

            return response.data;
        } catch (error) {
            console.error("Signup error:", error);
            throw (
                error.response?.data || {
                    message: error.message || "An error occurred during signup",
                }
            );
        }
    },

    // Login user
    login: async (email, password, userType = "customer") => {
        try {
            const endpoint =
                userType === "vendor" ? "/vendor/login" : "/auth/login";

            console.log(`Attempting login for ${email} as ${userType}`);

            const response = await api.post(endpoint, {
                email,
                password,
                userType,
            });

            // Validate response
            if (!response.data || !response.data.token) {
                throw new Error("Invalid response: No token received");
            }

            // Add userType to response if not provided
            const userData = {
                ...response.data,
                userType: response.data.userType || userType,
            };

            console.log(`Login successful for ${email}`);

            // Store auth data
            await tokenManager.setToken(response.data.token);
            await AsyncStorage.setItem("userData", JSON.stringify(userData));
            await AsyncStorage.setItem("userType", userType);

            return userData;
        } catch (error) {
            console.error("Login error:", error);
            throw (
                error.response?.data || {
                    message: error.message || "Login failed",
                }
            );
        }
    },

    // Logout user
    logout: async () => {
        try {
            await tokenManager.removeToken();
            return true;
        } catch (error) {
            console.error("Logout error:", error);
            return false;
        }
    },

    // Get current user profile
    getUserProfile: async (userType = "customer") => {
        try {
            const endpoint =
                userType === "vendor" ? "/vendor/profile" : "/auth/profile";
            const response = await api.get(endpoint);

            if (!response.data) {
                throw new Error("No profile data returned");
            }

            return response.data;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw (
                error.response?.data || {
                    message: error.message || "Error fetching user profile",
                }
            );
        }
    },

    // Check authentication status
    checkAuthStatus: async () => {
        try {
            const [token, userType] = await Promise.all([
                tokenManager.getToken(),
                AsyncStorage.getItem("userType"),
            ]);

            return {
                isAuthenticated: !!token,
                userType: userType || null,
            };
        } catch (error) {
            console.error("Error checking auth status:", error);
            return { isAuthenticated: false, userType: null };
        }
    },
};

export default api;
