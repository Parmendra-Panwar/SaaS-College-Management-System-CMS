import mongoose from "mongoose";
const { Schema } = mongoose;

const attendanceSchema = new Schema({
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    date: { type: Date, required: true },
    records: [{
        studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
        status: { type: String, enum: ['Present', 'Absent', 'Late'], required: true }
    }]
}, { timestamps: true });

// Ensure only one document per class per day
attendanceSchema.index({ classId: 1, date: 1 }, { unique: true });
// Index for fast lookup of a specific student's attendance records over time
attendanceSchema.index({ 'records.studentId': 1, date: 1 });

export default mongoose.model("Attendance", attendanceSchema);
