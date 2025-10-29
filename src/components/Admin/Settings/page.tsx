"use client";

import { useState } from "react";
import {
    CogIcon,
    BellIcon,
    ShieldCheckIcon,
    EnvelopeIcon,
    UserCircleIcon,
    KeyIcon,
    CheckCircleIcon
} from "@heroicons/react/24/outline";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");
    const [saveSuccess, setSaveSuccess] = useState(false);

    // General Settings State
    const [generalSettings, setGeneralSettings] = useState({
        siteName: "Vet Assistant",
        siteEmail: "admin@vetassistant.com",
        supportEmail: "support@vetassistant.com",
        maintenanceMode: false,
    });

    // Notification Settings State
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        newUserRegistration: true,
        newDiagnosis: true,
        vetMatchNotification: true,
        systemAlerts: true,
    });

    // Security Settings State
    const [securitySettings, setSecuritySettings] = useState({
        requireEmailVerification: true,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        requireStrongPassword: true,
    });

    const handleSaveSettings = () => {
        // In a real application, this would make an API call
        console.log("Saving settings:", {
            general: generalSettings,
            notifications: notificationSettings,
            security: securitySettings,
        });

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const tabs = [
        { id: "general", name: "General", icon: CogIcon },
        { id: "notifications", name: "Notifications", icon: BellIcon },
        { id: "security", name: "Security", icon: ShieldCheckIcon },
        { id: "email", name: "Email", icon: EnvelopeIcon },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage system configuration and preferences
                </p>
            </div>

            {/* Success Message */}
            {saveSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-green-800">Settings saved successfully!</span>
                    </div>
                </div>
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`group inline-flex items-center px-6 py-4 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? "border-emerald-500 text-emerald-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                            >
                                <tab.icon
                                    className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === tab.id ? "text-emerald-500" : "text-gray-400 group-hover:text-gray-500"
                                        }`}
                                />
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {/* General Settings */}
                    {activeTab === "general" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Site Name
                                        </label>
                                        <input
                                            type="text"
                                            value={generalSettings.siteName}
                                            onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Site Email
                                        </label>
                                        <input
                                            type="email"
                                            value={generalSettings.siteEmail}
                                            onChange={(e) => setGeneralSettings({ ...generalSettings, siteEmail: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Support Email
                                        </label>
                                        <input
                                            type="email"
                                            value={generalSettings.supportEmail}
                                            onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="maintenance"
                                            checked={generalSettings.maintenanceMode}
                                            onChange={(e) => setGeneralSettings({ ...generalSettings, maintenanceMode: e.target.checked })}
                                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="maintenance" className="ml-2 block text-sm text-gray-700">
                                            Enable Maintenance Mode
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notification Settings */}
                    {activeTab === "notifications" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                                            <p className="text-sm text-gray-500">Receive email notifications for important events</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.emailNotifications}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">New User Registrations</p>
                                            <p className="text-sm text-gray-500">Get notified when a new user registers</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.newUserRegistration}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, newUserRegistration: e.target.checked })}
                                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">New Diagnosis Reports</p>
                                            <p className="text-sm text-gray-500">Notifications for new diagnosis submissions</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.newDiagnosis}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, newDiagnosis: e.target.checked })}
                                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Vet Match Notifications</p>
                                            <p className="text-sm text-gray-500">Alerts when users are matched with veterinarians</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.vetMatchNotification}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, vetMatchNotification: e.target.checked })}
                                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">System Alerts</p>
                                            <p className="text-sm text-gray-500">Critical system notifications and errors</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings.systemAlerts}
                                            onChange={(e) => setNotificationSettings({ ...notificationSettings, systemAlerts: e.target.checked })}
                                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Settings */}
                    {activeTab === "security" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <KeyIcon className="h-5 w-5 mr-2 text-gray-500" />
                                    Security Settings
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Require Email Verification</p>
                                            <p className="text-sm text-gray-500">Users must verify their email before accessing the system</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={securitySettings.requireEmailVerification}
                                            onChange={(e) => setSecuritySettings({ ...securitySettings, requireEmailVerification: e.target.checked })}
                                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                                        />
                                    </div>

                                    <div className="py-3 border-b border-gray-200">
                                        <label className="block text-sm font-medium text-gray-900 mb-2">
                                            Session Timeout (minutes)
                                        </label>
                                        <input
                                            type="number"
                                            value={securitySettings.sessionTimeout}
                                            onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div className="py-3 border-b border-gray-200">
                                        <label className="block text-sm font-medium text-gray-900 mb-2">
                                            Maximum Login Attempts
                                        </label>
                                        <input
                                            type="number"
                                            value={securitySettings.maxLoginAttempts}
                                            onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div className="py-3 border-b border-gray-200">
                                        <label className="block text-sm font-medium text-gray-900 mb-2">
                                            Minimum Password Length
                                        </label>
                                        <input
                                            type="number"
                                            value={securitySettings.passwordMinLength}
                                            onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Require Strong Passwords</p>
                                            <p className="text-sm text-gray-500">Passwords must include uppercase, lowercase, numbers, and symbols</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={securitySettings.requireStrongPassword}
                                            onChange={(e) => setSecuritySettings({ ...securitySettings, requireStrongPassword: e.target.checked })}
                                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Email Settings */}
                    {activeTab === "email" && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <EnvelopeIcon className="h-5 w-5 mr-2 text-gray-500" />
                                    Email Configuration
                                </h3>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-blue-800">
                                        Configure your SMTP settings to enable email notifications and communications.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            SMTP Host
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="smtp.example.com"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            SMTP Port
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="587"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            SMTP Username
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="username@example.com"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            SMTP Password
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="smtpTls"
                                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="smtpTls" className="ml-2 block text-sm text-gray-700">
                                            Use TLS/SSL
                                        </label>
                                    </div>

                                    <button
                                        type="button"
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                                    >
                                        Test Email Configuration
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Save Button */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={handleSaveSettings}
                        className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}

