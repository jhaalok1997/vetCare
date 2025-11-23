"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tab";
import { Button } from "@/components/ui/button";
import { DashboardData } from "./types";
import { DashboardOverviewSection } from "./DashboardOverview";
import { DashboardAppointmentsSection } from "./DashboardAppointments";
import { DashboardPatientsSection } from "./DashboardPatients";
import { DashboardMessagesSection } from "./DashboardMessages";

const numberFormatter = new Intl.NumberFormat();

export default function VetDashboard() {
    const router = useRouter();
    const [authLoading, setAuthLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleLogout = async () => {
        try {
            await axios.post("/api/Auth/logout");
            try {
                localStorage.removeItem("user");
            } catch {
                // ignore
            }
            window.location.href = "/";
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    const fetchDashboardData = useCallback(async () => {
        setDataLoading(true);
        setError(null);

        try {
            const res = await axios.get("/api/veterinarian/dashboard");
            setDashboardData(res.data);
        } catch (err) {
            console.error("Dashboard data fetch failed:", err);
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setDataLoading(false);
        }
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await axios.get("/api/Auth/profile");
                const data = res.data;

                if (data.user?.role === "admin") {
                    router.push("/admin");
                    return;
                }

                if (data.user?.role !== "vet") {
                    router.push("/");
                    return;
                }

                await fetchDashboardData();
            } catch (err) {
                console.error("Auth check error:", err);
                router.push("/login");
            } finally {
                setAuthLoading(false);
            }
        };

        checkAuth();
    }, [fetchDashboardData, router]);

    const vetName = useMemo(
        () => dashboardData?.meta?.vetProfile?.name ?? "Veterinarian",
        [dashboardData]
    );

    const isVerified = dashboardData?.meta?.vetProfile?.isVerified ?? false;

    if (authLoading || (dataLoading && !dashboardData)) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold">Welcome back, Dr. {vetName}</h1>
                        {isVerified && (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                                Verified
                            </span>
                        )}
                    </div>
                    {dashboardData?.meta?.totals?.consultationsTracked !== undefined && (
                        <p className="text-sm text-muted-foreground">
                            Tracking {numberFormatter.format(dashboardData.meta.totals.consultationsTracked)} total consultations across your practice.
                        </p>
                    )}
                    {error && (
                        <div className="flex items-center gap-3 text-sm text-red-600">
                            <span>{error}</span>
                            <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={dataLoading}>
                                Retry
                            </Button>
                        </div>
                    )}
                </div>
                <Button variant="outline" onClick={handleLogout}>
                    Logout
                </Button>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-4 flex flex-wrap">
                    <TabsTrigger className="hover:bg-gray-500 cursor-pointer" value="overview">Overview</TabsTrigger>
                    <TabsTrigger className="hover:bg-gray-500 cursor-pointer" value="appointments">Appointments</TabsTrigger>
                    <TabsTrigger className="hover:bg-gray-500 cursor-pointer" value="patients">Patients</TabsTrigger>
                    <TabsTrigger className="hover:bg-gray-500 cursor-pointer" value="messages">Messages</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <DashboardOverviewSection overview={dashboardData?.overview} />
                </TabsContent>

                <TabsContent value="appointments">
                    <DashboardAppointmentsSection
                        appointments={dashboardData?.appointments}
                        isLoading={dataLoading}
                    />
                </TabsContent>

                <TabsContent value="patients">
                    <DashboardPatientsSection patients={dashboardData?.patients} />
                </TabsContent>

                <TabsContent value="messages">
                    <DashboardMessagesSection
                        messages={dashboardData?.messages}
                        isLoading={dataLoading}
                        onRefresh={fetchDashboardData}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}