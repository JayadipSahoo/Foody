import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "../services/apiService";

const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    userType: null,

    // Initialize auth state from storage
    init: async () => {
        set({ isLoading: true });
        try {
            const token = await AsyncStorage.getItem("userToken");
            const userData = await AsyncStorage.getItem("userData");
            const userType = await AsyncStorage.getItem("userType");

            if (token && userData) {
                set({
                    token,
                    user: JSON.parse(userData),
                    userType,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });
                return true;
            } else {
                set({
                    token: null,
                    user: null,
                    userType: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null,
                });
                return false;
            }
        } catch (error) {
            console.error("Auth initialization error:", error);
            set({
                token: null,
                user: null,
                userType: null,
                isAuthenticated: false,
                isLoading: false,
                error: "Failed to initialize authentication state",
            });
            return false;
        }
    },

    // Login
    login: async (email, password, userType) => {
        set({ isLoading: true, error: null });
        try {
            const userData = await authService.login(email, password, userType);

            await AsyncStorage.setItem("userType", userData.userType);

            set({
                user: userData,
                token: userData.token,
                userType: userData.userType,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
            return userData;
        } catch (error) {
            set({
                isLoading: false,
                error: error.message || "Login failed",
            });
            throw error;
        }
    },

    // Signup
    signup: async (userData, userType) => {
        set({ isLoading: true, error: null });
        try {
            const newUser = await authService.signup(userData, userType);

            // After signup, automatically log in the user
            await AsyncStorage.setItem("userToken", newUser.token);
            await AsyncStorage.setItem("userData", JSON.stringify(newUser));
            await AsyncStorage.setItem("userType", newUser.userType);

            set({
                user: newUser,
                token: newUser.token,
                userType: newUser.userType,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
            return newUser;
        } catch (error) {
            set({
                isLoading: false,
                error: error.message || "Signup failed",
            });
            throw error;
        }
    },

    // Logout
    logout: async () => {
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
        } catch (error) {
            console.error("Logout error:", error);
            set({
                isLoading: false,
                error: "Logout failed",
            });
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));

export default useAuthStore;
