/**
 * User API Controller
 * Handles all user-related API operations including profile management,
 * theme preferences, and account operations.
 */

import axios from "axios";
import { app } from "../config/keys.js"; // Added .js extension
import Cookies from "js-cookie";
import { GoogleAuth } from 'google-auth-library';

// Create axios instance with base URL from your existing config
const apiClient = axios.create({
    baseURL: app.dataURL,
    timeout: 300000, // 5 minutes timeout
    headers: {
        "Content-Type": "application/json",
    },
});

// Add a request interceptor
apiClient.interceptors.request.use(async (config) => {
    try {
        const auth = new GoogleAuth();
        const client = await auth.getIdTokenClient(app.dataURL);
        const headers = await client.getRequestHeaders();
        config.headers.Authorization = headers.Authorization;
    } catch (error) {
        console.error('Error getting ID token:', error);
    }
    return config;
});

/**
 * Retrieves authentication headers from stored user cookie
 * @returns {Object} Headers object with authorization token
 * @throws {Error} When user is not authenticated or cookie is invalid
 */
const getAuthHeaders = () => {
    const userCookie = Cookies.get("user");
    if (!userCookie) {
        throw new Error("User not authenticated");
    }

    try {
        const userData = JSON.parse(userCookie);

        // The cookie contains the user object with 'id' field (MongoDB ObjectId)
        const token = userData.id;

        if (!token) {
            throw new Error("No user ID found in cookie");
        }

        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
    } catch (error) {
        throw new Error("Invalid user data", { cause: error });
    }
};

/**
 * Retrieves the current user's profile information
 * @returns {Promise<Object>} User profile data
 * @throws {Error} When request fails or user is not authenticated
 */
export const getUserProfile = async () => {
    try {
        const response = await apiClient.get(`/api/users/profile`, {
            headers: getAuthHeaders(),
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching user profile:", error);

        // Handle different types of errors
        if (error.response) {
            const statusCode = error.response.status;
            const message =
                error.response.data?.message || error.response.data?.detail;

            switch (statusCode) {
                case 401:
                    throw new Error("Unauthorized. Please login again.");
                case 404:
                    throw new Error("User profile not found.");
                case 500:
                    throw new Error("Server error. Please try again later.");
                default:
                    throw new Error(message || "Failed to fetch user profile.");
            }
        } else if (error.request) {
            throw new Error(
                "Network error. Please check your internet connection."
            );
        } else {
            throw new Error(error.message || "An unexpected error occurred.");
        }
    }
};

/**
 * Updates user profile information (fullName, nickname)
 * @param {Object} profileData - Profile data to update
 * @param {string} [profileData.fullName] - User's full name
 * @param {string} [profileData.nickname] - User's preferred nickname
 * @returns {Promise<Object>} Updated user profile data
 * @throws {Error} When request fails or user is not authenticated
 */
export const updateUserProfile = async (profileData) => {
    try {
        // Filter out empty values
        const filteredData = {};
        if (profileData.fullName && profileData.fullName.trim()) {
            filteredData.fullName = profileData.fullName.trim();
        }
        if (profileData.nickname !== undefined) {
            filteredData.nickname = profileData.nickname.trim();
        }

        const response = await apiClient.put(
            `/api/users/profile`,
            filteredData,
            {
                headers: getAuthHeaders(),
            }
        );

        const updatedUser = response.data;

        // Update the user cookie with new data
        const userCookie = Cookies.get("user");
        if (userCookie) {
            const userData = JSON.parse(userCookie);
            const updatedUserData = {
                ...userData,
                fullName: updatedUser.fullName,
                nickname: updatedUser.nickname,
            };
            Cookies.set("user", JSON.stringify(updatedUserData), {
                expires: 7,
            });
        }

        return updatedUser;
    } catch (error) {
        console.error("Error updating user profile:", error);

        // Handle different types of errors
        if (error.response) {
            const statusCode = error.response.status;
            const message =
                error.response.data?.message || error.response.data?.detail;

            switch (statusCode) {
                case 400:
                    throw new Error(
                        message || "Invalid profile data provided."
                    );
                case 401:
                    throw new Error("Unauthorized. Please login again.");
                case 422:
                    throw new Error(message || "Invalid data format.");
                case 500:
                    throw new Error("Server error. Please try again later.");
                default:
                    throw new Error(message || "Failed to update profile.");
            }
        } else if (error.request) {
            throw new Error(
                "Network error. Please check your internet connection."
            );
        } else {
            throw new Error(error.message || "An unexpected error occurred.");
        }
    }
};

/**
 * Updates user's theme preference (appearance)
 * @param {string} theme - Theme preference ('light' or 'dark')
 * @returns {Promise<Object>} Updated user data
 * @throws {Error} When request fails or user is not authenticated
 */
export const updateUserTheme = async (theme) => {
    try {
        const response = await apiClient.put(
            `/api/users/theme`,
            { theme },
            {
                headers: getAuthHeaders(),
            }
        );

        const updatedUser = response.data;

        // Update the user cookie with new theme
        const userCookie = Cookies.get("user");
        if (userCookie) {
            const userData = JSON.parse(userCookie);
            const updatedUserData = { ...userData, theme };
            Cookies.set("user", JSON.stringify(updatedUserData), {
                expires: 7,
            });
        }

        return updatedUser;
    } catch (error) {
        console.error("Error updating user theme:", error);

        // Handle different types of errors
        if (error.response) {
            const statusCode = error.response.status;
            const message =
                error.response.data?.message || error.response.data?.detail;

            switch (statusCode) {
                case 400:
                    throw new Error(message || "Invalid theme preference.");
                case 401:
                    throw new Error("Unauthorized. Please login again.");
                case 500:
                    throw new Error("Server error. Please try again later.");
                default:
                    throw new Error(message || "Failed to update theme.");
            }
        } else if (error.request) {
            throw new Error(
                "Network error. Please check your internet connection."
            );
        } else {
            throw new Error(error.message || "An unexpected error occurred.");
        }
    }
};

/**
 * Permanently deletes the user's account and all associated data
 * @returns {Promise<Object>} Deletion confirmation
 * @throws {Error} When request fails or user is not authenticated
 */
export const deleteAccount = async () => {
    try {
        const response = await apiClient.delete(`/api/users/account`, {
            headers: getAuthHeaders(),
        });

        // Clear local cookies after successful deletion
        Cookies.remove("user");

        return response.data;
    } catch (error) {
        console.error("Error deleting account:", error);

        // Handle different types of errors
        if (error.response) {
            const statusCode = error.response.status;
            const message =
                error.response.data?.message || error.response.data?.detail;

            switch (statusCode) {
                case 401:
                    throw new Error("Unauthorized. Please login again.");
                case 403:
                    throw new Error("Account deletion not allowed.");
                case 500:
                    throw new Error("Server error. Please try again later.");
                default:
                    throw new Error(message || "Failed to delete account.");
            }
        } else if (error.request) {
            throw new Error(
                "Network error. Please check your internet connection."
            );
        } else {
            throw new Error(error.message || "An unexpected error occurred.");
        }

        // Clear cookies even if API call fails
        Cookies.remove("user");
    }
};
