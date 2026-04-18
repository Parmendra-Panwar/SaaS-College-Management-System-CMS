import Class from "../models/class.js";
import Subject from "../models/subject.js";
import Student from "../models/student.js";
import Teacher from "../models/teacher.js";
import User from "../models/user.js";
import CollegeRequest from "../models/collegeRequest.js";
import bcrypt from "bcryptjs";

export const requestCollege = async (req, res) => {
  const { collegeName, principalName, principalEmail, contactNumber } = req.body;
  if (!collegeName || !principalName || !principalEmail) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newRequest = await CollegeRequest.create({
    collegeName, principalName, principalEmail, contactNumber
  });

  res.status(201).json({ success: true, message: "Request received successfully", data: newRequest });
};

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
  const { students } = req.body; // Array of { username, email, password, class, roll_number }
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
    class: students[index].class,
    roll_number: students[index].roll_number
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

export const bulkCreateTeachers = async (req, res) => {
  const { teachers } = req.body; 
  const collegeId = req.collegeId;

  const rawTeacherPassword = "Teacher@123";
  const hashedPassword = await bcrypt.hash(rawTeacherPassword, 10);
  
  const usersToInsert = teachers.map(t => ({
    username: t.username,
    email: t.email,
    password: hashedPassword,
    tempPassword: rawTeacherPassword,
    role: 'Teacher',
    collegeId
  }));

  const insertedUsers = await User.insertMany(usersToInsert, { ordered: false });

  const teachersToInsert = insertedUsers.map((user, index) => ({
    user: user._id,
    collegeId,
    level: teachers[index].level || 1,
    workCount: 0
  }));

  // Not specifically imported 'Teacher', let's assume we import Teacher at the top
  const insertedTeachers = await Teacher.insertMany(teachersToInsert, { ordered: false });
  res.status(201).json({ success: true, count: insertedTeachers.length, data: insertedTeachers });
};
