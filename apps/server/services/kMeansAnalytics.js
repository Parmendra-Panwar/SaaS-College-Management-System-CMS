import Student from "../models/student.js";
import Exam from "../models/exam.js";
import cron from "node-cron";

// K-Means implementation to minimize: J = sum( || x_i - c_j ||^2 )
function kMeans(data, k = 3, maxIterations = 100) {
  if (data.length === 0) return [];

  // Initialize centroids randomly from data points
  let centroids = [];
  for (let i = 0; i < k; i++) {
    centroids.push([...data[Math.floor(Math.random() * data.length)].features]);
  }

  let clusters = [];

  for (let iter = 0; iter < maxIterations; iter++) {
    clusters = Array.from({ length: k }, () => []);

    // Assignment Step
    for (const point of data) {
      let minDistance = Infinity;
      let closestCentroidParams = -1;

      for (let j = 0; j < k; j++) {
        const c = centroids[j];
        // || x_i - c_j ||^2
        const distance = point.features.reduce((sum, val, idx) => sum + Math.pow(val - c[idx], 2), 0);

        if (distance < minDistance) {
          minDistance = distance;
          closestCentroidParams = j;
        }
      }
      point.clusterIdx = closestCentroidParams;
      clusters[closestCentroidParams].push(point);
    }

    // Update Step
    let newCentroids = [];
    let hasChanged = false;

    for (let j = 0; j < k; j++) {
      if (clusters[j].length > 0) {
        const newCentroid = [0, 0, 0];
        for (const p of clusters[j]) {
          newCentroid[0] += p.features[0];
          newCentroid[1] += p.features[1];
          newCentroid[2] += p.features[2];
        }
        newCentroid[0] /= clusters[j].length;
        newCentroid[1] /= clusters[j].length;
        newCentroid[2] /= clusters[j].length;

        // Check if centroid moved
        if (
          Math.abs(newCentroid[0] - centroids[j][0]) > 0.001 ||
          Math.abs(newCentroid[1] - centroids[j][1]) > 0.001 ||
          Math.abs(newCentroid[2] - centroids[j][2]) > 0.001
        ) {
          hasChanged = true;
        }
        newCentroids.push(newCentroid);
      } else {
        newCentroids.push(centroids[j]); // Fallback if empty cluster
      }
    }

    centroids = newCentroids;
    if (!hasChanged) break; // Converged
  }

  // Label clusters by sum of centroid features (Highest -> High Achiever, Lowest -> At-Risk)
  const centroidSums = centroids.map((c, i) => ({ idx: i, sum: c[0] + c[1] + c[2] }));
  centroidSums.sort((a, b) => b.sum - a.sum);

  const clusterLabelsMap = {};
  if (k === 3) {
    clusterLabelsMap[centroidSums[0].idx] = 'High Achiever';
    clusterLabelsMap[centroidSums[1].idx] = 'Consistent';
    clusterLabelsMap[centroidSums[2].idx] = 'At-Risk';
  }

  // Assign final labels back to data points
  for (const point of data) {
    point.clusterId = clusterLabelsMap[point.clusterIdx] || 'Uncategorized';
  }

  return data;
}

const runKMeansClustering = async (collegeId) => {

  const students = await Student.find({ collegeId });
  if (!students.length) return;

  const exams = await Exam.find({ collegeId });

  const dataPoints = students.map(student => {
    // 1. Attendance Rate
    let totalPeriods = 91 * 4;
    let attended = 0;
    student.attendance.forEach(day => {
      day.forEach(period => { if (period) attended++; });
    });
    const attendanceRate = attended / totalPeriods; // 0 to 1

    // 2. Work Score
    const totalWorkScore = student.workReport.reduce((sum, score) => sum + score, 0);
    const workScore = totalWorkScore / (26 * 100); // Assuming score is out of 100. Normalize to 0-1.

    // 3. Exam Marks
    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    exams.forEach(exam => {
      const studentResult = exam.results.find(r => String(r.studentId) === String(student._id));
      if (studentResult) {
        totalMarksObtained += studentResult.marksObtained;
        totalMaxMarks += studentResult.totalMarks;
      }
    });
    const examMarksRate = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) : 0; // 0 to 1

    return {
      studentId: student._id,
      features: [attendanceRate, workScore, examMarksRate]
    };
  });

  // Run Clustering
  const clusteredData = kMeans(dataPoints, 3);

  // Update Students
  const bulkOps = clusteredData.map(d => ({
    updateOne: {
      filter: { _id: d.studentId, collegeId },
      update: { $set: { clusterId: d.clusterId } }
    }
  }));

  await Student.bulkWrite(bulkOps);
};

// Start Bi-Weekly Cron Job (Runs every 14 days)
export const initCronJobs = () => {
  cron.schedule("0 0 */14 * *", async () => {
    // In a multi-tenant system, we iterate through all distinct colleges
    const colleges = await Student.distinct("collegeId");
    for (const collegeId of colleges) {
      await runKMeansClustering(collegeId);
    }
  });
};
