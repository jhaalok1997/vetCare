"use client";

import Link from "next/link";
import { Niconne } from "next/font/google";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export const niconne = Niconne({
  variable: "--font-niconne",
  subsets: ["latin"],
  weight: ["400"],
});

export default function Footer() {
  const [hideForAdmin, setHideForAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        if (u && u.role === "admin") {
          setHideForAdmin(true);
          return;
        }
      }
    } catch {
      // ignore
    }
    setHideForAdmin(false);
  }, []);

  const hideForVetDashboard =
    pathname &&
    pathname.toLowerCase().startsWith("/veterinarian/dashboard");

  if (hideForAdmin || hideForVetDashboard) return null;
  return (
    <footer className="bg-green-900 text-white mt-12 min-w-full">
      <div className="container mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-16">

        {/* About */}
        <div className={` ${niconne.className}`}>
          <h3 className="text-3xl font-bold mb-4">About Vet🐾Care</h3>
          <p className="text-xl">
            VetCare is dedicated to providing reliable, fast, and insightful veterinary resources to students, professionals, and researchers.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-row gap-10 md:flex-row md:gap-12 lg:gap-24">
          <div>
            <h3 className="text-xl font-bold w-24 mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm flex flex-col">
              <li><Link href="/" className="hover:text-yellow-300">Home</Link></li>
              <li><Link href="/about" className="hover:text-yellow-300">About</Link></li>
              <li><Link href="/services" className="hover:text-yellow-300">Services</Link></li>
              <li><Link href="/contact" className="hover:text-yellow-300">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}

          <div>
            <h3 className="text-xl font-bold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/services/general-veterinary-care" className="hover:text-yellow-300">General Veterinary Care</Link></li>
              <li><Link href="/services/emergency-critical-care" className="hover:text-yellow-300">Emergency & Critical Care</Link></li>
              <li><Link href="/services/vaccination-immunization" className="hover:text-yellow-300">Vaccination & Immunization</Link></li>
              <li><Link href="/services/animal-health-tracking" className="hover:text-yellow-300">Animal Health Tracking</Link></li>
              <li><Link href="/services/diagnostics-lab-services" className="hover:text-yellow-300">Diagnostics & Lab Services</Link></li>
              <li><Link href="/services/nutrition-rehabilitation" className="hover:text-yellow-300">Nutrition & Rehabilitation</Link></li>
            </ul>
          </div>
        </div>


        {/* Contact */}
        <div className="lg:mx-20">
          <h3 className="text-xl font-bold mb-4">Contact Us</h3>
          <p className="text-sm">📍 hb-16, City Center,Sector-4</p>
          <p className="text-sm">📍 B.S City, Jharkhand</p>
          <p className="text-sm">📧 support@vetcare.com</p>
          <p className="text-sm">📞 +91 9348516261</p>
        </div>
      </div>

      <div className="bg-green-950 text-center py-3 text-md">
        © {new Date().getFullYear()} Vet🐾Care. All rights reserved.
      </div>
    </footer>
  );
}
