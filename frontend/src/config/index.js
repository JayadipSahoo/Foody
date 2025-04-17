// Import constants from constants.js
import { 
    API_URL, 
    API_TIMEOUT, 
    APP_VERSION, 
    ENVIRONMENT, 
    CURRENCY_SYMBOL,
    MEAL_TYPES 
} from './constants';

// Re-export all constants 
export { 
    API_URL, 
    API_TIMEOUT, 
    APP_VERSION, 
    ENVIRONMENT,
    CURRENCY_SYMBOL,
    MEAL_TYPES 
};

// Debug settings
export const DEBUG = {
    AUTH: true,    // Enable auth debugging
    API: true,     // Enable API call debugging
    MOCK_DATA: true // Enable mock data when API calls fail
};

// Mock data - for when the API is unavailable
export const MOCK_DATA = {
    // Mock vendor data
    vendor: {
        profile: {
            _id: 'mockvendor123',
            name: 'Mock Vendor',
            email: 'vendor@example.com',
            phone: '1234567890',
            businessName: 'Mock Restaurant',
            address: '123 Mock Street',
            isVerified: true
        },
        menu: [
            {
                _id: 'mock-item-1',
                name: 'Burger',
                description: 'Delicious burger with fries',
                price: 199,
                category: 'Fast Food',
                isVeg: false,
                isAvailable: true,
                imageUrl: 'https://example.com/burger.jpg'
            },
            {
                _id: 'mock-item-2',
                name: 'Pizza',
                description: 'Cheese and tomato pizza',
                price: 299,
                category: 'Fast Food',
                isVeg: true,
                isAvailable: true,
                imageUrl: 'https://example.com/pizza.jpg'
            }
        ],
        orders: [
            {
                _id: 'mock-order-1',
                orderNumber: 'ORD001',
                customer: { name: 'John Doe', phone: '9876543210' },
                items: [
                    { name: 'Burger', price: 199, quantity: 2 }
                ],
                totalAmount: 398,
                status: 'pending',
                createdAt: new Date().toISOString()
            },
            {
                _id: 'mock-order-2',
                orderNumber: 'ORD002',
                customer: { name: 'Jane Smith', phone: '9876543211' },
                items: [
                    { name: 'Pizza', price: 299, quantity: 1 }
                ],
                totalAmount: 299,
                status: 'delivered',
                createdAt: new Date(Date.now() - 3600000).toISOString()
            }
        ]
    }
};

// Other configuration constants can be added here
export const APP_CONFIG = {
    VERSION: APP_VERSION,
    ENVIRONMENT: ENVIRONMENT,
}; 