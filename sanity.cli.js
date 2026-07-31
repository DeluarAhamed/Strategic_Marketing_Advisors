import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || "nmg61lqa",
    dataset: process.env.SANITY_STUDIO_DATASET || "production"
  },
  deployment: {
    appId: "ibx2vbva7057l88nf86xx9x3"
  }
});
