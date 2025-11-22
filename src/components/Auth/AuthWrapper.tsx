"use client";

import { useEffect, useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignUpForm";
import { motion, AnimatePresence } from "framer-motion";
import { Atom } from "react-loading-indicators"


interface AuthWrapperProps {
    children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
    const [isAuth, setIsAuth] = useState(false);
    const [showSignup, setShowSignup] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/Auth/profile");
                setIsAuth(res.ok);
            } catch {
                setIsAuth(false);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <Atom color="#32cd32" size="large" text="Loading" textColor="#af5151" />
        </div>;
    }

    if (!isAuth) {
        return (
            <>
                {/* Blurred background */}
                <div className="relative min-h-screen" aria-hidden="true">
                    <div className="absolute inset-0 filter blur-sm pointer-events-none">
                        {children}
                    </div>

                    {/* Auth forms overlay */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={showSignup ? "signup" : "login"}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute inset-0 flex items-center justify-center p-4"
                        >
                            <div className="w-full max-w-md">
                                {showSignup ? (
                                    <>
                                        <SignupForm onSuccess={() => setShowSignup(false)} />
                                        <p className="text-center mt-4 text-gray-600">
                                            Already have an account?{" "}
                                            <button
                                                onClick={() => setShowSignup(false)}
                                                className="text-emerald-600 hover:underline"
                                            >
                                                Log in
                                            </button>
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <LoginForm onSuccess={() => setIsAuth(true)} />
                                        <p className="text-center mt-4 text-gray-600">
                                            Don&apos;t have an account?{" "}
                                            <button
                                                onClick={() => setShowSignup(true)}
                                                className="text-emerald-600 hover:underline"
                                            >
                                                Sign up
                                            </button>
                                        </p>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </>
        );
    }

    return (
        <>

            {children}
        </>
    )
}
