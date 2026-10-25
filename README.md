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

Contact and update-request forms prepare an email in the visitor's email application. Visitors must send that message themselves. There is no server-side form processor or managed newsletter subscription wired to this Vercel site. `form-handoff.js` explains this before and after the handoff; direct phone and email links remain available. The website guide is automated and does not deliver chat messages to the business.

See `docs/SEO-AUDIT.md` for findings, implementation scope and account-level local SEO work that remains.
