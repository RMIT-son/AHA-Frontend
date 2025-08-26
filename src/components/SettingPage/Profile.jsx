// src/components/Profile.jsx
import React, { useState, useEffect } from "react";
import { getUserProfile, updateUserProfile } from "../../controllers/user";
import { useTheme } from "../../contexts/ThemeContext";

const Profile = ({ user: userProp, onUserUpdate, onError }) => {
    const { theme } = useTheme();
    const [fullName, setFullName] = useState("");
    const [nickname, setNickname] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                let userData;
                if (userProp) {
                    userData = userProp;
                } else {
                    userData = await getUserProfile();
                }

                if (!userData) throw new Error("No user data returned");

                setFullName(userData.fullName || userData.full_name || "");
                setNickname(userData.nickname || userData.nick_name || "");
                setError("");
                if (onError) onError("");
            } catch (err) {
                const errorMsg = "Failed to load user profile";
                setError(errorMsg);
                if (onError) onError(errorMsg);
                console.error("Error fetching user profile:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userProp, onError]);

    const handleSave = async () => {
        try {
            setSaving(true);
            setError("");
            setSuccess("");
            if (onError) onError("");

            const profileData = {
                fullName: fullName.trim(),
                nickname: nickname.trim(),
            };

            await updateUserProfile(profileData);
            setSuccess("Profile updated successfully!");

            // Refresh parent user data
            if (onUserUpdate) {
                try {
                    await onUserUpdate();
                } catch (updateError) {
                    console.warn(
                        "Failed to refresh parent user data:",
                        updateError
                    );
                }
            }

            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            const errorMsg = err.message || "Failed to update profile";
            setError(errorMsg);
            if (onError) onError(errorMsg);
            console.error("Error updating profile:", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl">
                <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl p-8 transition-colors duration-200">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/4 mb-4"></div>
                        <div className="h-10 bg-gray-200 dark:bg-neutral-700 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/4 mb-4"></div>
                        <div className="h-10 bg-gray-200 dark:bg-neutral-700 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl p-8 space-y-6 transition-colors duration-200">
                {/* Error Message */}
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

                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-md p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-green-800 dark:text-green-300 text-sm">
                                {success}
                            </div>
                            <button
                                onClick={() => setSuccess("")}
                                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
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

                {/* Name Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Full name
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                            disabled={saving}
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            What should we call you?
                        </label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                            disabled={saving}
                            placeholder="Enter your preferred name"
                        />
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        disabled={
                            saving || (!fullName.trim() && !nickname.trim())
                        }
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200"
                    >
                        {saving ? (
                            <span className="flex items-center">
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
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
                                Saving...
                            </span>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
