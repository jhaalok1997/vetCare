"use client";

import { useParams } from "next/navigation";
import { services } from "../../../components/Services/Service-main/serviceData";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ServiceDetailPage() {
    const { slug } = useParams();
    const service = services.find((s) => s.slug === slug);

    if (!service) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-12 text-center">
                <h1 className="text-3xl font-bold text-red-600">Service Not Found</h1>
                <Link href="/services" className="text-emerald-400 hover:underline mt-4 block">
                    ← Back to Services
                </Link>
            </div>
        );
    }

    return (
        <main className="max-w-6xl mx-auto px-6 py-12">


            {/* ✅ Hero Section */}
            <motion.section
                className="relative bg-gradient-to-r from-emerald-600 to-emerald-400 text-white py-16 px-6 rounded-2xl shadow-lg mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="max-w-3xl mx-auto text-center">
                    <div className="flex justify-center mb-4">{service.icon}</div>
                    <h1 className="text-5xl font-bold mb-4">{service.title}</h1>
                    <p className="text-lg opacity-90">{service.description}</p>
                </div>
            </motion.section>

            {/* ✅ Key Features */}
            <section className="grid md:grid-cols-2 gap-6 mt-12">
                {[
                    "Routine health check-ups",
                    "Vaccinations & preventive care",
                    "Parasite prevention & control",
                    "Nutrition & wellness counseling",
                    "Chronic disease management",
                    "Senior pet care programs"
                ].map((point, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-3 bg-gray-50 p-5 rounded-lg shadow hover:shadow-md"
                    >
                        <span className="text-emerald-600 font-bold text-xl">✔</span>
                        <p>{point}</p>
                    </motion.div>
                ))}
            </section>

            {/* ✅ Why Choose Us */}
            <motion.section
                className="mt-20 text-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <h2 className="text-3xl font-bold mb-6 text-emerald-700">Why Choose Our Veterinary Care?</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            title: "Experienced Vets",
                            desc: "Our doctors bring decades of experience in small & large animal healthcare.",
                        },
                        {
                            title: "Compassionate Care",
                            desc: "We treat every animal with love, ensuring stress-free visits.",
                        },
                        {
                            title: "Modern Facilities",
                            desc: "Advanced diagnostic tools & labs for accurate and timely treatment.",
                        },
                    ].map((feature, idx) => (
                        <motion.div
                            key={idx}
                            className="p-6 bg-emerald-50 rounded-xl shadow hover:shadow-lg"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.2 }}
                        >
                            <h3 className="text-xl font-semibold mb-3 text-emerald-700">{feature.title}</h3>
                            <p className="text-gray-700">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* ✅ Call to Action */}
            <motion.section
                className="mt-20 bg-emerald-600 text-white text-center p-10 rounded-xl shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <h2 className="text-3xl font-bold mb-4">Book Your Pet’s Check-up Today</h2>
                <p className="mb-6">Ensure your furry friend stays healthy with our general veterinary care services.</p>
                <button className="bg-white text-emerald-600 px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition">
                    Schedule Appointment
                </button>
            </motion.section>
        </main>
    );
}
