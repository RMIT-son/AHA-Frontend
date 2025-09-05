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
                // Skip backend verification for now - use Google data directly
                const userData = {
                    id: result.data.id,
                    name: result.data.name,
                    email: result.data.email,
                    imageUrl: result.data.imageUrl,
                    loginMethod: "google",
                    // Add any other fields your app expects
                };

                dispatch({ type: "LOGIN", payload: userData });
                Cookies.set("user", JSON.stringify(userData), {
                    expires: 7,
                });
                navigate("/");
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
                        Welcome
                    </h2>
                    <p className="text-sm text-gray-600">
                        Sign in to your healthcare account
                    </p>
                </div>

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
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                            disabled={isLoading || isGoogleLoading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            aria-label={
                                showPassword ? "Hide password" : "Show password"
                            }
                        >
                            {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    {/* Forgot password link */}
                    <div className="text-right">
                        <button
                            type="button"
                            onClick={forgotPassword}
                            className="text-sm text-emerald-600 hover:text-emerald-800 hover:underline"
                        >
                            Forgot password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || isGoogleLoading}
                        className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm sm:text-base font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center my-6">
                    <hr className="flex-1 border-gray-300" />
                    <span className="mx-4 text-gray-400 text-sm">OR</span>
                    <hr className="flex-1 border-gray-300" />
                </div>

                {/* Google Sign In Button */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={isLoading || isGoogleLoading}
                    className="w-full border border-gray-300 rounded-lg py-3 flex items-center justify-center gap-3 text-sm sm:text-base hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <img
                        src="/google-icon.png"
                        alt="Google"
                        className="w-5 h-5"
                    />
                    {isGoogleLoading
                        ? "Signing in with Google..."
                        : "Continue with Google"}
                </button>

                {/* Sign Up */}
                <p className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="text-emerald-600 hover:text-emerald-800 font-medium hover:underline"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
