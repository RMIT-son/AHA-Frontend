import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword, verifyResetToken } from "../controllers/auth";

export default function ResetPasswordPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [token, setToken] = useState("");
    const [isValidatingToken, setIsValidatingToken] = useState(true);
    const [tokenValid, setTokenValid] = useState(null);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const tokenFromUrl = searchParams.get("token");
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
            verifyTokenValidity(tokenFromUrl);
        } else {
            // No token in URL - redirect immediately
            setIsValidatingToken(false);
            setTokenValid(false);
            setTimeout(() => {
                navigate("/forgot-password");
            }, 3000);
        }
    }, [searchParams, navigate]);

    const verifyTokenValidity = async (resetToken) => {
        try {
            setIsValidatingToken(true);
            const result = await verifyResetToken(resetToken);

            if (result.success && result.valid) {
                setTokenValid(true);
                setIsValidatingToken(false);
            } else {
                setTokenValid(false);
                setMessage("This reset link has expired or is invalid.");
                setIsValidatingToken(false);
                setTimeout(() => {
                    navigate("/forgot-password");
                }, 3000);
            }
        } catch (error) {
            console.error("Token verification error:", error);
            setTokenValid(false);
            setMessage("This reset link has expired or is invalid.");
            setIsValidatingToken(false);
            setTimeout(() => {
                navigate("/forgot-password");
            }, 3000);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setMessage("Password must be at least 6 characters long.");
            return;
        }

        if (!token) {
            setMessage("Invalid or missing reset token.");
            return;
        }

        setIsLoading(true);
        setMessage("");

        try {
            const res = await resetPassword(token, password);
            if (res.success) {
                setIsSuccess(true);
                setMessage("Password has been reset successfully!");
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate("/login");
                }, 3000);
            } else {
                setMessage(
                    res.message || "Failed to reset password. Please try again."
                );
            }
        } catch (error) {
            setMessage("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Show loading while validating token
    if (isValidatingToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-200">
                <div className="w-full max-w-2xl bg-[#eefbfc] rounded-lg shadow-md overflow-hidden">
                    <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-gray-800 to-gray-700 text-white">
                        <h1 className="text-4xl font-bold">RESET PASSWORD</h1>
                    </div>
                    <div className="px-8 py-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                        <p className="text-gray-600">Verifying reset link...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-200">
            <div className="w-full max-w-2xl bg-[#eefbfc] rounded-lg shadow-md overflow-hidden">
                <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-gray-800 to-gray-700 text-white">
                    <h1 className="text-4xl font-bold">RESET PASSWORD</h1>
                </div>

                <div className="px-8 py-6">
                    {tokenValid === false ? (
                        <div className="text-center">
                            <div className="mb-6">
                                <svg
                                    className="w-16 h-16 text-red-500 mx-auto mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                    Invalid Reset Link
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    This password reset link is invalid,
                                    expired, or missing.
                                </p>
                                <p className="text-sm text-gray-500 mb-6">
                                    Redirecting to forgot password page in a few
                                    seconds...
                                </p>
                            </div>

                            <Link
                                to="/forgot-password"
                                className="inline-block w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition text-center"
                            >
                                Get New Reset Link
                            </Link>
                        </div>
                    ) : !isSuccess ? (
                        <>
                            <p className="text-gray-600 mb-6 text-center">
                                Enter your new password below.
                            </p>

                            <form onSubmit={handleSubmit}>
                                <div className="flex items-center mb-4">
                                    <label className="w-40 text-gray-700">
                                        New Password :
                                    </label>
                                    <div className="relative flex-1">
                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Enter your new password"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            required
                                            minLength={6}
                                            className="w-full border-b border-black bg-transparent outline-none text-gray-500 pr-10"
                                        />
                                        <img
                                            src="https://cdn-icons-png.flaticon.com/512/159/159604.png"
                                            alt="Toggle password"
                                            className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-6 cursor-pointer"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center mb-6">
                                    <label className="w-40 text-gray-700">
                                        Confirm Password:
                                    </label>
                                    <div className="relative flex-1">
                                        <input
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Confirm your new password"
                                            value={confirmPassword}
                                            onChange={(e) =>
                                                setConfirmPassword(
                                                    e.target.value
                                                )
                                            }
                                            required
                                            minLength={6}
                                            className="w-full border-b border-black bg-transparent outline-none text-gray-500 pr-10"
                                        />
                                        <img
                                            src="https://cdn-icons-png.flaticon.com/512/159/159604.png"
                                            alt="Toggle confirm password"
                                            className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-6 cursor-pointer"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                        />
                                    </div>
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
                                    disabled={isLoading || !tokenValid}
                                    className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading
                                        ? "Resetting..."
                                        : "Reset Password"}
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
                                    Password Reset Successfully!
                                </h2>
                                <p className="text-gray-600 mb-4">{message}</p>
                                <p className="text-sm text-gray-500">
                                    You will be redirected to the login page in
                                    a few seconds...
                                </p>
                            </div>

                            <Link
                                to="/login"
                                className="inline-block w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition text-center"
                            >
                                Go to Login
                            </Link>
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
                </div>
            </div>
        </div>
    );
}
