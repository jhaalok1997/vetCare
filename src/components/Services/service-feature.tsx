"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint, Stethoscope, HeartPulse, Syringe, ClipboardList, Microscope } from "lucide-react";

export default function ServicesPage() {
  const services = [
    {
      icon: <Stethoscope className="w-8 h-8 text-primary" />,
      title: "General Veterinary Care",
      description:
        "Routine check-ups, vaccinations, and preventive health screenings to keep your animals healthy year-round.",
    },
    {
      icon: <HeartPulse className="w-8 h-8 text-primary" />,
      title: "Emergency & Critical Care",
      description:
        "24/7 emergency services for urgent conditions, ensuring quick diagnosis and immediate treatment.",
    },
    {
      icon: <Syringe className="w-8 h-8 text-primary" />,
      title: "Vaccination & Immunization",
      description:
        "Comprehensive vaccination programs tailored for livestock, pets, and exotic animals.",
    },
    {
      icon: <ClipboardList className="w-8 h-8 text-primary" />,
      title: "Animal Health Tracking",
      description:
        "Digital health records, AI-based monitoring, and wellness reminders for proactive animal care.",
    },
    {
      icon: <Microscope className="w-8 h-8 text-primary" />,
      title: "Diagnostics & Lab Services",
      description:
        "In-house lab for bloodwork, imaging, and advanced diagnostic tests to detect issues early.",
    },
    {
      icon: <PawPrint className="w-8 h-8 text-primary" />,
      title: "Nutrition & Rehabilitation",
      description:
        "Personalized diet plans, physiotherapy, and rehabilitation services for full recovery and wellbeing.",
    },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-primary">Our Veterinary Services</h1>
        <p className="text-lg text-gray-600">
          We provide a wide range of services to ensure your animals receive the best care possible.
        </p>
      </section>

      {/* Services Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, idx) => (
          <Card
            key={idx}
            className="hover:shadow-lg hover:scale-105 transition-all duration-300 border-2 border-gray-600"
          >
            <CardHeader className="flex flex-col items-center text-center space-y-2">
              {service.icon}
              <CardTitle className="text-xl">{service.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{service.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Extra Features Section */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-8">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-primary">Experienced Vets</h3>
            <p className="text-gray-600">
              Our veterinary team has decades of combined experience in diverse animal care specializations.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-primary">Cutting-edge Technology</h3>
            <p className="text-gray-600">
              We use AI-powered tools, modern diagnostic machines, and health tracking systems for accuracy.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-primary">Compassionate Care</h3>
            <p className="text-gray-600">
              Beyond treatment, we ensure your animals are comfortable, stress-free, and cared for with love.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
