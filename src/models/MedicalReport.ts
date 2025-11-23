import mongoose, { Schema, Document, models } from "mongoose";

export interface IMedicalReport extends Document {
    fileName: string;
    originalName: string;
    fileSize: number;
    fileType: string;
    filePath: string;
    uploadedBy: {
        name: string;
        email: string;
        phone?: string;
    };
    patientName?: string;
    species?: string;
    appointmentId?: mongoose.Types.ObjectId;
    description?: string;
    uploadDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const MedicalReportSchema = new Schema<IMedicalReport>(
    {
        fileName: {
            type: String,
            required: true,
        },
        originalName: {
            type: String,
            required: true,
        },
        fileSize: {
            type: Number,
            required: true,
        },
        fileType: {
            type: String,
            required: true,
        },
        filePath: {
            type: String,
            required: true,
        },
        uploadedBy: {
            name: {
                type: String,
                required: true,
            },
            email: {
                type: String,
                required: true,
            },
            phone: String,
        },
        patientName: String,
        species: String,
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
        },
        description: String,
        uploadDate: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Index for efficient queries
MedicalReportSchema.index({ "uploadedBy.email": 1 });
MedicalReportSchema.index({ appointmentId: 1 });
MedicalReportSchema.index({ uploadDate: -1 });

export default models.MedicalReport ||
    mongoose.model<IMedicalReport>("MedicalReport", MedicalReportSchema);
