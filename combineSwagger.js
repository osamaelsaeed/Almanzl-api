import fs from "fs-extra";
import path from "path";

const basePath = "./swagger";
const pathsDir = path.join(basePath, "paths");
const definitionsDir = path.join(basePath, "definitions");
const outputFile = path.join(basePath, "swagger.json");

const base = fs.readJsonSync(path.join(basePath, "base.json"));

base.paths = {};
fs.readdirSync(pathsDir).forEach((file) => {
  if (file.endsWith(".json")) {
    const data = fs.readJsonSync(path.join(pathsDir, file));
    Object.assign(base.paths, data);
  }
});

base.definitions = {};
fs.readdirSync(definitionsDir).forEach((file) => {
  if (file.endsWith(".json")) {
    const data = fs.readJsonSync(path.join(definitionsDir, file));
    Object.assign(base.definitions, data);
  }
});

fs.writeJsonSync(outputFile, base, { spaces: 2 });
console.log("✅ Swagger JSON generated successfully!");
