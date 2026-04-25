import CollegeRequest from "../models/collegeRequest.js";
import College from "../models/college.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";

const generateRandomString = (length = 8) => {
    return Math.random().toString(36).substring(2, 2 + length);
};

export const requestCollege = async (req, res) => {
  const { collegeName, principalName, principalEmail, contactNumber } = req.body;
  if (!collegeName || !principalName || !principalEmail) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newRequest = await CollegeRequest.create({
    collegeName, principalName, principalEmail, contactNumber
  });

  res.status(201).json({ success: true, message: "Request received successfully", data: newRequest });
};

export const getCollegeRequests = async (req, res) => {
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') return res.status(403).json({ error: "Access Denied" });

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
