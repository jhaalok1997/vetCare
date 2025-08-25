
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Contact() {
  const [formData, setFormData] = useState({
    Name: "",
    email: "",
    message: ""
  });
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const res = await fetch("/api/ContactedUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setStatus({
        type: "success",
        message: "Thank you for your message! We'll get back to you soon."
      });
      setFormData({ Name: "", email: "", message: "" });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to send message"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-5xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
      <p className="text-gray-600 mb-8">Have questions or suggestions? We love to hear from you.</p>

      {status.message && (
        <div className={`p-4 rounded-lg mb-6 ${status.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <input
          type="text"
          name="Name"
          placeholder="Your Name"
          value={formData.Name}
          onChange={handleChange}
          className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <textarea
          name="message"
          placeholder="Your message (minimum 25 characters)"
          value={formData.message}
          onChange={handleChange}
          className="border p-3 rounded h-32 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
          minLength={25}
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-emerald-700 text-white py-3 rounded hover:bg-emerald-800 transition-colors disabled:bg-emerald-300"
        >
          {isLoading ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </div>
  );
 } 
