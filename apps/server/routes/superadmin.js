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

// Manager API
router.get("/managers", isloggedIn, wrapAsync(superAdminController.getManagers));
router.post("/create-manager", isloggedIn, wrapAsync(superAdminController.createManager));
router.put("/manager/:id", isloggedIn, wrapAsync(superAdminController.editManager));
router.delete("/manager/:id", isloggedIn, wrapAsync(superAdminController.deleteManager));

// College Requests API
router.get("/college-requests", isloggedIn, wrapAsync(superAdminController.getCollegeRequests));
router.post("/college-requests/:id/approve", isloggedIn, wrapAsync(superAdminController.approveCollegeRequest));

// Password Reset (Admin / Manager / Principal)
router.post("/user/:id/reset-password", isloggedIn, wrapAsync(superAdminController.resetUserPassword));

export default router;
