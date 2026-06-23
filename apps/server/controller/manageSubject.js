import Subject from "../models/subject.js";
import Class from "../models/class.js";
import { getCollegeFilter, isActionAllowed } from "../utils/helpers.js";

export const getSubjects = async (req, res) => {
    let filter = getCollegeFilter(req);
    
    // For Admin/Manager, enforce specific college fetch
    if (req.user.role === 'Admin' || req.user.role === 'Manager') {
        if (req.query.collegeId) {
            if (req.user.role === 'Manager') {
                if (!req.user.assignedColleges.map(String).includes(String(req.query.collegeId))) {
                    return res.status(403).json({ error: "Access Denied" });
                }
            }
            filter.collegeId = req.query.collegeId;
        } else {
            return res.status(200).json({ success: true, data: [] });
        }
    }
    
    // Allow filtering by classId if provided
    if (req.query.classId) {
        filter.classId = req.query.classId;
    }

    const subjects = await Subject.find(filter).populate('classId').populate('departmentId');
    res.status(200).json({ success: true, data: subjects });
};

export const getSubject = async (req, res) => {
    const s = await Subject.findOne({ _id: req.params.id, ...getCollegeFilter(req) }).populate('classId').populate('departmentId');
    if (!s) return res.status(404).json({ error: "Not found" });
    res.status(200).json({ success: true, data: s });
};

export const createSubject = async (req, res) => {
    const { name, code, classId, departmentId, collegeId } = req.body;
    const targetCollegeId = req.user.role === 'Principal' ? req.user.collegeId : collegeId;
    if (!isActionAllowed(req, targetCollegeId)) return res.status(403).json({ error: "Access Denied" });
    
    if (!name || !code) return res.status(400).json({ error: "Name and Code are required" });

    const newSubject = await Subject.create({ 
        name, 
        code, 
        classId: classId || null, 
        departmentId: departmentId || null, 
        collegeId: targetCollegeId 
    });
    
    // Sync with Class
    if (classId) {
        await Class.findByIdAndUpdate(classId, { $addToSet: { subjects: newSubject._id } });
    }
    
    res.status(201).json({ success: true, data: newSubject });
};

export const updateSubject = async (req, res) => {
    const { classId, departmentId, ...rest } = req.body;
    const s = await Subject.findOneAndUpdate({ _id: req.params.id, ...getCollegeFilter(req) }, { ...rest, classId: classId || null, departmentId: departmentId || null }, { new: false });
    if (!s) return res.status(404).json({ error: "Subject not found" });
    
    // Sync old class
    if (s.classId && String(s.classId) !== String(classId)) {
        await Class.findByIdAndUpdate(s.classId, { $pull: { subjects: s._id } });
    }
    // Sync new class
    if (classId && String(s.classId) !== String(classId)) {
        await Class.findByIdAndUpdate(classId, { $addToSet: { subjects: s._id } });
    }
    
    res.status(200).json({ success: true, data: await Subject.findById(s._id) });
};

export const deleteSubject = async (req, res) => {
    const s = await Subject.findOneAndDelete({ _id: req.params.id, ...getCollegeFilter(req) });
    if (!s) return res.status(404).json({ error: "Subject not found" });
    
    if (s.classId) {
        await Class.findByIdAndUpdate(s.classId, { $pull: { subjects: s._id } });
    }
    
    res.status(200).json({ success: true, message: "Deleted" });
};
