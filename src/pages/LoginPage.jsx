import { useState } from "react";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../controllers/auth";
import { useDispatch } from "react-redux";
import { Eye, EyeOff } from "lucide-react";
import ErrorAlert from "../components/Error/ErrorAlert";
import GoogleAuthService from "../Services/googleAuth";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await loginUser(email, password);
            if (res.success) {
                dispatch({ type: "LOGIN", payload: res.data });
                Cookies.set("user", JSON.stringify(res.data), { expires: 7 });
                navigate("/");
            } else {
                setError(res.message || "Login failed. Please try again.");
            }
        } catch {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        setIsGoogleLoading(true);

        try {
            const result = await GoogleAuthService.signIn();

            if (result.success) {
                const verification = await GoogleAuthService.verifyWithBackend(
                    result.data.idToken
                );
                if (verification.success) {
                    dispatch({ type: "LOGIN", payload: verification.data });
                    Cookies.set("user", JSON.stringify(verification.data), {
                        expires: 7,
                    });
                    navigate("/");
                } else {
                    setError(verification.message);
                }
            } else {
                setError(result.message);
            }
        } catch (error) {
            console.error("Google login error:", error);
            setError("Google sign-in failed. Please try again.");
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const forgotPassword = () => {
        navigate("/forgot-password");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center">
                {/* Logo */}
                <div className="mb-4">
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto"
                    />
                </div>

                <h2 className="text-lg sm:text-xl lg:text-2xl font-medium mb-4">
                    Welcome to A.I Healthcare Assistant
                </h2>

                {/* Error */}
                <ErrorAlert
                    error={error}
                    onDismiss={() => setError("")}
                    type="error"
                />

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        className="w-full border border-gray-300 rounded-full px-4 py-2 sm:py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-orange-400"
                        required
                        disabled={isLoading || isGoogleLoading}
                    />

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            className="w-full border border-gray-300 rounded-full px-4 py-2 sm:py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-orange-400"
                            required
                            disabled={isLoading || isGoogleLoading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-gray-700"
                            aria-label={
                                showPassword ? "Hide password" : "Show password"
                            }
                        >
                            {showPassword ? (
                                <EyeOff className="w-5 h-5 sm:w-6 sm:h-6" />
                            ) : (
                                <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                        </button>
                    </div>

                    {/* Forgot password link */}
                    <div className="text-right -mt-2">
                        <button
                            type="button"
                            onClick={forgotPassword}
                            className="text-xs sm:text-sm text-blue-500 hover:underline"
                        >
                            Forgot password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || isGoogleLoading}
                        className="w-full bg-orange-500 text-white rounded-full py-2 sm:py-3 text-sm sm:text-base hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Signing In..." : "Continue"}
                    </button>
                </form>

                {/* Sign Up */}
                <p className="mt-4 text-xs sm:text-sm">
                    Don't have account?{" "}
                    <Link
                        to="/register"
                        className="text-blue-500 hover:underline"
                    >
                        Sign up
                    </Link>
                </p>

                {/* Divider */}
                <div className="flex items-center my-4">
                    <hr className="flex-1 border-gray-300" />
                    <span className="mx-2 text-gray-400 text-xs sm:text-sm">
                        OR
                    </span>
                    <hr className="flex-1 border-gray-300" />
                </div>

                {/* Google Sign In Button */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={isLoading || isGoogleLoading}
                    className="w-full border border-gray-300 rounded-full py-2 sm:py-3 flex items-center justify-center gap-2 mb-2 hover:bg-gray-50 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <img
                        src="/google-icon.png"
                        alt="Google"
                        className="w-5 h-5 sm:w-6 sm:h-6"
                    />
                    {isGoogleLoading
                        ? "Signing in with Google..."
                        : "Continue with Google"}
                </button>
            </div>
        </div>
    );
}
