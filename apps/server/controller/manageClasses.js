import Class from "../models/class.js";
import Department from "../models/department.js";
import Subject from "../models/subject.js";
import { getCollegeFilter, isActionAllowed } from "../utils/helpers.js";

export const getClasses = async (req, res) => {
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
    
    const classes = await Class.find(filter).populate('departmentId').populate('subjects');
    res.status(200).json({ success: true, data: classes });
};

export const getClass = async (req, res) => {
    const c = await Class.findOne({ _id: req.params.id, ...getCollegeFilter(req) }).populate('departmentId').populate('subjects');
    if (!c) return res.status(404).json({ error: "Not found" });
    res.status(200).json({ success: true, data: c });
};

export const createClass = async (req, res) => {
    const { name, departmentId, collegeId } = req.body;
    const targetCollegeId = req.user.role === 'Principal' ? req.user.collegeId : collegeId;
    if (!isActionAllowed(req, targetCollegeId)) return res.status(403).json({ error: "Access Denied" });
    
    const newClass = await Class.create({ name, departmentId: departmentId || null, collegeId: targetCollegeId });
    if (departmentId) {
        await Department.findByIdAndUpdate(departmentId, { $addToSet: { classes: newClass._id } });
    }
    res.status(201).json({ success: true, data: newClass });
};

export const updateClass = async (req, res) => {
    const { departmentId, ...rest } = req.body;
    const c = await Class.findOneAndUpdate({ _id: req.params.id, ...getCollegeFilter(req) }, { ...rest, departmentId: departmentId || null }, { new: false });
    if (!c) return res.status(404).json({ error: "Class not found" });
    
    // Sync old dept 
    if (c.departmentId && String(c.departmentId) !== String(departmentId)) {
        await Department.findByIdAndUpdate(c.departmentId, { $pull: { classes: c._id } });
    }
    // Sync new dept
    if (departmentId && String(c.departmentId) !== String(departmentId)) {
        await Department.findByIdAndUpdate(departmentId, { $addToSet: { classes: c._id } });
    }
    
    res.status(200).json({ success: true, data: await Class.findById(c._id) });
};

export const deleteClass = async (req, res) => {
    const c = await Class.findOneAndDelete({ _id: req.params.id, ...getCollegeFilter(req) });
    if (!c) return res.status(404).json({ error: "Class not found" });
    res.status(200).json({ success: true, message: "Deleted" });
};

export const bulkCreateClasses = async (req, res) => {
  const { classes } = req.body; // Array of { name, departmentId }
  const collegeId = req.collegeId;

  const classesToInsert = classes.map(c => ({ ...c, collegeId }));
  const inserted = await Class.insertMany(classesToInsert, { ordered: false });
  res.status(201).json({ success: true, count: inserted.length, data: inserted });
};

export const bulkCreateSubjects = async (req, res) => {
  const { subjects } = req.body; // Array of { name, code, departmentId, classIds }
  const collegeId = req.collegeId;

  const subjectsToInsert = subjects.map(s => ({ ...s, collegeId }));
  const inserted = await Subject.insertMany(subjectsToInsert, { ordered: false });
  res.status(201).json({ success: true, count: inserted.length, data: inserted });
};
