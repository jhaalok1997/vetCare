// models/VetMatchLog.ts
import mongoose from 'mongoose';

const VetMatchLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ownerEmail: { type: String },
    ownerPhone: { type: String },
    animalType: { type: mongoose.Schema.Types.ObjectId, ref: "AnimalCategory" },
    diseaseCategory: { type: mongoose.Schema.Types.ObjectId, ref: "DiseaseCategory" },
    matchedVet: { type: mongoose.Schema.Types.ObjectId, ref: "VetProfile", index: true },
    appointmentDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    notes: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.VetMatchLog || mongoose.model("VetMatchLog", VetMatchLogSchema);