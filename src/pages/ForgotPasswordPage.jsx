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
        <div className="min-h-screen flex items-center justify-center bg-gray-200">
            <div className="w-full max-w-2xl bg-[#eefbfc] rounded-lg shadow-md overflow-hidden">
                <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-gray-800 to-gray-700 text-white">
                    <h1 className="text-4xl font-bold">FORGOT PASSWORD</h1>
                </div>

                <div className="px-8 py-6">
                    {!isSuccess ? (
                        <>
                            <p className="text-gray-600 mb-6 text-center">
                                Enter your email address and we'll send you a
                                link to reset your password.
                            </p>

                            <form onSubmit={handleSubmit}>
                                <div className="flex items-center mb-6">
                                    <label className="w-40 text-gray-700">
                                        Email Address :
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                        className="flex-1 border-b border-black bg-transparent outline-none text-gray-500"
                                    />
                                </div>

                                {message && (
                                    <div
                                        className={`text-center mb-4 text-sm ${
                                            isSuccess
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {message}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading
                                        ? "Sending..."
                                        : "Send Reset Link"}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="mb-6">
                                <svg
                                    className="w-16 h-16 text-green-500 mx-auto mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                    Check Your Email
                                </h2>
                                <p className="text-gray-600 mb-4">{message}</p>
                                <p className="text-sm text-gray-500">
                                    Didn't receive the email? Check your spam
                                    folder or try again.
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setIsSuccess(false);
                                    setMessage("");
                                    setEmail("");
                                }}
                                className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition mb-4"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    <div className="text-center mt-6">
                        <Link
                            to="/login"
                            className="text-blue-500 hover:underline text-sm"
                        >
                            ← Back to Login
                        </Link>
                    </div>

                    <p className="text-center text-sm mt-4">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="text-blue-500 hover:underline"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
