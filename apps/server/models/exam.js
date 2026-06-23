import mongoose from "mongoose";
const { Schema } = mongoose;

const examSchema = new Schema({
  name: { type: String, required: true },
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  subjectsConfig: [{
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    maxTheory: { type: Number, required: true },
    maxPractical: { type: Number, required: true }
  }],
}, { timestamps: true });

export default mongoose.model("Exam", examSchema);
