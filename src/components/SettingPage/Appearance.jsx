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
        {
            id: "light",
            label: "Light Mode",
            desc: "Clean and bright interface perfect for daytime use",
            icon: "sun",
        },
        {
            id: "dark",
            label: "Dark Mode",
            desc: "Easy on the eyes with reduced strain for extended use",
            icon: "moon",
        },
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

    const renderIcon = (iconType, className) => {
        if (iconType === "sun") {
            return (
                <svg
                    className={className}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                </svg>
            );
        } else {
            return (
                <svg
                    className={className}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                </svg>
            );
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl space-y-6">
                <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-6 shadow-sm">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded w-1/4 mb-6"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="h-48 bg-gray-200 dark:bg-neutral-700 rounded-xl"></div>
                            <div className="h-48 bg-gray-200 dark:bg-neutral-700 rounded-xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-6">
            {/* Theme Selection Card */}
            <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Interface Theme
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Choose your preferred interface appearance
                    </p>
                </div>

                <div className="p-6">
                    {/* Local Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
                            <div className="flex items-start">
                                <svg
                                    className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <div className="flex-1">
                                    <h4 className="text-red-800 dark:text-red-300 font-medium text-sm">
                                        Theme Update Failed
                                    </h4>
                                    <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                                        {error}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setError("")}
                                    className="ml-3 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {themeOptions.map((theme) => {
                            const isActive = globalTheme === theme.id;
                            const isUpdating =
                                updating && selectedMode === theme.id;

                            return (
                                <div key={theme.id} className="relative">
                                    <button
                                        onClick={() =>
                                            handleChangeTheme(theme.id)
                                        }
                                        disabled={updating}
                                        className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left group hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                                            isActive
                                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg ring-2 ring-emerald-500/20"
                                                : "border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600 hover:shadow-md"
                                        } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                                    >
                                        {/* Theme Preview */}
                                        <div className="mb-4">
                                            <div
                                                className={`rounded-lg p-4 ${
                                                    theme.id === "dark"
                                                        ? "bg-neutral-900 text-white"
                                                        : "bg-white text-gray-900 border border-gray-200"
                                                } shadow-sm min-h-[120px] flex flex-col justify-between transition-all duration-200`}
                                            >
                                                {/* Mock chat header */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center space-x-2">
                                                        <div
                                                            className={`w-2 h-2 rounded-full ${
                                                                theme.id ===
                                                                "dark"
                                                                    ? "bg-emerald-400"
                                                                    : "bg-emerald-500"
                                                            }`}
                                                        ></div>
                                                        <span
                                                            className={`text-xs ${
                                                                theme.id ===
                                                                "dark"
                                                                    ? "text-gray-300"
                                                                    : "text-gray-600"
                                                            }`}
                                                        >
                                                            AI Assistant
                                                        </span>
                                                    </div>
                                                    {renderIcon(
                                                        theme.icon,
                                                        `w-4 h-4 ${
                                                            theme.id === "dark"
                                                                ? "text-gray-400"
                                                                : "text-gray-500"
                                                        }`
                                                    )}
                                                </div>

                                                {/* Mock message */}
                                                <div className="space-y-2">
                                                    <div
                                                        className={`text-xs leading-relaxed ${
                                                            theme.id === "dark"
                                                                ? "text-gray-200"
                                                                : "text-gray-700"
                                                        }`}
                                                    >
                                                        Hello! How can I help
                                                        you today?
                                                    </div>
                                                    <div
                                                        className={`inline-block px-3 py-1 rounded-full text-xs ${
                                                            theme.id === "dark"
                                                                ? "bg-emerald-600 text-white"
                                                                : "bg-emerald-100 text-emerald-800"
                                                        }`}
                                                    >
                                                        Example message
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Theme Info */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    {renderIcon(
                                                        theme.icon,
                                                        "w-5 h-5 text-gray-500 dark:text-gray-400"
                                                    )}
                                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                        {theme.label}
                                                    </h3>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                    {theme.desc}
                                                </p>
                                            </div>

                                            {/* Status Indicators */}
                                            <div className="flex flex-col items-end space-y-2 ml-3">
                                                {isActive && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                                                        <svg
                                                            className="w-3 h-3 mr-1"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                        Active
                                                    </span>
                                                )}
                                                {isUpdating && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                                                        <svg
                                                            className="w-3 h-3 mr-1 animate-spin"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            ></circle>
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                            ></path>
                                                        </svg>
                                                        Applying
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Selection Ring */}
                                        {isActive && (
                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl opacity-20 blur-sm transition-opacity duration-200"></div>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Appearance;
