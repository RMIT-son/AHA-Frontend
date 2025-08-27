// src/contexts/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getUserProfile } from "../controllers/user";
import Cookies from "js-cookie";

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState("light");
    const [loading, setLoading] = useState(true);

    // Helper function to apply theme to DOM
    const applyThemeToDOM = (newTheme) => {
        const root = document.documentElement;

        if (newTheme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        // Also update localStorage
        localStorage.setItem("theme", newTheme);
    };

    // Initialize theme from user data or localStorage
    useEffect(() => {
        const initializeTheme = async () => {
            try {
                // First check localStorage for immediate theme application
                const savedTheme = localStorage.getItem("theme");

                if (
                    savedTheme &&
                    (savedTheme === "light" || savedTheme === "dark")
                ) {
                    setTheme(savedTheme);
                    applyThemeToDOM(savedTheme);
                }

                // Then check if user is logged in and fetch from database
                const userCookie = Cookies.get("user");
                if (userCookie) {
                    try {
                        const userData = await getUserProfile();
                        const userTheme = userData.theme || "light";

                        // Always update to ensure sync
                        setTheme(userTheme);
                        applyThemeToDOM(userTheme);
                    } catch (error) {
                        // Keep the localStorage theme or default
                        const fallbackTheme = savedTheme || "light";
                        setTheme(fallbackTheme);
                        applyThemeToDOM(fallbackTheme);
                    }
                } else {
                    // For non-logged-in users, use localStorage or default
                    const fallbackTheme = savedTheme || "light";

                    setTheme(fallbackTheme);
                    applyThemeToDOM(fallbackTheme);
                }
            } catch (error) {
                // Fallback to light theme
                setTheme("light");
                applyThemeToDOM("light");
            } finally {
                setLoading(false);
            }
        };

        initializeTheme();
    }, []); // Only run once on mount

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
    };

    const updateTheme = (newTheme) => {
        if (newTheme && (newTheme === "light" || newTheme === "dark")) {
            setTheme(newTheme);
        }
    };

    // Apply theme changes immediately
    useEffect(() => {
        applyThemeToDOM(theme);
    }, [theme]);

    const value = {
        theme,
        toggleTheme,
        updateTheme,
        loading,
    };

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
};
