# Strategic Marketing Advisors Sanity Studio

This Studio makes the current site CMS-ready for:

- Main pages: Home, About, Services, Resources, Contact
- Landing pages
- Service pages
- Blog articles
- Resource cards/downloads
- Team members
- Global site settings

## Setup

Create `.env` from `.env.example` and fill in the Sanity project values:

```bash
SANITY_STUDIO_PROJECT_ID=your-project-id
SANITY_STUDIO_DATASET=production
SANITY_STUDIO_API_VERSION=2026-07-31
```

Run the Studio:

```bash
npm run sanity:dev
```

Export the current static site content into an importable Sanity dataset:

```bash
npm run sanity:seed
```

Import it after confirming the project and dataset:

```bash
npm run sanity:import
```

The `sectionsHtml`, `bodyHtml`, and image path fields are bridge fields for the current static site. They preserve today’s live content while the site is gradually moved to structured Sanity-powered components.
