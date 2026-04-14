import Exam from "../models/exam.js";
import Class from "../models/class.js";
import Student from "../models/student.js";
import { invalidateInsightsCache } from "./insights.js";

export const createExam = async (req, res) => {
  // Only Admin, Manager, Principal should be able to do this. We assume middleware or implicit trust for now based on role.
  if (['Student', 'Teacher'].includes(req.user.role)) {
    return res.status(403).json({ error: "Unauthorized role for creating exams" });
  }

  const { name, classIds, subjectId, date } = req.body;
  const collegeId = req.collegeId;

  // Initialize empty results array for all students in the selected classes
  const students = await Student.find({ classId: { $in: classIds }, collegeId });
  const results = students.map(student => ({
    studentId: student._id,
    marksObtained: 0,
    totalMarks: 100, // default editable
    remarks: ""
  }));

  const newExam = await Exam.create({
    name,
    collegeId,
    classIds,
    subjectId,
    date,
    results
  });

  res.status(201).json({ success: true, exam: newExam });
};

export const manageResults = async (req, res) => {
  const { examId } = req.params;
  const { studentResults } = req.body; // Array of { studentId, marksObtained, totalMarks, remarks }
  const collegeId = req.collegeId;

  // Role validation
  if (req.user.role === 'Student') {
    return res.status(403).json({ error: "Students cannot manage results" });
  }

  const exam = await Exam.findOne({ _id: examId, collegeId });
  if (!exam) return res.status(404).json({ error: "Exam not found" });

  // Update logic: Loop through payload and update the array
  studentResults.forEach(update => {
    const existingResult = exam.results.find(r => String(r.studentId) === String(update.studentId));
    if (existingResult) {
      existingResult.marksObtained = update.marksObtained;
      if (update.totalMarks !== undefined) existingResult.totalMarks = update.totalMarks;
      if (update.remarks !== undefined) existingResult.remarks = update.remarks;
    }
  });

  await exam.save();

  // Invalidate Redis Cache when new Exam result is published (Step 6)
  await invalidateInsightsCache(collegeId);

  res.status(200).json({ success: true, exam });
};
