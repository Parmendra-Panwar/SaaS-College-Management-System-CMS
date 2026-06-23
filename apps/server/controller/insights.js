import Student from "../models/student.js";
import Exam from "../models/exam.js";
import Attendance from "../models/attendance.js";
import redisClient from "../config/redis.js";

export const getDashboardInsights = async (req, res) => {
  const collegeId = req.collegeId;
  const cacheKey = `dashboard_insights_${collegeId}`; // Tenant-aware cache key

  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    return res.status(200).json({ success: true, source: 'cache', data: JSON.parse(cachedData) });
  }

  // Heavy Aggregation
  const totalStudents = await Student.countDocuments({ collegeId });
  const highAchievers = await Student.countDocuments({ collegeId, clusterId: 'High Achiever' });
  const consistent = await Student.countDocuments({ collegeId, clusterId: 'Consistent' });
  const atRisk = await Student.countDocuments({ collegeId, clusterId: 'At-Risk' });

  const data = {
    totalStudents,
    distribution: {
      highAchievers,
      consistent,
      atRisk
    }
  };

  await redisClient.set(cacheKey, JSON.stringify(data), "EX", 14 * 24 * 60 * 60);

  res.status(200).json({ success: true, source: 'db', data });
};

export const getTopStudents = async (req, res) => {
  const collegeId = req.collegeId;
  const cacheKey = `top_students_${collegeId}`;

  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    return res.status(200).json({ success: true, source: 'cache', data: JSON.parse(cachedData) });
  }

  const students = await Student.find({ collegeId, clusterId: 'High Achiever' })
    .populate('user', 'username email')
    .limit(50);

  await redisClient.set(cacheKey, JSON.stringify(students), "EX", 14 * 24 * 60 * 60);

  res.status(200).json({ success: true, source: 'db', data: students });
};

export const invalidateInsightsCache = async (collegeId) => {
  await redisClient.del(`dashboard_insights_${collegeId}`);
  await redisClient.del(`top_students_${collegeId}`);
};


import { getCollegeFilter } from "../utils/helpers.js";

export const getProductivityByClass = async (req, res) => {
  const { classId } = req.params;
  const filter = getCollegeFilter(req);

  // Session start logic: August 1st
  const now = new Date();
  const currentYear = now.getFullYear();
  const sessionYear = now.getMonth() >= 7 ? currentYear : currentYear - 1;
  const sessionStart = new Date(Date.UTC(sessionYear, 7, 1)); // August 1st

  // Calculate total days elapsed
  const msInDay = 1000 * 60 * 60 * 24;
  const totalDaysElapsed = Math.max(1, Math.floor((now - sessionStart) / msInDay));
  const expectedReports = Math.floor(totalDaysElapsed / 14);

  // Fetch students in class
  const students = await Student.find({ class: classId, ...filter }).populate('user', 'username');

  // Fetch all attendance for this class since session start
  const attendanceRecords = await Attendance.find({
    classId,
    ...filter,
    date: { $gte: sessionStart, $lte: now }
  });

  // Pre-calculate attendance per student
  const studentAttendanceCount = {};
  attendanceRecords.forEach(record => {
    record.records.forEach(r => {
      if (r.status === 'Present') {
        studentAttendanceCount[r.studentId] = (studentAttendanceCount[r.studentId] || 0) + 1;
      }
    });
  });

  const productivityData = students.map(student => {
    const actualDaysPresent = studentAttendanceCount[student._id] || 0;
    const actualReports = student.reportStatus.slice(0, expectedReports).filter(Boolean).length;

    // Score calculation
    const attendanceScore = Math.min(100, (actualDaysPresent / totalDaysElapsed) * 100);
    const reportScore = expectedReports > 0 ? Math.min(100, (actualReports / expectedReports) * 100) : 100;

    const overallScore = Math.round((attendanceScore * 0.5) + (reportScore * 0.5));

    return {
      _id: student._id,
      name: student.user?.username || 'Unknown',
      roll_number: student.roll_number,
      score: overallScore,
      actualDaysPresent,
      totalDaysElapsed,
      actualReports,
      expectedReports
    };
  });

  res.status(200).json({ success: true, data: productivityData });
};
