import { connectDB } from "@/lib/mongoDb";
import Appointment from "@/models/Appointment";
import { NextRequest, NextResponse } from "next/server";

interface AppointmentData {
    patientName: string;
    species: string;
    breed?: string;
    age?: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    veterinarian?: string;
    scheduledFor: string | Date;
    reason: string;
    urgency?: "Low" | "Medium" | "High" | "Emergency";
    notes?: string;
}

// Create new appointment
export async function POST(req: NextRequest) {
    await connectDB();

    try {
        const body = (await req.json()) as AppointmentData;

        // Validate required fields
        const requiredFields = [
            "patientName",
            "species",
            "ownerName",
            "ownerEmail",
            "ownerPhone",
            "scheduledFor",
            "reason",
        ];

        for (const field of requiredFields) {
            if (!body[field as keyof AppointmentData]) {
                return NextResponse.json(
                    { success: false, error: `${field} is required` },
                    { status: 400 }
                );
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.ownerEmail)) {
            return NextResponse.json(
                { success: false, error: "Invalid email format" },
                { status: 400 }
            );
        }

        // Validate appointment date is in the future
        const appointmentDate = new Date(body.scheduledFor);
        if (appointmentDate <= new Date()) {
            return NextResponse.json(
                { success: false, error: "Appointment must be scheduled for a future date" },
                { status: 400 }
            );
        }

        const appointment = await Appointment.create(body);

        return NextResponse.json(
            {
                success: true,
                message: "Appointment booked successfully",
                data: appointment,
            },
            { status: 201 }
        );
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 400 }
        );
    }
}

// Fetch appointments with filtering
export async function GET(req: NextRequest) {
    await connectDB();

    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");
        const vetId = searchParams.get("vetId");
        const status = searchParams.get("status");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        // Build query
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};

        if (email) {
            query.ownerEmail = email;
        }

        if (vetId) {
            query.veterinarian = vetId;
        }

        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const appointments = await Appointment.find(query)
            .populate("veterinarian")
            .sort({ scheduledFor: 1 })
            .skip(skip)
            .limit(limit);

        const total = await Appointment.countDocuments(query);

        return NextResponse.json(
            {
                success: true,
                data: appointments,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}

// Update appointment status
export async function PATCH(req: NextRequest) {
    await connectDB();

    try {
        const body = await req.json();
        const { appointmentId, status, notes } = body;

        if (!appointmentId) {
            return NextResponse.json(
                { success: false, error: "Appointment ID is required" },
                { status: 400 }
            );
        }

        const validStatuses = [
            "scheduled",
            "confirmed",
            "completed",
            "cancelled",
            "rescheduled",
        ];

        if (status && !validStatuses.includes(status)) {
            return NextResponse.json(
                { success: false, error: "Invalid status value" },
                { status: 400 }
            );
        }

        const updateData: { status?: string; notes?: string } = {};
        if (status) updateData.status = status;
        if (notes) updateData.notes = notes;

        const appointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            updateData,
            { new: true, runValidators: true }
        ).populate("veterinarian");

        if (!appointment) {
            return NextResponse.json(
                { success: false, error: "Appointment not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Appointment updated successfully",
                data: appointment,
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 400 }
        );
    }
}
