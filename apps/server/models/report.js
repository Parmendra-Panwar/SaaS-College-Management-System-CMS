import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * Standalone bi-weekly Report model.
 * Intentionally kept separate from the Student schema.
 * The Student schema only stores a reportStatus boolean array
 * to track submission state (not the full report content).
 */
const reportSchema = new Schema({
    // --- Relationships ---
    studentId:  { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    collegeId:  { type: Schema.Types.ObjectId, ref: 'College',  required: true },
    classId:    { type: Schema.Types.ObjectId, ref: 'Class',    required: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User',   required: true }, // Teacher/Principal who created it

    // --- Report Content ---
    topic:         { type: String, required: true, trim: true },
    description:   { type: String, required: true, trim: true },
    attachmentUrl: { type: String, default: null }, // Cloudinary URL

    // --- Bi-weekly tracking ---
    // 1–26 to represent the 26 bi-weekly periods in an academic year
    periodIndex: {
        type: Number,
        required: true,
        min: 1,
        max: 26,
    },
}, { timestamps: true });

// A student can only have one report per bi-weekly period
reportSchema.index({ studentId: 1, periodIndex: 1 }, { unique: true });

export default mongoose.model("Report", reportSchema);
