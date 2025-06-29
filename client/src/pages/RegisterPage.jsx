import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../controllers/auth";

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        const res = await registerUser({ fullName, email, password, phone });
        if (res.success) {
            navigate("/login");
        } else {
            alert(res.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-200">
            <div className="w-full max-w-2xl bg-[#eefbfc] rounded-lg shadow-md overflow-hidden">
                <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-gray-800 to-gray-700 text-white">
                    <h1 className="text-4xl font-bold">SIGN UP</h1>
                    <img
                        src="/doctor.jpg"
                        alt="Doctor"
                        className="h-16 w-16 object-cover rounded-md"
                    />
                </div>

                <form onSubmit={handleSubmit} className="px-8 py-6">
                    <div className="flex items-center mb-4">
                        <label className="w-40 text-gray-700">
                            Full Name :
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="flex-1 border-b border-black bg-transparent outline-none text-gray-500"
                        />
                    </div>

                    <div className="flex items-center mb-4">
                        <label className="w-40 text-gray-700">
                            Email Address :
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 border-b border-black bg-transparent outline-none text-gray-500"
                        />
                    </div>

                    <div className="flex items-center mb-4">
                        <label className="w-40 text-gray-700">Phone no :</label>
                        <input
                            type="text"
                            placeholder="Enter your phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
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

                    <div className="flex items-center mb-6">
                        <label className="w-40 text-gray-700">
                            Confirm Password :
                        </label>
                        <div className="relative flex-1">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                className="w-full border-b border-black bg-transparent outline-none text-gray-500 pr-10"
                            />
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/159/159604.png"
                                alt="Toggle confirm password"
                                className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-6 cursor-pointer"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
                    >
                        Sign up
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