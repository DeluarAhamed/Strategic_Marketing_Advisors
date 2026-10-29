# SMA AI Visibility package review

Reviewed 29 October 2026 against the repository, live Vercel website, public WordPress sitemap and live SMA access controls. The supplied ZIP is reference material, not an executable installation plan. Its original files remain unchanged in Downloads.

## Findings and implemented corrections

| Item | Evidence and resolution |
| --- | --- |
| Dashboard is allegedly open | The dashboard's public HTML is a sign-in shell, not a private-data response. A fresh browser visit to `/dashboard` lands on `/admin` sign-in. Anonymous private API requests to profile, leads, work queue, reporting configuration and team membership returned 401. The SMA leads, membership, follow-up, activity and draft tables have RLS enabled and no anonymous SELECT grant. Existing role checks also distinguish owner, editor and viewer. No extra login was needed to correct this reported finding. This is a scoped verification, not a full penetration test. |
| `/studio` is allegedly open | A fresh unauthenticated browser shows Sanity's “Choose login provider” screen. It uses Sanity authentication, separately from the SMA dashboard. HTTP 200 for that login shell is not proof of unauthorized editing. |
| Founding date | Owner confirmed 2004. Added to visible About/FAQ copy, Organization schema and the discovery guide. |
| Customer profile | Replaced the FAQ's funded-startup/mid-market positioning with home-service owners, including HVAC, plumbing, electrical and roofing. Aligned the homepage, voice-agent copy, service audience schema and discovery guide. |
| Service names | Schema now uses AI Voice Agents (AI Front Desk), VedaKosa Private AI Assistant and AI Visibility Assessment and Programs, rather than “Signature service 01/02.” Kate remains the demo assistant. |
| Voice-agent capabilities | Described as configured capabilities, not a claim that Kate's call-to-dashboard or booking integration has already been installed. Provider access is still pending. |
| Founder credentials | Kept 23 years specifically for David's Air Force service, Fortune 500 marketing for Mary, and “taught business” for David. No unconfirmed marketing-years number or teaching duration was introduced. |
| Books | Replaced the inaccurate blanket claim that all three titles were co-authored by both founders. Both co-authored The Procrastinator's Guide to Marketing; Mary's other co-authored titles remain attributed to her. |
| Phone and email | Owner confirmed 877-355-8745 as primary; 828-743-8733 remains the local additional number. Public email remains hello@strategicmarketingadvisors.com. Cell-forwarding details are not published. |
| Address and schema type | Owner confirmed an intentionally home-based, remote-first business since 2004, with rare separately arranged visits. Retained Organization schema and the public PO Box as a mailing address. Did not add a private home street address, coordinates, office pin, LocalBusiness/ProfessionalService type, fabricated ratings, prices or category IDs. |
| PNG logo | Exported the existing SVG faithfully to `/assets/logo.png`, 1200 × 360, and referenced it in schema. SVG remains valid for Google and remains the navigation asset; PNG is an additional reusable listing asset, not a cure for a Google penalty. |
| FAQ schema | Kept one FAQPage generated from the actual visible questions and answers. Did not paste the ZIP's separate stale FAQ snippet or add duplicate graphs. |
| `llms.txt` | Added a reviewed public discovery guide, generated with the same active site origin as schema and sitemap. It is a convenience for readers/tools, not authentication or a guaranteed ranking mechanism. |
| `robots.txt` | Retained one wildcard group allowing public crawling and excluding management paths. Named AI crawler groups are unnecessary to preserve the existing policy and can accidentally omit exclusions. No firewall settings were weakened. |
| Domain switch | Still staged: WordPress remains at the real domain. Canonicals, sitemap, robots and llms use the active Vercel origin until cutover. Build now rejects a mismatch between SEO and backend site URLs. Update both together with auth callbacks and exact API origins at launch. |
| WordPress URLs | Captured 113 published URLs. Added 24 explicit 301 mappings for clear equivalents/current service replacements, retaining two existing URLs. The remaining 87 need review before cutover: they include unmigrated articles, membership/account/checkout, old legal and test pages. They have not been blindly redirected to the homepage or the private admin login. See `legacy-url-inventory.json`. |

## Listing guidance: not a claim of completed registrations

The supplied Bing and Apple files are instructions, not proof of an account, claimed listing or completed verification.

- **Bing:** its published eligibility guidance requires a customer-facing physical location or service delivered by employees travelling to customers, with a valid verification address. A hidden address does not automatically make a remote-only business eligible. SMA should confirm eligibility with Bing based on its actual remote-first model before submitting. No home address has been requested for public schema or published.
- **Apple:** use its brand/virtual-business route while there is no customer-facing location. Do not create a PO Box Maps pin. Account ownership and business verification still need to be completed by the owner.
- **Business category:** marketing/business consulting describes the current work; choose from each platform's current taxonomy during owner-authorized setup. No unverified platform category has been asserted as an existing listing fact.

Official references checked:

- https://www.bing.com/forbusiness/help/modernExperience?setlang=en
- https://business.apple.com/support
- https://support.apple.com/en-ie/guide/business/abcbb1973199/1/web/1
- https://developers.google.com/search/docs/appearance/structured-data/organization
- https://developers.google.com/search/docs/appearance/google-images

## DNS verification correction needed

Public TXT lookup at `_vercel.strategicmarketingadvisors.com` returned the hostname itself as one value, and `c-domain-verify=www.strategicmarketingadvisors.com,531975bea818d65a394c` as the other. These do not match Vercel's challenges.

In the active HostGator VPS zone, keep the name `_vercel.strategicmarketingadvisors.com.` for both TXT records and replace their values with these exact strings:

1. `vc-domain-verify=strategicmarketingadvisors.com,3060f2f6526f0b30612a`
2. `vc-domain-verify=www.strategicmarketingadvisors.com,531975bea818d65a394c`

No DNS edits, domain cutover, Bing/Apple submission or provider-agent changes were made during this review. Do not replace the current website records until verification, application configuration and the legacy URL decisions are ready.
