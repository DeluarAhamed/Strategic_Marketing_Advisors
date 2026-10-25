# Focused offer and layout correction

25 October 2026. Implements the owner's revised service priorities and corrects the previous image-layout regression.

## Offer and content

- AI Voice Agents are the primary signature service, with a dedicated service page and live-demo page. The demo uses SMA's configured agent; a separate booked walkthrough plans the customer's specific setup. It does not falsely claim to generate a custom business agent from a URL.
- VedaKosa is the second signature service: a focused, hands-on AI system engagement for about 10 client businesses. This is expressed as a program goal, not invented remaining capacity.
- SEO, AEO and local search are presented as AI Visibility support for core-service clients. Old Google Ads, branding, web design, generic automation, reputation and profile-audit offers are removed from promotion. Eight former service URLs redirect to the current offer.
- Shared Services navigation has one Consulting & Growth group and the requested AI Front Desk feature. Resources navigation/footer has Blog, LocalPromoVault and the free Skool community. Magazine, newsletter and AI Skills links are on the resource hub.
- The 26-question FAQ page contains the supplied 20 topics plus six questions about the current signature services/resources. Wording is aligned with the narrowed offer and avoids implying guaranteed SEO results or that every live AI voice response needs manual approval.
- All booking CTAs use the supplied Atlas calendar. Contact embeds the same calendar; no email-draft form or unclear “field report” remains. Site hours exclude weekends. Biographies say David and Mary live full time in western North Carolina.
- Larger logo, Facebook/LinkedIn social links, updated metadata, sitemap, internal links and FAQ structured data.

## Layout and consent

The regression was caused by intrinsic HTML height attributes remaining effective while CSS changed image width. Shared styles now explicitly control image height/proportion. Blog cards, article heroes, inline figures and portraits were reviewed. Current main pages use simpler, bounded layouts and shared navigation/footer templates.

The old chat is removed. The supplied voice widget is enabled only after voice consent; the calendar has a separate consent choice. Necessary local storage remembers these preferences for up to six months. Visitors can reject optional services, choose categories or revise choices in the footer. Third-party voice/calendar processing and external resources are explained in the privacy notice. Technical consent controls do not assert any legal immunity.

The vendor script registers DOMContentLoaded and exposes `window.widgetLib.scanWidgets()` for later mounts. The loader uses that vendor hook after consent, rather than re-firing the page event. Its public configuration endpoint accepts the production origin and rejects localhost; the live widget must be verified after release.

## Validation

- Build/link/SEO checks: 38 public HTML documents plus admin link checking; 28 current indexable pages, eight retired/noindex fallbacks and two utility pages.
- Browser checks at 390×844 and 1280×900 across all 28 current routes: one H1 each, no horizontal overflow, no oversized images and no old chat. With optional services rejected, no voice script or active calendar iframe was present.
- Visual checks of the desktop/mobile homepage, blog and FAQ; the calendar rendered its actual date/time interface after booking consent. No booking was submitted.
- Voice and calendar choices are separate. Enabling the calendar did not load the voice script. Revoking optional services reloads the page without those embeds.
- Legacy redirects, live widget rendering and production routes are verified after the release.
