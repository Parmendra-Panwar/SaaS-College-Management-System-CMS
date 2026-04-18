import express from "express";
const router = express.Router();

import * as superAdminController from "../controller/superAdmin.js";
import wrapAsync from "../utils/wrapAsync.js";
import { isloggedIn } from "../Validators/isAthen.js";

// Unprotected
router.post("/login", wrapAsync(superAdminController.superAdminLogin));

// Protected
router.post("/onboard-college", isloggedIn, wrapAsync(superAdminController.onboardCollege));
router.get("/colleges", isloggedIn, wrapAsync(superAdminController.getCollegesList));
router.post("/create-manager", isloggedIn, wrapAsync(superAdminController.createManager));

export default router;
