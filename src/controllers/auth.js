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
        
        return { success: true, data: response.data };
    } catch (error) {
        // Handle different types of errors
        if (error.response) {
            // Server responded with error status
            const statusCode = error.response.status;
            const message = error.response.data?.message;
            
            switch (statusCode) {
                case 401:
                    return {
                        success: false,
                        message: message || "Invalid email or password"
                    };
                case 404:
                    return {
                        success: false,
                        message: "User not found"
                    };
                case 429:
                    return {
                        success: false,
                        message: "Too many login attempts. Please try again later."
                    };
                case 500:
                    return {
                        success: false,
                        message: "Server error. Please try again later."
                    };
                default:
                    return {
                        success: false,
                        message: message || "Login failed. Please try again."
                    };
            }
        } else if (error.request) {
            // Network error
            return {
                success: false,
                message: "Network error. Please check your internet connection."
            };
        } else {
            // Other error
            return {
                success: false,
                message: "An unexpected error occurred. Please try again."
            };
        }
    }
};

// Register with email, password, name, phone
export const registerUser = async ({ fullName, email, password, phone }) => {
    try {
        console.log(app.dataURL)
        const response = await axios.post(
            `${app.dataURL}/api/auth/register`,
            { fullName, email, password, phone },
            { headers: { "Content-Type": "application/json" } }
        );
        
        return { success: true, data: response.data };
    } catch (error) {
        if (error.response) {
            const statusCode = error.response.status;
            const message = error.response.data?.message;
            
            switch (statusCode) {
                case 400:
                    return {
                        success: false,
                        message: message || "Please check your input and try again."
                    };
                case 409:
                    return {
                        success: false,
                        message: "Email already exists. Please use a different email."
                    };
                case 422:
                    return {
                        success: false,
                        message: message || "Invalid data provided."
                    };
                case 500:
                    return {
                        success: false,
                        message: "Server error. Please try again later."
                    };
                default:
                    return {
                        success: false,
                        message: message || "Registration failed. Please try again."
                    };
            }
        } else if (error.request) {
            return {
                success: false,
                message: "Network error. Please check your internet connection."
            };
        } else {
            return {
                success: false,
                message: "An unexpected error occurred during registration."
            };
        }
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
        if (error.response) {
            const statusCode = error.response.status;
            const message = error.response.data?.message;
            
            switch (statusCode) {
                case 404:
                    return {
                        success: false,
                        message: "No account found with this email address."
                    };
                case 429:
                    return {
                        success: false,
                        message: "Too many password reset requests. Please wait before trying again."
                    };
                case 500:
                    return {
                        success: false,
                        message: "Server error. Please try again later."
                    };
                default:
                    return {
                        success: false,
                        message: message || "Failed to send reset email. Please try again."
                    };
            }
        } else if (error.request) {
            return {
                success: false,
                message: "Network error. Please check your internet connection."
            };
        } else {
            return {
                success: false,
                message: "An unexpected error occurred. Please try again."
            };
        }
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
        if (error.response) {
            const statusCode = error.response.status;
            const message = error.response.data?.message;
            
            switch (statusCode) {
                case 400:
                    return {
                        success: false,
                        message: message || "Invalid or expired reset token."
                    };
                case 404:
                    return {
                        success: false,
                        message: "Reset token not found or has expired."
                    };
                case 422:
                    return {
                        success: false,
                        message: "Password does not meet requirements."
                    };
                case 500:
                    return {
                        success: false,
                        message: "Server error. Please try again later."
                    };
                default:
                    return {
                        success: false,
                        message: message || "Failed to reset password. Please try again."
                    };
            }
        } else if (error.request) {
            return {
                success: false,
                message: "Network error. Please check your internet connection."
            };
        } else {
            return {
                success: false,
                message: "An unexpected error occurred. Please try again."
            };
        }
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
        // For token verification, we just return invalid instead of detailed error
        return { success: false, valid: false };
    }
};