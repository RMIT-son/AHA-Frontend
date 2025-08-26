// src/components/Appearance.jsx
import React, { useState, useEffect, useCallback } from "react";
import { getUserProfile, updateUserTheme } from "../../controllers/user";
import { useTheme } from "../../contexts/ThemeContext";

const Appearance = ({ user: userProp, onUserUpdate, onError }) => {
    const { theme: globalTheme, updateTheme } = useTheme();
    const [selectedMode, setSelectedMode] = useState("light");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");

    const themeOptions = [
        { id: "light", label: "Light", desc: "Describe a forest at sunrise." },
        { id: "dark", label: "Dark", desc: "Describe a desert at midnight." },
    ];

    useEffect(() => {
        const fetchUserTheme = async () => {
            try {
                setLoading(true);
                let userData;
                if (userProp && userProp.theme !== undefined) {
                    userData = userProp;
                } else {
                    userData = await getUserProfile();
                }
                const userTheme = userData.theme || "light";
                setSelectedMode(userTheme);

                // Only update global theme if it's different (prevent loops)
                if (globalTheme !== userTheme) {
                    updateTheme(userTheme);
                }

                setError("");
            } catch (err) {
                const errorMsg = "Failed to load theme preference";
                setError(errorMsg);
                if (onError) onError(errorMsg);
            } finally {
                setLoading(false);
            }
        };
        fetchUserTheme();
    }, [userProp]); // Removed globalTheme and updateTheme from deps to prevent loops

    const getThemeStyles = (themeId) => {
        switch (themeId) {
            case "light":
                return {
                    container: "bg-white border-blue-500",
                    chat: "bg-white",
                    text: "text-gray-900",
                    border: "border-blue-500",
                };
            case "dark":
                return {
                    container: "bg-gray-900 border-gray-600",
                    chat: "bg-gray-900",
                    text: "text-white",
                    border: "border-blue-500",
                };
            default:
                return {
                    container: "bg-gray-100 border-gray-300",
                    chat: "bg-white",
                    text: "text-gray-900",
                    border: "border-gray-300",
                };
        }
    };

    const handleChangeTheme = useCallback(
        async (themeId) => {
            if (updating || themeId === selectedMode) {
                return;
            }

            try {
                setUpdating(true);
                setError("");

                // 1. Update local state first
                setSelectedMode(themeId);

                // 2. Update global theme context immediately for UI change
                updateTheme(themeId);

                // 3. Update in database (this can be slower)
                await updateUserTheme(themeId);

                // 4. Refresh parent user data if callback provided
                if (onUserUpdate) {
                    try {
                        await onUserUpdate();
                    } catch (updateError) {
                        // Silent fail for parent update
                    }
                }

                // Clear any existing errors
                if (onError) onError("");
            } catch (err) {
                const errorMsg = err.message || "Failed to update theme";
                setError(errorMsg);
                if (onError) onError(errorMsg);

                // Revert local state on error
                setSelectedMode(globalTheme);
            } finally {
                setUpdating(false);
            }
        },
        [
            updating,
            selectedMode,
            updateTheme,
            onUserUpdate,
            onError,
            globalTheme,
        ]
    );

    if (loading) {
        return (
            <div className="max-w-4xl bg-gray-50 dark:bg-neutral-900 p-8 border border-gray-200 dark:border-neutral-700 rounded-2xl">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="h-40 bg-gray-200 dark:bg-neutral-700 rounded-2xl"></div>
                        <div className="h-40 bg-gray-200 dark:bg-neutral-700 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl bg-white dark:bg-neutral-900 p-8 border border-gray-200 dark:border-neutral-700 rounded-2xl space-y-8 transition-colors duration-200">
            {/* Local Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md p-4">
                    <div className="flex items-center justify-between">
                        <div className="text-red-800 dark:text-red-300 text-sm">
                            {error}
                        </div>
                        <button
                            onClick={() => setError("")}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Color mode section */}
            <div>
                <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
                    Color mode
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {themeOptions.map((theme) => {
                        const isSelected = selectedMode === theme.id;
                        const isActive = globalTheme === theme.id;
                        const styles = getThemeStyles(theme.id);

                        return (
                            <div
                                key={theme.id}
                                className="flex flex-col items-center cursor-pointer"
                            >
                                <button
                                    onClick={() => handleChangeTheme(theme.id)}
                                    disabled={updating}
                                    className={`w-full max-w-sm rounded-2xl p-4 transition-all duration-200 border-2 relative
                                        ${
                                            isActive
                                                ? "border-blue-500 shadow-lg ring-2 ring-blue-500/20"
                                                : "border-gray-200 dark:border-neutral-700"
                                        }
                                        hover:border-blue-400 hover:bg-white dark:hover:bg-neutral-800 hover:shadow-md
                                        disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {/* Selection indicator */}
                                    {isActive && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                            <svg
                                                className="w-3 h-3 text-white"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                    )}

                                    <div
                                        className={`rounded-xl p-4 ${styles.chat} min-h-[100px] flex flex-col justify-between transition-all duration-200`}
                                    >
                                        {/* Chat preview content */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div
                                                className={`text-sm ${styles.text}`}
                                            >
                                                {theme.desc}
                                            </div>
                                            <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
                                                <svg
                                                    className="w-3 h-3 text-white"
                                                    fill="currentColor"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path d="M8 0l2 6h6l-4 4 2 6-6-4-6 4 2-6-4-4h6z" />
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`${styles.text} opacity-70`}
                                                >
                                                    AHA Chatbot
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span
                                                    className={`${styles.text} opacity-70`}
                                                >
                                                    Choose style
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>

                                <div className="mt-3 text-center">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {theme.label}
                                    </p>
                                    {isActive && (
                                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                                            Active
                                        </span>
                                    )}
                                    {updating && isSelected && (
                                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                                            Saving...
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Appearance;
