import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/constants";
import axios from "axios";

// Debug flag for user operations
const DEBUG_USER = true;

// Create a UserStore to manage customer-specific data
const useUserStore = create((set, get) => ({
    // User profile extensions
    lastOrderedLocation: null,
    phoneNumber: null,
    notifications: [],
    notificationCount: 0,
    notificationSettings: {
        newMenuItems: true,
        orderStatus: true,
        promotions: true
    },
    
    // UI state
    isLoading: false,
    error: null,
    
    // Initialize user data from storage
    initUserData: async () => {
        try {
            if (DEBUG_USER) console.log("Initializing user data");
            set({ isLoading: true });
            
            // Get extended user data from AsyncStorage
            const [
                lastOrderedLocation,
                phoneNumber,
                notificationsJson,
                settingsJson
            ] = await Promise.all([
                AsyncStorage.getItem('lastOrderedLocation'),
                AsyncStorage.getItem('userPhoneNumber'),
                AsyncStorage.getItem('userNotifications'),
                AsyncStorage.getItem('notificationSettings')
            ]);
            
            // Set the state with retrieved values
            set({
                lastOrderedLocation: lastOrderedLocation || null,
                phoneNumber: phoneNumber || null,
                notifications: notificationsJson ? JSON.parse(notificationsJson) : [],
                notificationCount: notificationsJson ? JSON.parse(notificationsJson).filter(n => !n.read).length : 0,
                notificationSettings: settingsJson ? JSON.parse(settingsJson) : {
                    newMenuItems: true,
                    orderStatus: true,
                    promotions: true
                },
                isLoading: false
            });
            
            if (DEBUG_USER) console.log("User data initialized");
        } catch (error) {
            console.error("Error initializing user data:", error);
            set({ 
                isLoading: false,
                error: "Failed to load user data"
            });
        }
    },
    
    // Update last ordered location
    setLastOrderedLocation: async (location) => {
        if (!location) return;
        
        try {
            set({ lastOrderedLocation: location });
            await AsyncStorage.setItem('lastOrderedLocation', location);
            if (DEBUG_USER) console.log(`Last ordered location updated: ${location}`);
        } catch (error) {
            console.error("Error saving last ordered location:", error);
        }
    },
    
    // Set phone number
    setPhoneNumber: async (phone) => {
        if (!phone) return;
        
        try {
            set({ phoneNumber: phone });
            await AsyncStorage.setItem('userPhoneNumber', phone);
            
            // Also update in user profile on backend if possible
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                await axios.patch(`${API_URL}/auth/profile`, 
                    { phoneNumber: phone },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            
            if (DEBUG_USER) console.log(`Phone number updated: ${phone}`);
        } catch (error) {
            console.error("Error saving phone number:", error);
            set({ error: "Failed to update phone number" });
        }
    },
    
    // Add a new notification
    addNotification: async (notification) => {
        try {
            const { notifications } = get();
            const newNotification = {
                id: Date.now().toString(),
                title: notification.title,
                message: notification.message,
                type: notification.type || 'info',
                timestamp: new Date().toISOString(),
                read: false,
                data: notification.data || {}
            };
            
            const updatedNotifications = [newNotification, ...notifications];
            set({ 
                notifications: updatedNotifications,
                notificationCount: updatedNotifications.filter(n => !n.read).length
            });
            
            // Save to AsyncStorage
            await AsyncStorage.setItem('userNotifications', JSON.stringify(updatedNotifications));
            
            if (DEBUG_USER) console.log(`New notification added: ${notification.title}`);
            return newNotification;
        } catch (error) {
            console.error("Error adding notification:", error);
            return null;
        }
    },
    
    // Mark notification as read
    markNotificationAsRead: async (notificationId) => {
        try {
            const { notifications } = get();
            const updatedNotifications = notifications.map(notification => 
                notification.id === notificationId 
                    ? { ...notification, read: true } 
                    : notification
            );
            
            set({ 
                notifications: updatedNotifications,
                notificationCount: updatedNotifications.filter(n => !n.read).length
            });
            
            // Save to AsyncStorage
            await AsyncStorage.setItem('userNotifications', JSON.stringify(updatedNotifications));
            
            if (DEBUG_USER) console.log(`Notification marked as read: ${notificationId}`);
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    },
    
    // Mark all notifications as read
    markAllNotificationsAsRead: async () => {
        try {
            const { notifications } = get();
            const updatedNotifications = notifications.map(notification => ({ 
                ...notification, 
                read: true 
            }));
            
            set({ 
                notifications: updatedNotifications,
                notificationCount: 0
            });
            
            // Save to AsyncStorage
            await AsyncStorage.setItem('userNotifications', JSON.stringify(updatedNotifications));
            
            if (DEBUG_USER) console.log("All notifications marked as read");
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    },
    
    // Clear all notifications
    clearAllNotifications: async () => {
        try {
            set({ 
                notifications: [],
                notificationCount: 0
            });
            
            // Save to AsyncStorage
            await AsyncStorage.setItem('userNotifications', JSON.stringify([]));
            
            if (DEBUG_USER) console.log("All notifications cleared");
        } catch (error) {
            console.error("Error clearing notifications:", error);
        }
    },
    
    // Update notification settings
    updateNotificationSettings: async (settings) => {
        try {
            const updatedSettings = {
                ...get().notificationSettings,
                ...settings
            };
            
            set({ notificationSettings: updatedSettings });
            
            // Save to AsyncStorage
            await AsyncStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
            
            if (DEBUG_USER) console.log("Notification settings updated:", updatedSettings);
        } catch (error) {
            console.error("Error updating notification settings:", error);
        }
    }
}));

export default useUserStore; 