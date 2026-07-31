import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemaTypes/index.js";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "nmg61lqa";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

export default defineConfig({
  name: "strategicMarketingAdvisors",
  title: "Strategic Marketing Advisors CMS",
  basePath: "/studio",
  projectId,
  dataset,
  plugins: [
    structureTool(),
    visionTool()
  ],
  schema: {
    types: schemaTypes
  }
});
