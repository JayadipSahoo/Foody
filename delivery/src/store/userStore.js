import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../config/constants";

export const useUserStore = create((set, get) => ({
    user: null,
    token: null,
    vendorInfo: null,
    loading: false,
    error: null,

    setUser: (userData) => set({ user: userData }),
    setToken: (token) => set({ token }),
    setVendorInfo: (vendorInfo) => set({ vendorInfo }),

    initUserData: async () => {
        try {
            const userData = await AsyncStorage.getItem("user");
            const token = await AsyncStorage.getItem("token");
            const vendorInfo = await AsyncStorage.getItem("vendorInfo");

            if (userData && token) {
                set({
                    user: JSON.parse(userData),
                    token,
                    vendorInfo: vendorInfo ? JSON.parse(vendorInfo) : null,
                });
            }
        } catch (error) {
            console.error("Error initializing user data:", error);
        }
    },

    loginDeliveryStaff: async (email, vendorCode, vendorId) => {
        try {
            set({ loading: true, error: null });

            const response = await axios.post(`${API_URL}/delivery/login`, {
                email,
                vendorCode,
                vendorId,
            });

            const userData = response.data;

            // Save to AsyncStorage
            await AsyncStorage.setItem("user", JSON.stringify(userData));
            await AsyncStorage.setItem("token", userData.token);

            const vendorInfo = {
                id: userData.vendorId,
                name: userData.vendorName,
            };

            await AsyncStorage.setItem(
                "vendorInfo",
                JSON.stringify(vendorInfo)
            );

            // Update state
            set({
                user: userData,
                token: userData.token,
                vendorInfo,
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
            await AsyncStorage.removeItem("vendorInfo");

            // Reset state
            set({
                user: null,
                token: null,
                vendorInfo: null,
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
                `${API_URL}/delivery/profile`,
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

    updateLocation: async (latitude, longitude) => {
        try {
            const { token, user } = get();

            if (!token || !user) return { success: false };

            await axios.post(
                `${API_URL}/delivery/location/update`,
                { latitude, longitude },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            return { success: true };
        } catch (error) {
            console.error("Location update error:", error);
            return { success: false };
        }
    },
}));
