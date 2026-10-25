# SMA dashboard — connected implementation

## Owner and entry point

- Website: https://strategic-marketing-advisors.vercel.app/
- Dashboard: https://strategic-marketing-advisors.vercel.app/dashboard/
- The initial owner email approved in the conversation is stored privately in `sma_members`.
- Use the first-visit action to create and confirm your own account, then sign in. Do not send passwords through chat. A confirmed existing account in this Supabase project can sign in directly.
- The shared Supabase project has email confirmation enabled. Its email delivery configuration and limits apply; they were not changed for the other application.

## What is connected

1. Optional, consent-gated page views, tab sessions and explicit booking/voice/resource/phone clicks.
2. The website Contact inquiry form saves to the private SMA lead queue. Lead stages and private notes are editable by owners/editors.
3. Thirty existing pages/articles are imported as private drafts. Save does not publish. Owners can publish a version; editors can save drafts; viewers can read reports.
4. The live HTML renderer reads only published snapshots. Changes update page headings, introductions, SEO/social metadata, article content, hero images and structured content sections. New articles appear in the blog and sitemap. The CDN can take up to 60 seconds to refresh.
5. Raster image uploads are limited to JPEG/PNG/WebP under 2 MB, checked on the server and stored in the separate public sma-media bucket. Private documents must not be uploaded there.
6. Owner-only access grants, revision checks, published snapshots and an activity audit are implemented.

## Deliberate boundaries

- Booking clicks do not equal confirmed appointments. Atlas/HighLevel appointment synchronization is not connected. That requires the correct SMA location and an authorized calendar/contacts integration.
- Kate’s hosted prompt, speech recognition, interruption timing and booking tools are not managed by the website widget. Access to the owning Thinkrr agent editor is required; the dashboard accurately shows this as pending.
- Website analytics excludes contact fields, query strings and call transcripts. Counts reflect consenting browser-tab sessions, not guaranteed unique individuals. Local development traffic is marked as test and excluded from reports.
- No automatic analytics-history purge is enabled. A proposed 90-day deletion was removed after automatic approval review rejected irreversible retention deletion without authorization. Rate-limit records are transient operational data and expire under the existing rate limiter.
- Authentication uses the shared project’s Supabase Auth. SMA tables, access membership and media bucket are namespaced. Existing application tables and its authentication configuration were not changed.
- Adding an owner in the app grants SMA dashboard access; it does not transfer the entire Supabase project. To hand over infrastructure later, migrate only SMA resources to a dedicated project or arrange separate project ownership. Do not transfer a shared project containing another application unintentionally.
- Legacy Sanity Studio remains available for compatibility, but its edits do not feed this publishing pipeline. This dashboard is the publishing source for connected changes.

## Hosting and code

- Vercel `api/render.js` serves public HTML from private runtime templates plus published content. The public `dist/` contains assets and dashboard files; drafts, SQL, source templates, server functions and documentation are not public assets.
- Supabase Edge Function `sma-api` uses the platform’s server-side service key. It verifies actual users and membership before private operations. JWT verification stays enabled at the gateway. No service-role key is in the repository or browser configuration.
- `backend-config.json` intentionally contains only public connection information and public API keys. Security depends on server verification, grants and row policies, not hiding that file.
- Supabase resources: project bqifzwpdgwkjfphkrjgl; tables `sma_*`; private helper schema `sma_private`; storage bucket `sma-media`. Migrations are in `supabase/migrations/`.
- SQL reporting aggregates in the database. Analytics and leads are paginated/bounded; lead pages contain 50 rows. Media lists show the latest 100 files. Published-content fetch is capped at 1,000 rows.
- Structured sections and plain text protect the layout and escape markup. Arbitrary HTML/script uploads are not supported.

## Validation

- Run `npm test` and `node --test tests/backend.test.mjs`.
- Backend tests cover unapproved origins, no-consent analytics, approved event fields, unconfirmed/nonmember accounts, viewer/editor restrictions, invalid uploads and server-rendered escaping/metadata.
- Live API checks verified valid synthetic intake, invalid-email/no-consent rejection, anonymous denial for leads/drafts/upload/publish and database grants.
- Row policy tests showed zero private drafts to an unrelated authenticated identity and all 30 drafts to the approved owner identity.
- The security advisor reports no remaining findings on the new SMA resources after private-helper hardening.
- A published snapshot of the existing free marketing guide was served through the renderer with content revision 1. Its approved copy was preserved.
- Real owner sign-in and owner-driven upload/publish still need the owner’s own confirmed login; no password was created by the agent.

## Kate access needed

Provide a signed-in Thinkrr/white-label workspace owning this widget, or an authorized provider connection. We need the agent identifier and permission to read/edit/publish the agent’s role, knowledge, voice/transcription/end-of-turn controls and tools. To book actual appointments through Kate, also connect the correct SMA HighLevel location and calendar with the required scoped permissions. Use provider sign-in or a secure integration; never paste a secret key or password into chat.

Prepared training: `docs/agents/kate-training.md`. Install it in the actual provider, test correction handling with synthetic emails/numbers, then verify the live widget uses the published agent version. Do not claim that a prompt alone fixes recognition quality.
