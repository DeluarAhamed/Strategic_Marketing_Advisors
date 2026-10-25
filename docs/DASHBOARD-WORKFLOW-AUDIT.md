# SMA dashboard audit and release — 25 October 2026

The starting dashboard had basic traffic totals, a paginated inquiry list and editable notes. It had no searchable pipeline, scheduled follow-ups, interaction history, period comparison or device filters. Website submissions were already connected to SMA's private Supabase tables. Content editing, public image uploads and owner-only publishing were already connected.

## Research and decisions

- [HubSpot's task model](https://knowledge.hubspot.com/tasks/create-tasks) associates follow-ups with CRM records and due dates. SMA now follows this useful pattern with lead-linked tasks, an overdue queue, upcoming work and a persistent activity timeline.
- [Google Analytics key-event definitions](https://support.google.com/analytics/answer/9267568?hl=en) distinguish event counts from session rates. SMA now reports unique measured sessions that opened the calendar divided by measured page-view sessions, with repeated opens counted once in this rate. These are SMA's measurements, not GA4 data; sessions remain browser-tab identifiers.
- [Google Search's measurement guidance](https://developers.google.com/search/docs/monitor-debug/google-analytics-search-console) distinguishes search performance from on-site behavior. Do not label the current dashboard SEO rankings, impressions, campaign attribution or Search Console analytics. Those require a separate connection.
- [Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security) informed policies, explicit grants and indexed private data. Existing approved owner/editor/viewer boundaries remain in force. No other application's tables are modified.

## Implemented

- Overview refreshes every minute while visible; manual refresh is available. Seven-, 30- and 90-day rolling reports compare against the immediately preceding period. Zero-filled daily UTC counts have an accessible table. Device filters affect events, while inquiry totals explicitly remain all-device.
- Page views, browser-tab sessions, booking opens, consented actions, page/referrer/device breakdowns and page CSV downloads. CSV data comes from the selected report, up to the top 50 pages.
- Search by name, business or email, stage and signature-service filters, accurate total/pagination, high priority first, table and pipeline views. Pipeline shows the current page, up to 50 leads; all-time stage totals are on Overview.
- Private lead summaries, priority, scheduled next actions, overdue/next-24-hour counts and indicators for open leads without tasks or without updates for seven days.
- Call, email, meeting and note outcomes, with server-authenticated actor and timestamp. Stage changes and task creation/completion create transactional history. Duplicate task completion is rejected. Latest 100 activities/tasks per lead are displayed; older records are retained.
- Follow-ups tab shows the earliest 100 open tasks, with overdue and next-24-hour filters. Task times use the user's device timezone, and UTC timestamps are stored in Postgres.
- Draft-email and telephone links plus a copyable follow-up starter. These open the user's own apps or copy text for review. Nothing is automatically sent. Dashboard reminders operate while viewing the workspace, not as background email/SMS notifications.
- Mobile navigation and layouts corrected to keep document width within a 390px viewport; tables and pipeline scroll within their own containers.

## Connected and pending

The live inquiry form, consented event intake, database-backed follow-ups and published content share the existing SMA backend. Historical website traffic cannot be reconstructed: reports start from consented events actually stored. Synthetic test data is excluded from production reports; transactional database test records are rolled back.

Atlas bookings and Thinkrr call outcomes remain separate. To synchronize appointments, supply the SMA HighLevel location connection with booking-read/webhook access. For Kate, provide the owning Thinkrr workspace and agent ID with permission to edit/publish knowledge, speech/transcription and booking tools. Never put provider secrets in a client-side dashboard. Search Console requires a verified property connection. Email/SMS automation needs an approved sending account and an explicitly approved recipient/consent workflow.

## Validation

- Backend/auth tests cover role restrictions, validated tasks, actor spoofing, interaction input, transactional updates, report filters, zero-baseline comparisons and CSV escaping.
- `tests/db-workflows.sql` verifies saved tasks, overdue queue, filtered leads, stage history, single completion history, session-based rate and unauthorized RLS access in the selected live database; all records roll back.
- Security advisors report no SMA findings after this migration.
- Browser QA uses an isolated localhost fixture with clearly labeled sample data. It exercises lead details, scheduling, logged interactions, pipeline and 390px responsive layouts. The fixture is ignored and never deployed. An owner sign-in is still required to inspect private production screens; no authentication bypass is added.

## Next useful integrations

Connect appointment outcomes first so the team can distinguish requests from confirmed calls. Next connect Kate's outcomes and the verified Search Console property. Only after those work should automated reminders or outbound follow-up be introduced, with explicit sending and consent rules. These are recommendations, not claims of completed integrations.
