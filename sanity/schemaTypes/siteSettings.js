import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Site Title", type: "string" }),
    defineField({ name: "tagline", title: "Tagline", type: "string" }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "email", title: "Email", type: "email" }),
    defineField({ name: "primaryCtaLabel", title: "Primary CTA Label", type: "string" }),
    defineField({ name: "primaryCtaUrl", title: "Primary CTA URL", type: "url" }),
    defineField({ name: "logo", title: "Logo", type: "image" }),
    defineField({ name: "socialLinks", title: "Social Links", type: "array", of: [{ type: "url" }] })
  ]
});
