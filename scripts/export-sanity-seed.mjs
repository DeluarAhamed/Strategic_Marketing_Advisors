import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

const root = process.cwd();
const seedDir = path.join(root, "sanity", "seed");
const outFile = path.join(seedDir, "production.ndjson");
fs.mkdirSync(seedDir, { recursive: true });

const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const slugify = (value) => value
  .toLowerCase()
  .replace(/&/g, "and")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const text = ($, selector) => $(selector).first().text().replace(/\s+/g, " ").trim();
const html = ($, selector) => $(selector).first().html()?.trim() || "";
const metaDescription = ($) => $('meta[name="description"]').attr("content") || "";
const id = (...parts) => parts.map(slugify).join(".");

const docs = [];

const push = (doc) => {
  docs.push({
    _id: doc._id,
    _type: doc._type,
    ...doc
  });
};

for (const file of ["index.html", "about.html", "services.html", "resources.html", "contact.html"]) {
  const $ = cheerio.load(read(file), { decodeEntities: false });
  const title = $("title").text().replace(/\s+\|\s+Strategic Marketing Advisors$/, "").trim()
    || text($, "h1")
    || file.replace(".html", "");
  const slug = file === "index.html" ? "home" : file.replace(".html", "");
  push({
    _id: id("page", slug),
    _type: "page",
    title,
    slug: { _type: "slug", current: slug },
    seoDescription: metaDescription($),
    heroEyebrow: text($, ".hero2__eyebrow, .phero .breadcrumb, .kicker"),
    heroTitle: text($, "h1"),
    heroSubheadline: text($, ".hero2__sub, .phero .lead-xl, .lead-xl"),
    primaryCtaLabel: text($, ".hero2__pill, .btn-primary"),
    primaryCtaUrl: $(".hero2__pill, .btn-primary").first().attr("href") || "",
    sectionsHtml: html($, "body")
  });
}

for (const file of fs.readdirSync(path.join(root, "services")).filter((name) => name.endsWith(".html"))) {
  const relative = `services/${file}`;
  const $ = cheerio.load(read(relative), { decodeEntities: false });
  const slug = file.replace(".html", "");
  push({
    _id: id("service", slug),
    _type: "service",
    title: text($, "h1") || slug,
    slug: { _type: "slug", current: slug },
    seoDescription: metaDescription($),
    heroTitle: text($, "h1"),
    heroSubheadline: text($, ".phero .lead-xl, .lead-xl"),
    bodyHtml: html($, "main"),
    ctaLabel: text($, ".btn-primary"),
    ctaUrl: $(".btn-primary").first().attr("href") || ""
  });
}

for (const name of fs.readdirSync(path.join(root, "content", "articles")).filter((item) => item.endsWith(".json"))) {
  const article = JSON.parse(read(`content/articles/${name}`));
  push({
    _id: id("article", article.slug),
    _type: "article",
    title: article.title,
    slug: { _type: "slug", current: article.slug },
    description: article.description,
    summary: article.summary,
    category: article.category,
    readTime: article.readTime,
    date: article.date,
    author: article.author,
    authorImagePath: article.authorImage,
    heroImagePath: article.heroImage,
    cardImagePath: article.cardImage,
    bodyHtml: article.body,
    faqs: (article.faqs || []).map((faq, index) => ({
      _key: `${article.slug}-faq-${index}`,
      question: faq.question,
      answer: faq.answer
    }))
  });
}

const resources = [
  { title: "Local Promo Vault", type: "tool", url: "https://localpromovault.com" },
  { title: "Agent Skills Vault", type: "tool", url: "https://agentskillsvault.com" },
  { title: "Weekly Newsletter", type: "newsletter", url: "https://mybizreport.com" }
];

for (const resource of resources) {
  push({
    _id: id("resource", resource.title),
    _type: "resource",
    title: resource.title,
    slug: { _type: "slug", current: slugify(resource.title) },
    type: resource.type,
    summary: "Strategic Marketing Advisors resource for practical small-business growth.",
    url: resource.url
  });
}

push({
  _id: "siteSettings.main",
  _type: "siteSettings",
  title: "Strategic Marketing Advisors",
  tagline: "Influencing Outcomes",
  phone: "(843) 870-3357",
  email: "hello@strategicmarketingadvisors.com",
  primaryCtaLabel: "Book a Consultation",
  primaryCtaUrl: "https://strategicmarketingadvisors.com/contact.html"
});

push({
  _id: "teamMember.mary-eule-scarborough",
  _type: "teamMember",
  name: "Mary Eule Scarborough",
  role: "Award-winning speaker, writer and Certified Guerrilla Marketing Coach",
  photoPath: "assets/images/mary-eule-scarborough-2026.png",
  email: "hello@strategicmarketingadvisors.com"
});

push({
  _id: "teamMember.david-a-scarborough",
  _type: "teamMember",
  name: "David A. Scarborough",
  role: "Business leader, educator, writer and speaker",
  bio: "U.S. Air Force officer and aviator for 23 years, business educator, strategic marketing advisor, and co-author.",
  photoPath: "assets/images/david.jpg",
  linkedin: "https://www.linkedin.com/in/davidascarborough/",
  email: "hello@strategicmarketingadvisors.com"
});

fs.writeFileSync(outFile, `${docs.map((doc) => JSON.stringify(doc)).join("\n")}\n`);
console.log(`Exported ${docs.length} Sanity documents to ${path.relative(root, outFile)}`);
