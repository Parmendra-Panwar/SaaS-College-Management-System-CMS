import Attendance from "../models/attendance.js";
import Class from "../models/class.js";
import Teacher from "../models/teacher.js";

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
