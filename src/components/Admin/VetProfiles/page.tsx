"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
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
}

export default function VetProfilesPage() {
    const [vetProfiles, setVetProfiles] = useState<VetProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [updatingVetId, setUpdatingVetId] = useState<string | null>(null);


    // Added function to safely get localStorage (avoids SSR error)

    const getUserFromLocalStorage = () => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem("user");
    };


    // HANDLE VERIFY/UNVERIFY ACTION

    const handleToggleVerification = async (vetId: string, currentStatus?: boolean) => {
        try {
            const currentUser = getUserFromLocalStorage();
            if (!currentUser) {
                setActionError("User not authenticated");
                return;
            }

            setUpdatingVetId(vetId);
            setActionError(null);

            const res = await axios.patch("/api/admin/vets",
                { vetId, isVerified: !currentStatus },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "x-user": currentUser,
                    },
                }
            );

            // Update UI with server response
            setVetProfiles((prev) =>
                prev.map((vet) =>
                    vet._id === vetId ? { ...vet, isVerified: res.data.data.isVerified } : vet
                )
            );

        } catch (err) {
            console.error("Failed to update vet verification:", err);
            const error = err as AxiosError<{ error?: string }>;
            setActionError(error.response?.data?.error || "Error updating rating");
        } finally {
            setUpdatingVetId(null);
        }
    };


    // FETCH ALL VET PROFILES

    useEffect(() => {
        const fetchVetProfiles = async () => {
            try {
                setError(null);
                const currentUser = getUserFromLocalStorage();

                if (!currentUser) {
                    setError("User not authenticated");
                    setLoading(false);
                    return;
                }

                const res = await axios.get("/api/admin/vets", {
                    headers: {
                        "Content-Type": "application/json",
                        "x-user": currentUser,
                    },
                });
                setVetProfiles(res.data.vets || []);
            } catch (error) {
                console.error("Failed to fetch vet profiles:", error);
                const err = error as AxiosError<{ error?: string }>;
                setError(err.response?.data?.error || "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchVetProfiles();
    }, []);


    // FILTER + SEARCH FIXES

    const filteredVets = vetProfiles.filter(vet => {
        const matchesSearch =
            vet.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vet.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (vet.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

        // status filter working correctly
        const matchesStatus =
            filterStatus === "all" ||
            (filterStatus === "verified" && vet.isVerified) ||
            (filterStatus === "unverified" && !vet.isVerified);

        return matchesSearch && matchesStatus;
    });


    // LOADING UI

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


    // ERROR UI

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
            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Veterinarian Profiles</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage and monitor registered veterinarians
                </p>
                {actionError && (
                    <p className="mt-2 text-sm text-red-600">{actionError}</p>
                )}
            </div>

            {/* ------------ STATS --------------- */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total */}
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <ShieldCheckIcon className="h-8 w-8 text-blue-500 mr-3" />
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{vetProfiles.length}</p>
                            <p className="text-sm text-gray-500">Total Veterinarians</p>
                        </div>
                    </div>
                </div>

                {/* Verified */}
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

                {/* Unverified */}
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

            {/* ------------ SEARCH + FILTER --------------- */}
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

            {/* ------------ LIST --------------- */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Contact</th>
                                <th className="px-6 py-3">Specialization</th>
                                <th className="px-6 py-3">License</th>
                                <th className="px-6 py-3">Clinic</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Joined</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredVets.length > 0 ? (
                                filteredVets.map((vet) => (
                                    <tr key={vet._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <ShieldCheckIcon className="h-6 w-6 text-purple-500 mr-2" />
                                                <span className="text-sm font-medium text-gray-900">
                                                    {vet.username}
                                                </span>
                                            </div>
                                        </td>

                                        {/* CONTACT */}
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

                                        <td className="px-6 py-4 text-sm">{vet.specialization || "N/A"}</td>
                                        <td className="px-6 py-4 text-sm">{vet.licenseNumber || "N/A"}</td>

                                        {/* CLINIC */}
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{vet.clinicName || "N/A"}</div>
                                            {vet.address && (
                                                <div className="text-sm text-gray-500 flex items-center mt-1">
                                                    <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                                                    {vet.address}
                                                </div>
                                            )}
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-6 py-4">
                                            {vet.isVerified ? (
                                                <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                                    <XCircleIcon className="h-4 w-4 mr-1" />
                                                    Pending
                                                </span>
                                            )}
                                        </td>

                                        {/* JOINED */}
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(vet.createdAt).toLocaleDateString()}
                                        </td>

                                        {/* ACTION BUTTON */}
                                        <td className="px-6 py-4">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleVerification(vet._id, vet.isVerified)}
                                                disabled={updatingVetId === vet._id}
                                                className={`px-3 py-1 rounded-md text-xs font-medium border transition 
                                                    ${vet.isVerified
                                                        ? "border-red-200 text-red-700 bg-red-50 hover:bg-red-100"
                                                        : "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                                                    } 
                                                    ${updatingVetId === vet._id
                                                        ? "opacity-60 cursor-not-allowed"
                                                        : ""
                                                    }
                                                `}
                                            >
                                                {updatingVetId === vet._id
                                                    ? "Saving..."
                                                    : vet.isVerified
                                                        ? "Unverify"
                                                        : "Verify"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-6 py-12 text-center text-gray-500"
                                    >
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
