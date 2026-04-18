import express from "express";
const router = express.Router();
import wrapAsync from "../utils/wrapAsync.js";
import { isloggedIn } from "../Validators/isAthen.js";
import * as academicController from "../controller/academic.js";

// Admin, Manager, and Principal can manage these.

// General
router.get("/accessible-colleges", isloggedIn, wrapAsync(academicController.getAccessibleColleges));

// Departments
router.get("/departments", isloggedIn, wrapAsync(academicController.getDepartments));
router.get("/departments/:id", isloggedIn, wrapAsync(academicController.getDepartment));
router.post("/departments", isloggedIn, wrapAsync(academicController.createDepartment));
router.put("/departments/:id", isloggedIn, wrapAsync(academicController.updateDepartment));
router.delete("/departments/:id", isloggedIn, wrapAsync(academicController.deleteDepartment));

// Classes
router.get("/classes", isloggedIn, wrapAsync(academicController.getClasses));
router.get("/classes/:id", isloggedIn, wrapAsync(academicController.getClass));
router.post("/classes", isloggedIn, wrapAsync(academicController.createClass));
router.put("/classes/:id", isloggedIn, wrapAsync(academicController.updateClass));
router.delete("/classes/:id", isloggedIn, wrapAsync(academicController.deleteClass));

// Teachers
router.get("/teachers", isloggedIn, wrapAsync(academicController.getTeachers));
router.get("/teachers/:id", isloggedIn, wrapAsync(academicController.getTeacher));
router.post("/teachers", isloggedIn, wrapAsync(academicController.createTeacher));
router.put("/teachers/:id", isloggedIn, wrapAsync(academicController.updateTeacher));
router.delete("/teachers/:id", isloggedIn, wrapAsync(academicController.deleteTeacher));

// Students
router.get("/students", isloggedIn, wrapAsync(academicController.getStudents));
router.get("/students/:id", isloggedIn, wrapAsync(academicController.getStudent));
router.post("/students", isloggedIn, wrapAsync(academicController.createStudent));
router.put("/students/:id", isloggedIn, wrapAsync(academicController.updateStudent));
router.delete("/students/:id", isloggedIn, wrapAsync(academicController.deleteStudent));

// Attendance
router.post("/attendance/mark", isloggedIn, wrapAsync(academicController.markAttendance));
router.get("/attendance/query", isloggedIn, wrapAsync(academicController.queryAttendance));

export default router;
