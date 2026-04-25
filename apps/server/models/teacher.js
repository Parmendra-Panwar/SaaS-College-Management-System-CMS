import mongoose from "mongoose";
const { Schema } = mongoose;

const teacherSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  level: { type: Number, enum: [1, 2, 3], default: 1 },
  workCount: { type: Number, default: 0 },
  departments: [{ type: Schema.Types.ObjectId, ref: 'Department' }],
  classes: [{ type: Schema.Types.ObjectId, ref: 'Class' }]
}, { timestamps: true });

export default mongoose.model("Teacher", teacherSchema);
