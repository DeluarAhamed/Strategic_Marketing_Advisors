import { article } from "./article.js";
import { landingPage } from "./landingPage.js";
import { page } from "./page.js";
import { resource } from "./resource.js";
import { service } from "./service.js";
import { siteSettings } from "./siteSettings.js";
import { teamMember } from "./teamMember.js";

export const schemaTypes = [
  siteSettings,
  page,
  landingPage,
  service,
  article,
  resource,
  teamMember
];
