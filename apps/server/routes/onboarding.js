import express from "express";
const router = express.Router();

import * as onboardingController from "../controller/onboarding.js";
import wrapAsync from "../utils/wrapAsync.js";
import { isloggedIn } from "../Validators/isAthen.js";

// Step 2: Hierarchical Resource Onboarding APIs
router.post("/bulk-classes", isloggedIn, wrapAsync(onboardingController.bulkCreateClasses));
router.post("/bulk-subjects", isloggedIn, wrapAsync(onboardingController.bulkCreateSubjects));
router.post("/bulk-students", isloggedIn, wrapAsync(onboardingController.bulkCreateStudents));
router.put("/bulk-students", isloggedIn, wrapAsync(onboardingController.bulkEditStudents));

export default router;
