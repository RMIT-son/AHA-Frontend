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
        
        // Clear previous messages
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
        <div className="min-h-screen flex items-center justify-center bg-gray-200">
            <div className="w-full max-w-2xl bg-[#eefbfc] rounded-lg shadow-md overflow-hidden">
                <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-gray-800 to-gray-700 text-white">
                    <h1 className="text-4xl font-bold">SIGN UP</h1>
                </div>

                <form onSubmit={handleSubmit} className="px-8 py-6">
                    {/* Success Message Display */}
                    <ErrorAlert 
                        error={success} 
                        onDismiss={() => setSuccess("")} 
                        type="success" 
                    />
                    
                    {/* Error Message Display */}
                    <ErrorAlert 
                        error={error} 
                        onDismiss={() => setError("")} 
                        type="error" 
                    />

                    <div className="flex items-center mb-4">
                        <label className="w-40 text-gray-700">Full Name:</label>
                        <input
                            type="text"
                            placeholder="Enter your full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="flex-1 border-b border-black bg-transparent outline-none text-gray-500"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="flex items-center mb-4">
                        <label className="w-40 text-gray-700">
                            Email Address:
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 border-b border-black bg-transparent outline-none text-gray-500"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="flex items-center mb-4">
                        <label className="w-40 text-gray-700">Phone no:</label>
                        <input
                            type="text"
                            placeholder="Enter your phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="flex-1 border-b border-black bg-transparent outline-none text-gray-500"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="flex items-center mb-4">
                        <label className="w-40 text-gray-700">Password:</label>
                        <div className="relative flex-1">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border-b border-black bg-transparent outline-none text-gray-500 pr-10"
                                disabled={isLoading}
                                required
                                minLength="6"
                            />
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/159/159604.png"
                                alt="Toggle password"
                                className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-6 cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center mb-6">
                        <label className="w-40 text-gray-700">
                            Confirm Password:
                        </label>
                        <div className="relative flex-1">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full border-b bg-transparent outline-none pr-10 ${
                                    confirmPassword && password !== confirmPassword
                                        ? "border-red-500 text-red-500"
                                        : "border-black text-gray-500"
                                }`}
                                disabled={isLoading}
                                required
                            />
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/159/159604.png"
                                alt="Toggle confirm password"
                                className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-6 cursor-pointer"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            />
                        </div>
                    </div>

                    {/* Password Match Indicator */}
                    {confirmPassword && (
                        <div className="mb-4 text-sm">
                            {password === confirmPassword ? (
                                <div className="flex items-center text-green-600">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Passwords match
                                </div>
                            ) : (
                                <div className="flex items-center text-red-600">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Passwords do not match
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Creating Account...
                            </>
                        ) : (
                            "Sign up"
                        )}
                    </button>

                    <p className="text-center mt-4 text-sm">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-blue-500 hover:underline"
                        >
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}