const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

function getFiles(dir, files = []) {
    const fileList = fs.readdirSync(dir);
    for (const file of fileList) {
        const name = path.join(dir, file);
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files);
        } else if (name.endsWith('.jsx') || name.endsWith('.js')) {
            files.push(name);
        }
    }
    return files;
}

const allFiles = getFiles(srcDir);
let modifiedCount = 0;

allFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // 1. Replace the URL pattern
    // Pattern: http://localhost:5002/api/
    const urlPattern = /http:\/\/localhost:5002\/api\//g;
    if (urlPattern.test(content)) {
        content = content.replace(urlPattern, '${API_BASE_URL}/');

        // 2. Ensure API_BASE_URL is imported if we made a change and it's not there
        if (!content.includes('import API_BASE_URL')) {
            // Find the right place to insert import (after other imports)
            const lines = content.split('\n');
            let lastImportIndex = -1;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim().startsWith('import ')) {
                    lastImportIndex = i;
                }
            }

            // Calculate relative path to apiConfig
            const relativeApiConfig = path.relative(path.dirname(filePath), path.join(srcDir, 'apiConfig')).replace(/\\/g, '/');
            // If it starts without a dot, add one
            const importPath = relativeApiConfig.startsWith('.') ? relativeApiConfig : './' + relativeApiConfig;

            lines.splice(lastImportIndex + 1, 0, `import API_BASE_URL from "${importPath}";`);
            content = lines.join('\n');
        }
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        modifiedCount++;
        console.log(`✅ Fixed: ${path.relative(srcDir, filePath)}`);
    }
});

console.log(`\n🎉 Total files fixed: ${modifiedCount}`);
