import Student from "../models/student.js";
import Exam from "../models/exam.js";
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
  console.log(`Cache invalidated for college: ${collegeId}`);
};
