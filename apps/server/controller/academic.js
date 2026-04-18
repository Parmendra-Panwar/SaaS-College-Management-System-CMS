import Department from "../models/department.js";
import Class from "../models/class.js";
import Student from "../models/student.js";
import Teacher from "../models/teacher.js";
import User from "../models/user.js";
import College from "../models/college.js";
import bcrypt from "bcryptjs";

// Helper for filtering by access level
const getCollegeFilter = (req) => {
    if (req.user.role === 'Admin') return {};
    if (req.user.role === 'Manager') return { collegeId: { $in: req.user.assignedColleges } };
    return { collegeId: req.user.collegeId };
};

export const getAccessibleColleges = async (req, res) => {
    let colleges = [];
    if (req.user.role === 'Admin') {
        colleges = await College.find().select('name _id');
    } else if (req.user.role === 'Manager') {
        colleges = await College.find({ _id: { $in: req.user.assignedColleges } }).select('name _id');
    } else if (req.user.role === 'Principal' || req.user.role === 'Teacher') {
        colleges = await College.find({ _id: req.user.collegeId }).select('name _id');
    }
    res.status(200).json({ success: true, data: colleges });
};

// Check if a specific user/college interaction is allowed
const isActionAllowed = (req, targetCollegeId) => {
    if (req.user.role === 'Admin') return true;
    if (req.user.role === 'Manager' && req.user.assignedColleges.includes(targetCollegeId)) return true;
    if ((req.user.role === 'Principal' || req.user.role === 'Teacher') && String(req.user.collegeId) === String(targetCollegeId)) return true;
    return false;
};

// DEPARTMENTS
export const getDepartments = async (req, res) => {
    const departments = await Department.find(getCollegeFilter(req));
    res.status(200).json({ success: true, data: departments });
};

export const createDepartment = async (req, res) => {
    const { name, description, collegeId } = req.body;
    const targetCollegeId = req.user.role === 'Principal' ? req.user.collegeId : collegeId;
    if (!isActionAllowed(req, targetCollegeId)) return res.status(403).json({ error: "Access Denied to this college" });
    
    const maxDept = await Department.create({ name, description, collegeId: targetCollegeId });
    res.status(201).json({ success: true, data: maxDept });
};

export const updateDepartment = async (req, res) => {
    const dept = await Department.findOneAndUpdate({ _id: req.params.id, ...getCollegeFilter(req) }, req.body, { new: true });
    if (!dept) return res.status(404).json({ error: "Department not found" });
    res.status(200).json({ success: true, data: dept });
};

export const deleteDepartment = async (req, res) => {
    const dept = await Department.findOneAndDelete({ _id: req.params.id, ...getCollegeFilter(req) });
    if (!dept) return res.status(404).json({ error: "Department not found" });
    res.status(200).json({ success: true, message: "Deleted successfully" });
};

// CLASSES
export const getClasses = async (req, res) => {
    const classes = await Class.find(getCollegeFilter(req)).populate('departmentId');
    res.status(200).json({ success: true, data: classes });
};

export const createClass = async (req, res) => {
    const { name, departmentId, collegeId } = req.body;
    const targetCollegeId = req.user.role === 'Principal' ? req.user.collegeId : collegeId;
    if (!isActionAllowed(req, targetCollegeId)) return res.status(403).json({ error: "Access Denied" });
    
    // departmentId is optional according to prompt
    const newClass = await Class.create({ name, departmentId: departmentId || null, collegeId: targetCollegeId });
    res.status(201).json({ success: true, data: newClass });
};

export const updateClass = async (req, res) => {
    const c = await Class.findOneAndUpdate({ _id: req.params.id, ...getCollegeFilter(req) }, req.body, { new: true });
    if (!c) return res.status(404).json({ error: "Class not found" });
    res.status(200).json({ success: true, data: c });
};

export const deleteClass = async (req, res) => {
    const c = await Class.findOneAndDelete({ _id: req.params.id, ...getCollegeFilter(req) });
    if (!c) return res.status(404).json({ error: "Class not found" });
    res.status(200).json({ success: true, message: "Deleted" });
};

// TEACHERS
export const getTeachers = async (req, res) => {
    const teachers = await Teacher.find(getCollegeFilter(req)).populate({ path: 'user', select: '-password' });
    res.status(200).json({ success: true, data: teachers });
};

export const createTeacher = async (req, res) => {
    const { username, email, level, collegeId } = req.body;
    const targetCollegeId = req.user.role === 'Principal' ? req.user.collegeId : collegeId;
    if (!isActionAllowed(req, targetCollegeId)) return res.status(403).json({ error: "Access Denied" });

    const rawPassword = "Teacher@123";
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    
    const user = await User.create({ username, email, password: hashedPassword, tempPassword: rawPassword, role: 'Teacher', collegeId: targetCollegeId });
    const teacher = await Teacher.create({ user: user._id, collegeId: targetCollegeId, level: level || 1 });
    
    res.status(201).json({ success: true, data: await teacher.populate({ path: 'user', select: '-password' }) });
};

// STUDENTS
export const getStudents = async (req, res) => {
    const students = await Student.find(getCollegeFilter(req)).populate({ path: 'user', select: '-password' }).populate('class');
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
