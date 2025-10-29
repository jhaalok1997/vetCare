"use client"
import { Button } from "@/components/ui/button"
//import Link from "next/link"

export default function QuickActions() {
    return (
        <section className="max-w-7xl mx-auto px-6 py-10">
            <div className="mb-6">
                <h3 className="text-2xl font-bold">Quick Actions</h3>
                <p className="text-gray-600">Get started with the most common tasks</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <ActionCard
                    title="Book Appointment"
                    description="Schedule a visit with a veterinarian"
                    cta="Book Now"
                />
                <ActionCard
                    title="Find a Vet"
                    description="Discover nearby vets and specialists"
                    cta="Browse Vets"
                />
                <ActionCard
                    title="Upload Report"
                    description="Share lab results or case files"
                    cta="Upload"
                />
            </div>
        </section>
    )
}

function ActionCard({
    title,
    description,
    cta,
}: {
    title: string
    description: string
    cta: string
}) {
    return (
        <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <h4 className="text-lg font-semibold mb-1">{title}</h4>
            <p className="text-gray-600 mb-4 text-sm">{description}</p>
            <Button className="w-full" size="lg">
                {cta}
            </Button>
        </div>
    )
}


