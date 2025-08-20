"use client";

import AskVetAI from "../Ask-vet-Assit/vet-assist";
import {
    Stethoscope,
    BrainCircuit,
    LineChart,
    GraduationCap,
    PawPrint,
    Sparkles,
    Quote,
} from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { useState } from "react";

export default function AboutPage() {
    const features = [
        {
            title: "AI-Powered Clinical Insights",
            description:
                "Decision-support algorithms analyze case histories, lab reports, and zoonotic patterns to provide accurate veterinary recommendations.",
            icon: Stethoscope,
        },
        {
            title: "Veterinary Knowledge Graph",
            description:
                "A structured ontology-driven knowledge base connecting pathology, pharmacology, and preventive medicine for seamless learning.",
            icon: BrainCircuit,
        },
        {
            title: "Predictive Animal Health Analytics",
            description:
                "Machine learning models forecast disease outbreaks, vaccination needs, and livestock productivity trends for data-driven care.",
            icon: LineChart,
        },
        {
            title: "Smart Learning Companion",
            description:
                "Interactive AI modules aligned with veterinary curricula, featuring quizzes, flashcards, and clinical simulations for students.",
            icon: GraduationCap,
        },
        {
            title: "Pet Owner Friendly Guidance",
            description:
                "AI-backed preventive care tips, nutrition guidance, and early symptom checkers designed for everyday pet owners.",
            icon: PawPrint,
        },
    ];

    const testimonials = [
        {
            name: "Dr. Meera Sharma",
            role: "Veterinary Surgeon",
            feedback:
                "Vet🐾Care’s predictive analytics helped me anticipate seasonal disease outbreaks. It’s like having an AI-powered colleague by my side.",
        },
        {
            name: "Akash Jha",
            role: "B.V.Sc. Student, BHU",
            feedback:
                "The AI-driven quizzes and clinical simulations made my study routine engaging. I feel more confident preparing for exams and real cases.",
        },
        {
            name: "Neha Gupta",
            role: "Pet Owner",
            feedback:
                "I used the symptom checker for my Labrador, and the guidance was spot-on. It gave me peace of mind before visiting the vet🐾Care.",
        },
        {
            name: "Prof. R.K. Mishra",
            role: "Veterinary Researcher",
            feedback:
                "The ontology-driven knowledge graph is a goldmine for comparative studies in veterinary pharmacology.",
        },
    ];

    // Duplicate testimonials for infinite scroll
    const items = [...testimonials, ...testimonials, ...testimonials];

    const controls = useAnimation();
    const [isPaused, setIsPaused] = useState(false);

    const handleHoverStart = async () => {
        if (!isPaused) {
            setIsPaused(true);
            await controls.stop();
        }
    };

    const handleHoverEnd = async () => {
        if (isPaused) {
            setIsPaused(false);
            controls.start({
                x: ["0%", "-100%"],
                transition: {
                    repeat: Infinity,
                    duration: 30,
                    ease: "linear",
                },
            });
        }
    };


    return (
        <>
            {/* About Features */}
            <section className="max-w-6xl mx-auto px-6 py-16">
                <h2 className="text-3xl font-bold text-center mb-6">
                    About <span className="text-green-600">Vet🐾Care</span>
                </h2>
                <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">
                    We combine veterinary science and artificial intelligence to create tools
                    that empower veterinarians, students, and pet owners. Our mission is to
                    bridge the gap between compassionate care and cutting-edge technology.
                </p>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="p-6 rounded-2xl shadow-md bg-white hover:shadow-lg transition"
                        >
                            <feature.icon className="w-10 h-10 text-green-600 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-gray-600 text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>


            {/* Call to Action Section */}
            <section className="bg-gradient-to-r from-green-400 to-green-800 text-white py-16 mt-10 rounded-r-full">
                <div className="max-w-4xl mx-auto text-center px-6">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
                    <h2 className="text-3xl font-bold mb-4">
                        Experience the Future of Veterinary Science
                    </h2>
                    <p className="text-lg mb-8 text-blue-100">
                        Ask questions, explore insights, and unlock AI-powered guidance tailored
                        for veterinary professionals, students, and pet owners.
                    </p>

                    <a
                       // href="/ask-vet-ai"
                        className="inline-block bg-black text-green-700 font-semibold px-4 py-2 rounded-xl shadow hover:bg-gray-100 transition"
                    >
                        <AskVetAI />

                    </a>

                </div>
            </section>


            {/* Scrolling Testimonials Section */}
            <section className="py-20 bg-gray-50 overflow-hidden">
                <h2 className="text-3xl font-bold text-center mb-12">
                    What People Say About <span className="text-green-600">Vet🐾Care</span>
                </h2>

                <div className="relative flex overflow-hidden">
                    <motion.div
                        className="flex gap-6"
                        animate={controls}
                        initial={{ x: "0%" }}
                    >
                        {items.map((t, i) => (
                            <div
                                key={i}
                                onMouseEnter={handleHoverStart}
                                onMouseLeave={handleHoverEnd}
                                className="min-w-[300px] max-w-sm p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer"
                            >
                                <Quote className="w-8 h-8 text-green-600 mb-3" />
                                <p className="text-gray-700 italic mb-4">“{t.feedback}”</p>
                                <div>
                                    <p className="font-semibold text-green-700">{t.name}</p>
                                    <p className="text-sm text-gray-500">{t.role}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>
        </>
    );
}
