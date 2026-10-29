# SMA domain launch — instructions for David

Prepared 29 October 2026. The updated site is live at https://strategic-marketing-advisors.vercel.app/ . The custom domain is attached to its Vercel project but ownership verification and DNS cutover are pending.

## Where to edit

The delegated nameservers are `ns1.smahosting.com` and `ns2.smahosting.com`. David has confirmed the active DNS zone is on his HostGator VPS; the zone editor identifies its own nameservers as `ns1.50-6-5-34.www.hostgator.com` and `ns2.50-6-5-34.www.hostgator.com`. Edit that HostGator zone, not the inactive IONOS DNS table. The domain registrar or a separate hosting account does not necessarily manage the active DNS zone.

Keep these nameservers. Preserve Google Workspace MX, SPF, DKIM, DMARC, and all other existing TXT records. Preserve the `atlas` subdomain and other unrelated subdomains. No registrar transfer or domain purchase is needed.

## Step 1 — prove ownership before changing website traffic

Add both records at the existing DNS host. If its editor requires full names, use `_vercel.strategicmarketingadvisors.com`; otherwise use `_vercel`. Keep them as separate TXT values at the same name.

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| TXT | `_vercel` | `vc-domain-verify=strategicmarketingadvisors.com,3060f2f6526f0b30612a` | 600 or provider default |
| TXT | `_vercel` | `vc-domain-verify=www.strategicmarketingadvisors.com,531975bea818d65a394c` | 600 or provider default |

Tell us when these are saved. We then verify both domains in Vercel and finish the application's custom-domain configuration before traffic moves. A subsequent check found the hostname entered as one TXT value and `c-domain-verify` (missing the initial `v`) as the other; replace those incorrect values with the exact strings above.

## Step 2 — website records, after application readiness is confirmed

Vercel's project-specific recommendations were retrieved after attaching the domains. Recheck them in Project Settings → Domains before cutover in case they change.

| Type | Name | Value | Action |
| --- | --- | --- | --- |
| A | `@` | `216.198.79.1` | Replace old website A record `50.6.5.34` |
| A | `@` | `64.29.17.1` | Add the second address from Vercel's preferred address group |
| CNAME | `www` | `c6a0e1f3e4bc976e.vercel-dns-017.com` | Replace current CNAME to `strategicmarketingadvisors.com` |

Use TTL 600 if supported. Remove conflicting website A/AAAA records only after checking the whole zone. Leave mail and other subdomains intact. The configured `www` address will redirect to `https://strategicmarketingadvisors.com` after verification and cutover.

## Application cutover checklist

Before Step 2: verify ownership; configure exact public-site API origins; add exact custom-domain authentication/recovery callbacks without changing the shared project's unrelated Auth site URL; update canonical URLs, sitemap, robots, llms.txt, organization metadata and public CMS site URL together; deploy and verify. Review `legacy-url-inventory.json`: 24 clear replacements now have explicit 301s, two URLs are retained and 87 need a migration/retirement decision, including old articles and account/checkout pages.

After Step 2: verify DNS, HTTPS certificate, apex/www redirect, public pages, contact form-to-dashboard, consent, Kate's widget allowed domains and David's booking popup on the actual custom domain. Preserve the existing Vercel URL while testing. DNS propagation and certificate issuance may take time. The existing apex record had a four-hour configured TTL when checked.

No DNS edits have been made by Codex. Do not describe the custom domain as launched until those checks pass.
