import express from "express";
const router = express.Router();

import * as superAdminController from "../controller/superAdmin.js";
import * as manageCollegesController from "../controller/manageColleges.js";
import * as manageManagerController from "../controller/manageManager.js";
import * as manageCollegesRequestController from "../controller/manageCollegesRequest.js";
import wrapAsync from "../utils/wrapAsync.js";
import { isloggedIn } from "../Validators/isAthen.js";

// Unprotected
router.post("/login", wrapAsync(superAdminController.superAdminLogin));

// Protected
router.post("/onboard-college", isloggedIn, wrapAsync(manageCollegesController.onboardCollege));
router.get("/colleges", isloggedIn, wrapAsync(manageCollegesController.getCollegesList));
router.put("/college/:id", isloggedIn, wrapAsync(manageCollegesController.updateCollege));

// Manager API
router.get("/managers", isloggedIn, wrapAsync(manageManagerController.getManagers));
router.post("/create-manager", isloggedIn, wrapAsync(manageManagerController.createManager));
router.put("/manager/:id", isloggedIn, wrapAsync(manageManagerController.editManager));
router.delete("/manager/:id", isloggedIn, wrapAsync(manageManagerController.deleteManager));

// College Requests API
router.get("/college-requests", isloggedIn, wrapAsync(manageCollegesRequestController.getCollegeRequests));
router.post("/college-requests/:id/approve", isloggedIn, wrapAsync(manageCollegesRequestController.approveCollegeRequest));

// Password Reset (Admin / Manager / Principal)
router.post("/user/:id/reset-password", isloggedIn, wrapAsync(superAdminController.resetUserPassword));

export default router;
