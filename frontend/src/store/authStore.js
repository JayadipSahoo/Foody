import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "../services/apiService";
import { Alert } from "react-native";

// Debug flag for auth operations
const DEBUG_AUTH = false;

const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    userType: null,
    isInitialized: false,

    // Initialize auth state from storage
    init: async () => {
        try {
            if (DEBUG_AUTH) console.log("Initializing auth state");
            set({ isLoading: true, isInitialized: false });
            
            // Get token first to check if we're authenticated
            const token = await AsyncStorage.getItem('userToken');
            
            if (!token) {
                if (DEBUG_AUTH) console.log("No token found, user is not authenticated");
                set({ 
                    isAuthenticated: false, 
                    user: null, 
                    token: null,
                    userType: null,
                    isLoading: false,
                    isInitialized: true
                });
                return;
            }
            
            try {
                // Get user data and type
                const [userDataJson, userType] = await Promise.all([
                    AsyncStorage.getItem('userData'),
                    AsyncStorage.getItem('userType')
                ]);
                
                if (!userDataJson) {
                    throw new Error('User data not found');
                }
                
                const userData = JSON.parse(userDataJson);
                
                // Validate to ensure critical fields are present
                if (!userData || !userData._id) {
                    throw new Error('Invalid user data');
                }
                
                if (DEBUG_AUTH) console.log(`User authenticated as ${userType}: ${userData._id}`);
                
                set({
                    isAuthenticated: true,
                    user: userData,
                    token,
                    userType: userType || 'customer',
                    isLoading: false,
                    isInitialized: true,
                    error: null
                });
            } catch (parseError) {
                console.error('Error loading user data:', parseError);
                
                // Invalid data, clean up and reset
                await authService.logout();
                
                set({ 
                    isAuthenticated: false, 
                    user: null, 
                    token: null,
                    userType: null,
                    isLoading: false,
                    isInitialized: true,
                    error: null
                });
            }
        } catch (error) {
            console.error('Error initializing auth state:', error);
            
            // Reset to a safe state
            set({ 
                isAuthenticated: false, 
                user: null, 
                token: null,
                userType: null,
                isLoading: false,
                error: 'Failed to initialize authentication',
                isInitialized: true
            });
        }
    },

    // Login
    login: async (email, password, userType) => {
        if (get().isLoading) return null;
        
        try {
            set({ isLoading: true, error: null });
            
            if (DEBUG_AUTH) console.log(`Login attempt: ${email} as ${userType}`);
            
            // Call the API service login method
            const userData = await authService.login(email, password, userType);
            
            // Validate user data
            if (!userData || !userData._id) {
                throw new Error('Invalid user data returned from login');
            }
            
            if (DEBUG_AUTH) console.log(`Login successful: ${userData._id}`);
            
            // Update state with user data
            set({ 
                isAuthenticated: true, 
                user: userData, 
                token: userData.token,
                userType: userData.userType || userType,
                isLoading: false,
                error: null
            });
            
            return userData;
        } catch (error) {
            console.error('Login error:', error);
            
            // Handle different error types
            const errorMessage = error.isConnectionError 
                ? "Unable to connect to the server. Please check your internet connection."
                : error.message || 'Login failed';
                
            set({ 
                isLoading: false, 
                error: errorMessage,
                isAuthenticated: false
            });
            
            throw error;
        }
    },

    // Signup
    signup: async (userData, userType) => {
        if (get().isLoading) return null;
        
        try {
            set({ isLoading: true, error: null });
            
            if (DEBUG_AUTH) console.log(`Signup attempt as ${userType}`);
            
            const newUser = await authService.signup(userData, userType);
            
            if (!newUser || !newUser.token) {
                throw new Error('Invalid response from signup');
            }
            
            if (DEBUG_AUTH) console.log(`Signup successful: ${newUser._id}`);
            
            set({
                user: newUser,
                token: newUser.token,
                userType: newUser.userType || userType,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
            
            return newUser;
        } catch (error) {
            console.error('Signup error:', error);
            
            // Handle different error types
            const errorMessage = error.isConnectionError 
                ? "Unable to connect to the server. Please check your internet connection."
                : error.message || "Signup failed";
                
            set({
                isLoading: false,
                error: errorMessage,
                isAuthenticated: false
            });
            
            throw error;
        }
    },

    // Logout
    logout: async () => {
        if (DEBUG_AUTH) console.log("Logging out user");
        set({ isLoading: true });
        
        try {
            await authService.logout();
            
            set({
                user: null,
                token: null,
                userType: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
            
            if (DEBUG_AUTH) console.log("Logout successful");
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            
            // Force clear state even if logout fails
            set({
                user: null,
                token: null,
                userType: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
            
            return false;
        }
    },
    
    // Clear error
    clearError: () => set({ error: null }),
    
    // Handle auth error (for use in response interceptors)
    handleAuthError: async (error) => {
        // Only process if this is actually an auth error and we're authenticated
        if (error.isAuthError && get().isAuthenticated) {
            console.log("[AuthStore] Auth error detected:", {
                message: error.message,
                status: error.response?.status,
                url: error.config?.url
            });
            
            // First clear auth state without any navigation
            try {
                await authService.logout();
                
                set({
                    user: null,
                    token: null,
                    userType: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: error.message || "Your session has expired. Please log in again."
                });
            } catch (logoutError) {
                console.error("Error during forced logout:", logoutError);
                // Force reset state even if logout API fails
                set({
                    user: null,
                    token: null,
                    userType: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: error.message || "Your session has expired. Please log in again."
                });
            }
            
            // Alert the user about the authentication issue
            Alert.alert(
                "Authentication Error",
                error.message || "Your session has expired. Please log in again.",
                [{ text: "OK" }]
            );
            
            return true;
        }
        return false;
    }
}));

export default useAuthStore;
