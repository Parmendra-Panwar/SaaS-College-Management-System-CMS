import mongoose from "mongoose";
const { Schema } = mongoose;

const classSchema = new Schema({
  name: { type: String, required: true },
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true }, // MBTS
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department' }, // CBTD
}, { timestamps: true });

export default mongoose.model("Class", classSchema);
