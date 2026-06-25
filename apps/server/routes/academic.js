import express from "express";
const router = express.Router();
import multer from "multer";
import wrapAsync from "../utils/wrapAsync.js";
import { isloggedIn } from "../Validators/isAthen.js";
import { storage } from "../config/cloudConfig.js";

import * as manageCollegesController from "../controller/manageColleges.js";
import * as manageDepartmentController from "../controller/manageDepartment.js";
import * as manageClassesController from "../controller/manageClasses.js";
import * as manageTeacherController from "../controller/manageTeacher.js";
import * as manageStudentController from "../controller/manageStudent.js";
import * as manageSubjectController from "../controller/manageSubject.js";
import * as manageAttendanceController from "../controller/manageAttendance.js";
import * as manageFeesController from "../controller/manageFees.js";
import * as manageReportController from "../controller/manageReport.js";

const upload = multer({ storage });

// Admin, Manager, and Principal can manage these.

// General
router.get("/accessible-colleges", isloggedIn, wrapAsync(manageCollegesController.getAccessibleColleges));

// Departments
router.get("/departments", isloggedIn, wrapAsync(manageDepartmentController.getDepartments));
router.get("/departments/:id", isloggedIn, wrapAsync(manageDepartmentController.getDepartment));
router.post("/departments", isloggedIn, wrapAsync(manageDepartmentController.createDepartment));
router.put("/departments/:id", isloggedIn, wrapAsync(manageDepartmentController.updateDepartment));
router.delete("/departments/:id", isloggedIn, wrapAsync(manageDepartmentController.deleteDepartment));

// Classes
router.get("/classes", isloggedIn, wrapAsync(manageClassesController.getClasses));
router.get("/classes/:id", isloggedIn, wrapAsync(manageClassesController.getClass));
router.post("/classes", isloggedIn, wrapAsync(manageClassesController.createClass));
router.put("/classes/:id", isloggedIn, wrapAsync(manageClassesController.updateClass));
router.delete("/classes/:id", isloggedIn, wrapAsync(manageClassesController.deleteClass));

// Subjects
router.get("/subjects", isloggedIn, wrapAsync(manageSubjectController.getSubjects));
router.get("/subjects/:id", isloggedIn, wrapAsync(manageSubjectController.getSubject));
router.post("/subjects", isloggedIn, wrapAsync(manageSubjectController.createSubject));
router.put("/subjects/:id", isloggedIn, wrapAsync(manageSubjectController.updateSubject));
router.delete("/subjects/:id", isloggedIn, wrapAsync(manageSubjectController.deleteSubject));

// Teachers
router.get("/teachers", isloggedIn, wrapAsync(manageTeacherController.getTeachers));
router.get("/teachers/:id", isloggedIn, wrapAsync(manageTeacherController.getTeacher));
router.post("/teachers", isloggedIn, wrapAsync(manageTeacherController.createTeacher));
router.put("/teachers/:id", isloggedIn, wrapAsync(manageTeacherController.updateTeacher));
router.delete("/teachers/:id", isloggedIn, wrapAsync(manageTeacherController.deleteTeacher));

// Students
router.get("/students", isloggedIn, wrapAsync(manageStudentController.getStudents));
router.get("/students/:id", isloggedIn, wrapAsync(manageStudentController.getStudent));
router.post("/students", isloggedIn, wrapAsync(manageStudentController.createStudent));
router.put("/students/:id", isloggedIn, wrapAsync(manageStudentController.updateStudent));
router.delete("/students/:id", isloggedIn, wrapAsync(manageStudentController.deleteStudent));

// Attendance
router.post("/attendance/mark", isloggedIn, wrapAsync(manageAttendanceController.markAttendance));
router.get("/attendance/query", isloggedIn, wrapAsync(manageAttendanceController.queryAttendance));

// Fees
router.get("/fees/class/:classId", isloggedIn, wrapAsync(manageFeesController.getClassFee));
router.post("/fees/class", isloggedIn, wrapAsync(manageFeesController.setClassFee));
router.get("/fees/students", isloggedIn, wrapAsync(manageFeesController.getStudentFees));
router.post("/fees/student/:studentId/transaction", isloggedIn, wrapAsync(manageFeesController.addFeeTransaction));

// Bi-Weekly Reports
router.get("/reports",     isloggedIn, wrapAsync(manageReportController.getReports));
router.get("/reports/:id", isloggedIn, wrapAsync(manageReportController.getReport));
router.post("/reports",    isloggedIn, upload.single('attachment'), wrapAsync(manageReportController.createReport));
router.put("/reports/:id", isloggedIn, upload.single('attachment'), wrapAsync(manageReportController.updateReport));
router.delete("/reports/:id", isloggedIn, wrapAsync(manageReportController.deleteReport));

export default router;
