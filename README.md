# Strategic Marketing Advisors Website

Static marketing website deployed on Vercel, with an accompanying Sanity Studio.

## Local development

```powershell
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:3000`. Public URLs omit `.html`. Run `npm.cmd run sanity:dev` for the Sanity editor.

## Build and verification

```powershell
npm.cmd test
```

The build generates article pages from `content/articles/*.json`, updates the resources grid, applies metadata from `content/seo.json`, and writes `sitemap.xml`, `rss.xml` and `robots.txt`. Link and SEO checks validate local references, headings, metadata, canonical URLs, structured data and form handoffs.

## Deploy to Vercel

The existing GitHub `main` branch is the release source. `vercel.json` builds and checks the website, builds Studio, and packages public files into `dist/`. Source content, documentation and build scripts are excluded from the deployed artifact.

The configured canonical origin is `https://strategic-marketing-advisors.vercel.app`. The custom domain currently serves a separate website. When migrating it, update `content/seo.json`, confirm domain routing and redirects, rebuild, and check the canonical URLs and sitemap on the actual production origin.

## Content editing

- Article source records live in `content/articles/`; edit these instead of generated article HTML.
- Edit main/service HTML pages directly; metadata is maintained centrally in `content/seo.json`.
- `content/image-dimensions.json` supplies intrinsic raster-image sizes. Update it when adding or replacing images.
- Sanity retains its existing content schemas. Its source is not automatically fetched into the static build; see `sanity/README.md` before changing that workflow.
- The historical Decap `/admin/` configuration requires its own backend. It is not the Vercel content-delivery mechanism.

The contact page embeds the supplied Atlas booking calendar after visitor consent. All call/consultation CTAs link directly to that same calendar. The old email-handoff forms and automated chat are no longer used on current pages. Newsletter subscriptions take place on LocalPromoVault.

`scripts/site-shell.mjs` loads the shared original-design navigation/footer from `partials/site-header.html` and `partials/site-footer.html`, maintains the booking destination, and retires old service routes. The two signature services are AI Voice Agents and VedaKosa; AI Visibility is supporting work for those clients. The old broad service routes redirect through `vercel.json` and are excluded from the sitemap.

Booking CTAs keep the calendar URL as a no-JavaScript fallback and open an on-site dialog through `data-booking-open`. The dialog uses the same consent-gated calendar as Contact, loads it when opened, supports Escape/close and returns keyboard focus. The photographic homepage hero, trust tabs, founder portraits, full-width mega menus and testimonial wall use the earlier site's visual components while retaining the revised offer.

`site-ui.js` remembers privacy preferences and only loads the voice widget and inline booking calendar after the relevant opt-in. The voice widget uses the supplied public key; its provider restricts configuration access by origin, so verify it on the production domain. No test should start a real call, grant microphone access or submit a booking without a separate reason to do so.

`site-refresh.css` supplies the bounded shared layouts. Keep `height: auto` / explicit card proportions when intrinsic image dimensions are present: an HTML height attribute plus CSS width alone can stretch the rendered image.

See `docs/SEO-AUDIT.md` for findings, implementation scope and account-level local SEO work that remains.
See `docs/FOCUSED-OFFER-RELEASE.md` for the revised offer and regression checks.
