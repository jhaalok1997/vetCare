"use client";

import LoginForm from "@/components/Auth/LoginForm";
import Image from "next/image";

export default function LoginPage() {
    return (
        <div className="relative min-h-full h-full overflow-hidden">
            <div className="absolute inset-0">
                <Image
                    src="/vetCare_banner (2).webp"
                    alt="Veterinary Care Background"
                    fill
                    priority
                    className="object-cover blur-sm scale-105"
                />
                <div className="absolute inset-0 bg-black/30" />
            </div>
            <div className="relative z-10 min-h-screen h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    <LoginForm />
                </div>
            </div>
        </div>
    );
}
