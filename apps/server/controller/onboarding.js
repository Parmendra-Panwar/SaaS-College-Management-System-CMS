import Class from "../models/class.js";
import Subject from "../models/subject.js";
import Student from "../models/student.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";

export const bulkCreateClasses = async (req, res) => {
  const { classes } = req.body; // Array of { name, departmentId }
  const collegeId = req.collegeId;

  const classesToInsert = classes.map(c => ({ ...c, collegeId }));
  const inserted = await Class.insertMany(classesToInsert, { ordered: false });
  // TicBased high-speed onboarding
  res.status(201).json({ success: true, count: inserted.length, data: inserted });
};

export const bulkCreateSubjects = async (req, res) => {
  const { subjects } = req.body; // Array of { name, code, departmentId, classIds }
  const collegeId = req.collegeId;

  const subjectsToInsert = subjects.map(s => ({ ...s, collegeId }));
  const inserted = await Subject.insertMany(subjectsToInsert, { ordered: false });
  res.status(201).json({ success: true, count: inserted.length, data: inserted });
};

export const bulkCreateStudents = async (req, res) => {
  const { students } = req.body; // Array of { username, email, password, classId, enrollmentNumber }
  const collegeId = req.collegeId;

  // For high speed: Hash passwords first
  const hashedPassword = await bcrypt.hash("Student@123", 10); // default password if not provided
  
  const usersToInsert = students.map(s => ({
    username: s.username,
    email: s.email,
    password: s.password ? bcrypt.hashSync(s.password, 10) : hashedPassword,
    role: 'Student',
    collegeId
  }));

  // Create Users
  const insertedUsers = await User.insertMany(usersToInsert, { ordered: false });

  // Map users to students
  const studentsToInsert = insertedUsers.map((user, index) => ({
    user: user._id,
    collegeId,
    classId: students[index].classId,
    enrollmentNumber: students[index].enrollmentNumber
  }));

  const insertedStudents = await Student.insertMany(studentsToInsert, { ordered: false });

  res.status(201).json({ success: true, count: insertedStudents.length, data: insertedStudents });
};

export const bulkEditStudents = async (req, res) => {
  const { students } = req.body; // Array of { _id (student id), updateData }
  const collegeId = req.collegeId;

  const bulkOps = students.map(student => ({
    updateOne: {
      filter: { _id: student._id, collegeId },
      update: { $set: student.updateData }
    }
  }));

  const result = await Student.bulkWrite(bulkOps);
  res.status(200).json({ success: true, result });
};
