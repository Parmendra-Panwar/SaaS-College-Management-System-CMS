import User from "../models/user.js";
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
        return res.json({ token, user: { id: admin._id, username: admin.username, email: admin.email, role: admin.role } });
    }

    return res.status(401).json({ error: "Invalid super admin credentials" });
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
