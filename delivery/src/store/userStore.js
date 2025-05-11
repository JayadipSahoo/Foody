import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../config/config";

const useUserStore = create((set, get) => ({
    user: null,
    token: null,
    loading: false,
    error: null,

    setUser: (userData) => set({ user: userData }),
    setToken: (token) => set({ token }),

    initUserData: async () => {
        try {
            const userData = await AsyncStorage.getItem("user");
            const token = await AsyncStorage.getItem("token");

            if (userData && token) {
                set({
                    user: JSON.parse(userData),
                    token,
                });
            }
        } catch (error) {
            console.error("Error initializing user data:", error);
        }
    },

    login: async (email, password) => {
        try {
            set({ loading: true, error: null });

            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password,
                role: "delivery",
            });

            const { user, token } = response.data;

            // Save to AsyncStorage
            await AsyncStorage.setItem("user", JSON.stringify(user));
            await AsyncStorage.setItem("token", token);

            // Update state
            set({
                user,
                token,
                loading: false,
            });

            return { success: true };
        } catch (error) {
            console.error("Login error:", error);
            const errorMessage =
                error.response?.data?.message || "Login failed";
            set({
                error: errorMessage,
                loading: false,
            });
            return { success: false, message: errorMessage };
        }
    },

    logout: async () => {
        try {
            // Clear AsyncStorage
            await AsyncStorage.removeItem("user");
            await AsyncStorage.removeItem("token");

            // Reset state
            set({
                user: null,
                token: null,
            });

            return { success: true };
        } catch (error) {
            console.error("Logout error:", error);
            return { success: false, message: error.message };
        }
    },

    updateProfile: async (profileData) => {
        try {
            set({ loading: true, error: null });

            const { token } = get();

            const response = await axios.put(
                `${API_URL}/auth/profile`,
                profileData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const updatedUser = response.data;

            // Update AsyncStorage
            await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

            // Update state
            set({
                user: updatedUser,
                loading: false,
            });

            return { success: true };
        } catch (error) {
            console.error("Profile update error:", error);
            const errorMessage =
                error.response?.data?.message || "Profile update failed";
            set({
                error: errorMessage,
                loading: false,
            });
            return { success: false, message: errorMessage };
        }
    },
}));

export default useUserStore;
