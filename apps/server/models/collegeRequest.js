import mongoose from "mongoose";
const { Schema } = mongoose;

const collegeRequestSchema = new Schema({
  collegeName: { type: String, required: true },
  principalName: { type: String, required: true },
  principalEmail: { type: String, required: true },
  contactNumber: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.model("CollegeRequest", collegeRequestSchema);
