# Strategic Marketing Advisors Website

Production-ready static website with Netlify Forms and Decap CMS.

## Local development

```powershell
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:3000`. The local CMS is at `http://localhost:3000/admin/`.

## Build and verification

```powershell
npm.cmd test
```

The build generates article pages from `content/articles/*.json`, updates the resources grid, and writes `sitemap.xml` and `rss.xml`. The link check fails when a deployable page references a missing local file.

## Deploy to Netlify

1. Push this repository to GitHub, GitLab, or Bitbucket using the `main` branch.
2. Create a Netlify project from the repository. `netlify.toml` supplies the build command and publish directory.
3. In Netlify, enable Identity and set registration to **Invite only**.
4. Enable Git Gateway under Identity services.
5. Invite each content editor, then open `https://strategicmarketingadvisors.com/admin/`.
6. Confirm the `consultation` and `newsletter` forms appear under Netlify Forms after the first production deploy.
7. Add the production custom domain and verify HTTPS/DNS before directing traffic.

## Content editing

- Articles are edited in Decap CMS as structured entries and rebuilt into `/articles/` automatically.
- Main pages are available in the CMS as full HTML documents for careful layout-level edits.
- Uploaded CMS images are stored in `assets/images/uploads/`.

Form submissions are processed by Netlify only on a Netlify deploy; a generic local static server cannot receive them.
