import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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
            const lines = content.split('\n');
            let insertIndex = 0;

            // Find if there are existing imports
            let lastImportIndex = -1;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim().startsWith('import ')) {
                    lastImportIndex = i;
                }
            }

            // Calculate relative path to apiConfig
            let relativeApiConfig = path.relative(path.dirname(filePath), path.join(srcDir, 'apiConfig')).replace(/\\/g, '/');
            // Standardize relative path
            if (!relativeApiConfig.startsWith('.')) {
                relativeApiConfig = './' + relativeApiConfig;
            }

            if (lastImportIndex !== -1) {
                lines.splice(lastImportIndex + 1, 0, `import API_BASE_URL from "${relativeApiConfig}";`);
            } else {
                lines.unshift(`import API_BASE_URL from "${relativeApiConfig}";`);
            }
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
