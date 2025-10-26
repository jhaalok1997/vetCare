// models/DiseaseCategory.ts
import mongoose from "mongoose";

const DiseaseCategorySchema = new mongoose.Schema({
  DiseaseType: {
    type: String,
    required: true,
  },
  UrgencyLevel: {
    type: String,
    enum: ["Low", "Medium", "High"],
    required: true,
  },
  Duration:{ 
    type: Number,
     required: true 
  },
  Symptoms: {
     type: [String],
     required: true
     },
  AdditionalInfo: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.DiseaseCategory ||
  mongoose.model("DiseaseCategory", DiseaseCategorySchema);
