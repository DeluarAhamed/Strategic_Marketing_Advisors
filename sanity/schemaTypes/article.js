import { defineField, defineType } from "sanity";

export const article = defineType({
  name: "article",
  title: "Blog Articles",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (Rule) => Rule.required() }),
    defineField({ name: "description", title: "SEO Description", type: "text", rows: 3 }),
    defineField({ name: "summary", title: "Card Summary", type: "text", rows: 3 }),
    defineField({ name: "category", title: "Category", type: "string", options: { list: ["mindset", "strategies", "tactics"] } }),
    defineField({ name: "readTime", title: "Read Time", type: "string" }),
    defineField({ name: "date", title: "Publish Date", type: "date" }),
    defineField({ name: "author", title: "Author", type: "string" }),
    defineField({ name: "authorImagePath", title: "Current Author Image Path", type: "string" }),
    defineField({ name: "heroImagePath", title: "Current Hero Image Path", type: "string" }),
    defineField({ name: "cardImagePath", title: "Current Card Image Path", type: "string" }),
    defineField({ name: "bodyHtml", title: "Article Body HTML", type: "text", rows: 24 }),
    defineField({
      name: "faqs",
      title: "FAQs",
      type: "array",
      of: [{ type: "object", fields: [
        { name: "question", title: "Question", type: "string" },
        { name: "answer", title: "Answer", type: "text", rows: 3 }
      ] }]
    })
  ],
  preview: {
    select: { title: "title", subtitle: "category" }
  }
});
