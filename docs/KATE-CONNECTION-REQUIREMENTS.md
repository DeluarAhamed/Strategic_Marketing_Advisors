# Connect Kate to SMA

Status: provider authorization is pending. No hosted prompt, webhook, calendar or live call behavior was changed by preparing this document.

## Required access

1. **Thinkrr:** the signed-in SMA/white-label workspace that owns widget `a65d79bf-6874-4063-9498-931cddc5e158`. An editor must be able to inspect Kate, update and publish her role/knowledge, configure actions and call-completion events, and review synthetic test calls. Identify the exact agent from the widget mapping after access; do not assume its agent ID from the public widget key.
2. **Secure provider connection:** authorize Thinkrr in the owner's private Make space using the generated credential-request page. The connection is pending; no Thinkrr credential exists in the accessible Make teams. Enter a provider credential only in the secure authorization page, never in chat or source code. A direct authenticated provider integration can be used instead if supported and preferable after inspection.
3. **Atlas / HighLevel:** access to the SMA location owning David's `smaic-calendar`, including availability, contacts needed for booking, appointment creation and outcome reads/webhooks. Obtain the actual location/calendar IDs from the account. Use the existing booking integration where possible rather than creating a duplicate calendar.

The public widget and booking URLs display interfaces; they do not authorize editing the agent or reading/writing appointments. The SMA database and website access already work and need no replacement credentials.

## Implementation after authorization

- Install `docs/agents/kate-training.md` in the actual agent, remove conflicting old offers and verify the website widget uses the published version.
- Inspect an actual provider call-completion event and its authentication method. Confirm the immutable call/event IDs, confirmed-contact fields, consent, call outcome, service intent and booking result. Do not deploy an unsigned generic lead-ingestion endpoint based on assumed payload fields.
- Map the provider event to a restricted server endpoint. Validate authentication, replay protection, field sizes and the SMA agent. Keep service-role credentials on the server. Store only the call information needed for the business workflow; recording/transcript storage is a separate deliberate choice.
- Upsert a consented, confirmed-contact lead with source Kate, append a factual call summary, retain existing team notes/stage/value and add an appropriate internal follow-up. Create follow-ups once per actual call outcome, not once per webhook delivery.
- Tie Booked status to a verified appointment ID. Use the provider's existing GHL booking action if the current calendar is supported; otherwise configure a documented calendar tool or keep the on-site booking fallback. Never bypass slot validation or weekend rules.
- Add call outcomes, lead links, follow-up status and connection health to the dashboard. Separate anonymous conversations, captured leads, booking attempts and confirmed appointments.
- Test natural and spelled emails, corrections, international phone numbers, refusal to provide details, an FAQ-only call, a booking, a failed booking, duplicate delivery and an existing lead. Verify records in both the live dashboard and calendar before enabling production ingestion.

## Provider evidence checked

[Thinkrr actions documentation](https://docs.thinkrr.ai/guides/usage/inbound-calling/Abilities-and-Actions) describes native booking, extraction fields and GHL workflow actions. Its documented native booking currently requires GHL Round Robin calendars and a live phone/Web Agent test. The compatibility of SMA's actual calendar remains to be verified in its account.

Make's discovered Thinkrr modules include `inboundCallTrigger` and an authenticated API action. The inbound trigger is not auto-creatable through the available Make tools, so its provider webhook must be configured in the owning account. The exposed static trigger schema is not enough to infer reliable replay protection or a trustworthy confirmed booking.

[HighLevel appointment API](https://marketplace.gohighlevel.com/docs/ghl/calendars/create-appointment/) requires real calendar, location and contact identifiers. [HighLevel scopes](https://marketplace.gohighlevel.com/docs/Authorization/Scopes/) define the required calendar/contact permissions. Resolve the least necessary scopes against the selected integration rather than requesting agency-wide administrator access.
