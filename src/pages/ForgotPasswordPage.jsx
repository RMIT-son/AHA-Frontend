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
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow p-8 text-center">
                {/* Logo */}
                <div className="mb-4">
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto"
                    />
                </div>

                {/* Title */}
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Forgot password
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                    Enter your email address and we'll send you a link to reset
                    your password
                </p>

                {!isSuccess ? (
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-400 focus:outline-none mb-4"
                        />

                        {message && (
                            <p
                                className={`mb-4 text-sm ${
                                    isSuccess
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-orange-500 text-white py-2 rounded-full hover:bg-orange-600 transition disabled:opacity-50"
                        >
                            {isLoading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                ) : (
                    <div>
                        <h3 className="text-lg font-semibold text-green-600 mb-2">
                            Check Your Email
                        </h3>
                        <p className="text-gray-600 mb-4 text-sm">{message}</p>
                        <button
                            onClick={() => {
                                setIsSuccess(false);
                                setMessage("");
                                setEmail("");
                            }}
                            className="w-full bg-orange-500 text-white py-2 rounded-full hover:bg-orange-600 transition mb-4"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Links */}
                <div className="mt-4">
                    <Link
                        to="/login"
                        className="text-sm text-gray-600 hover:underline"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
