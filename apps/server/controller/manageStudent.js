import Student from "../models/student.js";
import User from "../models/user.js";
import Teacher from "../models/teacher.js";
import Class from "../models/class.js";
import bcrypt from "bcryptjs";
import { getCollegeFilter, isActionAllowed } from "../utils/helpers.js";

export const getStudent = async (req, res) => {
    let filter = { _id: req.params.id, ...getCollegeFilter(req) };
    
    if (req.user.role === 'Teacher') {
        const teacher = await Teacher.findOne({ user: req.user._id });
        if (teacher) {
            let validClassIds = [...(teacher.classes || [])];
            if (teacher.departments && teacher.departments.length > 0) {
                const classesInDepts = await Class.find({ departmentId: { $in: teacher.departments } }).select('_id');
                validClassIds.push(...classesInDepts.map(c => c._id));
            }
            if (validClassIds.length > 0) {
                filter.class = { $in: validClassIds };
            } else {
                filter.class = null; // Forces empty result if no classes/departments
            }
        }
    }

    const student = await Student.findOne(filter).populate({ path: 'user', select: '-password' }).populate('class');
    if (!student) return res.status(404).json({ error: "Not found" });
    res.status(200).json({ success: true, data: student });
};

export const getStudents = async (req, res) => {
    let filter = getCollegeFilter(req);
    
    if (req.user.role === 'Teacher') {
        const teacher = await Teacher.findOne({ user: req.user._id });
        if (teacher) {
            let validClassIds = [...(teacher.classes || [])];
            if (teacher.departments && teacher.departments.length > 0) {
                const classesInDepts = await Class.find({ departmentId: { $in: teacher.departments } }).select('_id');
                validClassIds.push(...classesInDepts.map(c => c._id));
            }
            if (validClassIds.length > 0) {
                filter.class = { $in: validClassIds };
            } else {
                filter.class = null; // Forces empty result
            }
        }
    }

    const students = await Student.find(filter).populate({ path: 'user', select: '-password' }).populate('class');
    res.status(200).json({ success: true, data: students });
};

export const createStudent = async (req, res) => {
    const { username, email, class: classId, roll_number, collegeId } = req.body;
    if (!classId || !roll_number) return res.status(400).json({ error: "Class and Roll Number are mandatory" });

    const targetCollegeId = req.user.role === 'Principal' ? req.user.collegeId : collegeId;
    if (!isActionAllowed(req, targetCollegeId)) return res.status(403).json({ error: "Access Denied" });

    const rawPassword = "Student@123";
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    
    const user = await User.create({ username, email, password: hashedPassword, tempPassword: rawPassword, role: 'Student', collegeId: targetCollegeId });
    const student = await Student.create({ user: user._id, collegeId: targetCollegeId, class: classId, roll_number });
    
    res.status(201).json({ success: true, data: await student.populate([{ path: 'user', select: '-password' }, { path: 'class' }]) });
};

export const updateStudent = async (req, res) => {
    const { username, email, class: classId, roll_number } = req.body;
    const student = await Student.findOne({ _id: req.params.id, ...getCollegeFilter(req) });
    if (!student) return res.status(404).json({ error: "Student not found" });
    
    if (classId) student.class = classId;
    if (roll_number) student.roll_number = roll_number;
    await student.save();

    if (username || email) {
        await User.findByIdAndUpdate(student.user, { username, email });
    }
    res.status(200).json({ success: true, message: "Updated" });
};

export const deleteStudent = async (req, res) => {
    const student = await Student.findOneAndDelete({ _id: req.params.id, ...getCollegeFilter(req) });
    if (!student) return res.status(404).json({ error: "Student not found" });
    await User.findByIdAndDelete(student.user);
    res.status(200).json({ success: true, message: "Deleted" });
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
