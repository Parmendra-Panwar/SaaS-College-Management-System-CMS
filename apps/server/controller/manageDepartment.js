import Department from "../models/department.js";
import Class from "../models/class.js";
import { getCollegeFilter, isActionAllowed } from "../utils/helpers.js";

export const getDepartments = async (req, res) => {
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
    
    const departments = await Department.find(filter);
    res.status(200).json({ success: true, data: departments });
};

export const getDepartment = async (req, res) => {
    const dept = await Department.findOne({ _id: req.params.id, ...getCollegeFilter(req) }).populate('classes');
    if (!dept) return res.status(404).json({ error: "Not found" });
    res.status(200).json({ success: true, data: dept });
};

export const createDepartment = async (req, res) => {
    const { name, description, collegeId, classes } = req.body;
    const targetCollegeId = req.user.role === 'Principal' ? req.user.collegeId : collegeId;
    if (!isActionAllowed(req, targetCollegeId)) return res.status(403).json({ error: "Access Denied to this college" });
    
    const maxDept = await Department.create({ name, description, collegeId: targetCollegeId, classes: classes || [] });
    // Update classes to point to this dept
    if (classes && classes.length > 0) {
        await Class.updateMany({ _id: { $in: classes } }, { departmentId: maxDept._id });
    }
    res.status(201).json({ success: true, data: maxDept });
};

export const updateDepartment = async (req, res) => {
    const { classes, ...rest } = req.body;
    const dept = await Department.findOneAndUpdate({ _id: req.params.id, ...getCollegeFilter(req) }, { ...rest, classes: classes || [] }, { new: true });
    if (!dept) return res.status(404).json({ error: "Department not found" });
    
    if (classes && classes.length > 0) {
        // Clear previous references not in the new array (optional, but good for completeness)
        await Class.updateMany({ departmentId: dept._id, _id: { $nin: classes } }, { $unset: { departmentId: 1 } });
        // Set new references
        await Class.updateMany({ _id: { $in: classes } }, { departmentId: dept._id });
    } else if (classes) {
        await Class.updateMany({ departmentId: dept._id }, { $unset: { departmentId: 1 } });
    }
    
    res.status(200).json({ success: true, data: dept });
};

export const deleteDepartment = async (req, res) => {
    const dept = await Department.findOneAndDelete({ _id: req.params.id, ...getCollegeFilter(req) });
    if (!dept) return res.status(404).json({ error: "Department not found" });
    await Class.updateMany({ departmentId: dept._id }, { $unset: { departmentId: 1 } });
    res.status(200).json({ success: true, message: "Deleted successfully" });
};
