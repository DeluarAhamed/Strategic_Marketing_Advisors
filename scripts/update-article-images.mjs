import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const articlesDir = path.join(root, "content", "articles");

for (const file of fs.readdirSync(articlesDir).filter((name) => name.endsWith(".json"))) {
  const filePath = path.join(articlesDir, file);
  const article = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const imageName = `${article.slug}.jpg`;
  const heroImage = `../assets/images/articles/${imageName}`;

  article.heroImage = heroImage;
  article.cardImage = `assets/images/articles/${imageName}`;
  article.body = article.body.replace(
    /<figure class="figure"><img src="[^"]+"/,
    `<figure class="figure"><img src="${heroImage}"`,
  );

  fs.writeFileSync(filePath, `${JSON.stringify(article, null, 2)}\n`);
}

console.log("Updated article imagery paths.");
