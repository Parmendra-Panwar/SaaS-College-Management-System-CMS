import mongoose from "mongoose";
const { Schema } = mongoose;

const classFeeSchema = new Schema({
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, unique: true },
    feeTypes: [{
        type: { type: String, required: true },
        amount: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model("ClassFee", classFeeSchema);
