import express from "express";
const router = express.Router();
import * as trackingController from "../controller/teacherTracking.js";
import wrapAsync from "../utils/wrapAsync.js";
import { isloggedIn } from "../Validators/isAthen.js";

// Step 3: High-Frequency Operational Logic
router.put("/update-bi-weekly-report", isloggedIn, wrapAsync(trackingController.updateBiWeeklyReport));
// Future extensions can have attendance endpoints similarly
router.put("/update-attendance", isloggedIn, wrapAsync(trackingController.updateAttendance));

export default router;
