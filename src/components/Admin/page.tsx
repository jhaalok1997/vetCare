"use client";

import { useEffect, useState } from "react";
import {
    UsersIcon,
    UserGroupIcon,
    ShieldCheckIcon,
    ChartBarIcon
} from "@heroicons/react/24/outline";

interface ActivityItem {
    description: string;
    timestamp: string;
}

interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    totalVets: number;
    totalAdmins: number;
    recentActivity: ActivityItem[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        activeUsers: 0,
        totalVets: 0,
        totalAdmins: 0,
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch("/api/admin/dashboard", {
                    credentials: 'include' // Add credentials for cookie
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statsCards = [
        {
            name: "Total Users",
            value: stats.totalUsers,
            icon: UsersIcon,
            color: "bg-blue-500",
        },
        {
            name: "Active Users",
            value: stats.activeUsers,
            icon: UserGroupIcon,
            color: "bg-green-500",
        },
        {
            name: "Veterinarians",
            value: stats.totalVets,
            icon: ShieldCheckIcon,
            color: "bg-purple-500",
        },
        {
            name: "Admins",
            value: stats.totalAdmins,
            icon: ChartBarIcon,
            color: "bg-orange-500",
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="mt-1 text-lg text-gray-500">
                    Welcome to the Vet Assistant Admin Panel
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((card) => (
                    <div
                        key={card.name}
                        className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6"
                    >
                        <dt>
                            <div className={`absolute rounded-md p-3 ${card.color}`}>
                                <card.icon className="h-6 w-6 text-white" />
                            </div>
                            <p className="ml-16 truncate text-sm font-medium text-gray-500">
                                {card.name}
                            </p>
                        </dt>
                        <dd className="ml-16 flex items-baseline">
                            <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                        </dd>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                    <div className="flow-root">
                        <ul className="-mb-8">
                            {stats.recentActivity.length > 0 ? (
                                stats.recentActivity.map((activity, index) => (
                                    <li key={index}>
                                        <div className="relative pb-8">
                                            {index !== stats.recentActivity.length - 1 && (
                                                <span
                                                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                                    aria-hidden="true"
                                                />
                                            )}
                                            <div className="relative flex space-x-3">
                                                <div>
                                                    <span className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center ring-8 ring-white">
                                                        <UsersIcon className="h-5 w-5 text-white" />
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500">
                                                            {activity.description}
                                                        </p>
                                                    </div>
                                                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                        {new Date(activity.timestamp).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="text-center text-gray-500 py-8">
                                    No recent activity
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
