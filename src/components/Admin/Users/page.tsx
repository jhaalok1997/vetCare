"use client";

import { useEffect, useState } from "react";
import {
    UsersIcon,
    EyeIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon
} from "@heroicons/react/24/outline";

interface User {
    _id: string;
    username: string;
    email: string;
    role: string;
    lastLogin: string;
    isActive: boolean;
    createdAt: string;
    tenantId: string;
}

interface UserStats {
    total: number;
    active: number;
    inactive: number;
    byRole: {
        petOwner: number;
        vet: number;
        admin: number;
    };
}

type StatusFilter = 'all' | 'active' | 'inactive';
type RoleFilter = 'all' | 'petOwner' | 'vet' | 'admin';

export default function ActiveUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<UserStats>({
        total: 0,
        active: 0,
        inactive: 0,
        byRole: { petOwner: 0, vet: 0, admin: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<StatusFilter>('all');
    const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch("/api/admin/users");
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data.users);
                    setStats(data.stats);
                }
            } catch (error) {
                console.error("Failed to fetch users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesStatus = filter === 'all' ||
            (filter === 'active' && user.isActive) ||
            (filter === 'inactive' && !user.isActive);

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;

        return matchesStatus && matchesRole;
    });

    const getRoleColor = (role: User['role']) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'vet': return 'bg-blue-100 text-blue-800';
            case 'petOwner': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (isActive: boolean) => {
        return isActive ? (
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
        ) : (
            <XCircleIcon className="h-5 w-5 text-red-500" />
        );
    };

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
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Monitor and manage all users in the system
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <UsersIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircleIcon className="h-6 w-6 text-green-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.active}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <XCircleIcon className="h-6 w-6 text-red-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Inactive Users</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.inactive}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <EyeIcon className="h-6 w-6 text-blue-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Veterinarians</dt>
                                    <dd className="text-lg font-medium text-gray-900">{stats.byRole.vet}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive')}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                        >
                            <option value="all">All Users</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role Filter</label>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as 'all' | 'petOwner' | 'vet' | 'admin')}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                        >
                            <option value="all">All Roles</option>
                            <option value="petOwner">Pet Owners</option>
                            <option value="vet">Veterinarians</option>
                            <option value="admin">Admins</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Users ({filteredUsers.length})
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        A list of all users in the system
                    </p>
                </div>
                <ul className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                        <li key={user._id}>
                            <div className="px-4 py-4 flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                            <span className="text-sm font-medium text-gray-700">
                                                {user.username.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <div className="flex items-center">
                                            <p className="text-sm font-medium text-gray-900">{user.username}</p>
                                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                        <div className="flex items-center mt-1">
                                            <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                                            <p className="text-xs text-gray-500">
                                                Last login: {new Date(user.lastLogin).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    {getStatusIcon(user.isActive)}
                                    <span className="ml-2 text-sm text-gray-500">
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
