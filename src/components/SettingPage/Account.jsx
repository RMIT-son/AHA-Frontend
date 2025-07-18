import { useState } from "react";
import { deleteAccount } from "../../controllers/user";
import Cookies from "js-cookie";

const Account = () => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [error, setError] = useState("");

    const handleLogout = () => {
        // Clear the user cookie (this is sufficient for logout)
        Cookies.remove("user");

        // Redirect to login page
        window.location.href = "/login";
    };

    const handleDeleteAccount = async () => {
        try {
            setIsDeleting(true);
            setError("");

            // Call the delete account API
            await deleteAccount();

            // Redirect to a farewell page or login
            window.location.href = "/login?deleted=true";
        } catch (err) {
            setError(err.message || "Failed to delete account");
            console.error("Error deleting account:", err);
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const ConfirmDeleteModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Delete Account
                </h3>
                <p className="text-gray-600 mb-6">
                    Are you sure you want to delete your account? This action
                    cannot be undone and will permanently remove all your data.
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete Account"}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl">
            <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-8">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="text-red-800 text-sm">{error}</div>
                    </div>
                )}

                {/* Log ouut*/}
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-900 font-medium">
                            Log out
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            This will log you out from this device
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="cursor-pointer px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Log out
                    </button>
                </div>

                {/* Delete Account */}
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-900 font-medium">
                            Delete account
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Permanently delete your account and all associated
                            data. This action cannot be undone.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isDeleting}
                        className="cursor-pointer px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? "Deleting..." : "Delete account"}
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showDeleteConfirm && <ConfirmDeleteModal />}
        </div>
    );
};

export default Account;
