import mongoose from "mongoose";

const AnimalCategorySchema = new mongoose.Schema({
  petName: { type: String, required: true },
  animalType: {
    type: String,
    required: true,
  },
  petAge: { type: Number, required: true },
  petBreed: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.AnimalCategory ||
  mongoose.model("AnimalCategory", AnimalCategorySchema);
