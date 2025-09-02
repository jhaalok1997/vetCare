"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface SignupFormProps {
  onSuccess?: () => void;
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("petOwner"); // default role
  const [tenantId, setTenantId] = useState(""); // optional for multi-tenancy
  const [message, setMessage] = useState("");

  const handleSignup = async () => {
    setMessage("");

    if (!username || !email || !password) {
      setMessage("❌ Please fill in all fields");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setMessage("❌ Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setMessage("❌ Password must be at least 6 characters long");
      return;
    }

    try {
      const res = await fetch("/api/Auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role, tenantId }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Signup successful! Please login.");
        if (onSuccess) onSuccess();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ An error occurred. Please try again.");
      console.log(error);
    }
  };

  return (
    <motion.div
      className="max-w-md mx-auto mt-10 p-8 rounded-2xl shadow-lg bg-white dark:bg-gray-900"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-green-600">
        Create Account
      </h2>

      <input
        type="text"
        placeholder="Username"
        className="w-full mb-4 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        className="w-full mb-4 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full mb-6 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* Role selector */}
      <select
        className="w-full mb-4 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="petOwner">Pet Owner</option>
        <option value="vet">Veterinarian</option>
        {/* ⚠️ Don’t expose "admin" here unless it’s invite-only */}
      </select>

      {/* Tenant field (optional) */}
      <input
        type="text"
        placeholder="Tenant ID (leave empty to create new)"
        className="w-full mb-6 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
        value={tenantId}
        onChange={(e) => setTenantId(e.target.value)}
      />

      <Button
        onClick={handleSignup}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
      >
        Sign Up
      </Button>

      {message && (
        <motion.p
          className="mt-4 text-center text-sm font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}
