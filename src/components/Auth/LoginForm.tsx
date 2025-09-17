"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";  // lightweight JWT decoder (no verify, just parse payload)

interface LoginFormProps {
    onSuccess?: (user: object) => void;
}

interface DecodedToken {
    id: string;
    email: string;
    role: string;
    tenantId?: string;
    exp: number;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        setMessage("");
        setIsLoading(true);

        if (!email || !password) {
            setMessage("❌ Please fill in all fields");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/Auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage("✅ Login successful!");

                // 🔑 The token is set in an HttpOnly cookie by backend,
                // but for redirect logic we can also return it in the response (optional).
                if (data.token) {
                    const decoded: DecodedToken = jwtDecode(data.token);

                    // Call parent callback
                    onSuccess?.(decoded);

                    // Role-based redirects
                    if (decoded.role === "admin") {
                        router.push("/admin/dashboard");
                    } else if (decoded.role === "vet") {
                        router.push("/vet/dashboard");
                    } else {
                        router.push("/dashboard");
                    }
                } else {
                    // Fallback: default redirect
                    router.push("/dashboard");
                }
            } else {
                setMessage(`❌ ${data.error}`);
            }
        } catch (error) {
            setMessage("❌ An error occurred. Please try again.");
            console.error(error);
        }

        setIsLoading(false);
    };

    const handleForgotPassword = async () => {
        setIsLoading(true);
        setMessage("");

        if (!email) {
            setMessage("❌ Please enter your email address");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/Auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage("✅ Password reset link sent to your email");
                setShowForgotPassword(false);
            } else {
                setMessage(`❌ ${data.error}`);
            }
        } catch (error) {
            setMessage("❌ An error occurred. Please try again.");
            console.error(error);
        }

        setIsLoading(false);
    };

    return (
        <motion.div
            className="max-w-md mx-auto mt-10 p-8 rounded-2xl shadow-lg bg-white dark:bg-gray-900"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
                {showForgotPassword ? "Reset Password" : "Welcome Back"}
            </h2>

            <input
                type="email"
                placeholder="Email"
                className="w-full mb-4 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            {!showForgotPassword && (
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full mb-6 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            )}

            <Button
                onClick={showForgotPassword ? handleForgotPassword : handleLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg mb-4"
                disabled={isLoading}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                    </div>
                ) : (
                    showForgotPassword ? "Send Reset Link" : "Login"
                )}
            </Button>

            <button
                onClick={() => setShowForgotPassword(!showForgotPassword)}
                className="w-full text-sm text-blue-600 hover:text-blue-700 text-center mt-2"
            >
                {showForgotPassword ? "Back to Login" : "Forgot Password?"}
            </button>

            {message && (
                <motion.p
                    className={`mt-4 text-center text-sm font-medium ${message.startsWith("✅") ? "text-green-600" : "text-red-600"
                        }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {message}
                </motion.p>
            )}
        </motion.div>
    );
}
