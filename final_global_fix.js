import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const srcDir = path.join(process.cwd(), 'frontend', 'src');

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

// This regex is more broad to catch any variation
const urlPattern = /http:\/\/localhost:5002\/api/g;

allFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    if (urlPattern.test(content)) {
        // Replace the URL pattern (without the slash at end to be safer)
        content = content.replace(urlPattern, '${API_BASE_URL}');

        // Ensure API_BASE_URL is imported
        if (!content.includes('import API_BASE_URL')) {
            const lines = content.split('\n');

            // Find suitable insert point
            let lastImportIndex = -1;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim().startsWith('import ')) {
                    lastImportIndex = i;
                }
            }

            let relativeApiConfig = path.relative(path.dirname(filePath), path.join(srcDir, 'apiConfig')).replace(/\\/g, '/');
            if (!relativeApiConfig.startsWith('.')) relativeApiConfig = './' + relativeApiConfig;

            if (lastImportIndex !== -1) {
                lines.splice(lastImportIndex + 1, 0, `import API_BASE_URL from "${relativeApiConfig}";`);
            } else {
                lines.unshift(`import API_BASE_URL from "${relativeApiConfig}";`);
            }
            content = lines.join('\n');
        }

        // Check for double slashes like ${API_BASE_URL}//
        content = content.replace(/\$\{API_BASE_URL\}\/\//g, '${API_BASE_URL}/');
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        modifiedCount++;
        console.log(`✅ Fixed: ${path.relative(srcDir, filePath)}`);
    }
});

console.log(`\n🎉 Final Pass: Total files fixed: ${modifiedCount}`);
