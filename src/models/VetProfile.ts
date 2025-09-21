// models/VetProfile.ts
import mongoose from 'mongoose';

const VetProfileSchema = new mongoose.Schema({
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
    default: true 
  },
});

export default mongoose.models.VetProfile || mongoose.model('VetProfile', VetProfileSchema);