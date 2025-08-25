import  { Schema, models, model } from "mongoose";

const ContactedUserSchema = new Schema(
  {
    Name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    message: {
      type: String,
      required: [true],
      minlength: [25, "Message must be at least 25 characters long"],
    },
  },
  { timestamps: true }
);

// Prevent recompiling model during hot reloads in Next.js
const contactedUser = models.contactedUser || model("ContactedUser", ContactedUserSchema);

export default contactedUser;
