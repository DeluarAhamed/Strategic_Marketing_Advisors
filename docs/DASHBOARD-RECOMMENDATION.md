# SMA dashboard recommendation

Research date: 25 October 2026. Recommendation and implementation specification; no analytics account, CRM connection or hosted voice configuration has been provisioned by this document.

## Recommendation

Start with the existing business systems: HighLevel/Atlas for leads and appointments, Sanity for website content, and the current voice provider for Kate. Use a private overview dashboard to bring their verified data together only where supported APIs permit it. Keep the approved public website layout intact.

HighLevel’s official External Tracking analytics supports external websites, including page views, traffic sources, device information and form metrics. Since the booking calendar is already on Atlas, confirm that SMA owns the corresponding HighLevel location before choosing it as the CRM source of truth. A separate HighLevel agency tab in a browser does not prove it is the correct SMA account.

For detailed CTA funnels, PostHog is a suitable optional addition: its web analytics and explicit events can distinguish page views, booking clicks and resource clicks. Do not add a second analytics product if HighLevel supplies the exact reports needed. Do not assume HighLevel external analytics has a supported aggregation API; verify before promising the same chart inside a custom portal.

## Dashboard sections

| Area | Useful information and actions | Source |
| --- | --- | --- |
| Overview | Visitors, views, top pages, CTA clicks, qualified leads, confirmed bookings, period comparison and connection status | Analytics + CRM |
| Pages & conversions | Page traffic, source/device filters, voice-demo interest, booking-open rate and resource destinations | Analytics |
| Leads | Name, confirmed contact details, stated business need, service interest, source, owner, stage and follow-up status | HighLevel |
| Appointments | Confirmed, canceled, rescheduled, attended and no-show appointments with time zone | HighLevel calendar |
| Content | Pages, services, blog, resource guides, photos, SEO title/description, drafts and preview | Sanity |
| Kate | Approved knowledge, prompt version, test results, available call summaries and booking outcomes | Voice provider + verified CRM events |
| Settings | Owner/editor access, integrations, retention, consent settings and audit trail | Private backend |

## Measurement definitions

- A page view is a loaded page; a visitor is not necessarily a lead. Cookie choices and blockers mean analytics does not count every person.
- A booking CTA click or opened popup is interest, not a confirmed appointment.
- Count a booking only from a verified calendar/CRM event. The external iframe’s load event does not prove a submission.
- Count a lead only after an actual successful contact creation or verified CRM event. A phone-link click is not a completed call.
- Use explicit events such as page_view, booking_opened, voice_panel_opened, resource_outbound_clicked. Add voice_call_started/completed only if the provider exposes reliable events. Never infer these from the microphone button’s appearance.
- Keep names, email addresses, phone numbers, form values and call transcripts out of general analytics events. Disable unnecessary autocapture and session recording. Strip query strings that may contain personal information.
- Add a separate analytics consent choice, default off; update the privacy notice when an analytics provider is actually installed. Existing choices for voice/calendar must not silently authorize analytics.

## Content editing must publish real changes

The repository contains Sanity Studio and schemas, but the public build currently reads local article JSON and static HTML. Editing Studio alone does not update the site. Connect published Sanity content to the build, use an authenticated rebuild webhook, and validate a draft → preview → publish → live-page workflow before labeling the editor production-ready.

Keep the restored components and constrain rich content to them. Provide structured headings, paragraphs, images and CTA fields instead of letting editors paste arbitrary layout HTML. Require alt text and SEO metadata, prevent duplicate slugs, and retain a way to recover earlier content. Avoid running two competing editors: the legacy /admin Decap entry should be retired after Sanity’s publishing flow is verified.

## Private backend if a single portal is required

Use a separate Next.js application on Vercel so the public static site can remain stable. Authenticate owners/editors, enforce authorization on every server endpoint, and keep provider credentials in server-side environment variables. A hidden URL or noindex tag is not access control.

Supabase Auth/Postgres is a reasonable managed option for users, roles, webhook receipts, audit entries and derived reports when needed. Enable row-level security, deny anonymous access, and test owner/editor isolation. Keep HighLevel authoritative for leads to avoid building a duplicate CRM. Access CMS content through Sanity’s own permissions.

Webhook handlers must verify signatures using the actual provider’s documented scheme, reject replays where supported, deduplicate by event ID, validate payloads and log failures without leaking contact data. Show unavailable/disconnected states when data is missing; never fill a production dashboard with invented numbers. Use read-only integrations first, then add explicitly scoped updates.

## Kate’s training and operation

Use the prepared [Kate training](agents/kate-training.md) in the actual voice-agent editor. This is knowledge and behavior configuration, not training a new speech model. A better prompt cannot by itself fix recognition quality, turn timing, noise or an unsupported booking tool.

First update the current provider’s role, service knowledge, interruption/end-of-turn settings and contact-confirmation workflow. Evaluate spelling, phone groups, corrections and fallback with synthetic data. Validate tool arguments in the backend: unconfirmed addresses must never reach booking/contact actions. Publish a version only after those tests pass, and retain a rollback.

The public widget key only loads Kate. Editing her instructions, speech settings, recordings or tools requires the correct authenticated provider account or a documented, authorized management API. Building a custom portal does not grant that access. A future custom voice stack should be considered only if the current provider cannot meet measured requirements, after checking integration, latency, retention and operating cost.

## Delivery order

1. Confirm the SMA HighLevel location, Sanity project ownership and Kate’s provider editor. Use sign-in or a secure integration flow; do not paste credentials into chat.
2. Connect one analytics source with an explicit consent choice. Verify page views and CTA events with test traffic, and confirm exclusions for owner/test activity.
3. Connect CRM bookings/leads using supported APIs/webhooks. Verify a test lead and booking in the actual system, including cancellation and deduplication.
4. Wire Sanity publishing into the current build and prove one draft/photo/article update reaches the live site without breaking layout.
5. Configure and evaluate Kate in the provider, then connect verified outcomes to reporting.
6. Add the unified private portal around these working integrations. Show source, timestamp and connection health beside each report.

## Official references

- [HighLevel external website analytics](https://help.gohighlevel.com/support/solutions/articles/155000007809-analytics-for-external-tracking)
- [HighLevel API: contacts, calendars and webhooks](https://marketplace.gohighlevel.com/docs/intro/index.html)
- [PostHog web analytics](https://posthog.com/docs/web-analytics)
- [PostHog privacy controls](https://posthog.com/docs/privacy)
- [Sanity publishing webhooks](https://www.sanity.io/docs/content-lake/webhooks)
- [Sanity visual editing architecture](https://www.sanity.io/docs/visual-editing/visual-editing-architecture)
- [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Thinkrr voice platform](https://thinkrr.ai/)
