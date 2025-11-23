import { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
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
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [5, "Password must be at least 5 characters long"],
    },
    role: {
      type: String,
      enum: ["petOwner", "vet", "admin"], // ✅ allowed roles
      default: "petOwner", // ✅ default role
    },
    tenantId: {
      type: String, // or mongoose.Schema.Types.ObjectId if you have an Org model
      required: true, // 👈 ensures every user belongs to a tenant
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const AccountUser = models.User || model("User", UserSchema);
export default AccountUser;
