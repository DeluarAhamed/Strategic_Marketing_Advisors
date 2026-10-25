# Analytics, SEO and opportunity management

Release: 25 October 2026. Google and Semrush setup was explicitly deferred by the owner. The native analytics and live site audit work without those accounts.

## Workspaces

- **Overview:** demand, all-time opportunity totals and follow-up priorities.
- **Analytics:** dedicated website report with 7/30/90-day rolling periods, device filters, daily charts and accessible tables, top pages, referring websites, actions and CSV export. Acquisition reporting adds lead counts by source and service, new leads in the selected period and opportunity values. Refreshes every minute while this view is visible; provider syncs remain manual.
- **SEO & search:** stored on-page audit with an owner-run refresh. Checks up to 60 public SMA sitemap URLs for response status, title, description, canonical, H1 count, image alt attributes, structured-data presence and duplicate titles. The initial live run checked 30 URLs; none had findings in these checks. This is not a ranking, backlink, Core Web Vitals, full accessibility or comprehensive Semrush audit.
- **Pipeline & value:** USD value per lead, all-record stage totals, open pipeline, weighted forecast, won contract value and expected closing months. The board and table are searchable and paginated. Each board page shows up to 50 leads; the totals above it include all records.
- **Leads:** website inquiries plus manual phone, referral, event or other contacts. Manual entry requires a name, email or phone, service and the operator's contact-permission confirmation. These actions do not send communications.
- **Follow-ups, content, media, team activity and Kate integrations:** remain available under their existing role boundaries.

## Value definitions

Each lead is one opportunity. Use the same basis for every estimated amount, preferably total contract value. Blank means unknown; an explicit zero is a known zero. Values retain cents. USD is the single reporting currency; no implicit currency conversion or recurring-revenue normalization occurs.

Open value sums known values outside won/closed. Weighted forecast multiplies each open value by its manually entered likelihood (0–100%). Won value sums the contract values on team-marked won leads and is not money collected or accounting revenue. Win rate is won / (won + closed); it is unavailable with no closed outcomes. Existing historical close dates are not invented. From this release, moving into won/closed records a closing timestamp, and reopening clears it. A later close uses the new timestamp.

Stage, summary, priority, value, likelihood and expected date save in the same database transaction with activity history. Public inquiry submissions cannot set their own value, stage or likelihood. The original approved owner/editor/viewer boundaries remain: editors manage leads and drafts; viewers see aggregate reports, never private contacts or connection configuration.

## Google setup, when ready

The dashboard has tested server-side GA4 and Search Console reporting adapters. They are not connected to a real property yet. Mocked adapter tests verify the protocol; production authorization still needs to be completed and verified.

1. Create the relevant GA4 and Search Console properties. Verify the site and install a consent-aware GA4 tag. Saving a property ID in this dashboard does not install that tag or create historical data.
2. Enable Analytics Data and Search Console APIs in Google Cloud. Create a service account and grant it Viewer access to the GA4 property and read access to Search Console.
3. Store its JSON key only in Supabase Edge Function secrets as `SMA_GOOGLE_SERVICE_ACCOUNT_JSON`. Never commit it or put it in browser storage, public configuration or chat.
4. Open **Reporting connections** as an owner. Save the numeric GA4 property ID and exact verified Search Console property, such as `sc-domain:example.com` or `https://example.com/`.
5. Sync the desired 7/30/90-day report. Successful snapshots include a timestamp and property identity. Changing the selected property hides mismatched snapshots without deleting them. A failed sync preserves the previous snapshot and reports an error.

GA4 uses completed days through yesterday, its property timezone and its own session/user/key-event definitions. Reports cover users, sessions, page views, engagement, pages and acquisition channels. Search Console uses finalized web-search data ending three days before sync, with Google Pacific-date semantics; it reports clicks, impressions, CTR, position, queries and landing pages. Search Console may omit low-volume queries and returns only top rows. Do not add GA4 users to native sessions or treat their metrics as identical.

Sources: [GA4 Data API quickstart](https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart), [Search Console query reference](https://developers.google.com/webmaster-tools/v1/searchanalytics/query), [Google measurement guidance](https://developers.google.com/search/docs/monitor-debug/google-analytics-search-console).

## Semrush, optional later

No subscription was purchased, no key was configured and no paid requests were made. An optional server adapter is available for the top 20 US organic keyword rows. If enabled later, store `SMA_SEMRUSH_API_KEY` in Edge secrets and save the domain in Reporting connections. Only an owner can sync; the form requires approval for up to 200 API units per request. The server also enforces that approval and a rate limit. These are Semrush estimates, separate from actual site visits. [Semrush API access](https://developer.semrush.com/api/v3/get-started/api-access/), [keyword report and unit pricing](https://developer.semrush.com/api/v3/seo/domain-reports/).

## Backend and verification

SMA-only migration `20261025082902_sma_revenue_and_reporting.sql` adds opportunity fields, aggregate reporting and two RLS-protected reporting tables. No other application's tables, authentication settings or historical analytics are changed. Report snapshots are readable by approved report members; mutations and configuration pass through the authenticated Edge API. External requests use fixed Google/Semrush API hosts; site auditing is restricted to the SMA origin. Credentials never reach the browser.

The Edge Function includes `index.ts`, `reporting.ts` and `deno.json`, with Cheerio pinned to 1.1.0. Pass `deno.json` as its import map when deploying. Automated tests exercise role boundaries, input validation, monetary precision, atomic writes, audit parsing, origin restrictions and mocked Google/Semrush protocols. Transactional database tests in `tests/db-revenue.sql` verify totals, forecasts, close dates, history, search fields and viewer isolation, then roll back all synthetic data. Browser QA uses a clearly labeled local fixture rather than fabricating production results.

Atlas appointment outcomes and Kate call/lead sync still need their provider accounts. The dashboard does not infer bookings from calendar opens or attribute conversations it has not received.
