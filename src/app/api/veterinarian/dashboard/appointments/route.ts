import { connectDB } from "@/lib/mongoDb";
import Appointment from "@/models/Appointment";
import VetProfile from "@/models/VetProfile";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

type RequestUser = {
    id?: string;
    email?: string;
    role?: string;
    tenantId?: string;
};

type VetProfileLean = {
    _id: mongoose.Types.ObjectId;
    isActive?: boolean;
};

function getUserFromHeaders(req: NextRequest): RequestUser | null {
    const userHeader = req.headers.get("x-user");
    if (!userHeader) return null;
    try {
        return JSON.parse(userHeader) as RequestUser;
    } catch {
        return null;
    }
}

function toObjectId(id?: string) {
    if (!id) return null;
    return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;
}

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
        const user = getUserFromHeaders(req);
        if (!user?.id) {
            return NextResponse.json(
                { success: false, error: "Not authenticated" },
                { status: 401 }
            );
        }

        const ownerObjectId = toObjectId(user.id);
        if (!ownerObjectId) {
            return NextResponse.json(
                { success: false, error: "Invalid user id" },
                { status: 400 }
            );
        }

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

        const appointment = await Appointment.create({
            ...body,
            status: "pending",
            ownerId: ownerObjectId,
            tenantId: user.tenantId,
            // never accept vet assignment from client during booking
            veterinarian: null,
        });

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
        const user = getUserFromHeaders(req);
        if (!user?.id) {
            return NextResponse.json(
                { success: false, error: "Not authenticated" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");
        const vetId = searchParams.get("vetId");
        const status = searchParams.get("status");
        const mine = searchParams.get("mine") === "true";
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
            const statusList = status.split(",").map((s) => s.trim()).filter(Boolean);
            query.status = statusList.length > 1 ? { $in: statusList } : statusList[0];
        }

        if (mine || user.role === "petOwner") {
            const ownerObjectId = toObjectId(user.id);
            if (!ownerObjectId) {
                return NextResponse.json(
                    { success: false, error: "Invalid user id" },
                    { status: 400 }
                );
            }
            query.ownerId = ownerObjectId;
        }

        if (user.tenantId) {
            query.tenantId = user.tenantId;
        }

        const skip = (page - 1) * limit;

        const appointments = await Appointment.find(query)
            .populate("veterinarian")
            .sort({ scheduledFor: 1 })
            .skip(skip)
            .limit(limit);

        const total = await Appointment.countDocuments(query);

        const sanitizedAppointments = appointments.map((appointment) => {
            const raw = appointment.toObject();
            if (user.role === "petOwner" && raw.status !== "confirmed") {
                raw.veterinarian = undefined;
            }
            return raw;
        });

        return NextResponse.json(
            {
                success: true,
                data: sanitizedAppointments,
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
        const user = getUserFromHeaders(req);
        if (!user?.id) {
            return NextResponse.json(
                { success: false, error: "Not authenticated" },
                { status: 401 }
            );
        }

        const body = await req.json() as {
            appointmentId?: string;
            status?: string;
            notes?: string;
            scheduledFor?: string;
        };
        const { appointmentId, status, notes, scheduledFor } = body;

        if (!appointmentId) {
            return NextResponse.json(
                { success: false, error: "Appointment ID is required" },
                { status: 400 }
            );
        }

        const validStatuses = [
            "pending",
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

        const existingAppointment = await Appointment.findById(appointmentId).select("tenantId status veterinarian ownerId");
        if (!existingAppointment) {
            return NextResponse.json(
                { success: false, error: "Appointment not found" },
                { status: 404 }
            );
        }

        if (user.tenantId && existingAppointment.tenantId && existingAppointment.tenantId !== user.tenantId) {
            return NextResponse.json(
                { success: false, error: "Forbidden: Wrong tenant" },
                { status: 403 }
            );
        }

        const ownerMatches = existingAppointment.ownerId?.toString() === user.id;
        if (user.role === "petOwner" && !ownerMatches) {
            return NextResponse.json(
                { success: false, error: "Forbidden: Not your appointment" },
                { status: 403 }
            );
        }

        if (user.role === "petOwner" && status && !["pending", "cancelled"].includes(status)) {
            return NextResponse.json(
                { success: false, error: "Only veterinarians can confirm appointments" },
                { status: 403 }
            );
        }

        const updateData: {
            status?: string;
            notes?: string;
            scheduledFor?: Date;
            veterinarian?: mongoose.Types.ObjectId | null;
        } = {};
        if (notes) updateData.notes = notes;

        if (scheduledFor) {
            const newDate = new Date(scheduledFor);
            if (Number.isNaN(newDate.getTime()) || newDate <= new Date()) {
                return NextResponse.json(
                    { success: false, error: "Appointment must be scheduled for a future date" },
                    { status: 400 }
                );
            }
            if (user.role === "petOwner" && existingAppointment.status !== "pending") {
                return NextResponse.json(
                    { success: false, error: "Only pending appointments can be rescheduled" },
                    { status: 400 }
                );
            }
            updateData.scheduledFor = newDate;

            if (user.role === "petOwner") {
                updateData.status = "pending";
                updateData.veterinarian = null;
            }
        }

        if (status) updateData.status = status;

        if (status === "confirmed") {
            if (user.role !== "vet" && user.role !== "admin") {
                return NextResponse.json(
                    { success: false, error: "Only veterinarians can confirm appointments" },
                    { status: 403 }
                );
            }

            const vetProfileOrClauses: Array<Record<string, unknown>> = [];
            const vetUserObjectId = toObjectId(user.id);
            if (vetUserObjectId) {
                vetProfileOrClauses.push({ accountUser: vetUserObjectId });
            }
            if (user.email) {
                vetProfileOrClauses.push({ "contact.email": user.email });
            }

            const vetProfile = await VetProfile.findOne(
                vetProfileOrClauses.length ? { $or: vetProfileOrClauses } : { _id: null }
            )
                .select("_id isActive")
                .lean<VetProfileLean>();

            if (!vetProfile || !vetProfile.isActive) {
                return NextResponse.json(
                    { success: false, error: "Only verified veterinarians can confirm appointments" },
                    { status: 403 }
                );
            }

            updateData.veterinarian = vetProfile._id;
        }

        if (user.role === "vet" && status && status !== "confirmed") {
            return NextResponse.json(
                { success: false, error: "Only veterinarians can confirm appointments" },
                { status: 403 }
            );
        }

        if (status === "confirmed") {
            if (existingAppointment.status !== "pending") {
                return NextResponse.json(
                    { success: false, error: "Only pending appointments can be confirmed" },
                    { status: 400 }
                );
            }
            if (existingAppointment.veterinarian) {
                return NextResponse.json(
                    { success: false, error: "Appointment already assigned to a veterinarian" },
                    { status: 400 }
                );
            }
        }

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

// Delete appointment (owner or admin)
export async function DELETE(req: NextRequest) {
    await connectDB();

    try {
        const user = getUserFromHeaders(req);
        if (!user?.id) {
            return NextResponse.json(
                { success: false, error: "Not authenticated" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const appointmentId = searchParams.get("appointmentId");

        if (!appointmentId) {
            return NextResponse.json(
                { success: false, error: "Appointment ID is required" },
                { status: 400 }
            );
        }

        const existingAppointment = await Appointment.findById(appointmentId).select("tenantId ownerId");
        if (!existingAppointment) {
            return NextResponse.json(
                { success: false, error: "Appointment not found" },
                { status: 404 }
            );
        }

        if (user.tenantId && existingAppointment.tenantId && existingAppointment.tenantId !== user.tenantId) {
            return NextResponse.json(
                { success: false, error: "Forbidden: Wrong tenant" },
                { status: 403 }
            );
        }

        const ownerMatches = existingAppointment.ownerId?.toString() === user.id;
        if (user.role === "petOwner" && !ownerMatches) {
            return NextResponse.json(
                { success: false, error: "Forbidden: Not your appointment" },
                { status: 403 }
            );
        }

        if (user.role === "vet") {
            return NextResponse.json(
                { success: false, error: "Only owners or admins can delete appointments" },
                { status: 403 }
            );
        }

        await Appointment.findByIdAndDelete(appointmentId);

        return NextResponse.json(
            { success: true, message: "Appointment deleted successfully" },
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
