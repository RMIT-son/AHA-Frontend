/**
 * User API Controller
 * Handles all user-related API operations including profile management,
 * theme preferences, and account operations.
 */

import axios from "axios";
import { app } from "../config/keys";
import Cookies from "js-cookie";

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
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.token}`,
        };
    } catch (error) {
        throw new Error("Invalid user data");
    }
};

/**
 * Handles axios errors and throws formatted error messages
 * @param {Error} error - The axios error object
 * @throws {Error} Formatted error with appropriate message
 */
const handleAxiosError = (error) => {
    if (error.response) {
        // Server responded with error status
        const message =
            error.response.data?.detail ||
            error.response.data?.message ||
            `Request failed with status ${error.response.status}`;
        throw new Error(message);
    } else if (error.request) {
        // Request was made but no response received
        throw new Error("Network error: No response from server");
    } else {
        // Something else happened
        throw new Error(error.message || "An unexpected error occurred");
    }
};

/**
 * Retrieves the current user's profile information
 * @returns {Promise<Object>} User profile data
 * @throws {Error} When request fails or user is not authenticated
 */
export const getUserProfile = async () => {
    try {
        const response = await axios.get(`${app.dataURL}/api/users/profile`, {
            headers: getAuthHeaders(),
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        handleAxiosError(error);
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

        const response = await axios.put(
            `${app.dataURL}/api/users/profile`,
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
        handleAxiosError(error);
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
        const response = await axios.put(
            `${app.dataURL}/api/users/theme`,
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
        handleAxiosError(error);
    }
};

/**
 * Permanently deletes the user's account and all associated data
 * @returns {Promise<Object>} Deletion confirmation
 * @throws {Error} When request fails or user is not authenticated
 */
export const deleteAccount = async () => {
    try {
        const response = await axios.delete(
            `${app.dataURL}/api/users/account`,
            {
                headers: getAuthHeaders(),
            }
        );

        // Clear local cookies after successful deletion
        Cookies.remove("user");

        return response.data;
    } catch (error) {
        console.error("Error deleting account:", error);
        // Clear cookies even if API call fails
        Cookies.remove("user");
        handleAxiosError(error);
    }
};
