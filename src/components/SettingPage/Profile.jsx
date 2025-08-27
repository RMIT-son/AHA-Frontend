// src/components/Profile.jsx
import React, { useState, useEffect } from "react";
import { getUserProfile, updateUserProfile } from "../../controllers/user";
import { useTheme } from "../../contexts/ThemeContext";

const Profile = ({ user: userProp, onUserUpdate, onError }) => {
    const { theme } = useTheme();
    const [fullName, setFullName] = useState("");
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
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
                setEmail(userData.email || "");
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

    const hasChanges = () => {
        if (!userProp) return false;
        return (
            fullName.trim() !== (userProp.fullName || "") ||
            nickname.trim() !== (userProp.nickname || "")
        );
    };

    if (loading) {
        return (
            <div className="max-w-4xl space-y-6">
                <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-6 shadow-sm">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded w-1/4 mb-6"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/3 mb-2"></div>
                                <div className="h-10 bg-gray-200 dark:bg-neutral-700 rounded"></div>
                            </div>
                            <div>
                                <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/2 mb-2"></div>
                                <div className="h-10 bg-gray-200 dark:bg-neutral-700 rounded"></div>
                            </div>
                        </div>
                        <div className="h-10 bg-gray-200 dark:bg-neutral-700 rounded w-32 ml-auto"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-6">
            {/* Profile Form */}
            <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Personal Information
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Update your personal details and display preferences
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
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
                                        Update Failed
                                    </h4>
                                    <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                                        {error}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setError("")}
                                    className="ml-3 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
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
                        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4">
                            <div className="flex items-start">
                                <svg
                                    className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <div className="flex-1">
                                    <h4 className="text-green-800 dark:text-green-300 font-medium text-sm">
                                        Success
                                    </h4>
                                    <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                                        {success}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSuccess("")}
                                    className="ml-3 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors"
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

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) =>
                                        setFullName(e.target.value)
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400"
                                    disabled={saving}
                                    placeholder="Enter your full name"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <svg
                                        className="w-4 h-4 text-gray-400 dark:text-gray-500"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                This is your legal name for formal
                                communications
                            </p>
                        </div>

                        {/* Nickname */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Display Name
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) =>
                                        setNickname(e.target.value)
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400"
                                    disabled={saving}
                                    placeholder="How should we address you?"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <svg
                                        className="w-4 h-4 text-gray-400 dark:text-gray-500"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                This name will appear in chat conversations
                            </p>
                        </div>

                        {/* Email (Read-only) */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm bg-gray-50 dark:bg-neutral-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                    disabled
                                    readOnly
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <svg
                                        className="w-4 h-4 text-gray-400 dark:text-gray-500"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Email address cannot be changed. Contact support
                                if needed.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-neutral-700">
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            {hasChanges() && (
                                <>
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <span>You have unsaved changes</span>
                                </>
                            )}
                        </div>

                        <div className="flex space-x-3">
                            {hasChanges() && (
                                <button
                                    onClick={() => {
                                        setFullName(userProp?.fullName || "");
                                        setNickname(userProp?.nickname || "");
                                    }}
                                    disabled={saving}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-600 transition-all duration-200 font-medium"
                                >
                                    Reset
                                </button>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={saving || !hasChanges()}
                                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 min-w-[120px]"
                            >
                                {saving ? (
                                    <div className="flex items-center justify-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                                    </div>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
