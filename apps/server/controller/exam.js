import Exam from "../models/exam.js";
import Marksheet from "../models/marksheet.js";
import Student from "../models/student.js";
import { getCollegeFilter, isActionAllowed } from "../utils/helpers.js";

export const createExam = async (req, res) => {
    // Only Admin, Manager, Principal should be able to do this.
    if (['Student', 'Teacher'].includes(req.user.role)) {
        return res.status(403).json({ error: "Unauthorized role for creating exams" });
    }

    const { name, classId, subjectsConfig, collegeId } = req.body;
    const targetCollegeId = req.user.role === 'Principal' ? req.user.collegeId : collegeId;

    if (!isActionAllowed(req, targetCollegeId)) return res.status(403).json({ error: "Access Denied" });

    if (!name || !classId || !subjectsConfig || !Array.isArray(subjectsConfig)) {
        return res.status(400).json({ error: "Invalid payload" });
    }

    // Validate Theory + Practical = 100
    for (let config of subjectsConfig) {
        if (Number(config.maxTheory) + Number(config.maxPractical) !== 100) {
            return res.status(400).json({ error: `Theory and Practical marks must sum to 100 for subject ID: ${config.subjectId}` });
        }
    }

    const newExam = await Exam.create({
        name,
        collegeId: targetCollegeId,
        classId,
        subjectsConfig
    });

    // Create empty marksheets for all active students in the class
    const students = await Student.find({ class: classId, collegeId: targetCollegeId });
    if (students.length > 0) {
        const marksheetsToInsert = students.map(student => {
            const marks = subjectsConfig.map(config => ({
                subjectId: config.subjectId,
                theoryMarks: null,
                practicalMarks: null
            }));
            return {
                examId: newExam._id,
                studentId: student._id,
                classId,
                collegeId: targetCollegeId,
                marks
            };
        });
        await Marksheet.insertMany(marksheetsToInsert);
    }

    const populatedExam = await Exam.findById(newExam._id)
        .populate('classId')
        .populate('subjectsConfig.subjectId');

    res.status(201).json({ success: true, data: populatedExam });
};

export const getExams = async (req, res) => {
    let filter = getCollegeFilter(req);

    if (req.user.role === 'Admin' || req.user.role === 'Manager') {
        if (req.query.collegeId) {
            if (req.user.role === 'Manager' && !req.user.assignedColleges.map(String).includes(String(req.query.collegeId))) {
                return res.status(403).json({ error: "Access Denied" });
            }
            filter.collegeId = req.query.collegeId;
        } else {
            return res.status(200).json({ success: true, data: [] });
        }
    }

    if (req.query.classId) {
        filter.classId = req.query.classId;
    }

    const exams = await Exam.find(filter)
        .populate('classId')
        .populate('subjectsConfig.subjectId');
        
    res.status(200).json({ success: true, data: exams });
};

export const getExamMarksheets = async (req, res) => {
    const { examId } = req.params;
    let filter = getCollegeFilter(req);
    
    // Admins and Managers might not have collegeId attached without query, but getCollegeFilter handles implicit mapping.
    
    const exam = await Exam.findOne({ _id: examId });
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    // Validate if the user is allowed to access this college's data
    if (!isActionAllowed(req, exam.collegeId)) {
         return res.status(403).json({ error: "Access Denied" });
    }

    const marksheets = await Marksheet.find({ examId })
        .populate('studentId')
        .populate('marks.subjectId');

    res.status(200).json({ success: true, data: marksheets, exam });
};

export const bulkUpdateMarksheets = async (req, res) => {
    const { examId } = req.params;
    const { marksheets } = req.body; // Array of { marksheetId, marks: [{ subjectId, theoryMarks, practicalMarks }] }

    if (!Array.isArray(marksheets)) {
        return res.status(400).json({ error: "Invalid payload format" });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    if (!isActionAllowed(req, exam.collegeId)) {
        return res.status(403).json({ error: "Access Denied" });
    }

    // Build a map of subject max marks for validation
    const maxMarksMap = {};
    exam.subjectsConfig.forEach(config => {
        maxMarksMap[String(config.subjectId)] = {
            maxTheory: config.maxTheory,
            maxPractical: config.maxPractical
        };
    });

    const bulkOps = [];

    for (let sheet of marksheets) {
        // Validate individual marks against config
        let validMarks = [];
        for (let m of sheet.marks) {
            const config = maxMarksMap[String(m.subjectId)];
            if (!config) continue; // Subject not in exam
            
            // Allow null/empty
            const t = m.theoryMarks === "" ? null : m.theoryMarks;
            const p = m.practicalMarks === "" ? null : m.practicalMarks;

            if (t !== null && t > config.maxTheory) {
                return res.status(400).json({ error: `Theory marks exceed max limit for a subject.` });
            }
            if (p !== null && p > config.maxPractical) {
                return res.status(400).json({ error: `Practical marks exceed max limit for a subject.` });
            }
            validMarks.push({ subjectId: m.subjectId, theoryMarks: t, practicalMarks: p });
        }

        bulkOps.push({
            updateOne: {
                filter: { _id: sheet.marksheetId, examId },
                update: { $set: { marks: validMarks } }
            }
        });
    }

    if (bulkOps.length > 0) {
        await Marksheet.bulkWrite(bulkOps);
    }

    res.status(200).json({ success: true, message: "Bulk update successful" });
};
