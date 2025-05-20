// API Configuration
export const API_URL = "http://172.22.4.4:5000/api";

// Debug flags to control logging
export const DEBUG = {
    AUTH: true, // Authentication-related logs
    API: true, // API call logs
    NAVIGATION: true, // Navigation logs
    STORAGE: true, // AsyncStorage logs
    UI: false, // UI updates logs
};

// Mock data for fallback when API is unavailable
export const MOCK_DATA = {
    user: {
        _id: "mockuser123",
        name: "Mock User",
        email: "customer@example.com",
        userType: "customer",
    },
    vendor: {
        profile: {
            _id: "mockvendor123",
            name: "Mock Vendor",
            email: "vendor@example.com",
            businessName: "Mock Restaurant",
            address: "123 Mock Street",
            contactNumber: "1234567890",
            locationsServed: ["Location 1", "Location 2"],
            isAcceptingOrders: true,
            averageRating: 4.5,
            categories: ["Fast Food", "Beverages", "Desserts"],
        },
        menu: [
            {
                _id: "mockitem1",
                name: "Vegetable Pizza",
                description: "Delicious vegetable pizza with fresh toppings",
                price: 249,
                category: "Pizza",
                imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591",
                isVeg: true,
                isAvailable: true,
            },
            {
                _id: "mockitem2",
                name: "Chicken Burger",
                description: "Juicy chicken burger with special sauce",
                price: 199,
                category: "Burgers",
                imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
                isVeg: false,
                isAvailable: true,
            },
            {
                _id: "mockitem3",
                name: "French Fries",
                description: "Crispy french fries with seasoning",
                price: 99,
                category: "Sides",
                imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f390859f",
                isVeg: true,
                isAvailable: true,
            },
        ],
        orders: [
            {
                _id: "mockorder1",
                orderNumber: "ORD001",
                status: "pending",
                createdAt: new Date().toISOString(),
                customer: {
                    name: "John Doe",
                    phone: "9876543210",
                    email: "john@example.com",
                },
                items: [
                    { name: "Vegetable Pizza", price: 249, quantity: 2 },
                    { name: "French Fries", price: 99, quantity: 1 },
                ],
                totalAmount: 597,
            },
            {
                _id: "mockorder2",
                orderNumber: "ORD002",
                status: "delivered",
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                customer: {
                    name: "Jane Smith",
                    phone: "9876543211",
                    email: "jane@example.com",
                },
                items: [{ name: "Chicken Burger", price: 199, quantity: 1 }],
                totalAmount: 199,
            },
            {
                _id: "mockorder3",
                orderNumber: "ORD003",
                status: "accepted",
                createdAt: new Date(Date.now() - 1800000).toISOString(),
                customer: {
                    name: "Sam Wilson",
                    phone: "9876543212",
                    email: "sam@example.com",
                },
                items: [
                    { name: "Vegetable Pizza", price: 249, quantity: 1 },
                    { name: "Chicken Burger", price: 199, quantity: 1 },
                    { name: "French Fries", price: 99, quantity: 2 },
                ],
                totalAmount: 646,
            },
        ],
    },
};

// Mock credentials for testing
export const MOCK_CREDENTIALS = {
    vendor: {
        email: "vendor@example.com",
        password: "password123",
    },
    customer: {
        email: "customer@example.com",
        password: "password123",
    },
};

// Helper function to determine if token is a mock token
export const isMockToken = (token) => {
    return token === "mock-token-for-testing-only";
};

// Helper function to check if we should use mock data
export const shouldUseMockData = (error) => {
    if (!error) return false;
    
    return (
        error.code === "ECONNABORTED" ||
        error.message?.includes("Network Error") ||
        error.message?.includes("timeout") ||
        !error.response ||
        error.response?.status === 500 ||
        error.response?.status === 401
    );
}; 