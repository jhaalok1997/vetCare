// models/VetProfile.ts
import mongoose from 'mongoose';

const VetProfileSchema = new mongoose.Schema({
  accountUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },
  name: { 
    type: String,
    required: true 
  },
  qualifications: {
    type: String 
  },
  experienceYears: {
    type: Number 
  },
  contact: {
    phone: String,
    email: String,
    location: String,
    teleconsultAvailable: { type: Boolean, default: false },
  },
  animalExpertise: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'AnimalType' }
  ],
  diseaseExpertise: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'DiseaseCategory' }
  ],
  tags: [String], // e.g., ["dog", "skin", "dermatology"]
  rating: { 
    type: Number,
    default: 0 
  },
  isActive: {
    type: Boolean,
    // Treated as "verified/approved" flag for vets.
    // New profiles start as not verified until an admin approves them.
    default: false 
  },
});

export default mongoose.models.VetProfile || mongoose.model('VetProfile', VetProfileSchema);