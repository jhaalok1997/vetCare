// models/VetProfile.ts
import mongoose from "mongoose";

const VetProfileSchema = new mongoose.Schema(
  {
    accountUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

    qualifications: {
      type: String,
    },

    experienceYears: {
      type: Number,
    },

    contact: {
      phone: String,
      email: String,
      location: String,
      teleconsultAvailable: { type: Boolean, default: false },
    },

    // ✅ FIXED: AnimalType ❌ → AnimalCategory ✔
    animalExpertise: [String],

    // DiseaseCategory should exist — if not, tell me & I will generate it
    diseaseExpertise: [
      { type: mongoose.Schema.Types.ObjectId, ref: "DiseaseCategory" },
    ],

    tags: [String],

    rating: {
      type: Number,
      default: 0,
    },

    // Treated as verification flag
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent overwrite error in Next.js dev mode
export default mongoose.models.VetProfile ||
  mongoose.model("VetProfile", VetProfileSchema);
