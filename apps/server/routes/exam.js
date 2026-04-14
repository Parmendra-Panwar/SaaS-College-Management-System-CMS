import express from "express";
const router = express.Router();

import * as examController from "../controller/exam.js";
import wrapAsync from "../utils/wrapAsync.js";
import { isloggedIn } from "../Validators/isAthen.js";

// Step 4: Exam Management API
router.post("/create", isloggedIn, wrapAsync(examController.createExam));
router.put("/:examId/results", isloggedIn, wrapAsync(examController.manageResults));

export default router;
