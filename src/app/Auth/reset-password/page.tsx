"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const handleResetPassword = async () => {
        setIsLoading(true);
        setMessage("");

        // Validation
        if (!token) {
            setMessage(" Invalid reset token");
            setIsLoading(false);
            return;
        }

        if (!newPassword || !confirmPassword) {
            setMessage(" Please fill in all fields");
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 5) {
            setMessage(" Password must be at least 5 characters long");
            setIsLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage(" Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            await axios.post("/api/Auth/reset-password", { token, newPassword });
            setMessage("✅ Password successfully reset!",);
            setTimeout(() => router.push("/login"), 2000);
        } catch (error) {
            const err = error as AxiosError<{ error?: string }>;
            setMessage(`❌ ${err.response?.data?.error || "An error occurred. Please try again."}`);
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
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Reset Password</h2>

            <input
                type="password"
                placeholder="New Password"
                className="w-full mb-4 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            />

            <input
                type="password"
                placeholder="Confirm New Password"
                className="w-full mb-6 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button
                onClick={handleResetPassword}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                disabled={isLoading}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Resetting Password...
                    </div>
                ) : (
                    "Reset Password"
                )}
            </Button>

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
