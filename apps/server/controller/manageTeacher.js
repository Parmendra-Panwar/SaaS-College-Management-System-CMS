import Teacher from "../models/teacher.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import { getCollegeFilter, isActionAllowed } from "../utils/helpers.js";

export const getTeacher = async (req, res) => {
    const teacher = await Teacher.findOne({ _id: req.params.id, ...getCollegeFilter(req) })
        .populate({ path: 'user', select: '-password' })
        .populate('departments')
        .populate('classes');
    if (!teacher) return res.status(404).json({ error: "Not found" });
    res.status(200).json({ success: true, data: teacher });
};

export const getTeachers = async (req, res) => {
    const teachers = await Teacher.find(getCollegeFilter(req))
        .populate({ path: 'user', select: '-password' })
        .populate('departments')
        .populate('classes');
    res.status(200).json({ success: true, data: teachers });
};

export const createTeacher = async (req, res) => {
    const { username, email, level, collegeId, departments, classes } = req.body;
    const targetCollegeId = req.user.role === 'Principal' ? req.user.collegeId : collegeId;
    if (!isActionAllowed(req, targetCollegeId)) return res.status(403).json({ error: "Access Denied" });

    const rawPassword = "Teacher@123";
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    
    const user = await User.create({ username, email, password: hashedPassword, tempPassword: rawPassword, role: 'Teacher', collegeId: targetCollegeId });
    const teacher = await Teacher.create({ 
        user: user._id, 
        collegeId: targetCollegeId, 
        level: level || 1,
        departments: departments || [],
        classes: classes || []
    });
    
    res.status(201).json({ success: true, data: await teacher.populate([{ path: 'user', select: '-password' }, { path: 'departments' }, { path: 'classes' }]) });
};

export const updateTeacher = async (req, res) => {
    const { username, email, level, departments, classes } = req.body;
    const teacher = await Teacher.findOne({ _id: req.params.id, ...getCollegeFilter(req) });
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });
    
    if (level) teacher.level = level;
    if (departments) teacher.departments = departments;
    if (classes) teacher.classes = classes;
    await teacher.save();

    if (username || email) {
        await User.findByIdAndUpdate(teacher.user, { username, email });
    }
    res.status(200).json({ success: true, message: "Updated" });
};

export const deleteTeacher = async (req, res) => {
    const teacher = await Teacher.findOneAndDelete({ _id: req.params.id, ...getCollegeFilter(req) });
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });
    await User.findByIdAndDelete(teacher.user);
    res.status(200).json({ success: true, message: "Deleted" });
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

  const insertedTeachers = await Teacher.insertMany(teachersToInsert, { ordered: false });
  res.status(201).json({ success: true, count: insertedTeachers.length, data: insertedTeachers });
};
