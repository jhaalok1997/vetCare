import mongoose from "mongoose";

const PatientOwnerSchema = new mongoose.Schema({
  ownerEmail: { type: String, required: true },
  countryCode: { type: String, required: true },
  ownerPhone: { type: String, required: true },
  preferredContactMethod: {
    type: String,
    enum: ["phone", "email", "both"],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.PatientOwner ||
  mongoose.model("PatientOwner", PatientOwnerSchema);
