import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  about: { type: String },
  role: { 
    type: String, 
    enum: ['Admin', 'Manager', 'Principal', 'Teacher', 'Student'], 
    default: 'Student' 
  },
  collegeId: { type: Schema.Types.ObjectId, ref: 'College' }, // Made optional for Admin/Manager
  assignedColleges: [{ type: Schema.Types.ObjectId, ref: 'College' }], // For Manager role

  // Optional References for specific role data
  teacherProfile: { type: Schema.Types.ObjectId, ref: 'Teacher' },
  studentProfile: { type: Schema.Types.ObjectId, ref: 'Student' },
  
  // Track auto-generated pass for principal view by super admin
  tempPassword: { type: String }
}, { timestamps: true });

export default mongoose.model("User", userSchema);