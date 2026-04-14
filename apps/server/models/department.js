import mongoose from "mongoose";
const { Schema } = mongoose;

const departmentSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true } // MBTS
}, { timestamps: true });

export default mongoose.model("Department", departmentSchema);
