# Earlier design with the focused offer

Restored the earlier photographic homepage hero, trust tabs, founder portraits, testimonial wall, full-width mega menus, footer and editorial subpage hero/section treatment. AI Voice Agent, VedaKosa and supporting AI Visibility messaging remains current. Retired services stay retired; resource links, FAQ, voice widget, consent choices and the image proportion fixes are preserved.

Booking links now open a native on-site dialog. Contact retains its inline calendar. Both use the supplied Atlas booking URL and separate booking consent. The popup loads its calendar when opened, supports Escape/close and restores focus; its header stays visible while scrolling. A direct URL remains available as a deliberate fallback. No real appointment is submitted during checks.

Shared design templates are stored in `partials/site-header.html` and `partials/site-footer.html` and applied at build time. The featured AI Front Desk card must link to `/demo`; copy containing “books appointments” must never be mistaken for a booking CTA.

Validation covers the build, local links and SEO metadata; 28 current routes at mobile and desktop widths; current-service mega menus; on-site booking, consent and focus behavior; and the restored image/testimonial layouts. Production verification follows the release.
