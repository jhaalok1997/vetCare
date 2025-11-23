import mongoose, { Schema, Document, models } from "mongoose";

export interface IAppointment extends Document {
    patientName: string;
    species: string;
    breed?: string;
    age?: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    veterinarian?: mongoose.Types.ObjectId;
    scheduledFor: Date;
    reason: string;
    urgency: "Low" | "Medium" | "High" | "Emergency";
    status: "scheduled" | "confirmed" | "completed" | "cancelled" | "rescheduled";
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
    {
        patientName: {
            type: String,
            required: [true, "Patient name is required"],
            trim: true,
        },
        species: {
            type: String,
            required: [true, "Species is required"],
            trim: true,
        },
        breed: {
            type: String,
            trim: true,
        },
        age: {
            type: String,
            trim: true,
        },
        ownerName: {
            type: String,
            required: [true, "Owner name is required"],
            trim: true,
        },
        ownerEmail: {
            type: String,
            required: [true, "Owner email is required"],
            trim: true,
            lowercase: true,
        },
        ownerPhone: {
            type: String,
            required: [true, "Owner phone is required"],
            trim: true,
        },
        veterinarian: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "VetProfile",
        },
        scheduledFor: {
            type: Date,
            required: [true, "Appointment date and time is required"],
        },
        reason: {
            type: String,
            required: [true, "Reason for visit is required"],
            trim: true,
        },
        urgency: {
            type: String,
            enum: ["Low", "Medium", "High", "Emergency"],
            default: "Low",
        },
        status: {
            type: String,
            enum: ["scheduled", "confirmed", "completed", "cancelled", "rescheduled"],
            default: "scheduled",
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

// Index for efficient queries
AppointmentSchema.index({ scheduledFor: 1, status: 1 });
AppointmentSchema.index({ ownerEmail: 1 });
AppointmentSchema.index({ veterinarian: 1 });

// Prevent model overwrite on hot reloads in Next.js
export default models.Appointment ||
    mongoose.model<IAppointment>("Appointment", AppointmentSchema);
