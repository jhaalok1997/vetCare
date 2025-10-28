import mongoose, { Schema, Document, models } from "mongoose";

export interface IDiagnosisReport extends Document {
  animalType: string;
  petAge: string;
  symptoms: string;
  urgency: string;
  additionalNotes?: string;
  report: string;
  createdAt: Date;
}

const DiagnosisReportSchema = new Schema<IDiagnosisReport>(
  {
    animalType: { type: String, required: true },
    petAge: { type: String, required: true },
    symptoms: { type: String, required: true },
    urgency: { type: String, required: true },
    additionalNotes: { type: String },
    report: { type: String, required: true },
  },
  { timestamps: true }
);

// Prevent model overwrite on hot reloads in Next.js
export default models.DiagnosisReport ||
  mongoose.model<IDiagnosisReport>("DiagnosisReport", DiagnosisReportSchema);
