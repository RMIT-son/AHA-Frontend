import { useState } from "react";
import { deleteAccount } from "../../controllers/user";
import Cookies from "js-cookie";

const Account = ({ user, onUserUpdate, onError }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [error, setError] = useState("");

    const handleLogout = () => {
        Cookies.remove("user");
        window.location.href = "/login";
    };

    const handleDeleteAccount = async () => {
        try {
            setIsDeleting(true);
            setError("");
            await deleteAccount();
            window.location.href = "/login?deleted=true";
        } catch (err) {
            setError(err.message || "Failed to delete account");
            console.error("Error deleting account:", err);
            if (onError) onError(err.message || "Failed to delete account");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const ConfirmDeleteModal = () => (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-neutral-700 overflow-hidden">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mr-3">
                            <svg
                                className="w-5 h-5 text-red-600 dark:text-red-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Delete Account
                        </h3>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="px-6 py-4">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        This action will permanently delete your account and all
                        associated data, including:
                    </p>
                    <ul className="mt-3 text-sm text-gray-500 dark:text-gray-400 space-y-1">
                        <li className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                            All chat conversations and messages
                        </li>
                        <li className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                            Profile information and preferences
                        </li>
                        <li className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                            Account settings and customizations
                        </li>
                    </ul>
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-red-800 dark:text-red-300 text-sm font-medium">
                            This action cannot be undone.
                        </p>
                    </div>
                </div>

                {/* Modal Actions */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-neutral-800/50 border-t border-gray-200 dark:border-neutral-700 flex justify-end space-x-3">
                    <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-600 transition-all duration-200 font-medium"
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 disabled:bg-red-400 disabled:cursor-not-allowed font-medium min-w-[120px]"
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
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
                                Deleting...
                            </div>
                        ) : (
                            "Delete Account"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl space-y-6">
            {/* Account Overview Card */}
            {user && (
                <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                            {user.fullName
                                ? user.fullName.charAt(0).toUpperCase()
                                : "U"}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {user.fullName || "User"}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                {user.email}
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                Member since{" "}
                                {new Date(
                                    user.createdAt || Date.now()
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Account Actions */}
            <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Account Actions
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage your account settings and data
                    </p>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-neutral-700">
                    {/* Error Message */}
                    {error && (
                        <div className="px-6 py-4">
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
                                    <div>
                                        <h4 className="text-red-800 dark:text-red-300 font-medium text-sm">
                                            Error
                                        </h4>
                                        <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                                            {error}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Log out Section */}
                    <div className="px-6 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mr-4">
                                    <svg
                                        className="w-5 h-5 text-orange-600 dark:text-orange-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                                        Sign Out
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Sign out from this device and return to
                                        login page
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-600 transition-all duration-200 font-medium"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Delete Account Section */}
                    <div className="px-6 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mr-4">
                                    <svg
                                        className="w-5 h-5 text-red-600 dark:text-red-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"
                                            clipRule="evenodd"
                                        />
                                        <path
                                            fillRule="evenodd"
                                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                            clipRule="evenodd"
                                        />
                                        <path
                                            fillRule="evenodd"
                                            d="M3 5a2 2 0 012-2h1a1 1 0 010 2H5v11a2 2 0 002 2h6a2 2 0 002-2V5h-1a1 1 0 110-2h1a2 2 0 012 2v11a4 4 0 01-4 4H7a4 4 0 01-4-4V5z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                                        Delete Account
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Permanently delete your account and all
                                        data. This cannot be undone.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 disabled:bg-red-400 disabled:cursor-not-allowed font-medium"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Security Info */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                <div className="flex items-start">
                    <svg
                        className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <div>
                        <h4 className="text-orange-800 dark:text-orange-300 font-medium text-sm">
                            Account Security
                        </h4>
                        <p className="text-orange-700 dark:text-orange-300 text-sm mt-1">
                            Your account data is encrypted and securely stored.
                            If you have any concerns about your account
                            security, please contact our support team.
                        </p>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showDeleteConfirm && <ConfirmDeleteModal />}
        </div>
    );
};

export default Account;
