import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemaTypes/index.js";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "nmg61lqa";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";
const basePath = process.env.SANITY_STUDIO_BASE_PATH || (process.env.VERCEL ? "/studio" : undefined);

export default defineConfig({
  name: "strategicMarketingAdvisors",
  title: "Strategic Marketing Advisors CMS",
  basePath,
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
