import Department from "../models/department.js";
import Class from "../models/class.js";
import Student from "../models/student.js";
import Teacher from "../models/teacher.js";
import User from "../models/user.js";
import Attendance from "../models/attendance.js";
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

export const getDepartment = async (req, res) => {
    const dept = await Department.findOne({ _id: req.params.id, ...getCollegeFilter(req) }).populate('classes');
    if (!dept) return res.status(404).json({ error: "Not found" });
    res.status(200).json({ success: true, data: dept });
};

export const createDepartment = async (req, res) => {
    const { name, description, collegeId, classes } = req.body;
    const targetCollegeId = req.user.role === 'Principal' ? req.user.collegeId : collegeId;
    if (!isActionAllowed(req, targetCollegeId)) return res.status(403).json({ error: "Access Denied to this college" });
    
    const maxDept = await Department.create({ name, description, collegeId: targetCollegeId, classes: classes || [] });
    // Update classes to point to this dept
    if (classes && classes.length > 0) {
        await Class.updateMany({ _id: { $in: classes } }, { departmentId: maxDept._id });
    }
    res.status(201).json({ success: true, data: maxDept });
};

export const updateDepartment = async (req, res) => {
    const { classes, ...rest } = req.body;
    const dept = await Department.findOneAndUpdate({ _id: req.params.id, ...getCollegeFilter(req) }, { ...rest, classes: classes || [] }, { new: true });
    if (!dept) return res.status(404).json({ error: "Department not found" });
    
    if (classes && classes.length > 0) {
        // Clear previous references not in the new array (optional, but good for completeness)
        await Class.updateMany({ departmentId: dept._id, _id: { $nin: classes } }, { $unset: { departmentId: 1 } });
        // Set new references
        await Class.updateMany({ _id: { $in: classes } }, { departmentId: dept._id });
    } else if (classes) {
        await Class.updateMany({ departmentId: dept._id }, { $unset: { departmentId: 1 } });
    }
    
    res.status(200).json({ success: true, data: dept });
};

export const deleteDepartment = async (req, res) => {
    const dept = await Department.findOneAndDelete({ _id: req.params.id, ...getCollegeFilter(req) });
    if (!dept) return res.status(404).json({ error: "Department not found" });
    await Class.updateMany({ departmentId: dept._id }, { $unset: { departmentId: 1 } });
    res.status(200).json({ success: true, message: "Deleted successfully" });
};

// CLASSES
export const getClasses = async (req, res) => {
    const classes = await Class.find(getCollegeFilter(req)).populate('departmentId');
    res.status(200).json({ success: true, data: classes });
};

export const getClass = async (req, res) => {
    const c = await Class.findOne({ _id: req.params.id, ...getCollegeFilter(req) }).populate('departmentId');
    if (!c) return res.status(404).json({ error: "Not found" });
    res.status(200).json({ success: true, data: c });
};

export const createClass = async (req, res) => {
    const { name, departmentId, collegeId } = req.body;
    const targetCollegeId = req.user.role === 'Principal' ? req.user.collegeId : collegeId;
    if (!isActionAllowed(req, targetCollegeId)) return res.status(403).json({ error: "Access Denied" });
    
    const newClass = await Class.create({ name, departmentId: departmentId || null, collegeId: targetCollegeId });
    if (departmentId) {
        await Department.findByIdAndUpdate(departmentId, { $addToSet: { classes: newClass._id } });
    }
    res.status(201).json({ success: true, data: newClass });
};

export const updateClass = async (req, res) => {
    const { departmentId, ...rest } = req.body;
    const c = await Class.findOneAndUpdate({ _id: req.params.id, ...getCollegeFilter(req) }, { ...rest, departmentId: departmentId || null }, { new: false });
    if (!c) return res.status(404).json({ error: "Class not found" });
    
    // Sync old dept 
    if (c.departmentId && String(c.departmentId) !== String(departmentId)) {
        await Department.findByIdAndUpdate(c.departmentId, { $pull: { classes: c._id } });
    }
    // Sync new dept
    if (departmentId && String(c.departmentId) !== String(departmentId)) {
        await Department.findByIdAndUpdate(departmentId, { $addToSet: { classes: c._id } });
    }
    
    res.status(200).json({ success: true, data: await Class.findById(c._id) });
};

export const deleteClass = async (req, res) => {
    const c = await Class.findOneAndDelete({ _id: req.params.id, ...getCollegeFilter(req) });
    if (!c) return res.status(404).json({ error: "Class not found" });
    res.status(200).json({ success: true, message: "Deleted" });
};

// TEACHERS
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

// STUDENTS
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

// ATTENDANCE
export const markAttendance = async (req, res) => {
    const { classId, date, records } = req.body;
    if (!classId || !date || !records) return res.status(400).json({ error: "Missing required fields" });

    const classObj = await Class.findById(classId);
    if (!classObj) return res.status(404).json({ error: "Class not found" });
    
    const targetCollegeId = String(classObj.collegeId);
    if (req.user.role !== 'Admin') {
        const hasAccess = req.user.role === 'Manager' 
            ? req.user.assignedColleges.some(id => String(id) === targetCollegeId)
            : String(req.user.collegeId) === targetCollegeId;
            
        if (!hasAccess) return res.status(403).json({ error: "Access Denied" });
    }

    if (req.user.role === 'Teacher') {
        const teacher = await Teacher.findOne({ user: req.user._id });
        if (teacher) {
            let validClassIds = teacher.classes.map(id => String(id));
            if (teacher.departments && teacher.departments.length > 0) {
                const classesInDepts = await Class.find({ departmentId: { $in: teacher.departments } }).select('_id');
                validClassIds.push(...classesInDepts.map(c => String(c._id)));
            }
            if (!validClassIds.includes(String(classId))) {
                return res.status(403).json({ error: "Access Denied: You are not assigned to this class" });
            }
        }
    }

    const operations = records.map(record => ({
        updateOne: {
            filter: { classId, studentId: record.studentId, date: new Date(date) },
            update: { $set: { status: record.status, collegeId: classObj.collegeId } },
            upsert: true
        }
    }));

    if (operations.length > 0) {
        await Attendance.bulkWrite(operations);
    }

    res.status(200).json({ success: true, message: "Attendance marked successfully" });
};

export const queryAttendance = async (req, res) => {
    const { classId, date } = req.query;
    if (!classId || !date) return res.status(400).json({ error: "classId and date query parameters are required" });

    const attendanceRecords = await Attendance.find({ classId, date: new Date(date) });
    res.status(200).json({ success: true, data: attendanceRecords });
};
