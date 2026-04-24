import User from "../models/user.js";
import bcrypt from "bcryptjs";

const generateRandomString = (length = 8) => {
    return Math.random().toString(36).substring(2, 2 + length);
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
