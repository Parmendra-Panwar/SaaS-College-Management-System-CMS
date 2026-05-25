import mongoose from "mongoose";
const { Schema } = mongoose;

const studentFeeSchema = new Schema({
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, unique: true },
    feeTypes: [{
        type: { type: String, required: true },
        amount: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    totalPaid: { type: Number, default: 0 },
    receipts: [{
        type: { type: String, enum: ['Payment', 'Concession'], required: true },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        remark: { type: String },
        recordedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    }]
}, { timestamps: true });

export default mongoose.model("StudentFee", studentFeeSchema);
