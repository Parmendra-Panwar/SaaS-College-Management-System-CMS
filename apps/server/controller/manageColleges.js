import College from "../models/college.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";

const generateRandomString = (length = 8) => {
    return Math.random().toString(36).substring(2, 2 + length);
};

export const getAccessibleColleges = async (req, res) => {
    let colleges = [];
    if (req.user.role === 'Admin') {
        colleges = await College.find().select('name _id');
    } else if (req.user.role === 'Manager') {
        colleges = await College.find({ _id: { $in: req.user.assignedColleges } }).select('name _id');
    } else if (req.user.role === 'Principal' || req.user.role === 'Teacher') {
        colleges = await College.find({ _id: req.user.collegeId }).select('name _id');
    }
    res.status(200).json({ success: true, data: colleges });
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
