import User from "../models/user.js";
import College from "../models/college.js";
import CollegeRequest from "../models/collegeRequest.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateRandomString = (length = 8) => {
    return Math.random().toString(36).substring(2, 2 + length);
};

export const superAdminLogin = async (req, res) => {
    const { email, password } = req.body;

    if (email === "admin@cms.com" && password === "cms@superAdmin45") {
        // Find or create admin user
        let admin = await User.findOne({ email });
        if (!admin) {
            const hashedPassword = await bcrypt.hash(password, 10);
            admin = await User.create({
                username: "SuperAdmin",
                email,
                password: hashedPassword,
                role: "Admin"
            });
        }

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        console.log("user>> ", admin)
        return res.json({ token, user: { id: admin._id, username: admin.username, email: admin.email, role: admin.role } });
    }

    return res.status(401).json({ error: "Invalid super admin credentials" });
};

export const onboardCollege = async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: "Access Denied" });

    const { name, principalName, principalEmail } = req.body;

    // 1. Create College
    const college = await College.create({ name });

    // 2. Auto-generate Principal ID/Pass
    const rawPassword = generateRandomString();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const principal = await User.create({
        username: principalName,
        email: principalEmail,
        password: hashedPassword,
        tempPassword: rawPassword, // Track for super admin view
        role: "Principal",
        collegeId: college._id
    });

    res.status(201).json({
        success: true,
        message: "College and Principal created successfully",
        data: {
            college,
            principal: { email: principal.email, password: rawPassword }
        }
    });
};

export const getCollegesList = async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: "Access Denied" });

    const colleges = await College.find();
    // Get principals
    const principals = await User.find({ role: "Principal" }).select("email tempPassword collegeId username");

    const responseData = colleges.map(col => {
        const prin = principals.find(p => String(p.collegeId) === String(col._id));
        return {
            ...col.toObject(),
            principalAuth: prin ? {
                username: prin.username,
                email: prin.email,
                password: prin.tempPassword
            } : null
        };
    });

    res.status(200).json({ success: true, data: responseData });
};

export const createManager = async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: "Access Denied" });
    const { username, email, assignedColleges } = req.body; // array of collegeIds

    const rawPassword = generateRandomString();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const manager = await User.create({
        username,
        email,
        password: hashedPassword,
        tempPassword: rawPassword,
        role: "Manager",
        assignedColleges
    });

    res.status(201).json({ success: true, manager: { _id: manager._id, username: manager.username, email: manager.email, password: rawPassword, assignedColleges: manager.assignedColleges } });
};

export const editManager = async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: "Access Denied" });
    const { username, email, assignedColleges } = req.body; 

    const manager = await User.findByIdAndUpdate(req.params.id, {
        username, email, assignedColleges
    }, { new: true });

    res.status(200).json({ success: true, manager });
};

export const deleteManager = async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: "Access Denied" });
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Manager deleted" });
};

export const getManagers = async (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: "Access Denied" });
    // Use select to specifically include tempPassword
    const managers = await User.find({ role: "Manager" }).select('-password').populate('assignedColleges');
    res.status(200).json({ success: true, data: managers });
};

export const getCollegeRequests = async (req, res) => {
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') return res.status(403).json({ error: "Access Denied" });
    
    // Admin gets all, Manager can see? The requirement says:
    // "then this data should be shown to admin and manager dashboard"
    const requests = await CollegeRequest.find({ status: "Pending" });
    res.status(200).json({ success: true, data: requests });
};

export const approveCollegeRequest = async (req, res) => {
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') return res.status(403).json({ error: "Access Denied" });
    const { id } = req.params;
    
    const request = await CollegeRequest.findById(id);
    if (!request) return res.status(404).json({ error: "Request not found" });

    // Create College
    const college = await College.create({ name: request.collegeName });

    // Auto-generate Principal ID/Pass
    const rawPassword = generateRandomString();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const principal = await User.create({
        username: request.principalName,
        email: request.principalEmail,
        password: hashedPassword,
        tempPassword: rawPassword,
        role: "Principal",
        collegeId: college._id
    });

    request.status = "Approved";
    await request.save();

    res.status(201).json({
        success: true,
        message: "College and Principal created successfully from Request",
        data: {
            college,
            principal: { email: principal.email, password: rawPassword }
        }
    });
};

export const resetUserPassword = async (req, res) => {
    // Both Admin and Principal can use this if routed correctly
    // or just make a dedicated one for Admin
    if (req.user.role !== 'Admin' && req.user.role !== 'Principal' && req.user.role !== 'Manager') {
        return res.status(403).json({ error: "Access Denied" });
    }
    
    const { id } = req.params; // Target user id
    const targetUser = await User.findById(id);
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    // Hierarchy validation
    if (req.user.role === 'Admin' && targetUser.role !== 'Manager' && targetUser.role !== 'Principal') {
         return res.status(403).json({ error: "Admin can only reset Managers and Principals here" });
    }
    if (req.user.role === 'Principal' && targetUser.role !== 'Teacher' && targetUser.role !== 'Student') {
         return res.status(403).json({ error: "Principal can only reset their own Teachers and Students" });
    }
    
    // Check if same college for Principal
    if ((req.user.role === 'Principal' || req.user.role === 'Manager') && String(targetUser.collegeId) !== String(req.user.collegeId)) {
         return res.status(403).json({ error: "User is not in your college" });
    }

    const rawPassword = generateRandomString();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    targetUser.password = hashedPassword;
    targetUser.tempPassword = rawPassword;
    targetUser.passwordChangedAt = new Date(); // Invalidate existing JWT sessions
    
    await targetUser.save();

    res.status(200).json({ 
        success: true, 
        message: "Password reset successfully. Existing sessions have been invalidated.",
        newPassword: rawPassword 
    });
};
