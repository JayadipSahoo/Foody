import React, { createContext, useState } from 'react';

export const PreferencesContext = createContext();

export function PreferencesProvider({ children }) {
    const [isVegOnly, setIsVegOnly] = useState(false);

    const toggleVegMode = () => {
        setIsVegOnly(prev => !prev);
    };

    return (
        <PreferencesContext.Provider value={{
            isVegOnly,
            toggleVegMode,
        }}>
            {children}
        </PreferencesContext.Provider>
    );
} 