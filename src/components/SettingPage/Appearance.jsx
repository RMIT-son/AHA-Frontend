import React, { useState, useEffect } from "react";
import { getUserProfile, updateUserTheme } from "../../controllers/user";

const Appearance = () => {
    const [selectedMode, setSelectedMode] = useState("light");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");

    const themeOptions = [
        {
            id: "light",
            label: "Light",
            desc: "Describe a forest at sunrise.",
        },
        {
            id: "dark",
            label: "Dark",
            desc: "Describe a desert at midnight.",
        },
    ];

    // Fetch user's current theme preference on component mount
    useEffect(() => {
        const fetchUserTheme = async () => {
            try {
                setLoading(true);
                const userData = await getUserProfile();
                setSelectedMode(userData.theme || "light");
                setError("");
            } catch (err) {
                setError("Failed to load theme preference");
                console.error("Error fetching user theme:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserTheme();
    }, []);

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

    const handleChangeTheme = async (themeId) => {
        try {
            setUpdating(true);
            setError("");

            // Update theme in database
            await updateUserTheme(themeId);

            // Update local state
            setSelectedMode(themeId);

            // Apply theme globally (you can expand this to update CSS variables)
            document.documentElement.setAttribute("data-theme", themeId);
        } catch (err) {
            setError(err.message || "Failed to update theme");
            console.error("Error updating theme:", err);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl bg-gray-50 p-8 border border-gray-200 rounded-2xl">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="h-40 bg-gray-200 rounded-2xl"></div>
                        <div className="h-40 bg-gray-200 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl bg-gray-50 p-8 border border-gray-200 rounded-2xl space-y-8">
            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-red-800 text-sm">{error}</div>
                </div>
            )}

            {/* Color mode section */}
            <div>
                <h2 className="text-xl font-semibold mb-6 text-gray-900">
                    Color mode
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {themeOptions.map((theme) => {
                        const isSelected = selectedMode === theme.id;
                        const styles = getThemeStyles(theme.id);

                        return (
                            <div
                                key={theme.id}
                                className="flex flex-col items-center cursor-pointer"
                            >
                                <button
                                    onClick={() => handleChangeTheme(theme.id)}
                                    disabled={updating}
                                    className={`w-full max-w-sm rounded-2xl p-4 transition-all duration-200 border-2
                                        ${
                                            isSelected
                                                ? styles.border
                                                : "border-gray-200"
                                        }
                                        hover:border-blue-400 hover:bg-white hover:shadow-md
                                        disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <div
                                        className={`rounded-xl p-4 ${styles.chat} min-h-[100px] flex flex-col justify-between transition-all duration-200`}
                                    >
                                        {/* Chat header */}
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

                                        {/* Chat footer */}
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`${styles.text} opacity-70`}
                                                >
                                                    AHA Chatbot
                                                </span>
                                                <svg
                                                    className="w-3 h-3 text-gray-400"
                                                    fill="currentColor"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1 13H7v-2h2v2zm0-3H7V5h2v5z" />
                                                </svg>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <svg
                                                    className="w-3 h-3 text-gray-400"
                                                    fill="currentColor"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path d="M2 3h12v2H2V3zm0 4h12v2H2V7zm0 4h8v2H2v-2z" />
                                                </svg>
                                                <span
                                                    className={`${styles.text} opacity-70`}
                                                >
                                                    Choose style
                                                </span>
                                                <svg
                                                    className="w-3 h-3 text-gray-400"
                                                    fill="currentColor"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path d="M4 6l4 4 4-4H4z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </button>

                                <p className="mt-3 text-sm font-medium text-gray-700">
                                    {theme.label}
                                    {updating && isSelected && (
                                        <span className="ml-2 text-blue-600">
                                            (Updating...)
                                        </span>
                                    )}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Appearance;
