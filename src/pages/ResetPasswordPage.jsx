import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword, verifyResetToken } from "../controllers/auth";
import { Eye, EyeOff } from "lucide-react";

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
            <div className="min-h-screen flex items-center justify-center bg-emerald-50 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg bg-white rounded-lg shadow-lg p-6 sm:p-8">
                    <div className="text-center">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-4"
                        />
                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            Verifying Reset Link
                        </h2>
                        <p className="text-sm text-gray-600">
                            Please wait while we verify your password reset
                            link...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

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
                </div>

                {tokenValid === false ? (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-red-600"
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
                        </div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                            Invalid Reset Link
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">
                            This password reset link is invalid, expired, or
                            missing.
                        </p>
                        <p className="text-xs text-gray-500 mb-6">
                            Redirecting to forgot password page in a few
                            seconds...
                        </p>

                        <Link
                            to="/forgot-password"
                            className="w-full bg-emerald-600 text-white rounded-lg py-3 px-4 text-sm font-medium hover:bg-emerald-700 transition inline-block text-center"
                        >
                            Get New Reset Link
                        </Link>
                    </div>
                ) : !isSuccess ? (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-2">
                                Set New Password
                            </h2>
                            <p className="text-sm text-gray-600">
                                Enter your new password below
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="New password (min. 6 characters)"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                    minLength={6}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            <div className="relative">
                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    required
                                    minLength={6}
                                    className={`w-full border rounded-lg px-4 py-3 text-sm sm:text-base outline-none focus:ring-2 ${
                                        confirmPassword &&
                                        password !== confirmPassword
                                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                            : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                                    }`}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide confirm password"
                                            : "Show confirm password"
                                    }
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            {/* Password Match Indicator */}
                            {confirmPassword && (
                                <div className="text-sm">
                                    {password === confirmPassword ? (
                                        <p className="text-emerald-600 flex items-center gap-1">
                                            ✓ Passwords match
                                        </p>
                                    ) : (
                                        <p className="text-red-600 flex items-center gap-1">
                                            ✗ Passwords do not match
                                        </p>
                                    )}
                                </div>
                            )}

                            {message && !isSuccess && (
                                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                                    {message}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading || !tokenValid}
                                className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm sm:text-base font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading
                                    ? "Resetting Password..."
                                    : "Reset Password"}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center">
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
                        <h2 className="text-lg sm:text-xl font-semibold text-emerald-600 mb-2">
                            Password Reset Successfully!
                        </h2>
                        <p className="text-sm text-gray-600 bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
                            {message}
                        </p>
                        <p className="text-xs text-gray-500 mb-6">
                            You will be redirected to the login page in a few
                            seconds...
                        </p>

                        <Link
                            to="/login"
                            className="w-full bg-emerald-600 text-white rounded-lg py-3 px-4 text-sm font-medium hover:bg-emerald-700 transition inline-block text-center"
                        >
                            Go to Sign In
                        </Link>
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
