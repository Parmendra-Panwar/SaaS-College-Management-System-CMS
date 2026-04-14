import Student from "../models/student.js";
import Teacher from "../models/teacher.js";

export const updateBiWeeklyReport = async (req, res) => {
  const { studentId, biWeekIndex, score } = req.body; 
  // biWeekIndex: 0 to 25 mapping to the 26-size array
  const collegeId = req.collegeId;

  if (biWeekIndex < 0 || biWeekIndex > 25) {
    return res.status(400).json({ error: "Invalid bi-week index. Must be between 0 and 25." });
  }

  // Use MongoDB positional operators ($set) to update specific array indices
  const updateKey = `workReport.${biWeekIndex}`;

  const updatedStudent = await Student.findOneAndUpdate(
    { _id: studentId, collegeId },
    { $set: { [updateKey]: score } },
    { new: true }
  );

  if (!updatedStudent) {
    return res.status(404).json({ error: "Student not found" });
  }

  // Fetch teacher from req.user
  if (req.user.role === 'Teacher') {
    const teacherId = req.user.teacherProfile;
    if (teacherId) {
      // Increment workCount to track teacher performance
      await Teacher.findByIdAndUpdate(teacherId, { $inc: { workCount: 1 } });
    }
  }

  res.status(200).json({ success: true, message: "Report updated successfully", data: updatedStudent });
};

export const updateAttendance = async (req, res) => {
  const { studentId, dayIndex, periodIndex, isPresent } = req.body;
  // dayIndex: 0 to 90, periodIndex: 0 to 3
  const collegeId = req.collegeId;

  const updateKey = `attendance.${dayIndex}.${periodIndex}`;

  const updatedStudent = await Student.findOneAndUpdate(
    { _id: studentId, collegeId },
    { $set: { [updateKey]: isPresent } },
    { new: true }
  );

  res.status(200).json({ success: true, data: updatedStudent });
};
