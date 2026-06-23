import express from "express";
const router = express.Router();
import wrapAsync from "../utils/wrapAsync.js";
import { isloggedIn } from "../Validators/isAthen.js";
import * as examController from "../controller/exam.js";

router.get("/", isloggedIn, wrapAsync(examController.getExams));
router.post("/create", isloggedIn, wrapAsync(examController.createExam));
router.get("/:examId/marksheets", isloggedIn, wrapAsync(examController.getExamMarksheets));
router.put("/:examId/marksheets/bulk", isloggedIn, wrapAsync(examController.bulkUpdateMarksheets));

export default router;
