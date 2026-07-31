import { defineField, defineType } from "sanity";

export const resource = defineType({
  name: "resource",
  title: "Resources",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" } }),
    defineField({ name: "type", title: "Type", type: "string", options: { list: ["guide", "checklist", "newsletter", "tool", "article"] } }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3 }),
    defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "url", title: "URL", type: "url" }),
    defineField({ name: "bodyHtml", title: "Resource Body HTML", type: "text", rows: 14 })
  ]
});
