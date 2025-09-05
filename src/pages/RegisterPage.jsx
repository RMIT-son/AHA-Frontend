import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../controllers/auth";
import { useDispatch } from "react-redux";
import { Eye, EyeOff } from "lucide-react";
import ErrorAlert from "../components/Error/ErrorAlert";

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear messages
        setError("");
        setSuccess("");

        // Client-side validation
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await registerUser({
                fullName,
                email,
                password,
                phone,
            });

            if (res.success) {
                dispatch({ type: "REGISTER", payload: res.data });
                setSuccess(
                    "Account created successfully! Redirecting to login..."
                );
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setError(
                    res.message || "Registration failed. Please try again."
                );
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
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
                        Create Your Account
                    </h2>
                    <p className="text-sm text-gray-600">
                        Join our healthcare platform
                    </p>
                </div>

                {/* Success & Error */}
                <ErrorAlert
                    error={success}
                    onDismiss={() => setSuccess("")}
                    type="success"
                />
                <ErrorAlert
                    error={error}
                    onDismiss={() => setError("")}
                    type="error"
                />

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        disabled={isLoading}
                        required
                    />

                    {/* Email */}
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        disabled={isLoading}
                        required
                    />

                    {/* Phone */}
                    <input
                        type="tel"
                        placeholder="Phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        disabled={isLoading}
                        required
                    />

                    {/* Password */}
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password (min. 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            disabled={isLoading}
                            required
                            minLength="6"
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

                    {/* Confirm Password */}
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full border rounded-lg px-4 py-3 text-sm sm:text-base outline-none focus:ring-2 ${
                                confirmPassword && password !== confirmPassword
                                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                    : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                            }`}
                            disabled={isLoading}
                            required
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
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

                    {/* Sign up Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm sm:text-base font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                {/* Login Redirect */}
                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-emerald-600 hover:text-emerald-800 font-medium hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
