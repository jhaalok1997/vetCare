"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import {
  UsersIcon,
  UserGroupIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline";

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
    tenantId: string;
    timestamp: string;
    action: string;
  }>;
}

export default function AnalyticsPage() {
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
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setError(null);
        const currentUser = localStorage.getItem('user');
        if (!currentUser) {
          setError('User not authenticated');
          return;
        }

        const res = await axios.get("/api/admin/dashboard", {
          headers: {
            'x-user': currentUser,
            'Content-Type': 'application/json',
          },
        });
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        const err = error as AxiosError<{ error?: string }>;
        setError(err.response?.data?.error || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-50 text-red-800 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Error Loading Dashboard</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Comprehensive system analytics and user insights
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{data.overview.totalUsers}</p>
              <p className="text-sm text-gray-500">Total Users</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{data.overview.totalPetOwners}</p>
              <p className="text-sm text-gray-500">Pet Owners</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <UserCircleIcon className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{data.overview.totalVets}</p>
              <p className="text-sm text-gray-500">Veterinarians</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{data.overview.totalAdmins}</p>
              <p className="text-sm text-gray-500">Administrators</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Last 24 Hours</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Active Users</span>
              <span className="text-lg font-semibold">{data.activity.last24Hours.activeUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">New Registrations</span>
              <span className="text-lg font-semibold">{data.activity.last24Hours.newRegistrations}</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Last 7 Days</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Active Users</span>
              <span className="text-lg font-semibold">{data.activity.last7Days.activeUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">New Registrations</span>
              <span className="text-lg font-semibold">{data.activity.last7Days.newRegistrations}</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Last 30 Days</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Active Users</span>
              <span className="text-lg font-semibold">{data.activity.last30Days.activeUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">New Registrations</span>
              <span className="text-lg font-semibold">{data.activity.last30Days.newRegistrations}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Role Distribution</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Pet Owners</span>
            <div className="flex items-center">
              <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${data.overview.roleDistribution.petOwners.percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-500">
                {data.overview.roleDistribution.petOwners.count} ({data.overview.roleDistribution.petOwners.percentage}%)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Veterinarians</span>
            <div className="flex items-center">
              <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${data.overview.roleDistribution.vets.percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-500">
                {data.overview.roleDistribution.vets.count} ({data.overview.roleDistribution.vets.percentage}%)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Admins</span>
            <div className="flex items-center">
              <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${data.overview.roleDistribution.admins.percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-500">
                {data.overview.roleDistribution.admins.count} ({data.overview.roleDistribution.admins.percentage}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.recentActivity.map((activity) => (
                <tr key={activity.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.action}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
