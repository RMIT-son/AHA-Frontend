import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../controllers/auth";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        try {
            const res = await forgotPassword(email);
            if (res.success) {
                setIsSuccess(true);
                setMessage(
                    "Password reset link has been sent to your email address."
                );
            } else {
                setIsSuccess(false);
                setMessage(
                    res.message ||
                        "Failed to send reset email. Please try again."
                );
            }
        } catch (error) {
            setIsSuccess(false);
            setMessage("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-emerald-50 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg bg-white rounded-lg shadow-lg p-6 sm:p-8">
                {/* Logo */}
                <div className="text-center mb-6">
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-4"
                    />
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-2">
                        Reset Your Password
                    </h2>
                    <p className="text-sm text-gray-600">
                        Enter your email address and we'll send you a secure
                        link to reset your password
                    </p>
                </div>

                {!isSuccess ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            disabled={isLoading}
                        />

                        {message && !isSuccess && (
                            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm sm:text-base font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-emerald-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-emerald-600 mb-2">
                            Check Your Email
                        </h3>
                        <p className="text-gray-600 text-sm bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                            {message}
                        </p>
                        <p className="text-xs text-gray-500">
                            Didn't receive the email? Check your spam folder or
                            try again.
                        </p>
                        <button
                            onClick={() => {
                                setIsSuccess(false);
                                setMessage("");
                                setEmail("");
                            }}
                            className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm sm:text-base font-medium hover:bg-emerald-700 transition"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Back to Login */}
                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="text-sm text-emerald-600 hover:text-emerald-800 font-medium hover:underline"
                    >
                        ← Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
