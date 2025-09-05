// services/googleAuth.js - Modern Google Identity Services for Vite
import { app } from "../config/keys";

class GoogleAuthService {
    constructor() {
        this.clientId = app.googleClientId;
        this.isInitialized = false;
    }

    // Load Google Identity Services script
    loadGoogleScript() {
        return new Promise((resolve, reject) => {
            if (window.google?.accounts) {
                resolve();
                return;
            }

            const script = document.createElement("script");
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            script.onload = () => {
                console.log("Google Identity Services loaded successfully");
                resolve();
            };
            script.onerror = (error) => {
                console.error(
                    "Failed to load Google Identity Services:",
                    error
                );
                reject(new Error("Failed to load Google Identity Services"));
            };
            document.head.appendChild(script);
        });
    }

    // Initialize Google Identity Services
    async initialize() {
        if (this.isInitialized) {
            return true;
        }

        if (!this.clientId) {
            const error = new Error(
                "Google Client ID is not configured. Please check your .env file."
            );
            console.error(error.message);
            throw error;
        }

        const maskedClientId = this.clientId
            ? `${this.clientId.substring(0, 10)}...`
            : "undefined";
        console.log(
            "Initializing Google Identity Services with Client ID:",
            maskedClientId
        );

        try {
            await this.loadGoogleScript();

            // Initialize the Google Identity Services
            window.google.accounts.id.initialize({
                client_id: this.clientId,
            });

            console.log("Google Identity Services initialized successfully");
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error(
                "Google Identity Services initialization failed:",
                error
            );
            this.isInitialized = false;
            throw error;
        }
    }

    // Sign in with Google using OAuth2 popup
    async signIn() {
        try {
            console.log("Starting Google Sign-In...");
            await this.initialize();

            return new Promise((resolve) => {
                const tokenClient =
                    window.google.accounts.oauth2.initTokenClient({
                        client_id: this.clientId,
                        scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
                        callback: async (response) => {
                            if (response.error) {
                                console.error(
                                    "Google Sign-In Error:",
                                    response
                                );
                                resolve({
                                    success: false,
                                    message: this.getErrorMessage(response),
                                });
                                return;
                            }

                            console.log(
                                "Google Sign-In successful, fetching user info..."
                            );
                            try {
                                const userInfo = await this.fetchUserInfo(
                                    response.access_token
                                );
                                resolve({
                                    success: true,
                                    data: {
                                        ...userInfo,
                                        accessToken: response.access_token,
                                        // Note: OAuth2 flow doesn't provide ID token by default
                                        // If you need ID token, you'll need to modify the scope and flow
                                    },
                                });
                            } catch (error) {
                                console.error(
                                    "Error fetching user info:",
                                    error
                                );
                                resolve({
                                    success: false,
                                    message: "Failed to fetch user information",
                                });
                            }
                        },
                    });

                // Request access token
                tokenClient.requestAccessToken();
            });
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            return {
                success: false,
                message: this.getErrorMessage(error),
            };
        }
    }

    // Fetch user info using access token
    async fetchUserInfo(accessToken) {
        try {
            const response = await fetch(
                `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const userInfo = await response.json();
            console.log("User info fetched successfully:", userInfo);

            return {
                id: userInfo.id,
                name: userInfo.name,
                email: userInfo.email,
                imageUrl: userInfo.picture,
            };
        } catch (error) {
            console.error("Error fetching user info:", error);
            throw error;
        }
    }

    // Verify with backend (optional - can be skipped for now)
    async verifyWithBackend(accessToken) {
        try {
            console.log("Verifying with backend...");
            const response = await fetch("/api/auth/google/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ accessToken }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Backend verification successful");
            return result;
        } catch (error) {
            console.error("Backend verification error:", error);
            return {
                success: false,
                message: "Authentication verification failed",
            };
        }
    }

    // Sign out
    async signOut() {
        try {
            // For Google Identity Services, we can revoke the token
            if (window.google?.accounts?.oauth2) {
                // Note: You'd need to store the access token to revoke it
                console.log("Google Sign-Out completed");
            }
            return { success: true };
        } catch (error) {
            console.error("Sign out error:", error);
            return { success: false, message: "Sign out failed" };
        }
    }

    // Helper method to get user-friendly error messages
    getErrorMessage(error) {
        if (typeof error === "string") {
            return error;
        }

        if (error?.error) {
            switch (error.error) {
                case "popup_closed_by_user":
                    return "Sign-in was cancelled";
                case "access_denied":
                    return "Access denied by user";
                case "popup_blocked":
                    return "Popup blocked. Please allow popups for this site";
                case "network_error":
                    return "Network error. Please check your connection";
                case "invalid_client":
                    return "Invalid Google Client ID configuration";
                default:
                    return `Google sign-in failed: ${error.error}`;
            }
        }

        if (error?.message) {
            return error.message;
        }

        return "Google sign-in failed. Please try again.";
    }
}

export default new GoogleAuthService();
