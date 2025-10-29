"use client";

import { useEffect, useState } from "react";
import {
    ShieldCheckIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    CheckCircleIcon,
    XCircleIcon,
    MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

interface VetProfile {
    _id: string;
    username: string;
    email: string;
    phone?: string;
    specialization?: string;
    licenseNumber?: string;
    clinicName?: string;
    address?: string;
    isVerified?: boolean;
    createdAt: string;
    status?: string;
}

export default function VetProfilesPage() {
    const [vetProfiles, setVetProfiles] = useState<VetProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        const fetchVetProfiles = async () => {
            try {
                setError(null);
                const currentUser = localStorage.getItem('user');
                if (!currentUser) {
                    setError('User not authenticated');
                    return;
                }

                const res = await fetch("/api/admin/vets", {
                    headers: {
                        'x-user': currentUser,
                        'Content-Type': 'application/json',
                    },
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to fetch vet profiles');
                }

                const data = await res.json();
                setVetProfiles(data.vets || []);
            } catch (error) {
                console.error("Failed to fetch vet profiles:", error);
                setError(error instanceof Error ? error.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchVetProfiles();
    }, []);

    const filteredVets = vetProfiles.filter(vet => {
        const matchesSearch = vet.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vet.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (vet.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

        const matchesStatus = filterStatus === "all" ||
            (filterStatus === "verified" && vet.isVerified) ||
            (filterStatus === "unverified" && !vet.isVerified);

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></div>
                    <p className="text-gray-500">Loading vet profiles...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="bg-red-50 text-red-800 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">Error Loading Vet Profiles</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Veterinarian Profiles</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage and monitor registered veterinarians
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <ShieldCheckIcon className="h-8 w-8 text-blue-500 mr-3" />
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{vetProfiles.length}</p>
                            <p className="text-sm text-gray-500">Total Veterinarians</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {vetProfiles.filter(v => v.isVerified).length}
                            </p>
                            <p className="text-sm text-gray-500">Verified</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <XCircleIcon className="h-8 w-8 text-orange-500 mr-3" />
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {vetProfiles.filter(v => !v.isVerified).length}
                            </p>
                            <p className="text-sm text-gray-500">Pending Verification</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or specialization..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <option value="all">All Status</option>
                        <option value="verified">Verified</option>
                        <option value="unverified">Unverified</option>
                    </select>
                </div>
            </div>

            {/* Vet Profiles List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clinic</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredVets.length > 0 ? (
                                filteredVets.map((vet) => (
                                    <tr key={vet._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <ShieldCheckIcon className="h-6 w-6 text-purple-500 mr-2" />
                                                <span className="text-sm font-medium text-gray-900">{vet.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 flex items-center">
                                                <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                                                {vet.email}
                                            </div>
                                            {vet.phone && (
                                                <div className="text-sm text-gray-500 flex items-center mt-1">
                                                    <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                                                    {vet.phone}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {vet.specialization || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {vet.licenseNumber || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{vet.clinicName || 'N/A'}</div>
                                            {vet.address && (
                                                <div className="text-sm text-gray-500 flex items-center mt-1">
                                                    <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                                                    {vet.address}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {vet.isVerified ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    <XCircleIcon className="h-4 w-4 mr-1" />
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(vet.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No veterinarian profiles found
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

