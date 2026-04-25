import Report from "../models/report.js";
import Student from "../models/student.js";
import Class from "../models/class.js";
import Teacher from "../models/teacher.js";
import { cloudinary } from "../config/cloudConfig.js";
import { getCollegeFilter } from "../utils/helpers.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Verify the requesting user has access to the target college.
 * Mirrors the same guard used in manageAttendance.js.
 */
const verifyCollegeAccess = (req, targetCollegeId) => {
    if (req.user.role === 'Admin') return true;
    if (req.user.role === 'Manager') {
        return req.user.assignedColleges.some(id => String(id) === String(targetCollegeId));
    }
    return String(req.user.collegeId) === String(targetCollegeId);
};

/**
 * For Teacher role: ensure the classId is one of their assigned classes/departments.
 */
const verifyTeacherClassAccess = async (req, classId) => {
    if (req.user.role !== 'Teacher') return true;
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) return false;

    let validClassIds = (teacher.classes || []).map(String);
    if (teacher.departments && teacher.departments.length > 0) {
        const deptClasses = await Class.find({ departmentId: { $in: teacher.departments } }).select('_id');
        validClassIds.push(...deptClasses.map(c => String(c._id)));
    }
    return validClassIds.includes(String(classId));
};

/**
 * Upload a file buffer to Cloudinary.
 * Returns the secure URL or null if no file was provided.
 */
const uploadToCloudinary = (buffer, mimetype) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "cms/reports", resource_type: "auto" },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        stream.end(buffer);
    });
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * GET /academic/reports
 * Query params: collegeId, classId, studentId, periodIndex
 * Returns all reports the caller is allowed to see.
 */
export const getReports = async (req, res) => {
    const filter = {};

    // Admin sees everything; others are scoped to their college(s)
    if (req.user.role === 'Manager') {
        filter.collegeId = { $in: req.user.assignedColleges };
    } else if (req.user.role !== 'Admin') {
        filter.collegeId = req.user.collegeId;
    }

    // Optional query filters
    if (req.query.collegeId) {
        // Admin/Manager can further narrow by collegeId
        if (req.user.role === 'Manager' &&
            !req.user.assignedColleges.map(String).includes(String(req.query.collegeId))) {
            return res.status(403).json({ error: "Access Denied" });
        }
        filter.collegeId = req.query.collegeId;
    }
    if (req.query.classId)    filter.classId    = req.query.classId;
    if (req.query.studentId)  filter.studentId  = req.query.studentId;
    if (req.query.periodIndex) filter.periodIndex = Number(req.query.periodIndex);

    // Teacher: limit to their classes only
    if (req.user.role === 'Teacher') {
        const teacher = await Teacher.findOne({ user: req.user._id });
        if (teacher) {
            let validClassIds = (teacher.classes || []).map(String);
            if (teacher.departments && teacher.departments.length > 0) {
                const deptClasses = await Class.find({ departmentId: { $in: teacher.departments } }).select('_id');
                validClassIds.push(...deptClasses.map(c => String(c._id)));
            }
            if (req.query.classId) {
                if (!validClassIds.includes(String(req.query.classId))) {
                    return res.status(200).json({ success: true, data: [] });
                }
            } else {
                filter.classId = { $in: validClassIds };
            }
        }
    }

    const reports = await Report.find(filter)
        .populate({ path: 'studentId', select: 'roll_number user', populate: { path: 'user', select: 'username email' } })
        .populate('classId', 'name')
        .populate('submittedBy', 'username role')
        .sort({ periodIndex: 1, createdAt: -1 });

    res.status(200).json({ success: true, data: reports });
};

/**
 * GET /academic/reports/:id
 */
export const getReport = async (req, res) => {
    const report = await Report.findById(req.params.id)
        .populate({ path: 'studentId', select: 'roll_number user', populate: { path: 'user', select: 'username email' } })
        .populate('classId', 'name')
        .populate('submittedBy', 'username role');

    if (!report) return res.status(404).json({ error: "Report not found" });

    if (!verifyCollegeAccess(req, report.collegeId)) {
        return res.status(403).json({ error: "Access Denied" });
    }
    res.status(200).json({ success: true, data: report });
};

/**
 * POST /academic/reports
 * Body (multipart/form-data): studentId, classId, periodIndex, topic, description, [attachment]
 */
export const createReport = async (req, res) => {
    const { studentId, classId, periodIndex, topic, description } = req.body;

    if (!studentId || !classId || !periodIndex || !topic || !description) {
        return res.status(400).json({ error: "studentId, classId, periodIndex, topic, and description are required" });
    }

    const parsedPeriod = Number(periodIndex);
    if (isNaN(parsedPeriod) || parsedPeriod < 1 || parsedPeriod > 26) {
        return res.status(400).json({ error: "periodIndex must be between 1 and 26" });
    }

    // Verify college access
    const classObj = await Class.findById(classId);
    if (!classObj) return res.status(404).json({ error: "Class not found" });

    if (!verifyCollegeAccess(req, classObj.collegeId)) {
        return res.status(403).json({ error: "Access Denied" });
    }
    if (!(await verifyTeacherClassAccess(req, classId))) {
        return res.status(403).json({ error: "Access Denied: You are not assigned to this class" });
    }

    // Upload attachment if provided
    let attachmentUrl = null;
    if (req.file) {
        attachmentUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    }

    const report = await Report.create({
        studentId,
        classId,
        collegeId: classObj.collegeId,
        submittedBy: req.user._id,
        topic,
        description,
        attachmentUrl,
        periodIndex: parsedPeriod,
    });

    // Mark the period as submitted in the Student's reportStatus array (0-indexed)
    await Student.findByIdAndUpdate(studentId, {
        $set: { [`reportStatus.${parsedPeriod - 1}`]: true }
    });

    res.status(201).json({ success: true, data: report });
};

/**
 * PUT /academic/reports/:id
 * Body (multipart/form-data): topic, description, [attachment]
 */
export const updateReport = async (req, res) => {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    if (!verifyCollegeAccess(req, report.collegeId)) {
        return res.status(403).json({ error: "Access Denied" });
    }

    const { topic, description } = req.body;
    if (topic)       report.topic       = topic;
    if (description) report.description = description;

    // Replace attachment if a new file is uploaded
    if (req.file) {
        report.attachmentUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    }

    await report.save();
    res.status(200).json({ success: true, data: report });
};

/**
 * DELETE /academic/reports/:id
 */
export const deleteReport = async (req, res) => {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    if (!verifyCollegeAccess(req, report.collegeId)) {
        return res.status(403).json({ error: "Access Denied" });
    }

    await report.deleteOne();

    // Reset the reportStatus flag for this period (0-indexed)
    await Student.findByIdAndUpdate(report.studentId, {
        $set: { [`reportStatus.${report.periodIndex - 1}`]: false }
    });

    res.status(200).json({ success: true, message: "Report deleted" });
};
