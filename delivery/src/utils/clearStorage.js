import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Clear all user-related data from AsyncStorage
 * Call this when you need to force logout a user or clear auth state
 */
export const clearUserData = async () => {
    try {
        await AsyncStorage.removeItem("user");
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("vendorInfo");
        console.log("Storage cleared successfully");
        return true;
    } catch (error) {
        console.error("Error clearing storage:", error);
        return false;
    }
};

/**
 * Clear all AsyncStorage keys
 * WARNING: This will clear ALL app data, not just auth info
 */
export const clearAllStorage = async () => {
    try {
        await AsyncStorage.clear();
        console.log("All storage cleared successfully");
        return true;
    } catch (error) {
        console.error("Error clearing all storage:", error);
        return false;
    }
};
