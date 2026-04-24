import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import User from "./models/user.js";
import College from "./models/college.js";
import Department from "./models/department.js";
import Class from "./models/class.js";
import Student from "./models/student.js";
import Teacher from "./models/teacher.js";

const seedDatabase = async () => {
    try {
        await connectDB();
        console.log("Connected to DB. Starting seeding...");

        // Clear existing data to avoid duplicates
        await College.deleteMany({});
        await Department.deleteMany({});
        await Class.deleteMany({});
        await Student.deleteMany({});
        await Teacher.deleteMany({});
        await User.deleteMany({ role: { $in: ['Principal', 'Teacher', 'Student'] } });
        console.log("Cleared existing data.");

        const collegesData = [
            { name: "Alpha Tech Institute", address: "123 Tech Park", contactEmail: "admin@alphatech.edu", phone: "111-222-3333" },
            { name: "Beta Science College", address: "456 Science Blvd", contactEmail: "admin@betascience.edu", phone: "222-333-4444" },
            { name: "Gamma Arts Academy", address: "789 Arts Lane", contactEmail: "admin@gammaarts.edu", phone: "333-444-5555" },
            { name: "Delta Commerce University", address: "101 Business St", contactEmail: "admin@deltacommerce.edu", phone: "444-555-6666" }
        ];

        const rawPassword = "Password@123";
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        for (let i = 0; i < collegesData.length; i++) {
            // Create College
            const college = await College.create(collegesData[i]);
            console.log(`Created College: ${college.name}`);

            // Create Principal
            const principalUser = await User.create({
                username: `Principal ${collegesData[i].name.split(' ')[0]}`,
                email: `principal@${collegesData[i].name.split(' ')[0].toLowerCase()}.edu`,
                password: hashedPassword,
                tempPassword: rawPassword,
                role: 'Principal',
                collegeId: college._id
            });
            console.log(`  Created Principal: ${principalUser.username}`);

            // Update college with principal ID
            college.principalId = principalUser._id;
            await college.save();

            // Create 2 Departments per College
            const depts = ["Computer Science", "Electrical Engineering"];
            for (const deptName of depts) {
                const department = await Department.create({
                    name: deptName,
                    description: `Department of ${deptName}`,
                    collegeId: college._id,
                    classes: []
                });
                console.log(`    Created Department: ${department.name}`);

                // Create 2 Classes per Department
                const classNames = [`${deptName} Year 1`, `${deptName} Year 2`];
                for (const cName of classNames) {
                    const newClass = await Class.create({
                        name: cName,
                        departmentId: department._id,
                        collegeId: college._id
                    });
                    
                    department.classes.push(newClass._id);
                    await department.save();
                    
                    console.log(`      Created Class: ${newClass.name}`);

                    // Create 5 Students per Class
                    for (let s = 1; s <= 5; s++) {
                        const sUsername = `Student ${s} ${cName} ${collegesData[i].name.split(' ')[0]}`;
                        const studentUser = await User.create({
                            username: sUsername,
                            email: `student${s}.${cName.replace(/\s/g, '').toLowerCase()}@${collegesData[i].name.split(' ')[0].toLowerCase()}.edu`,
                            password: hashedPassword,
                            tempPassword: rawPassword,
                            role: 'Student',
                            collegeId: college._id
                        });

                        await Student.create({
                            user: studentUser._id,
                            collegeId: college._id,
                            class: newClass._id,
                            roll_number: `ROLL-${college.name.substring(0,3).toUpperCase()}-${deptName.substring(0,2).toUpperCase()}-${s}`
                        });
                    }
                    console.log(`        Created 5 Students in ${newClass.name}`);
                }
            }
        }
        
        console.log("Seeding Completed Successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Error during seeding:", err);
        process.exit(1);
    }
};

seedDatabase();
