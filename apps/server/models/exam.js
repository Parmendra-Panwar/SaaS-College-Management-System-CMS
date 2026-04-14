import mongoose from "mongoose";
const { Schema } = mongoose;

const examSchema = new Schema({
  name: { type: String, required: true },
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  classIds: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' }, // Optional
  date: { type: Date },
  
  // Array for saving reports of students
  results: [{
    studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    marksObtained: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    remarks: { type: String }
  }]
}, { timestamps: true });

export default mongoose.model("Exam", examSchema);
