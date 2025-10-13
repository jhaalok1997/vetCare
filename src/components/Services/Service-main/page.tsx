"use client";

import { services } from "./serviceData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";
import UserDetailForm from "./userDetailForm";


export default function ServicesPage() {
   
    return (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            {/* Header Section */}
            <motion.section
                className="text-center mb-8 sm:mb-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
            >
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-primary">Our Veterinary Services</h1>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto">
                    We provide a wide range of services to ensure your animals receive the best care possible.
                </p>
            </motion.section>


            {/*  Here User Detail Form is Presented*/}

            <UserDetailForm />



            {/* Services Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {services.map((service, idx) => (
                    <motion.div
                        key={service.slug}
                        custom={idx}
                        variants={{
                            hidden: { opacity: 0, y: 40 },
                            visible: {
                                opacity: 1,
                                y: 0,
                                transition: { delay: idx * 0.15, duration: 0.6, ease: "easeOut" },
                            },
                        }}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <Link href={`/services/${service.slug}`}>
                            <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 border border-gray-200 cursor-pointer h-full">
                                <CardHeader className="flex flex-col items-center text-center space-y-2 p-4 sm:p-6">
                                    <div className="scale-75 sm:scale-100">
                                        {service.icon}
                                    </div>
                                    <CardTitle className="text-lg sm:text-xl">{service.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 pt-0">
                                    <p className="text-gray-600 text-sm sm:text-base text-center">{service.description}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </section>
        </main>
    );
}
