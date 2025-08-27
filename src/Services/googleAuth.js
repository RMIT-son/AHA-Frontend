// services/googleAuth.js
import { app } from "../config/keys";

class GoogleAuthService {
    constructor() {
        this.clientId = app.googleClientId;
        this.isInitialized = false;
        this.authInstance = null;
    }

    // Load Google API script dynamically
    loadGoogleScript() {
        return new Promise((resolve, reject) => {
            if (window.gapi) {
                resolve();
                return;
            }

            const script = document.createElement("script");
            script.src = "https://apis.google.com/js/api.js";
            script.onload = () => resolve();
            script.onerror = () =>
                reject(new Error("Failed to load Google API"));
            document.head.appendChild(script);
        });
    }

    // Initialize Google Sign-In
    async initialize() {
        if (this.isInitialized) {
            return this.authInstance;
        }

        // Validate client ID before proceeding
        if (!this.clientId) {
            throw new Error(
                "Google Client ID is not configured. Please check your .env file."
            );
        }

        try {
            await this.loadGoogleScript();

            await new Promise((resolve) => {
                window.gapi.load("auth2", resolve);
            });

            this.authInstance = await window.gapi.auth2.init({
                client_id: this.clientId,
            });

            this.isInitialized = true;
            return this.authInstance;
        } catch (error) {
            console.error("Google Auth initialization failed:", error);
            throw error;
        }
    }

    // Sign in with Google - matches your component call
    async signIn() {
        try {
            const authInstance = await this.initialize();
            const googleUser = await authInstance.signIn();

            const profile = googleUser.getBasicProfile();
            const authResponse = googleUser.getAuthResponse();

            return {
                success: true,
                data: {
                    id: profile.getId(),
                    name: profile.getName(),
                    email: profile.getEmail(),
                    imageUrl: profile.getImageUrl(),
                    idToken: authResponse.id_token,
                    accessToken: authResponse.access_token,
                },
            };
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            return {
                success: false,
                message: this.getErrorMessage(error),
            };
        }
    }

    // Verify with backend - matches your component call
    async verifyWithBackend(idToken) {
        try {
            const response = await fetch("/api/auth/google/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ idToken }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
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
            if (this.authInstance && this.authInstance.isSignedIn.get()) {
                await this.authInstance.signOut();
            }
            return { success: true };
        } catch (error) {
            console.error("Sign out error:", error);
            return { success: false, message: "Sign out failed" };
        }
    }

    // Check if user is signed in
    isSignedIn() {
        return this.authInstance && this.authInstance.isSignedIn.get();
    }

    // Get current user info
    getCurrentUser() {
        if (!this.isSignedIn()) {
            return null;
        }

        const googleUser = this.authInstance.currentUser.get();
        const profile = googleUser.getBasicProfile();

        return {
            id: profile.getId(),
            name: profile.getName(),
            email: profile.getEmail(),
            imageUrl: profile.getImageUrl(),
        };
    }

    // Helper method to get user-friendly error messages
    getErrorMessage(error) {
        if (error.error === "popup_closed_by_user") {
            return "Sign-in was cancelled";
        }
        if (error.error === "access_denied") {
            return "Access denied by user";
        }
        if (error.error === "popup_blocked") {
            return "Popup blocked. Please allow popups for this site";
        }
        return "Google sign-in failed. Please try again.";
    }
}

export default new GoogleAuthService();
