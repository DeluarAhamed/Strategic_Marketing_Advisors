import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const replacements = {
  "home-services-section.jpg": "custom/editorial/services-overview.jpg",
  "home-about-section.jpg": "custom/editorial/about-workshop.jpg",
  "home-features-list-section-0.jpg": "custom/editorial/executive-consulting.jpg",
  "home-features-list-section-1.jpg": "custom/editorial/web-design.jpg",
  "home-features-list-section-2.jpg": "custom/editorial/google-ads.jpg",
  "home-features-list-section-3.jpg": "custom/editorial/seo-local.jpg",
  "home-features-list-section-4.jpg": "custom/editorial/ai-automation.jpg",
  "home-features-list-section-5.jpg": "custom/editorial/strategy-planning.jpg",
  "home-features-list-section-6.jpg": "custom/editorial/coaching.jpg",
  "home-features-list-section-7.jpg": "custom/editorial/veteran-leadership.jpg",
  "home-features-list-section-8.jpg": "custom/editorial/results.jpg",
  "home-features-list-section-9.jpg": "custom/editorial/brand-design.jpg",
  "home-stats-section.jpg": "custom/editorial/results.jpg",
  "home-contact-section.jpg": "custom/editorial/coaching.jpg",
  "home-testimonial-section-0.jpg": "custom/editorial/about-workshop.jpg",
  "home-testimonial-section-1.jpg": "custom/editorial/coaching.jpg",
  "home-testimonial-section-2.jpg": "custom/editorial/results.jpg",
  "home-blog-list-section-0.jpg": "articles/perception.jpg",
  "home-blog-list-section-1.jpg": "articles/direct-mail.jpg",
  "home-blog-list-section-2.jpg": "articles/finding-balance.jpg"
};

for (const target of Object.values(replacements)) {
  if (!target.startsWith("custom/editorial/")) continue;
  const filename = target.split("/").pop();
  replacements[`custom/${filename}`] = target;
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (/\.(?:html|json)$/.test(entry.name)) {
      let content = fs.readFileSync(target, "utf8");
      for (const [from, to] of Object.entries(replacements)) {
        content = content.replaceAll(from, to);
      }
      fs.writeFileSync(target, content);
    }
  }
}

walk(root);
console.log("Replaced legacy stock-image references with custom assets.");
