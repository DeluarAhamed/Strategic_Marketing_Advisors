import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

const root = process.cwd();
const failures = [];
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", ".sanity", "dist", "runtime-templates", "sanity-dist", "sanity-hosted-build", "studio", "static", "node_modules", "uploads", "partials", "work", "docs"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".html")) files.push(full);
  }
}
walk(root);

for (const file of files) {
  const $ = cheerio.load(fs.readFileSync(file, "utf8"));
  $("a[href], img[src], script[src], link[href]").each((_, element) => {
    const raw = $(element).attr("href") || $(element).attr("src");
    if (!raw || /^(https?:|mailto:|tel:|data:|javascript:|#)/.test(raw)) return;
    const clean = raw.split(/[?#]/)[0];
    if (!clean) return;
    const target = clean.startsWith("/")
      ? path.join(root, clean.replace(/^\/+/, ""))
      : path.resolve(path.dirname(file), clean);
    if (!fs.existsSync(target) && !fs.existsSync(`${target}.html`)) failures.push(`${path.relative(root, file)} -> ${raw}`);
  });
}

if (failures.length) {
  console.error(`Broken local references (${failures.length}):\n${failures.join("\n")}`);
  process.exit(1);
}
console.log(`Checked ${files.length} HTML files: no broken local references`);
