// src/controllers/authController.js
import axios from "axios";
import { app } from "../config/keys";

// Login with email + password
export const loginUser = async (email, password) => {
    try {
        const response = await axios.post(
            `${app.dataURL}/api/auth/login`,
            { email, password },
            { headers: { "Content-Type": "application/json" } }
        );
        console.log("Login response:", response.data);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message:
                error.response?.data?.message ||
                "An error occurred while logging in",
        };
    }
};

// Register with email, password, name, phone
export const registerUser = async ({ fullName, email, password, phone }) => {
    try {
        const response = await axios.post(
            `${app.dataURL}/api/auth/register`,
            { fullName, email, password, phone },
            { headers: { "Content-Type": "application/json" } }
        );
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message:
                error.response?.data?.message ||
                "An error occurred while registering",
        };
    }
};

// Forgot password - send reset email
export const forgotPassword = async (email) => {
    try {
        const response = await axios.post(
            `${app.dataURL}/api/auth/forgot-password`,
            { email },
            { headers: { "Content-Type": "application/json" } }
        );

        return { success: true, data: response.data };
    } catch (error) {
        console.error("Forgot password error:", error);

        if (error.response && error.response.data) {
            return {
                success: false,
                message:
                    error.response.data.message || "Failed to send reset email",
            };
        }

        return { success: false, message: "Network error occurred" };
    }
};

// Reset password with token
export const resetPassword = async (token, password) => {
    try {
        const response = await axios.post(
            `${app.dataURL}/api/auth/reset-password`,
            { token, password },
            { headers: { "Content-Type": "application/json" } }
        );

        return { success: true, data: response.data };
    } catch (error) {
        console.error("Reset password error:", error);

        if (error.response && error.response.data) {
            return {
                success: false,
                message:
                    error.response.data.message || "Failed to reset password",
            };
        }

        return { success: false, message: "Network error occurred" };
    }
};

// Verify reset token validity
export const verifyResetToken = async (token) => {
    try {
        const response = await axios.get(
            `${app.dataURL}/api/auth/verify-reset-token?token=${token}`
        );
        return { success: true, valid: response.data.valid };
    } catch (error) {
        console.error("Token verification error:", error);
        return { success: false, valid: false };
    }
};
