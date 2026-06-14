import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

const root = process.cwd();
const articleDir = path.join(root, "articles");
const contentDir = path.join(root, "content", "articles");
fs.mkdirSync(contentDir, { recursive: true });

const resources = cheerio.load(fs.readFileSync(path.join(root, "resources.html"), "utf8"));
const cards = new Map();
resources(".post-card").each((_, card) => {
  const el = resources(card);
  const href = el.find("a[href^='articles/']").first().attr("href") || "";
  const slug = path.basename(href, ".html");
  cards.set(slug, {
    summary: el.find(".post-card__body > p").first().text().trim(),
    cardImage: el.find("img").first().attr("src") || "assets/images/home-blog-list-section-0.jpg"
  });
});

for (const filename of fs.readdirSync(articleDir).filter((name) => name.endsWith(".html") && name !== "books.html")) {
  const slug = path.basename(filename, ".html");
  const output = path.join(contentDir, `${slug}.json`);
  if (fs.existsSync(output)) continue;

  const $ = cheerio.load(fs.readFileSync(path.join(articleDir, filename), "utf8"), { decodeEntities: false });
  const tags = $(".phero .tag").map((_, tag) => $(tag).text().trim()).get();
  const fallback = cards.get(slug) || {};
  const item = {
    title: $(".phero h1").first().text().trim(),
    slug,
    description: $(".phero .lead-xl").first().text().trim(),
    summary: fallback.summary || $(".phero .lead-xl").first().text().trim(),
    category: (tags[0] || "Strategies").toLowerCase(),
    readTime: tags[1] || "5 min read",
    date: new Date($(".article__byline .t-small").first().text().trim()).toISOString().slice(0, 10),
    author: $(".article__byline .semibold").first().text().trim(),
    authorImage: $(".article__byline img").first().attr("src") || "../assets/images/mary.jpg",
    heroImage: $(".article-hero").first().attr("src") || "../assets/images/home-blog-list-section-0.jpg",
    cardImage: fallback.cardImage || "assets/images/home-blog-list-section-0.jpg",
    body: $(".prose").first().html()?.trim() || "<p>Article content coming soon.</p>"
  };
  fs.writeFileSync(output, `${JSON.stringify(item, null, 2)}\n`);
  console.log(`Migrated ${filename}`);
}
