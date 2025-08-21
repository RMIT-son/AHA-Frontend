import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../controllers/auth";
import { useDispatch } from "react-redux";
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
            const res = await registerUser({ fullName, email, password, phone });

            if (res.success) {
                dispatch({ type: "REGISTER", payload: res.data });
                setSuccess("Account created successfully! Redirecting to login...");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setError(res.message || "Registration failed. Please try again.");
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                
                {/* Logo */}
                <div className="flex justify-center mb-4">
                    <img
                        src="/your-logo.png" // replace with your healthcare logo path
                        alt="Logo"
                        className="h-12 w-12"
                    />
                </div>

                {/* Title */}
                <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">
                    Create an account
                </h2>

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
                        placeholder="Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-2 rounded-full border border-gray-300 outline-none focus:ring-2 focus:ring-[#EB5E33]"
                        disabled={isLoading}
                        required
                    />

                    {/* Email */}
                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 rounded-full border border-gray-300 outline-none focus:ring-2 focus:ring-[#EB5E33]"
                        disabled={isLoading}
                        required
                    />

                    {/* Phone */}
                    <input
                        type="text"
                        placeholder="Phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2 rounded-full border border-gray-300 outline-none focus:ring-2 focus:ring-[#EB5E33]"
                        disabled={isLoading}
                        required
                    />

                    {/* Password */}
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 rounded-full border border-gray-300 outline-none focus:ring-2 focus:ring-[#EB5E33] pr-10"
                            disabled={isLoading}
                            required
                            minLength="6"
                        />
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/159/159604.png"
                            alt="Toggle password"
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-6 cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                        />
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full px-4 py-2 rounded-full border outline-none pr-10 
                                ${confirmPassword && password !== confirmPassword
                                    ? "border-red-500 focus:ring-red-500 text-red-500"
                                    : "border-gray-300 focus:ring-[#EB5E33]"}`}
                            disabled={isLoading}
                            required
                        />
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/159/159604.png"
                            alt="Toggle confirm password"
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-6 cursor-pointer"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                    </div>

                    {/* Password Match Indicator */}
                    {confirmPassword && (
                        <div className="mb-2 text-sm">
                            {password === confirmPassword ? (
                                <p className="text-green-600"> Passwords match</p>
                            ) : (
                                <p className="text-red-600"> Passwords do not match</p>
                            )}
                        </div>
                    )}

                    {/* Sign up Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#EB5E33] text-white py-2 rounded-full font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            "Creating Account..."
                        ) : (
                            "Sign up"
                        )}
                    </button>
                </form>

                {/* Login Redirect */}
                <p className="text-center mt-4 text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link to="/login" className="text-[#EB5E33] font-medium hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
