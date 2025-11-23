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
import { useState, useEffect } from "react";
import axios from "axios";

// Default testimonials at module scope to avoid hook deps
const defaultTestimonials: Array<{ name: string; role: string; feedback: string }> = [
    {
        name: "Dr. Meera Sharma",
        role: "Veterinary Surgeon",
        feedback:
            "Vet🐾Care's predictive analytics helped me anticipate seasonal disease outbreaks. It's like having an AI-powered colleague by my side.",
    },
    {
        name: "Akash Jha",
        role: "B.V.Sc. Student, BHU",
        feedback:
            "The AI-driven quizzes and clinical simulations made my study routine engaging. I feel more confident preparing for exams.",
    },
    {
        name: "Priya Nair",
        role: "Pet Parent, Bangalore",
        feedback:
            "The early symptom checker guided me to the vet at the right time. My lab recovered faster thanks to timely care tips.",
    },
    {
        name: "Dr. Arjun Malhotra",
        role: "Livestock Consultant",
        feedback:
            "Analytics on herd vaccination schedules reduced disease incidents on our farm. Exceptional decision-support for field vets.",
    },
    {
        name: "Sana Qureshi",
        role: "Final-year Vet Student",
        feedback:
            "Flashcards and case-based MCQs match our syllabus perfectly. It feels like a smart study buddy that never gets tired.",
    },
    {
        name: "Rahul Verma",
        role: "Clinic Manager",
        feedback:
            "Our case documentation improved with structured notes and AI summaries. The team collaborates better and faster now.",
    },
    {
        name: "Dr. Kavita Joshi",
        role: "Wildlife Veterinarian",
        feedback:
            "Zoonotic risk mapping is a standout feature. It adds real-world context to wildlife rescue and rehab decisions.",
    },
    {
        name: "Abhishek Singh",
        role: "Pet Owner, Delhi",
        feedback:
            "Nutrition guidance was practical and easy to follow. My indie dog's coat and energy improved in two weeks.",
    },
    {
        name: "Neha Gupta",
        role: "Veterinary Intern",
        feedback:
            "Clinical simulations gave me confidence before rotations. The feedback is specific, not generic—huge plus!",
    },
    {
        name: "Dr. Rohan Deshpande",
        role: "Small Animal Practitioner",
        feedback:
            "Drug interaction checks saved a complex case. The knowledge graph makes cross-referencing quick and reliable.",
    },
    {
        name: "Ishita Kapoor",
        role: "B.Tech Bioinformatics",
        feedback:
            "Loved the clean UI and the way insights are explained. Makes advanced concepts approachable for non-vets too.",
    },
    {
        name: "Mohit Yadav",
        role: "Dairy Farm Owner",
        feedback:
            "Heat stress alerts and hydration tips cut summer losses. It paid for itself in one season.",
    },
    {
        name: "Dr. Ananya Rao",
        role: "Equine Specialist",
        feedback:
            "The differential diagnosis flow is practical and time-saving. It mirrors the way clinicians actually think.",
    },
    {
        name: "Karan Patel",
        role: "First-time Pet Parent",
        feedback:
            "Onboarding was smooth and the guidance was reassuring. Perfect for new pet parents who want to do things right.",
    },
    {
        name: "Simran Kaur",
        role: "Vet Prep Aspirant",
        feedback:
            "Daily micro-lessons helped me build consistency. Short, crisp, and relevant—exactly what I needed.",
    },
    {
        name: "Dr. Vivek Menon",
        role: "Public Health Veterinarian",
        feedback:
            "The focus on One Health is refreshing. It connects animal, human, and environmental health in a meaningful way.",
    },
];

const MIN_UNIQUE_TESTIMONIALS = 12;

function buildTestimonials(
    apiData: Array<{ name: string; role: string; feedback: string }>
): Array<{ name: string; role: string; feedback: string }> {
    const pool = [...apiData, ...defaultTestimonials];
    const seen = new Set<string>();
    const unique: Array<{ name: string; role: string; feedback: string }> = [];
    for (const t of pool) {
        const key = `${t.name}|${t.feedback}`.trim();
        if (!seen.has(key) && t.name && t.feedback) {
            seen.add(key);
            unique.push(t);
        }
    }
    const filled: Array<{ name: string; role: string; feedback: string }> = [...unique];
    let i = 0;
    while (filled.length < MIN_UNIQUE_TESTIMONIALS && i < defaultTestimonials.length * 2) {
        const candidate = defaultTestimonials[i % defaultTestimonials.length];
        const key = `${candidate.name}|${candidate.feedback}`;
        if (!seen.has(key)) {
            seen.add(key);
            filled.push(candidate);
        }
        i++;
    }
    return filled;
}

//

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

    // State for testimonials
    const [testimonials, setTestimonials] = useState<Array<{ name: string; role: string; feedback: string }>>([]);
    const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);

    // Fetch testimonials from API
    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                setIsLoadingTestimonials(true);
                const response = await axios.get("/api/testimonials");
                setTestimonials(buildTestimonials(response.data));
            } catch (error) {
                console.error("Failed to fetch testimonials:", error);
                setTestimonials(buildTestimonials([]));
            } finally {
                setIsLoadingTestimonials(false);
            }
        };

        fetchTestimonials();
    }, []);

    // Build a seamless marquee track: ensure enough items and duplicate once for looping
    const baseItems = testimonials;
    const marqueeItems = [...baseItems, ...baseItems];

    const controls = useAnimation();
    const [isPaused, setIsPaused] = useState(false);

    // Start animation when testimonials are loaded
    useEffect(() => {
        if (testimonials.length > 0) {
            controls.start({
                x: ["0%", "-100%"],
                transition: {
                    repeat: Infinity,
                    duration: 120,
                    ease: "linear",
                },
            });
        }
    }, [testimonials, controls]);

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
                    duration: 120,
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
                <p className="text-center text-gray-800 mask-r-from-neutral-600 max-w-3xl mx-auto mb-12">
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
                        className="inline-block bg-black text-green-700 font-semibold px-4 py-2 rounded-xl shadow hover:bg-gray-700 transition"
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

                {isLoadingTestimonials ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                            <p className="text-gray-600">Loading Testimonials...</p>
                        </div>
                    </div>
                ) : (
                    <div className="relative flex overflow-hidden">
                        <motion.div
                            className="flex gap-6"
                            animate={controls}
                            initial={{ x: "0%" }}
                        >
                            {marqueeItems.map((t, i) => (
                                <div
                                    key={i}
                                    onMouseEnter={handleHoverStart}
                                    onMouseLeave={handleHoverEnd}
                                    className="min-w-[300px] max-w-sm p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer border-2 border-green-300"
                                >
                                    <Quote className="w-8 h-8 text-green-600 mb-3" />
                                    <p className="text-gray-700 italic mb-4">&ldquo;{t.feedback}&rdquo;</p>
                                    <div>
                                        <p className="font-semibold text-green-700">{t.name}</p>
                                        <p className="text-sm text-gray-500">{t.role}</p>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                )}
            </section>
        </>
    );
}
