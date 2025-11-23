"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "@/components/Admin/Sidebar/AdminSidebar";
import AdminHeader from "@/components/Admin/Header/AdminHeader";
import AdminAuthWrapper from "@/components/Admin/AuthWrapper/AdminAuthWrapper";

interface User {
    id: string;
    email: string;
    username: string;
    role: "admin" | "vet" | "petOwner";
    tenantId: string;
}

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [user, setUser] = useState<User | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get("/api/Auth/profile");
                if (res.data.user) {
                    setUser(res.data.user);
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
                <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <div className="lg:pl-64">
                    <AdminHeader user={user} toggleSidebar={() => setSidebarOpen(s => !s)} />
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
