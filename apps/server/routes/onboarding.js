import express from "express";
const router = express.Router();

import * as manageCollegesRequestController from "../controller/manageCollegesRequest.js";
import * as manageClassesController from "../controller/manageClasses.js";
import * as manageStudentController from "../controller/manageStudent.js";
import * as manageTeacherController from "../controller/manageTeacher.js";

import wrapAsync from "../utils/wrapAsync.js";
import { isloggedIn } from "../Validators/isAthen.js";

// Step 1: Request College Onboarding
router.post("/request-college", wrapAsync(manageCollegesRequestController.requestCollege));

// Step 2: Hierarchical Resource Onboarding APIs
router.post("/bulk-classes", isloggedIn, wrapAsync(manageClassesController.bulkCreateClasses));
router.post("/bulk-subjects", isloggedIn, wrapAsync(manageClassesController.bulkCreateSubjects));
router.post("/bulk-students", isloggedIn, wrapAsync(manageStudentController.bulkCreateStudents));
router.post("/bulk-teachers", isloggedIn, wrapAsync(manageTeacherController.bulkCreateTeachers));
router.put("/bulk-students", isloggedIn, wrapAsync(manageStudentController.bulkEditStudents));

export default router;
