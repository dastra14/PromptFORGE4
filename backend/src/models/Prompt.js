import mongoose from "mongoose";

const promptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    category: { type: String, default: "General", maxlength: 60 },
    model: { type: String, default: "", maxlength: 60 },
    description: { type: String, default: "", maxlength: 300 },
    text: { type: String, required: true, maxlength: 8000 },
    score: { type: Number, min: 0, max: 100, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Prompt", promptSchema);