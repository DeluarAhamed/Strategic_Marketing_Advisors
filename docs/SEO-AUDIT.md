# SEO and buyer-content audit

Audit date: 25 October 2026. Scope: 31 public HTML pages, nine article source records, build output, robots.txt, sitemap, Vercel configuration and live HTTP responses. This is a website audit; no Search Console, Google Business Profile, analytics or keyword-volume account was available.

## Priority findings before implementation

| Priority | Finding | Required change |
| --- | --- | --- |
| Critical | The supplied Vercel site canonicalizes to strategicmarketingadvisors.com, which currently serves a different WordPress website. | Use the supplied live Vercel origin consistently. Keep the custom-domain move as a separate migration once it actually serves this site. |
| High | Service pages and articles are missing canonical tags; metadata and social cards vary by template. | Generate consistent, unique page metadata and clean, self-referencing URLs. |
| High | Homepage has seven H1 elements and no main landmark. Service H1s describe slogans rather than the service. | One descriptive H1 and an accessible main region; preserve the visual design. |
| High | Local schema describes a PO box as a physical ProfessionalService location with town-centre coordinates. Contact page shows an unattributed five-star rating and directions to a town rather than an office. | Use Organization markup with an explicitly labelled mailing address. Remove invented location precision and rating implications. Keep Cashiers, NC as the stated base and nationwide remote service. |
| High | Generic copy, promises to dominate search, unsupported 85% traffic/3x lead results, and unsourced review statistics weaken credibility. | Explain problems, fit, deliverables, measurement and limits in plain English. Retain existing founder biographies and attributed testimonials without inventing case studies. |
| High | Netlify form handling is configured on Vercel, which does not process Netlify Forms. | Provide an honest email-client handoff and visible direct contact options until a delivery service is connected. Do not imply a form was delivered. |
| Medium | Sparse internal paths between local SEO, profile auditing, reviews and website conversion. | Add contextual links, practical local-search guidance and relevant buyer FAQs. |
| Medium | The sitemap uses .html URLs despite Vercel clean URLs; dates are hardcoded; utility pages lack consistent indexing rules. | Generate the sitemap from indexable canonical URLs and use real content-modified dates. Noindex admin, Studio, error and confirmation pages. |
| Medium | Article reading times are overstated, some bodies contain unsourced statistics, and author names are not linked to biographies. | Clean article sources, calculate reading time, add relevant service links and author attribution. |

## Positioning and search intent

Primary buyer: an owner or small leadership team at a local or service business. They have inconsistent inquiries, limited time, unclear marketing returns or a website/profile that does not explain their value. Local priority: Cashiers and western North Carolina; do not imply branch offices in nearby towns. Nationwide remote consulting remains available.

Value proposition: founder-led strategy and practical implementation across local search, Google Ads, website messaging and customer follow-up, with clear priorities and reporting on qualified inquiries. Differentiators supported by existing site content: Mary and David's business experience, Entrepreneur Press books, David's 23 years of Air Force service, and an approach that transfers knowledge to the client. These are positioning evidence, not independently verified performance results.

## External work that remains

- Verify the real Google Business Profile, category, eligibility, address/service area, hours and website URL with its owner. A PO box is not a customer-facing office. No profile URL or account access was supplied.
- Keep the business name, primary phone and mailing address consistent in legitimate directories. Do not create duplicate profiles or city doorway pages.
- Connect Search Console to the production origin, submit its sitemap and monitor indexing, real search queries and qualified inquiries. No search-ranking improvement can be verified on launch day.
- Connect a server-side contact/newsletter delivery provider if in-page submission and managed subscriptions are required.
- Measure field Core Web Vitals and conversion baselines after launch. Automated structural checks are not a field performance score or full accessibility certification.

## Reference guidance

- [Google: local ranking](https://support.google.com/business/answer/7091)
- [Google: helpful, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google: title links](https://developers.google.com/search/docs/appearance/title-link)
- [Google: local business structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google: structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)

## Implementation and pre-release validation

- Reworked homepage and eight service pages around buyer problems, fit, scope, value and next steps. Added visible buyer FAQs and local-search context.
- Cleaned nine article source records, added service links and realistic reading times, and published a new local SEO checklist with primary-source references.
- Standardized titles, descriptions, social metadata, clean canonical URLs, breadcrumb/Organization/Service/BlogPosting markup, sitemap and utility indexing rules across 32 public pages (30 indexable).
- Removed unsupported growth statistics, the unattributed contact-page rating and misleading office directions. Retained original biographies and attributed book/course feedback.
- Added honest email handoffs and corrected the automated website guide so it does not imply messages reach a human.
- Converted the homepage image from 1,697,728 bytes to 67,920 bytes (about 96% smaller) and the main founder portrait from 462,430 bytes to 26,600 bytes. Added intrinsic raster-image sizes and deferred offscreen images.
- `npm test`: article build, 33 HTML link checks including admin, and 32 public-page SEO checks passed.
- Sanity Studio production-path build and public-artifact packaging passed.
- HTTP checks against the packaged site passed for 30 indexable URLs, required assets, Studio, robots/sitemap, genuine 404s and source-file exclusions.
- Browser checks: desktop and 390-pixel mobile homepage, mobile local-SEO page without horizontal overflow, opening the new FAQ, and clear contact handoff instructions.

These checks confirm implementation and release readiness. They do not establish keyword-volume research, Google indexing, ranking improvements, profile eligibility or field Core Web Vitals.
