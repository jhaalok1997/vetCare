"use client";

import { useEffect, useState } from "react";
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  UsersIcon,
  CalendarIcon 
} from "@heroicons/react/24/outline";

interface AnalyticsData {
  userGrowth: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  activityStats: {
    totalSessions: number;
    averageSessionTime: string;
    peakHours: string[];
  };
  roleDistribution: {
    petOwner: number;
    vet: number;
    admin: number;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    userGrowth: { thisMonth: 0, lastMonth: 0, growth: 0 },
    activityStats: { totalSessions: 0, averageSessionTime: "0m", peakHours: [] },
    roleDistribution: { petOwner: 0, vet: 0, admin: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/admin/analytics");
        if (res.ok) {
          const analyticsData = await res.json();
          setData(analyticsData);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          System analytics and insights
        </p>
      </div>

      {/* User Growth */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <ArrowTrendingUpIcon className="h-8 w-8 text-emerald-500 mr-3" />
          <h3 className="text-lg font-medium text-gray-900">User Growth</h3>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{data.userGrowth.thisMonth}</p>
            <p className="text-sm text-gray-500">This Month</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{data.userGrowth.lastMonth}</p>
            <p className="text-sm text-gray-500">Last Month</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${data.userGrowth.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.userGrowth.growth >= 0 ? '+' : ''}{data.userGrowth.growth}%
            </p>
            <p className="text-sm text-gray-500">Growth</p>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{data.activityStats.totalSessions}</p>
              <p className="text-sm text-gray-500">Total Sessions</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{data.activityStats.averageSessionTime}</p>
              <p className="text-sm text-gray-500">Avg Session Time</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{data.activityStats.peakHours.length}</p>
              <p className="text-sm text-gray-500">Peak Hours</p>
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
                  style={{ width: `${(data.roleDistribution.petOwner / (data.roleDistribution.petOwner + data.roleDistribution.vet + data.roleDistribution.admin)) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-500">{data.roleDistribution.petOwner}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Veterinarians</span>
            <div className="flex items-center">
              <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${(data.roleDistribution.vet / (data.roleDistribution.petOwner + data.roleDistribution.vet + data.roleDistribution.admin)) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-500">{data.roleDistribution.vet}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Admins</span>
            <div className="flex items-center">
              <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${(data.roleDistribution.admin / (data.roleDistribution.petOwner + data.roleDistribution.vet + data.roleDistribution.admin)) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-500">{data.roleDistribution.admin}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder for future charts */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Usage Trends</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <ChartBarIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Chart visualization coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
