// src/controllers/authController.js
import axios from "axios";
import { app } from "../config/keys";

// Login with email + password
export const loginUser = async (email, password) => {
    try {
        const response = await axios.post(
            `${app.serverURL}/api/auth/login`,
            { email, password },
            { headers: { "Content-Type": "application/json" } }
        );
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
        console.log("Registering user:", {
            fullName,
            email,
            password,
            phone,
        });
        const response = await axios.post(
            `${app.serverURL}/api/auth/register`,
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