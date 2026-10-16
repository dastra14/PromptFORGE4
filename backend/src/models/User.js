import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    credits: { type: Number, default: () => Number(process.env.START_CREDITS) || 100 },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);