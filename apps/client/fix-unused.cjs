const fs = require('fs');
const path = require('path');

const filesToFix = [
    'src/pages/Home.jsx',
    'src/pages/ManageClasses/ManageClasses.jsx',
    'src/pages/ManageDepartment/ManageDepartment.jsx',
    'src/pages/ManageStudent/ManageStudent.jsx',
    'src/pages/ManageTeacher/ManageTeacher.jsx',
    'src/pages/admin/requests/ShowRequestsAdmin.jsx'
];

filesToFix.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(/catch \((?:err|e)\)/g, 'catch');
    fs.writeFileSync(filePath, content);
});

console.log('Fixed catches');
