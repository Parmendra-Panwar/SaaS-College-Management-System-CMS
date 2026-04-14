import mongoose from "mongoose";
const { Schema } = mongoose;

const subjectSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true }, // MBTS
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department' }, // CBTD
  classIds: [{ type: Schema.Types.ObjectId, ref: 'Class' }], // CBTC
}, { timestamps: true });

export default mongoose.model("Subject", subjectSchema);
