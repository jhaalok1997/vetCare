// models/DiseaseCategory.ts
import mongoose from 'mongoose';

const DiseaseCategorySchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., Skin Issues, Reproductive Health
  animalTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AnimalType' }],
  description: { type: String },
});

export default mongoose.models.DiseaseCategory || mongoose.model('DiseaseCategory', DiseaseCategorySchema);