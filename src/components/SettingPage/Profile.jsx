import React, { useState, useEffect } from "react";
import { getUserProfile, updateUserProfile } from "../../controllers/user";

const Profile = () => {
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
                const userData = await getUserProfile();
                if (!userData) throw new Error("No user data returned");

                setFullName(userData.fullName || "");
                setNickname(userData.nickname || "");
                setError("");
            } catch (err) {
                setError("Failed to load user profile");
                console.error("Error fetching user profile:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const profileData = {
                fullName: fullName.trim(),
                nickname: nickname.trim(),
            };

            await updateUserProfile(profileData);
            setSuccess("Profile updated successfully!");

            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err.message || "Failed to update profile");
            console.error("Error updating profile:", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl">
                <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg p-8">
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
            <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg p-8 space-y-6">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md p-4">
                        <div className="text-red-800 dark:text-red-300 text-sm">{error}</div>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-md p-4">
                        <div className="text-green-800 dark:text-green-300 text-sm">{success}</div>
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
                            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                            disabled={saving}
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
                            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                            disabled={saving}
                        />
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
