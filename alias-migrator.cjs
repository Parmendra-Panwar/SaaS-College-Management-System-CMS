const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'apps', 'client', 'src');

// 1. Define mappings for aliases
const aliasMap = {
  'components': '@components',
  'services': '@services',
  'hooks': '@hooks',
  'pages': '@pages',
  'store': '@store',
  'features': '@features'
};

// Helper: Get all JS/JSX files
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach((file) => {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });
  return arrayOfFiles;
}

// 2. Generate Barrel Files
function generateBarrelFiles() {
  const dirsToBarrel = ['components', 'services', 'hooks', 'pages', 'store', 'features'];
  
  dirsToBarrel.forEach(dir => {
    const fullDirPath = path.join(srcDir, dir);
    if (!fs.existsSync(fullDirPath)) return;
    
    const files = fs.readdirSync(fullDirPath);
    const exportsList = [];
    
    files.forEach(file => {
      const filePath = path.join(fullDirPath, file);
      const stat = fs.statSync(filePath);
      
      if (file === 'index.js' || file === 'index.jsx') return;
      
      const parsed = path.parse(file);
      const name = parsed.name;
      
      if (stat.isFile() && (parsed.ext === '.js' || parsed.ext === '.jsx')) {
        // Read file to check if it has a default export or named exports
        const content = fs.readFileSync(filePath, 'utf8');
        const hasDefaultExport = /export\s+default\s+/.test(content);
        
        if (hasDefaultExport) {
          exportsList.push(`export { default as ${name} } from './${name}';`);
        }
        // Always export everything else
        exportsList.push(`export * from './${name}';`);
      } else if (stat.isDirectory()) {
        // We can export folders if they have an index
        const hasIndex = fs.existsSync(path.join(filePath, 'index.js')) || fs.existsSync(path.join(filePath, 'index.jsx'));
        if (hasIndex) {
          exportsList.push(`export * from './${name}';`);
        }
      }
    });
    
    if (exportsList.length > 0) {
      // Deduplicate and write
      const uniqueExports = [...new Set(exportsList)];
      fs.writeFileSync(path.join(fullDirPath, 'index.js'), uniqueExports.join('\n') + '\n', 'utf8');
      console.log(`Generated barrel file for ${dir}`);
    }
  });
}

// 3. Update Import Statements
function updateImports() {
  const files = getAllFiles(srcDir);
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let hasChanges = false;
    
    // Match standard imports like: import X from '../../services/X'
    // Also dynamic imports or exports: export * from '../../components/ui'
    const importRegex = /(import\s+.*?from\s+|export\s+.*?from\s+|import\()(['"])([\.\/]+)(.*?)(['"]\)?)/g;
    
    const newContent = content.replace(importRegex, (match, p1, p2, p3, p4, p5) => {
      if (!p3.startsWith('.')) return match; // Not a relative import
      
      const fileDir = path.dirname(file);
      const absoluteImportPath = path.resolve(fileDir, p3 + p4);
      
      // Check if it resolves inside src/
      if (absoluteImportPath.startsWith(srcDir)) {
        // Determine the relative path from src
        const relativeToSrc = absoluteImportPath.substring(srcDir.length + 1).replace(/\\/g, '/');
        const parts = relativeToSrc.split('/');
        const topLevelDir = parts[0];
        
        if (aliasMap[topLevelDir]) {
          const alias = aliasMap[topLevelDir];
          const restPath = parts.slice(1).join('/');
          const newImportStr = restPath ? `${alias}/${restPath}` : alias;
          hasChanges = true;
          return `${p1}${p2}${newImportStr}${p5}`;
        } else {
           // Fallback to @/
           hasChanges = true;
           return `${p1}${p2}@/${relativeToSrc}${p5}`;
        }
      }
      return match;
    });
    
    if (hasChanges) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`Updated imports in: ${path.relative(srcDir, file)}`);
    }
  });
}

generateBarrelFiles();
updateImports();
console.log('Migration complete!');
