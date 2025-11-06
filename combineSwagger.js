import fs from 'fs-extra';
import path from 'path';

const basePath = './swagger';
const pathsDir = path.join(basePath, 'paths');
const definitionsDir = path.join(basePath, 'definitions');
const outputFile = path.join(basePath, 'swagger.json');

const base = fs.readJsonSync(path.join(basePath, 'base.json'));

function readJsonFilesRecursively(dir) {
    let results = [];
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results = results.concat(readJsonFilesRecursively(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
            results.push(fullPath);
        }
    });
    return results;
}

base.paths = {};

const pathFiles = readJsonFilesRecursively(pathsDir).sort((a, b) => {
    return a.localeCompare(b, undefined, { numeric: true });
});

pathFiles.forEach((file) => {
    const data = fs.readJsonSync(file);
    Object.assign(base.paths, data);
});

base.definitions = {};

const definitionFiles = fs
    .readdirSync(definitionsDir)
    .filter((file) => file.endsWith('.json'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

definitionFiles.forEach((file) => {
    const data = fs.readJsonSync(path.join(definitionsDir, file));
    Object.assign(base.definitions, data);
});

fs.writeJsonSync(outputFile, base, { spaces: 2 });
console.log('✅ Swagger JSON generated successfully!');
