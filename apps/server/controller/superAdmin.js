import User from "../models/user.js";
import College from "../models/college.js";
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

    res.status(201).json({ success: true, manager: { email: manager.email, password: rawPassword } });
};
