"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import AdminHeader from "@/components/Admin/AdminHeader";
import AdminAuthWrapper from "@/components/Admin/AdminAuthWrapper";

interface User {
    id: string;
    email: string;
    username: string;
    role: string;
    tenantId: string;
}

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/Auth/profile");
                if (res.ok) {
                    const userData = await res.json();
                    setUser(userData);
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        };

        fetchUser();
    }, []);

    return (
        <AdminAuthWrapper>
            <div className="min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="lg:pl-64">
                    <AdminHeader user={user} />
                    <main className="py-6">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </AdminAuthWrapper>
    );
}
