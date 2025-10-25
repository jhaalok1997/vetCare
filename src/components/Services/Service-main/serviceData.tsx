import {
    PawPrint,
    Stethoscope,
    HeartPulse,
    Syringe,
    ClipboardList,
    Microscope,
} from "lucide-react";

// export const services = [
//     {
//         slug: "general-veterinary-care",
//         icon: <Stethoscope className="w-8 h-8 text-primary" />,
//         title: "General Veterinary Care",
//         description:
//             "Routine check-ups, vaccinations, and preventive health screenings to keep your animals healthy year-round.",
//         details:
//             "Our veterinary team provides comprehensive general healthcare including deworming, wellness exams, and chronic disease management.",
//     },
//     {
//         slug: "emergency-critical-care",
//         icon: <HeartPulse className="w-8 h-8 text-primary" />,
//         title: "Emergency & Critical Care",
//         description:
//             "24/7 emergency services for urgent conditions, ensuring quick diagnosis and immediate treatment.",
//         details:
//             "We offer round-the-clock emergency care for accidents, poisoning, trauma, and other life-threatening conditions.",
//     },
//     {
//         slug: "vaccination-immunization",
//         icon: <Syringe className="w-8 h-8 text-primary" />,
//         title: "Vaccination & Immunization",
//         description:
//             "Comprehensive vaccination programs tailored for livestock, pets, and exotic animals.",
//         details:
//             "From rabies to parvovirus, we ensure animals are protected with personalized vaccine schedules.",
//     },
//     {
//         slug: "animal-health-tracking",
//         icon: <ClipboardList className="w-8 h-8 text-primary" />,
//         title: "Animal Health Tracking",
//         description:
//             "Digital health records, AI-based monitoring, and wellness reminders for proactive animal care.",
//         details:
//             "We provide app-based tracking of animal health, vaccination reminders, and early-warning alerts.",
//     },
//     {
//         slug: "diagnostics-lab-services",
//         icon: <Microscope className="w-8 h-8 text-primary" />,
//         title: "Diagnostics & Lab Services",
//         description:
//             "In-house lab for bloodwork, imaging, and advanced diagnostic tests to detect issues early.",
//         details:
//             "Our lab offers X-ray, ultrasound, hematology, and advanced testing for precise diagnosis.",
//     },
//     {
//         slug: "nutrition-rehabilitation",
//         icon: <PawPrint className="w-8 h-8 text-primary" />,
//         title: "Nutrition & Rehabilitation",
//         description:
//             "Personalized diet plans, physiotherapy, and rehabilitation services for full recovery and wellbeing.",
//         details:
//             "We provide nutrition counseling, weight management, hydrotherapy, and recovery support.",
//     },
// ];

export const services = [
  {
    slug: "general-veterinary-care",
    icon: <Stethoscope className="w-8 h-8 text-primary" />,
    title: "General Veterinary Care",
    description:
      "Routine check-ups, vaccinations, and preventive health screenings to keep your animals healthy year-round.",
    features: [
      "Routine health check-ups & annual wellness exams",
      "Preventive vaccinations & parasite control",
      "Nutritional guidance for pets & livestock",
    ],
    colorPalette: {
      primary: "white",
      secondary: "emerald-100",
    },
    cta: "Schedule a General Care Visit",
  },
  {
    slug: "emergency-critical-care",
    icon: <HeartPulse className="w-8 h-8 text-primary" />,
    title: "Emergency & Critical Care",
    description:
      "24/7 emergency services for urgent conditions, ensuring quick diagnosis and immediate treatment.",
    features: [
      "Immediate trauma & accident care",
      "Critical surgery & life support",
      "On-call vets available 24/7",
    ],
    colorPalette: {
      primary: "red-600",
      secondary: "red-100",
    },
    cta: "Call Emergency Line",
  },
  {
    slug: "vaccination-immunization",
    icon: <Syringe className="w-8 h-8 text-primary" />,
    title: "Vaccination & Immunization",
    description:
      "Comprehensive vaccination programs tailored for livestock, pets, and exotic animals.",
    features: [
      "Puppy & kitten vaccination programs",
      "Annual booster shots",
      "Custom immunization for exotic pets",
    ],
    colorPalette: {
      primary: "blue-600",
      secondary: "blue-100",
    },
    cta: "Book a Vaccination",
  },
  {
    slug: "animal-health-tracking",
    icon: <ClipboardList className="w-8 h-8 text-primary" />,
    title: "Animal Health Tracking",
    description:
      "Digital health records, AI-based monitoring, and wellness reminders for proactive animal care.",
    features: [
      "AI-driven health alerts",
      "Digital vaccination & treatment history",
      "Mobile app for real-time updates",
    ],
    colorPalette: {
      primary: "purple-600",
      secondary: "purple-100",
    },
    cta: "Start Health Tracking",
  },
  {
    slug: "diagnostics-lab-services",
    icon: <Microscope className="w-8 h-8 text-primary" />,
    title: "Diagnostics & Lab Services",
    description:
      "In-house lab for bloodwork, imaging, and advanced diagnostic tests to detect issues early.",
    features: [
      "Blood tests & urine analysis",
      "Ultrasound & X-ray imaging",
      "Pathology & biopsy tests",
    ],
    colorPalette: {
      primary: "yellow-600",
      secondary: "yellow-100",
    },
    cta: "Request Lab Test",
  },
  {
    slug: "nutrition-rehabilitation",
    icon: <PawPrint className="w-8 h-8 text-primary" />,
    title: "Nutrition & Rehabilitation",
    description:
      "Personalized diet plans, physiotherapy, and rehabilitation services for full recovery and wellbeing.",
    features: [
      "Custom diet plans",
      "Post-surgery physiotherapy",
      "Weight management programs",
    ],
    colorPalette: {
      primary: "teal-600",
      secondary: "teal-100",
    },
    cta: "Get Nutrition Plan",
  },
];
