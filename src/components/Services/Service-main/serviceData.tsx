import {
    PawPrint,
    Stethoscope,
    HeartPulse,
    Syringe,
    ClipboardList,
    Microscope,
} from "lucide-react";

export const services = [
    {
        slug: "general-veterinary-care",
        icon: <Stethoscope className="w-8 h-8 text-primary" />,
        title: "General Veterinary Care",
        description:
            "Routine check-ups, vaccinations, and preventive health screenings to keep your animals healthy year-round.",
        details:
            "Our veterinary team provides comprehensive general healthcare including deworming, wellness exams, and chronic disease management.",
    },
    {
        slug: "emergency-critical-care",
        icon: <HeartPulse className="w-8 h-8 text-primary" />,
        title: "Emergency & Critical Care",
        description:
            "24/7 emergency services for urgent conditions, ensuring quick diagnosis and immediate treatment.",
        details:
            "We offer round-the-clock emergency care for accidents, poisoning, trauma, and other life-threatening conditions.",
    },
    {
        slug: "vaccination-immunization",
        icon: <Syringe className="w-8 h-8 text-primary" />,
        title: "Vaccination & Immunization",
        description:
            "Comprehensive vaccination programs tailored for livestock, pets, and exotic animals.",
        details:
            "From rabies to parvovirus, we ensure animals are protected with personalized vaccine schedules.",
    },
    {
        slug: "animal-health-tracking",
        icon: <ClipboardList className="w-8 h-8 text-primary" />,
        title: "Animal Health Tracking",
        description:
            "Digital health records, AI-based monitoring, and wellness reminders for proactive animal care.",
        details:
            "We provide app-based tracking of animal health, vaccination reminders, and early-warning alerts.",
    },
    {
        slug: "diagnostics-lab-services",
        icon: <Microscope className="w-8 h-8 text-primary" />,
        title: "Diagnostics & Lab Services",
        description:
            "In-house lab for bloodwork, imaging, and advanced diagnostic tests to detect issues early.",
        details:
            "Our lab offers X-ray, ultrasound, hematology, and advanced testing for precise diagnosis.",
    },
    {
        slug: "nutrition-rehabilitation",
        icon: <PawPrint className="w-8 h-8 text-primary" />,
        title: "Nutrition & Rehabilitation",
        description:
            "Personalized diet plans, physiotherapy, and rehabilitation services for full recovery and wellbeing.",
        details:
            "We provide nutrition counseling, weight management, hydrotherapy, and recovery support.",
    },
];
