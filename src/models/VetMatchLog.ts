// models/VetMatchLog.ts
import mongoose from 'mongoose';

const VetMatchLogSchema = new mongoose.Schema({
  userId: { type: String }, // or ObjectId if you have user auth
  animalType: { type: mongoose.Schema.Types.ObjectId, ref: 'AnimalType' },
  diseaseCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'DiseaseCategory' },
  matchedVet: { type: mongoose.Schema.Types.ObjectId, ref: 'VetProfile' },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.VetMatchLog || mongoose.model('VetMatchLog', VetMatchLogSchema);