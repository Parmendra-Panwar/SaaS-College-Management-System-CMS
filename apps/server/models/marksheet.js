import mongoose from "mongoose";
const { Schema } = mongoose;

const marksheetSchema = new Schema({
  examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  marks: [{
     subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
     theoryMarks: { type: Number, default: null },
     practicalMarks: { type: Number, default: null }
  }]
}, { timestamps: true });

marksheetSchema.index({ examId: 1, studentId: 1 }, { unique: true });

export default mongoose.model("Marksheet", marksheetSchema);
