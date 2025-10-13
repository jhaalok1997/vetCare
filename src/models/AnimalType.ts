
import mongoose from 'mongoose';

const AnimalTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., Dog, Cow, Bird
  icon: { type: String }, // optional: for UI display
});

export default mongoose.models.AnimalType || mongoose.model('AnimalType', AnimalTypeSchema);