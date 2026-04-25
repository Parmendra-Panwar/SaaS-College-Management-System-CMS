import mongoose from "mongoose";
const { Schema } = mongoose;

const studentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  roll_number: { type: String, required: true },

  // Step 3: High-Frequency Operational Logic
  // 91 days (13 weeks) x 4 periods. Initialized to false/null.
  attendance: {
    type: [[Boolean]],
    default: () => Array.from({ length: 91 }, () => Array(4).fill(false))
  },

  // 26 bi-weekly reports for a year. 
  workReport: {
    type: [Number],
    default: () => Array(26).fill(0)
  },

  // Step 5: AI Intelligence Service
  clusterId: {
    type: String,
    enum: ['High Achiever', 'Consistent', 'At-Risk', 'Uncategorized'],
    default: 'Uncategorized'
  }
}, { timestamps: true });

export default mongoose.model("Student", studentSchema);
