"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bars3Icon, BellIcon, UserCircleIcon } from "@heroicons/react/24/outline";

interface User {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'vet' | 'petOwner';
    tenantId?: string;
}

interface AdminHeaderProps {
    user: User | null;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/Auth/logout", {
                method: "POST",
            });
            if (res.ok) {
                try { localStorage.removeItem('user'); } catch {}
                router.push("/login");
            }
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center">
                    <button
                        type="button"
                        className="text-gray-500 hover:text-gray-600 lg:hidden"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <div className="ml-4 lg:ml-0">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Welcome back, {user ? user.username : "Admin"}
                        </h2>
                        <p className="text-sm text-gray-500">Admin Dashboard</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        type="button"
                        className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                        <BellIcon className="h-6 w-6" />
                    </button>

                    <div className="relative">
                        <button
                            type="button"
                            className="flex items-center space-x-2 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            <UserCircleIcon className="h-8 w-8" />
                            <span className="text-sm font-medium text-gray-700">
                                {user ? user.username : "Admin"}
                            </span>
                        </button>

                        {isOpen && (
                            <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                                    <p className="font-medium">{user?.username}</p>
                                    <p className="text-gray-500">{user?.email}</p>
                                    <p className="text-xs text-emerald-600 font-medium">
                                        {user?.role ? user.role.toUpperCase() : ''}
                                    </p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
