"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
    UsersIcon,
    UserGroupIcon,
    ShieldCheckIcon,
    UserCircleIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ClockIcon,
    CheckCircleIcon,
    DocumentTextIcon,
    ChartBarIcon
} from "@heroicons/react/24/outline";

interface GrowthData {
    date: string;
    count: number;
}

interface DashboardData {
    overview: {
        totalUsers: number;
        totalPetOwners: number;
        totalVets: number;
        totalAdmins: number;
        roleDistribution: {
            petOwners: { count: number; percentage: string };
            vets: { count: number; percentage: string };
            admins: { count: number; percentage: string };
        };
    };
    activity: {
        last24Hours: { activeUsers: number; newRegistrations: number };
        last7Days: { activeUsers: number; newRegistrations: number };
        last30Days: { activeUsers: number; newRegistrations: number };
    };
    recentActivity: Array<{
        id: string;
        username: string;
        email: string;
        role: string;
        timestamp: string;
        action: string;
    }>;
    growthData?: GrowthData[];
    growthPercentage?: string;
}

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData>({
        overview: {
            totalUsers: 0,
            totalPetOwners: 0,
            totalVets: 0,
            totalAdmins: 0,
            roleDistribution: {
                petOwners: { count: 0, percentage: "0" },
                vets: { count: 0, percentage: "0" },
                admins: { count: 0, percentage: "0" }
            }
        },
        activity: {
            last24Hours: { activeUsers: 0, newRegistrations: 0 },
            last7Days: { activeUsers: 0, newRegistrations: 0 },
            last30Days: { activeUsers: 0, newRegistrations: 0 }
        },
        recentActivity: [],
        growthData: [],
        growthPercentage: "0"
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const currentUser = localStorage.getItem('user');
                const res = await axios.get("/api/admin/dashboard", {
                    headers: currentUser ? { 'x-user': currentUser } : {}
                });
                setData(res.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    const maxGrowth = Math.max(...(data.growthData?.map(d => d.count) || [1]));
    const isPositiveGrowth = parseFloat(data.growthPercentage || "0") >= 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Welcome back! Here&apos;s what&apos;s happening with your platform today.
                    </p>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
                    <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800">All Systems Operational</span>
                </div>
            </div>

            {/* Main Stats Cards with Trends */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Users Card */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Total Users</p>
                            <p className="text-3xl font-bold text-white mt-2">{data.overview.totalUsers}</p>
                            <div className="flex items-center mt-2">
                                {isPositiveGrowth ? (
                                    <ArrowTrendingUpIcon className="h-4 w-4 text-blue-100 mr-1" />
                                ) : (
                                    <ArrowTrendingDownIcon className="h-4 w-4 text-blue-100 mr-1" />
                                )}
                                <span className="text-sm text-blue-100">{data.growthPercentage}% this week</span>
                            </div>
                        </div>
                        <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                            <UsersIcon className="h-8 w-8 text-white" />
                        </div>
                    </div>
                </div>

                {/* Pet Owners Card */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Pet Owners</p>
                            <p className="text-3xl font-bold text-white mt-2">{data.overview.totalPetOwners}</p>
                            <div className="flex items-center mt-2">
                                <span className="text-sm text-green-100">{data.overview.roleDistribution.petOwners.percentage}% of users</span>
                            </div>
                        </div>
                        <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                            <UserGroupIcon className="h-8 w-8 text-white" />
                        </div>
                    </div>
                </div>

                {/* Veterinarians Card */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Veterinarians</p>
                            <p className="text-3xl font-bold text-white mt-2">{data.overview.totalVets}</p>
                            <div className="flex items-center mt-2">
                                <span className="text-sm text-purple-100">{data.overview.roleDistribution.vets.percentage}% of users</span>
                            </div>
                        </div>
                        <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                            <ShieldCheckIcon className="h-8 w-8 text-white" />
                        </div>
                    </div>
                </div>

                {/* Active Users Card */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">Active Today</p>
                            <p className="text-3xl font-bold text-white mt-2">{data.activity.last24Hours.activeUsers}</p>
                            <div className="flex items-center mt-2">
                                <span className="text-sm text-orange-100">Last 24 hours</span>
                            </div>
                        </div>
                        <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                            <ClockIcon className="h-8 w-8 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Growth Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">User Growth Trend</h3>
                        <ChartBarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="h-64 flex items-end justify-between space-x-2">
                        {data.growthData?.map((item, index) => {
                            const height = maxGrowth > 0 ? (item.count / maxGrowth) * 100 : 0;
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center">
                                    <div className="w-full flex flex-col items-center justify-end h-48 relative group">
                                        {/* Tooltip */}
                                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                            {item.count} users
                                        </div>
                                        {/* Bar */}
                                        <div
                                            className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all duration-500 hover:from-emerald-700 hover:to-emerald-500"
                                            style={{ height: `${height}%`, minHeight: height > 0 ? '8px' : '0' }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">{item.date}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Role Distribution - Donut Chart */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Role Distribution</h3>
                    <div className="flex flex-col items-center">
                        {/* Donut Chart */}
                        <div className="relative w-48 h-48 mb-6">
                            <svg className="w-48 h-48 transform -rotate-90">
                                {/* Background circle */}
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="80"
                                    fill="none"
                                    stroke="#f3f4f6"
                                    strokeWidth="32"
                                />
                                {/* Pet Owners segment */}
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="80"
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="32"
                                    strokeDasharray={`${(parseFloat(data.overview.roleDistribution.petOwners.percentage) / 100) * 502.65} 502.65`}
                                    className="transition-all duration-1000"
                                />
                                {/* Vets segment */}
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="80"
                                    fill="none"
                                    stroke="#8b5cf6"
                                    strokeWidth="32"
                                    strokeDasharray={`${(parseFloat(data.overview.roleDistribution.vets.percentage) / 100) * 502.65} 502.65`}
                                    strokeDashoffset={`-${(parseFloat(data.overview.roleDistribution.petOwners.percentage) / 100) * 502.65}`}
                                    className="transition-all duration-1000"
                                />
                                {/* Admins segment */}
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="80"
                                    fill="none"
                                    stroke="#f59e0b"
                                    strokeWidth="32"
                                    strokeDasharray={`${(parseFloat(data.overview.roleDistribution.admins.percentage) / 100) * 502.65} 502.65`}
                                    strokeDashoffset={`-${((parseFloat(data.overview.roleDistribution.petOwners.percentage) + parseFloat(data.overview.roleDistribution.vets.percentage)) / 100) * 502.65}`}
                                    className="transition-all duration-1000"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{data.overview.totalUsers}</p>
                                    <p className="text-xs text-gray-500">Total</p>
                                </div>
                            </div>
                        </div>
                        {/* Legend */}
                        <div className="w-full space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                    <span className="text-sm text-gray-700">Pet Owners</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">{data.overview.roleDistribution.petOwners.percentage}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                                    <span className="text-sm text-gray-700">Veterinarians</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">{data.overview.roleDistribution.vets.percentage}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                                    <span className="text-sm text-gray-700">Admins</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">{data.overview.roleDistribution.admins.percentage}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-gray-500">Last 24 Hours</h4>
                        <ClockIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-600">Active Users</span>
                                <span className="text-sm font-bold text-gray-900">{data.activity.last24Hours.activeUsers}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min((data.activity.last24Hours.activeUsers / data.overview.totalUsers) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-600">New Registrations</span>
                                <span className="text-sm font-bold text-gray-900">{data.activity.last24Hours.newRegistrations}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min((data.activity.last24Hours.newRegistrations / 20) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-gray-500">Last 7 Days</h4>
                        <DocumentTextIcon className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-600">Active Users</span>
                                <span className="text-sm font-bold text-gray-900">{data.activity.last7Days.activeUsers}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min((data.activity.last7Days.activeUsers / data.overview.totalUsers) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-600">New Registrations</span>
                                <span className="text-sm font-bold text-gray-900">{data.activity.last7Days.newRegistrations}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min((data.activity.last7Days.newRegistrations / 50) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-gray-500">Last 30 Days</h4>
                        <UserCircleIcon className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-600">Active Users</span>
                                <span className="text-sm font-bold text-gray-900">{data.activity.last30Days.activeUsers}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min((data.activity.last30Days.activeUsers / data.overview.totalUsers) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-600">New Registrations</span>
                                <span className="text-sm font-bold text-gray-900">{data.activity.last30Days.newRegistrations}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min((data.activity.last30Days.newRegistrations / 100) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-md">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="p-6">
                    <div className="flow-root">
                        <ul className="-mb-8">
                            {data.recentActivity.slice(0, 5).map((activity, index) => (
                                <li key={activity.id}>
                                    <div className="relative pb-8">
                                        {index !== Math.min(data.recentActivity.length, 5) - 1 && (
                                            <span
                                                className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                                                aria-hidden="true"
                                            />
                                        )}
                                        <div className="relative flex items-start space-x-3">
                                            <div className={`relative px-1 ${activity.role === 'vet' ? 'bg-purple-500' :
                                                activity.role === 'admin' ? 'bg-orange-500' :
                                                    'bg-green-500'
                                                } rounded-full p-2`}>
                                                <UserCircleIcon className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {activity.username}
                                                    </p>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(activity.timestamp).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500">{activity.email}</p>
                                                <div className="mt-1 flex items-center space-x-2">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${activity.role === 'vet' ? 'bg-purple-100 text-purple-800' :
                                                        activity.role === 'admin' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-green-100 text-green-800'
                                                        }`}>
                                                        {activity.role}
                                                    </span>
                                                    <span className="text-xs text-gray-500">• {activity.action}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {data.recentActivity.length === 0 && (
                            <div className="text-center py-12">
                                <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-500">No recent activity</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
