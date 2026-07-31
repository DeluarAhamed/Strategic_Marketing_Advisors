import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

const root = process.cwd();
const contentDir = path.join(root, "content", "articles");
const articleDir = path.join(root, "articles");
const siteUrl = "https://strategicmarketingadvisors.com";

const articles = fs.readdirSync(contentDir)
  .filter((name) => name.endsWith(".json"))
  .map((name) => JSON.parse(fs.readFileSync(path.join(contentDir, name), "utf8")))
  .sort((a, b) => b.date.localeCompare(a.date));

const formatDate = (date) => new Intl.DateTimeFormat("en-US", {
  year: "numeric", month: "long", day: "numeric", timeZone: "UTC"
}).format(new Date(`${date}T12:00:00Z`));

for (const article of articles) {
  const target = path.join(articleDir, `${article.slug}.html`);
  const template = fs.existsSync(target) ? target : path.join(articleDir, "best-mascots.html");
  const $ = cheerio.load(fs.readFileSync(template, "utf8"), { decodeEntities: false });
  const canonical = `${siteUrl}/articles/${article.slug}.html`;
  const socialImage = `${siteUrl}/${article.cardImage.replace(/^\.\.\//, "").replace(/^\//, "")}`;

  $("title").text(`${article.title} | Strategic Marketing Advisors`);
  $("meta[name='description']").attr("content", article.description);
  $("link[rel='canonical']").attr("href", canonical);
  $("meta[property='og:title'], meta[name='twitter:title']").attr("content", article.title);
  $("meta[property='og:description'], meta[name='twitter:description']").attr("content", article.description);
  $("meta[property='og:url']").attr("content", canonical);
  $("meta[property='og:image'], meta[name='twitter:image']").attr("content", socialImage);
  $(".phero h1").first().text(article.title);
  $(".phero .lead-xl").first().text(article.description);
  $(".phero .tag").first().text(article.category[0].toUpperCase() + article.category.slice(1));
  $(".phero .tag").eq(1).text(article.readTime);
  $(".article__byline img").first().attr({ src: article.authorImage, alt: article.author });
  $(".article__byline .semibold").first().text(article.author);
  $(".article__byline .t-small").first().text(formatDate(article.date));
  $(".article-hero").first().attr({ src: article.heroImage, alt: article.title });
  $(".prose").first().html(article.body);

  $(".post-card").each((_, card) => {
    const href = $(card).attr("href") || $(card).find("a").first().attr("href") || "";
    const slug = href.match(/articles\/([^/.]+)\.html/)?.[1];
    const related = articles.find((item) => item.slug === slug);
    if (related) {
      $(card).find("img").first().attr({
        src: `../${related.cardImage.replace(/^\.\.\//, "")}`,
        alt: related.title,
        loading: "lazy"
      });
    }
  });

  $("script[type='application/ld+json']").each((_, script) => {
    try {
      const data = JSON.parse($(script).html());
      if (data["@type"] === "Article" || data["@type"] === "BlogPosting") {
        data.headline = article.title;
        data.description = article.description;
        data.datePublished = article.date;
        data.dateModified = article.date;
        data.url = canonical;
        data.mainEntityOfPage = canonical;
        data.author = { "@type": "Person", name: article.author };
        $(script).html(`\n${JSON.stringify(data, null, 2)}\n`);
      }
    } catch { /* Leave unrelated structured data untouched. */ }
  });

  if (article.faqs?.length) {
    $("script[data-generated-faq]").remove();
    $("head").append(`<script type="application/ld+json" data-generated-faq>${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: article.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer }
      }))
    })}</script>`);
  }

  fs.writeFileSync(target, $.html());
}

const resourcePath = path.join(root, "resources.html");
const $resources = cheerio.load(fs.readFileSync(resourcePath, "utf8"), { decodeEntities: false });
const grid = $resources(".tst-grid").first();
grid.empty();
articles.forEach((article, index) => {
  const label = article.category[0].toUpperCase() + article.category.slice(1);
  grid.append(`<article class="card post-card reveal" data-d="${(index % 3) + 1}" data-category="${article.category}">
    <a href="articles/${article.slug}.html"><img src="${article.cardImage}" alt="" loading="lazy" /></a>
    <div class="post-card__body">
      <div class="post-card__meta"><span class="badge">${label}</span><span class="t-small semibold">${article.readTime}</span></div>
      <a href="articles/${article.slug}.html"><h3 class="h5">${article.title}</h3></a>
      <p>${article.summary}</p>
      <a href="articles/${article.slug}.html" class="btn-link" style="margin-top:auto;padding-top:1rem">Read more <svg class="icon chev"><use href="#i-chevron"/></svg></a>
    </div>
  </article>`);
});
fs.writeFileSync(resourcePath, $resources.html());

const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", ".sanity", "dist", "sanity-dist", "sanity-hosted-build", "studio", "static", "node_modules", "uploads", "admin", "partials"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".html")) htmlFiles.push(full);
  }
}
walk(root);

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8").replace(/(?:&copy;|©)\s*2025/g, "&copy; 2026");
  const $ = cheerio.load(html, { decodeEntities: false });
  const relative = path.relative(root, file).replaceAll(path.sep, "/");
  const prefix = path.dirname(relative) === "." ? "" : "../";
  if (!$('link[rel="icon"]').length) {
    $("head").append(`<link rel="icon" href="${prefix}assets/favicon.svg" type="image/svg+xml">`);
  }
  const finalScript = $("script[src]").last();
  if (!$("script[src$='hero-scene.js']").length) {
    const script = `<script src="${prefix}hero-scene.js"></script>`;
    if (finalScript.length) finalScript.before(script);
    else $("body").append(script);
  }
  const footer = $(".footer__bottom").first();
  if (footer.length && !footer.find(".footer__legal").length) {
    footer.find("p").first().after(`<div class="footer__legal"><a href="${prefix}privacy.html">Privacy</a><a href="${prefix}terms.html">Terms</a></div>`);
  }
  fs.writeFileSync(file, $.html());
}

const urls = htmlFiles
  .filter((file) => !file.endsWith(`${path.sep}404.html`) && !file.endsWith(`${path.sep}success.html`))
  .map((file) => {
    const relative = path.relative(root, file).replaceAll(path.sep, "/");
    const location = relative === "index.html" ? "/" : `/${relative}`;
    const article = articles.find((item) => location === `/articles/${item.slug}.html`);
    return `  <url><loc>${siteUrl}${location}</loc><lastmod>${article?.date || "2026-06-11"}</lastmod></url>`;
  });
fs.writeFileSync(path.join(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);

const escapeXml = (value) => value.replace(/[<>&'\"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;" }[char]));
const rssItems = articles.slice(0, 20).map((article) => `  <item>
    <title>${escapeXml(article.title)}</title>
    <link>${siteUrl}/articles/${article.slug}.html</link>
    <guid>${siteUrl}/articles/${article.slug}.html</guid>
    <pubDate>${new Date(`${article.date}T12:00:00Z`).toUTCString()}</pubDate>
    <description>${escapeXml(article.summary)}</description>
  </item>`).join("\n");
fs.writeFileSync(path.join(root, "rss.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>Strategic Marketing Advisors Insights</title>
  <link>${siteUrl}/resources.html</link>
  <description>Practical marketing strategy, mindset, and tactics.</description>
${rssItems}
</channel></rss>\n`);

console.log(`Built ${articles.length} articles, sitemap.xml, and rss.xml`);
