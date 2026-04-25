import mongoose from "mongoose";
const { Schema } = mongoose;

const attendanceSchema = new Schema({
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Present' }
}, { timestamps: true });

// Ensure a student only has one attendance record per day per class
attendanceSchema.index({ classId: 1, studentId: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
