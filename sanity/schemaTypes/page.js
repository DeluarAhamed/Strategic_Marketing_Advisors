import { defineField, defineType } from "sanity";

export const page = defineType({
  name: "page",
  title: "Main Pages",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (Rule) => Rule.required() }),
    defineField({ name: "seoDescription", title: "SEO Description", type: "text", rows: 3 }),
    defineField({ name: "heroEyebrow", title: "Hero Eyebrow", type: "string" }),
    defineField({ name: "heroTitle", title: "Hero Title", type: "string" }),
    defineField({ name: "heroSubheadline", title: "Hero Subheadline", type: "text", rows: 3 }),
    defineField({ name: "heroImage", title: "Hero Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "primaryCtaLabel", title: "Primary CTA Label", type: "string" }),
    defineField({ name: "primaryCtaUrl", title: "Primary CTA URL", type: "url" }),
    defineField({ name: "sectionsHtml", title: "Current Page HTML", type: "text", rows: 20, description: "Temporary bridge field for existing static sections while page-builder blocks are added." })
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" }
  }
});
