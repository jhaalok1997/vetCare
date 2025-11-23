"use client"
import { Button } from "@/components/ui/button"
import { Calendar, Upload, ArrowRight } from "lucide-react"
import { useState } from "react"
import BookAppointmentModal from "./BookAppointmentModal"
import UploadReportModal from "./UploadReportModal"

export default function QuickActions() {
    const [showBookingModal, setShowBookingModal] = useState(false)
    const [showUploadModal, setShowUploadModal] = useState(false)

    const handleBookAppointment = () => {
        setShowBookingModal(true)
    }



    const handleUploadReport = () => {
        setShowUploadModal(true)
    }

    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8 text-center">
                <h3 className="text-3xl font-extrabold font-sans tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent sm:text-4xl">
                    Quick Actions
                </h3>
                <p className="text-gray-600 mt-2 text-lg font-medium">Get started with the most common tasks</p>
            </div>

            <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
                <ActionCard
                    title="Book Appointment"
                    description="Schedule a visit with a veterinarian"
                    cta="Book Now"
                    icon={<Calendar className="w-8 h-8" />}
                    gradient="from-blue-500 to-cyan-500"
                    onClick={handleBookAppointment}
                />
                {/* <ActionCard
                    title="Find a Vet"
                    description="Discover nearby vets and specialists"
                    cta="Browse Vets"
                    icon={<Stethoscope className="w-8 h-8" />}
                    gradient="from-emerald-500 to-teal-500"
                    onClick={handleFindVet}
                /> */}
                <ActionCard
                    title="Upload Report"
                    description="Share lab results or case files"
                    cta="Upload"
                    icon={<Upload className="w-8 h-8" />}
                    gradient="from-purple-500 to-pink-500"
                    onClick={handleUploadReport}
                />
            </div>

            {/* Modals */}
            <BookAppointmentModal
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
            />
            <UploadReportModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
            />
        </section>
    )
}

function ActionCard({
    title,
    description,
    cta,
    icon,
    gradient,
    onClick,
}: {
    title: string
    description: string
    cta: string
    icon: React.ReactNode
    gradient: string
    onClick: () => void
}) {
    return (
        <div
            className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden"
            onClick={onClick}
        >
            {/* Gradient background on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

            {/* Icon with gradient background */}
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} text-white mb-4 shadow-lg`}>
                {icon}
            </div>

            {/* Content */}
            <h4 className="text-xl font-bold mb-2 text-gray-900">{title}</h4>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">{description}</p>

            {/* CTA Button */}
            <Button
                className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90 text-white font-semibold shadow-md group/btn`}
                size="lg"
            >
                <span>{cta}</span>
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
            </Button>
        </div>
    )
}
