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
router.post("/departments", isloggedIn, wrapAsync(academicController.createDepartment));
router.put("/departments/:id", isloggedIn, wrapAsync(academicController.updateDepartment));
router.delete("/departments/:id", isloggedIn, wrapAsync(academicController.deleteDepartment));

// Classes
router.get("/classes", isloggedIn, wrapAsync(academicController.getClasses));
router.post("/classes", isloggedIn, wrapAsync(academicController.createClass));
router.put("/classes/:id", isloggedIn, wrapAsync(academicController.updateClass));
router.delete("/classes/:id", isloggedIn, wrapAsync(academicController.deleteClass));

// Teachers
router.get("/teachers", isloggedIn, wrapAsync(academicController.getTeachers));
router.post("/teachers", isloggedIn, wrapAsync(academicController.createTeacher));
// (update/delete can be added later if needed)

// Students
router.get("/students", isloggedIn, wrapAsync(academicController.getStudents));
router.post("/students", isloggedIn, wrapAsync(academicController.createStudent));

export default router;
