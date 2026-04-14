import express from "express";
const router = express.Router();
import * as insightsController from "../controller/insights.js";
import wrapAsync from "../utils/wrapAsync.js";
import { isloggedIn } from "../Validators/isAthen.js";

// Step 6: Insights Visualization & Optimization
router.get("/dashboard", isloggedIn, wrapAsync(insightsController.getDashboardInsights));
router.get("/top-students", isloggedIn, wrapAsync(insightsController.getTopStudents));

export default router;
