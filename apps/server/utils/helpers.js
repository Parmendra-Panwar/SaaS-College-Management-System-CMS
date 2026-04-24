export const getCollegeFilter = (req) => {
    if (req.user.role === 'Admin') return {};
    if (req.user.role === 'Manager') return { collegeId: { $in: req.user.assignedColleges } };
    return { collegeId: req.user.collegeId };
};

export const isActionAllowed = (req, targetCollegeId) => {
    if (req.user.role === 'Admin') return true;
    if (req.user.role === 'Manager' && req.user.assignedColleges.includes(targetCollegeId)) return true;
    if ((req.user.role === 'Principal' || req.user.role === 'Teacher') && String(req.user.collegeId) === String(targetCollegeId)) return true;
    return false;
};
