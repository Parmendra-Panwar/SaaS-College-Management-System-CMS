import mongoose from "mongoose";
const { Schema } = mongoose;

const collegeSchema = new Schema({
  name: { type: String, required: true },
  branding: {
    logo: { type: String },
    primaryColor: { type: String }
  },
  subscriptionStatus: { type: String, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
}, { timestamps: true });

export default mongoose.model("College", collegeSchema);
