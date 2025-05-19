import React, { useEffect } from "react";
import { PreferencesProvider } from "./src/context/PreferencesContext";
import AppNavigator from "./src/navigators/AppNavigator";
import { useUserStore } from "./src/store/userStore";
import { clearUserData } from "./src/utils/clearStorage";

// Force clear storage on app start - TEMPORARY FIX
// Remove this after initial fix
const ClearStorageOnStart = () => {
    useEffect(() => {
        const resetStorage = async () => {
            await clearUserData();
            console.log("Storage cleared on app start");
        };
        resetStorage();
    }, []);

    return null;
};

// Initialize the user store as early as possible
const InitUserStore = () => {
    const { initUserData } = useUserStore();

    useEffect(() => {
        initUserData();
    }, []);

    return null;
};

export default function App() {
    console.log("Delivery App component rendering");
    return (
        <PreferencesProvider>
            <ClearStorageOnStart />
            <InitUserStore />
            <AppNavigator />
        </PreferencesProvider>
    );
}
