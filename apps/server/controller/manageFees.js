import ClassFee from "../models/classFee.js";
import StudentFee from "../models/studentFee.js";
import Class from "../models/class.js";
import Student from "../models/student.js";
import Teacher from "../models/teacher.js";

const checkAccess = async (user, classId) => {
    const classObj = await Class.findById(classId);
    if (!classObj) return { error: "Class not found", status: 404 };
    
    const targetCollegeId = String(classObj.collegeId);
    if (user.role !== 'Admin') {
        const hasAccess = user.role === 'Manager' 
            ? user.assignedColleges.some(id => String(id) === targetCollegeId)
            : String(user.collegeId) === targetCollegeId;
            
        if (!hasAccess) return { error: "Access Denied", status: 403 };
    }

    if (user.role === 'Teacher') {
        const teacher = await Teacher.findOne({ user: user._id });
        if (teacher) {
            let validClassIds = teacher.classes.map(id => String(id));
            if (teacher.departments && teacher.departments.length > 0) {
                const classesInDepts = await Class.find({ departmentId: { $in: teacher.departments } }).select('_id');
                validClassIds.push(...classesInDepts.map(c => String(c._id)));
            }
            if (!validClassIds.includes(String(classId))) {
                return { error: "Access Denied: You are not assigned to this class", status: 403 };
            }
        } else {
            return { error: "Access Denied: Teacher profile not found", status: 403 };
        }
    }
    return { success: true, classObj };
};

export const setClassFee = async (req, res) => {
    const { classId, feeTypes } = req.body;
    if (!classId || !feeTypes) return res.status(400).json({ error: "Missing required fields" });

    const access = await checkAccess(req.user, classId);
    if (access.error) return res.status(access.status).json({ error: access.error });

    const totalAmount = feeTypes.reduce((sum, fee) => sum + Number(fee.amount), 0);

    const classFee = await ClassFee.findOneAndUpdate(
        { classId },
        { collegeId: access.classObj.collegeId, feeTypes, totalAmount },
        { new: true, upsert: true }
    );

    const students = await Student.find({ class: classId });

    const operations = students.map(student => ({
        updateOne: {
            filter: { studentId: student._id },
            update: { 
                $set: { 
                    collegeId: access.classObj.collegeId, 
                    classId, 
                    feeTypes, 
                    totalAmount 
                },
                $setOnInsert: { totalPaid: 0, receipts: [] }
            },
            upsert: true
        }
    }));

    if (operations.length > 0) {
        await StudentFee.bulkWrite(operations);
    }

    res.status(200).json({ success: true, data: classFee, message: "Class fee set successfully" });
};

export const getClassFee = async (req, res) => {
    const { classId } = req.params;
    if (!classId) return res.status(400).json({ error: "classId parameter is required" });

    const access = await checkAccess(req.user, classId);
    if (access.error) return res.status(access.status).json({ error: access.error });

    const classFee = await ClassFee.findOne({ classId });
    res.status(200).json({ success: true, data: classFee });
};

export const getStudentFees = async (req, res) => {
    const { classId } = req.query;
    if (!classId) return res.status(400).json({ error: "classId query parameter is required" });

    const access = await checkAccess(req.user, classId);
    if (access.error) return res.status(access.status).json({ error: access.error });

    const studentFees = await StudentFee.find({ classId }).populate({
        path: 'studentId',
        populate: { path: 'user', select: 'username email' }
    });

    res.status(200).json({ success: true, data: studentFees });
};

export const addFeeTransaction = async (req, res) => {
    const { studentId } = req.params;
    const { type, amount, remark } = req.body;

    if (!type || !amount) return res.status(400).json({ error: "Missing required fields" });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const access = await checkAccess(req.user, student.class);
    if (access.error) return res.status(access.status).json({ error: access.error });

    const studentFee = await StudentFee.findOne({ studentId });
    if (!studentFee) return res.status(404).json({ error: "Fee record not found for this student" });

    const transaction = {
        type,
        amount: Number(amount),
        remark,
        recordedBy: req.user._id,
        date: new Date()
    };

    studentFee.receipts.push(transaction);
    studentFee.totalPaid += Number(amount);
    await studentFee.save();

    res.status(200).json({ success: true, data: studentFee, message: "Transaction added successfully" });
};
