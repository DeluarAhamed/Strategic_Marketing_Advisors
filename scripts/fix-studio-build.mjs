import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const studioDir = path.join(root, "studio");
const studioStatic = path.join(studioDir, "static");
const rootStatic = path.join(root, "static");

if (!fs.existsSync(path.join(studioDir, "index.html"))) {
  throw new Error("Sanity Studio build is missing studio/index.html");
}

if (!fs.existsSync(studioStatic)) {
  throw new Error("Sanity Studio build is missing studio/static");
}

fs.rmSync(rootStatic, { recursive: true, force: true });
fs.cpSync(studioStatic, rootStatic, { recursive: true });

console.log("Mirrored Sanity Studio assets from studio/static to /static");
