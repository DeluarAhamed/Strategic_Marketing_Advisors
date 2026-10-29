import fs from 'node:fs';
import {writeText} from './write-text.mjs';

export const serviceNames = {
  'services/ai-voice-agents.html':'AI Voice Agents (AI Front Desk)',
  'services/vedakosa.html':'VedaKosa Private AI Assistant',
  'services/ai-visibility.html':'AI Visibility Assessment and Programs'
};
export const audience = 'Owners of home-service businesses, including HVAC, plumbing, electrical and roofing contractors';
export function writeDiscovery(siteUrl) {
  // One wildcard group already covers search and AI crawlers. Separate named
  // groups can accidentally bypass exclusions; crawler access is not security.
  writeText('robots.txt', `# Public search and AI crawlers may read public pages.\n# These exclusions are indexing preferences, not authentication.\nUser-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /dashboard\nDisallow: /api/\nDisallow: /studio\nDisallow: /static/\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
  const template=fs.readFileSync(new URL('../content/llms-template.txt',import.meta.url),'utf8');
  writeText('llms.txt',template.replaceAll('{{SITE_URL}}',siteUrl));
}
