"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Atom } from "react-loading-indicators";

interface AdminAuthWrapperProps {
  children: React.ReactNode;
}

export default function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const res = await fetch("/api/Auth/profile", {
          credentials: 'include' // Important: Include credentials for cookie
        });
        const userData = await res.json();

        if (res.ok && userData.user) {
          if (userData.user.role === "admin") {
            setIsAdmin(true);
            setLoading(false);
            return; // Don't redirect if admin
          }
          // If not admin, redirect to home page
          router.push("/");
        } else {
          // If not authenticated, redirect to login
          router.push("/Auth/login");
        }
      } catch (error) {
        console.error("Admin auth check failed:", error);
        router.push("/Auth/login");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Atom color="#32cd32" size="large" text="Verifying Admin Access..." textColor="#af5151" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Restricted</h1>
          <p className="text-gray-600 mb-4">This area is restricted to administrators only.</p>
          <button
            onClick={() => router.push("/")}
            className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
