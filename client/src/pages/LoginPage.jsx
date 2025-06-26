import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../controllers/auth";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await loginUser(email, password);
        if (res.success) {
            // Optionally store token, set context
            navigate("/"); // Redirect to home or chat
        } else {
            alert(res.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-200">
            <div className="w-full max-w-2xl bg-[#eefbfc] rounded-lg shadow-md overflow-hidden">
                <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-gray-800 to-gray-700 text-white">
                    <h1 className="text-4xl font-bold">LOGIN</h1>
                    <img
                        src="/doctor.jpg"
                        alt="Doctor"
                        className="h-16 w-16 object-cover rounded-md"
                    />
                </div>

                <form onSubmit={handleSubmit} className="px-8 py-6">
                    <div className="flex items-center mb-4">
                        <label className="w-40 text-gray-700">
                            Email Address :
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 border-b border-black bg-transparent outline-none text-gray-500"
                        />
                    </div>

                    <div className="flex items-center mb-4">
                        <label className="w-40 text-gray-700">Password :</label>
                        <div className="relative flex-1">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border-b border-black bg-transparent outline-none text-gray-500 pr-10"
                            />
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/159/159604.png"
                                alt="Toggle password"
                                className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-6 cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            />
                        </div>
                    </div>

                    <div className="text-right mb-4">
                        <Link
                            to="#"
                            className="text-sm text-gray-700 hover:underline"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
                    >
                        Login
                    </button>

                    <p className="text-center text-sm mt-4">
                        Don’t have an account?{" "}
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
