import { useState } from "react";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../controllers/auth";
import { useDispatch } from "react-redux";
import ErrorAlert from "../components/Error/ErrorAlert";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Clear previous error
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
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-200">
            <div className="w-full max-w-2xl mx-4 sm:mx-auto bg-[#eefbfc] rounded-lg shadow-md overflow-hidden">
                <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-gray-800 to-gray-700 text-white">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">LOGIN</h1>
                </div>

                <form onSubmit={handleSubmit} className="px-8 py-6">
                    {/* Error Message Display */}
                    <ErrorAlert 
                        error={error} 
                        onDismiss={() => setError("")} 
                        type="error" 
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center mb-4">
                        <label className="sm:w-40 text-gray-700 mb-1 sm:mb-0">
                            Email Address:
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 border-b border-black bg-transparent outline-none text-gray-500"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center mb-4"> 
                        <label className="sm:w-40 text-gray-700 mb-1 sm:mb-0">Password:</label>
                        <div className="relative flex-1">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border-b border-black bg-transparent outline-none text-gray-500 pr-12"
                                disabled={isLoading}
                                required
                            />
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/159/159604.png"
                                alt="Toggle password"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-6 cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            />
                        </div>
                    </div>

                    <div className="text-right mb-4">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-gray-700 hover:underline"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-black text-white py-3 sm:py-2 rounded hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                                Signing In...
                            </>
                        ) : (
                            "Login"
                        )}
                    </button>

                    <p className="text-center text-sm mt-4">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="text-blue-500 hover:underline"
                        >
                            Sign up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}