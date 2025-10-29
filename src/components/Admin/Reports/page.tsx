"use client";

import { useEffect, useState } from "react";
import {
    DocumentTextIcon,
    ChartBarIcon,
    UserGroupIcon,
    ClipboardDocumentListIcon,
    ArrowDownTrayIcon,
    CalendarIcon
} from "@heroicons/react/24/outline";

interface ReportData {
    diagnoses: {
        total: number;
        thisMonth: number;
        lastMonth: number;
    };
    consultations: {
        total: number;
        thisMonth: number;
        lastMonth: number;
    };
    users: {
        newThisMonth: number;
        activeThisMonth: number;
    };
    vetMatches: {
        total: number;
        thisMonth: number;
    };
}

interface DiagnosisReport {
    _id: string;
    patientName: string;
    ownerName: string;
    diagnosis: string;
    symptoms: string;
    createdAt: string;
}

export default function ReportsPage() {
    const [reportData, setReportData] = useState<ReportData>({
        diagnoses: { total: 0, thisMonth: 0, lastMonth: 0 },
        consultations: { total: 0, thisMonth: 0, lastMonth: 0 },
        users: { newThisMonth: 0, activeThisMonth: 0 },
        vetMatches: { total: 0, thisMonth: 0 }
    });
    const [recentDiagnoses, setRecentDiagnoses] = useState<DiagnosisReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reportType, setReportType] = useState("overview");
    const [dateRange, setDateRange] = useState("30");

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setError(null);
                const currentUser = localStorage.getItem('user');
                if (!currentUser) {
                    setError('User not authenticated');
                    return;
                }

                const res = await fetch(`/api/admin/reports?range=${dateRange}`, {
                    headers: {
                        'x-user': currentUser,
                        'Content-Type': 'application/json',
                    },
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to fetch reports');
                }

                const data = await res.json();
                setReportData(data.summary || {
                    diagnoses: { total: 0, thisMonth: 0, lastMonth: 0 },
                    consultations: { total: 0, thisMonth: 0, lastMonth: 0 },
                    users: { newThisMonth: 0, activeThisMonth: 0 },
                    vetMatches: { total: 0, thisMonth: 0 }
                });
                setRecentDiagnoses(data.recentDiagnoses || []);
            } catch (error) {
                console.error("Failed to fetch reports:", error);
                setError(error instanceof Error ? error.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [dateRange]);

    const handleExportReport = () => {
        // Create CSV content
        const csvContent = "data:text/csv;charset=utf-8," +
            "Report Type,Value\n" +
            `Total Diagnoses,${reportData.diagnoses.total}\n` +
            `Diagnoses This Month,${reportData.diagnoses.thisMonth}\n` +
            `Total Consultations,${reportData.consultations.total}\n` +
            `Consultations This Month,${reportData.consultations.thisMonth}\n` +
            `New Users This Month,${reportData.users.newThisMonth}\n` +
            `Active Users This Month,${reportData.users.activeThisMonth}\n`;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `vet_assistant_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></div>
                    <p className="text-gray-500">Loading reports...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="bg-red-50 text-red-800 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">Error Loading Reports</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Reports</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Comprehensive analytics and activity reports
                    </p>
                </div>
                <button
                    onClick={handleExportReport}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Export Report
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            <option value="overview">Overview</option>
                            <option value="diagnoses">Diagnoses</option>
                            <option value="consultations">Consultations</option>
                            <option value="users">User Activity</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                            <option value="90">Last 90 Days</option>
                            <option value="365">Last Year</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Diagnoses</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.diagnoses.total}</p>
                            <p className="text-xs text-green-600 mt-1">+{reportData.diagnoses.thisMonth} this month</p>
                        </div>
                        <DocumentTextIcon className="h-12 w-12 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Consultations</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.consultations.total}</p>
                            <p className="text-xs text-green-600 mt-1">+{reportData.consultations.thisMonth} this month</p>
                        </div>
                        <ChartBarIcon className="h-12 w-12 text-purple-500" />
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">New Users</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.users.newThisMonth}</p>
                            <p className="text-xs text-gray-500 mt-1">This month</p>
                        </div>
                        <UserGroupIcon className="h-12 w-12 text-green-500" />
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Vet Matches</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.vetMatches.total}</p>
                            <p className="text-xs text-green-600 mt-1">+{reportData.vetMatches.thisMonth} this month</p>
                        </div>
                        <ClipboardDocumentListIcon className="h-12 w-12 text-orange-500" />
                    </div>
                </div>
            </div>

            {/* Monthly Comparison */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
                    Monthly Comparison
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Diagnoses Trend</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">This Month</span>
                                <div className="flex items-center">
                                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full"
                                            style={{ width: `${reportData.diagnoses.total > 0 ? (reportData.diagnoses.thisMonth / reportData.diagnoses.total * 100) : 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium">{reportData.diagnoses.thisMonth}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Last Month</span>
                                <div className="flex items-center">
                                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                        <div
                                            className="bg-gray-400 h-2 rounded-full"
                                            style={{ width: `${reportData.diagnoses.total > 0 ? (reportData.diagnoses.lastMonth / reportData.diagnoses.total * 100) : 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium">{reportData.diagnoses.lastMonth}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Consultations Trend</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">This Month</span>
                                <div className="flex items-center">
                                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                        <div
                                            className="bg-purple-500 h-2 rounded-full"
                                            style={{ width: `${reportData.consultations.total > 0 ? (reportData.consultations.thisMonth / reportData.consultations.total * 100) : 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium">{reportData.consultations.thisMonth}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Last Month</span>
                                <div className="flex items-center">
                                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                        <div
                                            className="bg-gray-400 h-2 rounded-full"
                                            style={{ width: `${reportData.consultations.total > 0 ? (reportData.consultations.lastMonth / reportData.consultations.total * 100) : 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium">{reportData.consultations.lastMonth}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Diagnoses Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Diagnoses</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symptoms</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diagnosis</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {recentDiagnoses.length > 0 ? (
                                recentDiagnoses.map((diagnosis) => (
                                    <tr key={diagnosis._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {diagnosis.patientName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {diagnosis.ownerName}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {diagnosis.symptoms.substring(0, 50)}...
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {diagnosis.diagnosis.substring(0, 50)}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(diagnosis.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No diagnosis reports found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

