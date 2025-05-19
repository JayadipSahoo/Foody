import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

// Default preferences
const DEFAULT_PREFERENCES = {
    theme: "light", // 'light' or 'dark'
    notificationsEnabled: true,
    locationTrackingEnabled: true,
    soundEnabled: true,
};

// Create the context
const PreferencesContext = createContext();

// Provider component
export const PreferencesProvider = ({ children }) => {
    const deviceTheme = useColorScheme();
    const [isLoading, setIsLoading] = useState(true);
    const [preferences, setPreferences] = useState({
        ...DEFAULT_PREFERENCES,
        theme: deviceTheme || "light",
    });

    // Load preferences from storage on mount
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const storedPreferences = await AsyncStorage.getItem(
                    "deliveryPreferences"
                );

                if (storedPreferences) {
                    setPreferences(JSON.parse(storedPreferences));
                }
            } catch (error) {
                console.error("Error loading preferences", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPreferences();
    }, []);

    // Save preferences to storage whenever they change
    useEffect(() => {
        const savePreferences = async () => {
            try {
                await AsyncStorage.setItem(
                    "deliveryPreferences",
                    JSON.stringify(preferences)
                );
            } catch (error) {
                console.error("Error saving preferences", error);
            }
        };

        if (!isLoading) {
            savePreferences();
        }
    }, [preferences, isLoading]);

    // Function to update preferences
    const updatePreferences = async (newPreferences) => {
        setPreferences((prev) => ({ ...prev, ...newPreferences }));
    };

    // Function to reset preferences to default
    const resetPreferences = async () => {
        const resetValues = {
            ...DEFAULT_PREFERENCES,
            theme: deviceTheme || "light",
        };

        setPreferences(resetValues);
    };

    return (
        <PreferencesContext.Provider
            value={{
                preferences,
                updatePreferences,
                resetPreferences,
                isLoading,
            }}
        >
            {children}
        </PreferencesContext.Provider>
    );
};

// Custom hook to use the preferences context
export const usePreferences = () => {
    const context = useContext(PreferencesContext);

    if (!context) {
        throw new Error(
            "usePreferences must be used within a PreferencesProvider"
        );
    }

    return context;
};
